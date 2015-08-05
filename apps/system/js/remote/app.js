/* global BaseModule */
'use strict';

(function(exports) {
  var App = function() {
  };

  App.SUB_MODULES = [
    'SettingsCore',
    'WallpaperManager',
    'remote/RemoteAppWindowManager',
    'remote/MessageController',
    'remote/RemoteCursor'
  ];

  App.SETTINGS = [
    'multiscreen.debugging.enabled'
  ];

  App.STATES = [
    'displayId'
  ];

  BaseModule.create(App, {
    DEBUG: true,
    name: 'App',

    displayId: function() {
      return this._displayId;
    },

    _start: function() {
      // The displayId is assigned by shell_remote.js. It should be unique and
      // indicates the display which the current instance is associated with in
      // Gecko.
      this._displayId = window.location.hash ?
        parseInt(window.location.hash.substring(1), 10) :
        -1;
      this.debug('displayId: ' + this._displayId);

      (function() {
        var container = document.getElementById('testonly');
        var interval = 15;
        var elem;

        for(var i = 0; i < 40; i++) {
          elem = document.createElement('div');
          elem.style.left = i + 'px';
          elem.style.top = (i * interval) + 'px';
          elem.innerHTML = i;
          container.appendChild(elem);

          elem = document.createElement('div');
          elem.style.right = i + 'px';
          elem.style.top = (i * interval) + 'px';
          elem.innerHTML = i;
          container.appendChild(elem);

          elem = document.createElement('div');
          elem.style.left = (i * interval) + 'px';
          elem.style.top = i + 'px';
          elem.innerHTML = i;
          container.appendChild(elem);

          elem = document.createElement('div');
          elem.style.left = (i * interval) + 'px';
          elem.style.bottom = i + 'px';
          elem.innerHTML = i;
          container.appendChild(elem);
        }
      })();
    },

    '_observe_multiscreen.debugging.enabled': function(value) {
      var logDiv = document.getElementById('multiscreen-log');
      logDiv.hidden = !value;
    }
  });
}(window));
