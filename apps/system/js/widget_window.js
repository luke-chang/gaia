/* global AppWindow */
'use strict';

/**
 * This is fired when the app window is instantiated.
 * @event WidgetWindow#widgetcreated
 */
(function(exports) {
  var DEBUG = false;

  var WidgetWindow = function WidgetWindow(configuration, containerElement) {
    this.containerElement = containerElement;
    this.reConfig(configuration);
    this.render();
    this.publish('created');
    if (DEBUG || this._DEBUG) {
      AppWindow[this.instanceID] = this;
    }

    this.launchTime = Date.now();

    return this;
  };

  WidgetWindow.prototype = {
    __proto__: AppWindow.prototype,

    eventPrefix: 'widget',

    CLASS_NAME: 'WidgetWindow',

    setStyle: function(arg) {
      this.width = arg.w || this.width;
      this.height = arg.h || this.height;
      this.left = arg.x || this.left;
      this.top = arg.y || this.top;
      this.opacity = arg.opacity || this.opacity;
      this.element.style.width = this.width + 'px';
      this.element.style.height = this.height + 'px';
      this.element.style.left = this.left + 'px';
      this.element.style.top = this.top + 'px';
      this.element.style.opacity = this.opacity;
    },

    resize: function() {},
    isActive: function() {
      // Widgets never goes active.
      return false;
    }
  };
  // Widget.prototype.__proto__ = AppWindow.prototype;
  exports.WidgetWindow = WidgetWindow;
}(window));
