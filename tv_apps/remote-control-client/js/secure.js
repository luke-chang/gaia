/* global base64js, TextEncoderLite, TextDecoderLite */
'use strict';

(function(exports) {
  var DEBUG = false;

  // The .sjs file is located in the Gecko since it needs chrome privilege.
  var AJAX_URL = 'secure.sjs';

  var RSA_OPTION = {
    name: 'RSA-OAEP',
    hash: { name: 'SHA-256' }
  };

  var RANDOM_VALUE_LENGTH = 12;
  var POLLING_PERIOD = 1000;
  var POLLING_MAX_COUNT = 30;
  var UUID_EXPIRES = 91; // days

  var subtle = window.crypto.subtle ||
               window.crypto.webkitSubtle;

  function Secure() {}

  Secure.prototype = {
    handshake: function() {
      return this.requirePublicKey()
        .then(this.importPublicKey.bind(this))
        .then(this.generateSymmetricKey.bind(this))
        .then(this.wrapSymmetricKey.bind(this))
        .then(this.sendSymmetricKey.bind(this))
        .then(this.pollUUID.bind(this))
        .then(this.decrypt.bind(this))
        .then(this.saveUUID.bind(this));
    },

    restore: function() {
      var self = this;
      return new Promise(function(resolve, reject) {
        var uuid = exports.getCookie('uuid');
        if (!uuid) {
          reject('[Restore] No UUID!');
        } else {
          exports.setCookie('uuid', uuid, UUID_EXPIRES);
          self.loadSymmetricKey().then(resolve).catch(function(err) {
            exports.setCookie('uuid', null, -1);
            reject(err);
          });
        }
      });
    },

    requirePublicKey: function() {
      return new Promise(function(resolve, reject) {
        if (DEBUG) {
          var option = RSA_OPTION;
          option.modulusLength = 2048;
          option.publicExponent = new Uint8Array([0x01, 0x00, 0x01]);

          subtle.generateKey(
            option,
            true,
            ['wrapKey', 'unwrapKey']
          ).then(function(key) {
            subtle.exportKey('spki', key.publicKey).then(function(keydata) {
              resolve(keydata);
            }).catch(function(err) {
              reject('[requirePublicKey] ' + err);
            });
          }).catch(function(err) {
            reject('[requirePublicKey] ' + err);
          });
        } else {
          exports.sendMessage(
            AJAX_URL,
            {
              message: JSON.stringify({ action: 'require-public-key' })
            },
            function success(data) {
              if (data.error) {
                reject('[requirePublicKey] ' + data.error);
              } else {
                resolve(base64js.toByteArray(data.publicKey));
              }
            },
            function error(status) {
              reject('[requirePublicKey] ' + status);
            }
          );
        }
      });
    },

    importPublicKey: function(keydata) {
      var self = this;
      return new Promise(function(resolve, reject) {
        subtle.importKey(
          'spki',
          keydata,
          RSA_OPTION,
          false,
          ['wrapKey']
        )
        .then(function(publicKey) {
          self._publicKey = publicKey;
          resolve(publicKey);
        })
        .catch(function(err) {
          reject('[importPublicKey] ' + err);
        });
      });
    },

    generateSymmetricKey: function() {
      var self = this;
      return new Promise(function(resolve, reject) {
        subtle.generateKey(
          {
            name: 'AES-GCM',
            length: 256,
          },
          true,
          ['encrypt', 'decrypt']
        )
        .then(function(key) {
          subtle.exportKey(
            'raw',
            key
          )
          .then(function(keydata) {
            var base64KeyData = base64js.fromByteArray(new Uint8Array(keydata));
            localStorage.setItem('symmetric-key', base64KeyData);

            self._symmetricKey = key;
            resolve();
          })
          .catch(function(err) {
            reject('[generateSymmetricKey] ' + err);
          });
        })
        .catch(function(err) {
          reject('[generateSymmetricKey] ' + err);
        });
      });
    },

    loadSymmetricKey: function() {
     var self = this;
      return new Promise(function(resolve, reject) {
        var base64KeyData = localStorage.getItem('symmetric-key');

        if (!base64KeyData) {
          reject('[loadSymmetricKey] No symmetric key stored.');
          return;
        }

        subtle.importKey(
          'raw',
          base64js.toByteArray(base64KeyData),
          { name: 'AES-GCM' },
          true,
          ['encrypt', 'decrypt']
        )
        .then(function(key) {
          self._symmetricKey = key;
          resolve();
        })
        .catch(function(err) {
          reject('[loadSymmetricKey] ' + err);
        });
      });
    },

    clearSymmetricKey: function() {
      this._symmetricKey = undefined;
      localStorage.removeItem('symmetric-key');
    },

    wrapSymmetricKey: function() {
      if (!this._symmetricKey) {
        return Promise.reject(
          '[wrapSymmetricKey] Need to generate or load symmetric key first.');
      }

      if (!this._publicKey) {
        return Promise.reject(
          '[wrapSymmetricKey] Need to import public key first.');
      }

      var self = this;
      return new Promise(function(resolve, reject) {
        subtle.wrapKey(
          'raw',
          self._symmetricKey,
          self._publicKey,
          RSA_OPTION
        )
        .then(function(wrappedSymmetricKey) {
          var base64WrappedSymmetricKey =
            base64js.fromByteArray(new Uint8Array(wrappedSymmetricKey));
          resolve(base64WrappedSymmetricKey);
        })
        .catch(function(err) {
          reject('[wrapSymmetricKey] ' + err);
        });
      });
    },

    sendSymmetricKey: function(base64WrappedSymmetricKey) {
      return new Promise(function(resolve, reject) {
        exports.sendMessage(
          AJAX_URL,
          {
            message: JSON.stringify({
              action: 'send-symmetric-key',
              wrappedSymmetricKey: base64WrappedSymmetricKey
            })
          },
          function success(data) {
            if (data.error) {
              reject('[sendSymmetricKey] ' + data.error);
            } else {
              resolve(data.ticket);
            }
          },
          function error(status) {
            reject('[sendSymmetricKey] ' + status);
          }
        );
      });
    },

    pollUUID: function(pollingTicket) {
      return new Promise(function(resolve, reject) {
        var pollingCount = 0;
        (function pollingFunction() {
          if (++pollingCount > POLLING_MAX_COUNT) {
            reject('[pollUUID] Request timed out');
            return;
          }
          exports.sendMessage(
            AJAX_URL,
            {
              message: JSON.stringify({
                action: 'poll-uuid',
                ticket: pollingTicket
              })
            },
            function success(data) {
              if (data.done) {
                if (data.error) {
                  reject('[pollUUID] ' + data.error);
                } else {
                  resolve(data.encryptedUUID);
                }
              } else {
                setTimeout(pollingFunction, POLLING_PERIOD);
              }
            },
            function error(status) {
              reject('[pollUUID] ' + status);
            }
          );
        })();
      });
    },

    saveUUID: function(uuid) {
      exports.setCookie('uuid', uuid, UUID_EXPIRES);
      return Promise.resolve();
    },

    encrypt: function(data) {
      if (!this._symmetricKey) {
        return Promise.reject(
          '[encrypt] Need to generate or load symmetric key first.');
      }

      if (typeof data !== 'string') {
        data = JSON.stringify(data);
      }

      var textEncoderLite = new TextEncoderLite('utf-8');
      var randomValues = new Uint8Array(RANDOM_VALUE_LENGTH);
      var self = this;

      return new Promise(function(resolve, reject) {
        subtle.encrypt(
          {
            name: 'AES-GCM',
            iv: window.crypto.getRandomValues(randomValues)
          },
          self._symmetricKey,
          textEncoderLite.encode(data)
        )
        .then(function(encrypted){
          var result =
            new Uint8Array(RANDOM_VALUE_LENGTH + encrypted.byteLength);
          result.set(randomValues, 0);
          result.set(new Uint8Array(encrypted), RANDOM_VALUE_LENGTH);
          resolve(base64js.fromByteArray(result));
        })
        .catch(function(err) {
          reject('[encrypt] ' + err);
        });
      });
    },

    decrypt: function(encrypted) {
      if (!this._symmetricKey) {
        return Promise.reject(
          '[decrypt] Need to generate or load symmetric key first.');
      }

      var encryptedByteArray = base64js.toByteArray(encrypted);
      var textDecoderLite = new TextDecoderLite('utf-8');
      var self = this;

      return new Promise(function(resolve, reject) {
        subtle.decrypt(
          {
            name: 'AES-GCM',
            iv: encryptedByteArray.slice(0, RANDOM_VALUE_LENGTH)
          },
          self._symmetricKey,
          encryptedByteArray.slice(RANDOM_VALUE_LENGTH)
        )
        .then(function(decrypted){
          resolve(textDecoderLite.decode(new Uint8Array(decrypted)));
        })
        .catch(function(err){
          reject('[decrypt] ' + err);
        });
      });
    }
  };

  exports.Secure = Secure;
}(window));
