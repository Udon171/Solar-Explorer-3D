// script.js
// Initialize Spacekit.js visualization
const viz = new Spacekit.Simulation(document.getElementById('simulation'), {
    basePath: 'https://typpo.github.io/spacekit/build',
    jd: 2458600.5, // Julian date for simulation start
    textureLoader: new Spacekit.SpriteTextureLoader({
    sunTexture: '/assets/textures/sun.jpg',
    mercuryTexture: '/assets/textures/mercury.jpg',
    venusTexture: '/assets/textures/venus.jpg',
    earthTexture: '/assets/textures/earth.jpg',
    marsTexture: '/assets/textures/mars.jpg',
}),
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
    
    if (instruments.length === 0) {
        alert('Please select at least one instrument');
        return;
    }

    const launchDate = new Date(document.getElementById('launch-date').value);
    const transfer = calculateHohmannTransfer('earth', planet);
    const phaseAngle = calculatePhaseAngle(planet, transfer.transferTime);

    // Validate launch window
    const params = MISSION_PARAMETERS[planet];
    if (phaseAngle < params.minPhaseAngle || phaseAngle > params.maxPhaseAngle) {
        alert(`Invalid launch window. Phase angle must be between ${params.minPhaseAngle}° and ${params.maxPhaseAngle}°`);
        return;
    }

    // Check resources
    if (gameState.resources.fuel < params.fuelRequirement) {
        alert('Insufficient fuel for this mission');
        return;
    }

    // Create mission
    gameState.currentMission = {
        target: planet,
        instruments,
        transfer,
        startDate: launchDate,
        elapsedTime: 0
    };

    // Initialize satellite
    initializeSatellite(transfer);
    startMission();
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

const INSTRUMENT_CONFIG = {
    camera: {
        name: 'High Resolution Camera',
        powerUsage: 5,
        dataRate: 10,
        description: 'Captures detailed surface images'
    },
    spectrometer: {
        name: 'Mass Spectrometer',
        powerUsage: 8,
        dataRate: 5,
        description: 'Analyzes atmospheric composition'
    },
    radar: {
        name: 'Surface Radar',
        powerUsage: 12,
        dataRate: 15,
        description: 'Maps surface topology'
    }
};

const PLANET_DATA = {
    mars: {
        atmosphere: '95.3% CO₂, 2.7% N₂, 1.6% Ar',
        surfaceFeatures: ['Olympus Mons', 'Valles Marineris', 'Hellas Planitia'],
        temperature: '-63°C (average)',
        gravity: '3.72 m/s²'
    },
    venus: {
        atmosphere: '96.5% CO₂, 3.5% N₂',
        surfaceFeatures: ['Maxwell Montes', 'Ishtar Terra', 'Aphrodite Terra'],
        temperature: '462°C (average)',
        gravity: '8.87 m/s²'
    }
};

const gameState = {
    missionActive: false,
    currentMission: null,
    simulationSpeed: 1,
    elapsedTime: 0,
    resources: {
        fuel: 100,
        power: 100
    }
};

const MISSION_PARAMETERS = {
    mars: {
        minPhaseAngle: 40,
        maxPhaseAngle: 50,
        distanceThreshold: 0.1, // AU
        fuelRequirement: 70
    },
    venus: {
        minPhaseAngle: 115,
        maxPhaseAngle: 125,
        distanceThreshold: 0.1,
        fuelRequirement: 60
    }
};

function initializeSatellite(transfer) {
    const satellite = viz.createObject('satellite', {
        ephem: new Spacekit.Ephem({
            epoch: 2458600.5,
            a: transfer.semiMajorAxis,
            e: transfer.deltaV1 / 30, // Simplified elliptical orbit
            i: 0,
            om: 0,
            w: 0,
            ma: 0,
        }, 'deg'),
        labelText: 'Satellite',
        radius: 0.001, // Small visible size
        color: 0x00ff00
    });

    gameState.satellite = satellite;
    return satellite;
}

function animate() {
    requestAnimationFrame(animate);
    viz.update();

    if (gameManager.gameState.missionActive) {
        gameManager.updateGameState();
        updateMissionStatus();
    }
}

function updateMissionStatus() {
    const mission = gameState.currentMission;
    const target = viz.getObject(mission.target);
    const satellite = gameState.satellite;
    
    if (!target || !satellite) return;

    const satPos = satellite.getPosition();
    const targetPos = target.getPosition();
    const distance = Math.sqrt(
        Math.pow(satPos.x - targetPos.x, 2) + 
        Math.pow(satPos.y - targetPos.y, 2) + 
        Math.pow(satPos.z - targetPos.z, 2)
    );

    // Check if satellite reached target
    if (distance < MISSION_PARAMETERS[mission.target].distanceThreshold) {
        activateInstruments(mission.target, mission.instruments);
    }

    // Update UI with current status
    updateMissionUI(distance, mission.elapsedTime);
}

function updateMissionUI(distance, elapsedTime) {
    const statusDiv = document.getElementById('mission-status') || createStatusElement();
    statusDiv.innerHTML = `
        <h3>Mission Status</h3>
        <p>Distance to target: ${distance.toFixed(3)} AU</p>
        <p>Mission time: ${elapsedTime.toFixed(1)} days</p>
        <p>Fuel remaining: ${gameState.resources.fuel}%</p>
    `;
}

function activateInstruments(planet, instruments) {
    const instrumentView = document.getElementById('instrument-view');
    const content = document.getElementById('instrument-content');
    
    instrumentView.style.display = 'block';
    
    let instrumentHTML = '<div class="instruments-container">';
    
    instruments.forEach(instrument => {
        const config = INSTRUMENT_CONFIG[instrument];
        const data = PLANET_DATA[planet];
        
        instrumentHTML += `
            <div class="instrument-panel">
                <h3>${config.name}</h3>
                <div class="instrument-stats">
                    <span>Power Usage: ${config.powerUsage}W</span>
                    <span>Data Rate: ${config.dataRate} Mb/s</span>
                </div>
                <div class="instrument-data">
                    ${generateInstrumentData(instrument, planet, data)}
                </div>
            </div>
        `;
    });
    
    instrumentHTML += '</div>';
    content.innerHTML = instrumentHTML;
}

const instrumentVisualizer = new InstrumentVisualizer();

function generateInstrumentData(instrument, planet, data) {
    switch(instrument) {
        case 'camera':
            return `
                <div class="camera-view">
                    <img src="/assets/textures/${planet}.jpg" alt="${planet} surface" 
                        class="planet-image" onerror="this.src='/assets/placeholder.jpg'">
                    <div class="camera-controls">
                        <button onclick="zoomInstrument('in')">Zoom In</button>
                        <button onclick="zoomInstrument('out')">Zoom Out</button>
                    </div>
                </div>
            `;
        case 'spectrometer':
            return `
                <div class="spectrometer-data">
                    <h4>Atmospheric Composition</h4>
                    <p>${data.atmosphere}</p>
                    <div id="spectrometer-canvas" class="visualization-canvas"></div>
                </div>
            `;
        case 'radar':
            return `
                <div class="radar-data">
                    <h4>Surface Features</h4>
                    <div id="radar-canvas" class="visualization-canvas"></div>
                    <ul class="features-list">
                        ${data.surfaceFeatures.map(feature => 
                            `<li>${feature}</li>`
                        ).join('')}
                    </ul>
                </div>
            `;
    }
}

function initializeInstrumentVisuals(planet, instruments) {
    if (instruments.includes('spectrometer')) {
        instrumentVisualizer.initializeCanvas('spectrometer-canvas');
        instrumentVisualizer.drawSpectrometer(PLANET_DATA[planet].atmosphere);
    }
    
    if (instruments.includes('radar')) {
        instrumentVisualizer.initializeCanvas('radar-canvas');
        instrumentVisualizer.drawRadarMap(PLANET_DATA[planet].surfaceFeatures);
    }
}

function zoomInstrument(direction) {
    const view = document.querySelector('.camera-view');
    const currentZoom = parseInt(view.dataset.zoom || 100);
    const newZoom = direction === 'in' ? currentZoom + 10 : currentZoom - 10;
    view.dataset.zoom = Math.min(Math.max(newZoom, 50), 200);
    view.style.transform = `scale(${view.dataset.zoom / 100})`;
}

function createStatusElement() {
    const statusDiv = document.createElement('div');
    statusDiv.id = 'mission-status';
    document.body.appendChild(statusDiv);
    return statusDiv;
}

function startMission() {
    gameManager.gameState.missionActive = true;
    gameManager.gameState.resources = {
        fuel: 100,
        power: 100,
        dataCollected: 0
    };
    animate();
}

function initializeControls() {
    const pauseBtn = document.getElementById('pause-btn');
    const speedControl = document.getElementById('simulation-speed');
    const speedValue = document.getElementById('speed-value');

    pauseBtn.addEventListener('click', () => {
        gameState.missionActive = !gameState.missionActive;
        pauseBtn.textContent = gameState.missionActive ? 'Pause' : 'Resume';
        if (gameState.missionActive) {
            animate();
        }
    });

    speedControl.addEventListener('input', (e) => {
        gameState.simulationSpeed = parseInt(e.target.value);
        speedValue.textContent = `${gameState.simulationSpeed}x`;
    });
}

function updateUI() {
    const statusDiv = document.getElementById('mission-status');
    if (!statusDiv) return;

    const mission = gameState.currentMission;
    statusDiv.innerHTML = `
        <h3>Mission Status</h3>
        <p>Target: ${mission.target}</p>
        <p>Instruments: ${mission.instruments.join(', ')}</p>
        <p>Fuel: ${gameState.resources.fuel}%</p>
        <p>Power: ${gameState.resources.power}%</p>
        <p>Elapsed Time: ${Math.floor(mission.elapsedTime)} days</p>
    `;
}