/* global TouchPanel */
'use strict';

(function(exports) {
  var AJAX_URL = 'client.sjs';
  var DEBUG = false;

  function sendMessage(type, detail, success, error) {
    var data = {
      type: type,
      detail: (typeof detail === 'object') ? detail : detail.toString()
    };

    if (DEBUG) {
      console.log('send: ' + JSON.stringify(data));
    }

    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', encodeURI(AJAX_URL + '?message=' + JSON.stringify(data)));
      xhr.onload = function() {
        if (xhr.status === 200) {
          var data = xhr.responseText;
          if (DEBUG) {
            console.log('Ajax response: ' + data);
          }
          if (success) {
            success(data);
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
  }

  function init() {
    var input = document.getElementById('input-string');
    var btnSend = document.getElementById('send-string');

    input.addEventListener('keydown', function(evt) {
      switch(evt.keyCode) {
        case 13: //Enter
          btnSend.click();
          break;
        case 27: //Escape
          input.value = '';

          // Workaround Firefox's bug
          input.blur();
          input.focus();
          break;
        default:
          return true;
      }
      return false;
    });

    btnSend.addEventListener('click', function() {
      sendMessage('input', {
        clear: true,
        string: input.value
      });
      input.select();
    });

    /* jshint nonew: false */
    new TouchPanel(document.getElementById('touch-panel'), {
      touchingClass: 'touching',
      dblClickTimeThreshold: 0,
      handler: sendMessage
    });

    /* jshint nonew: false */
    new TouchPanel(document.getElementById('scroll-panel'), {
      touchingClass: 'touching',
      dblClickTimeThreshold: 0,
      clickTimeThreshold: 0,
      clickMoveThreshold: 0,
      handler: function(type, detail) {
        sendMessage(type.replace('touch', 'scroll'), detail);
      }
    });

    var buttonOnClick = function() {
      var key = this.dataset.key;
      if (key) {
        sendMessage('keypress', key);
      } else if (this.id == 'pin-to-home') {
        sendMessage('custom', {
          action: 'pin-to-home'
        });
      }
    };

    var buttons = document.querySelectorAll('#section-buttons .button');
    [].slice.call(buttons).forEach(function(elem) {
      elem.addEventListener('click', buttonOnClick);
    });
  }

  (function(handler) {
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
  }(init));
}(window));
