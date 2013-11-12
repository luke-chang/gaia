window.onload = function() {
  var btnSend = document.getElementById('send');
  var selDelay = document.getElementById('delay');

  btnSend.style.fontSize = '50px';
  selDelay.style.fontSize = '50px';

  btnSend.onclick = function() {
    setTimeout(function() {
      navigator.mozApps.getSelf().onsuccess = function(evt) {
        var app = evt.target.result;
        var iconURL = NotificationHelper.getIconURI(app);
        NotificationHelper.send(app.manifest.name, 'Test', iconURL, function() {
          app.launch();
        });
      }
    }, selDelay.value * 1000);
  };
};
