/* global SpatialNavigator, evt */
'use strict';

(function(exports) {
  function Section(id) {
    this.id = id;
    this._dom = document.getElementById(this.id);
    this._active = false;

    this._spatialNav = new SpatialNavigator(
      this._dom.querySelectorAll('.focusable'),
      {
        ignoreHiddenElement: true,
        rememberSource: true
      }
    );
    this._spatialNav.on('focus', this._onFocus.bind(this));
  }

  Section.prototype = evt({
    uninit: function() {
      this._spatialNav = undefined;
      this._dom = undefined;
    },

    focus: function(elem) {
      this._spatialNav.focus(elem);
    },

    move: function(direction) {
      this._spatialNav.move(direction);
    },

    enter: function() {
      var focused = this._spatialNav.getFocusedElement();
      if (focused) {
        return this.fire('click', focused.id, this.id);
      }
      return false;
    },

    back: function() {
      var focused = this._spatialNav.getFocusedElement();
      if (focused) {
        return this.fire('back', focused.id);
      }
      return false;
    },

    show: function() {
      document.activeElement.blur();

      this._dom.classList.add('visible');
      this._dom.removeAttribute('aria-hidden');

      var focusable = this._dom.querySelectorAll('.focusable');
      Array.from(focusable).forEach(function(elem) {
        elem.removeAttribute('aria-hidden');
      });

      this._spatialNav.focus();
      this._active = true;

      return this;
    },

    hide: function() {
      this._active = false;

      this._dom.classList.remove('visible');
      this._dom.setAttribute('aria-hidden', true);

      var focusable = this._dom.querySelectorAll('.focusable');
      Array.from(focusable).forEach(function(elem) {
        elem.setAttribute('aria-hidden', true);
      });
    },

    _onFocus: function(elem) {
      if (elem) {
        elem.focus();
      }
    }
  });

  exports.Section = Section;
}(window));
