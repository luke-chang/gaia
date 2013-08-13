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

    var keyword = _py;
    var keywordLen = keyword.length;

    if (keywordLen == 2) {
      var table = _table[0];

      var result = [];

      var pre_result = _results[keywordLen - 2];
      var pre_cands = pre_result.candidates;
      var pre_cands_length = pre_cands.length;

      var code = _py2code(keyword);
      var mask = _py2mask(keyword);

      for(var i = 0; i < pre_cands_length; i++) {
        var id = pre_cands[i][0];
        var pre_matched_pos = pre_cands[i][1];

        if((table[id][1 +  pre_matched_pos] & mask) == code) {
          result.push([id, pre_matched_pos]);
        }
      }

      if (result.length > 0) {
        _results[keywordLen - 1] = {
          table: pre_result.table,
          pinyin: keyword,
          firstCandidate: table[ result[0][0] ][0],
          candidates: result
        };

        return result.length;
      }

      table = _table[keywordLen - 1];

      var pinyin = [];
      code = [];
      mask = [];

      for(var i = 0; i < keyword.length; i++) {
        var c = keyword.charAt(i);
        pinyin.push(c);
        code.push(_py2code(c));
        mask.push(_py2mask(c));
      }

      for(var i = 0; i < table.length; i++) {
        var matched = true;

        for(var j = 0; j < keywordLen; j++) {
          if((table[i][j + 1] & mask[j]) != code[j]) {
            matched = false;
            break;
          }
        }

        if(matched) {
          result.push([i, keywordLen - 1]);
        }
      }

      if (result.length > 0) {
        _results[keywordLen - 1] = {
          table: keywordLen - 1,
          pinyin: pinyin.join(' '),
          firstCandidate: table[ result[0][0] ][0],
          candidates: result
        };

        return result.length;
      }
    }

    /*var table = _table;
    var tableLen = table.length;


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

    return seps;*/
  }

  function JSPinyinEngine_search(keyword) {
    if(! _table) return 0;

    var table = _table[0];
    var tableLen = table.length;

    var code = _py2code(keyword);
    var mask = _py2mask(keyword);

    var result = [];
    var prelen = 4;

    for(var i = 0; i < tableLen; i++) {
      if((table[i][1] & mask) == code) {
        result.push([i, 0]);
      }
    }

    _results[0] = {
      table: 0,
      pinyin: keyword,
      firstCandidate: table[ result[0][0] ][0],
      candidates: result
    };

    return result.length;
  }

  function JSPinyinEngine_getCandidates() {
    var result = _results[ _results.length - 1 ];
    var table = _table[result.table];

    var cands = result.candidates;
    var cands_length = cands.length;
    var candidates = [];

    for(var i = 0; i < cands_length; i++) {
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
