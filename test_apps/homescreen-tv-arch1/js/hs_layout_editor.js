/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

(function(exports) {
  'use strict';

  function HSLayoutEditor(options) {
    this.options = options || {};
    this.options.layout = this.options.layout || { v: 3, h: 3 };
    this.options.gap = this.options.gap || { v: 10, h: 10 };
    this.options.padding = this.options.padding ||
                           { t: 10, r: 10, b: 10, l: 10 };
    this.options.holders = this.options.holders || [
                             { static: true, x: 0, y: 0, w: 2, h: 2 },
                             { static: true, x: 0, y: 2, w: 1, h: 1 },
                             { x: 2, y: 0, w: 1, h: 1 },
                             { x: 2, y: 1, w: 1, h: 1 },
                             { x: 2, y: 2, w: 1, h: 1 },
                             { x: 1, y: 2, w: 1, h: 1 }];
  }

  HSLayoutEditor.DIRECTION = {TOP: 'top',
                              RIGHT: 'right',
                              BOTTOM: 'bottom',
                              LEFT: 'left'};

  HSLayoutEditor.prototype.init = function hsle_init(dom, targetSize, offset) {
    if (!targetSize) {
      this.scaleRatio = 1;
    } else {
      this.scaleRatio = Math.min(targetSize.w / dom.clientWidth,
                                 targetSize.h / dom.clientHeight);
    }

    this.offsetPosition = offset;
    this.container = dom;
    this.initSingleRect();
    this.createPlaceHolders();
    // return the initial widget
    return this.placeHolders[0];
  };

  HSLayoutEditor.prototype.exportConfig = function hsle_export() {
    var ret = [];
    for (var i = 0; i < this.placeHolders.length; i++) {
      var place = this.placeHolders[i];
      if (place.app) {
        ret.push({
          positionId: i,
          x: this.offsetPosition.left + Math.round(place.x * this.scaleRatio),
          y: this.offsetPosition.top + Math.round(place.y * this.scaleRatio),
          w: Math.round(place.w * this.scaleRatio),
          h: Math.round(place.h * this.scaleRatio),
          origin: place.app.origin,
          entryPoint: place.app.entryPoint
        });
      }
    }
    return ret;
  };

  HSLayoutEditor.prototype.loadWidget = function hsle_import(config) {
    if (config && this.placeHolders[config.positionId]) {
      this.addWidget(config.app, this.placeHolders[config.positionId]);
    }
  };

  HSLayoutEditor.prototype.getFirstNonStatic = function get1stNonStatic() {
    for (var i = 0; i < this.placeHolders.length; i++) {
      if (this.placeHolders[i].static) {
        continue;
      }
      return this.placeHolders[i];
    }
    return null;
  }

  HSLayoutEditor.prototype.getAdjacentPlace = function getP(place, direction,
                                                            skipStatic) {
    if (!this.placeHolders.length) {
      console.error('No place holder, we cannot find adjacent place for you');
      return null;
    }

    if (!place) {
      return this.placeHolders[0];
    }

    function calcDistanceWithoutSQRT(p1, p2, dir) {
      var xDiff = 0;
      var yDiff = 0;
      // We use the middle point of each side border to calculate the distance:
      // Like: p1 move left to p2, we calculate the distance between the middle
      //       point of p1' left border and middle point of p2's right border.
      switch (dir) {
        case HSLayoutEditor.DIRECTION.TOP:
          xDiff = p1.center.x - p2.center.x;
          yDiff = p1.y - (p2.y + p2.h);
          break;
        case HSLayoutEditor.DIRECTION.RIGHT:
          xDiff = (p1.x + p1.w) - p2.x;
          yDiff = p1.center.y - p2.center.y;
          break;
        case HSLayoutEditor.DIRECTION.BOTTOM:
          xDiff = p1.center.x - p2.center.x;
          yDiff = (p1.y + p1.h) - p2.y;
          break;
        case HSLayoutEditor.DIRECTION.LEFT:
          xDiff = p1.x - (p2.x + p2.w);
          yDiff = p1.center.y - p2.center.y;
          break;
      }
      return Math.round(xDiff * xDiff + yDiff * yDiff);
    }

    /**
     * check if p2 is at the "dir" direction of p1.
     */
    function checkDirection(p1, p2, dir) {
      switch (dir) {
        case HSLayoutEditor.DIRECTION.TOP:
          return p2.center.y < p1.center.y && p2.y < p1.y;
        case HSLayoutEditor.DIRECTION.RIGHT:
          return p2.center.x > p1.center.x && (p2.x + p2.w) > (p1.x + p1.w);
        case HSLayoutEditor.DIRECTION.BOTTOM:
          return p2.center.y > p1.center.y && (p2.y + p2.h) > (p1.y + p1.h);
        case HSLayoutEditor.DIRECTION.LEFT:
          return p2.center.x < p1.center.x && p2.x < p1.x;
      }
      return false;
    }

    var adjacent;
    var adjacentDist;
    for (var i = 0; i < this.placeHolders.length; i++) {
      var targetPlace = this.placeHolders[i];
      if ((skipStatic && targetPlace.static === skipStatic) ||
          targetPlace === place ||
          !checkDirection(place, targetPlace, direction)) {
        continue;
      }
      var dist = calcDistanceWithoutSQRT(place, targetPlace, direction);
      if (!adjacent) {
        adjacent = targetPlace;
        adjacentDist = dist
      } else if (dist < adjacentDist) {
        adjacent = targetPlace;
        adjacentDist = dist
      }
    }
    return adjacent;
  }

  HSLayoutEditor.prototype.createPlaceHolders = function hsle_createHolders() {
    this.placeHolders = [];
    for (var i = 0; i < this.options.holders.length; i++) {
      var place = this.options.holders[i];
      // convert grid to pixel coordinate system.
      var x = place.x * (this.options.gap.h + this.singleRect.width) +
              this.options.padding.l;
      var y = place.y * (this.options.gap.v + this.singleRect.height) +
              this.options.padding.t;
      var w = place.w * this.singleRect.width +
              (place.w - 1) * this.options.gap.h;
      var h = place.h * this.singleRect.height +
              (place.h - 1) * this.options.gap.v;
      var center = {
        x: (x + w / 2),
        y: (y + h / 2)
      };
      var placeHolder = { static: place.static,
                          center: center,
                          x: x, y: y, w: w, h: h };
      this.createPlaceHolderUI(placeHolder);
      this.placeHolders.push(placeHolder);
    }
  };

  HSLayoutEditor.prototype.createPlaceHolderUI = function hsle_create(place) {
    var div = document.createElement('div');
    div.classList.add('place-holder');
    if (place.static) {
      div.classList.add('static-place-holder');
    }

    div.style.width = place.w + 'px';
    div.style.height = place.h + 'px';
    div.style.left = place.x + 'px';
    div.style.top = place.y + 'px';

    this.container.appendChild(div);
    place.elm = div;
  };

  HSLayoutEditor.prototype.updatePlaceHolderUI = function hsle_update(place) {
    if (place.app) {
      place.elm.dataset.appName = place.app.name;
      place.elm.style.backgroundImage = 'url(' + place.app.iconUrl + ')';
    } else {
      place.elm.dataset.appName = '';
      place.elm.style.backgroundImage = '';
    }
  };

  HSLayoutEditor.prototype.addWidget = function hsle_add(app, place) {
    place.app = app;
    this.updatePlaceHolderUI(place);
  };

  HSLayoutEditor.prototype.removeWidget = function hsle_remove(place) {
    delete place.app;
    this.updatePlaceHolderUI(place);
  };

  HSLayoutEditor.prototype.removeWidgets = function hsle_removeItems(callback) {
    this.batchOps(callback, this.removeWidget.bind(this));
  };

  HSLayoutEditor.prototype.updateWidgets = function hsle_updateItems(callback) {
    this.batchOps(callback, this.updatePlaceHolderUI.bind(this));
  };

  HSLayoutEditor.prototype.batchOps = function hsle_batch(checkingFunc,
                                                          affectedFunc) {
    if (!checkingFunc || (typeof checkingFunc) !== 'function' ||
        !affectedFunc || (typeof affectedFunc) !== 'function') {
      return;
    }
    for (var i = 0; i < this.placeHolders.length; i++) {
      if (!this.placeHolders[i].app) {
        continue;
      }
      try {
        checkingFunc(this.placeHolders[i], function result(affected, place) {
          if (affected) {
            affectedFunc(place);
          }
        });
      } catch (ex) {
        console.error('Error while trying to execute callback of ' +
                      'batch tasks with place #' + i, ex);
      }
    }
  };

  HSLayoutEditor.prototype.swapWidget = function hsle_swap(place1, place2) {
    var tmp = place1.app;
    place1.app = place2.app;
    place1.app = tmp;
    this.updatePlaceHolderUI(place1);
    this.updatePlaceHolderUI(place2);
  };

  HSLayoutEditor.prototype.reset = function hsle_reset(callback) {
    for (var i = 0; i < this.placeHolders.length; i++) {
      if (callback && (typeof callback) === 'function') {
        callback(this.placeHolders[i]);
      }
      delete this.placeHolders[i].app;
    }
  };

  HSLayoutEditor.prototype.initSingleRect = function hsle_initSingleRect() {
    var width = (this.container.clientWidth
                 - (this.options.layout.h - 1) * this.options.gap.h
                 - this.options.padding.l
                 - this.options.padding.r) / this.options.layout.h;
    var height = (this.container.clientHeight
                  - (this.options.layout.v - 1) * this.options.gap.v
                  - this.options.padding.t
                  - this.options.padding.b) / this.options.layout.v;
    this.singleRect = {width: Math.round(width),
                       height: Math.round(height)};
  };

  exports.HSLayoutEditor = HSLayoutEditor;
})(window);
