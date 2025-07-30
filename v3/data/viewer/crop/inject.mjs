const post = e => {
  post.listener = e;
};

const capture = (function() {
  let box;
  let _left;
  let _top;
  let left;
  let top;
  let width;
  let height;

  function update(e) {
    left = (e.clientX > _left ? _left : e.clientX - 1);

    top = (e.clientY > _top ? _top : e.clientY - 1);
    width = Math.abs(e.clientX - _left);
    height = Math.abs(e.clientY - _top);
    box.style.left = left + 'px';
    box.style.top = top + 'px';
    box.style.width = width + 'px';
    box.style.height = height + 'px';
  }
  function remove(e) {
    post.listener(left || width ? {
      left: left + 1,
      top: top + 1,
      width: width - 2,
      height: height - 2
    } : null);

    guide.remove();
    capture.remove();
    monitor.remove();
  }
  function mousedown(e) {
    // prevent content selection on Firefox
    e.stopPropagation();
    e.preventDefault();
    box = document.createElement('div');
    box.setAttribute('class', 'itrisearch-box');

    _left = e.clientX;
    _top = e.clientY;

    document.addEventListener('mousemove', update, false);
    document.addEventListener('mouseup', remove, false);
    document.documentElement.appendChild(box);
  }

  return {
    install: function() {
      document.addEventListener('mousedown', mousedown, false);
    },
    remove: function() {
      document.removeEventListener('mousedown', mousedown, false);
      document.removeEventListener('mousemove', update, false);
      document.removeEventListener('mouseup', remove, false);

      for (const e of document.querySelectorAll('.itrisearch-box')) {
        e.remove();
      }
    }
  };
})();

const guide = (function() {
  let guide1;
  let guide2;
  let guide3;
  function position(left, top) {
    guide1.style.width = left + 'px';
    guide2.style.height = top + 'px';
  }
  function update(e) {
    position(e.clientX, e.clientY);
  }
  return {
    install: function() {
      guide1 = document.createElement('div');
      guide2 = document.createElement('div');
      guide3 = document.createElement('div');

      guide1.setAttribute('class', 'itrisearch-guide-1');
      guide2.setAttribute('class', 'itrisearch-guide-2');
      guide3.setAttribute('class', 'itrisearch-guide-3');
      document.documentElement.append(guide3, guide2, guide1);
      document.addEventListener('mousemove', update, false);
    },
    remove: function() {
      document.removeEventListener('mousemove', update, false);
      for (const e of document.querySelectorAll('.itrisearch-guide-1, .itrisearch-guide-2, .itrisearch-guide-3')) {
        e.remove();
      }

      capture.remove();
    }
  };
})();

const monitor = (function() {
  function keydown(e) {
    if (e.keyCode === 27) {
      guide.remove();
      capture.remove();
      monitor.remove();
    }
  }
  function contextmenu() {
    guide.remove();
    capture.remove();
    monitor.remove();
  }
  return {
    install: function() {
      window.addEventListener('keydown', keydown, false);
      window.addEventListener('contextmenu', contextmenu, false);
    },
    remove: function() {
      window.removeEventListener('keydown', keydown, false);
      window.removeEventListener('contextmenu', contextmenu, false);
    }
  };
})();

export {
  post,
  guide,
  capture,
  monitor
};
