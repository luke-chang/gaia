/* global jQuery */
'use strict';

(function($) {
  var AJAX_URL = 'client.sjs';
  var DEBUG = true;

  function sendMessage(type, detail, success, error) {
    var data = {
      type: type,
      detail: $.isPlainObject(detail) ? detail : detail.toString()
    };

    if (DEBUG) {
      console.log(JSON.stringify(data));
    }

    $.ajax(AJAX_URL, {
      method: 'get',
      data: {
        message: data
      },
      dataType: 'text',
      success: function(data) {
        if (success) {
          success(data);
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        if (DEBUG) {
          console.error('Ajax Error: ' + errorThrown);
        }
        if (error) {
          error(jqXHR, textStatus, errorThrown);
        }
      }
    });
  }

  $(document).ready(function() {
    $('#input-string').keydown(function(evt) {
      switch(evt.keyCode) {
        case 13: //Enter
          $('#send-string').triggerHandler('click');
          break;
        case 27: //Escape
          $('#input-string').val('');
          break;
        default:
          return true;
      }
      return false;
    });

    $('#send-string').click(function() {
      var string = $('#input-string').val();
      sendMessage('input', {
        clear: true,
        string: string
      });
      $('#input-string').focus().val('').val(string);
    });

    /////////////////////////////////////

    $('#touch-panel').touchPanel({
      touchingClass: 'touching',
      handler: sendMessage
    });

    $('#scroll-panel').touchPanel({
      touchingClass: 'touching',
      dblClickTimeThreshold: 0,
      clickTimeThreshold: 0,
      clickMoveThreshold: 0,
      handler: function(type, detail) {
        sendMessage(type.replace('touch', 'scroll'), detail);
      }
    });

    /////////////////////////////////////

    $('#section-buttons .button').click(function() {
      if ($(this).data('key')) {
        sendMessage('keypress', $(this).data('key'));
      }
    });
  });
}(jQuery));
