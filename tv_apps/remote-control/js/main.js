'use strict';

window.onload = function() {
  var log = document.getElementById('log');

  document.body.addEventListener('mousemove', function(evt) {
    var obj = {
      screenX: evt.screenX,
      screenY: evt.screenY,
      clientX: evt.clientX,
      clientY: evt.clientY
    };
    log.textContent = JSON.stringify(obj);
  });
};
