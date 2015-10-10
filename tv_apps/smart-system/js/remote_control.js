/* global SettingsListener, AppWindowManager */
'use strict';

(function(exports) {
  var SETTINGS = 'remote-control.enabled';

  var WATCHED_EVENTS = [
    'mozChromeRemoteControlEvent',
    'focuschanged'
  ];

  var CURSOR_MODE_LIST = [
    'app://browser.gaiamobile.org/manifest.webapp'
  ];

  function RemoteControl() {
    this._enabled = false;
    this._isCursorMode = null;
    this._settingsObserver = null;
  }

  RemoteControl.prototype = {
    start: function() {
      this._settingsObserver = this._setEnable.bind(this);
      SettingsListener.observe(SETTINGS, false, this._settingsObserver);

      WATCHED_EVENTS.forEach((event) => {
        window.addEventListener(event, this);
      });
    },

    stop: function() {
      WATCHED_EVENTS.forEach((event) => {
        window.removeEventListener(event, this);
      });

      SettingsListener.unobserve(SETTINGS, this._settingsObserver);
      this._settingsObserver = null;

      this._setEnable(false);
    },

    handleEvent: function(evt) {
      switch(evt.type) {
        case 'focuschanged':
          var activeApp = AppWindowManager.getActiveApp();
          var isCursorMode;
          if (evt.detail.target == 'AppWindow' && activeApp) {
            isCursorMode = CURSOR_MODE_LIST.includes(activeApp.manifestURL);
          } else {
            isCursorMode = false;
          }
          this._fireControlModeChanged(isCursorMode);
          break;
        case 'mozChromeRemoteControlEvent':
          this._handleRemoteControlEvent(evt.detail);
      }
    },

    _handleRemoteControlEvent: function(evt) {
      switch(evt.type) {
        case 'request-control-mode':
          this._fireControlModeChanged(this._isCursorMode, true);
          break;
      }
    },

    _setEnable: function(enabled) {
      this._enabled = enabled;
    },

    _fireControlModeChanged: function(isCursorMode, fireAnyway) {
      if (!fireAnyway && isCursorMode === this._isCursorMode) {
        return;
      }
      console.log('control-mode-changed: ' + isCursorMode);
      this._isCursorMode = isCursorMode;
      var customEvent = new CustomEvent('mozContentEvent', {
        detail: {
          type: 'control-mode-changed',
          detail: {
            cursor: isCursorMode
          }
        }
      });
      window.dispatchEvent(customEvent);
    }
  };

  exports.RemoteControl = RemoteControl;
}(window));
