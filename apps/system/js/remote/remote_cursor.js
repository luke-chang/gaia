/* global BaseModule, Service */
'use strict';

(function(exports) {
  function RemoteCursor() {
  }

  RemoteCursor.EVENTS = [
    'remotetouch'
  ];

  BaseModule.create(RemoteCursor, {
    name: 'RemoteCursor',
    DEBUG: true,

    update: function(x, y) {
      this.show();
      x = this.cursorX - this.centerX + x;
      y = this.cursorY - this.centerY + y;
      this.cursor.style.MozTransform =
        'translateX(' + x + 'px) translateY(' + y + 'px)';
    },

    show: function() {
      this.cursor.classList.add('visible');
    },

    hide: function() {
      this.cursor.classList.remove('visible');
    },

    _start: function() {
      this.cursor = document.getElementById('cursor');

      this.show();

      this.screen = {};
      this.screen.width = this.cursor.offsetLeft * 2;
      this.screen.height = this.cursor.offsetTop * 2;

      this.cursorX = this.centerX = this.screen.width / 2;
      this.cursorY = this.centerY = this.screen.height / 2;

      this.hide();
    },

    _stop: function() {
      this.hide();
    },

    _handle_remotetouch: function(evt) {
      var type = evt.detail.type;
      var touch = evt.detail.touch;
      var ox = touch.pageX;
      var oy = touch.pageY;
      //var ow = touch.width;
      var oh = touch.height;
      //var nw = this.screen.width;
      var nh = this.screen.height;
      var nx = nh * ox / oh;
      var ny = nh * oy / oh;

      //this.debug(type + ': x=' + nx + ', y=' + ny);
      //this.debug(JSON.stringify(touch));

      switch (type) {
        case 'touchstart':
          this._startX = nx;
          this._startY = ny;
          this._StartTime = Date.now();
          break;
        case 'touchmove':
          /*var tmpX = this.cursorX + nx - this._startX;
          if (tmpX > this.screen.width) {
            nx -= tmpX - this.screen.width;
          } else if (tmpX < 0) {
            nx -= tmpX;
          }

          var tmpY = this.cursorY + ny - this._startY;
          if (tmpY > this.screen.height) {
            ny -= tmpY - this.screen.height;
          } else if (tmpY < 0) {
            ny -= tmpY;
          }*/

          this.update(nx - this._startX, ny - this._startY);
          break;
        case 'touchend':
          this.cursorX = this.cursorX + nx - this._startX;
          this.cursorY = this.cursorY + ny - this._startY;
          this.debug('(' + Math.round(this.cursorX) + ', ' +
                           Math.round(this.cursorY) + ')');
          break;
      }

      function dist(x0, y0, x1, y1) {
        var dx = x0 - x1;
        var dy = y0 - y1;
        return Math.sqrt(dx * dx + dy * dy);
      }

      var CLICK_DISTANCE_THRESHOLD = 15;
      var CLICK_TIME_THRESHOLD_MS = 500;

      if (type === 'touchend' &&
          dist(this._startX, this._startY, nx, ny) < CLICK_DISTANCE_THRESHOLD &&
          Date.now() - this._StartTime < CLICK_TIME_THRESHOLD_MS) {
        Service.request('simulateClick', this.cursorX, this.cursorY);
      }
    }
  });
}(window));
