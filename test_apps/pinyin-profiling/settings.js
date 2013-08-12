var testRepeatCount = 10;

window.addEventListener('load', function() {
  document.getElementById('test2').value = 'test x ' + testRepeatCount;
});

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
