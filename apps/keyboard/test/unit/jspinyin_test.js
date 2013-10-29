const LAYOUT_PAGE_DEFAULT = 'Default';
const NUMBER_OF_CANDIDATES_PER_ROW = 8;

const DB_VERSION = 1;
const STORE_NAME = 'files';
const USER_DICT = 'user_dict';

var InputMethods = {};
var Module;
var UnitTest = {};

requireApp('keyboard/js/imes/jspinyin/jspinyin.js');

suite('PinyinIME', function() {
  var fakeUserDict = [240, 222, 188, 10, 0, 2, 239, 0, 176, 1, 11, 140, 122,
                      102, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 252, 0, 0, 0, 0, 0, 0,
                      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
                      10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0,
                      0];
  var fakeCandidates = ['這', '是', '測', '試'];
  var fakeMaxCount = 100;
  var fakeCandidatesLength = 20;
  var fakeIndicator = 8;
  var testKeys = [39, 48, 49, 50, 97, 98, 99, KeyEvent.DOM_VK_RETURN,
                  KeyEvent.DOM_VK_BACK_SPACE, KeyEvent.DOM_VK_SPACE];

  suite('jspinyin', function() {
    var jspinyin;
    var emEngineWrapper;
    var glue = {
      path: '/js/imes/jspinyin',
      sendCandidates: sinon.spy(),
      setComposition: sinon.spy(),
      endComposition: sinon.spy(),
      sendKey: sinon.spy(),
      sendString: sinon.spy(),
      alterKeyboard: sinon.spy(),
      setLayoutPage: sinon.spy(),
      setUpperCase: sinon.spy(),
      resetUpperCase: sinon.spy(),
      replaceSurroundingText: sinon.spy(),
      getNumberOfCandidatesPerRow: sinon.stub()
    };

    teardown(function() {
      glue.sendCandidates.reset();
      glue.setComposition.reset();
      glue.endComposition.reset();
      glue.sendKey.reset();
      glue.sendString.reset();
      glue.alterKeyboard.reset();
      glue.setLayoutPage.reset();
      glue.setUpperCase.reset();
      glue.resetUpperCase.reset();
      glue.replaceSurroundingText.reset();
      glue.getNumberOfCandidatesPerRow.reset();
    });

    test('load', function() {
      assert.isDefined(InputMethods.jspinyin);
      jspinyin = InputMethods.jspinyin;
      emEngineWrapper = UnitTest.emEngineWrapper;
    });

    test('init', function() {
      jspinyin.init(glue);
      assert.equal(jspinyin._glue.path, glue.path);
    });

    test('uninit', function() {
      this.sinon.stub(emEngineWrapper, 'uninit');
      this.sinon.stub(emEngineWrapper, 'isReady');
      emEngineWrapper.isReady.returns(true);

      this.sinon.stub(jspinyin, '_resetKeypressQueue');
      this.sinon.stub(jspinyin, 'empty');

      jspinyin.uninit();

      assert.isTrue(jspinyin._resetKeypressQueue.calledOnce);
      assert.isTrue(jspinyin.empty.calledOnce);
    });

    test('activate', function(done) {
      var state = {
        type: 'text'
      };

      this.sinon.stub(jspinyin, '_accessUserDict',
        function(action, param, callback) {
          assert.equal(action, 'load');
          assert.isFunction(callback);
          callback(fakeUserDict);
        }
      );

      this.sinon.spy(jspinyin, '_start');

      this.sinon.stub(emEngineWrapper, 'init',
        function(path, byteArray, callback) {
          assert.equal(path, glue.path);
          assert.equal(byteArray, fakeUserDict);
          callback(false);
          callback(true);

          assert.isTrue(jspinyin._start.calledOnce);
          assert.isTrue(glue.alterKeyboard.calledWith('zh-Hans-Pinyin'));

          done();
        }
      );

      jspinyin.activate('zh-Hans', state, {});
    });

    test('activate when uninitTimer is working and emEngineWrapper is ready',
      function() {
        var state = {
          type: 'text'
        };

        jspinyin._uninitTimer = setTimeout(function() {
          throw 'Should not call this function.';
        }, 0);

        this.sinon.stub(emEngineWrapper, 'isReady');
        emEngineWrapper.isReady.returns(true);

        this.sinon.stub(jspinyin, '_accessUserDict');
        this.sinon.stub(jspinyin, '_start');
        this.sinon.stub(emEngineWrapper, 'init');
        this.sinon.stub(emEngineWrapper, 'post');

        jspinyin.activate('zh-Hans', state, {});

        assert.isTrue(emEngineWrapper.post.calledWith('im_flush_cache'));
        assert.isFalse(jspinyin._accessUserDict.calledOnce);
        assert.isNull(jspinyin._uninitTimer);
      }
    );

    test('deactivate', function(done) {
      jspinyin._isActive = false;
      jspinyin.deactivate();

      this.sinon.stub(jspinyin, '_resetKeypressQueue');
      this.sinon.stub(jspinyin, 'empty');
      this.sinon.stub(emEngineWrapper, 'post',
        function(id, param, callback) {
          assert.equal(id, 'im_get_user_dict_data');
          assert.isFunction(callback);
          callback(fakeUserDict);
        }
      );
      this.sinon.stub(jspinyin, '_accessUserDict',
        function(action, param, callback) {
          assert.equal(action, 'save');
          assert.equal(param, fakeUserDict);
          assert.isFunction(callback);

          callback(false);
          callback(true);

          assert.isTrue(jspinyin._resetKeypressQueue.calledOnce);
          assert.isTrue(jspinyin.empty.calledOnce);
          assert.isNotNull(jspinyin._uninitTimer);

          done(function() {
            clearTimeout(jspinyin._uninitTimer);
          });
        }
      );

      jspinyin._isActive = true;
      jspinyin.deactivate();

      assert.isFalse(jspinyin._isActive);
    });

    test('setLayoutPage', function() {
      for (var i = 0; i < 10; i++) {
        jspinyin.setLayoutPage(i);
        assert.equal(jspinyin._layoutPage, i);
      }
    });

    test('empty', function() {
      jspinyin._pendingSymbols = 'mou';
      jspinyin._historyText = '谋';
      jspinyin._firstCandidate = '谋';

      this.sinon.stub(jspinyin, '_sendPendingSymbols');
      this.sinon.stub(jspinyin, '_sendCandidates');

      jspinyin.empty();

      assert.equal(jspinyin._pendingSymbols, '');
      assert.equal(jspinyin._historyText, '');
      assert.equal(jspinyin._firstCandidate, '');
      assert.isTrue(jspinyin._sendPendingSymbols.calledOnce);
      assert.isTrue(jspinyin._sendCandidates.calledWith([]));
    });

    test('click', function() {
      jspinyin._layoutPage = LAYOUT_PAGE_DEFAULT;
      jspinyin._keypressQueue = [];

      this.sinon.stub(jspinyin, '_start');

      for (var i = 0; i < testKeys.length; i++) {
        jspinyin.click(testKeys[i]);
      }

      assert.deepEqual(jspinyin._keypressQueue, testKeys);
      assert.equal(jspinyin._start.callCount, testKeys.length);
    });

    test('click to switch layouts', function() {
      jspinyin._layoutPage = LAYOUT_PAGE_DEFAULT;

      this.sinon.stub(jspinyin, '_alterKeyboard');
      this.sinon.stub(jspinyin, '_start');

      var testPair = [
        [-11, 'zh-Hans-Pinyin'],
        [-21, 'zh-Hans-Pinyin-Symbol-Ch-1'],
        [-22, 'zh-Hans-Pinyin-Symbol-Ch-2'],
        [-31, 'zh-Hans-Pinyin-Symbol-En-1'],
        [-32, 'zh-Hans-Pinyin-Symbol-En-2'],
        [-20, 'zh-Hans-Pinyin-Symbol-Ch-1', 'zh-Hans-Pinyin-Symbol-En-1'],
        [-20, 'zh-Hans-Pinyin-Symbol-Ch-2', 'zh-Hans-Pinyin-Symbol-En-2'],
        [-30, 'zh-Hans-Pinyin-Symbol-En-1', 'zh-Hans-Pinyin-Symbol-Ch-1'],
        [-30, 'zh-Hans-Pinyin-Symbol-En-2', 'zh-Hans-Pinyin-Symbol-Ch-2']
      ];

      for (var i in testPair) {
        if (testPair[i][2])
          jspinyin._keyboard = testPair[i][2];
        jspinyin.click(testPair[i][0]);
        assert.isTrue(jspinyin._alterKeyboard.calledWith(testPair[i][1]));
        jspinyin._alterKeyboard.reset();
      }
    });

    test('click when layoutPage is not default value', function() {
      jspinyin._layoutPage = 'test';

      for (var i = 0; i < testKeys.length; i++) {
        jspinyin.click(testKeys[i]);
        assert.isTrue(glue.sendKey.calledWith(testKeys[i]));
        glue.sendKey.reset();
      }
    });

    test('select one candidate', function(done) {
      this.sinon.stub(jspinyin, '_start');
      this.sinon.stub(emEngineWrapper, 'isReady');
      emEngineWrapper.isReady.returns(false);
      jspinyin.select(fakeCandidates[1], 1);

      emEngineWrapper.isReady.returns(true);
      this.sinon.stub(emEngineWrapper, 'post',
        function(id, param, callback) {
          assert.equal(id, 'im_choose');
          assert.equal(param.candId, 1);
          callback(fakeCandidates[1]);
          done(function() {
            assert.isTrue(glue.endComposition.calledWith(fakeCandidates[1]));
          });
        }
      );

      jspinyin._pendingSymbols = 'mou';
      jspinyin.select(fakeCandidates[1], 1);
    });

    test('select one predict', function() {
      this.sinon.stub(emEngineWrapper, 'isReady');
      emEngineWrapper.isReady.returns(true);

      this.sinon.stub(jspinyin, '_start');

      jspinyin._pendingSymbols = '';
      jspinyin.select(fakeCandidates[1], 1);
      assert.isTrue(glue.sendString.calledWith(fakeCandidates[1]));
    });

    test('getMoreCandidates', function(done) {
      jspinyin._candidatesLength = fakeCandidatesLength;
      jspinyin._pendingSymbols = 'mou';

      this.sinon.stub(emEngineWrapper, 'post',
        function(id, param, callback) {
          assert.equal(id, 'im_get_candidates');
          assert.deepEqual(param, {
            start: fakeIndicator,
            count: Math.min(fakeCandidatesLength, fakeMaxCount)
          });
          callback(fakeCandidates);
        }
      );

      jspinyin.getMoreCandidates(fakeIndicator, fakeMaxCount,
        function(list) {
          for (var i = 0; i < fakeCandidates.length; i++) {
            assert.deepEqual(list[i], [fakeCandidates[i], fakeIndicator + i]);
          }
          done();
        }
      );
    });

    test('getMoreCandidates from predicts', function(done) {
      jspinyin._candidatesLength = fakeCandidatesLength;
      jspinyin._pendingSymbols = '';

      this.sinon.stub(emEngineWrapper, 'post',
        function(id, param, callback) {
          assert.equal(id, 'im_get_predicts');
          assert.deepEqual(param, {
            start: fakeIndicator,
            count: Math.min(fakeCandidatesLength, fakeMaxCount)
          });
          callback(fakeCandidates);
        }
      );

      jspinyin.getMoreCandidates(fakeIndicator, fakeMaxCount,
        function(list) {
          for (var i = 0; i < fakeCandidates.length; i++) {
            assert.deepEqual(list[i], [fakeCandidates[i], fakeIndicator + i]);
          }
          done();
        }
      );
    });

    test('getMoreCandidates when there is no candidates', function(done) {
      jspinyin._candidatesLength = 0;

      jspinyin.getMoreCandidates(fakeIndicator, fakeCandidates,
        function(list) {
          assert.isNull(list);
          done();
        }
      );
    });

    test('_sendPendingSymbols', function(done) {
      jspinyin._pendingSymbols = 'xdjm';
      this.sinon.stub(emEngineWrapper, 'post',
        function(id, param, callback) {
          assert.equal(id, 'im_get_pending_symbols_info');
          callback({
            fixedLen: 0,
            splStart: [0, 1, 2, 3]
          });

          assert.isTrue(glue.setComposition.calledWith('x d j m'));
          done();
        }
      );
      jspinyin._sendPendingSymbols();
    });

    test('_sendPendingSymbols when splStart is null', function(done) {
      jspinyin._pendingSymbols = 'xdjm';
      this.sinon.stub(emEngineWrapper, 'post',
        function(id, param, callback) {
          assert.equal(id, 'im_get_pending_symbols_info');
          callback({
            fixedLen: 0,
            splStart: []
          });

          assert.isTrue(glue.setComposition.calledWith('xdjm'));
          done();
        }
      );
      jspinyin._sendPendingSymbols();
    });

    test('_sendPendingSymbols without pendingSymbols', function() {
      jspinyin._pendingSymbols = '';
      jspinyin._sendPendingSymbols();
      assert.isTrue(glue.endComposition.calledOnce);
    });

    test('_sendCandidates', function() {
      jspinyin._sendCandidates(fakeCandidates);

      assert.equal(jspinyin._firstCandidate, fakeCandidates[0]);

      var predictList = [];
      for (var i = 0; i < fakeCandidates.length; i++) {
        predictList.push([fakeCandidates[i], i]);
      }

      assert.isTrue(glue.sendCandidates.calledWith(predictList));
    });

    test('_start', function() {
      this.sinon.stub(jspinyin, '_next');
      this.sinon.stub(emEngineWrapper, 'isReady');

      jspinyin._isWorking = true;
      jspinyin._start();
      assert.isFalse(jspinyin._next.called);

      jspinyin._isWorking = false;
      emEngineWrapper.isReady.returns(false);
      jspinyin._start();
      assert.isFalse(jspinyin._next.called);

      emEngineWrapper.isReady.returns(true);
      jspinyin._start();
      assert.isTrue(jspinyin._next.calledOnce);
      assert.isTrue(jspinyin._isWorking);
    });

    test('_next', function() {
      this.sinon.stub(jspinyin, 'empty');
      this.sinon.stub(jspinyin, '_updateCandidatesAndSymbols');
      this.sinon.stub(jspinyin, '_sendCandidates');
      this.sinon.stub(jspinyin, '_isPinyinKey');

      function setup(keyCode, pendingSymbols, firstCandidate, isPinyinKey) {
        jspinyin._isWorking = true;

        jspinyin._keypressQueue = [];
        if (keyCode !== null)
          jspinyin._keypressQueue.push(keyCode);

        jspinyin._pendingSymbols = pendingSymbols || '';
        jspinyin._firstCandidate = firstCandidate || '';

        jspinyin.empty.reset();
        jspinyin._updateCandidatesAndSymbols.reset();
        jspinyin._sendCandidates.reset();
        jspinyin._isPinyinKey.reset();

        glue.sendKey.reset();
        glue.setComposition.reset();
        glue.endComposition.reset();

        jspinyin._isPinyinKey.returns(isPinyinKey || false);
      }

      setup(null);
      jspinyin._next();
      assert.isFalse(jspinyin._isWorking);

      setup(0);
      jspinyin._next();
      assert.isTrue(jspinyin._updateCandidatesAndSymbols.calledOnce);

      setup(KeyEvent.DOM_VK_BACK_SPACE, '', fakeCandidates[0]);
      jspinyin._next();
      assert.isTrue(jspinyin.empty.calledOnce);
      assert.isTrue(glue.sendKey.calledWith(KeyEvent.DOM_VK_BACK_SPACE));

      setup(KeyEvent.DOM_VK_BACK_SPACE, 'mou');
      jspinyin._next();
      assert.isFalse(jspinyin.empty.called);
      assert.equal(jspinyin._pendingSymbols, 'mo');
      assert.isTrue(jspinyin._updateCandidatesAndSymbols.calledOnce);

      setup(KeyEvent.DOM_VK_RETURN, 'mou', fakeCandidates[0]);
      jspinyin._next();
      assert.isTrue(glue.endComposition.calledWith(fakeCandidates[0]));
      assert.isTrue(jspinyin._sendCandidates.calledWith([]));
      assert.isTrue(jspinyin.empty.calledOnce);
      assert.isFalse(glue.sendKey.calledOnce);

      setup(KeyEvent.DOM_VK_1, 'mou', fakeCandidates[0]);
      jspinyin._next();
      assert.isTrue(glue.endComposition.calledWith(fakeCandidates[0]));
      assert.isTrue(jspinyin._sendCandidates.calledWith([]));
      assert.isTrue(jspinyin.empty.calledOnce);
      assert.isTrue(glue.sendKey.calledWith(KeyEvent.DOM_VK_1));

      setup(KeyEvent.DOM_VK_A, 'A', '', true);
      jspinyin._next();
      assert.equal(jspinyin._pendingSymbols, 'AA');
      assert.isTrue(jspinyin._updateCandidatesAndSymbols.calledOnce);
    });

    test('_isPinyinKey', function() {
      jspinyin._keyboard = 'zh-Hans-Pinyin';

      function fakeIsPinyinKey(code) {
        if (code == 39)
          return true;
        if (code >= 97 && code <= 122)
          return true;
        return false;
      }

      for (var i = 0; i < testKeys.length; i++) {
        assert.equal(jspinyin._isPinyinKey(testKeys[i]),
          fakeIsPinyinKey(testKeys[i]));
      }
    });

    test('_updateCandidatesAndSymbols', function(done) {
      this.sinon.stub(jspinyin, '_updateCandidateList',
        function(callback) {
          callback();
        }
      );
      this.sinon.stub(jspinyin, '_sendPendingSymbols');

      jspinyin._updateCandidatesAndSymbols(function() {
        assert.isTrue(jspinyin._updateCandidateList.calledOnce);
        assert.isTrue(jspinyin._sendPendingSymbols.calledOnce);
        done();
      });
    });

    test('_updateCandidateList (candidates)', function(done) {
      var fakeNumberOfCandidatesPerRow = 2;
      jspinyin._pendingSymbols = 'mou';

      this.sinon.stub(jspinyin, '_sendCandidates');
      this.sinon.stub(emEngineWrapper, 'post',
        function(id, param, callback) {
          assert.equal(id, 'im_search');
          assert.equal(param.queryString, 'mou');
          assert.equal(param.limit, fakeNumberOfCandidatesPerRow + 1);
          callback({
            length: fakeCandidates.length,
            results: fakeCandidates
          });
        }
      );

      glue.getNumberOfCandidatesPerRow.returns(fakeNumberOfCandidatesPerRow);

      jspinyin._updateCandidateList(function() {
        assert.equal(jspinyin._candidatesLength, fakeCandidates.length);
        assert.isTrue(jspinyin._sendCandidates.calledWith(fakeCandidates));
        done();
      });
    });

    test('_updateCandidateList (predicts)', function(done) {
      var fakeNumberOfCandidatesPerRow = 2;

      jspinyin._pendingSymbols = '';
      jspinyin._historyText = fakeCandidates[0];

      this.sinon.stub(jspinyin, '_sendCandidates');
      this.sinon.stub(emEngineWrapper, 'post',
        function(id, param, callback) {
          assert.equal(id, 'im_search_predicts');
          assert.equal(param.queryString, fakeCandidates[0]);
          assert.equal(param.limit, fakeNumberOfCandidatesPerRow + 1);
          callback({
            length: fakeCandidates.length,
            results: fakeCandidates
          });
        }
      );

      glue.getNumberOfCandidatesPerRow.returns(fakeNumberOfCandidatesPerRow);

      jspinyin._updateCandidateList(function() {
        assert.equal(jspinyin._candidatesLength, fakeCandidates.length);
        assert.isTrue(jspinyin._sendCandidates.calledWith(fakeCandidates));
        done();
      });
    });

    test('_updateCandidateList (predicts without historyText)', function(done) {
      var fakeNumberOfCandidatesPerRow = 2;

      jspinyin._pendingSymbols = '';
      jspinyin._historyText = '';

      this.sinon.stub(jspinyin, '_sendCandidates');
      glue.getNumberOfCandidatesPerRow.returns(fakeNumberOfCandidatesPerRow);

      jspinyin._updateCandidateList(function() {
        assert.isTrue(jspinyin._sendCandidates.calledWith([]));
        done();
      });
    });

    test('_alterKeyboard', function() {
      var keyboard = 'test';
      jspinyin._alterKeyboard(keyboard);
      assert.equal(jspinyin._keyboard, keyboard);
      assert.isTrue(glue.alterKeyboard.calledWith(keyboard));
    });

    test('_resetKeypressQueue', function() {
      jspinyin._keypressQueue = [1, 2, 3, 4];
      jspinyin._isWorking = true;

      jspinyin._resetKeypressQueue();

      assert.deepEqual(jspinyin._keypressQueue, []);
      assert.isFalse(jspinyin._isWorking);
    });

    test('_accessUserDict (load)', function(done) {
      var dummyFunction = function() {};

      var request = {};
      var transRequest = {};
      var fakeDB = {
        objectStoreNames: [1, 2],
        createObjectStore: dummyFunction,
        deleteObjectStore: dummyFunction,
        transaction: sinon.stub(),
        objectStore: sinon.stub(),
        get: sinon.stub(),
        close: dummyFunction
      };
      var evt = {
        target: {
          result: fakeDB
        }
      };

      this.sinon.stub(window.indexedDB, 'open');
      window.indexedDB.open.returns(request);

      fakeDB.transaction.returns(fakeDB);
      fakeDB.objectStore.returns(fakeDB);
      fakeDB.get.returns(transRequest);

      jspinyin._accessUserDict('load', null, function(data) {
        assert.deepEqual(data, fakeUserDict);
        done();
      });

      assert.isFunction(request.onupgradeneeded);
      assert.isFunction(request.onsuccess);

      request.onupgradeneeded(evt);
      request.onsuccess(evt);

      assert.isFunction(transRequest.onsuccess);
      transRequest.onsuccess({
        target: {
          result: {
            content: fakeUserDict
          }
        }
      });
    });

    test('_accessUserDict (save)', function(done) {
      var dummyFunction = function() {};

      var request = {};
      var transRequest = {};
      var fakeDB = {
        objectStoreNames: [1, 2],
        createObjectStore: dummyFunction,
        deleteObjectStore: dummyFunction,
        transaction: sinon.stub(),
        objectStore: sinon.stub(),
        get: sinon.stub(),
        put: sinon.stub(),
        close: dummyFunction
      };
      var evt = {
        target: {
          result: fakeDB
        }
      };

      this.sinon.stub(window.indexedDB, 'open');
      window.indexedDB.open.returns(request);

      fakeDB.transaction.returns(fakeDB);
      fakeDB.objectStore.returns(fakeDB);
      fakeDB.put.returns(transRequest);

      jspinyin._accessUserDict('save', fakeUserDict,
        function(isOk) {
          assert.isTrue(isOk);
          assert.isTrue(fakeDB.put.calledWith({
            name: 'user_dict',
            content: fakeUserDict
          }));
          done();
        }
      );

      assert.isFunction(request.onupgradeneeded);
      assert.isFunction(request.onsuccess);

      request.onupgradeneeded(evt);
      request.onsuccess(evt);

      assert.isFunction(transRequest.onsuccess);
      transRequest.onsuccess({
        target: {
          result: {
            content: fakeUserDict
          }
        }
      });
    });

    test('_accessUserDict (open failed)', function(done) {
      var request = {};

      this.sinon.stub(window.indexedDB, 'open');
      window.indexedDB.open.returns(request);

      jspinyin._accessUserDict('save', fakeUserDict,
        function(data) {
          assert.isNull(data);
          done();
        }
      );

      assert.isFunction(request.onerror);
      request.onerror({
        target: {
          errorCode: 0
        }
      });
    });

    test('_accessUserDict (load failed)', function(done) {
      var dummyFunction = function() {};

      var request = {};
      var transRequest = {};
      var fakeDB = {
        objectStoreNames: [1, 2],
        createObjectStore: dummyFunction,
        deleteObjectStore: dummyFunction,
        transaction: sinon.stub(),
        objectStore: sinon.stub(),
        get: sinon.stub(),
        close: dummyFunction
      };
      var evt = {
        target: {
          result: fakeDB
        }
      };

      this.sinon.stub(window.indexedDB, 'open');
      window.indexedDB.open.returns(request);

      fakeDB.transaction.returns(fakeDB);
      fakeDB.objectStore.returns(fakeDB);
      fakeDB.get.returns(transRequest);

      jspinyin._accessUserDict('load', null, function(data) {
        assert.isNull(data);
        done();
      });

      assert.isFunction(request.onupgradeneeded);
      assert.isFunction(request.onsuccess);

      request.onupgradeneeded(evt);
      request.onsuccess(evt);

      assert.isFunction(transRequest.onsuccess);
      transRequest.onerror({
        target: {
          result: {
            name: 'test'
          }
        }
      });
    });

    test('_accessUserDict (save failed)', function(done) {
      var dummyFunction = function() {};

      var request = {};
      var transRequest = {};
      var fakeDB = {
        objectStoreNames: [1, 2],
        createObjectStore: dummyFunction,
        deleteObjectStore: dummyFunction,
        transaction: sinon.stub(),
        objectStore: sinon.stub(),
        get: sinon.stub(),
        put: sinon.stub(),
        close: dummyFunction
      };
      var evt = {
        target: {
          result: fakeDB
        }
      };

      this.sinon.stub(window.indexedDB, 'open');
      window.indexedDB.open.returns(request);

      fakeDB.transaction.returns(fakeDB);
      fakeDB.objectStore.returns(fakeDB);
      fakeDB.put.returns(transRequest);

      jspinyin._accessUserDict('save', fakeUserDict,
        function(isOk) {
          assert.isFalse(isOk);
          done();
        }
      );

      assert.isFunction(request.onupgradeneeded);
      assert.isFunction(request.onsuccess);

      request.onupgradeneeded(evt);
      request.onsuccess(evt);

      assert.isFunction(transRequest.onsuccess);
      transRequest.onerror({
        target: {
          result: {
            name: 'test'
          }
        }
      });
    });
  });

  suite('emEngineWrapper', function() {
    var emEngineWrapper;
    var worker;
    var firstCandidateOfZ = '在';
    var tenthCandidateOfZ = '之';
    var lastCandidateOfZ = '齱';
    var expectCandidates = [7, 674, 948, 736, 85, 473, 613, 814, 0, 1241, 447,
                            1239, 626, 381, 5, 528, 868, 257, 1075, 747, 0, 0,
                            523, 1148, 1444, 1431];

    suiteSetup(function() {
      assert.isDefined(UnitTest.emEngineWrapper);
      emEngineWrapper = UnitTest.emEngineWrapper;
      emEngineWrapper.uninit();
    });

    test('init', function(done) {
      assert.isFalse(emEngineWrapper.isReady());

      emEngineWrapper.init('../../js/imes/jspinyin', fakeUserDict,
        function(isOk) {
          assert.isTrue(isOk);
          assert.isTrue(emEngineWrapper.isReady());
          done();
        }
      );
    });

    test('init twice', function(done) {
      assert.isTrue(emEngineWrapper.isReady());

      emEngineWrapper.init('../../js/imes/jspinyin', fakeUserDict,
        function(isOk) {
          assert.isTrue(isOk);
          assert.isTrue(emEngineWrapper.isReady());
          done();
        }
      );
    });

    test('get userdict', function(done) {
      emEngineWrapper.post('im_get_user_dict_data', {}, function(byteArray) {
        assert.deepEqual(byteArray, fakeUserDict);
        done();
      });
    });

    test('flush cache', function(done) {
      emEngineWrapper.post('im_flush_cache', {}, done);
    });

    test('search a ~ z', function(done) {
      var ptr = 0;
      (function searchNext() {
        if (ptr >= expectCandidates.length) {
          done();
          return;
        }

        emEngineWrapper.post('im_search', {
          queryString: String.fromCharCode('a'.charCodeAt(0) + ptr),
          limit: -1
        }, function(returnValue) {
          var num = returnValue.length;
          assert.equal(returnValue.length, expectCandidates[ptr]);
          ptr++;
          searchNext();
        });
      })();
    });

    test('search \'z\' and check candidates', function(done) {
      emEngineWrapper.post('im_search', {
        queryString: 'z',
        limit: 10
      }, function(returnValue) {
        var candidates = returnValue.results;
        assert.equal(candidates[0], firstCandidateOfZ);
        assert.equal(candidates[candidates.length - 1], tenthCandidateOfZ);
        done();
      });
    });

    test('get more candidates', function(done) {
      emEngineWrapper.post('im_get_candidates', {
        start: 9,
        count: expectCandidates[25]
      }, function(candidates) {
        assert.equal(candidates[0], tenthCandidateOfZ);
        assert.equal(candidates[candidates.length - 1], lastCandidateOfZ);
        done();
      });
    });

    test('choose first candidate', function(done) {
      emEngineWrapper.post('im_choose', {
        candId: 0
      }, function(text) {
        assert.equal(text, firstCandidateOfZ);
        done();
      });
    });

    test('search \'' + firstCandidateOfZ + '\' and get first and last predicts',
      function(done) {
        emEngineWrapper.post('im_search_predicts', {
          queryString: firstCandidateOfZ,
          limit: 10
        }, function(returnValue) {
          var num = returnValue.length;
          var predicts = returnValue.results;
          assert.equal(num, 98);
          assert.equal(predicts[0], '线');
          assert.equal(predicts[predicts.length - 1], '意');
          done();
        });
      }
    );

    test('get more predicts', function(done) {
      emEngineWrapper.post('im_get_predicts', {
        start: 9,
        count: 98
      }, function(predicts) {
        assert.equal(predicts[0], '意');
        assert.equal(predicts[predicts.length - 1], '新窗口');
        done();
      });
    });

    test('get pending symbols', function(done) {
      var composition = 'xdjm';

      emEngineWrapper.post('im_search', {
        queryString: composition,
        limit: 0
      }, null);

      emEngineWrapper.post(
        'im_get_pending_symbols_info',
        {},
        function(returnValue) {
          var fixedLen = returnValue.fixedLen;
          var splStart = returnValue.splStart;
          var splStartLen = splStart.length;
          var display = '';

          if (splStartLen > 1) {
            for (var i = fixedLen; i < splStartLen - 1; i++) {
              display += composition.substring(splStart[i],
                                                        splStart[i + 1]) + ' ';
            }
            display += composition.substring(splStart[splStartLen - 1]);
          } else {
            display += composition;
          }

          assert.equal(display.trim(), 'x d j m');
          done();
        }
      );
    });

    test('test userdict', function(done) {
      emEngineWrapper.post('im_search', {
        queryString: 'mouzhi',
        limit: 1
      }, function(returnValue) {
        var candidates = returnValue.results;
        assert.equal(candidates[0], '谋智');
        done();
      });
    });

    test('uninit', function() {
      emEngineWrapper.uninit();
      assert.isFalse(emEngineWrapper.isReady());
    });
  });
});
