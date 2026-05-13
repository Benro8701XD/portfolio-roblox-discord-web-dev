export class FlightPhysics {
  constructor(config) {
    this.config = config;
  }

  calculate(state, input, dt) {
    const aircraft = this.config.aircraft;
    const environment = this.config.environment;

    const throttlePower = state.throttle * aircraft.maxThrust;
    const airDensity = environment.airDensity;
    const wingArea = aircraft.wingArea;
    const mass = aircraft.mass;
    const gravity = environment.gravity;

    const speedMetersPerSecond = Math.max(state.speed, 0.01);
    const angleOfAttack = this.#calculateAngleOfAttack(state.pitch, state.verticalSpeed, speedMetersPerSecond);
    const liftCoefficient = this.#calculateLiftCoefficient(angleOfAttack);
    const dragCoefficient = this.#calculateDragCoefficient(liftCoefficient, state.speed);

    const dynamicPressure = 0.5 * airDensity * speedMetersPerSecond * speedMetersPerSecond;
    const lift = dynamicPressure * wingArea * liftCoefficient;
    const drag = dynamicPressure * wingArea * dragCoefficient;
    const thrust = throttlePower;
    const weight = mass * gravity;

    const forwardAcceleration = (thrust - drag) / mass;
    const verticalAcceleration = (lift - weight) / mass;

    const newSpeed = this.#clamp(state.speed + forwardAcceleration * dt, aircraft.minSpeed, aircraft.maxSpeed);
    const newVerticalSpeed = this.#clamp(
      state.verticalSpeed + verticalAcceleration * dt,
      -aircraft.maxVerticalSpeed,
      aircraft.maxVerticalSpeed
    );

    const stallWarning = newSpeed < aircraft.stallSpeed && state.throttle < 0.75;
    const liftRatio = this.#clamp(lift / Math.max(weight, 1), 0, 1.7);

    return {
      speed: newSpeed,
      verticalSpeed: stallWarning ? Math.min(newVerticalSpeed, -3) : newVerticalSpeed,
      forces: {
        lift,
        drag,
        thrust,
        weight,
        liftRatio,
        stallWarning,
        angleOfAttack,
        liftCoefficient,
        dragCoefficient
      }
    };
  }

  #calculateAngleOfAttack(pitch, verticalSpeed, speed) {
    const flightPathAngle = Math.atan2(verticalSpeed, speed);
    return pitch - flightPathAngle;
  }

  #calculateLiftCoefficient(angleOfAttack) {
    const maxLiftCoefficient = this.config.aircraft.maxLiftCoefficient;
    const slope = this.config.aircraft.liftSlope;
    const rawLift = slope * angleOfAttack;
    return this.#clamp(rawLift, -0.6, maxLiftCoefficient);
  }

  #calculateDragCoefficient(liftCoefficient, speed) {
    const baseDrag = this.config.aircraft.baseDragCoefficient;
    const inducedDrag = this.config.aircraft.inducedDragFactor * liftCoefficient * liftCoefficient;
    const speedDrag = speed > 95 ? (speed - 95) * 0.0008 : 0;
    return baseDrag + inducedDrag + speedDrag;
  }

  #clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
}

export function metersPerSecondToKnots(value) {
  return value * 1.94384;
}

export function metersToFeet(value) {
  return value * 3.28084;
}

export function radiansToDegrees(value) {
  return value * 180 / Math.PI;
}
