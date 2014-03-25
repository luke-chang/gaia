'use strict';

(function(exports) {
  var Applications = evt({
    HIDDEN_ROLES: ['system', 'input', 'homescreen', 'search'],
    DEFAULT_ICON_URL: '/style/images/default.png',

    installedApps: {},

    _ready: false,
    _readyCallbacks: [],

    _isHiddenApp: function appIsHiddenApp(role) {
      if (!role) {
        return false;
      }
      return (this.HIDDEN_ROLES.indexOf(role) !== -1);
    },

    _loadIcon: function appLoadIcon(request) {
      if (!request.url) {
        if (request.onerror) {
          request.onerror();
        }
        return;
      }

      var xhr = new XMLHttpRequest({
        mozAnon: true,
        mozSystem: true
      });

      var icon = request.url;

      xhr.open('GET', icon, true);
      xhr.responseType = 'blob';

      xhr.onload = function onload(evt) {
        var status = xhr.status;

        if (status !== 0 && status !== 200) {
          console.error('Got HTTP status ' + status + ' trying to load icon ' +
                        icon);
          if (request.onerror) {
            request.onerror();
          }
          return;
        }

        if (request.onsuccess) {
          request.onsuccess(xhr.response);
        }
      };

      xhr.ontimeout = xhr.onerror = function onerror(evt) {
        console.error(evt.type, ' while HTTP GET: ', icon);
        if (request.onerror) {
          request.onerror();
        }
      };

      try {
        xhr.send(null);
      } catch (evt) {
        console.error('Got an exception when trying to load icon "' + icon +
              ' +" falling back to cached icon. Exception is: ' + evt.message);
        if (request.onerror) {
          request.onerror();
        }
      }
    },

    _bestMatchingIcon:
    function appBestMatchingIcon(app, manifest, preferredSize) {
      preferredSize = preferredSize || Number.MAX_VALUE;

      var max = 0;
      var closestSize = 0;

      for (var size in manifest.icons) {
        size = parseInt(size, 10);
        if (size > max) {
          max = size;
        }
        if (!closestSize && size >= preferredSize) {
          closestSize = size;
        }
      }

      if (! closestSize) {
        closestSize = max;
      }

      var url = manifest.icons[closestSize];
      if (url.indexOf('data:') == 0 ||
          url.indexOf('app://') == 0 ||
          url.indexOf('http://') == 0 ||
          url.indexOf('https://') == 0) {
        return url;
      }
      if (url.charAt(0) != '/') {
        console.warn('`' + manifest.name + '` app icon is invalid. ' +
                     'Manifest `icons` attribute should contain URLs -or- ' +
                     'absolute paths from the origin field.');
        return '';
      }

      if (app.origin.slice(-1) == '/')
        return app.origin.slice(0, -1) + url;

      return app.origin + url;
    },

    ready: function appReady(callback) {
      if (this._ready) {
        window.setTimeout(callback);
      } else {
        this._readyCallbacks.push(callback);
      }
    },

    init: function appInit(callback) {
      var appMgmt = navigator.mozApps.mgmt;
      var self = this;

      appMgmt.getAll().onsuccess = function onsuccess(event) {
        event.target.result.forEach(function eachApp(app) {
          var manifest = app.manifest;
          if (!app.launch || !manifest || !manifest.icons ||
              self._isHiddenApp(manifest.role)) {
            return;
          }
          self.installedApps[app.origin] = app;
        });

        self._ready = true;

        if (callback) {
          callback();
        }

        while(self._readyCallbacks.length) {
          setTimeout(self._readyCallbacks.shift());
        }
      };

      appMgmt.oninstall = function(evt) {
        var app = evt.application;
        var manifest = app.manifest || app.updateManifest;

        if (!app.launch || !manifest || !manifest.icons ||
            self._isHiddenApp(manifest.role)) {
          return;
        }

        var message = self.installedApps[app.origin] ? 'update' : 'install';
        self.installedApps[app.origin] = app;
        self.fire(message, self.getAppEntries(app.origin));
      };

      appMgmt.onuninstall = function(evt) {
        var app = evt.application;
        if (self.installedApps[app.origin]) {
          delete self.installedApps[app.origin];
          self.fire('uninstall', self.getAppEntries(app.origin));
        }
      };
    },

    uninit: function appUninit() {
      var appMgmt = navigator.mozApps.mgmt;
      appMgmt.oninstall = null;
      appMgmt.onuninstall = null;

      this.installedApps = {};
      this._ready = false;
      this._readyCallbacks = [];
    },

    getAppEntries: function appGetAppEntries(origin) {
      if (!origin || !this.installedApps[origin]) {
        return [];
      }

      var manifest = this.installedApps[origin].manifest ||
        this.installedApps[origin].updateManifest;
      var entryPoints = manifest.entry_points;
      var entries = [];

      if (!entryPoints || manifest.type !== 'certified') {
        entries.push({
          origin: origin,
          entry_point: '',
          name: manifest.name
        });
      } else {
        for (var entryPoint in entryPoints) {
          if (entryPoints[entryPoint].icons) {
            entries.push({
              origin: origin,
              entry_point: entryPoint,
              name: entryPoints[entryPoint].name
            });
          }
        }
      }

      return entries;
    },

    getAllEntries: function appGetAllEntries() {
      if (!this._ready) {
        return null;
      }

      var entries = [];
      for (var origin in this.installedApps) {
        entries.push.apply(entries, this.getAppEntries(origin));
      }
      return entries;
    },

    launch: function appLaunch(origin, entryPoint) {
      var installedApps = this.installedApps;

      if (!origin || !installedApps[origin] || !installedApps[origin].launch) {
        return false;
      }

      entryPoint = entryPoint || '';
      installedApps[origin].launch(entryPoint);

      return true;
    },

    getEntryManifest: function appGetEntryManifest(origin, entryPoint) {
      if (!origin || !this.installedApps[origin]) {
        return null;
      }

      var manifest = this.installedApps[origin].manifest ||
        this.installedApps[origin].updateManifest;

      if (entryPoint) {
        var entry_manifest = manifest.entry_points[entryPoint];
        return entry_manifest || null;
      }

      return manifest;
    },

    getName: function appGetName(origin, entryPoint) {
      var entry_manifest = this.getEntryManifest(origin, entryPoint);
      if (!entry_manifest) {
        return '';
      }
      return entry_manifest.name;
    },

    getIconBlob:
    function appGetIconBlob(origin, entryPoint, preferredSize, callback) {
      var entry_manifest = this.getEntryManifest(origin, entryPoint);
      if (! entry_manifest) {
        return false;
      }

      var url = this._bestMatchingIcon(
        this.installedApps[origin], entry_manifest, preferredSize);

      if (!url) {
        if (callback) {
          setTimeout(callback);
        }
        return true;
      }

      this._loadIcon({
        url: url,
        onsuccess: function(blob) {
          if (callback) {
            callback(blob);
          }
        },
        onerror: function() {
          if (callback) {
            callback();
          }
        }
      });

      return true;
    }
  });

  exports.Applications = Applications;
})(window);
