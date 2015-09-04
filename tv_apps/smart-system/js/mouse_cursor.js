'use strict';

window.addEventListener('load', function() {
  var cursor = document.getElementById('mouse-cursor');
  cursor.style.display = 'block';

  window.addEventListener('remote-control-event', function(evt) {
    var detail = evt.detail;
    cursor.style.MozTransform =
      'translateX(' + detail.x + 'px) translateY(' + detail.y + 'px)';
  });
});
