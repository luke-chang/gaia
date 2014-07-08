(function(window) {
  var currentManifestURL = '';
  var instance = undefined;
  var _inited = false;

  /**
   * HomescreenLauncher is responsible to launch the homescreen window
   * instance and make sure it's a singleton.
   *
   * Every extermal modules should use
   * <code>HomescreenLauncher.getHomescreen()</code>
   * to access the homescreen window instance.
   *
   * @example
   * var home = HomescreenLauncher.getHomescreen();
   * home.open(); // Do the open animation.
   *
   * @module HomescreenLauncher
   */
  var HomescreenLauncher = {
    ready: false,

    get origin() {
      // We don't really care the origin of homescreen,
      // and it may change when we swap the homescreen app.
      // So we use a fixed string here.
      // XXX: We shall change WindowManager to use manifestURL
      // to identify an app.
      // See http://bugzil.la/913323
      return 'homescreen';
    },

    /**
     * Init process
     * ![Homescreen launch process](http://i.imgur.com/JZ1ibkc.png)
     *
     * @memberOf module:HomescreenLauncher
     */
    init: function hl_init() {
      if (_inited)
        return;

      _inited = true;

      var self = this;
      if (Applications.ready) {
        this.fetchSettings();
      } else {
        window.addEventListener('applicationready', function onAppReady() {
          window.removeEventListener('applicationready', onAppReady);
          self.fetchSettings();
        });
      }

      window.addEventListener('trusteduishow', this);
      window.addEventListener('trusteduihide', this);
      window.addEventListener('appopening', this);
      window.addEventListener('cardviewbeforeshow', this);
      window.addEventListener('cardviewbeforeclose', this);
    },

    /**
     * General event handler interface.
     *
     * @param  {DOMEvent} evt The event.
     * @type {boolean}
     */
    handleEvent: function hl_handleEvent(evt) {
      switch (evt.type) {
        case 'trusteduishow':
          console.log('bug1032693: fadeIn() in trusteduishow');
          this.getHomescreen().toggle(true);
          this.getHomescreen().fadeIn();
          break;
        case 'trusteduihide':
          this.getHomescreen().toggle(false);
          break;
        case 'appopening':
          // Fade out homescreen if the opening app is landscape.
          if (evt.detail.rotatingDegree === 90 ||
              evt.detail.rotatingDegree === 270) {
            console.log('bug1032693: fadeOut() in appopening');
            this.getHomescreen().fadeOut();
          }
          break;
        case 'cardviewbeforeshow':
          // Fade out the homescreen before showing the cards view to avoid
          // having it bleed through during the transition animation.
          console.log('bug1032693: fadeOut() in cardviewbeforeshow');
          this.getHomescreen().fadeOut();
          break;
        case 'cardviewbeforeclose':
          // Fade homescreen back in before the cards view closes.
          console.log('bug1032693: fadeIn() in cardviewbeforeclose');
          this.getHomescreen().fadeIn();
          break;
      }
    },

    fetchSettings: function hl_fetchSettings() {
      var self = this;
      SettingsListener.observe('homescreen.manifestURL', '',
        function onRetrievingHomescreenManifestURL(value) {
          var previousManifestURL = currentManifestURL;
          currentManifestURL = value;
          if (typeof(instance) !== 'undefined') {
            if (previousManifestURL !== '' &&
                previousManifestURL !== currentManifestURL) {
              instance.kill();
              instance = new HomescreenWindow(value);
              // Dispatch 'homescreen is changed' event.
              window.dispatchEvent(new CustomEvent('homescreen-changed'));
            } else {
              instance.ensure();
            }
          }

          self.ready = true;
          window.dispatchEvent(new CustomEvent('homescreen-ready'));
        });
    },

    getHomescreen: function hl_getHomescreen() {
      if (currentManifestURL === '') {
        console.warn('HomescreenLauncher: not ready right now.');
        return null;
      }
      if (typeof instance == 'undefined') {
        instance = new HomescreenWindow(currentManifestURL);
        return instance;
      } else {
        instance.ensure();
        return instance;
      }
    }
  };

  window.HomescreenLauncher = HomescreenLauncher;
}(this));
