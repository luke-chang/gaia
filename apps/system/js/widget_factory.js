/* global BrowserConfigHelper, widgetManager, WidgetWindow */
'use strict';

(function(exports) {
  // var DEBUG = false;

  var WidgetFactory = function() {
  };

  WidgetFactory.prototype = {
    createWidget: function(appURL, manifestURL, styles) {
      if (appURL === window.location.href) {
        return;
      }
      var config = new BrowserConfigHelper(appURL, manifestURL);
      if (!config.manifest) {
        return;
      }
      var widgetOverlay =
        document.getElementsByClassName('widget-overlay')[0];
      var app = new WidgetWindow(config, widgetOverlay);
      app.setStyle(styles);
      this.publish('launchwidget', app.instanceID);

      return app;
    },

    publish: function wf_publish(event, detail) {
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, true, false, detail);
      window.dispatchEvent(evt);
    }
  };

  exports.WidgetFactory = WidgetFactory;
}(window));
