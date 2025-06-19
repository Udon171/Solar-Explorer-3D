// planetData.js
// Static data for planets (for UI, fallback, and instrument panels)

export const PLANET_DATA = {
    mars: {
        name: 'Mars',
        atmosphere: '95.3% CO₂, 2.7% N₂, 1.6% Ar',
        surfaceFeatures: ['Olympus Mons', 'Valles Marineris', 'Hellas Planitia'],
        temperature: '-63°C (average)',
        gravity: '3.72 m/s²',
        texture: '/assets/textures/mars.jpg'
    },
    venus: {
        name: 'Venus',
        atmosphere: '96.5% CO₂, 3.5% N₂',
        surfaceFeatures: ['Maxwell Montes', 'Ishtar Terra', 'Aphrodite Terra'],
        temperature: '462°C (average)',
        gravity: '8.87 m/s²',
        texture: '/assets/textures/venus.jpg'
    },
    earth: {
        name: 'Earth',
        atmosphere: '78% N₂, 21% O₂, 1% Ar',
        surfaceFeatures: ['Himalayas', 'Grand Canyon', 'Great Barrier Reef'],
        temperature: '15°C (average)',
        gravity: '9.81 m/s²',
        texture: '/assets/textures/earth.jpg'
    },
    mercury: {
        name: 'Mercury',
        atmosphere: 'Trace (O₂, Na, H₂, He, K)',
        surfaceFeatures: ['Caloris Basin', 'Lobate Scarps'],
        temperature: '167°C (average)',
        gravity: '3.7 m/s²',
        texture: '/assets/textures/mercury.jpg'
    },
    jupiter: {
        name: 'Jupiter',
        atmosphere: '90% H₂, 10% He',
        surfaceFeatures: ['Great Red Spot', 'Cloud Bands'],
        temperature: '-145°C (average)',
        gravity: '24.79 m/s²',
        texture: '/assets/textures/jupiter.jpg'
    },
    saturn: {
        name: 'Saturn',
        atmosphere: '96% H₂, 3% He',
        surfaceFeatures: ['Hexagon Storm', 'Ring System'],
        temperature: '-178°C (average)',
        gravity: '10.44 m/s²',
        texture: '/assets/textures/saturn.jpg'
    },
    uranus: {
        name: 'Uranus',
        atmosphere: '83% H₂, 15% He, 2% CH₄',
        surfaceFeatures: ['Methane Clouds', 'Tilted Axis'],
        temperature: '-224°C (average)',
        gravity: '8.87 m/s²',
        texture: '/assets/textures/uranus.jpg'
    },
    neptune: {
        name: 'Neptune',
        atmosphere: '80% H₂, 19% He, 1% CH₄',
        surfaceFeatures: ['Great Dark Spot', 'Strong Winds'],
        temperature: '-214°C (average)',
        gravity: '11.15 m/s²',
        texture: '/assets/textures/neptune.jpg'
    },
    dwarf_planets: {
        name: 'Dwarf Planets',
        atmosphere: 'Varies',
        surfaceFeatures: ['Pluto: Sputnik Planitia', 'Eris: Icy Surface'],
        temperature: '-229°C (Pluto)',
        gravity: '0.62 m/s² (Pluto)',
        texture: '/assets/textures/dwarf_planets.jpg'
    },
    small_bodies: {
        name: 'Small Bodies',
        atmosphere: 'None',
        surfaceFeatures: ['Asteroids', 'Comets'],
        temperature: 'Varies',
        gravity: 'Very Low',
        texture: '/assets/textures/small_bodies.jpg'
    }
    // Add more planets as needed
};
