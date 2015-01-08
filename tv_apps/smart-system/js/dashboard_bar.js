/* global homescreenWindowManager, AppWindowManager */
'use strict';

(function(exports) {
  function DashboardBar() {
    this._dashboardBar = null;
  }

  DashboardBar.prototype = {
    CLASS_NAME: 'DashboardBar',
    EVENT_PREFIX: 'dashboardbar-',

    start: function db_start() {
      this._dashboardBar = document.getElementById('dashboard-bar');
      window.addEventListener('homescreenwillopen', this);
      window.addEventListener('holdhome', this);
    },

    stop: function db_stop() {
      window.removeEventListener('homescreenwillopen', this);
      window.removeEventListener('holdhome', this);
      this._dashboardBar = null;
    },

    show: function db_show() {
      if (!this.isShown()) {
        homescreenWindowManager.closeHomeApp();
        this._dashboardBar.hidden = false;
        document.activeElement.blur();
        // Specify an element in the dashboard bar to be focused. Like:
        // this._SOMEWHERE.focus();
      }
    },

    hide: function db_hide() {
      if (this.isShown()) {
        this._dashboardBar.hidden = true;
        document.activeElement.blur();
        AppWindowManager.getActiveApp().focus();
      }
    },

    isShown: function db_isShown() {
      return !this._dashboardBar.hidden;
    },

    publish: function db_publish(event, detail) {
      var evt = new CustomEvent(this.EVENT_PREFIX + event, {
        bubbles: true,
        cancelable: false,
        detail: detail || this
      });

      window.dispatchEvent(evt);
    },

    handleEvent: function db_handleEvent(evt) {
      switch (evt.type) {
        case 'homescreenwillopen':
          this.hide();
          break;
        case 'holdhome':
          if (this.isShown()) {
            this.hide();
          } else {
            this.show();
          }
          break;
      }
    }
  };

  exports.DashboardBar = DashboardBar;
}(window));
