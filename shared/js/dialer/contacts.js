/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

var Contacts = {

  _FB_FILES: [
    '/shared/js/fb/fb_request.js',
    '/shared/js/fb/fb_data_reader.js',
    '/shared/js/fb/fb_reader_utils.js',
    '/shared/js/icc_helper.js'//TCL_ZhaoLingling for PR 681598
  ],

  // The mozContact API stores a revision of its database that allow us to know
  // if we have a proper and updated contact cache.
  getRevision: function getRevision(callback) {
    var mozContacts = navigator.mozContacts;
    if (!mozContacts) {
      callback(null);
      return;
    }

    var req = mozContacts.getRevision();
    req.onsuccess = function onsuccess(event) {
      callback(event.target.result);
    };
    req.onerror = function onerror(event) {
      console.log('Error ' + event.target.error);
      callback(null);
    };
  },

  findByNumber: function findByNumber(number, callback) {
    //TCL_ZhaoLingling for PR 681598--begin
    var self = this;
    var req = navigator.mozSettings.createLock().get('dialer.display.fdnname');

    req.onsuccess = function() {
      //T2M_lxx modify for PR860695 start
      if (req.result['dialer.display.fdnname']) {
        LazyLoader.load(self._FB_FILES,
          self._findByNumberFDN.bind(self, number, callback));
      } else {
        LazyLoader.load(self._FB_FILES,
          self._findByNumber.bind(self, number, callback));
      }
    };
    //T2M_lxx modify for PR860695 end

    req.onerror = function onerror() {
      LazyLoader.load(self._FB_FILES,
        self._findByNumber.bind(self, number, callback));
    };
    //TCL_ZhaoLingling for PR 681598--end
  },

  //TCL_ZhaoLingling for PR 681598--begin
  _findByNumberFDN: function _findByNumberFDN(number, callback) {
    dump('dialer:_findByNumberFDN');
    var self = this;
    //TCL_ZhaoLingling for PR 728947--begin
    var connections = navigator.mozMobileConnections;
    if (connections) {
      var conn = connections[0];
      if (!conn || !conn.voice || conn.voice.emergencyCallsOnly) {
        self._findByNumber(number, callback);
        return;
      }
    }
    //TCL_ZhaoLingling for PR 728947--end

    // alter by xingming.yin.hz@tcl.com; for pr859948;start;
    var index = 0,
        active = navigator.mozTelephony.active;
    //BEGIN-added by tanglin jrd_cd on 20150105 for PR889565
    for (var i = 0; i < connections.length; i++) {
      if (connections[i] && connections[i].iccId) {
        index = i;
        break;
      }
    }
    //END-added by tanglin jrd_cd on 20150105 for PR889565
    if (!!active)
        index = active.serviceId;
    var iccObject = this.getIccByIndex(index);

    //BEGIN-added by tanglin jrd_cd on 20150105 for PR889565
    if (!iccObject) {
      self._findByNumber(number, callback);
      return;
    }
    //END-added by tanglin jrd_cd on 20150105 for PR889565

    var req = iccObject.getCardLock('fdn');
    req.onsuccess = function onsuccess() {
      var enabled = req.result.enabled;
      dump('dialer:getCardLock success,enabled is ' + enabled);
      if (enabled) {
        var request = iccObject.readContacts('fdn');
        // alter by xingming.yin.hz@tcl.com; for pr859948;end;
        request.onsuccess = function onsuccess() {
          dump('dialer:readContacts success');
          // alter by xingming.yin.hz@tcl.com for pr906028
          var fdnContactsList = request.result.data;
          var fdnContacts = null;
          var matchingTel = null;
          for (var i = 0, l = fdnContactsList.length; i < l; i++) {
            if (number && number == fdnContactsList[i].tel[0].value) {
              matchingTel = {
                type: 'mobile',
                carrier: null,
                value: number
              };
              fdnContacts = {
                id: i + 1,
                name: fdnContactsList[i].name,
                tel: matchingTel,
                photo: null
              };
              break;
            }
          }
          if (fdnContacts && fdnContacts.name != 'null') {
            callback(fdnContacts, matchingTel, 0);
          } else {
            self._findByNumber(number, callback);
          }
        };
        request.onerror = function onerror() {
          dump('dialer:readContacts error');
          callback(null);
        };
      } else {
        self._findByNumber(number, callback);
      }
    };
    req.onerror = function onerror() {
      dump('dialer:getCardLock error ');
      self._findByNumber(number, callback);
    };
  },
  //TCL_ZhaoLingling for PR 681598--end


  // add by xingming.yin.hz@tcl.com; for pr859948; start
  /**
   * Retrieve current ICC by a given index. If no index is provided, it will
   * use the index provided by `DsdsSettings.getIccCardIndexForCallSettings`,
   * which is the default. Unless there are very specific reasons to provide an
   * index, this function should always be invoked with no parameters in order to
   * use the currently selected ICC index.
   *
   * @param {Number} index index of the mobile connection to get the ICC from
   * @return {object}
   */
  getIccByIndex: function(index) {
      if (index === undefined) {
        index = 0;
      }
      var iccObj;

      if (navigator.mozMobileConnections[index]) {
         var iccId = navigator.mozMobileConnections[index].iccId;
         if (iccId) {
             iccObj = navigator.mozIccManager.getIccById(iccId);
         }
      }
      return iccObj;
   },
   // add by xingming.yin.hz@tcl.com; for pr859948; end

  _findByNumber: function _findByNumber(number, callback) {
    if (!number) {
      callback(null);
      return;
    }

    var options;
    var variants;

    // Based on E.164 (http://en.wikipedia.org/wiki/E.164)
    // if length < 7 we're dealing with a short number
    // so no need for variants
    if (number.length < 7) {
      variants = [number];
      options = {
        filterBy: ['tel'],
        filterOp: 'equals',
        filterValue: number
      };
    } else {
      // get the phone number variants (for the Facebook lookup)
      variants = SimplePhoneMatcher.generateVariants(number);
      var sanitizedNumber = SimplePhoneMatcher.sanitizedNumber(number);

      options = {
        filterBy: ['tel'],
        filterOp: 'match',
        filterValue: sanitizedNumber
      };
    }

    var mozContacts = navigator.mozContacts;
    if (!mozContacts) {
      callback(null);
      return;
    }

    var request = mozContacts.find(options);
    request.onsuccess = function findCallback() {
      var contacts = request.result;
      if (contacts.length === 0) {
        // It is only necessary to search for one variant as FB takes care
        fb.getContactByNumber(number, function fb_ready(finalContact) {
          var objMatching = null;
          if (finalContact) {
            objMatching = {
              value: number,
              // Facebook telephone are always of type personal
              type: 'personal',
              // We don't know the carrier from FB phones
              carrier: null
            };
          }
          callback(finalContact, objMatching);
        }, function fb_err(err) {
          callback(null);
        });
        return;
      }

      // formatting the matches as an array (contacts) of arrays (phone numbers)
      var matches = contacts.map(function getTels(contact) {
        return contact.tel.map(function getNumber(tel) {
          return tel.value;
        });
      });

      // Finding the best match
      var matchResult = SimplePhoneMatcher.bestMatch(variants, matches);

      var contact = contacts[matchResult.bestMatchIndex];
      var contactsWithSameNumber;
      if (contacts.length > 1) {
        contactsWithSameNumber = contacts.length - 1;
      }

      var matchingTel = contact.tel[matchResult.localIndex];

      //BEGIN-added by xiaoqin.nie tcl_cd on 20141027 for PR819550
      var totalMatchNum = matchResult.totalMatchNum;
      for (var i = 0; i < totalMatchNum; i++) {
        if (number === contact.tel[i].value) {
          matchingTel = contact.tel[i];
          break;
        }
      }
      //END-added by xiaoqin.nie tcl_cd on 20141027 for PR819550

      if (fb.isFbLinked(contact)) {
        // Merge with the FB data
        var req = fb.getData(contact);
        req.onsuccess = function() {
          callback(req.result, matchingTel, contactsWithSameNumber);
        };
        req.onerror = function() {
          window.console.error('Error while getting FB Data');
          callback(contact, matchingTel, contactsWithSameNumber);
        };
      }
      else {
        callback(contact, matchingTel, contactsWithSameNumber);
      }
    };
    request.onerror = function findError() {
      callback(null);
    };
  },

  _mergeFbContacts: function _mergeFbContacts(contacts, callback) {
    if (!callback || !(callback instanceof Function)) {
      return;
    }

    if (!contacts) {
      callback(null);
    }

    LazyLoader.load(this._FB_FILES, function() {
      for (var i = 0, length = contacts.length; i < length; i++) {
        if (fb.isFbContact(contacts[i])) {
          var fbReq = fb.getData(contacts[i]);
          fbReq.onsuccess = function() {
            contacts[i] = fbReq.result;
            if (i === (length - 1)) {
              callback(contacts);
            }
          };
          fbReq.onerror = function() {
            console.error('Could not merge Facebook data');
            callback(contacts);
          };
        } else if (i === (length - 1)) {
          callback(contacts);
        }
      }
    });
  },

  _findContacts: function _findContacts(options, callback) {
    if (!callback || !(callback instanceof Function)) {
      return;
    }

    if (!navigator.mozContacts || !options) {
      callback(null);
      return;
    }

    var self = this;
    var req = navigator.mozContacts.find(options);
    req.onsuccess = function onsuccess() {
      var contacts = req.result;
      if (!contacts.length) {
        callback(null);
        return;
      }

      // If we have contacts data from Facebook, we need to merge it with the
      // one from the Contacts API db.
      self._mergeFbContacts(contacts, callback);
    };

    req.onerror = function onerror() {
      console.error('Contact finding error. Error: ' + req.errorCode);
      callback(null);
    };
  },

  findListByNumber: function findListByNumber(number, limit, callback) {
    var self = this;
    asyncStorage.getItem('order.lastname', function(value) {
      var sortKey = value ? 'familyName' : 'givenName';

      var options = {
        filterBy: ['tel'],
        filterOp: 'contains',
        filterValue: number,
        sortBy: sortKey,
        sortOrder: 'ascending',
        filterLimit: limit
      };

      self._findContacts(options, callback);
    });
  }
};
