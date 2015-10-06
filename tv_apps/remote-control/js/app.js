/* global QRCode, KeyNavigationAdapter, Section */
'use strict';

(function(exports) {
  var MAIN_SECTION = 'main-section';
  var DEFAULT_ELEMENT = 'qrcode';

  function App() {
    this.sections = [];
    this.keyNav = null;
    this.ip = '';
  }

  App.prototype = {
    start: function() {
      this._updateIP('127.0.0.1');

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
      this.keyNav.on('esc', () => {
        if (!this.activeSection.back()) {
          this._handleBack();
        }
      });
    },

    stop: function() {
      this.keyNav.uninit();
      this.keyNav = null;
      this.activeSection = '';
      this.sections = [];
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

      /* jshint unused: false */
      var qrcode = new QRCode(elemId, {
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

    _handleClick: function(elem_id, section_id) {
      switch(elem_id) {
        case 'qrcode':
          this.activeSection.hide();
          this.activeSection = this.sections['big-qrcode'].show();
          break;
        case 'config-icon':
          this.activeSection.hide();
          this.activeSection = this.sections['config-section'].show();
          break;
      }
    },

    _handleBack: function() {
      this.activeSection.hide();
      this.activeSection = this.sections[MAIN_SECTION].show();
    }
  };

  exports.App = App;
}(window));
