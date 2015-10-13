'use strict';

window.addEventListener('load', function() {
  var cursor = document.getElementById('mouse-cursor');
  var timer;

  window.addEventListener('mozChromeRemoteControlEvent', function(evt) {
    var detail = evt.detail;
    if (detail.action != 'move-cursor') {
      return;
    }

    cursor.style.display = 'block';
    cursor.style.MozTransform =
      'translateX(' + detail.x + 'px) translateY(' + detail.y + 'px)';

    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }

    if (detail.state == 'end') {
      timer = setTimeout(function() {
        cursor.style.display = 'none';
      }, 30000);
    }
  });

  window.addEventListener('mozbrowserbeforekeydown', function(evt) {
    var keyCode = evt.keyCode;
    if (keyCode >= 37 && keyCode <= 40) {
      if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }
      cursor.style.display = 'none';
    }
  });
});
