'use strict';

(function() {
  function init() {
    var appList = document.getElementById('app_list');

    AppList.init(function(docFragment) {
      document.getElementById('app_list_container').appendChild(docFragment);
    });

    document.addEventListener('visibilitychange', function(evt) {
      if(document.visibilityState == 'visible') {
        appList.style.display = 'none';
      }
    });

    document.addEventListener('contextmenu', function(evt) {
      evt.preventDefault();
    });

    document.getElementById('app_list_open_button').addEventListener('click',
      function() {
        appList.style.display = 'block';
      }
    );

    document.getElementById('app_list_close_button').addEventListener('click',
      function() {
        appList.style.display = 'none';
      }
    );
  }

  window.addEventListener('load', init);
})();
