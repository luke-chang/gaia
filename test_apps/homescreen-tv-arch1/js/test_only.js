'use strict';

function initFakeAppEvent() {
  Applications.ready(function() {
    const TEST_ORIGIN = "http://2048widget.gaiamobile.org:8080";

    var testApp = Applications.installedApps[TEST_ORIGIN];

    document.addEventListener('keydown', function keyDownHandler(evt) {
      switch(evt.key) {
        case 'F1':
          if (!Applications.installedApps[TEST_ORIGIN]) {
            Applications.installedApps[TEST_ORIGIN] = testApp;
            Applications.fire('install',
              Applications.getAppEntries(TEST_ORIGIN));
          }
          break;
        case 'F2':
          if (Applications.installedApps[TEST_ORIGIN]) {
            Applications.fire('update', [{
              origin:
                Applications.installedApps[TEST_ORIGIN].origin,
              entry_point:
                Applications.installedApps[TEST_ORIGIN].entry_point || '',
              name:
                new Date().getTime()
            }]);
          }
          break;
        case 'F3':
          if (Applications.installedApps[TEST_ORIGIN]) {
            var entries = Applications.getAppEntries(TEST_ORIGIN);
            delete Applications.installedApps[TEST_ORIGIN];
            Applications.fire('uninstall', entries);
          }
          break;
        default:
          return;
      }
      console.log(evt.key);
      evt.preventDefault();
    });
  });
}

function initGesture() {
  function fireKeyEvent(keyCode, key) {
    var eventObj = document.createEvent('Events');
    eventObj.initEvent('keydown', true, true);
    eventObj.key = key;
    eventObj.keyCode = keyCode;
    eventObj.which = keyCode;
    window.dispatchEvent(eventObj);
  }

  new GestureDetector(document.body).startDetecting();

  document.addEventListener('swipe', function(evt) {
    var direction = evt.detail.direction;
    var keyDefine = {
      'up': [KeyEvent.DOM_VK_UP, 'Up'],
      'right': [KeyEvent.DOM_VK_RIGHT, 'Right'],
      'down': [KeyEvent.DOM_VK_DOWN, 'Down'],
      'left': [KeyEvent.DOM_VK_LEFT, 'Left']
    };
    fireKeyEvent(keyDefine[direction][0], keyDefine[direction][1]);
  });

  document.addEventListener('dbltap', function(evt) {
    fireKeyEvent(KeyEvent.DOM_VK_RETURN, 'Enter');
  });

  document.addEventListener('transform', function(evt) {
    fireKeyEvent(KeyEvent.DOM_VK_ESCAPE, 'Esc');
  });
}
