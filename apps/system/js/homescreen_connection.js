'use strict';

/* globals HomescreenConnection, IACHandler*/

(function(exports) {
  var HomescreenConnection = function() {
    window.addEventListener('iac-homescreen-request', this);
  };

  // System app should expect incoming array of request objects like
  // [{
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
  // }]
  // and should response with something like this
  // {
  //   requestId: ‘87548a9b-3e64-4aca-9366-f4856e5f7a65’,
  //   action: add,
  //   result: true,
  //   widgetId: ‘widget-idY’
  // }
  HomescreenConnection.prototype = {
    start: function hc_start() {
      console.log('HomescreenConnection started!');
      return this;
    },
    stop: function hc_stop() {
      console.log('HomescreenConnection stopped!');
    },
    handleEvent: function hc_handleEvent(evt) {
      var messageObject = evt.detail;
      console.log('received homescreen-request message:[' +
        JSON.stringify(messageObject) + ']');
      // TODO: validate request action object
      if (messageObject && messageObject.requestId) {
        this._unrespondRequests.push(messageObject);
      }
      window.dispatchEvent(
        new CustomEvent('homescreen-action-object',
          {'detail': [messageObject]}));
    },
    _unrespondRequests: [],
    _removeUnrespondRequest: function sc_removeUnrespondRequest(requestObject) {
      var that = this;
      try {
        this._unrespondRequests.forEach(function(value, index) {
          if (value.requestId === requestObject.requestId) {
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
    _sendMessage: function hc_sendMessage(
        message, successCallback, errorCallback) {
      var port;
      try {
        port = IACHandler.getPort('homescreen-request');
        port.postMessage(message);
        if (typeof successCallback === 'function') {
          successCallback(message);
        }
      } catch (e) {
        if (typeof errorCallback === 'function') {
          errorCallback(e.message, message);
        }
      }
    },
    _packResponseObject: function hc_packResponseObject(
        requestId, action, result, widgetId) {
      if (widgetId) {
        return {
          requestId: requestId,
          action: action,
          result: result,
          widgetId: widgetId
        };
      } else {
        return {
          requestId: requestId,
          action: action,
          result: result
        };
      }
    },
    confirm: function hc_confirm(requestId, action, widgetId) {
      this._sendMessage(
        this._packResponseObject(requestId, action, true, widgetId),
        this._removeUnrespondRequest.bind(this));
    },
    deny: function hc_deny(requestId, action, widgetId) {
      this._sendMessage(
        this._packResponseObject(requestId, action, false, widgetId));
    },
    response: function hc_response(result, requestId, action, widgetId) {
      if (result) {
        this.confirm(requestId, action, widgetId);
      } else {
        this.deny(requestId,action,widgetId);
      }
    }
  };
  exports.HomescreenConnection = HomescreenConnection;
}(window));
window.homescreenConnection = new HomescreenConnection().start();
