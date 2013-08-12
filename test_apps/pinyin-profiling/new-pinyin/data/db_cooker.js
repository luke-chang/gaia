#!/usr/bin/env node

if(process.argv.length < 3) {
  console.error('Usage: db_cooker <rawdict> <(optional) valid>');
  process.exit();
}

require('fs').readFile(process.argv[2], 'UCS-2', function(err, data) {
  if(err) {
    console.error(err);
    process.exit();
  }

  var lines = data.substr(1).split(/\n/);

  if(process.argv.length > 3) {
    require('fs').readFile(process.argv[3], 'UCS-2', function(err, data) {
      var valid = data.substr(1);
      start(lines, valid);
    });
  } else {
    var valid = null;
    start(lines, valid);
  }
});

function start(lines, valid) {
  var words = [], phrases = [];
  var pinyin_max_length = 0; phrase_max_length = 0;
  var n = 0;

  lines.forEach(function(line) {
    if(line.length > 0) {
      var token = line.split(/\s+/);

      if(token.length < 4) {
        console.error('invalid rawdict: ' + line);
        process.exit();
      }

      var gbk_mark = parseInt(token[2]);

      if (valid) {
        for (var i = 0; i < token[0].length; i++) {
          var c = token[0].charAt(i);
          if (valid.indexOf(c) == -1) return;
        }
      } else {
        if (gbk_mark) return;
      }

      var item = {
        word: token[0],
        freq: parseFloat(token[1]),
        pinyin: token.slice(3),
        index: n++
      };

      if(item.word.length == 1) {
        words.push(item);
      } else {
        phrases.push(item);

        if(item.word.length > phrase_max_length) {
          phrase_max_length = item.word.length;
        }
      }

      item.pinyin.forEach(function(py) {
        if(py.length > pinyin_max_length) {
          pinyin_max_length = py.length;
        }
      });
    }
  });

  console.error(words.length);
  console.error(phrases.length);

  console.error(pinyin_max_length);
  console.error(phrase_max_length);

  var total = words.concat(phrases);

  total.sort(function(a, b) {
    if(a.word.length != b.word.length) return a.word.length - b.word.length;
    if(a.freq != b.freq) return b.freq - a.freq;
    return a.n - b.n;
  });

  var table = [];

  total.forEach(function(phrase) {
    var code = [];

    for(var i = 0; i < phrase.pinyin.length; i++) {
      code.push(py2code(phrase.pinyin[i]));
    }

    table.push([phrase.word].concat(code));
  });

  console.log(JSON.stringify(table));
}

function py2code(py) {
  var code = 0;

  for(var i = 0; i < py.length; i++) {
    code |= (py.charCodeAt(i) - 96) << (5 * i);
  }

  return code;
}
