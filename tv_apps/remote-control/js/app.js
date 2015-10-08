/* global QRCode, KeyNavigationAdapter, Section, Config */
'use strict';

(function(exports) {
  var MAIN_SECTION = 'main-section';
  var DEFAULT_ELEMENT = 'qrcode';

  var _ = navigator.mozL10n.get;

  function App() {
    this.config = null;
    this.sections = [];
    this.keyNav = null;
    this.ip = '';
  }

  App.prototype = {
    start: function() {
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

      this.config = new Config();
      this.config.start();
      this.config.once('ready', this._statusCheck.bind(this));
      this.config.on('changed', this._onSettingsChanged.bind(this));
    },

    stop: function() {
      this.config.stop();
      this.config = null;

      this.keyNav.uninit();
      this.keyNav = null;

      this.activeSection = '';
      this.sections = [];
    },

    _statusCheck: function() {
      var setVisible = function(elemId, visible) {
        var elem = document.getElementById(elemId);
        if (visible) {
          elem.classList.add('visible');
        } else {
          elem.classList.remove('visible');
        }
      };

      var enabled = this.config.settings.enabled;
      var hasConnection = !!this.ip;
      setVisible('location', enabled && hasConnection);
      setVisible('off-line-message', enabled && !hasConnection);
      setVisible('disabled-message', !enabled);

      var mainSection = this.sections[MAIN_SECTION];
      if (enabled && hasConnection) {
        mainSection.focus(document.getElementById(DEFAULT_ELEMENT));
      } else {
        mainSection.unfocus();
        mainSection.focus();
      }
    },

    _onSettingsChanged: function(name, value) {
      switch(name) {
        case 'server-ip':
          this._updateIP(value);
          break;
      }
      this._statusCheck();
    },

    _switchSection: function(sectionId) {
      if (!sectionId) {
        sectionId = MAIN_SECTION;
      }
      this.activeSection.hide();
      this.activeSection = this.sections[sectionId].show();
    },

    _updateIP: function(ip) {
      this.ip = ip;
      document.getElementById('ip').textContent = this.ip;
      this._updateQRCode('qrcode-image', 256, 256);
      this._updateQRCode('big-qrcode-image', 700, 700);
    },

    _updateQRCode: function(elemId, width, height) {
      this._removeQRCode(elemId);

      if (this.ip) {
        /* jshint nonew: false */
        new QRCode(elemId, {
          text: 'http://' + this.ip + '/',
          width: width,
          height: height,
          colorDark : '#000000',
          colorLight : '#ffffff',
          correctLevel : QRCode.CorrectLevel.L
        });
      }
    },

    _removeQRCode: function(elemId) {
      var div = document.getElementById(elemId);
      while (div.firstChild) {
        div.removeChild(div.firstChild);
      }
    },

    _handleClick: function(elem, sectionId) {
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
          // wait for settings change
          setTimeout(this._switchSection.bind(this), 200);
          break;
      }
    },

    _handleBack: function() {
      this._switchSection();
    }
  };

  exports.App = App;
}(window));
