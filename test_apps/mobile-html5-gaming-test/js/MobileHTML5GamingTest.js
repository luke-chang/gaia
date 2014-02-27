var assets = {
	"EnemySouth1":"assets/monster/s1.png", "EnemySouth2":"assets/monster/s2.png", "EnemySouth3":"assets/monster/s3.png",
	"EnemyEast1":"assets/monster/e1.png", "EnemyEast2":"assets/monster/e2.png", "EnemyEast3":"assets/monster/e3.png",
	"EnemyWest1":"assets/monster/w1.png", "EnemyWest2":"assets/monster/w2.png", "EnemyWest3":"assets/monster/w3.png",
	"EnemyNorth1":"assets/monster/n1.png", "EnemyNorth2":"assets/monster/n2.png", "EnemyNorth3":"assets/monster/n3.png"
};

function preloadAssets(){
	var preloaded = 0;
	var count = 0;
	for(var asset in assets){
		count++;
		var img = new Image();
		img.onload = function(){
			preloaded++;
			if(preloaded == count){
				init();
			}
		}
		img.src = assets[asset];
		assets[asset] = img;
	}
}

var meter;
var fps;
var draw;
var results;
var monsters = [];

function init(){
	var southWalk = [assets["EnemySouth1"], assets["EnemySouth2"], assets["EnemySouth3"], assets["EnemySouth2"]];
	var eastWalk = [assets["EnemyEast1"], assets["EnemyEast2"], assets["EnemyEast3"], assets["EnemyEast2"]];
	var westWalk = [assets["EnemyWest1"], assets["EnemyWest2"], assets["EnemyWest3"], assets["EnemyWest2"]];
	var northWalk = [assets["EnemyNorth1"], assets["EnemyNorth2"], assets["EnemyNorth3"], assets["EnemyNorth2"]];
	var R = Math.PI/180;

	//create monsters
	for(var i=0; i<20; i++){
		var speed = 3+(Math.random()*2);
		var angle = Math.random()*360;

		var fb = null;
		if(angle >= 45 && angle < 135){
			fb = new FramedBitmap(southWalk);
		}else if(angle >= 135 && angle < 225){
			fb = new FramedBitmap(westWalk);
		}else if(angle >= 225 && angle < 315){
			fb = new FramedBitmap(northWalk);
		}else{
			fb = new FramedBitmap(eastWalk);
		}
		fb.x = Math.random()*440;
		fb.y = Math.random()*320;
		fb.xMove = Math.cos(angle*R)*speed;
		fb.yMove = Math.sin(angle*R)*speed;
		fb.scale = 0.5+(Math.random()*0.7);
		fb.randomize();
		monsters.push(fb);
	}

	var canvas = document.getElementById('canvas');
	draw = canvas.getContext('2d');
	fps = document.getElementById("current");
	results = document.getElementById("results");
	meter = new FPSMeter();
	setInterval(processFrame, 17);
}

function processFrame(){
	draw.clearRect(0,0,320,440);

	//position monsters
	for(var i=0; i<monsters.length; i++){
		var fb = monsters[i];
		fb.x += fb.xMove;
		fb.y += fb.yMove;
		if(fb.x < -40){
			fb.x += 360;
		}else if(fb.x > 320){
			fb.x -= 360;
		}
		if(fb.y < -40){
			fb.y += 480;
		}else if(fb.y > 440){
			fb.y -= 480;
		}

		draw.save();
		draw.scale(fb.scale, fb.scale);
		draw.drawImage(fb.getNextBitmap(), fb.x/fb.scale, fb.y/fb.scale);
		draw.restore();
	}

	updatePerformance();
}

function updatePerformance(){
	meter.increment();
	fps.innerHTML = meter.getFramerate()+" fps";
	if(testRunning){
		continueTest();
	}
}

//test runner
var testBegin = 0;
var testData = [];
var testRunning = false;
function startTest(){
	testBegin = TimeUtil.getTimer();
	testRunning = true;
	testData = [];
	results.innerHTML = "Running..."
}
function continueTest(){
	var time = TimeUtil.getTimer();
	testData.push(time);
	if(time-testBegin > 10000){
		testRunning = false;
		var output = testData.length/(time-testBegin)*1000;
		results.innerHTML = "Test: "+FPSMeter.formatNumber(output)+" fps"
	}
}

//additional classes
function FramedBitmap(sourceArray){
	var bitmaps = sourceArray;

	this.frame = 0;
	this.increment = function(){
		if(++this.frame >= bitmaps.length){
			this.frame = 0;
		}
	}
	this.randomize = function(){
		this.frame = Math.floor(Math.random()*bitmaps.length);
	}
	this.getBitmap = function(){
		return bitmaps[this.frame];
	}
	this.getNextBitmap = function(){
		this.increment();
		return this.getBitmap();
	}
}

function FPSMeter(){
	var sampleFPS = 0;
	var lastSampledTime = 0;
	var sampleFrames = 0;

	this.sampleDuration = 500;
	this.increment = function(){
		sampleFrames++;
	}
	this.getFramerate = function(){
		var diff = TimeUtil.getTimer()-lastSampledTime;
		if(diff >= this.sampleDuration){
			var rawFPS = sampleFrames/(diff/1000);
			sampleFPS = FPSMeter.formatNumber(rawFPS);
			sampleFrames = 0;
			lastSampledTime = TimeUtil.getTimer();
		}
		return sampleFPS;
	}
}
FPSMeter.formatNumber = function(val){
	//format as XX.XX
	return Math.floor(val*100)/100;
}

TimeUtil = {
	startTime: new Date().getTime(),
	getTimer: function(){
		return new Date().getTime()-TimeUtil.startTime;
	}
}

window.onload = function() {
  preloadAssets();
  document.getElementById('btnStart').onclick = startTest;
};
