const reportInterval = 5000; //ms

var preTime = 0;

while(true) {
  var t = new Date().getTime();

  if(t - preTime > reportInterval) {
    postMessage(t);
    preTime = t;
  }
}

