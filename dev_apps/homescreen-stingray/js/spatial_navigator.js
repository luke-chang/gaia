'use strict';
/* global evt */

(function(exports) {
  /**
   * SpatialNavigator Element
   *
   * An element that you want to let SpatialNavigator can navigate in.
   *
   * It can be a DOM element, custom element (with left/top/width/height or
   * x/y/w/h attributes), array (with first 4 elements indicates
   * left/top/width/height) or any other types which you can describe its
   * position and size by {@link SpatialNavigatorRectCalcFunc}.
   *
   * @typedef {Object} SpatialNavigatorElement
   */

  /**
   * SpatialNavigator Configuration
   *
   * @typedef {Object} SpatialNavigatorConfig
   * @property {Boolean} [crossOnly=false]
   *           Limit the navigating direction to vertical and horizontal only.
   * @property {SpatialNavigatorRectCalcFunc} [rectCalcFunc=null]
   *           A callback function which can describe the position and size of
   *           a {@link SpatialNavigatorElement}.
   */

  /**
   * SpatialNavigator Rect Calculating Function
   *
   * A callback function which can describe the position and size of a
   * {@link SpatialNavigatorElement}.
   *
   * @callback SpatialNavigatorRectCalcFunc
   * @param {SpatialNavigatorElement} element
   * @return {Object} An object with "left/top/width/height" attributes or
   *                  "null" if you prefer using default rules of
   *                  SpatialNavigator.
   */

  /**
   * SpatialNavigator is a helper for simulating spatial navigation in
   * javascript level.
   *
   * Spatial navigation is the ability to navigate between focusable elements
   * within a structured document or user interface according to the spatial
   * location. It uses the arrow keys to navigate on the "2D plane" of the
   * interface.
   *
   * @class SpatialNavigator
   * @param {Array} [collection]
   *        An initial set of {@link SpatialNavigatorElement} for traversal.
   * @param {SpatialNavigatorConfig} [options] Initial configurations.
   */
  function SpatialNavigator(collection, options) {
    this._collection = null;
    this._rectCalcFunc = null;
    this._focus = null;

    options = options || {};
    this._crossOnly = options.crossOnly || false;
    this.setRectCalcFunc(options.rectCalcFunc);

    this.reset(collection);
  }

  SpatialNavigator.prototype = evt({
    _DEBUG: false,

    _getRect: function snGetRect(item) {
      var rect = null;

      if (this._rectCalcFunc) {
        rect = this._rectCalcFunc(item);
      }

      if (!rect) {
        if (item.getBoundingClientRect) {
          var cr = item.getBoundingClientRect();
          rect = {
            left: cr.left,
            top: cr.top,
            width: cr.width,
            height: cr.height
          };
        } else if (item.left || item.x) {
          rect = {
            left: parseInt(item.left || item.x || 0, 10),
            top: parseInt(item.top || item.y || 0, 10),
            width: parseInt(item.width || item.w || 0, 10),
            height: parseInt(item.height || item.h || 0, 10)
          };
        } else if (Array.isArray(item) && item.length >= 4) {
          rect = {
            left: parseInt(item[0], 10),
            top: parseInt(item[1], 10),
            width: parseInt(item[2], 10),
            height: parseInt(item[3], 10)
          };
        } else {
          rect = {
            left: 0,
            top: 0,
            width: 0,
            height: 0
          };
        }
      }

      rect.item = item;
      rect.right = rect.left + rect.width;
      rect.bottom = rect.top + rect.height;
      rect.center = {
        x: rect.left + Math.floor(rect.width / 2),
        y: rect.top + Math.floor(rect.height / 2)
      };
      rect.center.left = rect.center.right = rect.center.x;
      rect.center.top = rect.center.bottom = rect.center.y;

      return rect;
    },

    _getAllRectsExcept: function snGetAllRectsExcept(exclusive_item) {
      var self = this;
      var rects = [];

      this._collection.forEach(function(item) {
        if (!exclusive_item || exclusive_item !== item) {
          rects.push(self._getRect(item));
        }
      });

      return rects;
    },

    _demarcate: function snDemarcate(rects, target_rect) {
      var groups = [[], [], [], [], [], [], [], [], []];

      rects.forEach(function(rect) {
        var center = rect.center;
        var x, y, group_id;

        if (center.x < target_rect.left) {
          x = 0;
        } else if (center.x <= target_rect.right) {
          x = 1;
        } else {
          x = 2;
        }

        if (center.y < target_rect.top) {
          y = 0;
        } else if (center.y <= target_rect.bottom) {
          y = 1;
        } else {
          y = 2;
        }

        group_id = y * 3 + x;
        groups[group_id].push(rect);
      });

      return groups;
    },

    _prioritize: function snPrioritize(priority) {
      var dest_group = null;
      var distance = [];

      priority.some(function(p) {
        if (p.group.length) {
          dest_group = p.group;
          distance = p.distance;
          return true;
        }
        return false;
      });

      if (!dest_group) {
        return null;
      }

      dest_group.sort(function(a, b) {
        for (var i = 0; i < distance.length; i++) {
          var d = distance[i](a) - distance[i](b);
          if (d) {
            return d;
          }
        }
        return 0;
      });

      if (this._DEBUG) {
        console.log(dest_group);
      }

      return dest_group[0];
    },

    /**
     * Set {@link SpatialNavigatorRectCalcFunc} for SpatialNavigator.
     *
     * @param  {SpatialNavigatorRectCalcFunc} [rectCalcFunc=null]
     *         A callback function that SpatialNavigator can calculate the
     *         position and size of any type of elements which you provide.
     * @memberof SpatialNavigator.prototype
     */
    setRectCalcFunc: function snSetRectCalcFunc(rectCalcFunc) {
      this._rectCalcFunc = rectCalcFunc || null;
    },

    /**
     * Set or reset the collection for traversal.
     *
     * SpatialNavigator will create a new array to maintain the elements instead
     * of keeping the original array you passed in.
     *
     * @param  {Array} [collection=[]]
     *         A collection of {@link SpatialNavigatorElement}.
     * @memberof SpatialNavigator.prototype
     */
    reset: function snReset(collection) {
      this.unfocus();
      this._collection = collection ? [].concat(collection) : [];
    },

    /**
     * Add an element.
     *
     * @param  {SpatialNavigatorElement} elem
     * @return {Boolean} true if succeed.
     * @memberof SpatialNavigator.prototype
     */
    add: function snAdd(elem) {
      var index = this._collection.indexOf(elem);
      if (index >= 0) {
        return false;
      }
      this._collection.push(elem);
      return true;
    },

    /**
     * Remove an element.
     *
     * the "unfocus" method will be called automatically if it is the current
     * focused element.
     *
     * @param  {SpatialNavigatorElement} elem
     * @return {Boolean} true if succeed. false if it doesn't exist.
     * @memberof SpatialNavigator.prototype
     */
    remove: function snRemove(elem) {
      var index = this._collection.indexOf(elem);
      if (index < 0) {
        return false;
      }

      if (this._focus === elem) {
        this.unfocus();
      }

      this._collection.splice(index, 1);
      return true;
    },

    /**
     * Move focus to an exist element.
     *
     * It will trigger "focus" event. The first element will be focused if
     * the argument "elem" is omitted.
     *
     * @param  {SpatialNavigatorElement} [elem]
     * @return {Boolean} true if succeed. false if it doesn't exist.
     * @memberof SpatialNavigator.prototype
     */
    focus: function snFocus(elem) {
      if (!this._collection) {
        return false;
      }

      if (!elem) {
        elem = this._collection[0];
      } else if (this._collection.indexOf(elem) < 0) {
        return false;
      }

      this._focus = elem;
      this.fire('focus', elem);
      return true;
    },

    /**
     * Remove focus if any.
     *
     * It will trigger "unfocus" event.
     *
     * @memberof SpatialNavigator.prototype
     */
    unfocus: function snUnfocus() {
      if (this._focus) {
        var elem = this._focus;
        this._focus = null;
        this.fire('unfocus', elem);
      }
      return true;
    },

    /**
     * Trigger "focus" event immediately on the current focused element.
     *
     * The "defaultElement" will be focused if nothing is already focused. The
     * first element will be focused if "defaultElement" is omitted.
     *
     * @param {SpatialNavigatorElement} [defaultElement]
     * @return {Boolean} true if succeed. false if nothing can be focused.
     * @memberof SpatialNavigator.prototype
     */
    refocus: function snRefocus(defaultElement) {
      if (!this._focus) {
        return this.focus(defaultElement);
      }
      return this.focus(this._focus);
    },

    /**
     * Get the cureent focused element.
     *
     * The current focused element will be returned as-is.
     *
     * @return {SpatialNavigatorElement}
     * @memberof SpatialNavigator.prototype
     */
    currentFocus: function snCurrentFocus() {
      return this._focus;
    },

    /**
     * Move to next element by direction.
     *
     * The new focused element will trigger "focus" event and the old one will
     * trigger "unfocus" event.
     *
     * @param {String} direction It should be "left", "right", "up" or "down".
     * @return {Boolean} true if succeed, false if nothing can be focused.
     * @memberof SpatialNavigator.prototype
     */
    move: function snMove(direction) {
      if (!this._focus) {
        this.focus();
      } else {
        var elem = this.navigate(this._focus, direction);
        if (!elem) {
          return false;
        }
        this.unfocus();
        this.focus(elem);
      }
      return true;
    },

    /**
     * Get a element which best fits the given target element and the direction.
     *
     * @param {SpatialNavigatorElement} target
     *        The origin of coordinates for traversal.
     * @param {String} direction
     *        It should be "left", "right", "up" or "down".
     * @return {SpatialNavigatorElement}
     *         The destination of the element which has the highest priority.
     * @memberof SpatialNavigator.prototype
     */
    navigate: function snNavigate(target, direction) {
      if (!target || !direction || !this._collection) {
        return null;
      }

      var rects = this._getAllRectsExcept(target);
      var target_rect = this._getRect(target);
      var groups = this._demarcate(rects, target_rect);
      var internal_groups = this._demarcate(groups[4], target_rect.center);

      var nearPlumbLineIsBetter = function(rect) {
        var d;
        if (rect.center.x < target_rect.center.x) {
          d = target_rect.center.x - rect.right;
        } else {
          d = rect.left - target_rect.center.x;
        }
        return d < 0 ? 0 : d;
      };
      var nearHorizonIsBetter = function(rect) {
        var d;
        if (rect.center.y < target_rect.center.y) {
          d = target_rect.center.y - rect.bottom;
        } else {
          d = rect.top - target_rect.center.y;
        }
        return d < 0 ? 0 : d;
      };
      var nearTargetLeftIsBetter = function(rect) {
        var d;
        if (rect.center.x < target_rect.center.x) {
          d = target_rect.left - rect.right;
        } else {
          d = rect.left - target_rect.left;
        }
        return d < 0 ? 0 : d;
      };
      var nearTargetTopIsBetter = function(rect) {
        var d;
        if (rect.center.y < target_rect.center.y) {
          d = target_rect.top - rect.bottom;
        } else {
          d = rect.top - target_rect.top;
        }
        return d < 0 ? 0 : d;
      };
      var topIsBetter = function(rect) {
        return rect.top;
      };
      var bottomIsBetter = function(rect) {
        return -1 * rect.bottom;
      };
      var leftIsBetter = function(rect) {
        return rect.left;
      };
      var rightIsBetter = function(rect) {
        return -1 * rect.right;
      };
      var priority;

      switch (direction.toLowerCase()) {
        case 'left':
          priority = [
            {
              group: internal_groups[0].concat(internal_groups[3])
                                       .concat(internal_groups[6]),
              distance: [
                nearPlumbLineIsBetter,
                topIsBetter
              ]
            },
            {
              group: groups[3],
              distance: [
                nearPlumbLineIsBetter,
                topIsBetter
              ]
            },
            {
              group: groups[0].concat(groups[6]),
              distance: [
                nearHorizonIsBetter,
                rightIsBetter,
                nearTargetTopIsBetter
              ]
            }
          ];
          break;
        case 'right':
          priority = [
            {
              group: internal_groups[2].concat(internal_groups[5])
                                       .concat(internal_groups[8]),
              distance: [
                nearPlumbLineIsBetter,
                topIsBetter
              ]
            },
            {
              group: groups[5],
              distance: [
                nearPlumbLineIsBetter,
                topIsBetter
              ]
            },
            {
              group: groups[2].concat(groups[8]),
              distance: [
                nearHorizonIsBetter,
                leftIsBetter,
                nearTargetTopIsBetter
              ]
            }
          ];
          break;
        case 'up':
          priority = [
            {
              group: internal_groups[0].concat(internal_groups[1])
                                       .concat(internal_groups[2]),
              distance: [
                nearHorizonIsBetter,
                leftIsBetter
              ]
            },
            {
              group: groups[1],
              distance: [
                nearHorizonIsBetter,
                leftIsBetter
              ]
            },
            {
              group: groups[0].concat(groups[2]),
              distance: [
                nearPlumbLineIsBetter,
                bottomIsBetter,
                nearTargetLeftIsBetter
              ]
            }
          ];
          break;
        case 'down':
          priority = [
            {
              group: internal_groups[6].concat(internal_groups[7])
                                       .concat(internal_groups[8]),
              distance: [
                nearHorizonIsBetter,
                leftIsBetter
              ]
            },
            {
              group: groups[7],
              distance: [
                nearHorizonIsBetter,
                leftIsBetter
              ]
            },
            {
              group: groups[6].concat(groups[8]),
              distance: [
                nearPlumbLineIsBetter,
                topIsBetter,
                nearTargetLeftIsBetter
              ]
            }
          ];
          break;
        default:
          return;
      }

      if (this._crossOnly) {
        priority.pop();
      }

      var dest = this._prioritize(priority);
      if (!dest) {
        return null;
      }

      return dest.item;
    }
  });

  exports.SpatialNavigator = SpatialNavigator;
})(window);
