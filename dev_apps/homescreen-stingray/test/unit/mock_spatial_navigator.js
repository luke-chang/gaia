'use strict';

(function(exports) {

  function MockSpatialNavigator(collection, options) {
    MockSpatialNavigator.singleton._collection = collection || [];
    return MockSpatialNavigator.singleton;
  }

  MockSpatialNavigator.singleton = {
    _focused: null,
    focus: function(elem) {
      this._focused = elem || this._collection[0];
    },
    refocus: function() {},
    on: function() {},
    off: function() {},
    add: function(elem) {
      this._collection.push(elem);
    },
    move: function() {},
    remove: function(elem) {
      var idx = this._collection.indexOf(elem);
      if (idx > -1) {
        this._collection.splice(idx, 1);
      }
    },
    currentFocus: function() {
      return this._focused;
    },
    reset: function() {
      this._focused = null;
      this._collection = null;
    }
  };

  MockSpatialNavigator.mTeardown = MockSpatialNavigator.singleton.reset;
  exports.MockSpatialNavigator = MockSpatialNavigator;
})(window);
