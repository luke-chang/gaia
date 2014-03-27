'use strict';

(function(exports) {
  function SpatialNavigator(collection, rectCalcFunc) {
    this.setRectCalcFunc(rectCalcFunc);
    this.reset(collection);
  };

  SpatialNavigator.prototype = evt({
    _DEBUG: false,

    _collection: null,
    _rectCalcFunc: null,
    _focus: null,

    _getRect: function snGetRect(item) {
      var rect;

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
          left: parseInt(item.left || item.x || 0),
          top: parseInt(item.top || item.y || 0),
          width: parseInt(item.width || item.w || 0),
          height: parseInt(item.height || item.h || 0)
        };
      } else if (Array.isArray(item)) {
        rect = {
          left: parseInt(item[0]),
          top: parseInt(item[1]),
          width: parseInt(item[2]),
          height: parseInt(item[3])
        };
      } else if (this._rectCalcFunc) {
        rect = this._rectCalcFunc(item);
      } else {
        rect = {
          left: 0,
          top: 0,
          width: 0,
          height: 0
        };
      }

      rect.source = item;
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

    _getAllRects: function snGetAllRects(exclusive_item) {
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
        for(var i = 0; i < distance.length; i++) {
          var d = distance[i](a) - distance[i](b);
          if (d) {
            return d;
          }
        }
        return 0;
      });

      if (this._DEBUG) {
        var temp = [];
        dest_group.forEach(function(dest) {
          temp.push(dest.source.id);
        });
        console.log(temp);
      }

      return dest_group[0];
    },

    setRectCalcFunc: function snSetRectCalcFunc(rectCalcFunc) {
      this._rectCalcFunc = rectCalcFunc || null;
    },

    reset: function snReset(collection) {
      this.unfocus();
      this._collection = [];
      if (collection) {
        for (var i = 0; i < collection.length; i++) {
          this.add(collection[i]);
        }
      }
    },

    add: function snAdd(elem) {
      var index = this._collection.indexOf(elem);
      if (index >= 0) {
        return false;
      }
      this._collection.push(elem);
      return true;
    },

    remove: function snRemove(elem) {
      var index = this._collection.indexOf(elem);
      if (index < 0) {
        return false;
      }

      if (this._focus === elem) {
        this.unfocus();
      }

      var rear = this._collection.slice(index + 1);
      this._collection.length = index;
      this._collection.push.apply(this._collection, rear);
      return true;
    },

    focus: function snFocus(elem) {
      if (!this._collection) {
        return false;
      }

      if (!elem) {
        elem = this._collection[0];
      } else if (this._collection.indexOf(elem) < 0) {
        return false;
      }

      if (!this.fire('beforefocus', elem)) {
        return false;
      }

      this._focus = elem;
      this.fire('focus', elem);
      return true;
    },

    unfocus: function snUnfocus() {
      if (this._focus) {
        var elem = this._focus;
        this._focus = null;
        this.fire('unfocus', elem);
      }
      return true;
    },

    refocus: function snRefocus(defaultElement) {
      if (!this._focus) {
        return this.focus(defaultElement);
      }
      return this.focus(this._focus);
    },

    currentFocus: function snCurrentFocus() {
      return this._focus;
    },

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

    navigate: function snNavigate(target, direction) {
      if (!target || !direction || !this._collection) {
        return null;
      }

      var rects = this._getAllRects(target);
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
        return target_rect.left - rect.right;
      };
      var nearTargetTopIsBetter = function(rect) {
        return target_rect.top - rect.bottom;
      };
      var topIsBetter = function(rect) {
        return rect.top;
      };
      var bottomIsBetter = function(rect) {
        return rect.bottom;
      };
      var leftIsBetter = function(rect) {
        return rect.left;
      };
      var rightIsBetter = function(rect) {
        return rect.right;
      };
      var priority;

      switch(direction.toLowerCase()) {
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

      var dest = this._prioritize(priority);
      if (!dest) {
        return null;
      }

      return dest.source;
    }
  });

  exports.SpatialNavigator = SpatialNavigator;
})(window);
