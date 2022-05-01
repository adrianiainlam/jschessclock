"use strict";

function Timer(id) {
  var precision = 100; // milliseconds
  var defaultTime = (15 * 60 + 0) * 1000; // milliseconds
  var time = defaultTime;
  var intervalID;
  this.isTicking = false;
  var increment = 0;
  var defaultIncrement = 0;

  var outputTime = function() {
    document.getElementById(id).innerHTML = timeToTimeStr(time);
    var flagid = "flag-" + id.split('-')[1];
    var flagelem = document.getElementById(flagid);
    flagelem.style.visibility = time <= 0 ? "visible" : "hidden";
    var incid = "increment-" + id.split('-')[1];
    var incelem = document.getElementById(incid);
    incelem.innerHTML = "+" + (increment / 1000).toString();
    incelem.style.visibility = increment > 0 ? "visible" : "hidden";
  };

  var startTickingUnixTime = null;
  var remainingTimeAtTickingStart = null;

  var thisTimer = this; // workaround to use this in setInterval
  this.tick = function() {
    var currentPassedTime = new Date() - startTickingUnixTime;
    time = remainingTimeAtTickingStart - currentPassedTime;
    if(time <= 0) {
      time = 0;
      // time's up
      clearInterval(intervalID);
      thisTimer.isTicking = false;
    }
    outputTime();
  };
  this.start = function() {
    startTickingUnixTime = new Date();
    remainingTimeAtTickingStart = time;
    intervalID = setInterval(this.tick, precision);
    this.isTicking = true;
  };
  this.stop = function(toggle = false) {
    clearInterval(intervalID);
    this.isTicking = false;
    if (toggle && this.getTime() > 0) {
      this.setTime(this.getTime() + increment, increment, true);
    }
  };
  this.setTime = function(t, inc = 0, toggle = false) {
    time = t;
    increment = inc;
    if (!toggle) {
      defaultTime = t;
      defaultIncrement = inc;
    }
    outputTime();
  };
  this.getTime = function() {
    return time;
  };
  this.reset = function() {
    if(this.isTicking) {
      this.stop();
    }
    this.setTime(defaultTime, defaultIncrement);
  };
  this.getDefaultTime = function() {
    return defaultTime;
  };
}

var currentTimers = new (function() {
  this.leftTimer  = new Timer("timer-left");
  this.rightTimer = new Timer("timer-right");
  this.active     = this.leftTimer;
  this.passive    = this.rightTimer;
  this.isPaused   = true;
  this.swap = function() {
    var tmp        = this.passive;
    this.passive   = this.active;
    this.active    = tmp;
    var icon       = document.getElementById("play");
    icon.innerHTML = (icon.innerHTML == "⏴" ? "⏵" : "⏴");
  };
  this.pause = function() {
    this.active.stop();
    this.isPaused = true;
    document.getElementById("pause").style.visibility = "visible";
  };
  this.resume = function() {
    this.active.start();
    this.isPaused = false;
    document.getElementById("pause").style.visibility = "hidden";
  };
})();

function timeStrToTime(timeStr) {
  var minute = parseInt(timeStr.substr(0, 2));
  var second = parseInt(timeStr.substr(3, 2));
  return (minute * 60 + second) * 1000;
}

function timeToTimeStr(time) {
  var minute = Math.floor(time / 1000 / 60);
  var second = Math.floor(time / 1000) % 60;
  if(minute < 10) {
    minute = '0' + minute.toString();
  }
  if(second < 10) {
    second = '0' + second.toString();
  }
  return minute + ':' + second;
}

document.onkeydown = function(e) {
  if(e.key) {
    switch(e.key) {
      case ' ': return toggle();
      case 'S':
      case 's': return setTime();
      case 'R':
      case 'r': return reset();
      case 'p':
      case 'P': return pauseResume();
      default:  return;
    }
  } else if(e.keyCode) {
    switch(e.keyCode) {
      case 32: return toggle();      // space
      case 83: return setTime();     // S
      case 82: return reset();       // R
      case 80: return pauseResume(); // P
      default: return;
    }
  } else {
    alert("Browser not supported");
  }
};

function toggle() {
  if(!currentTimers.isPaused) {
    currentTimers.active.stop(true);
    currentTimers.passive.start();
  }
  currentTimers.swap();
  var lbt = document.getElementById('left-button-top');
  var leftIsLong = lbt.getAttribute('class') == 'button-long';
  var lbt_d = lbt.getAttribute('d').split(' ');
  var lbb = document.getElementById('left-button-body');
  var rbt = document.getElementById('right-button-top');
  var rbt_d = rbt.getAttribute('d').split(' ');
  var rbb = document.getElementById('right-button-body');

  var y_diff = 50 * (leftIsLong ? 1 : -1);
  var classes = ['button-short', 'button-long'];

  lbt_d[2] = (parseInt(lbt_d[2]) + y_diff).toString();
  lbt_d[10] = (parseInt(lbt_d[10]) + y_diff).toString();
  lbb.setAttribute('height',
      (parseInt(lbb.getAttribute('height')) - y_diff).toString());
  lbb.setAttribute('y', (parseInt(lbb.getAttribute('y')) + y_diff).toString());
  rbt_d[2] = (parseInt(rbt_d[2]) - y_diff).toString();
  rbt_d[10] = (parseInt(rbt_d[10]) - y_diff).toString();
  rbb.setAttribute('height',
      (parseInt(rbb.getAttribute('height')) + y_diff).toString());
  rbb.setAttribute('y', (parseInt(rbb.getAttribute('y')) - y_diff).toString());
  lbt.setAttribute('class', classes[(leftIsLong + 1) % 2]);
  lbb.setAttribute('class', classes[(leftIsLong + 1) % 2]);
  rbt.setAttribute('class', classes[(leftIsLong + 1) % 2]);
  rbb.setAttribute('class', classes[(leftIsLong + 1) % 2]);
  lbt.setAttribute('d', lbt_d.join(' '));
  rbt.setAttribute('d', rbt_d.join(' '));

  lbt.setAttribute('onclick', leftIsLong ? '' : 'toggle()');
  lbb.setAttribute('onclick', leftIsLong ? '' : 'toggle()');
  lbt.setAttribute('cursor', leftIsLong ? 'default' : 'pointer');
  lbb.setAttribute('cursor', leftIsLong ? 'default' : 'pointer');
  rbt.setAttribute('onclick', leftIsLong ? 'toggle()' : '');
  rbb.setAttribute('onclick', leftIsLong ? 'toggle()' : '');
  rbt.setAttribute('cursor', leftIsLong ? 'pointer' : 'default');
  rbb.setAttribute('cursor', leftIsLong ? 'pointer' : 'default');
}

function pauseResume() {
  if(currentTimers.isPaused) {
    currentTimers.resume();
  } else {
    currentTimers.pause();
  }
}

function setTime() {
  var leftstart, rightstart;
  var def = timeToTimeStr(currentTimers.leftTimer.getDefaultTime());
  var regex = /[0-9][0-9]:[0-5][0-9](\+[0-9]+)?/;

  leftstart = prompt("Time for LEFT player in MM:SS or MM:SS+S", def);
  if(leftstart === null) return; // Cancel
  while(!leftstart.match(regex)) {
    leftstart = prompt("Invalid value\nTime for LEFT player in MM:SS or MM:SS+S", def);
    if(leftstart === null) return; // Cancel
  }
  def = leftstart;
  rightstart = prompt("Time for RIGHT player in MM:SS or MM:SS+S", def);
  if(rightstart === null) return; // Cancel
  while(!rightstart.match(regex)) {
    rightstart = prompt("Invalid value\nTime for RIGHT player in MM:SS or MM:SS+S", def);
    if(rightstart === null) return; // Cancel
  }

  if(leftstart.indexOf('+') > 0) {
    var baseTime = leftstart.split('+')[0];
    var inc = leftstart.split('+')[1];
    currentTimers.leftTimer.setTime(timeStrToTime(baseTime), parseInt(inc) * 1000);
  }
  else {
    currentTimers.leftTimer.setTime(timeStrToTime(leftstart));
  }
  if(rightstart.indexOf('+') > 0) {
    var baseTime = rightstart.split('+')[0];
    var inc = rightstart.split('+')[1];
    currentTimers.rightTimer.setTime(timeStrToTime(baseTime), parseInt(inc) * 1000);
  }
  else {
    currentTimers.rightTimer.setTime(timeStrToTime(leftstart));
  }
}

function reset() {
  currentTimers.pause();
  currentTimers.active.reset();
  currentTimers.passive.reset();
}

function init() {
  insertcss();
  setTimeout(fitscreen, 2000); // hack to allow DOM to be redrawn with new css
}

function fitscreen() {
  /*
   * Scale body so as to fit the screen
   */
  var heightRatio =  window.innerHeight / document.body.scrollHeight;
  var widthRatio = window.innerWidth / document.body.scrollWidth;
  var scaleRatio = Math.min(heightRatio, widthRatio, 1);
  document.body.style.transform = 'scale(' + scaleRatio + ')';
}

function insertcss() {
  /* fix positions for browsers that don't support flex */
  var cssfile = document.getElementById("style");
  if(!('align-items' in document.body.style)) {
    cssfile.setAttribute("href", "noflex.css");
  }
}
