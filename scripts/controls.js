//scripts/controls.js
// Interactive Controls for Parachute Landing Simulation
class Controls {
  constructor() {
    this.physics = null;
    this.scene = null;
    this.isSimulationRunning = false;
    this.updateInterval = null;

    // UI elements
    this.elements = {
      // Sliders
      gravity: document.getElementById("gravity"),
      mass: document.getElementById("mass"),
      dragCoefficient: document.getElementById("drag-coefficient"),
      airDensity: document.getElementById("air-density"),
      parachuteArea: document.getElementById("parachute-area"),
      windSpeed: document.getElementById("wind-speed"),

      // Value displays
      gravityValue: document.getElementById("gravity-value"),
      massValue: document.getElementById("mass-value"),
      dragCoefficientValue: document.getElementById("drag-coefficient-value"),
      airDensityValue: document.getElementById("air-density-value"),
      parachuteAreaValue: document.getElementById("parachute-area-value"),
      windSpeedValue: document.getElementById("wind-speed-value"),

      // Buttons
      deployParachute: document.getElementById("deploy-parachute"),
      resetSimulation: document.getElementById("reset-simulation"),
      startSimulation: document.getElementById("start-simulation"),

      // Physics display
      velocityDisplay: document.getElementById("velocity-display"),
      altitudeDisplay: document.getElementById("altitude-display"),
      accelerationDisplay: document.getElementById("acceleration-display"),
      dragForceDisplay: document.getElementById("drag-force-display"),
      terminalVelocityDisplay: document.getElementById(
        "terminal-velocity-display",
      ),

      // Other elements
      loadingScreen: document.getElementById("loading-screen"),
      instructions: document.getElementById("instructions"),
      closeInstructions: document.getElementById("close-instructions"),
      controlPanel: document.getElementById("control-panel"),
    };

    this.initializeControls();
  }

  initializeControls() {
    this.setupSliders();
    this.setupButtons();
    this.setupInstructions();
    this.hideLoadingScreen();

    console.log("Controls initialized");
  }

  setupSliders() {
    // Create slider configurations
    const sliderConfigs = [
      {
        element: "gravity",
        param: "gravity",
        display: "gravityValue",
        unit: "",
      },
      { element: "mass", param: "mass", display: "massValue", unit: "" },
      {
        element: "dragCoefficient",
        param: "dragCoefficient",
        display: "dragCoefficientValue",
        unit: "",
      },
      {
        element: "airDensity",
        param: "airDensity",
        display: "airDensityValue",
        unit: "",
      },
      {
        element: "parachuteArea",
        param: "parachuteArea",
        display: "parachuteAreaValue",
        unit: "",
      },
      {
        element: "windSpeed",
        param: "windSpeed",
        display: "windSpeedValue",
        unit: "",
      },
    ];

    // Setup each slider
    sliderConfigs.forEach((config) => {
      const slider = this.elements[config.element];
      const display = this.elements[config.display];

      if (slider && display) {
        // Initialize display
        display.textContent = slider.value;

        // Add event listener
        slider.addEventListener("input", (e) => {
          const value = parseFloat(e.target.value);
          display.textContent = value.toFixed(2);

          // Update physics parameter
          if (this.physics) {
            this.physics.updateParameter(config.param, value);
          }

          // Provide haptic feedback on mobile
          if (navigator.vibrate) {
            navigator.vibrate(10);
          }
        });

        // Add mouse wheel support for fine-tuning
        slider.addEventListener("wheel", (e) => {
          e.preventDefault();
          const step = parseFloat(slider.step) || 0.1;
          const delta = e.deltaY > 0 ? -step : step;
          const newValue = Math.max(
            parseFloat(slider.min),
            Math.min(parseFloat(slider.max), parseFloat(slider.value) + delta),
          );

          slider.value = newValue;
          slider.dispatchEvent(new Event("input"));
        });
      }
    });
  }

  setupButtons() {
    // Start simulation button
    if (this.elements.startSimulation) {
      this.elements.startSimulation.addEventListener("click", () => {
        this.startSimulation();
      });
    }

    // Deploy parachute button
    if (this.elements.deployParachute) {
      this.elements.deployParachute.addEventListener("click", () => {
        this.deployParachute();
      });
    }

    // Reset simulation button
    if (this.elements.resetSimulation) {
      this.elements.resetSimulation.addEventListener("click", () => {
        this.resetSimulation();
      });
    }

    // Add keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT") return; // Don't interfere with input fields

      switch (e.code) {
        case "Space":
          e.preventDefault();
          this.deployParachute();
          break;
        case "KeyR":
          e.preventDefault();
          this.resetSimulation();
          break;
        case "KeyS":
          e.preventDefault();
          this.startSimulation();
          break;
        case "KeyH":
          e.preventDefault();
          this.toggleInstructions();
          break;
      }
    });
  }

  setupInstructions() {
    if (this.elements.closeInstructions) {
      this.elements.closeInstructions.addEventListener("click", () => {
        this.hideInstructions();
      });
    }

    // Auto-hide instructions after 10 seconds
    setTimeout(() => {
      this.hideInstructions();
    }, 10000);
  }

  hideLoadingScreen() {
    setTimeout(() => {
      if (this.elements.loadingScreen) {
        this.elements.loadingScreen.classList.add("hidden");
      }
    }, 2000);
  }

  hideInstructions() {
    if (this.elements.instructions) {
      this.elements.instructions.classList.add("hidden");
    }
  }

  toggleInstructions() {
    if (this.elements.instructions) {
      this.elements.instructions.classList.toggle("hidden");
    }
  }

  // Set physics engine reference
  setPhysicsEngine(physics) {
    this.physics = physics;

    // Initialize physics parameters from UI
    this.syncPhysicsParameters();

    // Start physics display updates
    this.startPhysicsDisplay();
  }

  // Set scene reference
  setScene(scene) {
    this.scene = scene;
  }

  // Sync physics parameters with UI values
  syncPhysicsParameters() {
    if (!this.physics) return;

    const parameters = [
      { element: "gravity", param: "gravity" },
      { element: "mass", param: "mass" },
      { element: "dragCoefficient", param: "dragCoefficient" },
      { element: "airDensity", param: "airDensity" },
      { element: "parachuteArea", param: "parachuteArea" },
      { element: "windSpeed", param: "windSpeed" },
    ];

    parameters.forEach((config) => {
      const element = this.elements[config.element];
      if (element) {
        this.physics.updateParameter(config.param, parseFloat(element.value));
      }
    });
  }

  // Start simulation
  startSimulation() {
    if (!this.physics || !this.scene) return;

    this.isSimulationRunning = true;
    this.scene.start();
    // Update button states
    if (this.elements.startSimulation) {
      this.elements.startSimulation.disabled = true;
      this.elements.startSimulation.textContent = "Simulation Running";
    }

    if (this.elements.deployParachute) {
      this.elements.deployParachute.disabled = false;
    }

    // Add visual feedback
    this.showNotification("Simulation Started!", "success");

    // Start plane animation (moving away)
    // this.animatePlaneExit();
  }

  // Deploy parachute
  deployParachute() {
    if (!this.physics || !this.scene || !this.isSimulationRunning) return;

    const success = this.scene.deployParachute();

    if (success) {
      // Update button state
      if (this.elements.deployParachute) {
        this.elements.deployParachute.disabled = true;
        this.elements.deployParachute.textContent = "Parachute Deployed";
        this.elements.deployParachute.style.background = "#4CAF50";
      }

      this.showNotification("Parachute Deployed!", "success");
    } else {
      this.showNotification("Cannot deploy parachute yet!", "warning");
    }
  }

  // Reset simulation
  resetSimulation() {
    this.isSimulationRunning = false;

    // Reset physics and scene
    if (this.physics) {
      this.physics.reset();
    }

    if (this.scene) {
      this.scene.resetSimulation();
    }

    // Reset button states
    if (this.elements.startSimulation) {
      this.elements.startSimulation.disabled = false;
      this.elements.startSimulation.textContent = "Start Jump";
    }

    if (this.elements.deployParachute) {
      this.elements.deployParachute.disabled = true;
      this.elements.deployParachute.textContent = "Deploy Parachute";
      this.elements.deployParachute.style.background = "#ff6b6b";
    }

    this.showNotification("Simulation Reset", "info");
  }

  // Start physics display updates
  startPhysicsDisplay() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.updatePhysicsDisplay();
    }, 100); // Update 10 times per second
  }

  // Update physics display
  updatePhysicsDisplay() {
    if (!this.physics) return;

    const data = this.physics.getPhysicsData();

    // Update display elements
    if (this.elements.velocityDisplay) {
      this.elements.velocityDisplay.textContent = data.velocity.toFixed(1);
    }

    if (this.elements.altitudeDisplay) {
      this.elements.altitudeDisplay.textContent = data.altitude.toFixed(0);
    }

    if (this.elements.accelerationDisplay) {
      this.elements.accelerationDisplay.textContent =
        data.acceleration.toFixed(1);
    }

    if (this.elements.dragForceDisplay) {
      this.elements.dragForceDisplay.textContent = data.dragForce.toFixed(1);
    }

    if (this.elements.terminalVelocityDisplay) {
      this.elements.terminalVelocityDisplay.textContent =
        data.terminalVelocity.toFixed(1);
    }

    // Color coding based on values
    this.updateDisplayColors(data);
  }

  // Update display colors based on physics values
  updateDisplayColors(data) {
    // Velocity color (green = safe, yellow = moderate, red = dangerous)
    if (this.elements.velocityDisplay) {
      let color = "#4ecdc4"; // Default cyan
      if (data.velocity > 30) color = "#ff6b6b"; // Red for high speed
      else if (data.velocity > 15)
        color = "#ffa726"; // Orange for moderate speed
      else if (data.velocity > 5) color = "#66bb6a"; // Green for safe speed

      this.elements.velocityDisplay.style.color = color;
    }

    // Altitude color
    if (this.elements.altitudeDisplay) {
      let color = "#4ecdc4";
      if (data.altitude < 100) color = "#ff6b6b"; // Red for low altitude
      else if (data.altitude < 500) color = "#ffa726"; // Orange for moderate altitude

      this.elements.altitudeDisplay.style.color = color;
    }
  }

  //   // Animate plane exit
  //   animatePlaneExit() {
  //     if (!this.scene) return;

  //     const sceneObjects = this.scene.getSceneObjects();
  //     const plane = sceneObjects.plane;

  //     if (plane) {
  //       const startPosition = plane.position.clone();
  //       const targetPosition = new THREE.Vector3(-500, 3000, 0);
  //       const duration = 5000; // 5 seconds
  //       const startTime = Date.now();

  //       const animatePlane = () => {
  //         const elapsed = Date.now() - startTime;
  //         const progress = Math.min(elapsed / duration, 1);

  //         // Smooth easing
  //         const easeProgress = 1 - Math.pow(1 - progress, 3);

  //         plane.position.lerpVectors(startPosition, targetPosition, easeProgress);

  //         if (progress < 1) {
  //           requestAnimationFrame(animatePlane);
  //         }
  //       };

  //       animatePlane();
  //     }
  //   }

  // Show notification
  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: bold;
            z-index: 2000;
            animation: slideDown 0.3s ease-out;
        `;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = "slideUp 0.3s ease-out";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 3000);

    // Add CSS animations if not already present
    this.addNotificationStyles();
  }

  getNotificationColor(type) {
    const colors = {
      success: "#4CAF50",
      warning: "#FF9800",
      danger: "#F44336",
      info: "#2196F3",
    };
    return colors[type] || colors.info;
  }

  addNotificationStyles() {
    if (document.getElementById("notification-styles")) return;

    const style = document.createElement("style");
    style.id = "notification-styles";
    style.textContent = `
            @keyframes slideDown {
                from { transform: translate(-50%, -100%); opacity: 0; }
                to { transform: translate(-50%, 0); opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translate(-50%, 0); opacity: 1; }
                to { transform: translate(-50%, -100%); opacity: 0; }
            }
        `;
    document.head.appendChild(style);
  }

  // Preset configurations
  applyPreset(presetName) {
    const presets = {
      realistic: {
        gravity: 9.81,
        mass: 80,
        dragCoefficient: 1.3,
        airDensity: 1.225,
        parachuteArea: 50,
        windSpeed: 0,
      },
      lightweight: {
        gravity: 9.81,
        mass: 60,
        dragCoefficient: 1.3,
        airDensity: 1.225,
        parachuteArea: 60,
        windSpeed: 0,
      },
      heavyweight: {
        gravity: 9.81,
        mass: 120,
        dragCoefficient: 1.3,
        airDensity: 1.225,
        parachuteArea: 45,
        windSpeed: 0,
      },
      windy: {
        gravity: 9.81,
        mass: 80,
        dragCoefficient: 1.3,
        airDensity: 1.225,
        parachuteArea: 50,
        windSpeed: 10,
      },
      highAltitude: {
        gravity: 9.81,
        mass: 80,
        dragCoefficient: 1.3,
        airDensity: 0.9,
        parachuteArea: 50,
        windSpeed: 0,
      },
    };

    const preset = presets[presetName];
    if (!preset) return;

    // Apply preset values to sliders
    Object.keys(preset).forEach((param) => {
      const elementName = this.getElementNameForParam(param);
      const slider = this.elements[elementName];
      const display = this.elements[elementName + "Value"];

      if (slider && display) {
        slider.value = preset[param];
        display.textContent = preset[param].toFixed(2);

        // Update physics
        if (this.physics) {
          this.physics.updateParameter(param, preset[param]);
        }
      }
    });

    this.showNotification(`Applied ${presetName} preset`, "info");
  }

  getElementNameForParam(param) {
    const mapping = {
      gravity: "gravity",
      mass: "mass",
      dragCoefficient: "dragCoefficient",
      airDensity: "airDensity",
      parachuteArea: "parachuteArea",
      windSpeed: "windSpeed",
    };
    return mapping[param];
  }

  // Cleanup
  dispose() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Remove event listeners
    document.removeEventListener("keydown", this.handleKeydown);
  }
}

// Export for use in other scripts
window.Controls = Controls;
