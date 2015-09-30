/* global BaseModule, Service, ModalDialog, ScreenManager, NotificationHelper */
'use strict';

(function() {
  var SuplHandler = function() {};

  SuplHandler.EVENTS = [
    'mozChromeEvent'
  ];

  BaseModule.create(SuplHandler, {
    DEBUG: false,
    name: 'SuplHandler',

    notify: function(detail) {
      this.debug('Notify: ' + detail.id);

      NotificationHelper.send('supl-notification-title', {
        bodyL10n: 'supl-notification-message',
        icon: 'style/supl_handler/images/location.png',
        tag: 'supl-notification',
        mozbehavior: {
          showOnlyOnce: true
        }
      }).then((notification) => {
        notification.addEventListener('click', () => {
          CarrierInfoNotifier.dispatchEvent('emergencyalert');
          notification.close();
          ModalDialog.alert(
            'supl-notification-title',
            {
              id: 'supl-notification-message',
              args: {
                text: detail.text || '',
                requestorId: detail.requestorId || ''
              }
            },
            {}
          );
        });
      });
    },

    verify: function(detail) {
      this.debug('Verify: ' + detail.id);

      if (this._pendingVerification) {
        this.debug('Cancelled due to previous verification is pending.');
        return;
      }

      this._pendingVerification = detail.id;

      if (Service.locked || attentionWindowManager.hasActiveWindow()) {
        // Trigger a notification first if screen is being locked or an
        // attention window is active, otherwise the user is no way to notice
        // the dialog.
        NotificationHelper.send('supl-verification-title', {
          bodyL10n: 'supl-verification-message-for-notification',
          icon: 'style/supl_handler/images/location.png',
          tag: 'supl-verification',
          mozbehavior: {
            showOnlyOnce: true
          }
        }).then((notification) => {
          notification.addEventListener('click', () => {
            CarrierInfoNotifier.dispatchEvent('emergencyalert');
            this._pendingNotification = undefined;
            notification.close();
            this.showDialog(detail);
          });
          this._pendingNotification = notification;
        });
      } else {
        CarrierInfoNotifier.playNotification();
        this.showDialog(detail);
      }
    },

    showDialog: function(detail) {
      // Turn screen on in case device is sleeping and lockscreen is disabled.
      ScreenManager.turnScreenOn();
      ModalDialog.confirm(
        'supl-verification-title',
        {
          id: 'supl-verification-message',
          args: {
            text: detail.text || '',
            requestorId: detail.requestorId || ''
          }
        },
        {
          title: 'supl-verification-confirm',
          callback: this.sendChoice.bind(this, detail.id, true)
        },
        {
          title: 'supl-verification-cancel',
          callback: this.sendChoice.bind(this, detail.id, false)
        }
      );
    },

    sendChoice: function(id, value) {
      if (this._pendingVerification != id) {
        return;
      }

      this.debug('Choice: ' + id + ', ' + value);

      // Send the choice back via mozSettings based on Gecko's design. Set it a
      // postive id if user allows the action or set it to be negative if not.
      navigator.mozSettings.createLock().set({
        'supl.verification.choice': id * (value ? 1 : -1)
      });

      this._pendingVerification = undefined;
    },

    timeout: function(verifyId) {
      this.debug('Timeout: ' + verifyId);

      if (verifyId && this._pendingVerification == verifyId) {
        this._pendingVerification = undefined;
        if (this._pendingNotification) {
          this._pendingNotification.close();
          this._pendingNotification = undefined;
        } else {
          ModalDialog.cancelHandler && ModalDialog.cancelHandler();
        }
      }
    },

    parse: function(detail) {
      var reEncode = /(%|\\(\\|,))/g;
      var reDecode = /\%(25|2C|5C)/g;

      var encode = function(match, p1, p2) {
        return '%' + (p2 ? p2 : p1).charCodeAt(0).toString(16).toUpperCase();
      };
      var decode = function(match, p1) {
        return String.fromCharCode(parseInt(p1, 16));
      };

      var token = detail.replace(reEncode, encode).split(',', 3);

      return {
        id: parseInt(token[0], 10),
        text: token[1].replace(reDecode, decode),
        requestorId: token[2].replace(reDecode, decode)
      };
    },

    _start: function() {
      this._pendingNotification = undefined;
      this._pendingVerification = undefined;
    },

    _stop: function() {
      this.timeout(this._pendingVerification);
    },

    _handle_mozChromeEvent: function(evt) {
      var detail = evt.detail;
      switch(detail.type) {
        case 'supl-notification':
          this.notify(this.parse(detail.data));
          break;
        case 'supl-verification':
          this.verify(this.parse(detail.data));
          break;
        case 'supl-verification-timeout':
          this.timeout(this.parse(detail.data).id);
          break;
      }
    }
  });
}());
