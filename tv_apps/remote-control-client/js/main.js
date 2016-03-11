'use strict';

(function(exports) {
  var DEBUG = false;

  var XHRPort = 8080;

  // Polyfill for Safari
  if (!navigator.languages) {
    var language = navigator.language.split('-', 2);
    if (language[1].length == 2) {
      language = language[0].toLowerCase() + '-' + language[1].toUpperCase();
    } else {
      language = language[0].toLowerCase() + '-' +
        language[1].charAt(0).toUpperCase() +
        language[1].substring(1).toLowerCase();
    }
    navigator.languages = [language];
  }

  exports.generateURL = function(path) {
    return window.location.protocol + '//' +
           window.location.hostname + ':' + XHRPort + path;
  };

  exports.ready = function(handler) {
    var handled = false;
    function wrapper() {
      if (!handled) {
        handled = true;
        document.removeEventListener('DOMContentLoaded', wrapper);
        document.removeEventListener('load', wrapper);
        handler();
      }
    }
    document.addEventListener('DOMContentLoaded', wrapper);
    document.addEventListener('load', wrapper);
  };

  exports.sendMessage = function(url, data, success, error) {
    if (typeof data !== 'object') {
      data = {};
    }

    var param = [];
    for (var name in data) {
      param.push(encodeURIComponent(name) + '=' +
        encodeURIComponent(data[name]));
    }

    var paramString = param.length ? '?' + param.join('&') : '';
    var finalURL = encodeURI(url) + paramString;

    if (DEBUG) {
      console.log('Ajax URL: ' + finalURL);
    }

    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', finalURL, true);
      xhr.onload = function() {
        if (xhr.status === 200) {
          var data = xhr.responseText;
          if (DEBUG) {
            console.log('Ajax response: ' + data);
          }
          if (success) {
            success(data ? JSON.parse(data) : undefined);
          }
        } else {
          if (DEBUG) {
            console.error('Ajax error: ' + xhr.status);
          }
          if (error) {
            error(xhr.status);
          }
        }
      };
      xhr.send();
    } catch(err) {
      if (DEBUG) {
        console.error('Ajax error: ' + err.name);
      }
      if (error) {
        error(err.name);
      }
    }
  };

  exports.setCookie = function(key, value, expires, path) {
    var cookie = [];
    cookie.push(encodeURIComponent(String(key)) + '=' +
      encodeURIComponent(String(value || '')));
    if (typeof expires === 'number') {
      cookie.push('expires=' +
        new Date(Date.now() + expires * 864e+5).toUTCString());
    }
    if (path) {
      cookie.push('path=' + encodeURI(path));
    }
    document.cookie = cookie.join('; ');
  };

  exports.getCookie = function(key) {
    var value;
    document.cookie.split(/; */).some(function(cookie) {
      var token = cookie.split('=');
      if (decodeURIComponent(token[0]) === key) {
        value = decodeURIComponent(token[1]);
        return true;
      }
    });
    return value;
  };
}(window));
