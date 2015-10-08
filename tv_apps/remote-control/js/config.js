/* global SettingsListener, evt */
'use strict';

(function(exports) {
  var PREFIX = 'remote-control.';
  var SETTINGS = {
    'enabled': false,
    'pairing-required': false,
    'authorized-devices': null,
    'server-ip': ''
  };

  var DEBUG = false;

  function Config() {
    this._ready = false;
    this._observer = [];
    this.settings = [];
  }

  Config.prototype = evt({
    start: function() {
      for(var name in SETTINGS) {
        this._observer[name] = this._settingHandler.bind(this, name);
        SettingsListener.observe(PREFIX + name, SETTINGS[name],
          this._observer[name]);
      }
    },

    stop: function() {
      for(var name in SETTINGS) {
        SettingsListener.unobserve(PREFIX + name, this._observer[name]);
      }
      this.settings = [];
      this._observer = [];
      this._ready = false;
    },

    prepareOptions: function(callback) {
      var checked;
      if (this.settings.enabled) {
        if (this.settings['pairing-required']) {
          checked = 'option-pair-on';
        } else {
          checked = 'option-pair-off';
        }
      } else {
        checked = 'option-disabled';
      }

      this.check(checked);

      var authorizedDevices = [];
      if (this.settings['authorized-devices']) {
        authorizedDevices = JSON.parse(this.settings['authorized-devices']);
      }
      var canClear = authorizedDevices.length;
      var button = document.getElementById('clear-paired-devices');
      button.disabled = !canClear;
      if (canClear) {
        button.removeAttribute('aria-hidden');
      } else {
        button.setAttribute('aria-hidden', true);
      }

      callback(checked);
    },

    check: function(id) {
      var radios = document.querySelectorAll('.option-radio');
      Array.from(radios).forEach(function(radio) {
        if (radio.id == id) {
          radio.classList.add('checked');
        } else {
          radio.classList.remove('checked');
        }
      });
    },

    save: function(callback) {
      var settings = {};
      var checked = document.querySelector('.option-radio.checked').id;
      switch(checked) {
        case 'option-pair-on':
          settings[PREFIX + 'enabled'] = true;
          settings[PREFIX + 'pairing-required'] = true;
          break;
        case 'option-pair-off':
          settings[PREFIX + 'enabled'] = true;
          settings[PREFIX + 'pairing-required'] = false;
          break;
        case 'option-disabled':
          settings[PREFIX + 'enabled'] = false;
          break;
      }
      SettingsListener.getSettingsLock().set(settings);
    },

    clearAuthorizedDevices: function() {
      var settings = {};
      settings[PREFIX + 'authorized-devices'] = null;
      var req = SettingsListener.getSettingsLock().set(settings);
      req.onsuccess = function() {
        var button = document.getElementById('clear-paired-devices');
        button.disabled = true;
        button.setAttribute('aria-hidden', true);
      };
    },

    _settingHandler: function(name, value) {
      if (DEBUG) {
        console.log('[Config] settings changed: ' + name + '=' + value);
      }

      this.settings[name] = value;
      this.fire('changed', name, value);

      if (!this._ready) {
        var ready = true;
        for(var key in SETTINGS) {
          if (this.settings[key] === undefined) {
            ready = false;
            break;
          }
        }
        if (ready) {
          if (DEBUG) {
            console.log('[Config] ready');
          }

          this.fire('ready');
          this._ready = true;
        }
      }
    }
  });

  exports.Config = Config;
}(window));
