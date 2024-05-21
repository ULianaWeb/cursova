import '../css/styles.scss';
let Meter = function Meter($elm, config) {

  let $needle, $value;

  let steps = (config.valueMax - config.valueMin) / config.valueStep,
    angleStep = (config.angleMax - config.angleMin) / steps;

  let margin = 10;
  let angle = 0;

  let value2angle = function(value) {
    let angle = ((value / (config.valueMax - config.valueMin)) * (config.angleMax - config.angleMin) + config.angleMin);

    return angle;
  };

  this.setValue = function(v) {
    $needle.style.transform = "translate3d(-50%, 0, 0) rotate(" + Math.round(value2angle(v)) + "deg)";
    $value.innerHTML = config.needleFormat(v);
  };

  let switchLabel = function(e) {
    e.target.closest(".meter").classList.toggle('meter--big-label');
  };

  let makeElement = function(parent, className, innerHtml, style) {

    let	e = document.createElement('div');
    e.className = className;

    if (innerHtml) {
      e.innerHTML = innerHtml;
    }

    if (style) {
      for (var prop in style) {
        e.style[prop] = style[prop];
      }
    }

    parent.appendChild(e);

    return e;
  };

  makeElement($elm, "label label-unit", config.valueUnit);

  for (let n=0; n < steps+1; n++) {
    let value = config.valueMin + n * config.valueStep;
    angle = config.angleMin + n * angleStep;
    let redzoneClass = "";
    if (value > config.valueRed) {
      redzoneClass = " redzone";
    }

    makeElement($elm, "grad grad--" + n + redzoneClass, config.labelFormat(value), {
      left: (50 - (50 - margin) * Math.sin(angle * (Math.PI / 180))) + "%",
      top: (50 + (50 - margin) * Math.cos(angle * (Math.PI / 180))) + "%"
    });

    makeElement($elm, "grad-tick grad-tick--" + n + redzoneClass, "", {
      left: (50 - 50 * Math.sin(angle * (Math.PI / 180))) + "%",
      top: (50 + 50 * Math.cos(angle * (Math.PI / 180))) + "%",
      transform: "translate3d(-50%, 0, 0) rotate(" + (angle + 180) + "deg)"
    });

    angle += angleStep / 2;

    if (angle < config.angleMax) {
      makeElement($elm, "grad-tick grad-tick--half grad-tick--" + n + redzoneClass, "", {
        left: (50 - 50 * Math.sin(angle * (Math.PI / 180))) + "%",
        top: (50 + 50 * Math.cos(angle * (Math.PI / 180))) + "%",
        transform: "translate3d(-50%, 0, 0) rotate(" + (angle + 180) + "deg)"
      });
    }

    angle += angleStep / 4;

    if (angle < config.angleMax) {
      makeElement($elm, "grad-tick grad-tick--quarter grad-tick--" + n + redzoneClass, "", {
        left: (50 - 50 * Math.sin(angle * (Math.PI / 180))) + "%",
        top: (50 + 50 * Math.cos(angle * (Math.PI / 180))) + "%",
        transform: "translate3d(-50%, 0, 0) rotate(" + (angle + 180) + "deg)"
      });
    }

    angle -= angleStep / 2;

    if (angle < config.angleMax) {
      makeElement($elm, "grad-tick grad-tick--quarter grad-tick--" + n + redzoneClass, "", {
        left: (50 - 50 * Math.sin(angle * (Math.PI / 180))) + "%",
        top: (50 + 50 * Math.cos(angle * (Math.PI / 180))) + "%",
        transform: "translate3d(-50%, 0, 0) rotate(" + (angle + 180) + "deg)"
      });
    }
  }

  angle = value2angle(config.value);

  $needle = makeElement($elm, "needle", "", {
    transform: "translate3d(-50%, 0, 0) rotate(" + angle + "deg)"
  });

  let $axle = makeElement($elm, "needle-axle").addEventListener("click", switchLabel);
  makeElement($elm, "label label-value", "<div>" + config.labelFormat(config.value) + "</div>" + "<span>" + config.labelUnit + "</span>").addEventListener("click", switchLabel);

  $value = $elm.querySelector(".label-value div");
};


document.addEventListener("DOMContentLoaded", function() {
  let rpmMeter;
  let speedMeter;
  fetch('https://cursovaa.onrender.com/config')
    .then(response => response.json())
    .then(config => {
      initializeMeters(config);
    })
    .catch(error => {
      console.error('Error fetching configuration:', error);
    });
  let first=0;
  function initializeMeters(config) {
    if(first===0) {
      console.log(first)
      first++;
      rpmMeter = new Meter(document.querySelector(".meter--rpm"), {
        value: 6.3,
        valueMin: config.valueMin,
        valueMax: config.valueMax,
        valueStep: config.valueStep,
        valueUnit: config.valueUnit,
        angleMin: config.angleMin,
        angleMax: config.angleMax,
        labelUnit: config.labelUnit,
        labelFormat: function (v) {
          return Math.round(v / 1000);
        },
        needleFormat: function (v) {
          return Math.round(v / 100) * 100;
        },
        valueRed: 6500
      });
      speedMeter = new Meter(document.querySelector(".meter--speed"), {
        value: 203,
        valueMin: 0,
        valueMax: 220,
        valueStep: 20,
        valueUnit: "<span>Speed</span><div>Km/h</div>",
        angleMin: 30,
        angleMax: 330,
        labelUnit: "Km/h",
        labelFormat: function (v) {
          return Math.round(v);
        },
        needleFormat: function (v) {
          return Math.round(v);
        }
      });
    }
  }

  let gearMeter = document.querySelector('.meter--gear div');


  document.onkeydown = keyDown;
  document.onkeyup = keyUp;

  function keyDown(e) {

    e = e || window.event;

    if (e.keyCode == '38') {
      isAccelerating = true;
    }
    else if (e.keyCode == '40') {
      isBraking = true;
    }
    else if (e.keyCode == '37') {
    }
    else if (e.keyCode == '39') {
    }

  }

  function keyUp(e) {

    e = e || window.event;

    if (e.keyCode == '38') {
      isAccelerating = false;
    }
    else if (e.keyCode == '40') {
      isBraking = false;
    }
    else if (e.keyCode == '37') {
      gearDown();
    }
    else if (e.keyCode == '39') {
      gearUp();
    }

  }

  function gearUp() {
    if (gear < gears.length - 1) {
      gear++;
      gearMeter.innerHTML = gear;
    }
  }

  function gearDown() {
    if (gear > 1) {
      gear--;
      gearMeter.innerHTML = gear;
    }
  }


  let
    mass = 1000,
    cx = 0.28,
    gears = [0, 0.4, 0.7, 1.0, 1.3, 1.5, 1.68],
    transmitionRatio = 0.17,
    transmitionLoss = 0.15,
    wheelDiameter = 0.5,
    brakeTorqueMax = 300,

    gear = 1,
    speed = 10,
    overallRatio,
    wheelRpm,
    wheelTorque,
    brakeTorque,
    resistance,
    acceleration;


  let
    rpmIdle = 1200,
    rpmMax = 8000,
    rpmRedzone = 6500,
    torqueMin = 20,
    torqueMax = 45,

    torque,
    rpm = 0,
    isAccelerating = false,
    isBraking = false;

  let torqueByRpm = function(rpm) {
    let torque = torqueMin + (rpm / rpmMax) * (torqueMax - torqueMin);
    return torque;
  };

  function kmh2ms(speed) {
    return speed / 3.6;
  }


  let lastTime = new Date().getTime(),
    nowTime,
    delta;


  (function loop(){
    window.requestAnimationFrame(loop);

    nowTime = new Date().getTime();
    delta = (nowTime - lastTime) / 1000;
    lastTime = nowTime;

    let oldSpeed = speed,
      oldRpm = rpm;

    if (isAccelerating && rpm < rpmMax) {
      torque = torqueByRpm(rpm);

    } else {
      torque = -(rpm * rpm / 1000000);
    }

    if (isBraking) {
      brakeTorque = brakeTorqueMax;
    } else {
      brakeTorque = 0;
    }


    overallRatio = transmitionRatio * gears[gear];
    wheelTorque = torque / overallRatio - brakeTorque;

    acceleration = 20 * wheelTorque / (wheelDiameter * mass / 2);
    resistance = 0.5 * 1.2 * cx * kmh2ms(speed)^2;


    speed += (acceleration - resistance) * delta;


    if (speed < 0) { speed = 0; }

    wheelRpm = speed / (60 * (Math.PI * wheelDiameter / 1000));
    rpm = speed / (60 * transmitionRatio * gears[gear] * (Math.PI * wheelDiameter / 1000));

    if (rpm < rpmIdle) {
      rpm = oldRpm;
      speed = oldSpeed;
    }

    if (rpm > rpmRedzone) {
      gearMeter.classList.add('redzone');
    } else {
      gearMeter.classList.remove('redzone');
    }
    if(speedMeter!==undefined&&rpmMeter!==undefined){
      speedMeter.setValue(speed);
      rpmMeter.setValue(rpm);
    }
  })();


});
