var inputContext = null;
var keyboardElement;

function init_old() {
  keyboardElement = document.getElementById('keyboard');

  window.navigator.mozInputMethod.oninputcontextchange = function() {
    inputContext = navigator.mozInputMethod.inputcontext;
    resizeWindow();
  };

  window.addEventListener('resize', resizeWindow);

  keyboardElement.addEventListener('mousedown', function onMouseDown(evt) {
  // Prevent loosing focus to the currently focused app
  // Otherwise, right after mousedown event, the app will receive a focus event.
    evt.preventDefault();
  });

  var sendKeyElement = document.getElementById('sendKey');
  sendKeyElement.addEventListener('click', function sendKeyHandler() {
    var testString = '\\o/';
    for (var i = 0; i < testString.length; i++) {
      sendKey(testString.charCodeAt(i));
    }
  });

  var switchElement = document.getElementById('switchLayout');
  switchElement.addEventListener('click', function switchHandler() {
    var mgmt = navigator.mozInputMethod.mgmt;
    mgmt.next();
  });

  // long press to trigger IME menu
  var menuTimeout = 0;
  switchElement.addEventListener('touchstart', function longHandler() {
    menuTimeout = window.setTimeout(function menuTimeout() {
      var mgmt = navigator.mozInputMethod.mgmt;
      mgmt.showAll();
    }, 700);
  });

  switchElement.addEventListener('touchend', function longHandler() {
    clearTimeout(menuTimeout);
  });
}

function resizeWindow() {
  window.resizeTo(window.innerWidth, keyboardElement.clientHeight);
}

function sendKey(keyCode) {
  switch (keyCode) {
  case KeyEvent.DOM_VK_BACK_SPACE:
  case KeyEvent.DOM_VK_RETURN:
    if (inputContext) {
      inputContext.sendKey(keyCode, 0, 0);
    }
    break;

  default:
    if (inputContext) {
      inputContext.sendKey(0, keyCode, 0);
    }
    break;
  }
}
///////////////////////////////////

var Keyboard = function keyboard_constructor(element) {
  this._keyboard = element;
  this._keyboard.addEventListener('mousemove', this);
}

Keyboard.prototype = {
  handleEvent: function keyboard_handleEvent(evt) {
    var self = this;

    function getMousePos(evt) {
      var rect = self._keyboard.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
      };
    }

    switch(evt.type) {
      case 'mousemove':
        var pos = getMousePos(evt);
        console.log(JSON.stringify(pos));
        break;
    }
  }
};

window.addEventListener('load', function init() {
  var keyboard = new Keyboard(document.getElementById('keyboard'));
});
