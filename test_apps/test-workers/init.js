function log(message) {
  var logDiv = document.getElementById('log');

  if(logDiv.children.length > 100) {
    logDiv.innerHTML = '';
  }

  var div = document.createElement('div');
  div.innerHTML = message;
  logDiv.insertBefore(div, logDiv.firstChild);

  console.log(message);
}

window.addEventListener('load', function() {
  var objWorkerCount = document.getElementById('worker-count');
  var worker = [];

  for(var i = 0; i < 10; i++) {
    var obj = document.createElement('option');
    obj.innerHTML = obj.value = i + 1;
    objWorkerCount.appendChild(obj);
  }

  objWorkerCount.value = 4;

  document.getElementById('start').disabled = false;
  document.getElementById('stop').disabled = true;

  document.getElementById('start').addEventListener('click', function() {
    log('Start workers');

    document.getElementById('start').disabled = true;
    document.getElementById('stop').disabled = false;

    var workerNumber = objWorkerCount.value;

    for(var i = 0; i < workerNumber; i++) {
      worker[i] = new Worker('thread.js');
      worker[i].addEventListener('message', (function(id) {
        return function (e) {
          log('Worker ' + id + ':' + e.data);
        }
      })(i));
    }
  });

  document.getElementById('stop').addEventListener('click', function() {
    log('Stop workers');

    document.getElementById('start').disabled = false;
    document.getElementById('stop').disabled = true;

    worker.forEach(function(w) {
      w.terminate();
    });

    worker = [];
  });
});
