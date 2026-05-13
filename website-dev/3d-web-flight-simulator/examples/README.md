# Example Code: Browser 3D Flight Simulator MVP

This folder contains portfolio-ready example code for a **browser-based educational flight simulator prototype**.

The code is designed to look professional in a portfolio: it separates visual structure, UI, simulator state, controls, simplified physics, lessons and aircraft configuration.

## Files

| File | Purpose |
|---|---|
| `index.html` | Simulator layout, cockpit HUD, help panel and browser canvas. |
| `styles.css` | Polished glassmorphism-style interface for the flight instruments and lesson cards. |
| `simulator.js` | Main simulator loop, aircraft controls, camera logic, HUD updates and lesson progress. |
| `flight-physics.js` | Educational physics model for lift, drag, thrust, weight and stall warning. |
| `aircraft-config.json` | Aircraft tuning data that can be swapped for different planes. |
| `lessons.json` | Guided lesson steps for takeoff, straight flight and waypoint training. |

## How to run locally

Because this example uses JavaScript modules and loads JSON files with `fetch()`, open it through a local server instead of double-clicking the HTML file.

Example:

```bash
python -m http.server 5500
```

Then open:

```text
http://localhost:5500/website-dev/3d-web-flight-simulator/examples/
```

## What this demonstrates

- Clean frontend project structure
- Real-time simulation loop
- Keyboard input management
- Modular physics logic
- Educational force calculations
- Cockpit-style HUD design
- Lesson/checkpoint architecture
- Data-driven aircraft configuration
- Data-driven guided learning modules

## Controls

| Key | Action |
|---|---|
| `W / S` | Pitch down / pitch up |
| `A / D` | Roll left / roll right |
| `Q / E` | Yaw left / yaw right |
| `Shift` | Increase throttle |
| `Control` | Decrease throttle |
| `R` | Reset aircraft |
| `L` | Toggle lesson panel |

## Technical note

This example is a polished browser MVP scaffold. The current visual demo uses a canvas-based flight display to keep the example lightweight and easy to review in a portfolio. A full production version can replace or expand the viewport with real Three.js/WebGL aircraft meshes, terrain, lighting, cockpit models and airport scenery while keeping the same modular architecture.

## Notes

This example is intentionally educational and lightweight. It is not meant to replace a full professional flight simulator engine. The goal is to show the architecture and thinking behind a browser-based MVP that can later grow into a larger simulator.

Possible future upgrades:

- Real Three.js mesh rendering
- Terrain and airport scene
- Cockpit 3D model
- Gamepad controls
- Advanced navigation instruments
- Cloud/weather system
- Backend progress saving
- Multiple aircraft profiles
