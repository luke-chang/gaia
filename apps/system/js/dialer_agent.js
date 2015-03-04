'use strict';

/* global SettingsListener, SettingsURL, AttentionScreen, lockScreen */
/* r=? dialer+system peers for changes in this file. */

(function(exports) {
  /**
   *
   * The delay between an incoming phone call and the first ring or vibration
   * needs to be as short as possible.
   *
   * This simple module keeps the ringtone (blob) around and starts alerting the
   * user as soon as a new incoming call is detected via the mozTelephony API.
   * And it opens an AttentionScreen with the preloaded callscreen app inside.
   *
   * We also listen for the sleep and volumedown hardware buttons to provide
   * the user with an easy way to stop the ringing.
   *
   * @example
   * var dialerAgent = new DialerAgent();
   * dialerAgent.start(); // Attach the event listeners.
   * dialerAgent.stop();  // Deattach the event listeners.
   *
   * @class    DialerAgent
   * @requires SettingsListener
   * @requires SettingsURL
   *
   **/

  var CSORIGIN = window.location.origin.replace('system', 'callscreen') + '/';

  var DialerAgent = function DialerAgent() {
    var telephony = navigator.mozTelephony;
    if (!telephony) {
      return;
    }

    this._telephony = telephony;

    this._started = false;
    this._shouldRing = null;
    this._shouldVibrate = true;
    this._alerting = false;
    this._vibrateInterval = null;
    //TCL_ZhaoLingling stop alerting when laid the phone face down
    this._ready = false;

    var player = new Audio();
    this._player = player;
    // XXX: This will need to be updated for bug 961967
    // (audio competing in system app)
    player.mozAudioChannelType = 'ringer';
    player.preload = 'metadata';
    player.loop = true;
    //ZhaoLingling for CR780486-begin
    this.blockEnabled = false;
    this.unknownEnabled = false;
    var self = this;
    SettingsListener.observe('block.enabled', false, function(value) {
      self.blockEnabled = value;
    });
    SettingsListener.observe('block.unknown.enabled', false, function(value) {
      self.unknownEnabled = value;
    });
    //ZhaoLingling for CR780486-end
  };

  DialerAgent.prototype.start = function da_start() {
    if (!this._telephony) {
      return;
    }

    if (this._started) {
      throw 'Instance should not be start()\'ed twice.';
    }
    this._started = true;

    SettingsListener.observe('audio.volume.notification', 7, function(value) {
      this._shouldRing = !!value;
      if (this._shouldRing && this._alerting) {
        this._player.play();
      }
    }.bind(this));

    SettingsListener.observe('dialer.ringtone', '', function(value) {
      var phoneSoundURL = new SettingsURL();

      this._player.pause();
      this._player.src = phoneSoundURL.set(value);

      if (this._shouldRing && this._alerting) {
        this._player.play();
      }
    }.bind(this));

    SettingsListener.observe('vibration.enabled', true, function(value) {
      this._shouldVibrate = !!value;
    }.bind(this));

    this._telephony.addEventListener('callschanged', this);

    window.addEventListener('sleep', this);
    window.addEventListener('volumedown', this);
    //TCL_ZhaoLingling  add volumeup to stop the ringing
    window.addEventListener('volumeup', this);

    //TCL_ZhaoLingling for PR 716386--begin
    window.addEventListener('iac-dialercomms', function(evt) {
      var message = evt.detail;
      if (message === 'show') {
        dialerAgent.showCallScreen();
      }
    });
    //TCL_ZhaoLingling for PR 716386--end

    this._callScreen = this._createCallScreen();
    var callScreen = this._callScreen;
    callScreen.src = CSORIGIN + 'index.html';
    callScreen.dataset.preloaded = true;
    // We need the iframe in the DOM
    AttentionScreen.attentionScreen.appendChild(callScreen);

    callScreen.setVisible(false);

    return this;
  };

  DialerAgent.prototype.stop = function da_stop() {
    if (!this._started) {
      return;
    }
    this._started = false;

    this._telephony.removeEventListener('callschanged', this);

    window.removeEventListener('sleep', this);
    window.removeEventListener('volumedown', this);
    //TCL_ZhaoLingling  add volumeup to stop the ringing
    window.removeEventListener('volumeup', this);

    // TODO: should remove the settings listener once the helper
    // allows it.
    // See bug 981373.
  };

  DialerAgent.prototype.handleEvent = function da_handleEvent(evt) {
    //ZhaoLingling for CR780486
    function handleOneCall (self, incomingCall) {
      self._openCallScreen();
      if (self._alerting || incomingCall.state !== 'incoming') {
            return;
      }
      self._startAlerting();
      //TCL_ZhaoLingling stop alerting when laid the phone face down
      SettingsListener.observe('mute.incoming.calls.enabled',
                                 true, function(value) {
        if (value) {
          window.addEventListener('devicemotion', self);
        } else {
          window.removeEventListener('devicemotion',self);
        }
      }.bind(this));

      incomingCall.addEventListener('statechange', function callStateChange() {
        incomingCall.removeEventListener('statechange', callStateChange);
        //TCL_ZhaoLingling stop alerting when laid the phone face down-begin
        window.removeEventListener('devicemotion',self);
        self._ready = false;

        self._stopAlerting();
      });
    }
    //TCL_ZhaoLingling stop alerting when laid the phone face down-begin
    if (evt.type === 'devicemotion') {
      var gSensorZ = evt.accelerationIncludingGravity.z;
      if (gSensorZ > 9.8) {
        this._ready = true;
      }
      if ((gSensorZ < -9.0) && (this._ready === true)) {
        this._stopAlerting();
        this._ready = false;
        window.removeEventListener('devicemotion',this);
      }
      return;
    }
    //TCL_ZhaoLingling stop alerting when laid the phone face down-end

    //TCL_ZhaoLingling  add volumeup to stop the ringing
    if (evt.type === 'sleep' || evt.type === 'volumedown' ||
      evt.type === 'volumeup') {
      this._stopAlerting();
      return;
    }

    if (evt.type !== 'callschanged') {
      return;
    }

    var calls = this._telephony.calls;
    //ZhaoLingling for CR780486-begin
    if (calls.length == 0) {
      return;
    }
    //BEGIN-added by gaochi.ren jrd_cd on 20150106 for PR889696
    var noGroup = true;
    if (this._telephony.conferenceGroup &&
         this._telephony.conferenceGroup.calls.length > 0) {
      noGroup = false;
    }
    //END-added by gaochi.ren jrd_cd on 20150106 for PR889696
    var callState = calls[0].state;
    if (callState === 'dialing' ||
        ((callState === 'incoming') && !this.blockEnabled)) {
      //BEGIN-modified by gaochi.ren jrd_cd on 20150106 for PR889696
      //if (calls.length == 1) {
      if (calls.length == 1 && noGroup) {
      //END-added by gaochi.ren jrd_cd on 20150106 for PR889696
        handleOneCall(this, calls[0]);
      }
    } else if (callState === 'incoming') {
      var self = this;
      var number;
      if (calls[0].id) {
        number = calls[0].id.number
      } else {
        number = calls[0].number;
      }

      LazyLoader.load(['shared/js/async_storage.js',
                       'shared/js/notification_helper.js',
                       'shared/js/simple_phone_matcher.js',
                       'shared/js/dialer/contacts.js'], function () {
        Contacts.findByNumber(number, function (contact) {
          var blockNumber = false;
          if (contact) {
            if(contact.category &&
                contact.category.indexOf('block') != -1)
            {
              blockNumber = true;
            }
          } else if (self.unknownEnabled) {
            blockNumber = true;
          }
          if (blockNumber == true) {
            calls[0].hangUp();
          //BEGIN-modified by gaochi.ren jrd_cd on 20150106 for PR889696
          //} else if(calls.length == 1) {
          } else if(calls.length == 1 && noGroup) {
          //END-modified by gaochi.ren jrd_cd on 20150106 for PR889696
            handleOneCall(self, calls[0]);
          }
        });
      });
    }
    //ZhaoLingling for CR780486-end
    //BEGIN_Del by heyong jrd_cd on 2014.12.29 for PR 886372
    /*
    if (this._alerting || calls[0].state !== 'incoming') {
      return;
    }

    var incomingCall = calls[0];
    var self = this;

    self._startAlerting();
    //TCL_ZhaoLingling stop alerting when laid the phone face down
    window.addEventListener('devicemotion', this);

    incomingCall.addEventListener('statechange', function callStateChange() {
      incomingCall.removeEventListener('statechange', callStateChange);
      //TCL_ZhaoLingling stop alerting when laid the phone face down-begin
      window.removeEventListener('devicemotion',self);
      self._ready = false;

      self._stopAlerting();
    });
    */
    //END_Del by heyong jrd_cd on 2014.12.29 for PR 886372
  };

  DialerAgent.prototype._startAlerting = function da_startAlerting() {
    this._alerting = true;

    // alter by xingming.yin.hz@tcl.com for bug 822570; start ;
    // the phone can enable/disable the vibrate when incoming a call
    if ('vibrate' in navigator) {
      var _self = this;
      this._vibrateInterval = window.setInterval(function vibrate() {
        if (_self._shouldVibrate) {
            navigator.vibrate([200]);
        }
      }, 600);
      if (this._shouldVibrate) {
          navigator.vibrate([200]);
      }
    }
    // alter by xingming.yin.hz@tcl.com fro bug 822570 ; end;

    if (this._shouldRing) {
      this._player.play();
    }
  };

  DialerAgent.prototype._stopAlerting = function da_stopAlerting() {
    var player = this._player;

    this._alerting = false;
    if (player && player.readyState > player.HAVE_NOTHING) {
      player.pause();
      player.currentTime = 0;
    }

    window.clearInterval(this._vibrateInterval);
  };

  DialerAgent.prototype._createCallScreen = function da_createCallScreen() {
    // TODO: use a BrowswerFrame
    // https://bugzilla.mozilla.org/show_bug.cgi?id=995979
    var iframe = document.createElement('iframe');
    iframe.setAttribute('name', 'call_screen');
    iframe.setAttribute('mozbrowser', 'true');
    iframe.setAttribute('remote', 'false');
    iframe.setAttribute('mozapp', CSORIGIN + 'manifest.webapp');
    iframe.dataset.frameOrigin = CSORIGIN;
    iframe.dataset.hidden = 'true';

    return iframe;
  };

  DialerAgent.prototype._openCallScreen = function da_openCallScreen() {
    var callScreen = this._callScreen;
    var timestamp = new Date().getTime();

    var src = CSORIGIN + 'index.html' + '#' +
              (lockScreen.locked ? 'locked' : '');
    src = src + '&timestamp=' + timestamp;
    callScreen.src = src;
    callScreen.setVisible(true);

    var asRequest = {
      target: callScreen,
      stopPropagation: function() {},
      detail: {
        features: 'attention',
        name: 'call_screen',
        frameElement: callScreen
      }
    };
    AttentionScreen.open(asRequest);
  };

  DialerAgent.prototype.showCallScreen = function da_showCallScreen() {
    if (this._callScreen) {
      AttentionScreen.show(this._callScreen);
    }
  };

  exports.DialerAgent = DialerAgent;
}(window));
