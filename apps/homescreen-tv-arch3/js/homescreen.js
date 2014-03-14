'use strict';

(function() {
  function init() {
    AppList.init(function(docFragment) {
      document.getElementById('app_list').appendChild(docFragment);
    });

    document.addEventListener('contextmenu', function(evt) {
      evt.preventDefault();
    });
  }

  window.addEventListener('load', init);
})();
