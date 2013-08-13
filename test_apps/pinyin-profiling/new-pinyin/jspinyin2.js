'use strict';

function JSPinyinEngine() {}

JSPinyinEngine.prototype = (function() {
  var _table;
  var _results;
  var _py;

  function _py2mask(py) {
    var code = 0;

    for(var i = 0; i < py.length; i++) {
      code |= (31 << (5 * i));
    }

    return code;
  }

  function _py2code(py) {
    var code = 0;

    for(var i = 0; i < py.length; i++) {
      code |= (py.charCodeAt(i) - 96) << (5 * i);
    }

    return code;
  }

  //////////////////////////////////////////////////////////////////////////

  function JSPinyinEngine_reset() {
    _py = '';
    _results = [];
  }

  function JSPinyinEngine_init(callback) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "db.json", true);
      xhr.responseType = 'json';
      xhr.onload = function() {
        _table = xhr.response;
        JSPinyinEngine_reset();
        if(callback) callback(true);
      };
      xhr.send(null);
    } catch(e) {
      console.error(e.message);
      if(callback) callback(false);
    }
  }

  function JSPinyinEngine_uninit() {
    JSPinyinEngine_reset();
    _table = null;
  }

  function JSPinyinEngine_addChar(char) {
    if(! _table) return 0;

    if(_py == '') {
      _py = char;
      return JSPinyinEngine_search(char);
    }

    _py += char;

    var table = _table;
    var tableLen = table.length;

    var keyword = _py;
    var keywordLen = keyword.length;

    var code = _py2code(keyword);
    var mask = _py2mask(keyword);

    var single_code = _py2code(char);
    var single_mask = _py2mask(char);

    var firstCandidate = '';
    var result = [];
    var seps = new Array(4);
    var prelen = 4;

    var pre_result = _results[keywordLen - 2];
    var pre_cands = pre_result.candidates;
    var pre_cands_length = pre_cands.length;

    for (var i = 0 ; i < pre_cands_length; i++) {
      var id = pre_cands[i][0];
      var pre_matched_pos = pre_cands[i][1];
      var item = table[id];

      var matched;

      if((item[1 +  pre_matched_pos] & mask) == code) {
        matched = 1;
      } else if(typeof item[2 + pre_matched_pos] !== 'undefined' &&
                (item[2 +  pre_matched_pos] & single_mask) == single_code ) {
        matched = 2;
      } else {
        matched = 0;
      }

      if(matched) {
        for( ; prelen > item[0].length; prelen--) {
          seps[4 - prelen] = result.length;
        }

        result.push([id, pre_matched_pos + matched - 1]);
      }
    }

    seps[3] = result.length;

    _results[keywordLen - 1] = {
      firstCandidate: firstCandidate,
      candidates: result,
      seps: seps
    };

    return seps;
  }

  function JSPinyinEngine_search(keyword) {
    if(! _table) return 0;

    var table = _table;
    var tableLen = table.length;

    var code = _py2code(keyword);
    var mask = _py2mask(keyword);

    var result = [];
    var seps = new Array(4);
    var prelen = 4;

    for(var i = 0; i < tableLen; i++) {
      if((table[i][1] & mask) == code) {
        for( ; prelen > table[i][0].length; prelen--) {
          seps[4 - prelen] = result.length;
        }

        result.push([i, 0]);
      }
    }

    seps[3] = result.length;

    _results[0] = {
      pinyin: keyword,
      firstCandidate: table[ result[0][0] ][0],
      candidates: result,
      seps: seps
    };

    return seps;
  }

  function JSPinyinEngine_getCandidates() {
    var table = _table;
    var result = _results[ _results.length - 1 ];

    var cands = result.candidates;
    var head = result.seps[2];
    var tail = result.seps[3];

    var candidates = [];

    for(var i = head; i < tail; i++) {
      candidates.push(table[ cands[i][0] ][0]);
    }

    return candidates;
  }

  ///////////////////////////////////////

  return {
    init: JSPinyinEngine_init,
    uninit: JSPinyinEngine_uninit,
    addChar: JSPinyinEngine_addChar,
    search: JSPinyinEngine_search,
    reset: JSPinyinEngine_reset,
    getCandidates: JSPinyinEngine_getCandidates
  }
})();
