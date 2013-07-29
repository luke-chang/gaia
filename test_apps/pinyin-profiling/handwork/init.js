const LAYOUT_PAGE_DEFAULT = 'Default';

window.addEventListener('load', function() {
  window.InputMethods = {};

  script_files = document.createElement('script');
  script_files.src = './jspinyin.js?' + Math.random();
  script_files.onload = function() {
    window.InputMethods.jspinyin.init({ path: "." });

    document.getElementById('test').onclick = function() {
      var startTime, endTime;

      startTime = new Date().getTime();
      var num = PinyinDecoderService.search(document.getElementById('pinyin').value);
      endTime = new Date().getTime();

      log('cost: ' + (endTime - startTime) + 'ms');

      var candidates = new Array(num);
      for (var id = 0; id < num; id++) {
        var strs = PinyinDecoderService.getCandidate(id);
        candidates[id] = strs[0];
      }

      log('length: ' + num);
      //log('candidates: ' + candidates);

      PinyinDecoderService.resetSearch();
      delete candidates;
    };

    document.getElementById('test2').onclick = function() {
      var startTime, endTime;
      var result = new Array(testRepeatCount);

      startTime = new Date().getTime();
      for(var i = 0; i < testRepeatCount; i++) {
        result[i] = PinyinDecoderService.search(document.getElementById('pinyin').value);
        PinyinDecoderService.resetSearch();
      }
      endTime = new Date().getTime();

      log('total cost: ' + (endTime - startTime) + 'ms');
      log('average cost: ' + ((endTime - startTime) / testRepeatCount) + 'ms');
      log('length: ' + result[0]);
    };

    document.getElementById('clear').onclick = function() {
      document.getElementById('log').innerHTML = '';
    }
  };
  document.getElementsByTagName('head')[0].appendChild(script_files);

  function getLoggerTime() {
    var date = new Date();
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ":" + date.getMilliseconds();
  }

  function log(msg) {
    var divLog = document.getElementById('log');
    var p = document.createElement('p');
    p.innerHTML = getLoggerTime() + ' : ' + msg;
    divLog.insertBefore(p, divLog.firstChild);
  }
});
