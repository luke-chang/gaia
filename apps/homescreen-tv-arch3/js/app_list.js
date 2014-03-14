'use strict';

(function() {
  var HIDDEN_ROLES = ['system', 'input', 'homescreen', 'search'];

  var apps = {};
  var ready = false;

  function init(callback) {
    var linkList = document.createElement('ul');
    linkList.id = 'links';

    navigator.mozApps.mgmt.getAll().onsuccess = function onsuccess(event) {
      event.target.result.forEach(function eachApp(app) {
        var manifest = app.manifest;

        if (!app.launch || !manifest || !manifest.launch_path ||
            !manifest.icons || isHiddenApp(manifest.role)) {
          return;
        }

        var entryPoints = manifest.entry_points;
        if (!entryPoints || manifest.type !== 'certified') {
          linkList.appendChild(createLinkNode(app, null));
        } else {
          for (var entryPoint in entryPoints) {
            if (entryPoints[entryPoint].icons) {
              linkList.appendChild(createLinkNode(app, entryPoint));
            }
          }
        }

        apps[app.origin] = app;
      });

      ready = true;

      if (callback) {
        callback(linkList);
      }
    };
  }

  function createLinkNode(app, entryPoint) {
    var iconsAndNameHolder =
      entryPoint ? app.manifest.entry_points[entryPoint] : app.manifest;

    var li = document.createElement('li');
    var link = document.createElement('a');
    var imgIcon = new Image();

    imgIcon.className = 'icon';
    imgIcon.src = '/style/images/default.png';
    link.href = app.origin;
    link.className = 'app_link';
    link.dataset.origin = app.origin;
    link.dataset.entry_point = entryPoint || '';
    link.appendChild(imgIcon);
    link.appendChild(document.createTextNode(iconsAndNameHolder.name));
    link.addEventListener('click', iconTapHandler);
    li.appendChild(link);

    loadIcon({
      url: bestMatchingIcon(app, iconsAndNameHolder),
      onsuccess: function(blob) {
        imgIcon.src = window.URL.createObjectURL(blob);
      }
    });

    return li;
  }

  function iconTapHandler(evt) {
    evt.preventDefault();
    apps[this.dataset.origin].launch(this.dataset.entry_point);
  }

  function loadIcon(request) {
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
  }

  function bestMatchingIcon(app, manifest) {
    var max = 0;
    for (var size in manifest.icons) {
      size = parseInt(size, 10);
      if (size > max) {
        max = size;
      }
    }

    var url = manifest.icons[max];
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
  }

  function isHiddenApp(role) {
    if (!role) {
      return false;
    }
    return (HIDDEN_ROLES.indexOf(role) !== -1);
  }

  window.AppList = {
    init: init,
    ready: function() {
      return ready;
    }
  };
})();
