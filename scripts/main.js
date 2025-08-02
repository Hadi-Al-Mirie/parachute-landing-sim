//scripts/main.js
// Main Application Script for Parachute Landing Simulation
class ParachuteSimulator {
  constructor() {
    this.physics = null;
    this.scene = null;
    this.controls = null;
    this.isInitialized = false;

    // Performance monitoring
    this.stats = {
      frameCount: 0,
      lastTime: 0,
      fps: 0,
    };

    // Initialize when DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.init());
    } else {
      this.init();
    }
  }

  async init() {
    try {
      console.log("Initializing Parachute Landing Simulator...");

      // Show loading progress
      this.updateLoadingProgress(20, "Initializing Physics Engine...");
      await this.initPhysics();

      this.updateLoadingProgress(40, "Setting up 3D Scene...");
      await this.initScene();

      this.updateLoadingProgress(60, "Creating Interactive Controls...");
      await this.initControls();

      this.updateLoadingProgress(80, "Connecting Components...");
      await this.connectComponents();

      this.updateLoadingProgress(100, "Ready to Jump!");

      // Final setup
      this.setupErrorHandling();
      this.setupPerformanceMonitoring();
      this.isInitialized = true;

      console.log("Parachute Landing Simulator initialized successfully!");

      // Hide loading screen after a brief delay
      setTimeout(() => {
        this.hideLoadingScreen();
      }, 1000);
    } catch (error) {
      console.error("Failed to initialize simulator:", error);
      this.showError(
        "Failed to initialize simulator. Please refresh the page.",
      );
    }
  }

  async initPhysics() {
    return new Promise((resolve) => {
      this.physics = new PhysicsEngine();

      // Set up physics callbacks
      this.physics.onGroundHit((velocity) => {
        this.handleLandingEvent(velocity);
      });

      this.physics.onParameterChange((param, value) => {
        this.handleParameterChange(param, value);
      });

      setTimeout(resolve, 100); // Simulate async loading
    });
  }

  async initScene() {
    return new Promise((resolve) => {
      const container = document.getElementById("container");
      if (!container) {
        throw new Error("Container element not found");
      }

      this.scene = new SceneSetup();
      this.scene.init(container);

      setTimeout(resolve, 200); // Simulate async loading
    });
  }

  async initControls() {
    return new Promise((resolve) => {
      this.controls = new Controls();
      setTimeout(resolve, 100); // Simulate async loading
    });
  }

  async connectComponents() {
    return new Promise((resolve) => {
      // Connect physics to scene
      this.scene.setPhysicsEngine(this.physics);

      // Connect physics and scene to controls
      this.controls.setPhysicsEngine(this.physics);
      this.controls.setScene(this.scene);

      setTimeout(resolve, 100); // Simulate async loading
    });
  }

  updateLoadingProgress(percentage, message) {
    const progressBar = document.querySelector(".loading-progress");
    const loadingText = document.querySelector(".loading-content h2");

    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }

    if (loadingText) {
      loadingText.textContent = message;
    }
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) {
      loadingScreen.style.opacity = "0";
      loadingScreen.style.transition = "opacity 0.5s ease-out";

      setTimeout(() => {
        loadingScreen.classList.add("hidden");
      }, 500);
    }
  }

  handleLandingEvent(velocity) {
    console.log(`Landing detected with velocity: ${velocity.toFixed(2)} m/s`);

    // Calculate landing safety
    const landingQuality = this.calculateLandingQuality(velocity);

    // Show landing results
    this.showLandingResults(velocity, landingQuality);

    // Log statistics
    this.logLandingStatistics(velocity, landingQuality);
  }

  calculateLandingQuality(velocity) {
    if (velocity <= 3) return "Perfect";
    if (velocity <= 5) return "Excellent";
    if (velocity <= 8) return "Good";
    if (velocity <= 12) return "Moderate";
    if (velocity <= 20) return "Hard";
    return "Dangerous";
  }

  showLandingResults(velocity, quality) {
    // Create results modal
    const modal = document.createElement("div");
    modal.className = "landing-results-modal";
    modal.innerHTML = `
            <div class="modal-content">
                <h2>Landing Complete!</h2>
                <div class="result-stats">
                    <div class="stat">
                        <label>Impact Velocity:</label>
                        <span class="value">${velocity.toFixed(2)} m/s</span>
                    </div>
                    <div class="stat">
                        <label>Landing Quality:</label>
                        <span class="value quality-${quality.toLowerCase()}">${quality}</span>
                    </div>
                    <div class="stat">
                        <label>Flight Time:</label>
                        <span class="value">${this.physics.state.time.toFixed(
                          1,
                        )} seconds</span>
                    </div>
                </div>
                <div class="result-actions">
                    <button id="try-again-btn">Try Again</button>
                    <button id="share-result-btn">Share Result</button>
                    <button id="close-results-btn">Close</button>
                </div>
            </div>
        `;

    // Add modal styles
    modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 3000;
            animation: fadeIn 0.3s ease-out;
        `;

    document.body.appendChild(modal);

    // Add event listeners
    modal.querySelector("#try-again-btn").addEventListener("click", () => {
      this.controls.resetSimulation();
      modal.remove();
    });

    modal.querySelector("#share-result-btn").addEventListener("click", () => {
      this.shareResult(velocity, quality);
    });

    modal.querySelector("#close-results-btn").addEventListener("click", () => {
      modal.remove();
    });

    // Add modal styles to document if not present
    this.addModalStyles();
  }

  addModalStyles() {
    if (document.getElementById("modal-styles")) return;

    const style = document.createElement("style");
    style.id = "modal-styles";
    style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .modal-content {
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                max-width: 400px;
                width: 90%;
                backdrop-filter: blur(10px);
            }
            
            .modal-content h2 {
                color: #87CEEB;
                margin-bottom: 20px;
                border-bottom: 2px solid #4682B4;
                padding-bottom: 10px;
            }
            
            .result-stats {
                margin: 20px 0;
            }
            
            .stat {
                display: flex;
                justify-content: space-between;
                margin: 10px 0;
                padding: 8px 0;
                border-bottom: 1px solid #333;
            }
            
            .stat label {
                color: #ccc;
            }
            
            .stat .value {
                font-weight: bold;
                color: #4ecdc4;
            }
            
            .quality-perfect { color: #4CAF50 !important; }
            .quality-excellent { color: #8BC34A !important; }
            .quality-good { color: #CDDC39 !important; }
            .quality-moderate { color: #FFC107 !important; }
            .quality-hard { color: #FF9800 !important; }
            .quality-dangerous { color: #F44336 !important; }
            
            .result-actions {
                display: flex;
                gap: 10px;
                justify-content: center;
                margin-top: 20px;
            }
            
            .result-actions button {
                padding: 10px 15px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
            }
            
            #try-again-btn {
                background: #4CAF50;
                color: white;
            }
            
            #share-result-btn {
                background: #2196F3;
                color: white;
            }
            
            #close-results-btn {
                background: #666;
                color: white;
            }
            
            .result-actions button:hover {
                transform: translateY(-2px);
                opacity: 0.9;
            }
        `;
    document.head.appendChild(style);
  }

  shareResult(velocity, quality) {
    const text = `I just completed a parachute landing simulation! Impact velocity: ${velocity.toFixed(
      2,
    )} m/s, Quality: ${quality}`;

    if (navigator.share) {
      navigator.share({
        title: "Parachute Landing Simulation Result",
        text: text,
        url: window.location.href,
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.showNotification("Result copied to clipboard!", "success");
      });
    } else {
      // Fallback: create temporary text area
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      this.showNotification("Result copied to clipboard!", "success");
    }
  }

  logLandingStatistics(velocity, quality) {
    const stats = {
      timestamp: new Date().toISOString(),
      velocity: velocity,
      quality: quality,
      flightTime: this.physics.state.time,
      parachuteDeployed: this.physics.parameters.parachuteDeployed,
      parameters: { ...this.physics.parameters },
    };

    // Store in localStorage for persistence
    const existingStats = JSON.parse(
      localStorage.getItem("parachute-sim-stats") || "[]",
    );
    existingStats.push(stats);

    // Keep only last 10 attempts
    if (existingStats.length > 10) {
      existingStats.shift();
    }

    localStorage.setItem("parachute-sim-stats", JSON.stringify(existingStats));

    console.log("Landing statistics logged:", stats);
  }

  handleParameterChange(param, value) {
    console.log(`Physics parameter changed: ${param} = ${value}`);

    // Provide visual feedback for significant changes
    if (param === "gravity" && (value < 5 || value > 15)) {
      this.showNotification(
        `Gravity set to ${value} m/s² (${
          value < 5 ? "Low" : "High"
        } gravity environment)`,
        "info",
      );
    }
  }

  setupErrorHandling() {
    window.addEventListener("error", (event) => {
      console.error("Runtime error:", event.error);
      this.showError(
        "An error occurred. The simulation may not work correctly.",
      );
    });

    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled promise rejection:", event.reason);
      this.showError(
        "An error occurred. The simulation may not work correctly.",
      );
    });
  }

  setupPerformanceMonitoring() {
    const monitorPerformance = () => {
      const now = performance.now();
      this.stats.frameCount++;

      if (now - this.stats.lastTime >= 1000) {
        this.stats.fps = Math.round(
          (this.stats.frameCount * 1000) / (now - this.stats.lastTime),
        );
        this.stats.frameCount = 0;
        this.stats.lastTime = now;

        // Log performance warnings
        if (this.stats.fps < 30) {
          console.warn(`Low FPS detected: ${this.stats.fps}`);
        }
      }

      requestAnimationFrame(monitorPerformance);
    };

    monitorPerformance();
  }

  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #F44336;
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            z-index: 4000;
            font-weight: bold;
        `;

    document.body.appendChild(errorDiv);

    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 5000);
  }

  showNotification(message, type = "info") {
    if (this.controls) {
      this.controls.showNotification(message, type);
    }
  }

  // Public API methods for external access
  getPhysicsEngine() {
    return this.physics;
  }

  getScene() {
    return this.scene;
  }

  getControls() {
    return this.controls;
  }

  getStats() {
    return {
      ...this.stats,
      isInitialized: this.isInitialized,
      physicsData: this.physics ? this.physics.getPhysicsData() : null,
    };
  }

  // Cleanup method
  dispose() {
    if (this.scene) {
      this.scene.dispose();
    }

    if (this.controls) {
      this.controls.dispose();
    }

    // Remove event listeners
    window.removeEventListener("error", this.handleError);
    window.removeEventListener("unhandledrejection", this.handleRejection);
  }
}

// Initialize the application
const simulator = new ParachuteSimulator();

// Make simulator globally accessible for debugging
window.ParachuteSimulator = simulator;

// Add some helpful console commands for debugging
console.log(`
🪂 Parachute Landing Simulator Debug Commands:
- simulator.getStats() - Get performance statistics
- simulator.getPhysicsEngine().getPhysicsData() - Get current physics data
- simulator.getControls().applyPreset('realistic') - Apply preset configurations
- Available presets: realistic, lightweight, heavyweight, windy, highAltitude

Keyboard shortcuts:
- Space: Deploy parachute
- R: Reset simulation
- S: Start simulation
- H: Toggle instructions
- C: Toggle camera mode
`);
