'use strict';
/* global AppWindowManager, AirplaneMode, StatusBar, KeyboardManager,
          MozActivity */
/* jshint nonew: false */

(function(exports) {
  /**
   * PopupManager implements window.open at the gaia system level. Only one
   * popup at a time. Completely modal at the moment.
   *
   * WrapperFactory has a higher priority than PopupManager on receiving
   * mozbrowseropenwindow event in order to handle a remote window opening.
   *
   * @class PopupManager
   */
  function PopupManager() {
  }

  PopupManager.prototype = {
    /**
     * Current exist popups in the system. It records the iframe node of each
     * popup and indexed by the caller app origin.
     * @access private
     * @type {Object}
     * @memberof PopupManager.prototype
     */
    _currentPopup: {},

    /**
     * The origin of the current active app.
     * @access private
     * @type {String}
     * @memberof PopupManager.prototype
     */
    _currentOrigin: '',

    /**
     * Initialize members and register all event handlers.
     * @memberof PopupManager.prototype
     */
    init: function pm_init() {
      this.throbber = document.getElementById('popup-throbber');
      this.overlay = document.getElementById('dialog-overlay');
      this.popupContainer = document.getElementById('popup-container');
      this.container = document.getElementById('frame-container');
      this.screen = document.getElementById('screen');
      this.closeButton = document.getElementById('popup-close');
      this.errorTitle = document.getElementById('popup-error-title');
      this.errorMessage = document.getElementById('popup-error-message');
      this.errorReload = document.getElementById('popup-error-reload');
      this.errorBack = document.getElementById('popup-error-back');
      this.title = document.getElementById('popup-title');

      window.addEventListener('mozbrowseropenwindow', this);
      window.addEventListener('mozbrowserclose', this);
      window.addEventListener('appwillclose', this);
      window.addEventListener('appopen', this);
      window.addEventListener('appterminated', this);
      window.addEventListener('home', this);
      window.addEventListener('keyboardhide', this);
      window.addEventListener('keyboardchange', this);
      this.closeButton.addEventListener('click', this);
      this.errorReload.addEventListener('click', this);
      this.errorBack.addEventListener('click', this);
    },

    /**
     * Open a popup window. (Only one popup per origin at one time so we'll kill
     * previous one if it already exists.)
     * @param  {DocumentFragment} frame A DOM node representing the new iframe
     *         embedding the new content of this popup. (Pass
     *         event.detail.frameElement from mozbrowseropenwindow event here.)
     * @param  {String} origin The caller app origin of this popup.
     * @memberof PopupManager.prototype
     */
    open: function pm_open(frame, origin) {
      // Only one popup per origin at a time.
      // If the popup is being shown, we swap frames.
      if (this._currentPopup[origin]) {
        this.container.removeChild(this._currentPopup[origin]);
        delete this._currentPopup[origin];
      }

      this.title.textContent = this.getTitleFromUrl(frame.dataset.url);

      this._currentPopup[origin] = frame;

      // Reset overlay height
      this.setHeight(window.innerHeight - StatusBar.height);

      var popup = this._currentPopup[origin];
      var dataset = popup.dataset;
      dataset.frameType = 'popup';
      dataset.frameName = name;
      dataset.frameOrigin = origin;

      // this seems needed, or an override to origin in close()
      this._currentOrigin = origin;

      if (AppWindowManager.displayedApp == origin) {
        this.screen.classList.add('popup');
      }

      this.container.appendChild(popup);

      popup.addEventListener('mozbrowsererror', this);
      popup.addEventListener('mozbrowserloadend', this);
      popup.addEventListener('mozbrowserloadstart', this);
      popup.addEventListener('mozbrowserlocationchange', this);
    },

    /**
     * Close a popup window by its caller app origin.
     * @param  {String} origin Indicate which popup to kill
     * @memberof PopupManager.prototype
     */
    close: function pm_close(origin) {
      if (!this._currentPopup[origin]) {
        return;
      }

      if (origin == this._currentOrigin) {
        var self = this;
        this.popupContainer.addEventListener('transitionend',
          function wait(event) {
            self.popupContainer.removeEventListener('transitionend', wait);
            self.screen.classList.remove('popup');
            self.popupContainer.classList.remove('disappearing');
            self.container.removeChild(self._currentPopup[origin]);
            delete self._currentPopup[origin];
          });

        this.popupContainer.classList.add('disappearing');
        this._currentOrigin = '';

        // We just removed the focused window leaving the system
        // without any focused window, let's fix this.
        window.focus();
      } else {
        this.container.removeChild(this._currentPopup[origin]);
        delete this._currentPopup[origin];
      }
    },

    backHandling: function pm_backHandling() {
      this.close(this._currentOrigin);
    },

    isVisible: function pm_isVisible() {
      return (this._currentPopup[this._currentOrigin] != null);
    },

    setHeight: function pm_setHeight(height) {
      if (this.isVisible()) {
        this.overlay.style.height = height + 'px';
      }
    },

    handleEvent: function pm_handleEvent(evt) {
      switch (evt.type) {
        case 'click':
          switch (evt.target) {
            case this.closeButton:
              this.backHandling();
              break;

            case this.errorBack:
              this.backHandling();
              break;

            case this.errorReload:
              this.container.classList.remove('error');
              delete this._currentPopup[this._currentOrigin].dataset.error;
              this._currentPopup[this._currentOrigin].reload(true);
              break;
          }
          break;

        case 'mozbrowserloadstart':
          this.throbber.classList.add('loading');
          break;

        case 'mozbrowserloadend':
          this.throbber.classList.remove('loading');
          break;

        case 'mozbrowserlocationchange':
          evt.target.dataset.url = evt.detail;

          if (AppWindowManager.displayedApp !==
            evt.target.dataset.frameOrigin) {
            return;
          }

          var popup = this._currentPopup[evt.target.dataset.frameOrigin];

          if (typeof(popup) === 'undefined') {
            return;
          }

          this.title.textContent = this.getTitleFromUrl(popup.dataset.url);
          break;

        case 'mozbrowsererror':
          this._currentPopup[evt.target.dataset.frameOrigin]
            .dataset.error = true;
          this.showError();
          break;

        case 'mozbrowseropenwindow':
          var detail = evt.detail;
          var openerType = evt.target.dataset.frameType;
          var openerOrigin = evt.target.dataset.frameOrigin;

          // Only app frame is allowed to launch popup
          if (openerType !== 'window') {
            return;
          }

          // <a href="" target="_blank"> links should opened outside the app
          // itself and fire an activity to be opened into a new browser window.
          if (detail.name === '_blank') {
            new MozActivity({
              name: 'view',
              data: { type: 'url', url: detail.url }
            });
            return;
          }

          this.throbber.classList.remove('loading');

          var frame = detail.frameElement;
          frame.dataset.url = detail.url;

          this.container.classList.remove('error');
          this.open(frame, openerOrigin);

          break;

        case 'mozbrowserclose':
          if (evt && (!('frameType' in evt.target.dataset) ||
              evt.target.dataset.frameType !== 'popup')) {
            return;
          }

          this.close(evt.target.dataset.frameOrigin);
          break;

        case 'home':
          // Reset overlay height before hiding
          this.setHeight(window.innerHeight - StatusBar.height);
          this.hide(this._currentOrigin);
          break;

        case 'appwillclose':
          if (!this._currentPopup[evt.detail.origin]) {
            return;
          }

          this.hide(evt.detail.origin);
          break;

        case 'appopen':
          this._currentOrigin = evt.detail.origin;
          this.show();
          break;

        case 'appterminated':
          this.close(evt.detail.origin);
          break;

        case 'keyboardchange':
          var keyboardHeight = KeyboardManager.getHeight();
          this.setHeight(
            window.innerHeight - StatusBar.height - keyboardHeight);
          break;

        case 'keyboardhide':
          this.setHeight(window.innerHeight - StatusBar.height);
          break;
      }
    },

    showError: function pm_showError() {
      if (!('error' in this._currentPopup[this._currentOrigin].dataset)) {
        this.container.classList.remove('error');
        return;
      }

      var contentOrigin = this.getTitleFromUrl(
        this._currentPopup[this._currentOrigin].dataset.url);
      var _ = navigator.mozL10n.get;

      if (AirplaneMode.enabled) {
        this.errorTitle.textContent = _('airplane-is-on');
        this.errorMessage.textContent = _('airplane-is-turned-on',
            {name: contentOrigin});
      } else if (!navigator.onLine) {
        this.errorTitle.textContent = _('network-connection-unavailable');
        this.errorMessage.textContent =
          _('network-error', {name: contentOrigin});
      } else {
        this.errorTitle.textContent = _('error-title', {name: contentOrigin});
        this.errorMessage.textContent =
          _('error-message', {name: contentOrigin});
      }
      this.container.classList.add('error');
    },

    // This is for card view to request
    // Return nothing if the content is the same origin as opener
    // Return URL if the content is off-origin
    getOpenedOriginFromOpener: function pm_getOpenedOriginOpener(origin) {
      var opened =
        this._getOriginObject(this._currentPopup[origin].dataset.url);
      var opener = this._getOriginObject(origin);
      // Same origin means: Protocol, Domain, Port
      if (opened.protocol == opener.protocol &&
          opened.hostname == opener.hostname &&
          opened.port == opener.port) {
        return '';
      } else {
        return opened.protocol + '//' + opened.hostname;
      }
    },

    getTitleFromUrl: function pm_getTitleFromUrl(url) {
      var app = AppWindowManager.getActiveApp();
      var opened = this._getOriginObject(url);
      var opener = this._getOriginObject(app.frame.dataset.frameOrigin);
      // Same origin means: Protocol, Domain, Port
      if (opened.protocol == opener.protocol &&
          opened.hostname == opener.hostname &&
          opened.port == opener.port) {
        return app.name;
      } else {
        return opened.protocol + '//' + opened.hostname;
      }
    },

    _getOriginObject: function pm__getOriginObject(url) {
      var parser = document.createElement('a');
      parser.href = url;

      return {
        protocol: parser.protocol,
        hostname: parser.hostname,
        port: parser.port
      };
    },

    getPopupFromOrigin: function pm_getPopupFromOrigin(origin) {
      return this._currentPopup[origin];
    },

    show: function pm_show() {
      if (!this._currentPopup[this._currentOrigin]) {
        return;
      }

      this.showError();
      this.screen.classList.add('popup');

      var popup = this._currentPopup[this._currentOrigin];
      this.title.textContent = this.getTitleFromUrl(popup.dataset.url);
      popup.hidden = false;
    },

    hide: function pm_hide(origin) {
      if (!this._currentPopup[origin]) {
        return;
      }

      this.screen.classList.remove('popup');
      this._currentPopup[origin].hidden = true;
    }
  };

  exports.PopupManager = PopupManager;

  // XXX: need to be removed
  window.popupManager = new PopupManager();
  window.popupManager.init();
}(window));
