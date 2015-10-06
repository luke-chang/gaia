/* global QRCode, KeyNavigationAdapter, SpatialNavigator */
'use strict';

(function(exports) {
  function App() {
    this.spatialNav = null;
    this.keyNav = null;
    this.ip = '';
  }

  App.prototype = {
    _updateIP: function(ip) {
      this.ip = ip;
      document.getElementById('ip').textContent = this.ip;
      this._updateQRCode('qrcode-image');
    },

    _updateQRCode: function(elemId) {
      var div = document.getElementById(elemId);
      while (div.firstChild) {
        div.removeChild(div.firstChild);
      }

      var rect = div.getBoundingClientRect();
      /* jshint unused: false */
      var qrcode = new QRCode(elemId, {
        text: 'http://' + this.ip + '/',
        width: rect.width,
        height: rect.height,
        colorDark : '#000000',
        colorLight : '#ffffff',
        correctLevel : QRCode.CorrectLevel.L
      });
    },

    _handleClick: function() {
      var focused = this.spatialNav.getFocusedElement();
      if (!focused) {
        return;
      }

      switch(focused.id) {
        case 'qrcode':
          this._enlargeQRCode(true);
          break;
        case 'config':
          break;
      }
    },

    _handleBack: function() {
      this._enlargeQRCode(false);
    },

    _initSpatialNavigation: function() {
      this.spatialNav = new SpatialNavigator(
        document.querySelectorAll('.focusable'),
        {
          ignoreHiddenElement: true,
          rememberSource: true
        }
      );
      this.spatialNav.on('focus', function(elem) {
        elem.focus();
      });
      this.spatialNav.focus(document.getElementById('qrcode'));

      this.keyNav = new KeyNavigationAdapter();
      this.keyNav.init();
      this.keyNav.on('move', this.spatialNav.move.bind(this.spatialNav));
      this.keyNav.on('enter', this._handleClick.bind(this));
      this.keyNav.on('esc', this._handleBack.bind(this));
    },

    _enableMainSection: function(enable) {
      var focusable = document.querySelectorAll('#main-section .focusable');
      Array.from(focusable).forEach(function(elem) {
        if (enable) {
          elem.removeAttribute('aria-hidden');
        } else {
          elem.setAttribute('aria-hidden', true);
        }
      });

      if (enable) {
        this.spatialNav.focus();
      } else {
        document.activeElement.blur();
      }
    },

    _enlargeQRCode: function(enable) {
      var bigQRCode = document.getElementById('big-qrcode');
      bigQRCode.style.display = enable ? 'flex' : 'none';
      this._enableMainSection(!enable);
      if (enable) {
        this._updateQRCode('big-qrcode-image');
      } else {
        var div = document.getElementById('big-qrcode-image');
        while (div.firstChild) {
          div.removeChild(div.firstChild);
        }
      }
    },

    start: function() {
      this._updateIP('127.0.0.1');
      this._initSpatialNavigation();
    },

    stop: function() {
      this.keyNav.uninit();
      this.keyNav = null;
      this.spatialNav = null;
    }
  };

  exports.App = App;

  window.onload = function() {
    var app = new App();
    app.start();
  };
}(window));
