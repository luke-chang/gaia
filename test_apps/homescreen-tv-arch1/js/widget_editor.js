/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

/* globals Applications, SelectionBorder, LayoutEditor, URL, SpatialNavigator,
           OverlayManager */

(function(exports) {
  'use strict';

  const DEFAULT_ICON = Applications.DEFAULT_ICON_URL;

  function WidgetEditor(options) {
    if (!options.dom || !options.appList || !options.container) {
      throw new Error('WidgetEditor needs dom and appList to work.');
    }

    this.dom = options.dom;
    this.container = options.container;
    this.appList = options.appList;
    this.targetSize = options.targetSize;
    this.offset = options.offset;
    this.editor = null;
    this.selectionBorder = new SelectionBorder({ multiple: false,
                                                 container: this.container });
  }

  WidgetEditor.prototype = new window.evt();

  WidgetEditor.prototype.start = function we_start() {
    this.editor = new LayoutEditor();
    this.editor.init(this.container, this.targetSize, this.offset);

    var places = [];
    for (var i = this.editor.placeHolders.length - 1; i >= 0; i--) {
      var place = this.editor.placeHolders[i];
      if (place.static) {
        continue;
      }
      places.push(place);
    }

    //keep reference for removal
    this.boundHandleAppRemoved = this.handleAppRemoved.bind(this);
    this.boundHandleAppUpdate = this.handleAppUpdated.bind(this);
    this.boundPlaceClicked = this.handlePlaceClicked.bind(this);
    this.boundSwitchFocus = this.switchFocus.bind(this);
    Applications.on('uninstall', this.boundHandleAppRemoved);
    Applications.on('update', this.boundHandleAppUpdate);
    this.container.addEventListener('click', this.boundPlaceClicked);

    // spatial navigator
    this.spatialNav = new SpatialNavigator(places);
    this.spatialNav.on('focus', this.boundSwitchFocus);
    this.spatialNav.focus();
  };

  WidgetEditor.prototype.stop = function we_stop() {
    Applications.off('uninstall', this.boundHandleAppRemoved);
    Applications.off('update', this.boundHandleAppUpdate);
    this.container.removeEventListener('click', this.boundPlaceClicked);
    this.spatialNav.off('focus', this.boundSwitchFocus);
  };

  WidgetEditor.prototype.show = function we_show() {
    if (!this.dom.hidden) {
      return;
    }

    var self = this;
    OverlayManager.readyToOpen('widget-editor', function() {
      self.dom.hidden = false;

      self.spatialNav.focus(self.editor.getFirstNonStatic());
      self.fire('shown');
    });
  };

  WidgetEditor.prototype.hide = function we_hide() {
    if (this.dom.hidden) {
      return;
    }

    this.dom.hidden = true;
    this.fire('closed');
    OverlayManager.afterClosed('widget-editor');
  };

  WidgetEditor.prototype.isShown = function we_isShown() {
    return !this.dom.hidden;
  };

  WidgetEditor.prototype.exportConfig = function we_exportConfig() {
    return this.editor.exportConfig();
  };

  WidgetEditor.prototype.importConfig = function we_importConfig(config) {
    if (!config) {
      return;
    }

    var self = this;

    function fillReady(config) {
      self.editor.loadWidget(config);
    }

    this.editor.reset(this.revokeUrl.bind(this));
    for (var i = config.length - 1; i >= 0; i--) {
      this.fillAppInfo(config[i], fillReady);
    }
  };

  WidgetEditor.prototype.revokeUrl = function we_revokeUrl(app) {
    if (app.iconUrl !== DEFAULT_ICON) {
      URL.revokeObjectURL(app.iconUrl);
    }
  };

  WidgetEditor.prototype.fillAppInfo = function we_fillInfo(cfg, callback) {
    cfg.app = {
      origin: cfg.origin,
      entryPoint: cfg.entryPoint,
      name: Applications.getName(cfg.origin, cfg.entryPoint)
    };
    Applications.getIconBlob(cfg.origin, cfg.entryPoint, 0, function(blob) {
      cfg.app.iconUrl = blob ? URL.createObjectURL(blob) : DEFAULT_ICON;
      if (callback && (typeof callback) === 'function') {
        callback(cfg);
      }
    });
  };

  WidgetEditor.prototype.handleKeyDown = function we_handleKeyPress(key) {
    if (this.dom.hidden || this.appList.isShown()) {
      return false;
    }

    switch (key) {
      case 'Up':
      case 'Right':
      case 'Down':
      case 'Left':
        this.spatialNav.move(key);
        break;
      case 'Enter':
        this.togglePlace();
        break;
      default:
        return false;
    }

    return true;
  };

  WidgetEditor.prototype.togglePlace = function we_togglePlace() {
    if (this.spatialNav.currentFocus().app) {
      this.revokeUrl(this.spatialNav.currentFocus().app);
      this.editor.removeWidget(this.spatialNav.currentFocus());
    } else {
      if (this.appList.show()) {
        var self = this;
        self.appList.once('opened', function() {
          var handleAppChosen = self.handleAppChosen.bind(self);
          self.appList.on('iconclick', handleAppChosen);
          self.appList.once('closed', function() {
            this.off('iconclick', handleAppChosen);
          });
        });
      }
    }
  };

  WidgetEditor.prototype.switchFocus = function we_switchFocus(place) {
    if (!place) {
      return;
    }
    this.selectionBorder.select(place.elm);
  };

  WidgetEditor.prototype.handleAppChosen = function we_handleAppChosen(data) {
    var self = this;
    Applications.getIconBlob(data.origin, data.entry_point, 0, function(blob) {
      var iconUrl = blob ? URL.createObjectURL(blob) : DEFAULT_ICON;

      self.editor.addWidget({ name: data.name,
                              iconUrl: iconUrl,
                              origin: data.origin,
                              entryPoint: data.entry_point},
                            self.spatialNav.currentFocus());
    });
    this.appList.hide();
    return true;
  };

  WidgetEditor.prototype.handleAppRemoved = function we_handleAppRemoved(apps) {
    var self = this;

    function checkWidgets(app) {
      function removeWidgetUrl(place, resultCallback) {
        if (place.app.origin === app.origin &&
            place.app.entryPoint === app.entry_point) {
          self.revokeUrl(place.app.iconUrl);
          resultCallback(true, place);
        } else {
          resultCallback(false, place);
        }
      }

      self.editor.removeWidgets(removeWidgetUrl);
    }
    
    for (var i = 0; i < apps.length; i++) {
      checkWidgets(apps[i]);
    }
  };

  WidgetEditor.prototype.handleAppUpdated = function we_handleAppUpdated(apps) {
    var self = this;

    function checkWidgets(app) {
      function handleWidgetUpdate(place, resultCallback) {
        if (place.app.origin === app.origin &&
            place.app.entryPoint === app.entry_point) {

          place.app.name = app.name;
          self.revokeUrl(place.app.iconUrl);
          Applications.getIconBlob(app.origin, app.entry_point, 0, function(b) {
            var iconUrl = b ? URL.createObjectURL(b) : DEFAULT_ICON;
            place.app.iconUrl = iconUrl;
            resultCallback(true, place);
          });
        } else {
          resultCallback(false, place);
        }
      }
      self.editor.updateWidgets(handleWidgetUpdate);
    }

    for (var i = 0; i < apps.length; i++) {
      checkWidgets(apps[i]);
    }
  };

  WidgetEditor.prototype.handlePlaceClicked = function we_handlePlaceClick(e) {
    var target = e.target;
    var places = this.editor.placeHolders;
    var found = false;
    for (var i = 0; !found && i < places.length; i++) {
      if (target === places[i].elm && !places[i].static) {
        this.spatialNav.focus(places[i]);
        this.togglePlace();
        found = true;
      }
    }
    e.stopImmediatePropagation();
    e.preventDefault();
  };

  exports.WidgetEditor = WidgetEditor;
})(window);
