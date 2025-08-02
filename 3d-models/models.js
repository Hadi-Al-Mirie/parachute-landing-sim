// 3D Models for Parachute Landing Simulation
class Models {
  constructor() {
    this.materials = this.createMaterials();
  }

  createMaterials() {
    return {
      // Parachutist materials
      body: new THREE.MeshLambertMaterial({ color: 0x8b4513 }), // Brown for body
      clothes: new THREE.MeshLambertMaterial({ color: 0x2e8b57 }), // Sea green for clothes
      helmet: new THREE.MeshLambertMaterial({ color: 0x000000 }), // Black helmet

      // Parachute materials
      parachute: new THREE.MeshLambertMaterial({
        color: 0xff6b6b,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      }),
      parachuteLines: new THREE.LineBasicMaterial({ color: 0x333333 }),

      // Plane materials
      planeFuselage: new THREE.MeshLambertMaterial({ color: 0x4682b4 }),
      planeWings: new THREE.MeshLambertMaterial({ color: 0x87ceeb }),

      // Environment materials
      ground: new THREE.MeshLambertMaterial({ color: 0x228b22 }), // Forest green
      sky: new THREE.MeshBasicMaterial({
        color: 0x87ceeb,
        side: THREE.BackSide,
      }),
      clouds: new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
      }),
    };
  }

  createParachutist() {
    const parachutist = new THREE.Group();

    // Head
    const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const head = new THREE.Mesh(headGeometry, this.materials.body);
    head.position.y = 1.7;
    parachutist.add(head);

    // Helmet
    const helmetGeometry = new THREE.SphereGeometry(0.32, 16, 16);
    const helmet = new THREE.Mesh(helmetGeometry, this.materials.helmet);
    helmet.position.y = 1.7;
    parachutist.add(helmet);

    // Torso
    const torsoGeometry = new THREE.CylinderGeometry(0.4, 0.3, 1.2, 12);
    const torso = new THREE.Mesh(torsoGeometry, this.materials.clothes);
    torso.position.y = 0.8;
    parachutist.add(torso);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.1, 0.08, 0.8, 8);

    const leftArm = new THREE.Mesh(armGeometry, this.materials.body);
    leftArm.position.set(-0.6, 1.0, 0);
    leftArm.rotation.z = Math.PI / 6;
    parachutist.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, this.materials.body);
    rightArm.position.set(0.6, 1.0, 0);
    rightArm.rotation.z = -Math.PI / 6;
    parachutist.add(rightArm);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.12, 0.1, 1.0, 8);

    const leftLeg = new THREE.Mesh(legGeometry, this.materials.clothes);
    leftLeg.position.set(-0.2, -0.3, 0);
    parachutist.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, this.materials.clothes);
    rightLeg.position.set(0.2, -0.3, 0);
    parachutist.add(rightLeg);

    // Add animation properties
    parachutist.userData = {
      originalRotation: { x: 0, y: 0, z: 0 },
      animationPhase: 0,
      landingAnimation: false,
    };

    return parachutist;
  }

  createParachute() {
    const parachute = new THREE.Group();

    // Main canopy - using a sphere geometry flattened
    const canopyGeometry = new THREE.SphereGeometry(
      8,
      32,
      16,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2,
    );
    const canopy = new THREE.Mesh(canopyGeometry, this.materials.parachute);
    canopy.position.y = 0;
    canopy.scale.y = 0.3; // Flatten the sphere
    parachute.add(canopy);

    // Parachute lines
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = [];

    // Create lines from canopy edge to center point below
    const numLines = 16;
    const radius = 7.5;
    const lineLength = 8;

    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2;
      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;

      // Top point (on canopy edge)
      linePositions.push(x1, -2, z1);
      // Bottom point (attachment point)
      linePositions.push(0, -lineLength, 0);
    }

    lineGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(linePositions, 3),
    );
    const lines = new THREE.LineSegments(
      lineGeometry,
      this.materials.parachuteLines,
    );
    parachute.add(lines);

    // Initially hide the parachute
    parachute.visible = false;
    parachute.userData = { deployed: false };

    return parachute;
  }

  createPlane() {
    const plane = new THREE.Group();

    // Fuselage
    const fuselageGeometry = new THREE.CylinderGeometry(1, 0.5, 12, 12);
    const fuselage = new THREE.Mesh(
      fuselageGeometry,
      this.materials.planeFuselage,
    );
    fuselage.rotation.z = Math.PI / 2;
    plane.add(fuselage);

    // Wings
    const wingGeometry = new THREE.BoxGeometry(16, 0.3, 3);
    const wings = new THREE.Mesh(wingGeometry, this.materials.planeWings);
    wings.position.y = 0;
    plane.add(wings);

    // Tail
    const tailGeometry = new THREE.BoxGeometry(0.3, 4, 2);
    const tail = new THREE.Mesh(tailGeometry, this.materials.planeWings);
    tail.position.x = -5;
    tail.position.y = 1;
    // plane.add(tail);

    // Propeller
    const propGeometry = new THREE.BoxGeometry(0.1, 4, 0.1);
    const propeller = new THREE.Mesh(
      propGeometry,
      this.materials.planeFuselage,
    );
    propeller.position.x = 6;
    plane.add(propeller);

    // Add animation properties
    plane.userData = {
      propeller: propeller,
      speed: 50, // m/s
    };

    return plane;
  }

  createGround() {
    // Create terrain with some variation
    const groundGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
    const ground = new THREE.Mesh(groundGeometry, this.materials.ground);

    // Add some height variation to make it more realistic
    const vertices = groundGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      vertices[i + 2] = (Math.random() - 0.5) * 2; // Random height variation
    }
    groundGeometry.attributes.position.needsUpdate = true;
    groundGeometry.computeVertexNormals();

    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;

    return ground;
  }

  createSkybox() {
    const skyGeometry = new THREE.SphereGeometry(1500, 32, 32);
    const sky = new THREE.Mesh(skyGeometry, this.materials.sky);
    return sky;
  }

  createClouds() {
    const clouds = new THREE.Group();

    // Create multiple cloud clusters
    for (let i = 0; i < 20; i++) {
      const cloud = new THREE.Group();

      // Each cloud made of multiple spheres
      for (let j = 0; j < 5; j++) {
        const cloudGeometry = new THREE.SphereGeometry(
          Math.random() * 15 + 10,
          16,
          16,
        );
        const cloudMesh = new THREE.Mesh(cloudGeometry, this.materials.clouds);

        cloudMesh.position.set(
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 40,
        );

        cloud.add(cloudMesh);
      }

      // Position clouds randomly in the sky
      cloud.position.set(
        (Math.random() - 0.5) * 1000,
        Math.random() * 200 + 100,
        (Math.random() - 0.5) * 1000,
      );

      clouds.add(cloud);
    }

    return clouds;
  }

  // Animation helpers
  animateParachutist(parachutist, deltaTime, velocity) {
    if (!parachutist.userData) return;

    if (parachutist.userData.landingAnimation) {
      return; // do not animate arms/legs during landing
    }
    // Simulate body movement based on air resistance and velocity
    const windEffect = Math.sin(Date.now() * 0.003) * 0.1;
    const velocityEffect = Math.min(velocity.length() * 0.01, 0.3);

    // Body rotation based on velocity
    parachutist.rotation.x = velocityEffect * Math.sin(Date.now() * 0.002);
    parachutist.rotation.z = windEffect;

    // Limb animation
    parachutist.userData.animationPhase += deltaTime * 2;
    const limbMovement = Math.sin(parachutist.userData.animationPhase) * 0.2;

    // Animate arms and legs slightly
    if (parachutist.children.length > 4) {
      parachutist.children[3].rotation.x = limbMovement; // Left arm
      parachutist.children[4].rotation.x = -limbMovement; // Right arm
    }
  }

  animatePlane(plane, deltaTime) {
    if (!plane.userData.propeller) return;

    // Rotate propeller
    plane.userData.propeller.rotation.x += deltaTime * 50;

    // Slight plane movement
    plane.position.y += Math.sin(Date.now() * 0.001) * 0.1;
    plane.rotation.z = Math.sin(Date.now() * 0.0005) * 0.05;
  }

  animateParachute(parachute, deltaTime, velocity) {
    if (!parachute.visible) return;

    // Parachute swaying in the wind
    const windSway = Math.sin(Date.now() * 0.002) * 0.1;
    parachute.rotation.x = windSway;
    parachute.rotation.z = Math.cos(Date.now() * 0.0015) * 0.05;

    // Slight vertical oscillation
    const canopy = parachute.children[0];
    if (canopy) {
      canopy.scale.y = 0.3 + Math.sin(Date.now() * 0.005) * 0.05;
    }
  }

  // Utility method to deploy parachute with animation
  deployParachute(parachute) {
    if (parachute.userData.deployed) return;

    parachute.visible = true;
    parachute.userData.deployed = true;

    // Deployment animation
    parachute.scale.set(0.1, 0.1, 0.1);

    const deployAnimation = () => {
      const targetScale = 1;
      const currentScale = parachute.scale.x;
      const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);

      parachute.scale.set(newScale, newScale, newScale);

      if (Math.abs(newScale - targetScale) > 0.01) {
        requestAnimationFrame(deployAnimation);
      }
    };

    deployAnimation();
  }
  // Safe landing: forward roll (360°) and reset
  animateSoftLanding(parachutist) {
    if (!parachutist || parachutist.userData.landingAnimation) return;
    parachutist.userData.landingAnimation = true;
    const initialRotationX = parachutist.rotation.x;
    const duration = 600;
    const start = performance.now();
    function step(time) {
      const t = Math.min(1, (time - start) / duration);
      parachutist.rotation.x = initialRotationX + 2 * Math.PI * t;
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        parachutist.rotation.x = initialRotationX;
        parachutist.userData.landingAnimation = false;
      }
    }
    requestAnimationFrame(step);
  }

  // Moderate damage: tilt forward and return upright
  animateModerateLanding(parachutist) {
    if (!parachutist || parachutist.userData.landingAnimation) return;
    parachutist.userData.landingAnimation = true;
    const startRotationX = parachutist.rotation.x;
    const tiltAngle = -Math.PI / 4;
    const duration = 600;
    const start = performance.now();
    function step(time) {
      const t = Math.min(1, (time - start) / duration);
      let angle;
      if (t < 0.5) {
        angle = startRotationX + tiltAngle * (t / 0.5);
      } else {
        angle = startRotationX + tiltAngle * (1 - (t - 0.5) / 0.5);
      }
      parachutist.rotation.x = angle;
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        parachutist.rotation.x = startRotationX;
        parachutist.userData.landingAnimation = false;
      }
    }
    requestAnimationFrame(step);
  }

  // Hard landing: slam forward to -90° and recover slowly
  animateHardLanding(parachutist) {
    if (!parachutist || parachutist.userData.landingAnimation) return;
    parachutist.userData.landingAnimation = true;
    const startRotationX = parachutist.rotation.x;
    const targetRotationX = -Math.PI / 2;
    const duration = 800;
    const start = performance.now();
    function forwardStep(time) {
      const t = Math.min(1, (time - start) / duration);
      parachutist.rotation.x =
        startRotationX + (targetRotationX - startRotationX) * t;
      if (t < 1) {
        requestAnimationFrame(forwardStep);
      } else {
        // recover slowly to upright
        const recoverStart = performance.now();
        const recoverDuration = 1000;
        function recoverStep(time2) {
          const tt = Math.min(1, (time2 - recoverStart) / recoverDuration);
          parachutist.rotation.x =
            targetRotationX + (startRotationX - targetRotationX) * tt;
          if (tt < 1) {
            requestAnimationFrame(recoverStep);
          } else {
            parachutist.rotation.x = startRotationX;
            parachutist.userData.landingAnimation = false;
          }
        }
        requestAnimationFrame(recoverStep);
      }
    }
    requestAnimationFrame(forwardStep);
  }

  // Death: fall flat and stay down
  animateDeath(parachutist) {
    if (!parachutist || parachutist.userData.landingAnimation) return;
    parachutist.userData.landingAnimation = true;
    const startRotationX = parachutist.rotation.x;
    const targetRotationX = -Math.PI / 2;
    const duration = 800;
    const start = performance.now();
    function step(time) {
      const t = Math.min(1, (time - start) / duration);
      parachutist.rotation.x =
        startRotationX + (targetRotationX - startRotationX) * t;
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        parachutist.rotation.x = targetRotationX;
        // keep landingAnimation true so default animations stop
      }
    }
    requestAnimationFrame(step);
  }
}

// Export for use in other scripts
window.Models = Models;
