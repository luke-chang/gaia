/* global Service */
'use strict';

(function() {
  var RemoteTouchPanel = function() {};

  RemoteTouchPanel.EVENTS = [
    'volumeup'
  ];

  BaseModule.create(RemoteTouchPanel, {
    name: 'RemoteTouchPanel',
    EVENT_PREFIX: 'remotetouchpanel',
    DEBUG: false,

    _start: function() {
      this.element = document.getElementById('pseudo-touch-panel')
      this.element.addEventListener('touchstart', this);
      this.element.addEventListener('touchmove', this);
      this.element.addEventListener('touchend', this);
    },

    _handle_volumeup: function() {
      if (this.active) {
        this.hide();
      } else {
        this.show();
      }
    },

    hide: function() {
      this.active = false;
      this.element.classList.remove('visible');
      this.publish('-deactivated');
    },

    show: function() {
      this.active = true;
      this.element.classList.add('visible');
      this.publish('-activated');
    },

    _handle_touchstart: function(evt) {
      Service.request('remoteTouch', evt);
    },

    _handle_touchmove: function(evt) {
      Service.request('remoteTouch', evt);
    },

    _handle_touchend: function(evt) {
      evt.stopImmediatePropagation();

      if (!this.active) {
        return;
      }

      Service.request('remoteTouch', evt);
    }
  });
}());
