/* global App */
'use strict';

window.addEventListener('load', function onLoad() {
  window.removeEventListener('load', onLoad);
  var app = new App();
  app.start();
});
