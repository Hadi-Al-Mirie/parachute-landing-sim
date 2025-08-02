# Parachute Landing Simulator

A comprehensive Three.js physics simulation of parachute landing with realistic force calculations and interactive controls.

## Features

### Physics Engine

- **Gravity Force**: F = m × g
- **Drag Force**: F = ½ × Cd × ρ × A × V²
- **Air Buoyancy Force**: Fb = V × ρair × g
- **Rope Tension Force**: T = Fg - Fd
- **Lift Force**: Calculated based on parachute dynamics
- **Wind Effects**: Configurable wind speed and direction

### 3D Models

- Detailed parachutist with realistic body proportions
- Deployable parachute with canopy and suspension lines
- Aircraft for jump initiation
- Terrain with height variations
- Dynamic skybox with clouds

### Interactive Controls

- **Physics Parameters**:

  - Gravity (1-20 m/s²)
  - Mass (50-150 kg)
  - Drag Coefficient (0.1-2.0)
  - Air Density (0.8-1.4 kg/m³)
  - Parachute Area (20-100 m²)
  - Wind Speed (0-20 m/s)

- **Simulation Controls**:
  - Start Jump
  - Deploy Parachute
  - Reset Simulation

### Real-time Physics Display

- Current velocity (m/s)
- Altitude (m)
- Acceleration (m/s²)
- Drag force (N)
- Terminal velocity (m/s)

## File Structure

```
parachute-landing-sim/
├── index.html              # Main application (complex version)
├── working.html             # Simplified working version
├── debug.html              # Debug version for testing
├── test.html               # Basic Three.js test
├── package.json            # Project dependencies
├── README.md               # This file
├── css/
│   └── style.css           # Application styling
├── lib/
│   ├── three.min.js        # Three.js library
│   └── OrbitControls.js    # Camera controls
├── physics/
│   └── physics-engine.js   # Physics calculations
├── 3d-models/
│   └── models.js           # 3D model definitions
├── scripts/
│   ├── scene-setup.js      # Three.js scene management
│   ├── controls.js         # UI controls
│   └── main.js             # Main application logic
└── assets/                 # Additional assets (empty)
```

## Installation & Usage

### Prerequisites

- Modern web browser with WebGL support
- Node.js (for development server)

### Quick Start

1. Clone or download the project
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser to `http://localhost:8080`

### Alternative: Direct File Access

You can also open `working.html` directly in your browser without a server.

## How to Use

1. **Start the Simulation**:

   - Adjust physics parameters using the control panel
   - Click "Start Jump" to begin the simulation
   - Watch the parachutist fall from the aircraft

2. **Deploy Parachute**:

   - Click "Deploy Parachute" when ready (recommended at ~1000m altitude)
   - Observe the dramatic change in physics (velocity reduction, increased drag)

3. **Monitor Physics**:

   - Watch real-time physics data in the control panel
   - Observe how different parameters affect the simulation

4. **Reset and Experiment**:
   - Use "Reset" to restart the simulation
   - Try different parameter combinations
   - Experiment with extreme values (low gravity, high drag, etc.)

## Physics Formulas Implemented

### Force Calculations

- **Gravity**: Fg = m × g
- **Drag**: Fd = ½ × Cd × ρ × A × V²
- **Buoyancy**: Fb = V × ρair × g
- **Tension**: T = Fg - Fd (when parachute deployed)

### Kinematic Equations

- **Velocity**: v = u + a × t
- **Position**: s = u × t + ½ × a × t²
- **Velocity-displacement**: v² = u² + 2 × a × s

### Terminal Velocity

- **Without parachute**: Vt = √(2mg / (ρ × Cd × Abody))
- **With parachute**: Vt = √(2mg / (ρ × Cd × Aparachute))

## Controls

### Keyboard Shortcuts

- **Space**: Deploy parachute
- **R**: Reset simulation
- **S**: Start simulation
- **C**: Toggle camera mode (automatic/manual)

### Mouse Controls

- **Left Click + Drag**: Rotate camera
- **Right Click + Drag**: Pan camera
- **Mouse Wheel**: Zoom in/out

## Technical Details

### Physics Engine

- Numerical integration using Euler method
- Real-time force calculation and summation
- Air density variation with altitude
- Parachute deployment shock simulation

### 3D Rendering

- Three.js WebGL renderer
- Dynamic lighting with shadows
- Particle effects for landing impact
- Smooth camera following system

### Performance Optimizations

- Efficient geometry reuse
- Optimized animation loops
- Responsive design for mobile devices
- Frame rate monitoring

## Educational Value

This simulator demonstrates:

- **Physics Concepts**: Force, acceleration, terminal velocity, air resistance
- **Mathematical Applications**: Differential equations, vector mathematics
- **Engineering Principles**: Parachute design, safety factors
- **Programming Concepts**: Object-oriented design, real-time simulation

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

### Common Issues

1. **Black screen**: Check browser console for WebGL errors
2. **Poor performance**: Reduce browser zoom, close other tabs
3. **Controls not responding**: Refresh the page
4. **Physics seem wrong**: Check parameter values are reasonable

### Debug Mode

Use `debug.html` for simplified testing and troubleshooting.

## Development

### Adding New Features

1. Physics modifications: Edit `physics/physics-engine.js`
2. 3D models: Modify `3d-models/models.js`
3. UI changes: Update `css/style.css` and control handlers

### Testing

- Use `test.html` for basic Three.js functionality
- Use `debug.html` for physics testing
- Use `working.html` for full feature testing

## License

MIT License - Feel free to use and modify for educational purposes.

## Credits

- Three.js library for 3D rendering
- Physics formulas based on standard aerodynamics principles
- UI design inspired by modern flight simulators

---

**Note**: This is an educational simulation. Real parachute physics involve many more complex factors including air turbulence, parachute oscillation, and material properties.
