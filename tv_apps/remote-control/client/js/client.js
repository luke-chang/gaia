/* global $ */
'use strict';

$(function() {
  function AJAX(url) {
    this.url = url;
    this.onmessage = null;
    this.readyState = 1;
  }

  AJAX.prototype.send = function(message) {
    var self = this;
    $.ajax(self.url, {
      method: 'get',
      data: {
        'message': message.toString()
      },
      dataType: 'text',
      success: function(data) {
        if (data && self.onmessage) {
          self.onmessage({
            data: data
          });
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log('Ajax Error: ' + errorThrown);
      }
    });
  };

  //////////////////////////////////////

  var protocols = {
    socket: new WebSocket('ws://localhost:8080/', 'echo-protocol'),
    ajax: new AJAX('ajax.sjs')
  };

  $.each(protocols, function(key, value) {
    value.onmessage = function(evt) {
      var data = evt.data;
      console.log(key + ' echo: ' + data);
    };
  });

  function sendMessage(type, detail) {
    var protocol = protocols[$('input[name="protocol"]:checked').val()];
    if(protocol.readyState != 1) {
      console.log('ERROR: readyState=' + protocol.readyState);
      return;
    }

    var data = {
      type: type,
      detail: $.isPlainObject(detail) ? detail : detail.toString()
    };

    console.log(data);
    protocol.send(JSON.stringify(data));
  }

  //////////////////////////////////////

  $('#btnEcho').click(function() {
    sendMessage('echo', new Date());
  });

  $('#secKeyboard button').click(function() {
    sendMessage('keypress', $(this).data('key'));
  });

  $('#secInput input').keydown(function(evt) {
    if (evt.keyCode == 13) {
      $('#sendString').triggerHandler('click');
      return false;
    }
  });

  $('#sendString').click(function() {
    var string = $('#secInput input').val();
    sendMessage('input', {
      clear: true,
      string: string
    });
    $('#secInput input').focus().val('').val(string);
  });

  $('#clearString').click(function() {
    sendMessage('input', {
      clear: true
    });
    $('#secInput input').focus().val('');
  });

  /////////////////////////////////////

  $('#touchPanel').touchPanel().on('touchPanel:action', function(evt, data) {
    sendMessage(data.type, data.detail);
  });
});
