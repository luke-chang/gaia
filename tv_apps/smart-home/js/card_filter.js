/* global evt */
(function(exports) {
  'use strict';

  /**
   * This class controls UI and user interaction of filter.
   *
   * @class CardFilter
   * @fires CardFilter#opened
   * @fires CardFilter#filterchanged
   */
  function CardFilter() {}

  var proto = CardFilter.prototype = new evt();

  Object.defineProperty(proto, 'filter', {
    get: function cf_getFilter() {
      return this._selectedFilter;
    },
    set: function cf_setFilter(icon) {
      if (this.menuGroup && this._buttons[icon]) {
        if (this._buttons[this._selectedFilter]) {
          this._buttons[this._selectedFilter].classList.remove('toggled');
        }
        this._selectedFilter = icon;
        this.changeIcon(icon);
        this._buttons[icon].classList.add('toggled');
        /**
         * This event fires whenever filter changes.
         * @event CardFilter#filterchanged
         */
        this.emit('filterchanged', icon);
      }
    }
  });

  proto.start = function cf_start(menuGroup) {
    this.menuGroup = menuGroup;
    var buttons = menuGroup.querySelectorAll('smart-button[data-icon-type]');
    this._buttons = {};
    for (var i = 0; i < buttons.length; i++) {
      this._buttons[buttons[i].dataset.iconType] = buttons[i];
      buttons[i].addEventListener('click', this);
    }
  };

  proto.stop = function cf_stop() {
    var that = this;
    var buttonKeys = Object.keys(this._buttons);
    buttonKeys.forEach(function(key) {
      that._buttons[key].removeEventListener('click', that);
    });
  };

  proto.handleEvent = function cf_handleEvent(evt) {
    if (!evt.target.dataset.iconType) {
      return;
    }
    this.filter = evt.target.dataset.iconType;
  };

  proto.hide = function cf_hide() {
    this.menuGroup.classList.add('hidden');
  };

  proto.show = function cf_show() {
    this.menuGroup.classList.remove('hidden');
  };

  proto.changeIcon = function cf_changeIcon(icon) {
    var menuGroup = this.menuGroup;

    if (!menuGroup.dataset.icon) {
      menuGroup.dataset.icon = icon;
      return;
    }
    var current = menuGroup.dataset.icon.split(' ')[0];
    if (current === icon) {
      return;
    }
    menuGroup.classList.add('switching-icon');
    menuGroup.dataset.icon = icon + ' ' + current;

    // Let gecko to recalculate the value and remove it.
    // We shouldn't put any value at the setTimeout, but it doesn't work in some
    // device, like FirefoxNightly, b2g-desktop. The 100 ms works well in
    // these environments.
    setTimeout(function() {
      menuGroup.classList.remove('switching-icon');
    }, 100);
  };

  exports.CardFilter = CardFilter;

})(window);
