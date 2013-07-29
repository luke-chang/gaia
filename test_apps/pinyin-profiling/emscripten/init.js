window.addEventListener('load', function() {
  var head = document.getElementsByTagName('head')[0];
  var settings = {
    path: '.'
  };

  function r() {
    return '?' + Math.random();
  }

  // chewing_files.js and chewing_init.js must be loaded before libchewing.js.
  chewing_files = document.createElement('script');
  chewing_files.src = settings.path + '/empinyin_files.js' + r();
  head.appendChild(chewing_files);

  chewing_files = document.createElement('script');
  chewing_files.src = settings.path + '/jspinyin_init.js' + r();
  head.appendChild(chewing_files);

  chewing_files = document.createElement('script');
  chewing_files.src = settings.path + '/libpinyin.js' + r();
  head.appendChild(chewing_files);
});
