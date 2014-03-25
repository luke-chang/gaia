/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

(function(exports) {
  'use strict';

  const DEFAULT_ICON = Applications.DEFAULT_ICON_URL;

  function WidgetEditor(options) {
    if (!options.dom || !options.appList) {
      throw new Error('WidgetEditor needs dom and appList to work.');
    }
    this.dom = options.dom;
    this.appList = options.appList;
    this.targetSize = options.targetSize;
    this.offset = options.offset;
    this.editor = null;
    this.currentPlace = null;
    this.selectionBorder = new SelectionBorder({ multiple: false,
                                                 container: this.dom });
  }

  WidgetEditor.prototype = new window.evt();

  WidgetEditor.prototype.start = function we_start() {
    this.editor = new HSLayoutEditor();
    this.editor.init(this.dom, this.targetSize, this.offset);
    //keep reference for removal
    this.boundHandleAppRemoved = this.handleAppRemoved.bind(this);
    this.boundHandleAppUpdate = this.handleAppUpdated.bind(this);
    Applications.on('uninstall', this.boundHandleAppRemoved);
    Applications.on('update', this.boundHandleAppUpdate);

    this.currentPlace = this.editor.getFirstNonStatic();
    this.switchFocus(this.currentPlace);
  };

  WidgetEditor.prototype.stop = function we_stop() {
    Applications.off('uninstall', this.boundHandleAppRemoved);
    Applications.off('update', this.boundHandleAppUpdate);
  };

  WidgetEditor.prototype.show = function we_show() {
    if (!this.dom.hidden) {
      return;
    }

    this.dom.hidden = false;
    this.currentPlace = this.editor.getFirstNonStatic();
    this.switchFocus(this.currentPlace);
    this.fire('shown');
  };

  WidgetEditor.prototype.hide = function we_hide() {
    if (this.dom.hidden) {
      return;
    }

    this.dom.hidden = true;
    this.fire('closed');
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
    this.editor.reset(this.revokeUrl.bind(this));
    for (var i = config.length - 1; i >= 0; i--) {
      this.fillAppInfo(config[i], function fillReady(config) {
        self.editor.loadWidget(config);
      });
    };
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

  WidgetEditor.prototype.handleKeyDown = function we_handleKeyPress(e) {
    if (this.dom.hidden || this.appList.isShown()) {
      return;
    }
    var targetPlace;
    switch (e.keyCode) {
      case KeyEvent.DOM_VK_UP:
        targetPlace = this.editor.getAdjacentPlace(this.currentPlace,
                                                  HSLayoutEditor.DIRECTION.TOP,
                                                  true);
        this.switchFocus(targetPlace);
        break;
      case KeyEvent.DOM_VK_RIGHT:
        targetPlace = this.editor.getAdjacentPlace(this.currentPlace,
                                                 HSLayoutEditor.DIRECTION.RIGHT,
                                                 true);
        this.switchFocus(targetPlace);
        break;
      case KeyEvent.DOM_VK_DOWN:
        targetPlace = this.editor.getAdjacentPlace(this.currentPlace,
                                                HSLayoutEditor.DIRECTION.BOTTOM,
                                                true);
        this.switchFocus(targetPlace);
        break;
      case KeyEvent.DOM_VK_LEFT:
        targetPlace = this.editor.getAdjacentPlace(this.currentPlace,
                                                  HSLayoutEditor.DIRECTION.LEFT,
                                                  true);
        this.switchFocus(targetPlace);
        break;
      case KeyEvent.DOM_VK_RETURN:
        this.togglePlace();
        break;
    }
  }

  WidgetEditor.prototype.togglePlace = function we_togglePlace() {
    if (this.currentPlace.app) {
      this.revokeUrl(this.currentPlace.app);
      this.editor.removeWidget(this.currentPlace);
    } else {
      if (this.appList.show()) {
        var handleAppChosen = this.handleAppChosen.bind(this);
        this.appList.on('iconclick', handleAppChosen);
        this.appList.once('closed', function() {
          this.off('iconclick', handleAppChosen);
        });
      }
    }
  };

  WidgetEditor.prototype.switchFocus = function we_switchFocus(place) {
    if (!place) {
      return;
    }
    this.currentPlace = place;
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
                            self.currentPlace);
    });
    this.appList.hide();
    return true;
  };

  WidgetEditor.prototype.handleAppRemoved = function we_handleAppRemoved(apps) {
    var self = this;
    for (var i = 0; i < apps.length; i++) {
      var app = apps[i];
      this.editor.removeWidgets(function(place, resultCallback) {

        if (place.app.origin === app.origin &&
            place.app.entryPoint === app.entry_point) {
          self.revokeUrl(place.app.iconUrl);
          resultCallback(true, place);
        } else {
          resultCallback(false, place);
        }
      });
    }
  };

  WidgetEditor.prototype.handleAppUpdated = function we_handleAppUpdated(apps) {
    var self = this;
    for (var i = 0; i < apps.length; i++) {
      var app = apps[i];
      this.editor.updateWidgets(function(place, resultCallback) {

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
      });
    }
  };

  exports.WidgetEditor = WidgetEditor;
})(window);
