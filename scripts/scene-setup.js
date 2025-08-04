//scripts/main.js
// Scene Setup for Parachute Landing Simulation
class SceneSetup {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.models = null;
    this.physics = null;
    this.isSimulationRunning = false;

    // Scene objects
    this.sceneObjects = {
      parachutist: null,
      parachute: null,
      plane: null,
      ground: null,
      sky: null,
      clouds: null,
    };

    // Lighting
    this.lights = {
      ambient: null,
      directional: null,
      hemisphere: null,
    };

    // Camera settings
    this.cameraSettings = {
      followDistance: 50,
      followHeight: 20,
      lookAhead: 10,
      smoothing: 0.05,
    };

    // Animation
    this.clock = new THREE.Clock();
    this.isAnimating = false;
  }

  // Initialize the Three.js scene
  init(container) {
    this.createScene();
    this.createCamera();
    this.createRenderer(container);
    this.createControls();
    this.createLighting();
    this.createModels();
    this.setupEventListeners();

    // Start render loop
    this.animate();

    console.log("Scene initialized successfully");
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x87ceeb, 100, 2000);
    this.scene.background = new THREE.Color(0x87ceeb);
  }

  createCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 5000);

    // Initial camera position
    this.camera.position.set(0, 1550, 100);
    this.camera.lookAt(0, 1500, 0);
  }

  createRenderer(container) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Enable shadows
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Tone mapping for better lighting
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    container.appendChild(this.renderer.domElement);
  }

  createControls() {
    this.controls = new THREE.OrbitControls(
      this.camera,
      this.renderer.domElement,
    );
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 500;
    this.controls.minDistance = 5;
    this.controls.maxPolarAngle = Math.PI * 0.9;

    // Disable controls during simulation for cinematic camera
    this.controls.enabled = true;
  }

  createLighting() {
    // Ambient light for overall illumination
    this.lights.ambient = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(this.lights.ambient);

    // Directional light (sun)
    this.lights.directional = new THREE.DirectionalLight(0xffffff, 1.0);
    this.lights.directional.position.set(100, 200, 100);
    this.lights.directional.castShadow = true;

    // Shadow camera settings
    const shadowSize = 500;
    this.lights.directional.shadow.camera.left = -shadowSize;
    this.lights.directional.shadow.camera.right = shadowSize;
    this.lights.directional.shadow.camera.top = shadowSize;
    this.lights.directional.shadow.camera.bottom = -shadowSize;
    this.lights.directional.shadow.camera.near = 0.5;
    this.lights.directional.shadow.camera.far = 1000;
    this.lights.directional.shadow.mapSize.width = 2048;
    this.lights.directional.shadow.mapSize.height = 2048;

    this.scene.add(this.lights.directional);

    // Hemisphere light for natural sky lighting
    this.lights.hemisphere = new THREE.HemisphereLight(0x87ceeb, 0x228b22, 0.6);
    this.scene.add(this.lights.hemisphere);
  }

  createModels() {
    this.models = new Models();

    // Create and add all models to scene
    this.sceneObjects.parachutist = this.models.createParachutist();
    this.sceneObjects.parachutist.position.set(0, 1500, 0);
    this.sceneObjects.parachutist.castShadow = true;
    this.scene.add(this.sceneObjects.parachutist);

    this.sceneObjects.parachute = this.models.createParachute();
    this.sceneObjects.parachute.position.set(0, 1508, 0); // Slightly above parachutist
    this.scene.add(this.sceneObjects.parachute);

    this.sceneObjects.plane = this.models.createPlane();
    this.sceneObjects.plane.position.set(-100, 1500, 0);
    this.sceneObjects.plane.rotation.y = Math.PI / 2;
    this.sceneObjects.plane.castShadow = true;
    this.scene.add(this.sceneObjects.plane);

    this.sceneObjects.ground = this.models.createGround();
    this.scene.add(this.sceneObjects.ground);

    this.sceneObjects.sky = this.models.createSkybox();
    this.scene.add(this.sceneObjects.sky);

    this.sceneObjects.clouds = this.models.createClouds();
    this.scene.add(this.sceneObjects.clouds);

    console.log("All models created and added to scene");
  }

  setupEventListeners() {
    // Window resize handler
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Keyboard controls
    document.addEventListener("keydown", (event) => {
      switch (event.code) {
        case "Space":
          event.preventDefault();
          if (this.physics) {
            this.physics.deployParachute();
          }
          break;
        case "KeyR":
          if (this.physics) {
            this.resetSimulation();
          }
          break;
        case "KeyC":
          this.toggleCameraMode();
          break;
      }
    });
  }

  // Set physics engine reference
  setPhysicsEngine(physics) {
    this.physics = physics;

    // Set up physics callbacks
    this.physics.onGroundHit((impactVelocity) => {
      this.handleGroundImpact(impactVelocity);
    });
  }

  // Update scene based on physics
  updateFromPhysics() {
    if (!this.physics) return;

    const physicsData = this.physics.getPhysicsData();

    // Update parachutist position
    this.sceneObjects.parachutist.position.copy(physicsData.position);

    // Update parachute position and visibility
    if (physicsData.parachuteDeployed) {
      this.sceneObjects.parachute.visible = true;
      this.sceneObjects.parachute.position.copy(physicsData.position);
      this.sceneObjects.parachute.position.y += 8; // Above parachutist
    } else {
      this.sceneObjects.parachute.visible = false;
    }

    // Update camera to follow parachutist
    this.updateCamera(physicsData.position, physicsData.velocity);
  }

  // Update camera to follow the action
  updateCamera(position, velocity) {
    if (!this.controls.enabled) return; // Skip if manual control

    const targetPosition = position.clone();
    const velocityDirection = velocity.clone().normalize();

    // Calculate desired camera position
    const cameraOffset = new THREE.Vector3(
      -this.cameraSettings.followDistance,
      this.cameraSettings.followHeight,
      this.cameraSettings.followDistance,
    );

    // Add velocity-based look-ahead
    const lookAhead = velocityDirection.multiplyScalar(
      this.cameraSettings.lookAhead,
    );
    const desiredPosition = targetPosition.clone().add(cameraOffset);
    const lookAtPosition = targetPosition.clone().add(lookAhead);

    // Smooth camera movement
    this.camera.position.lerp(desiredPosition, this.cameraSettings.smoothing);

    // Update controls target for smooth look-at
    this.controls.target.lerp(lookAtPosition, this.cameraSettings.smoothing);
    this.controls.update();
  }

  // Toggle between automatic and manual camera control
  toggleCameraMode() {
    this.controls.enabled = !this.controls.enabled;

    // Show status
    const status = this.controls.enabled ? "Manual" : "Automatic";
    this.showStatus(`Camera: ${status}`, "info");
  }
  start() {
    this.isSimulationRunning = true;
  }

  // Handle ground impact
  handleGroundImpact(impactVelocity) {
    console.log(`Ground impact at ${impactVelocity.toFixed(2)} m/s`);

    // Visual feedback
    if (impactVelocity > 10) {
      this.showStatus("Hard Landing!", "danger");
      this.addImpactEffect();
    } else if (impactVelocity > 5) {
      this.showStatus("Moderate Landing", "warning");
    } else {
      this.showStatus("Soft Landing!", "success");
    }
  }

  // Add visual impact effect
  addImpactEffect() {
    // Create dust cloud effect
    const dustGeometry = new THREE.SphereGeometry(5, 8, 8);
    const dustMaterial = new THREE.MeshBasicMaterial({
      color: 0x8b4513,
      transparent: true,
      opacity: 0.5,
    });

    for (let i = 0; i < 10; i++) {
      const dust = new THREE.Mesh(dustGeometry, dustMaterial);
      dust.position.copy(this.sceneObjects.parachutist.position);
      dust.position.y = 2;
      dust.position.x += (Math.random() - 0.5) * 10;
      dust.position.z += (Math.random() - 0.5) * 10;

      this.scene.add(dust);

      // Animate dust particles
      const animateDust = () => {
        dust.position.y += 0.2;
        dust.material.opacity -= 0.02;
        dust.scale.multiplyScalar(1.02);

        if (dust.material.opacity > 0) {
          requestAnimationFrame(animateDust);
        } else {
          this.scene.remove(dust);
        }
      };

      setTimeout(() => animateDust(), i * 100);
    }
  }

  // Show status message
  showStatus(message, type = "info") {
    // Remove existing status
    const existing = document.querySelector(".status-indicator");
    if (existing) {
      existing.remove();
    }

    // Create new status indicator
    const status = document.createElement("div");
    status.className = `status-indicator ${type}`;
    status.textContent = message;
    document.body.appendChild(status);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (status.parentNode) {
        status.remove();
      }
    }, 3000);
  }

  // Reset simulation
  resetSimulation() {
    if (this.physics) {
      this.physics.reset();
    }

    // Reset object positions
    this.sceneObjects.parachutist.position.set(0, 1500, 0);
    this.sceneObjects.parachutist.rotation.set(0, 0, 0);
    this.sceneObjects.parachute.position.set(0, 1508, 0);
    this.sceneObjects.parachute.visible = false;

    // Reset camera
    this.camera.position.set(0, 1550, 100);
    this.controls.target.set(0, 1500, 0);
    this.controls.update();

    this.showStatus("Simulation Reset", "info");
  }

  // Deploy parachute with visual feedback
  deployParachute() {
    if (this.physics && this.physics.deployParachute()) {
      this.models.deployParachute(this.sceneObjects.parachute);
      this.showStatus("Parachute Deployed!", "success");
      return true;
    }
    return false;
  }

  // Main animation loop
  animate() {
    requestAnimationFrame(() => this.animate());
    const deltaTime = this.clock.getDelta();

    if (this.isSimulationRunning) {
      // — only update physics after Start Jump
      this.physics.update(deltaTime);
      const data = this.physics.getPhysicsData();

      // move jumper by physics
      this.parachutist.position.copy(data.position);
      if (data.parachuteDeployed) {
        this.parachute.visible = true;
        this.parachute.position.copy(data.position).y += 8;
      }

      // camera follows physics…
      const target = data.position.clone();
      const camOffset = new THREE.Vector3(50, 50, 100);
      this.camera.position.lerp(target.clone().add(camOffset), 0.02);
      this.controls.target.lerp(target, 0.02);
    } else {
      // — before Start Jump, glue jumper & parachute to plane
      const planePos = this.plane.position;
      this.parachutist.position.copy(planePos);
      this.parachute.position.copy(planePos).y += 8;
    }

    // animate models (arms, propeller, etc) — no physics needed
    const velForAnim = this.isSimulationRunning
      ? this.physics.state.velocity
      : new THREE.Vector3(0, 0, 0);
    this.models.animateParachutist(this.parachutist, deltaTime, velForAnim);
    this.models.animatePlane(this.plane, deltaTime);
    this.models.animateParachute(this.parachute, deltaTime, velForAnim);

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  // Get scene objects for external access
  getSceneObjects() {
    return this.sceneObjects;
  }

  // Cleanup
  dispose() {
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.controls) {
      this.controls.dispose();
    }

    // Remove event listeners
    window.removeEventListener("resize", this.handleResize);
    document.removeEventListener("keydown", this.handleKeydown);
  }
}

// Export for use in other scripts
window.SceneSetup = SceneSetup;
