var table;

/*function log(message) {
  var logDiv = document.getElementById('log');
  logDiv.innerHTML = new Date() + ' : ' + message + "<br>" + logDiv.innerHTML;
}*/

function output(message) {
  var outputDiv = document.getElementById('output');
  outputDiv.innerHTML = message;
}

window.addEventListener('load', function() {
  log('load database...');

  var xhr = new XMLHttpRequest();
  xhr.open("GET", "db.json", true);
  xhr.onreadystatechange = function() {
    if(xhr.readyState == 4) {
      window.table = JSON.parse(xhr.responseText);
      log('database loaded!');

      document.getElementById('test').addEventListener('click', test);
      document.getElementById('test2').addEventListener('click', test2);

      //test();
    }
  };
  xhr.send(null);
});

function test2() {
  keyword = document.getElementById('pinyin').value;

  try {
    log('search ' + testRepeatCount + ' times keyword ' + keyword);

    var startTime = new Date().getTime();
    var size = 0;

    for (var i = 0; i < testRepeatCount; i++) {
      size = test();
    }

    var endTime = new Date().getTime();

    log('total cost: ' + (endTime - startTime) + 'ms');
    log('average cost: ' + ((endTime - startTime) / testRepeatCount) + 'ms');
    log('length: ' + size);
  } catch (e) {
    log('error: ' + e);
  }
}

function test() {
  var input = document.getElementById('pinyin').value.trim();
  var code = py2code(input);
  var mask = py2mask(input);
  var tableLen = table.length;

  var result = [];
  var seps = [];
  var prelen = 1;

  for(var i = 0; i < tableLen; i++) {
    if((table[i][1] & mask) == code) {
      if(table[i][0].length != prelen) {
        seps.push(result.length);
        prelen = table[i][0].length;
      }

      result.push(i);
    }
  }

  /*var s = '';

  for(var i = 0; i < seps[0]; i++) {
    s += table[ result[i] ][0];
  }

  output(s);*/

  var count = seps[0];

  result = null;
  seps = null;

  return count;
}

function py2mask(py) {
  var code = 0;

  for(var i = 0; i < py.length; i++) {
    code |= (31 << (5 * i));
  }

  return code;
}

function py2code(py) {
  var code = 0;

  for(var i = 0; i < py.length; i++) {
    code |= (py.charCodeAt(i) - 96) << (5 * i);
  }

  return code;
}
