# Solar System Odyssey

**Solar System Odyssey** is an interactive web-based simulation game where you plan, launch, and manage interplanetary missions in a realistic 3D solar system. Visualize orbits, plan Hohmann transfers, and operate scientific instruments as you explore planets and other celestial bodies.

---
## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Game Concept](#game-concept)
- [Getting Started](#getting-started)
- [Controls](#controls)
- [Technical Framework](#technical-framework)
- [Loading Screen & Notification System](#loading-screen--notification-system)
- [Project Structure](#project-structure)
- [Legacy `script.js` and Code Organization](#legacy-scriptjs-and-code-organization)
- [Integrating NASA JPL Horizons API](#integrating-nasa-jpl-horizons-api)
- [Dependencies](#dependencies)
- [Known Issues](#known-issues)
- [UI – User Interface](#ui--user-interface)
- [UX – User Experience](#ux--user-experience)
- [Saving Mission Progress – Web Memory Solution](#saving-mission-progress--web-memory-solution)
- [Major Development Diary](#major-development-diary)
- [Wireframe Images & Textures](#wireframe-images--textures)
- [Credits](#credits)
- [License](#license)

---

## Introduction

Solar System Odyssey is a JavaScript-based game where players plan and execute space missions to explore planets and other bodies in our solar system. Players select satellite instruments, plan launch trajectories and windows, simulate the satellite’s path in real-time or at adjustable speeds, and view planetary data through instruments upon arrival. The game uses JavaScript, HTML, CSS, [Spacekit.js](https://typpo.github.io/spacekit/) for 3D visualizations, and NASA's resources for accurate data and images.

---

## Features

- 🌞 Real-time 3D solar system visualization using Three.js (Orbitronica style) and NASA JPL Horizons API
- 🚀 Mission planning with launch window and phase angle validation
- 🛰️ Satellite transfer orbit simulation and trajectory visualization
- 🧪 Operate scientific instruments: Camera, Spectrometer, Radar, Gravitometer, Multi-Spectral Imager
- 📊 Instrument data panels with planet-specific information and visualizations
- ⏩ Adjustable simulation speed and mission controls
- 🛠️ Resource management (fuel, power)
- 🖱️ Keyboard shortcuts for instrument switching

---

## Game Concept

- **Mission Planning:** Select a destination planet or body, choose instruments (e.g., camera, spectrometer, radar), and plan the launch window based on orbital alignments.
- **Trajectory Simulation:** Follow the satellite’s path through the solar system in real-time or at adjustable speeds.
- **Instrument Views:** Upon nearing a planet, switch to a view showing data or images from selected instruments.
- **Educational Value:** Incorporate accurate solar system data to teach players about planetary science and space exploration.

---

## Getting Started

1. **Clone or Download** this repository to your local machine.
2. Ensure all files are in the same directory, including:
   - `index.html`
   - `components/script.js`
   - `components/style.css`
3. Open `index.html` in your web browser.

> **Note:** You need an internet connection for Spacekit.js, NASA assets, and the Horizons API.

---

## Controls

- **Mission Planning:**  
  - Select a target planet/body and instruments.
  - Choose a launch date and click "Launch Mission".
- **Simulation Controls:**  
  - Pause/Resume: Click the Pause button.
  - Adjust speed: Use the simulation speed slider.
- **Instrument View:**  
  - Switch instruments: Press `1` (Camera), `2` (Spectrometer), `3` (Radar) on your keyboard.
  - Use instrument-specific controls (e.g., zoom for Camera).
- **Mission Status:**  
  - View mission progress, distance to target, elapsed time, and resources in the status panel.

---

## Technical Framework

- **JavaScript:** Core logic for mission planning, trajectory calculations, and simulation.
- **HTML:** Structure for the user interface, including mission planning and instrument views.
- **CSS:** Styling for an intuitive and visually appealing interface.
- **Three.js:** 3D space visualizations and solar system body rendering (Orbitronica-style).
- **NASA Data:** Images and scientific data for planets and instruments.
- **NASA JPL Horizons API:** For accurate, real-time planetary positions and ephemeris data.

---

## Loading Screen & Notification System

To improve user experience and assist with development/testing, Solar System Odyssey includes a loading screen and notification system:

- **Loading Screen:**  
  - Displays the game logo/name, a short loading message, and a visual progress bar representing loading completion (%).
  - The loading screen is shown as the first screen when the game starts and is hidden once initialization is complete.

- **Progress Bar:**  
  - Visually indicates the percentage of assets and systems loaded.
  - Updated programmatically as each loading step completes.

- **Notification System:**  
  - During loading, any issues (e.g., missing assets, failed API requests) are flagged as notices on the loading screen.
  - Notifications are also logged to the browser console for developer awareness.
  - Developers can trigger notifications using a function (e.g., `addLoadingNotification('Your message')`) during the loading process.
  - Each notification can include a command or suggestion for developers to address the issue, ensuring smooth development and testing.

**Example Notification Usage:**

```js
addLoadingNotification('Spacekit.js not loaded! Please check your CDN or network connection.');
```

[Back to Contents](#table-of-contents)

---

## Project Structure

A modular file structure for maintainability and scalability:

```
Solar Explorer 3D/
├── index.html
├── README.md
├── assets/
│   ├── textures/
│   │   ├── sun/
│   │   ├── mercury/
│   │   ├── venus/
│   │   ├── earth/
│   │   ├── mars/
│   │   ├── jupiter/
│   │   ├── saturn/
│   │   ├── uranus/
│   │   ├── neptune/
│   │   ├── dwarf_planets/
│   │   ├── small_bodies/
│   │   ├── heliosphere/
│   │   ├── universe_bodies/
│   │   └── placeholder.jpg
│   └── icons/
├── resources/
│   ├── information/
│   │   ├── sun/
│   │   ├── mercury/
│   │   ├── venus/
│   │   ├── earth/
│   │   ├── mars/
│   │   ├── jupiter/
│   │   ├── saturn/
│   │   ├── uranus/
│   │   ├── neptune/
│   │   ├── dwarf_planets/
│   │   ├── small_bodies/
│   │   ├── heliosphere/
│   │   ├── universe_bodies/
│   │   └── out_there/         # Hidden secret: audio file + info sheet
│   │       ├── secret.mp3
│   │       └── info.txt
├── components/
│   ├── script.js                # (Legacy: main script, to be split; see below)
│   ├── style.css
│   ├── core/
│   │   ├── gameManager.js
│   │   ├── orbitalMechanics.js
│   │   └── missionPlanner.js
│   ├── ui/
│   │   ├── instrumentView.js
│   │   ├── instrumentVisualizer.js
│   │   └── controls.js
│   ├── data/
│   │   ├── planetData.js
│   │   └── instrumentConfig.js
│   └── utils/
│       └── helpers.js
```

- **assets/textures/**: Each planet or body (Sun, Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune, Dwarf Planets, Small Bodies, Heliosphere, Universe Bodies) has its own folder for multiple images. Use [NASA's Photojournal](https://photojournal.jpl.nasa.gov/) for authentic visuals.
- **resources/information/**: Each planet/body has a folder for videos and info sheets. The `out_there/` folder contains a secret audio file and info sheet for the game's hidden content.
- **assets/icons/**: UI icons and other static resources.
- **components/core/**: Core simulation/game logic, state management, and orbital mechanics.
- **components/ui/**: UI logic, instrument panels, and user controls.
- **components/data/**: Static data/configuration for planets and instruments.
- **components/utils/**: General-purpose utility functions.

> **Tip:** When adding new planets, bodies, or secrets, create corresponding folders in both `assets/textures/` and `resources/information/` for images, videos, and info sheets.

---

## Legacy `script.js` and Code Organization

- **script.js**: This is the original, monolithic JavaScript file containing all game logic, UI, and data. As the project grows, this file can become unwieldy and hard to maintain.
- **Splitting Policy**: To keep development manageable, once `script.js` exceeds 500 lines, start a new script file (e.g., `script2.js`, `script3.js`, etc.), each holding up to 500 lines of code. This helps prevent any single file from becoming too large and encourages modularization.
- **Refactoring Goal**: Over time, move related logic from these large scripts into the appropriate submodules under `components/core/`, `components/ui/`, `components/data/`, and `components/utils/` as described above. This will improve maintainability, readability, and scalability.
- **Current Status**: If your `script.js` is over 600 lines, consider splitting it now and begin migrating code into smaller, purpose-driven files as outlined in the [Project Structure](#project-structure) section.

> **Tip:** Use clear naming and comments when splitting files, and update your HTML to include all relevant script files in the correct order.

---

## Integrating NASA JPL Horizons API

To enhance the realism and accuracy of planetary positions and ephemeris data, Solar System Odyssey can integrate the [NASA JPL Horizons API](https://ssd-api.jpl.nasa.gov/doc/horizons.html).

### About the Horizons API

The NASA JPL Horizons API provides access to highly accurate ephemeris data for solar system bodies. It is available in several forms, but for browser-based applications, the REST API endpoint is recommended.

- **REST API Endpoint:**  
  `https://ssd-api.jpl.nasa.gov/horizons.api`  
  This endpoint supports JSON responses and CORS, making it suitable for direct use in web applications.

- **Legacy Endpoints:**  
  File-based and telnet-based endpoints are not suitable for browser use.

### Example Usage

You can fetch planetary ephemeris data (e.g., position, velocity) for a given body and time range using a simple HTTP GET request:

```js
// Example: Fetch Mars ephemeris data for a date range
fetch('https://ssd-api.jpl.nasa.gov/horizons.api?format=json&COMMAND=499&OBJ_DATA=NO&MAKE_EPHEM=YES&EPHEM_TYPE=VECTORS&START_TIME=2024-07-01&STOP_TIME=2024-07-02&STEP_SIZE=1d')
  .then(response => response.json())
  .then(data => {
    // Use data.result or data['vectors'] for position/velocity
    console.log(data);
  });
```

- `COMMAND=499` is Mars (see [Horizons body IDs](https://ssd-api.jpl.nasa.gov/doc/horizons.html#commands)).
- `EPHEM_TYPE=VECTORS` returns position/velocity vectors.
- `START_TIME` and `STOP_TIME` define the time range.
- `STEP_SIZE` sets the interval.

### Implementation Steps

1. **Determine the Target Body and Time Range:**  
   Use the appropriate Horizons `COMMAND` code for the planet or body (e.g., 499 for Mars, 399 for Earth).

2. **Build the API Request URL:**  
   Construct the URL with the desired parameters (see above).

3. **Fetch Data in JavaScript:**  
   Use `fetch()` or `XMLHttpRequest` to retrieve the data asynchronously.

4. **Parse and Use the Data:**  
   Extract position, velocity, or other ephemeris data from the JSON response and use it to update your simulation (e.g., for more accurate planet positions or trajectory calculations).

5. **CORS Considerations:**  
   The Horizons REST API supports CORS, so it can be called directly from the browser.

6. **Error Handling:**  
   Always check for errors in the response and handle network issues gracefully.

### Example Integration in This Project

- Use Horizons API to fetch up-to-date positions for planets at mission planning time.
- Optionally, update planet positions in the Three.js simulation using the returned vectors.
- Use the API to validate launch windows or calculate more precise transfer orbits.

### Resources

- [Horizons API Documentation](https://ssd-api.jpl.nasa.gov/doc/horizons.html)
- [List of Horizons Body IDs](https://ssd-api.jpl.nasa.gov/doc/horizons.html#commands)
- [Sample API Query Builder](https://ssd-api.jpl.nasa.gov/doc/horizons.html#examples)

> **Tip:** For best performance, cache or limit the frequency of API requests to avoid rate limits.

---

## Dependencies

- [Three.js](https://threejs.org/)
- NASA JPL [Horizons API](https://ssd-api.jpl.nasa.gov/doc/horizons.html)
- No build tools required; runs in modern browsers.

---

## Known Issues

- Some assets (e.g., textures, sprites) are loaded from external URLs and may 404 if unavailable. (Spacekit.js dependency removed; all core features now use local or NASA assets.)
- Not all instrument visualizations are fully implemented (stubbed for demo).
- Only Mars and Venus are currently supported as mission targets.

---

## UI – User Interface

The Solar System Odyssey UI uses a modern "glass screen" aesthetic, featuring floating side elements with a frosted-glass effect and full-opacity white text and controls. The background is a very light blue-green gradient, giving a clean, high-tech look. All buttons and sliders for controls and setup are styled for clarity and tactile feedback.

### Layout Overview

- **Top Bar:**  
    - **Satellite Selection:** Choose or configure satellites (weight, tech level, instruments, budget, camera setup, power source).
    - **Mission Selection:** Set mission parameters (trajectory, target planets, research/media requirements, orbit type, timeframe, speed).
    - **Launch Button:** Prominently placed for easy access.

- **Control Centre (Side Panels):**  
    - Floating panels on the left/right for all setup and control options, using glassmorphism (blurred, semi-transparent backgrounds).
    - All text is crisp white for maximum readability.
    - Sliders and buttons have a glassy, tactile appearance.

- **Main Display Area:**  
    - **Center:** Shows either the satellite or the solar system in 2D, depending on the selected view.
    - **After Loading:** Transitions with a video or animation into the satellite/mission setup screen.
    - **After Launch:** Plays a launch animation, then transitions to a keyboard controls overlay, then into the 3D satellite environment.

- **Satellite Journey View:**  
    - Satellite is centered on a black background, with mission stats in the top right.
    - Mouse allows free look around the satellite.
    - Keyboard commands access onboard instruments.
    - Camera view provides a 2D perspective of the 3D space.
    - All planets are rendered in 3D.

### Key Features

- **Micro Thrusters Option:**  
    - Add micro thrusters for orbital maneuvering during research phases.

- **Mission Path:**  
    - Satellite path is set during mission planning; orbital adjustments possible if thrusters are equipped.

    - **Active Mission List:**  
        - The mission menu side panel includes an "Active Missions" screen, allowing players to view and access all ongoing missions.
        - Each active mission displays its target, status, elapsed time, and quick-access controls (e.g., switch view, abort, or review mission data).
        - Players can seamlessly switch between missions or return to mission planning from this list.

- **Accessibility:**  
    - High-contrast, readable UI.
    - Keyboard overlay appears during piloting or instrument operation.

- **Progression:**  
    - Unlock new options and instruments as missions are completed.

> **Tip:** The glass UI style keeps controls accessible but unobtrusive, letting the simulation remain the visual focus.

[Back to Contents](#table-of-contents)

---

## UX – User Experience

- **2-Click Access:**  
    All major actions are reachable within two clicks, ensuring fast and intuitive navigation.

- **Unobtrusive Interface:**  
    The UI maintains a consistent style and avoids covering the main 3D view, keeping the simulation in focus.

- **Keyboard Overlay:**  
    A dedicated overlay displays keyboard controls during piloting or satellite operation, making key bindings easy to reference.

- **High Contrast & Readability:**  
    UI elements use clear typography and high-contrast colors for accessibility and easy reading.

- **Sliders & Fill Bars:**  
    Adjustable variables (simulation speed, fuel, power) use sliders and fill bars for instant visual feedback.

- **Logical Layout:**  
    The UI guides users smoothly through mission planning, simulation, and instrument operation, supporting a seamless experience.

- **Progression & Unlocks:**  
    Completing research missions unlocks new satellite sensors and parts. Unlock notifications highlight new capabilities, encouraging experimentation. Research milestones trigger unlocks, rewarding discovery and motivating continued play.

- **Mystery Unlock – The Hidden Signal:**  
    A secret mission awaits: after achieving key research milestones, players may receive a mysterious signal from the edge of the solar system. This unlocks the hidden "Out There" content—an audio transmission and info sheet—inviting players to investigate the unknown and uncover the game's deepest secrets.

[Back to Contents](#table-of-contents)

---

## Saving Mission Progress – Web Memory Solution

To ensure players can save their mission progress and resume where they left off, Solar System Odyssey uses browser-based storage solutions such as **localStorage** or **IndexedDB**. This allows mission data to persist even if the website is closed or refreshed.

### How It Works

- **Automatic Saving:**  
        The game automatically saves mission state (active missions, satellite status, resources, unlocks, etc.) to the browser’s local storage at key points (e.g., after mission planning, during simulation, upon completing milestones).

    - **Resuming Progress:**  
        When the game loads, it checks for saved data and offers to restore the previous session. Players can continue their missions seamlessly.

    - **Manual Save/Load (Optional):**  
        Advanced users may have access to manual save/load options in the settings or mission menu.

    ### Technical Details

    - **localStorage:**  
        Stores small amounts of data as key-value pairs. Suitable for most mission data and quick saves.
        ```js
        // Save mission progress
        localStorage.setItem('missionProgress', JSON.stringify(missionData));

        // Load mission progress
        const saved = localStorage.getItem('missionProgress');
        if (saved) {
            const missionData = JSON.parse(saved);
            // Restore game state
        }
        ```

    - **IndexedDB:**  
        For larger or more complex data (e.g., multiple missions, detailed logs), IndexedDB can be used.

    - **Data Security:**  
        All data is stored locally in the user's browser and is not transmitted externally.

    ### Best Practices

    - **Save Frequently:**  
        Save after major actions to minimize data loss.

    - **Versioning:**  
        Include a version number in saved data to handle future updates or changes in data structure.

    - **Clear/Reset Option:**  
        Provide a way for users to clear saved progress and start fresh if desired.

    > **Tip:** Encourage players to use the same browser and device to ensure their progress is available when they return.

[Back to Contents](#table-of-contents)

---

## Major Development Diary

### Project Genesis: README Creation & Vision (April 2025)

The Solar System Odyssey project began with the creation of a comprehensive README file, laying the foundation for a robust, scalable, and educational space simulation game. The initial focus was on designing an advanced folder structure to support modular development, maintainability, and future expansion. Key goals included:

- **Engine Selection:**  
    Early research compared JavaScript-based 3D engines (Three.js, Babylon.js, Spacekit.js). The initial plan favored Spacekit.js for rapid prototyping, but with an eye toward future migration to Three.js for greater control and extensibility.

- **Folder Structure:**  
    The project was architected with clear separation of concerns:  
    - `components/` for core logic, UI, data, and utilities  
    - `assets/` for textures, icons, and static resources  
    - `resources/information/` for planet-specific info and secrets  
    - Modular subfolders for each major system (game logic, UI, data, helpers)

- **UI/UX Blueprint:**  
    The README detailed a modern, glassmorphic UI with floating panels, high-contrast controls, and a clean, immersive layout. The UX plan emphasized accessibility, two-click navigation, and a seamless flow from mission planning to simulation.

- **Missing Pieces:**  
    At this stage, the project lacked finalized wireframes, 3D models, and textures. The README served as a living design document, setting the scene for future development and providing a roadmap for contributors and AI agents to execute the vision.

- **Timeline & Milestones:**  
    The initial roadmap targeted a playable prototype within 8 weeks, with early deliverables including the core simulation engine, mission planner, and basic UI. The README established a clear direction, enabling rapid onboarding and focused progress.

- **Vibe:**  
    The project’s inception was marked by excitement and ambition, with a strong emphasis on educational value, scientific accuracy, and an engaging player experience. The README captured this spirit, serving as both a technical guide and a motivational anchor for the team.

---

### Migration from Spacekit.js to Three.js (June 2025)

During development, we encountered persistent 404 errors and CDN/asset issues with Spacekit.js, which was previously used for 3D solar system visualization. These issues affected reliability and asset loading, especially for external users and in production environments. After evaluating alternatives, we migrated the visualization engine to a direct Three.js implementation, inspired by the Orbitronica style. This change:

- Eliminated dependency on Spacekit.js and its CDN.
- Improved control over 3D rendering, asset management, and interactivity.
- Allowed for more robust integration of NASA textures and custom UI overlays.
- Enabled future extensibility for advanced features (e.g., real-time planetary positions, custom shaders, and more detailed mission simulation).

All code, UI, and documentation have been updated to reflect this migration. If you previously used or contributed to the Spacekit.js version, please note that all 3D logic is now handled in `components/orbitronica-init.js` and related modules using Three.js directly.

[Back to Contents](#table-of-contents)
---

### Wireframe Images & Textures

Below are SVG wireframes illustrating the planned UI for Mission Control and Satellite Build/Progress screens. These serve as visual guides for layout and user flow.

#### Mission Control UI Wireframe

<div style="background: #fff; padding: 16px; display: inline-block;">
    <img src="assets/resources/Solar%20System%20Odyssey-mission.svg" alt="Mission Control Wireframe" style="background: #fff; display: block; max-width: 100%;">
</div>

#### Satellite Build/Progress UI Wireframe

<div style="background: #fff; padding: 16px; display: inline-block;">
    <img src="assets/resources/Solar%20System%20Odyssey-satellite.svg" alt="Satellite Build Wireframe" style="background: #fff; display: block; max-width: 100%;">
</div>

> These wireframes are for reference and will guide the implementation of the glassmorphic UI and control panels described above.

[Back to Contents](#table-of-contents)

---

## Credits

- Solar system visualization powered by [Three.js](https://threejs.org/)
- NASA planetary data and images via [Photojournal](https://photojournal.jpl.nasa.gov/) and [Horizons API](https://ssd-api.jpl.nasa.gov/doc/horizons.html)
- Developed by David Wells

[Back to Contents](#table-of-contents)

---

## License

This project is for educational and demonstration purposes.

[Back to Contents](#table-of-contents)




