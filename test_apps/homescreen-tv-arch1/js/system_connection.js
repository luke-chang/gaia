'use strict';

/* globals SystemConnection */

(function(exports) {
  var SystemConnection = function() {
    window.addEventListener('iac-system-response', this);
  };

  // Homescreen app should send request object like this
  // {
  //   requestId: ‘87548a9b-3e64-4aca-9366-f4856e5f7a65’,
  //   action: ‘add’,
  //   args: {
  //     x: 220,
  //     y: 10,
  //     w: 200,
  //     h: 150,
  //     widgetOrigin: 'app://widget.gaiamobile.org/',
  //     widgetEntryPoint: 'entry'
  //   }
  // }
  // and shoould expect incoming array of response objects like
  // [{
  //   requestId: ‘87548a9b-3e64-4aca-9366-f4856e5f7a65’,
  //   action: 'add',
  //   result: true,
  //   widgetId: ‘widget-idY’
  // }]
  SystemConnection.prototype = {
    start: function sc_start() {
      console.log('SystemConnection started!');
      return this;
    },
    stop: function sc_stop() {
      console.log('SystemConnection stopped!');
    },
    handleEvent: function sc_handleEvent(evt) {
      var messageObject = evt.detail;
      console.log('received system-response message: [' +
        JSON.stringify(messageObject) + ']');
      // TODO: validation
      if (messageObject && messageObject.requestId) {
        this._removeUnrespondRequest(messageObject.requestId);
      }
      window.dispatchEvent(
        new CustomEvent('system-action-object', {'detail': [messageObject]}));
    },
    _unrespondRequests: [],
    _removeUnrespondRequest: function sc_removeUnrespondRequest(requestId) {
      var that = this;
      try {
        this._unrespondRequests.forEach(function(value, index) {
          if (value.requestId === requestId) {
            that._unrespondRequests.splice(index, 1);
            throw new Error('Break');
          }
        });
      } catch (e) {
        if (e.message !== 'Break') {
          throw e;
        }
      }
    },
    _sendMessage: function sc_sendMessage(
        message, successCallback, errorCallback) {
      navigator.mozApps.getSelf().onsuccess = function(evt) {
        var app = evt.target.result;
        app.connect('homescreen-request').then(function onConnAccepted(ports) {
          ports.forEach(function(port) {
            port.postMessage(message);
          });
          if (typeof successCallback === 'function') {
            successCallback(message);
          }
        }, function onConnRejected(reason) {
          console.log('connection rejected due to: ' + reason);
          if (typeof errorCallback === 'function') {
            errorCallback(reason, message);
          }
        });
      };
    },
    _waitForResponse: function sc_waitForResponse(requestObject) {
      this._unrespondRequests.push(requestObject);
    },
    _packRequestObject: function sc_packRequestObject(action, args) {
      if (args) {
        return {
          requestId: uuid.v4(),
          action: action,
          args: args
        };
      } else {
        return {
          requestId: uuid.v4(),
          action: action
        };
      }
    },
    _commonAction: function sc_commonAction(action, args) {
      var requestObject = this._packRequestObject(action, args);
      this._sendMessage(requestObject, this._waitForResponse.bind(this));
      return requestObject.requestId;
    },
    addWidget: function sc_addWidget(args) {
      return this._commonAction('add', args);
    },
    removeWidget: function sc_removeWidget(args) {
      return this._commonAction('remove', args);
    },
    updateWidget: function sc_updateWidget(args) {
      return this._commonAction('update', args);
    },
    showAll: function sc_showAll() {
      return this._commonAction('showall');
    },
    hideAll: function sc_hideAll() {
      return this._commonAction('hideall');
    }
  };
  exports.SystemConnection = SystemConnection;
}(window));
window.systemConnection = new SystemConnection().start();
