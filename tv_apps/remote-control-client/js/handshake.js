/* global Secure */
'use strict';

(function(exports) {
  function init() {
    exports.setCookie('uuid', '', -1);

    var secure = new Secure();
    secure.handshake().then(function(needPair) {
      window.location.href = needPair ? 'pairing.html' : 'client.html';
    }).catch(function(err) {
      var divMessage = document.getElementById('handshake-information');
      divMessage.textContent = '[ERROR]' + err;
      divMessage.classList.add('error');

      var btnRestart = document.getElementById('restart-handshaking');
      btnRestart.classList.remove('hidden');
      btnRestart.addEventListener('click', function() {
        window.location.reload();
      });
    });
  }

  exports.ready(init);
}(window));
