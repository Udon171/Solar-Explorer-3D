// script.js
// Import modular classes
import { GameManager } from './gameManager.js';
import { OrbitalMechanics } from './orbitalMechanics.js';
import { InstrumentView } from './instrumentView.js';
import { MissionManager } from './missionManager.js'; // Will fix typo soon
import { fetchEphemeris, HORIZONS_BODY_IDS } from './data/horizonsApi.js';
import { PLANET_DATA } from './data/planetData.js';
import { INSTRUMENT_CONFIG } from './data/instrumentConfig.js';
import { initOrbitronica } from './orbitronica-init.js';
import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.152.2/examples/jsm/loaders/GLTFLoader.js';

let renderer, scene, camera, currentModel;
let missionLaunched = false;
let selectedSatellite = 'AcrimSAT';
let selectedPlanet = 'Earth';

// Initialize core modules
const gameManager = new GameManager();
const orbitalMechanics = new OrbitalMechanics();
const instrumentView = new InstrumentView();
const missionManager = new MissionManager();

// Initialize Orbitronica/Three.js solar system scene
window.addEventListener('DOMContentLoaded', () => {
    initOrbitronica('simulation');
});

// Add Sun and planets
viz.createStars();
viz.createObject('sun', Spacekit.SpaceObjectPresets.SUN);
viz.createObject('earth', Spacekit.SpaceObjectPresets.EARTH);
viz.createObject('mars', Spacekit.SpaceObjectPresets.MARS);
// Add more planets as needed

// Mission planning form
const missionForm = document.getElementById('mission-form');
if (missionForm) {
    missionForm.addEventListener('submit', (e) => {
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
        const transfer = orbitalMechanics.calculateHohmannTransfer('earth', planet);
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

        if (instruments.length > 0) {
            instrumentView.activate(instruments[0], planet);
        }

        // After mission is created and started:
        saveMissionProgress();
    });
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

// Add new function for updating satellite position
function updateSatellitePosition() {
    const mission = gameState.currentMission;
    if (!mission || !gameState.satellite) return;

    const elapsedTime = (Date.now() - gameState.transferStartTime) / 1000;
    const transferProgress = elapsedTime / (mission.transfer.transferTime * 86400);
    
    // Calculate mean anomaly based on progress
    const meanAnomaly = transferProgress * 2 * Math.PI;
    
    // Get position from orbital mechanics
    const pos = orbitalMechanics.getOrbitalPosition(
        mission.transfer.semiMajorAxis,
        mission.transfer.deltaV1 / 30,
        meanAnomaly
    );

    // Update satellite position
    gameState.satellite.setPosition(pos);
}

function visualizeTrajectory(transfer, startPlanet, targetPlanet) {
    const points = calculateTrajectoryPoints(transfer);
    
    // Create trajectory line
    const material = new THREE.LineDashedMaterial({
        color: 0x44ff44,
        linewidth: 1,
        scale: 1,
        dashSize: 3,
        gapSize: 1,
    });

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    
    viz.scene.add(line);
    return line;
}

function calculateTrajectoryPoints(transfer) {
    const points = [];
    const steps = 100;
    
    for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        const meanAnomaly = progress * 2 * Math.PI;
        
        const pos = orbitalMechanics.getOrbitalPosition({
            semiMajorAxis: transfer.semiMajorAxis,
            eccentricity: transfer.eccentricity,
            meanAnomaly: meanAnomaly
        }, 0);
        
        points.push(new THREE.Vector3(pos.x, pos.y, pos.z));
    }
    
    return points;
}

function updateTrajectoryVisualization(trajectory, progress) {
    const material = trajectory.material;
    material.dashSize = 3 * (1 - progress);
    material.gapSize = 1 + 2 * progress;
    material.needsUpdate = true;
    
    // Add particle effects at satellite position
    if (progress > 0) {
        addExhaustParticles(gameState.satellite.getPosition());
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

class InstrumentVisualizer {
    initializeCanvas(id) {
        // Stub: No-op
    }
    drawSpectrometer(atmosphere) {
        // Stub: No-op
    }
    drawRadarMap(surfaceFeatures) {
        // Stub: No-op
    }
}

const instrumentVisualizer = new InstrumentVisualizer();

// Update the generateInstrumentData function
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
        case 'gravitometer':
            return `
                <div class="gravitometer-data">
                    <h4>Gravity Analysis</h4>
                    <p>Base Gravity: ${data.gravity}</p>
                    <div id="gravitometer-canvas" class="visualization-canvas"></div>
                    <div class="gravity-legend">
                        <span class="low">Low</span>
                        <div class="gradient"></div>
                        <span class="high">High</span>
                    </div>
                </div>
            `;
        case 'multiSpectral':
            return `
                <div class="multispectral-data">
                    <h4>Multi-Spectral Analysis</h4>
                    <div id="multispectral-canvas" class="visualization-canvas"></div>
                    <div class="band-controls">
                        <button onclick="switchSpectralBand('visible')">Visible</button>
                        <button onclick="switchSpectralBand('infrared')">Infrared</button>
                        <button onclick="switchSpectralBand('ultraviolet')">UV</button>
                        <button onclick="switchSpectralBand('thermal')">Thermal</button>
                    </div>
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

function animate() {
    requestAnimationFrame(animate);
    viz.update();

    if (gameState.missionActive) {
        updateSatellitePosition();
        gameManager.updateGameState();
        updateMissionStatus();
    }
}

// --- Loading Screen Implementation ---
function createLoadingScreen() {
    if (document.getElementById('loading-screen')) return;
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loading-screen';
    loadingScreen.innerHTML = `
        <div id="loading-logo">Solar System Odyssey</div>
        <div id="loading-message">Loading simulation, please wait...</div>
        <div id="loading-bar-container">
            <div id="loading-bar"></div>
        </div>
        <div id="loading-notifications"></div>
    `;
    loadingScreen.style.position = 'fixed';
    loadingScreen.style.top = 0;
    loadingScreen.style.left = 0;
    loadingScreen.style.width = '100vw';
    loadingScreen.style.height = '100vh';
    loadingScreen.style.background = 'linear-gradient(135deg, #b2fefa 0%, #0ed2f7 100%)';
    loadingScreen.style.display = 'flex';
    loadingScreen.style.flexDirection = 'column';
    loadingScreen.style.justifyContent = 'center';
    loadingScreen.style.alignItems = 'center';
    loadingScreen.style.zIndex = 9999;
    loadingScreen.style.transition = 'opacity 0.6s';
    document.body.appendChild(loadingScreen);
}

function setLoadingProgress(percent) {
    const bar = document.getElementById('loading-bar');
    if (bar) bar.style.width = `${percent}%`;
}

function setLoadingMessage(msg) {
    const message = document.getElementById('loading-message');
    if (message) message.textContent = msg;
}

function addLoadingNotification(text) {
    const container = document.getElementById('loading-notifications');
    if (container) {
        const note = document.createElement('div');
        note.className = 'loading-notification';
        note.textContent = text;
        container.appendChild(note);
    }
    console.warn('[Loading Notice]', text);
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => loadingScreen.remove(), 600);
    }
}

// Show loading screen on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    createLoadingScreen();
    setLoadingProgress(10);
    setLoadingMessage('Initializing engine...');
    setTimeout(() => {
        setLoadingProgress(40);
        setLoadingMessage('Loading assets...');
        setTimeout(() => {
            setLoadingProgress(70);
            setLoadingMessage('Setting up simulation...');
            setTimeout(() => {
                setLoadingProgress(100);
                setLoadingMessage('Ready!');
                setTimeout(hideLoadingScreen, 600);
            }, 600);
        }, 600);
    }, 600);
});
// --- End Loading Screen Implementation ---

// Add browser compatibility and asset loading checks to loading screen
function checkBrowserIssues() {
    // Check for WebGL support
    const canvas = document.createElement('canvas');
    const webgl = !!(window.WebGLRenderingContext && (
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    if (!webgl) {
        addLoadingNotification('WebGL is not supported in your browser. The simulation may not run.');
    }
    // Check for localStorage support
    try {
        localStorage.setItem('__test__', '1');
        localStorage.removeItem('__test__');
    } catch (e) {
        addLoadingNotification('localStorage is not available. Progress will not be saved.');
    }
    // Check for Spacekit.js loaded
    if (!window.Spacekit) {
        addLoadingNotification('Spacekit.js not loaded! Please check your CDN or network connection.');
    }
    // Check for major assets (e.g., placeholder image)
    const img = new window.Image();
    img.onerror = () => addLoadingNotification('Critical asset missing: /assets/textures/placeholder.jpg');
    img.src = '/assets/textures/placeholder.jpg';
}

window.addEventListener('DOMContentLoaded', () => {
    // ...existing code...
    checkBrowserIssues();
});

// Example: Fetch and use real planetary positions at mission planning
async function getPlanetEphemeris(planet, startDate, stopDate) {
    try {
        const bodyId = HORIZONS_BODY_IDS[planet];
        if (!bodyId) throw new Error('Unknown planet for Horizons API');
        const data = await fetchEphemeris(bodyId, startDate, stopDate, '1d');
        // Use data.result or data['vectors'] as needed
        return data;
    } catch (e) {
        addLoadingNotification(`Horizons API error: ${e.message}`);
        return null;
    }
}

// Save mission progress to localStorage
function saveMissionProgress() {
    try {
        localStorage.setItem('missionProgress', JSON.stringify(gameManager.gameState));
    } catch (e) {
        addLoadingNotification('Failed to save mission progress.');
    }
}

// Load mission progress from localStorage
function loadMissionProgress() {
    const saved = localStorage.getItem('missionProgress');
    if (saved) {
        try {
            const state = JSON.parse(saved);
            Object.assign(gameManager.gameState, state);
            // Optionally, re-initialize satellite and UI
            addLoadingNotification('Mission progress loaded.');
        } catch (e) {
            addLoadingNotification('Failed to load mission progress.');
        }
    }
}

// Save after major actions
// Example: after mission planning, simulation step, or milestone
// saveMissionProgress();

// Load on game start
window.addEventListener('DOMContentLoaded', loadMissionProgress);

// Add a manual save/load option to the UI (optional)
function addSaveLoadButtons() {
    const controls = document.querySelector('.simulation-controls');
    if (!controls) return;
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save Progress';
    saveBtn.onclick = saveMissionProgress;
    const loadBtn = document.createElement('button');
    loadBtn.textContent = 'Load Progress';
    loadBtn.onclick = loadMissionProgress;
    controls.appendChild(saveBtn);
    controls.appendChild(loadBtn);
}
window.addEventListener('DOMContentLoaded', addSaveLoadButtons);

// Add glassmorphism styles for UI polish
// This should be moved to style.css, but here is a quick style injection for demo
const glassStyle = document.createElement('style');
glassStyle.textContent = `
.instrument-panel, .mission-control, .simulation-controls, .speed-control {
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 32px 0 rgba(31,38,135,0.37);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    color: #fff;
}
body {
    background: linear-gradient(135deg, #b2fefa 0%, #0ed2f7 100%);
}
button, input, select {
    background: rgba(255,255,255,0.2);
    border: none;
    border-radius: 8px;
    color: #fff;
    padding: 0.5em 1em;
    margin: 0.2em;
    font-size: 1em;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: background 0.2s;
}
button:hover, input:focus, select:focus {
    background: rgba(255,255,255,0.35);
}
`;
document.head.appendChild(glassStyle);

// Tab switching logic for new UI
window.addEventListener('DOMContentLoaded', () => {
    const satTab = document.getElementById('satellite-tab');
    const missionTab = document.getElementById('mission-tab');
    const satOptions = document.getElementById('sat-options');
    const missionOptions = document.getElementById('mission-options');
    if (satTab && missionTab && satOptions && missionOptions) {
        satTab.onclick = () => {
            satTab.classList.add('active');
            missionTab.classList.remove('active');
            satOptions.style.display = '';
            missionOptions.style.display = 'none';
        };
        missionTab.onclick = () => {
            missionTab.classList.add('active');
            satTab.classList.remove('active');
            missionOptions.style.display = '';
            satOptions.style.display = 'none';
        };
        // Default: show satellite options
        satOptions.style.display = '';
        missionOptions.style.display = 'none';
    }

    // Add event listeners for new controls (placeholders)
    document.getElementById('main-menu-btn')?.addEventListener('click', () => alert('Main Menu (not implemented)'));
    document.getElementById('save-btn')?.addEventListener('click', saveMissionProgress);
    document.getElementById('load-btn')?.addEventListener('click', loadMissionProgress);
    document.getElementById('settings-btn')?.addEventListener('click', () => alert('Settings (not implemented)'));
    document.getElementById('profile-btn')?.addEventListener('click', () => alert('Profile (not implemented)'));
    document.getElementById('switch-view-btn')?.addEventListener('click', () => alert('Switch Sat/Mission (not implemented)'));
    document.getElementById('viewport-btn')?.addEventListener('click', () => alert('3D Viewport/Swap (not implemented)'));
    document.getElementById('pause-btn')?.addEventListener('click', () => alert('Pause/Resume (not implemented)'));
    document.getElementById('camera-up-btn')?.addEventListener('click', () => alert('Camera Up (not implemented)'));
    document.getElementById('camera-down-btn')?.addEventListener('click', () => alert('Camera Down (not implemented)'));
    document.getElementById('activate-instrument-btn')?.addEventListener('click', () => alert('Activate Instrument (not implemented)'));
});

// Burger menu and S/M switch logic
window.addEventListener('DOMContentLoaded', () => {
    const burger = document.getElementById('main-menu-btn');
    let menuOverlay = null;
    if (burger) {
        burger.onclick = (e) => {
            e.stopPropagation();
            if (document.querySelector('.menu-overlay')) return;
            menuOverlay = document.createElement('div');
            menuOverlay.className = 'menu-overlay';
            menuOverlay.innerHTML = `
                <div class='menu-modal'>
                    <div class='menu-tabs'>
                        <button class='menu-tab active' data-tab='exit'>Exit/Save</button>
                        <button class='menu-tab' data-tab='load'>Load</button>
                        <button class='menu-tab' data-tab='settings'>Settings</button>
                        <button class='menu-tab' data-tab='profile'>Profile</button>
                        <button class='menu-tab' data-tab='progress'>Progress</button>
                    </div>
                    <div class='menu-tab-content' id='menu-tab-exit'>
                        <h2>Exit/Save</h2>
                        <button onclick='window.location.reload()'>Exit & Save</button>
                    </div>
                    <div class='menu-tab-content hidden' id='menu-tab-load'>
                        <h2>Load</h2>
                        <button onclick='window.loadMissionProgress && window.loadMissionProgress()'>Load Progress</button>
                    </div>
                    <div class='menu-tab-content hidden' id='menu-tab-settings'>
                        <h2>Settings</h2>
                        <p>Settings coming soon.</p>
                    </div>
                    <div class='menu-tab-content hidden' id='menu-tab-profile'>
                        <h2>Profile</h2>
                        <p>Profile coming soon.</p>
                    </div>
                    <div class='menu-tab-content hidden' id='menu-tab-progress'>
                        <h2>Progress</h2>
                        <p>Progress coming soon.</p>
                    </div>
                    <button class='menu-close-btn' id='menu-close-btn'>Close</button>
                </div>
            `;
            document.body.appendChild(menuOverlay);
            // Tab switching logic
            menuOverlay.querySelectorAll('.menu-tab').forEach(tab => {
                tab.onclick = function(ev) {
                    ev.stopPropagation();
                    menuOverlay.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    const tabName = this.getAttribute('data-tab');
                    menuOverlay.querySelectorAll('.menu-tab-content').forEach(c => c.classList.add('hidden'));
                    const content = menuOverlay.querySelector(`#menu-tab-${tabName}`);
                    if (content) content.classList.remove('hidden');
                };
            });
            // Close button
            menuOverlay.querySelector('#menu-close-btn').onclick = function(ev) {
                ev.stopPropagation();
                menuOverlay.remove();
            };
            // Click outside modal closes menu
            menuOverlay.onclick = function(ev) {
                if (ev.target === menuOverlay) menuOverlay.remove();
            };
        };
    }
    // S/M switch logic
    const smToggle = document.getElementById('sm-toggle');
    const title = document.querySelector('.top-bar-title');
    const satellitePage = document.getElementById('satellite-page');
    const missionPage = document.getElementById('mission-page');
    // Create loading overlay
    let loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loading-overlay';
    loadingOverlay.style.position = 'fixed';
    loadingOverlay.style.top = 0;
    loadingOverlay.style.left = 0;
    loadingOverlay.style.width = '100vw';
    loadingOverlay.style.height = '100vh';
    loadingOverlay.style.background = 'rgba(20,22,24,0.85)';
    loadingOverlay.style.display = 'flex';
    loadingOverlay.style.alignItems = 'center';
    loadingOverlay.style.justifyContent = 'center';
    loadingOverlay.style.zIndex = 10000;
    loadingOverlay.style.color = '#fff';
    loadingOverlay.style.fontSize = '2em';
    loadingOverlay.innerHTML = '<span>Loading...</span>';

    function showLoading() {
      document.body.appendChild(loadingOverlay);
    }
    function hideLoading() {
      if (loadingOverlay.parentNode) loadingOverlay.parentNode.removeChild(loadingOverlay);
    }

    if (smToggle && satellitePage && missionPage) {
        smToggle.addEventListener('change', function() {
            showLoading();
            setTimeout(() => {
                if (smToggle.checked) {
                    satellitePage.classList.remove('hidden');
                    missionPage.classList.add('hidden');
                } else {
                    satellitePage.classList.add('hidden');
                    missionPage.classList.remove('hidden');
                }
                hideLoading();
            }, 1000); // 1 second loading
        });
        // Initial state
        if (smToggle.checked) {
            satellitePage.classList.remove('hidden');
            missionPage.classList.add('hidden');
        } else {
            satellitePage.classList.add('hidden');
            missionPage.classList.remove('hidden');
        }
    }
});

// Mission and instrument logic integration for Orbitronica
// Listen for planet selection and show mission/instrument UI
window.addEventListener('planet-selected', async (e) => {
    const planet = e.detail.planet;
    // Fetch educational text
    let txtPath = `resources/${planet}/${planet}-txt.txt`;
    let text = '';
    try {
        const resp = await fetch(txtPath);
        if (!resp.ok) throw new Error('Not found');
        text = await resp.text();
    } catch {
        text = 'No educational info found for this planet.';
    }
    showPlanetInfoPanel(planet, text);
    showMissionInstrumentPanel(planet);
});

function showMissionInstrumentPanel(planet) {
    let panel = document.getElementById('mission-instrument-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'mission-instrument-panel';
        panel.style.position = 'fixed';
        panel.style.bottom = '40px';
        panel.style.right = '40px';
        panel.style.maxWidth = '400px';
        panel.style.background = 'rgba(0,0,32,0.95)';
        panel.style.color = '#fff';
        panel.style.padding = '1.5em';
        panel.style.borderRadius = '16px';
        panel.style.zIndex = 10001;
        panel.style.overflowY = 'auto';
        panel.style.maxHeight = '60vh';
        panel.style.boxShadow = '0 8px 32px 0 rgba(31,38,135,0.37)';
        document.body.appendChild(panel);
    }
    panel.innerHTML = `
        <h3 style='margin-top:0;text-transform:capitalize;'>Mission to ${planet}</h3>
        <form id='mission-plan-form'>
            <label>Choose Instruments:</label><br>
            <label><input type='checkbox' name='instrument' value='camera'> Camera</label><br>
            <label><input type='checkbox' name='instrument' value='spectrometer'> Spectrometer</label><br>
            <label><input type='checkbox' name='instrument' value='radar'> Radar</label><br>
            <label><input type='checkbox' name='instrument' value='gravitometer'> Gravitometer</label><br>
            <label><input type='checkbox' name='instrument' value='multiSpectral'> Multi-Spectral Imager</label><br>
            <label>Launch Date: <input type='date' name='launchDate' required></label><br>
            <button type='submit' style='margin-top:1em;'>Plan Mission</button>
        </form>
        <div id='mission-feedback'></div>
        <button style='margin-top:1em;' onclick='this.parentElement.remove()'>Close</button>
    `;
    document.getElementById('mission-plan-form').onsubmit = function(ev) {
        ev.preventDefault();
        const form = ev.target;
        const instruments = Array.from(form.instrument).filter(i => i.checked).map(i => i.value);
        const launchDate = form.launchDate.value;
        if (instruments.length === 0) {
            document.getElementById('mission-feedback').textContent = 'Select at least one instrument.';
            return;
        }
        // Save mission state (simulate mission start)
        window.currentMission = {
            planet,
            instruments,
            launchDate,
            started: true,
            progress: 0,
            completed: false
        };
        document.getElementById('mission-feedback').textContent = `Mission to ${planet} planned with: ${instruments.join(', ')}. Launch: ${launchDate}`;
        // Show instrument panel for the mission
        showInstrumentPanel(planet, instruments);
    };
}

// Instrument panel logic
function showInstrumentPanel(planet, instruments) {
    let panel = document.getElementById('instrument-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'instrument-panel';
        panel.style.position = 'fixed';
        panel.style.left = '40px';
        panel.style.bottom = '40px';
        panel.style.maxWidth = '400px';
        panel.style.background = 'rgba(0,0,32,0.95)';
        panel.style.color = '#fff';
        panel.style.padding = '1.5em';
        panel.style.borderRadius = '16px';
        panel.style.zIndex = 10002;
        panel.style.overflowY = 'auto';
        panel.style.maxHeight = '60vh';
        panel.style.boxShadow = '0 8px 32px 0 rgba(31,38,135,0.37)';
        document.body.appendChild(panel);
    }
    let html = `<h3 style='margin-top:0;text-transform:capitalize;'>Instruments on ${planet}</h3>`;
    instruments.forEach(inst => {
        html += `<button class='instrument-btn' data-inst='${inst}'>${inst.charAt(0).toUpperCase()+inst.slice(1)}</button> `;
    });
    html += `<div id='instrument-output' style='margin-top:1em;'></div>`;
    html += `<button style='margin-top:1em;' onclick='this.parentElement.remove()'>Close</button>`;
    panel.innerHTML = html;
    // Add interactivity for instrument buttons
    panel.querySelectorAll('.instrument-btn').forEach(btn => {
        btn.onclick = function() {
            const inst = this.getAttribute('data-inst');
            showInstrumentOutput(planet, inst);
        };
    });
}

function showInstrumentOutput(planet, inst) {
    const output = document.getElementById('instrument-output');
    if (!output) return;
    // Demo: show a fact or simulated data
    if (inst === 'camera') {
        output.innerHTML = `<img src='assets/textures/${planet}/${planet}-1.jpg' style='width:100%;border-radius:8px;' onerror="this.style.display='none'">`;
    } else if (inst === 'spectrometer') {
        output.innerHTML = `<div style='background:#222;padding:1em;border-radius:8px;'>Spectrometer reading: <br>Atmospheric composition data for ${planet}.</div>`;
    } else if (inst === 'radar') {
        output.innerHTML = `<div style='background:#222;padding:1em;border-radius:8px;'>Radar scan: <br>Surface topology visualization for ${planet}.</div>`;
    } else if (inst === 'gravitometer') {
        output.innerHTML = `<div style='background:#222;padding:1em;border-radius:8px;'>Gravitometer: <br>Gravity field data for ${planet}.</div>`;
    } else if (inst === 'multiSpectral') {
        output.innerHTML = `<div style='background:#222;padding:1em;border-radius:8px;'>Multi-Spectral Imager: <br>Band selection and analysis for ${planet}.</div>`;
    } else {
        output.textContent = 'Instrument not implemented.';
    }
}

function initThreeJS() {
  const container = document.getElementById('simulation');
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0x181a1b, 1);
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 6);

  const light = new THREE.DirectionalLight(0xffffff, 1.2);
  light.position.set(5, 10, 7);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x888888, 1.1));

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  if (currentModel) {
    currentModel.rotation.y += 0.005;
  }
  renderer.render(scene, camera);
}

function loadSatelliteModel(name) {
  selectedSatellite = name;
  const loader = new GLTFLoader();
  const path = `assets/3D Assets/Satellites/${name}/${name}.glb`;
  // Remove previous model
  if (currentModel) {
    scene.remove(currentModel);
    currentModel.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
    currentModel = null;
  }
  loader.load(path, (gltf) => {
    currentModel = gltf.scene;
    // Center and scale model
    let box = new THREE.Box3().setFromObject(currentModel);
    let size = new THREE.Vector3();
    box.getSize(size);
    let maxDim = Math.max(size.x, size.y, size.z);
    let scale = 2.5 / maxDim;
    currentModel.scale.set(scale, scale, scale);
    box = new THREE.Box3().setFromObject(currentModel);
    let center = new THREE.Vector3();
    box.getCenter(center);
    currentModel.position.sub(center); // Center at origin
    scene.add(currentModel);
    // Remove any previous error overlay
    const errDiv = document.getElementById('satellite-model-error');
    if (errDiv) errDiv.remove();
  }, undefined, (err) => {
    console.error('Failed to load model:', path, err);
    // Show error overlay in simulation view
    let errDiv = document.getElementById('satellite-model-error');
    if (!errDiv) {
      errDiv = document.createElement('div');
      errDiv.id = 'satellite-model-error';
      errDiv.style.position = 'absolute';
      errDiv.style.top = '0';
      errDiv.style.left = '0';
      errDiv.style.width = '100%';
      errDiv.style.height = '100%';
      errDiv.style.background = 'rgba(30,30,40,0.92)';
      errDiv.style.display = 'flex';
      errDiv.style.flexDirection = 'column';
      errDiv.style.alignItems = 'center';
      errDiv.style.justifyContent = 'center';
      errDiv.style.zIndex = 1000;
      errDiv.style.color = '#ff6666';
      errDiv.style.fontSize = '1.2em';
      errDiv.innerHTML = `<b>Failed to load satellite model.</b><br>Path: <code>${path}</code><br>${err.message || err}`;
      const container = document.getElementById('simulation');
      if (container) container.appendChild(errDiv);
    }
  });
}

// --- Mission Scene ---
function renderMissionScene(prefs) {
  // Render satellite floating with Earth in mission view
  const container = document.querySelector('#mission-page .mission-svg-container');
  if (!container) return;
  container.innerHTML = '<div id="mission-canvas" style="width:100%;height:600px;position:relative;"></div>';
  const missionDiv = document.getElementById('mission-canvas');
  // Setup Three.js scene
  const renderer2 = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer2.setSize(missionDiv.clientWidth, 600);
  renderer2.setClearColor(0x000000, 1);
  missionDiv.appendChild(renderer2.domElement);
  const scene2 = new THREE.Scene();
  const camera2 = new THREE.PerspectiveCamera(45, missionDiv.clientWidth / 600, 0.1, 1000);
  camera2.position.set(0, 0, 8);
  // Earth sphere
  const texLoader = new THREE.TextureLoader();
  const earthTex = texLoader.load('assets/textures/earth/earth.jpg');
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(2.5, 64, 64),
    new THREE.MeshPhongMaterial({ map: earthTex })
  );
  earth.position.set(-2.5, 0, 0);
  scene2.add(earth);
  // Satellite
  const loader2 = new GLTFLoader();
  const satPath = `assets/3D Assets/Satellites/${prefs.satellite}/${prefs.satellite}.glb`;
  loader2.load(satPath, (gltf) => {
    const sat = gltf.scene;
    // Center and scale
    let box = new THREE.Box3().setFromObject(sat);
    let size = new THREE.Vector3();
    box.getSize(size);
    let maxDim = Math.max(size.x, size.y, size.z);
    let scale = 1.5 / maxDim;
    sat.scale.set(scale, scale, scale);
    box = new THREE.Box3().setFromObject(sat);
    let center = new THREE.Vector3();
    box.getCenter(center);
    sat.position.sub(center);
    sat.position.x = 2.5;
    scene2.add(sat);
    // Remove any previous error overlay
    const errDiv = document.getElementById('mission-model-error');
    if (errDiv) errDiv.remove();
    // Animate
    function animateMission() {
      requestAnimationFrame(animateMission);
      sat.rotation.y += 0.01;
      earth.rotation.y += 0.002;
      renderer2.render(scene2, camera2);
    }
    animateMission();
  }, undefined, (err) => {
    console.error('Failed to load mission model:', satPath, err);
    // Show error overlay in mission view
    let errDiv = document.getElementById('mission-model-error');
    if (!errDiv) {
      errDiv = document.createElement('div');
      errDiv.id = 'mission-model-error';
      errDiv.style.position = 'absolute';
      errDiv.style.top = '0';
      errDiv.style.left = '0';
      errDiv.style.width = '100%';
      errDiv.style.height = '100%';
      errDiv.style.background = 'rgba(30,30,40,0.92)';
      errDiv.style.display = 'flex';
      errDiv.style.flexDirection = 'column';
      errDiv.style.alignItems = 'center';
      errDiv.style.justifyContent = 'center';
      errDiv.style.zIndex = 1000;
      errDiv.style.color = '#ff6666';
      errDiv.style.fontSize = '1.2em';
      errDiv.innerHTML = `<b>Failed to load satellite model.</b><br>Path: <code>${satPath}</code><br>${err.message || err}`;
      missionDiv.appendChild(errDiv);
    }
  });
}

// --- Custom Calendar Logic ---
function renderCustomCalendar(selectedDate) {
  const calendarDiv = document.getElementById('custom-calendar');
  if (!calendarDiv) return;
  // State
  let today = new Date();
  let year = selectedDate ? selectedDate.getFullYear() : today.getFullYear();
  let month = selectedDate ? selectedDate.getMonth() : today.getMonth();
  let selDay = selectedDate ? selectedDate.getDate() : null;

  function updateCalendar(y, m, sel) {
    calendarDiv.innerHTML = '';
    // Header
    const header = document.createElement('div');
    header.className = 'calendar-header';
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '<';
    const nextBtn = document.createElement('button');
    nextBtn.textContent = '>';
    const monthYear = document.createElement('span');
    monthYear.textContent = `${today.toLocaleString('default', { month: 'long' })} ${y}`;
    header.appendChild(prevBtn);
    header.appendChild(monthYear);
    header.appendChild(nextBtn);
    calendarDiv.appendChild(header);
    // Weekdays
    const weekdays = ['S','M','T','W','T','F','S'];
    const grid = document.createElement('div');
    grid.className = 'calendar-grid';
    weekdays.forEach(d => {
      const wd = document.createElement('div');
      wd.className = 'calendar-weekday';
      wd.textContent = d;
      grid.appendChild(wd);
    });
    // Days
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m+1, 0).getDate();
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'calendar-day disabled';
      grid.appendChild(empty);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const day = document.createElement('div');
      day.className = 'calendar-day';
      day.textContent = d;
      if (sel === d) day.classList.add('selected');
      if (y === today.getFullYear() && m === today.getMonth() && d === today.getDate()) day.classList.add('today');
      day.onclick = () => {
        updateCalendar(y, m, d);
        // Set selected date and show launch button
        const launchBtnContainer = document.getElementById('launch-btn-container');
        if (launchBtnContainer) {
          launchBtnContainer.innerHTML = '<button class="launch-btn" id="launch-btn">Launch</button>';
          document.getElementById('launch-btn').onclick = () => {
            window.__missionPrefs = window.__missionPrefs || {};
            window.__missionPrefs.date = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            // Show loading overlay and launch as before
            let loadingOverlay = document.getElementById('loading-overlay');
            if (!loadingOverlay) {
              loadingOverlay = document.createElement('div');
              loadingOverlay.id = 'loading-overlay';
              loadingOverlay.style.position = 'fixed';
              loadingOverlay.style.top = 0;
              loadingOverlay.style.left = 0;
              loadingOverlay.style.width = '100vw';
              loadingOverlay.style.height = '100vh';
              loadingOverlay.style.background = 'rgba(20,22,24,0.85)';
              loadingOverlay.style.display = 'flex';
              loadingOverlay.style.alignItems = 'center';
              loadingOverlay.style.justifyContent = 'center';
              loadingOverlay.style.zIndex = 10000;
              loadingOverlay.style.color = '#fff';
              loadingOverlay.style.fontSize = '2em';
              loadingOverlay.innerHTML = '<span>Preparing Mission...</span>';
            }
            document.body.appendChild(loadingOverlay);
            setTimeout(() => {
              document.getElementById('satellite-page').classList.add('hidden');
              document.getElementById('mission-page').classList.remove('hidden');
              const smToggle = document.getElementById('sm-toggle');
              if (smToggle) smToggle.disabled = false;
              missionLaunched = true;
              if (loadingOverlay.parentNode) loadingOverlay.parentNode.removeChild(loadingOverlay);
              renderMissionScene(window.__missionPrefs);
            }, 1200);
          };
        }
      };
      grid.appendChild(day);
    }
    calendarDiv.appendChild(grid);
    // Month navigation
    prevBtn.onclick = () => {
      let newMonth = m - 1;
      let newYear = y;
      if (newMonth < 0) { newMonth = 11; newYear--; }
      updateCalendar(newYear, newMonth, null);
      const launchBtnContainer = document.getElementById('launch-btn-container');
      if (launchBtnContainer) launchBtnContainer.innerHTML = '';
    };
    nextBtn.onclick = () => {
      let newMonth = m + 1;
      let newYear = y;
      if (newMonth > 11) { newMonth = 0; newYear++; }
      updateCalendar(newYear, newMonth, null);
      const launchBtnContainer = document.getElementById('launch-btn-container');
      if (launchBtnContainer) launchBtnContainer.innerHTML = '';
    };
  }
  updateCalendar(year, month, selDay);
}

window.addEventListener('DOMContentLoaded', () => {
  // ...existing code...
  // Custom calendar
  renderCustomCalendar();
  // ...existing code...
});