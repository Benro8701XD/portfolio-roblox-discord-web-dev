import {
  FlightPhysics,
  metersPerSecondToKnots,
  metersToFeet,
  radiansToDegrees
} from "./flight-physics.js";

const canvas = document.querySelector("#simCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  airspeed: document.querySelector("#airspeed"),
  altitude: document.querySelector("#altitude"),
  heading: document.querySelector("#heading"),
  throttle: document.querySelector("#throttle"),
  horizon: document.querySelector("#horizon"),
  telemetry: document.querySelector("#telemetryOutput"),
  status: document.querySelector("#systemStatus"),
  liftBar: document.querySelector("#liftBar"),
  dragBar: document.querySelector("#dragBar"),
  thrustBar: document.querySelector("#thrustBar"),
  weightBar: document.querySelector("#weightBar"),
  lessonTitle: document.querySelector("#lessonTitle"),
  lessonText: document.querySelector("#lessonText"),
  lessonStepLabel: document.querySelector("#lessonStepLabel"),
  lessonProgress: document.querySelector("#lessonProgress"),
  lessonPanel: document.querySelector("#lessonPanel")
};

const input = new Map();
let config;
let lessons;
let physics;
let activeLesson;
let activeStepIndex = 0;
let lastTime = performance.now();

const state = {
  position: { x: 0, y: 30, z: 0 },
  speed: 0,
  verticalSpeed: 0,
  pitch: 0,
  roll: 0,
  yaw: 0,
  heading: 0,
  throttle: 0,
  forces: {
    lift: 0,
    drag: 0,
    thrust: 0,
    weight: 0,
    stallWarning: false
  }
};

async function bootSimulator() {
  const [aircraftConfig, lessonData] = await Promise.all([
    fetch("./aircraft-config.json").then((res) => res.json()),
    fetch("./lessons.json").then((res) => res.json())
  ]);

  config = aircraftConfig;
  lessons = lessonData;
  physics = new FlightPhysics(config);
  activeLesson = lessons.lessons.find((lesson) => lesson.id === lessons.activeLesson);

  bindInput();
  updateLessonUI();
  requestAnimationFrame(loop);
}

function bindInput() {
  window.addEventListener("keydown", (event) => {
    input.set(event.key.toLowerCase(), true);

    if (event.key.toLowerCase() === "r") {
      resetAircraft();
    }

    if (event.key.toLowerCase() === "l") {
      ui.lessonPanel.hidden = !ui.lessonPanel.hidden;
    }
  });

  window.addEventListener("keyup", (event) => {
    input.set(event.key.toLowerCase(), false);
  });
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;

  updateControls(dt);
  updatePhysics(dt);
  updateLessonProgress();
  drawScene();
  updateHUD();

  requestAnimationFrame(loop);
}

function updateControls(dt) {
  const sensitivity = config.aircraft.controlSensitivity;

  const pitchInput = getAxis("w", "s");
  const rollInput = getAxis("d", "a");
  const yawInput = getAxis("e", "q");
  const throttleInput = getThrottleInput();

  state.pitch += pitchInput * sensitivity.pitch * dt;
  state.roll += rollInput * sensitivity.roll * dt;
  state.yaw += yawInput * sensitivity.yaw * dt;
  state.throttle += throttleInput * sensitivity.throttle * dt;

  state.pitch = clamp(state.pitch, -0.42, 0.48);
  state.roll = clamp(state.roll, -0.95, 0.95);
  state.throttle = clamp(state.throttle, 0, 1);

  state.roll *= 0.985;
  state.pitch *= 0.992;

  const turnRate = state.roll * 0.55 + state.yaw * 0.12;
  state.heading = wrapDegrees(state.heading + radiansToDegrees(turnRate) * dt);
  state.yaw *= 0.96;
}

function updatePhysics(dt) {
  const result = physics.calculate(state, input, dt);
  state.speed = result.speed;
  state.verticalSpeed = result.verticalSpeed;
  state.forces = result.forces;

  const headingRadians = state.heading * Math.PI / 180;
  state.position.x += Math.sin(headingRadians) * state.speed * dt;
  state.position.z += Math.cos(headingRadians) * state.speed * dt;
  state.position.y += state.verticalSpeed * dt;

  if (state.position.y < config.environment.groundLevel) {
    state.position.y = config.environment.groundLevel;
    state.verticalSpeed = Math.max(0, state.verticalSpeed);
  }
}

function drawScene() {
  const width = canvas.width;
  const height = canvas.height;
  const horizonOffset = clamp(state.pitch * 280, -160, 160);
  const roll = state.roll;

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(width / 2, height / 2 + horizonOffset);
  ctx.rotate(-roll * 0.55);

  const skyGradient = ctx.createLinearGradient(0, -height, 0, 0);
  skyGradient.addColorStop(0, "#0f172a");
  skyGradient.addColorStop(0.35, "#0369a1");
  skyGradient.addColorStop(1, "#7dd3fc");

  ctx.fillStyle = skyGradient;
  ctx.fillRect(-width * 2, -height * 2, width * 4, height * 2);

  const groundGradient = ctx.createLinearGradient(0, 0, 0, height);
  groundGradient.addColorStop(0, "#14532d");
  groundGradient.addColorStop(1, "#422006");

  ctx.fillStyle = groundGradient;
  ctx.fillRect(-width * 2, 0, width * 4, height * 2);

  drawHorizonLines(width, height);
  ctx.restore();

  drawAircraftReticle(width, height);
  drawMiniMap(width, height);
}

function drawHorizonLines(width, height) {
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 2;

  for (let i = -4; i <= 4; i += 1) {
    const y = i * 70;
    ctx.beginPath();
    ctx.moveTo(-width, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawAircraftReticle(width, height) {
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.save();
  ctx.strokeStyle = "rgba(238,246,255,0.9)";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(centerX - 95, centerY);
  ctx.lineTo(centerX - 22, centerY);
  ctx.moveTo(centerX + 22, centerY);
  ctx.lineTo(centerX + 95, centerY);
  ctx.moveTo(centerX, centerY + 14);
  ctx.lineTo(centerX, centerY + 52);
  ctx.stroke();

  ctx.restore();
}

function drawMiniMap(width, height) {
  const x = width - 210;
  const y = height - 170;
  const size = 120;

  ctx.save();
  ctx.fillStyle = "rgba(3,7,18,0.45)";
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, 18);
  ctx.fill();
  ctx.stroke();

  ctx.translate(x + size / 2, y + size / 2);
  ctx.rotate(state.heading * Math.PI / 180);
  ctx.fillStyle = "#67e8f9";
  ctx.beginPath();
  ctx.moveTo(0, -28);
  ctx.lineTo(14, 20);
  ctx.lineTo(0, 10);
  ctx.lineTo(-14, 20);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function updateHUD() {
  const airspeedKnots = metersPerSecondToKnots(state.speed);
  const altitudeFeet = metersToFeet(state.position.y);
  const throttlePercent = Math.round(state.throttle * 100);

  ui.airspeed.textContent = Math.round(airspeedKnots);
  ui.altitude.textContent = Math.round(altitudeFeet);
  ui.heading.textContent = String(Math.round(state.heading)).padStart(3, "0");
  ui.throttle.textContent = throttlePercent;

  ui.horizon.style.transform = `rotate(${-state.roll * 32}deg) translateY(${state.pitch * 48}px)`;

  setBar(ui.liftBar, state.forces.liftRatio / 1.5);
  setBar(ui.dragBar, state.forces.drag / 5200);
  setBar(ui.thrustBar, state.forces.thrust / config.aircraft.maxThrust);
  setBar(ui.weightBar, 1);

  ui.status.textContent = state.forces.stallWarning ? "STALL WARNING" : "SIM RUNNING";

  ui.telemetry.textContent = JSON.stringify({
    aircraft: config.aircraft.name,
    position: roundVector(state.position),
    speed_ms: round(state.speed),
    airspeed_knots: round(airspeedKnots),
    altitude_feet: round(altitudeFeet),
    pitch_deg: round(radiansToDegrees(state.pitch)),
    roll_deg: round(radiansToDegrees(state.roll)),
    heading_deg: round(state.heading),
    throttle: round(state.throttle),
    lift_ratio: round(state.forces.liftRatio),
    stall_warning: state.forces.stallWarning
  }, null, 2);
}

function updateLessonProgress() {
  if (!activeLesson) return;

  const step = activeLesson.steps[activeStepIndex];
  if (!step) return;

  if (targetReached(step.target)) {
    activeStepIndex = Math.min(activeStepIndex + 1, activeLesson.steps.length - 1);
    updateLessonUI();
  }
}

function updateLessonUI() {
  const step = activeLesson.steps[activeStepIndex];
  ui.lessonTitle.textContent = activeLesson.title;
  ui.lessonText.textContent = `${step.title}: ${step.instruction}`;
  ui.lessonStepLabel.textContent = `Step ${activeStepIndex + 1} / ${activeLesson.steps.length}`;
  setBar(ui.lessonProgress, (activeStepIndex + 1) / activeLesson.steps.length);
}

function targetReached(target) {
  const airspeedKnots = metersPerSecondToKnots(state.speed);
  const altitudeFeet = metersToFeet(state.position.y);
  const pitchDegrees = radiansToDegrees(state.pitch);

  if (target.throttleMin !== undefined && state.throttle < target.throttleMin) return false;
  if (target.throttleMax !== undefined && state.throttle > target.throttleMax) return false;
  if (target.airspeedKnotsMin !== undefined && airspeedKnots < target.airspeedKnotsMin) return false;
  if (target.altitudeFeetMin !== undefined && altitudeFeet < target.altitudeFeetMin) return false;
  if (target.pitchDegreesMin !== undefined && pitchDegrees < target.pitchDegreesMin) return false;
  if (target.pitchDegreesMax !== undefined && pitchDegrees > target.pitchDegreesMax) return false;
  if (target.verticalSpeedMaxAbs !== undefined && Math.abs(state.verticalSpeed) > target.verticalSpeedMaxAbs) return false;

  return true;
}

function resetAircraft() {
  Object.assign(state, {
    position: { x: 0, y: 30, z: 0 },
    speed: 0,
    verticalSpeed: 0,
    pitch: 0,
    roll: 0,
    yaw: 0,
    heading: 0,
    throttle: 0,
    forces: state.forces
  });

  activeStepIndex = 0;
  updateLessonUI();
}

function getAxis(positiveKey, negativeKey) {
  return Number(input.get(positiveKey) || false) - Number(input.get(negativeKey) || false);
}

function getThrottleInput() {
  return Number(input.get("shift") || false) - Number(input.get("control") || false);
}

function setBar(element, value) {
  element.style.width = `${clamp(value, 0, 1) * 100}%`;
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function roundVector(vector) {
  return {
    x: round(vector.x),
    y: round(vector.y),
    z: round(vector.z)
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function wrapDegrees(value) {
  return ((value % 360) + 360) % 360;
}

bootSimulator();
