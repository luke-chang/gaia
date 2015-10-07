/* global QRCode, KeyNavigationAdapter, SettingsListener, Section, Config */
'use strict';

(function(exports) {
  var MAIN_SECTION = 'main-section';
  var DEFAULT_ELEMENT = 'qrcode';
  var SETTINGS_SERVER_IP = 'remote-control.server-ip';

  var _ = navigator.mozL10n.get;

  function App() {
    this.config = null;
    this.sections = [];
    this.keyNav = null;
    this.ip = '';
    this.observer = null;
  }

  App.prototype = {
    start: function() {
      this.config = new Config();

      var sections = document.getElementsByTagName('section');
      Array.from(sections).forEach((dom) => {
        var id = dom.id;
        var section = new Section(id);
        if (id == MAIN_SECTION) {
          this.activeSection = section.show();
        } else {
          section.hide();
        }
        section.on('click', this._handleClick.bind(this));
        this.sections[id] = section;
      });

      this.activeSection.focus(document.getElementById(DEFAULT_ELEMENT));

      this.keyNav = new KeyNavigationAdapter();
      this.keyNav.init();
      this.keyNav.on('move', (direction) => {
        this.activeSection.move(direction);
      });
      this.keyNav.on('enter', () => {
        this.activeSection.enter();
      });
      this.keyNav.on('esc', this._handleBack.bind(this));

      this.observer = (ip) => {
        if (ip) {
          this._updateIP(ip);
        } else {
          this._updateIP('127.0.0.1');
        }
      };
      SettingsListener.observe(SETTINGS_SERVER_IP, '', this.observer);
    },

    stop: function() {
      SettingsListener.unobserve(SETTINGS_SERVER_IP, this.observer);
      this.observer = null;

      this.keyNav.uninit();
      this.keyNav = null;
      this.activeSection = '';
      this.sections = [];

      this.config = null;
    },

    _switchSection: function(section_id) {
      if (!section_id) {
        section_id = MAIN_SECTION;
      }
      this.activeSection.hide();
      this.activeSection = this.sections[section_id].show();
    },

    _updateIP: function(ip) {
      this.ip = ip;
      document.getElementById('ip').textContent = this.ip;
      this._updateQRCode('qrcode-image');
      this._updateQRCode('big-qrcode-image', 700, 700);
    },

    _updateQRCode: function(elemId, width, height) {
      var div, rect;

      this._removeQRCode(elemId);

      if (!width || !height) {
        div = document.getElementById(elemId);
        rect = div.getBoundingClientRect();
      }

      /* jshint nonew: false */
      new QRCode(elemId, {
        text: 'http://' + this.ip + '/',
        width: width || rect.width,
        height: height || rect.height,
        colorDark : '#000000',
        colorLight : '#ffffff',
        correctLevel : QRCode.CorrectLevel.L
      });
    },

    _removeQRCode: function(elemId) {
      var div = document.getElementById(elemId);
      while (div.firstChild) {
        div.removeChild(div.firstChild);
      }
    },

    _handleClick: function(elem, section_id) {
      switch(elem.id) {
        case 'qrcode':
          this._switchSection('big-qrcode');
          break;
        case 'config-icon':
          this.config.prepareOptions((checked) => {
            this._switchSection('config-section');
            this.activeSection.focus(document.getElementById(checked));
          });
          break;
        case 'option-pair-off':
        case 'option-pair-on':
        case 'option-disabled':
          this.config.check(elem.id);
          break;
        case 'clear-paired-devices':
          if (confirm(_('clear-paired-devices-message'))) {
            this.config.clearAuthorizedDevices();
          }
          break;
        case 'save-config':
          this.config.save();
          this._switchSection();
          break;
      }
    },

    _handleBack: function() {
      this._switchSection();
    }
  };

  exports.App = App;
}(window));
