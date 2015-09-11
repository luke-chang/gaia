'use strict';

window.addEventListener('load', function() {
  var cursor = document.getElementById('mouse-cursor');
  var timer;

  window.addEventListener('remote-control-event', function(evt) {
    var detail = evt.detail;
    cursor.style.display = 'block';
    cursor.style.MozTransform =
      'translateX(' + detail.x + 'px) translateY(' + detail.y + 'px)';

    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(function() {
      cursor.style.display = 'none';
    }, 30000);
  });

  window.addEventListener('mozbrowserbeforekeydown', function(evt) {
    if (evt.keyCode >= 37 && evt.keyCode <= 40) {
      if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }
      cursor.style.display = 'none';
    }
  });
});
