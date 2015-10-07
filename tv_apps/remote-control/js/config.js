/* global SettingsListener */
'use strict';

(function(exports) {
  var SETTINGS = {
    'enabled': false,
    'pairing-required': false,
    'authorized-devices': null
  };

  function Config() {
  }

  Config.prototype = {
    prepareOptions: function(callback) {
      this._options = [];

      var promises = [];
      for(var key in SETTINGS) {
        promises.push(this._getSetting(key, SETTINGS[key]));
      }
      Promise.all(promises).then((values) => {
        var options = {};
        Object.keys(SETTINGS).forEach((name, index) => {
          options[name] = values[index];
        });

        var checked;
        if (options['enabled']) {
          if (options['pairing-required']) {
            checked = 'option-pair-on';
          } else {
            checked = 'option-pair-off';
          }
        } else {
          checked = 'option-disabled';
        }

        this.check(checked);

        var authorizedDevices = [];
        if (options['authorized-devices']) {
          authorizedDevices = JSON.parse(options['authorized-devices']);
        }
        var length = authorizedDevices.length;
        var button = document.getElementById('clear-paired-devices');
        button.disabled = !length;
        button.classList[length ? 'remove' : 'add']('skip-spatial-navigation');

        callback(checked);
      });
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

    save: function() {
      var settings = {};
      var checked = document.querySelector('.option-radio.checked').id;
      switch(checked) {
        case 'option-pair-on':
          settings['enabled'] = true;
          settings['pairing-required'] = true;
          break;
        case 'option-pair-off':
          settings['enabled'] = true;
          settings['pairing-required'] = false;
          break;
        case 'option-disabled':
          settings['enabled'] = false;
          break;
      }
      SettingsListener.getSettingsLock().set(settings);
    },

    clearAuthorizedDevices: function() {
      var req = SettingsListener.getSettingsLock().set({
        'authorized-devices': null
      });
      req.onsuccess = function() {
        var button = document.getElementById('clear-paired-devices');
        document.getElementById('clear-paired-devices').disabled = true;
        button.classList[length ? 'remove' : 'add']('skip-spatial-navigation');
      };
    },

    _getSetting: function(name, defaultValue) {
      return new Promise((resolve, reject) => {
        var req = SettingsListener.getSettingsLock().get(name);
        req.onsuccess = () => {
          var value = (req.result[name] === undefined) ?
            defaultValue : req.result[name];
          resolve(value);
        };
        req.onerror = () => {
          reject();
        };
      });
    }
  };

  exports.Config = Config;
}(window));
