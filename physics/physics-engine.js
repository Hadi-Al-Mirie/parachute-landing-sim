//physics/physics-engine.js
// Physics Engine for Parachute Landing Simulation
class PhysicsEngine {
  constructor() {
    // Default physics parameters
    this.parameters = {
      gravity: 9.81, // m/s² - acceleration due to gravity
      mass: 80, // kg - mass of parachutist
      dragCoefficient: 1.3, // dimensionless - drag coefficient
      airDensity: 1.225, // kg/m³ - air density at sea level
      parachuteArea: 50, // m² - parachute surface area
      bodyArea: 0.7, // m² - cross-sectional area of human body
      windSpeed: 0, // m/s - wind speed
      parachuteDeployed: false,
      ropeLength: 8, // m - length of parachute lines
      bodyVolume: 0.07, // m³ - approximate volume of human body
    };

    // Simulation state
    this.state = {
      position: new THREE.Vector3(0, 1500, 0), // Starting altitude 1500m
      velocity: new THREE.Vector3(0, 0, 0), // Initial velocity
      acceleration: new THREE.Vector3(0, 0, 0), // Current acceleration
      angularVelocity: new THREE.Vector3(0, 0, 0), // Angular velocity
      time: 0, // Simulation time
      forces: {
        gravity: new THREE.Vector3(0, 0, 0),
        drag: new THREE.Vector3(0, 0, 0),
        buoyancy: new THREE.Vector3(0, 0, 0),
        tension: new THREE.Vector3(0, 0, 0),
        lift: new THREE.Vector3(0, 0, 0),
        wind: new THREE.Vector3(0, 0, 0),
      },
    };

    // Physics constants
    this.constants = {
      AIR_DENSITY_SEA_LEVEL: 1.225,
      GRAVITY_EARTH: 9.81,
      TERMINAL_VELOCITY_HUMAN: 56, // m/s without parachute
      TERMINAL_VELOCITY_PARACHUTE: 5, // m/s with parachute
    };

    // Event callbacks
    this.callbacks = {
      onGroundHit: null,
      onParameterChange: null,
    };
  }

  // Update physics parameters
  updateParameter(name, value) {
    if (this.parameters.hasOwnProperty(name)) {
      this.parameters[name] = parseFloat(value);
      if (this.callbacks.onParameterChange) {
        this.callbacks.onParameterChange(name, value);
      }
    }
  }

  // Calculate gravity force: F = m * g
  calculateGravityForce() {
    const force = new THREE.Vector3(
      0,
      -this.parameters.mass * this.parameters.gravity,
      0,
    );
    this.state.forces.gravity.copy(force);
    return force;
  }

  // Calculate drag force: F = ½ * Cd * ρ * A * V²
  calculateDragForce() {
    const velocity = this.state.velocity;
    const speed = velocity.length();

    if (speed === 0) {
      this.state.forces.drag.set(0, 0, 0);
      return this.state.forces.drag;
    }

    // Choose appropriate area and drag coefficient
    const area = this.parameters.parachuteDeployed
      ? this.parameters.parachuteArea
      : this.parameters.bodyArea;
    const cd = this.parameters.parachuteDeployed
      ? this.parameters.dragCoefficient
      : 0.6; // Lower Cd for human body

    // Calculate drag magnitude
    const dragMagnitude =
      0.5 * cd * this.parameters.airDensity * area * speed * speed;

    // Drag force opposes velocity direction
    const dragDirection = velocity.clone().normalize().multiplyScalar(-1);
    const dragForce = dragDirection.multiplyScalar(dragMagnitude);

    this.state.forces.drag.copy(dragForce);
    return dragForce;
  }

  // Calculate air buoyancy force: Fb = V * ρair * g
  calculateBuoyancyForce() {
    const buoyancyMagnitude =
      this.parameters.bodyVolume *
      this.parameters.airDensity *
      this.parameters.gravity;

    const buoyancyForce = new THREE.Vector3(0, buoyancyMagnitude, 0);
    this.state.forces.buoyancy.copy(buoyancyForce);
    return buoyancyForce;
  }

  // Calculate rope tension force: T = Fg - Fd (when parachute is deployed)
  calculateTensionForce() {
    if (!this.parameters.parachuteDeployed) {
      this.state.forces.tension.set(0, 0, 0);
      return this.state.forces.tension;
    }

    const gravityMagnitude = this.parameters.mass * this.parameters.gravity;
    const dragMagnitude = this.state.forces.drag.length();

    // Tension acts upward when drag is less than gravity
    const tensionMagnitude = Math.max(0, gravityMagnitude - dragMagnitude);
    const tensionForce = new THREE.Vector3(0, tensionMagnitude, 0);

    this.state.forces.tension.copy(tensionForce);
    return tensionForce;
  }

  // Calculate lift force (simplified - mainly affects horizontal movement)
  calculateLiftForce() {
    if (!this.parameters.parachuteDeployed) {
      this.state.forces.lift.set(0, 0, 0);
      return this.state.forces.lift;
    }

    // Simplified lift calculation based on angle and velocity
    const velocity = this.state.velocity;
    const speed = velocity.length();

    if (speed === 0) {
      this.state.forces.lift.set(0, 0, 0);
      return this.state.forces.lift;
    }

    // Lift is perpendicular to velocity and proportional to speed²
    const liftMagnitude =
      0.1 *
      this.parameters.airDensity *
      this.parameters.parachuteArea *
      speed *
      speed;

    // Simplified: lift acts horizontally
    const liftForce = new THREE.Vector3(
      Math.sin(this.state.time * 0.5) * liftMagnitude * 0.1,
      0,
      Math.cos(this.state.time * 0.5) * liftMagnitude * 0.1,
    );

    this.state.forces.lift.copy(liftForce);
    return liftForce;
  }

  // Calculate wind force
  calculateWindForce() {
    const windSpeed = this.parameters.windSpeed; // السرعة المعطاة من الواجهة
    const bodyArea = this.parameters.bodyArea;   // مساحة جسم المظلي
    const airDensity = this.parameters.airDensity; // الكثافة

    // اتجه الرياح: افترضنا الرياح تتحرك على المحور X فقط
    const windVector = new THREE.Vector3(windSpeed, 0, 0);
    const velocityVector = new THREE.Vector3(this.state.velocity.x, 0, this.state.velocity.z);

    // نحسب الفرق بين الرياح وسرعة المظلي (السرعة النسبية)
    const relativeWind = windVector.sub(velocityVector);
    const speed = relativeWind.length();

    // نحسب اتجاه الرياح النسبية
    const windDirection = relativeWind.normalize();

    // نحسب شدة القوة: ½ * ρ * A * V²
    const windMagnitude = 0.5 * airDensity * bodyArea * speed * speed;

    // نركب القوة النهائية:
    const windForce = windDirection.multiplyScalar(windMagnitude);

    // نحدث قوة الرياح في الحالة العامة
    this.state.forces.wind.copy(windForce);

    return windForce;
  }

  // Calculate terminal velocity: Vt = √(2mg / (ρ * Cd * A))
  calculateTerminalVelocity() {
    const area = this.parameters.parachuteDeployed
      ? this.parameters.parachuteArea
      : this.parameters.bodyArea;
    const cd = this.parameters.parachuteDeployed
      ? this.parameters.dragCoefficient
      : 0.6;

    const terminalVelocity = Math.sqrt(
      (2 * this.parameters.mass * this.parameters.gravity) /
      (this.parameters.airDensity * cd * area),
    );

    return terminalVelocity;
  }

  // Calculate kinetic energy: KE = ½mv²
  calculateKineticEnergy() {
    const speed = this.state.velocity.length();
    return 0.5 * this.parameters.mass * speed * speed;
  }

  // Main physics update using numerical integration
  update(deltaTime) {
    // Limit deltaTime to prevent instability
    deltaTime = Math.min(deltaTime, 0.016); // Max 60 FPS equivalent

    // Calculate all forces
    const gravity = this.calculateGravityForce();
    const drag = this.calculateDragForce();
    const buoyancy = this.calculateBuoyancyForce();
    const tension = this.calculateTensionForce();
    const lift = this.calculateLiftForce();
    const wind = this.calculateWindForce();

    // Sum all forces: F_total = F_gravity + F_drag + F_buoyancy + F_tension + F_lift + F_wind
    const totalForce = new THREE.Vector3()
      .add(gravity)
      .add(drag)
      .add(buoyancy)
      .add(tension)
      .add(lift)
      .add(wind);

    // Calculate acceleration: a = F_total / m
    this.state.acceleration.copy(totalForce).divideScalar(this.parameters.mass);

    // Update velocity using Euler integration: v = u + a*t
    const deltaVelocity = this.state.acceleration
      .clone()
      .multiplyScalar(deltaTime);
    this.state.velocity.add(deltaVelocity);

    // Update position using kinematic equation: s = ut + ½at²
    const deltaPosition = this.state.velocity
      .clone()
      .multiplyScalar(deltaTime)
      .add(
        this.state.acceleration
          .clone()
          .multiplyScalar(0.5 * deltaTime * deltaTime),
      );
    this.state.position.add(deltaPosition);

    // Update simulation time
    this.state.time += deltaTime;

    // Check for ground collision
    if (this.state.position.y <= 0) {
      this.state.position.y = 0;
      this.state.velocity.y = Math.max(0, this.state.velocity.y); // Prevent going underground

      if (this.callbacks.onGroundHit) {
        this.callbacks.onGroundHit(this.state.velocity.length());
      }
    }

    // Air density variation with altitude (simplified)
    const altitude = this.state.position.y;
    this.parameters.airDensity =
      this.constants.AIR_DENSITY_SEA_LEVEL * Math.exp(-altitude / 8400); // Scale height approximation
  }

  // Deploy parachute
  deployParachute() {
    if (!this.parameters.parachuteDeployed && this.state.position.y > 50) {
      this.parameters.parachuteDeployed = true;

      // Sudden deceleration when parachute opens
      const currentSpeed = this.state.velocity.length();
      const deploymentShock = Math.min(currentSpeed * 0.3, 20); // Limit shock
      if (this.elements.windForceDisplay) {
        this.elements.windForceDisplay.textContent = data.windForce.toFixed(1);
      }

      // Reduce velocity in the direction of motion
      if (currentSpeed > 0) {
        const velocityDirection = this.state.velocity.clone().normalize();
        const shockForce = velocityDirection.multiplyScalar(-deploymentShock);
        this.state.velocity.add(shockForce);
      }

      return true;
    }
    return false;
  }

  // Reset simulation
  reset() {
    this.state.position.set(0, 1500, 0);
    this.state.velocity.set(0, 0, 0);
    this.state.acceleration.set(0, 0, 0);
    this.state.angularVelocity.set(0, 0, 0);
    this.state.time = 0;
    this.parameters.parachuteDeployed = false;
    this.parameters.airDensity = this.constants.AIR_DENSITY_SEA_LEVEL;

    // Reset all forces
    Object.keys(this.state.forces).forEach((key) => {
      this.state.forces[key].set(0, 0, 0);
    });
  }

  // Get current physics data for display
  getPhysicsData() {
    return {
      velocity: this.state.velocity.length(),
      altitude: Math.max(0, this.state.position.y),
      acceleration: this.state.acceleration.length(),
      dragForce: this.state.forces.drag.length(),
      gravityForce: this.state.forces.gravity.length(),
      terminalVelocity: this.calculateTerminalVelocity(),
      kineticEnergy: this.calculateKineticEnergy(),
      position: this.state.position.clone(),
      parachuteDeployed: this.parameters.parachuteDeployed,
      time: this.state.time,
      windForce: this.state.forces.wind.length(),

    };
  }

  // Set event callbacks
  onGroundHit(callback) {
    this.callbacks.onGroundHit = callback;
  }

  onParameterChange(callback) {
    this.callbacks.onParameterChange = callback;
  }

  // Advanced physics calculations for educational purposes

  // Calculate air resistance coefficient based on Reynolds number
  calculateReynoldsNumber() {
    const velocity = this.state.velocity.length();
    const characteristicLength =
      Math.sqrt(this.parameters.bodyArea / Math.PI) * 2; // Diameter
    const kinematicViscosity = 1.5e-5; // m²/s for air at 20°C

    return (velocity * characteristicLength) / kinematicViscosity;
  }

  // Calculate Mach number (for high-speed scenarios)
  calculateMachNumber() {
    const velocity = this.state.velocity.length();
    const speedOfSound = 343; // m/s at 20°C
    return velocity / speedOfSound;
  }

  // Torque calculation: τ = r × F
  calculateTorque() {
    if (!this.parameters.parachuteDeployed) {
      return new THREE.Vector3(0, 0, 0);
    }

    // Simplified torque from parachute lines
    const r = new THREE.Vector3(0, -this.parameters.ropeLength, 0);
    const F = this.state.forces.drag.clone();

    return r.cross(F);
  }
}

// Export for use in other scripts
window.PhysicsEngine = PhysicsEngine;
