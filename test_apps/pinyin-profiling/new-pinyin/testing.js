'use strict';

var Engine = new JSPinyinEngine();

function output(message) {
  var outputDiv = document.getElementById('output');
  outputDiv.innerHTML = message;
}

window.addEventListener('load', function() {
  log('loading database...');
  Engine.init(function(isOK) {
    if(isOK) {
      log('database ready!');

      document.getElementById('test').addEventListener('click', test);
      document.getElementById('test2').addEventListener('click', test2);
    } else {
      log('failed to load database!');
    }
  });
});

function test2() {
  var keyword = document.getElementById('pinyin').value;

  try {
    log('search ' + testRepeatCount + ' times keyword ' + keyword);

    var startTime = new Date().getTime();
    var size = 0;

    for (var i = 0; i < testRepeatCount; i++) {
      Engine.reset();
      size = Engine.search(keyword);
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
  var keyword = document.getElementById('pinyin').value.trim();
  var seps = Engine.addChar('z');
  log('length: ' + seps.join(','));

  seps = Engine.addChar('h');
  log('length: ' + seps.join(','));

  var candidates = Engine.getCandidates();
  log(candidates);
}
