'use strict';

window.addEventListener('load', function() {
  var activity;

  output('mozHasPendingMessage: ' + navigator.mozHasPendingMessage('activity'));

  function output(message) {
    var div = document.getElementById('output');
    div.innerHTML += message + "<br>";
    console.log('just-test: ' + message);
  }

  navigator.mozSetMessageHandler('activity', function(request) {
    activity = request;
    output(activity.source.name + ', data: ' + JSON.stringify(activity.source.data));
  });

  document.getElementById('btnClose').addEventListener('click', function() {
    if (activity) {
      activity.postResult({
        type: 'inline',
        text: 'just-test'
      });
    } else {
      window.close();
    }
  });
});
