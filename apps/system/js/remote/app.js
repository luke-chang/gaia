/* global BaseModule */
'use strict';

(function(exports) {
  var App = function() {
  };

  App.SUB_MODULES = [
    'SettingsCore',
    'WallpaperManager',
    'remote/RemoteAppWindowManager',
    'remote/MessageController'
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
    },

    '_observe_multiscreen.debugging.enabled': function(value) {
      var logDiv = document.getElementById('multiscreen-log');
      logDiv.hidden = !value;
    }
  });
}(window));
