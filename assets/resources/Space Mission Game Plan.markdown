# Space Mission Game Development Plan

## Introduction
This plan outlines the development of a JavaScript-based game where players plan and execute space missions to explore planets in our solar system. The game involves selecting satellite instruments, planning launch trajectories and windows, simulating the satellite’s path in real-time or at adjustable speeds, and viewing planetary data through instruments upon arrival. The game will use JavaScript, HTML, and CSS, with Spacekit.js for 3D visualizations and NASA's resources for accurate data and images.

## Game Concept
The game, tentatively called "Solar Explorer," immerses players in the role of a mission controller. Key features include:

- **Mission Planning**: Select a destination planet, choose instruments (e.g., camera, spectrometer, radar), and plan the launch window based on orbital alignments.
- **Trajectory Simulation**: Follow the satellite’s path through the solar system in real-time or at adjustable speeds.
- **Instrument Views**: Upon nearing a planet, switch to a view showing data or images from selected instruments.
- **Educational Value**: Incorporate accurate solar system data to teach players about planetary science and space exploration.

The goal is to balance realism with accessibility, making the game engaging for players with varying levels of scientific knowledge.

## Technical Framework
The game will be built using web technologies to ensure accessibility across browsers. The technical stack includes:

- **JavaScript**: Core logic for mission planning, trajectory calculations, and simulation.
- **HTML**: Structure for the user interface, including mission planning and instrument views.
- **CSS**: Styling for an intuitive and visually appealing interface.
- **Spacekit.js**: A JavaScript library for 3D space visualizations, providing presets for solar system bodies and support for custom orbits (https://typpo.github.io/spacekit/).
- **NASA's HORIZONS API**: For accurate planetary positions and ephemeris data (https://ssd.jpl.nasa.gov/horizons/).
- **NASA's Image and Data Resources**: For planet images and scientific data (https://photojournal.jpl.nasa.gov/, https://solarsystem.nasa.gov/planets/).

## Game Architecture
The game will consist of three main components:

1. **Mission Planning Interface**:
   - Select a destination planet from a dropdown (e.g., Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune).
   - Choose instruments from a predefined list, each with specific functions (e.g., camera for images, spectrometer for composition, radar for topography).
   - Plan the launch date by calculating or selecting an optimal launch window based on the phase angle for a Hohmann transfer.
   - Display the calculated trajectory parameters (e.g., delta-v, transfer time).

2. **Simulation**:
   - Render a 3D solar system using Spacekit.js, showing planets and the satellite’s path.
   - Simulate the satellite’s trajectory using Keplerian orbital elements derived from Hohmann transfer calculations.
   - Allow players to toggle between real-time and adjustable speed modes.
   - Trigger an option to switch to instrument view when the satellite is within a defined proximity to the target planet.

3. **Instrument View**:
   - Display a separate interface or overlay showing data or images based on selected instruments.
   - For example, the camera shows a planet image, the spectrometer displays atmospheric composition, and the radar shows surface features.
   - Include interactive elements, such as zooming into images or selecting data points.

## Orbital Mechanics and Launch Windows
To simulate realistic space travel, the game will use simplified Hohmann transfer orbits, which are fuel-efficient paths between two circular orbits. The key calculations include:

- **Hohmann Transfer**:
  - Semi-major axis of transfer orbit: \( a_{\text{transfer}} = \frac{a_{\text{earth}} + a_{\text{target}}}{2} \), where \( a_{\text{earth}} = 1 \) AU and \( a_{\text{target}} \) is the target planet’s semi-major axis.
  - Transfer time: \( t_{\text{transfer}} = \frac{1}{2} \sqrt{a_{\text{transfer}}^3} \) years (in astronomical units, where \( \mu = 1 \)).
  - Delta-v for first burn: \( \Delta v_1 = \sqrt{\frac{\mu}{r_1}} \left( \sqrt{\frac{2 r_2}{r_1 + r_2}} - 1 \right) \).
  - Delta-v for second burn: \( \Delta v_2 = \sqrt{\frac{\mu}{r_2}} \left( 1 - \sqrt{\frac{2 r_1}{r_1 + r_2}} \right) \).

- **Phase Angle for Launch Window**:
  - For outer planets: \( \gamma_1 = 180^\circ - n_f \cdot t_{\text{transfer}} \), where \( n_f = \frac{360^\circ}{T_f} \), and \( T_f = a_{\text{target}}^{1.5} \) years.
  - For inner planets, use the same formula, adjusting the angle modulo 360°.
  - Example: For Mars (\( a_{\text{mars}} = 1.524 \) AU), \( a_{\text{transfer}} = 1.262 \) AU, \( t_{\text{transfer}} \approx 0.7085 \) years, \( T_{\text{mars}} \approx 1.881 \) years, \( n_{\text{mars}} \approx 191.4^\circ/\text{year} \), so \( \gamma_1 \approx 44.4^\circ \).
  - For Venus (\( a_{\text{venus}} = 0.723 \) AU), calculations yield \( \gamma_1 \approx 306.2^\circ \), though some sources suggest ~119° due to differing conventions.

- **Simplification for Gameplay**:
  - Predefine acceptable phase angle ranges (e.g., 40°–50° for Mars) to simplify launch window selection.
  - Allow players to choose a launch date, and check if the current phase angle (obtained via Spacekit.js or HORIZONS API) is within the acceptable range.

## Asset and Data Collection
To ensure realism, the game will use the following assets and data:

- **Planet Images**:
  - Source high-quality images from NASA's Photojournal (https://photojournal.jpl.nasa.gov/), which offers publicly released images of planets.
  - Example: Use images of Mars’ surface for the camera view or Jupiter’s cloud bands.

- **Scientific Data**:
  - Gather data from NASA's Solar System Exploration (https://solarsystem.nasa.gov/planets/), including:
    - Atmospheric composition (e.g., Venus: 96.5% CO₂, 3.5% N₂).
    - Surface features (e.g., Mars: Valles Marineris, Olympus Mons).
    - Physical characteristics (e.g., Jupiter: diameter 139,820 km).
  - Use this data for spectrometer and radar views, presented as text, graphs, or simplified visuals.

- **3D Models**:
  - Spacekit.js includes presets for planets with ephemeris data and basic visualizations.
  - Optionally, enhance visuals with textures from public domain sources or create simple spherical models with Three.js if needed.

### Planet Data Table
| Planet   | Distance from Sun (AU) | Diameter (km) | Atmosphere Composition | Notable Surface Features |
|----------|------------------------|---------------|------------------------|--------------------------|
| Mercury  | 0.39                   | 4,879         | Thin, mostly He, O₂    | Caloris Basin            |
| Venus    | 0.723                  | 12,104        | 96.5% CO₂, 3.5% N₂    | Maxwell Montes           |
| Earth    | 1.0                    | 12,742        | 78% N₂, 21% O₂        | Oceans, Himalayas        |
| Mars     | 1.524                  | 6,792         | 95.3% CO₂, 2.7% N₂    | Valles Marineris         |
| Jupiter  | 5.203                  | 139,820       | 89.8% H₂, 10.2% He    | Great Red Spot           |
| Saturn   | 9.539                  | 116,460       | 96.3% H₂, 3.25% He    | Rings, Titan             |
| Uranus   | 19.18                  | 50,724        | 82.5% H₂, 15.2% He    | Miranda’s cliffs         |
| Neptune  | 30.07                  | 49,244        | 80% H₂, 19% He        | Great Dark Spot          |

## Implementation Steps
1. **Project Setup**:
   - Create a new project directory with `index.html`, `styles.css`, and `script.js`.
   - Include Spacekit.js via npm (`npm install spacekit.js`) or CDN (https://typpo.github.io/spacekit/build/spacekit.js).
   - Set up a basic HTML structure with sections for mission planning, simulation, and instrument views.

2. **Mission Planning Interface**:
   - Design a form with dropdowns for planet selection, checkboxes for instruments, and a date picker or "find launch window" button.
   - Implement JavaScript functions to calculate phase angles and validate launch windows.
   - Display trajectory parameters (e.g., transfer time, delta-v).

3. **Trajectory Calculation**:
   - Write functions to compute Hohmann transfer parameters (semi-major axis, transfer time, delta-v).
   - Convert parameters to Keplerian elements for Spacekit.js’s `Ephem` class to define the satellite’s orbit.

4. **Simulation**:
   - Initialize a Spacekit.js visualization with solar system presets.
   - Add a custom `SpaceObject` for the satellite using calculated orbital elements.
   - Implement a simulation loop to update positions, with controls for speed adjustment.
   - Detect proximity to the target planet and trigger the instrument view option.

5. **Instrument View**:
   - Create a modal or separate scene for instrument views.
   - Load images and data based on selected instruments and the target planet.
   - Add interactive elements, such as buttons to switch between instruments.

6. **Asset Integration**:
   - Download and organize planet images and data.
   - Map assets to planets and instruments in JavaScript objects for easy access.
   - Test rendering in the instrument view.

7. **Testing and Refinement**:
   - Test the game for accuracy (e.g., correct phase angles, realistic trajectories).
   - Ensure cross-browser compatibility and optimize performance.
   - Gather feedback and refine the user interface and gameplay.

## Sample Code Outline
Below is a basic code structure to get started:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Solar Explorer</title>
  <link rel="stylesheet" href="styles.css">
  <script src="https://typpo.github.io/spacekit/build/spacekit.js"></script>
</head>
<body>
  <div id="mission-planning">
    <h1>Plan Your Mission</h1>
    <form id="mission-form">
      <label>Destination Planet:
        <select id="planet-select">
          <option value="mars">Mars</option>
          <option value="venus">Venus</option>
          <!-- Add more planets -->
        </select>
      </label>
      <label>Instruments:
        <input type="checkbox" id="camera"> Camera
        <input type="checkbox" id="spectrometer"> Spectrometer
        <input type="checkbox" id="radar"> Radar
      </label>
      <label>Launch Date:
        <input type="date" id="launch-date">
      </label>
      <button type="submit">Launch Mission</button>
    </form>
  </div>
  <div id="simulation"></div>
  <div id="instrument-view" style="display: none;">
    <h2>Instrument Data</h2>
    <div id="instrument-content"></div>
  </div>
  <script src="script.js"></script>
</body>
</html>
```

```css
/* styles.css */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background: #000;
  color: #fff;
}
#mission-planning, #instrument-view {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}
#simulation {
  width: 100%;
  height: 600px;
}
form label {
  display: block;
  margin: 10px 0;
}
button {
  padding: 10px 20px;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background: #0056b3;
}
```

```javascript
// script.js
// Initialize Spacekit.js visualization
const viz = new Spacekit.Simulation(document.getElementById('simulation'), {
  basePath: 'https://typpo.github.io/spacekit/build',
  jd: 2458600.5, // Julian date for simulation start
});

// Add Sun and planets
viz.createStars();
viz.createObject('sun', Spacekit.SpaceObjectPresets.SUN);
viz.createObject('earth', Spacekit.SpaceObjectPresets.EARTH);
viz.createObject('mars', Spacekit.SpaceObjectPresets.MARS);
// Add more planets as needed

// Mission planning form
document.getElementById('mission-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const planet = document.getElementById('planet-select').value;
  const instruments = [];
  if (document.getElementById('camera').checked) instruments.push('camera');
  if (document.getElementById('spectrometer').checked) instruments.push('spectrometer');
  if (document.getElementById('radar').checked) instruments.push('radar');
  const launchDate = new Date(document.getElementById('launch-date').value);

  // Calculate Hohmann transfer
  const transfer = calculateHohmannTransfer('earth', planet);
  const phaseAngle = calculatePhaseAngle(planet, transfer.transferTime);

  // Check if launch date is within launch window
  // Use Spacekit.js or HORIZONS API to get current phase angle
  // For simplicity, assume it's valid for now

  // Create satellite orbit
  viz.createObject('satellite', {
    ephem: new Spacekit.Ephem({
      epoch: 2458600.5,
      a: transfer.semiMajorAxis,
      e: 0, // Simplified circular orbit
      i: 0,
      om: 0,
      w: 0,
      ma: 0,
    }, 'deg'),
    labelText: 'Satellite',
  });

  // Start simulation
  startSimulation(transfer, instruments, planet);
});

function calculateHohmannTransfer(startPlanet, endPlanet) {
  const planetData = {
    earth: { a: 1.0 },
    mars: { a: 1.524 },
    venus: { a: 0.723 },
    // Add more planets
  };
  const a1 = planetData[startPlanet].a;
  const a2 = planetData[endPlanet].a;
  const a_transfer = (a1 + a2) / 2;
  const transferTime = 0.5 * Math.sqrt(Math.pow(a_transfer, 3));
  const deltaV1 = Math.sqrt(1 / a1) * (Math.sqrt((2 * a2) / (a1 + a2)) - 1);
  const deltaV2 = Math.sqrt(1 / a2) * (1 - Math.sqrt((2 * a1) / (a1 + a2)));
  return { semiMajorAxis: a_transfer, transferTime, deltaV1, deltaV2 };
}

function calculatePhaseAngle(planet, transferTime) {
  const planetData = {
    mars: { period: Math.sqrt(Math.pow(1.524, 3)) },
    venus: { period: Math.sqrt(Math.pow(0.723, 3)) },
  };
  const n_f = 360 / planetData[planet].period;
  let phaseAngle = (180 - n_f * transferTime) % 360;
  if (phaseAngle < 0) phaseAngle += 360;
  return phaseAngle;
}

function startSimulation(transfer, instruments, planet) {
  // Update simulation loop to track satellite position
  // When near planet, show instrument view
  document.getElementById('instrument-view').style.display = 'block';
  const content = document.getElementById('instrument-content');
  // Load assets based on instruments and planet
  content.innerHTML = `<p>Viewing ${planet} with ${instruments.join(', ')}</p>`;
  // Add image/data rendering logic
}

// Load assets
const assets = {
  mars: {
    camera: 'mars_image.jpg',
    spectrometer: '95.3% CO₂, 2.7% N₂',
    radar: 'Valles Marineris, Olympus Mons',
  },
  venus: {
    camera: 'venus_image.jpg',
    spectrometer: '96.5% CO₂, 3.5% N₂',
    radar: 'Maxwell Montes',
  },
};
</script>
```

## Additional Features
- **Multiple Missions**: Allow players to plan multiple missions to different planets.
- **Educational Content**: Include pop-ups or tooltips with facts about planets and instruments.
- **Challenges**: Add objectives, such as collecting specific data or staying within a fuel budget.
- **Realism Enhancements**: Use HORIZONS API for precise planet positions or add gravitational assists for advanced players.

## Sketches and Visuals
- **Mission Planning UI**: A form with dropdowns, checkboxes, and a date picker, styled with a futuristic theme.
- **Simulation View**: A 3D canvas showing the solar system, with controls for speed and zoom.
- **Instrument View**: A modal with tabs for each instrument, displaying images or data.
- Create wireframes using tools like Figma or sketch on paper to visualize layouts.

## Research and Data Sources
- **Solar System Data**: NASA's Solar System Exploration provides distances, sizes, and compositions (https://solarsystem.nasa.gov/planets/).
- **Images**: NASA's Photojournal offers high-resolution planet images (https://photojournal.jpl.nasa.gov/).
- **Orbital Mechanics**: Resources like Orbital Mechanics & Astrodynamics (https://orbital-mechanics.space/) explain Hohmann transfers and phase angles.
- **Spacekit.js Examples**: Explore Spacekit.js’s GitHub for sample visualizations (https://github.com/typpo/spacekit/tree/master/examples).

## Potential Challenges
- **Orbital Mechanics Complexity**: Simplifying calculations without losing educational value may require balancing accuracy and gameplay.
- **Performance**: Rendering a 3D solar system may be resource-intensive; optimize using Spacekit.js’s features.
- **Data Integration**: Mapping NASA’s data to instrument views requires careful organization.
- **User Experience**: Ensure the interface is intuitive for players unfamiliar with space concepts.

## Timeline
- **Week 1–2**: Set up project, integrate Spacekit.js, and design UI wireframes.
- **Week 3–4**: Implement mission planning and trajectory calculations.
- **Week 5–6**: Develop simulation and instrument views.
- **Week 7–8**: Collect and integrate assets, test, and refine.
- **Week 9+**: Add additional features and polish the game.

## Conclusion
This plan provides a structured approach to building your JavaScript space mission game. By leveraging Spacekit.js, NASA’s resources, and simplified orbital mechanics, you can create an engaging and educational experience. Start with the provided code outline, gather assets, and iterate based on testing and feedback. Happy coding, and enjoy exploring the solar system!