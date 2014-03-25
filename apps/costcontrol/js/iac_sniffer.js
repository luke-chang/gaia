'use strict';

/* globals IACSniffer */

(function(exports) {
  var IACSniffer = function IACSniffer() { };
  IACSniffer.prototype = {
    _keywords: [],
    _sniffing: function iacs_sniffing(evt) {
      var message = evt.data;
      console.log(JSON.stringify(message));
    },
    start: function iacs_start(arrayOfKeywords) {
      var that = this;
      this._keywords = arrayOfKeywords || [];
      window.navigator.mozSetMessageHandler(
        'connection', function onConnected(request) {
          var port = request.port;
          port.onmessage = that._sniffing.bind(that);
        });
      console.log('IACSniffer started');
      return this;
    },
    stop: function iacs_stop() {

    }
  };
  exports.IACSniffer = IACSniffer;
}(window));

window.iacSniffer = new IACSniffer().start(['homescreen-request']);
