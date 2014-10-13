window.addEventListener('load', function() {
  debug('onload');

  function debug(msg) {
    console.log('luke: ' + msg);
  }

  function handleEvent(evt) {
    debug(evt.type);

    switch(evt.type) {
      case 'resize':
      case 'orientationchange':
        var ret = screen.mozLockOrientation('landscape');
        debug('mozLockOrientation(landscape) in test-app: ' + ret);
        break;
    }
  }

  window.addEventListener('resize', handleEvent);
  window.addEventListener('orientationchange', handleEvent);
  window.addEventListener('visibilitychange', handleEvent);

  var audio = new Audio();
  audio.loop = true;
  audio.src = 'g_128orig.mp3';

  document.getElementById('btnPlay').addEventListener('click', function() {
    if(this.checked) {
      audio.play();
    } else {
      audio.pause();
    }
  });
});
