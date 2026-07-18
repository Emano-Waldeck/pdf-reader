
import Color from "./color.js";

const DOQ = {
  colorSchemes: [],
  flags: {
    engineOn: false, isPrinting: false,
    shapesOn: true, imagesOn: true
  }
}
let activeTone = {};
let styleCache = new Map();
let canvasCache = new Map();

function setCanvasTheme(scheme, tone) {
  const newTone = DOQ.colorSchemes[scheme].tones[tone];
  if (newTone !== activeTone) {
    styleCache.clear();
    canvasCache.clear();
    activeTone = newTone;
  }
  return activeTone;
}

function addColorScheme(scheme) {
  const newColor = arg => new Color(arg);
  scheme.colors = (scheme.accents || []).map(newColor);

  scheme.tones.forEach(tone => {
    const [b, f] = [tone.background, tone.foreground].map(newColor);
    tone.colors = {
      bg: b, fg: f, grad: b.range(f),
      acc: (tone.accents || []).map(newColor).concat(scheme.colors)
    };
    tone.scheme = scheme;
  });
  DOQ.colorSchemes.push(scheme);
}

/* Wrap canvas drawing */
function wrapCanvas() {
  const ctxp = CanvasRenderingContext2D.prototype;
  ctxp.origFillRect = ctxp.fillRect;
  ctxp.origDrawImage = ctxp.drawImage;
  const checks = style => checkFlags() && checkStyle(style);

  ["fill", "stroke"].forEach(f => {
    ["", "Rect", "Text"].forEach(e => {
      const handler = (e === "Text") ? updateTextStyle : resetShapeStyle;
      ctxp[f + e] = wrapAPI(ctxp[f + e], handler, checks, f + "Style");
    });
    wrapSet(ctxp, f + "Style", getCanvasStyle, checks);
  });
  ctxp.drawImage = wrapAPI(ctxp.drawImage, setCanvasCompOp, checkFlags);
}

/* Method and setter wrapper closures */
function wrapAPI(method, callHandler, test, prop) {
  return function() {
    if (!test?.(this[prop])) {
      return method.apply(this, arguments);
    }
    this.save();
    callHandler(this, method, arguments, prop);
    const retVal = method.apply(this, arguments);
    this.restore();
    return retVal;
  }
}

function wrapSet(obj, prop, getNewVal, test) {
  const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
  const { set: ownSet, get: ownGet } = descriptor;

  Object.defineProperty(obj, prop, {
    get() {
      return ownGet.call(this);
    },
    set(arg) {
      ownSet.call(this, arg);
      if (!test?.(arg)) {
        return;
      }
      const value = ownGet.call(this);
      ownSet.call(this, getNewVal(value));
      obj["orig" + prop] = value;
    }
  });
  obj["set" + prop] = ownSet;
}

function checkFlags() {
  const { flags } = DOQ;
  return flags.engineOn && !flags.isPrinting;
}

function checkStyle(style) {
  return typeof(style) === "string";        /* is not gradient/pattern */
}

/* Get style from cache, calculate if not present */
function getCanvasStyle(style, bg) {
  style = new Color(style);
  const key = style.hex + (bg?.hex || "");
  let newStyle = styleCache.get(key);

  if (!newStyle) {
    newStyle = bg ? getTextStyle(style, bg) : calcStyle(style);
    styleCache.set(key, newStyle);
  }
  return newStyle.toHex(style.alpha);
}

/* Calculate a new style for given colorscheme and tone */
function calcStyle(color) {
  const { grad, acc } = activeTone.colors;
  let style;

  if (color.chroma > 10 && acc.length) {
    style = findMatch(acc, e => e.deltaE(color), Math.min);
  } else {
    const whiteL = Color.white.lightness;
    style = grad(1 - color.lightness / whiteL);
  }
  return style;
}

function getTextStyle(color, textBg, minContrast = 30) {
  const { bg, fg } = activeTone.colors;
  const diffL = clr => Math.abs(clr.lightness - textBg.lightness);

  if (bg.deltaE(textBg) > 2.3 && diffL(color) < minContrast) {
    return findMatch([color, bg, fg], diffL, Math.max);
  }
  return color;
}

function findMatch(array, mapFun, condFun) {
  const newArr = array.map(mapFun);
  return array[newArr.indexOf(condFun(...newArr))];
}

/* Alter fill and stroke styles */
function resetShapeStyle(ctx, method, args, prop) {
  if (isAccent(ctx[prop])) {
    markContext(ctx);
  }
  if (DOQ.flags.shapesOn) {
    return;
  }
  const { width, height } = ctx.canvas;

  if (method.name === "fillRect" && args[2] == width && args[3] == height) {
    return;
  }
  const setStyle = ctx["set" + prop];
  setStyle.call(ctx, ctx["orig" + prop]);
  markContext(ctx)
}

function updateTextStyle(ctx, method, args, prop) {
  const style = ctx[prop];

  if (!ctx._hasBackgrounds && !isAccent(style)) {
    return;
  }
  const bg = getCanvasColor(ctx, args);
  const newStyle = getCanvasStyle(style, bg);

  if (newStyle !== style) {
    const setStyle = ctx["set" + prop];
    setStyle.call(ctx, newStyle);
  }
}

/* Get canvas color from cache, read form canvas if not present.
 * Also use a singleton WeakMap to cache the current canvas data. */
function getCanvasColor(ctx, args) {
  const cvs = ctx.canvas;
  const cacheId = cvs.dataset.cacheId;
  let colorMap = canvasCache.get(cacheId);

  if (cacheId && !colorMap) {
    colorMap = [];
    canvasCache.set(cacheId, colorMap);
  }
  ctx._currentTextId ??= 0;
  const textId = ctx._currentTextId++;
  if (textId < colorMap?.length) {
    return colorMap[textId];
  }

  let canvasData = canvasCache.get("dataMap")?.get(ctx);
  if (!canvasData) {
    canvasData = ctx.getImageData(0, 0, cvs.width, cvs.height);
    canvasCache.set("dataMap", new WeakMap([[ctx, canvasData]]));
  }
  const color = readCanvasColor(ctx, ...args, canvasData);
  colorMap?.push(color);
  return color;
}

/* Read canvas color at text position from canvas data */
function readCanvasColor(ctx, text, tx, ty, canvasData) {
  const mtr = ctx.measureText(text);
  const dx = mtr.width / 2;
  const dy = (mtr.actualBoundingBoxAscent - mtr.actualBoundingBoxDescent) / 2;

  const tfm = ctx.getTransform();
  let {x, y} = tfm.transformPoint({ x: tx + dx, y: ty - dy });
  [x, y] = [x, y].map(Math.round);

  const i = (y * canvasData.width + x) * 4;
  const rgb = Array.from(canvasData.data.slice(i, i + 3));
  return new Color(rgb.map(e => e / 255));
}

function isAccent(style) {
  const { accents, scheme } = activeTone;
  const isStyle = s => s.toLowerCase() === style;
  style = style.toLowerCase();
  return accents?.some(isStyle) || scheme.accents?.some(isStyle);
}

function markContext(ctx) {
  ctx._hasBackgrounds = true;
  canvasCache.set("dataMap", null);
}

/* Set the image composite operation, drawing the mask to blend with */
function setCanvasCompOp(ctx, drawImage, args) {
  markContext(ctx);
  const image = args[0];

  if (!DOQ.flags.imagesOn || image instanceof HTMLCanvasElement) {
    return;
  }
  args = [...args];
  if (args.length < 5) {
    args.push(image.width, image.height);
  }

  const { colors, foreground, background } = activeTone;
  const maskColor = colors.bg.lightness < 50 ? foreground : background;
  const mask = createMask(maskColor, args.slice(0, 5));
  args.splice(0, 1, mask);
  drawImage.apply(ctx, args);

  ctx.globalCompositeOperation = "multiply";
}

function createMask(color, args) {
  const cvs = document.createElement("canvas");
  const dim = [cvs.width, cvs.height] = args.slice(3);
  const ctx = cvs.getContext("2d");

  ctx.setfillStyle(color);
  ctx.origFillRect(0, 0, ...dim);
  ctx.globalCompositeOperation = "destination-in";
  ctx.origDrawImage(...args, 0, 0, ...dim);
  return cvs;
}

export {
  DOQ, setCanvasTheme, addColorScheme, wrapCanvas, getCanvasStyle, checkFlags
};
