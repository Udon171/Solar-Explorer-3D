// orbitronica-init.js
// Minimal Orbitronica/Three.js solar system scene setup for integration

import * as THREE from 'three';

const PLANETS = [
    {
    name: 'Mercury',
    radius: 2.4, // scaled
    distance: 20, // scaled
    color: 0xb1b1b1,
    texture: 'assets/textures/mercury/mercury-from-messenger-pia15160-1920x640-1.webp',
    },
    {
    name: 'Venus',
    radius: 6,
    distance: 30,
    color: 0xeeddaa,
    texture: 'assets/textures/venus/venus-mariner-10-pia23791-fig2.jpg',
    },
    {
    name: 'Earth',
    radius: 6.4,
    distance: 40,
    color: 0x3399ff,
    texture: 'assets/textures/earth/ipcc_bluemarble_east_lrg.jpg',
    },
    {
    name: 'Mars',
    radius: 3.4,
    distance: 50,
    color: 0xff5533,
    texture: 'assets/textures/mars/mars-txt.txt', // fallback to color if not found
    },
    {
    name: 'Jupiter',
    radius: 14,
    distance: 70,
    color: 0xf4e2b6,
    texture: 'assets/textures/jupiter/jupiter-marble-pia22946-16x9-1.webp',
    },
    {
    name: 'Saturn',
    radius: 12,
    distance: 90,
    color: 0xf7e7b6,
    texture: 'assets/textures/saturn/saturn-farewell-pia21345.webp',
    },
    {
    name: 'Uranus',
    radius: 10,
    distance: 110,
    color: 0x99ffff,
    texture: 'assets/textures/uranus/uranus-pia18182-16x9-1.jpg',
    },
    {
    name: 'Neptune',
    radius: 10,
    distance: 130,
    color: 0x3366ff,
    texture: 'assets/textures/neptune/pia01492-neptune-full-disk-16x9-1.webp',
    },
];

// Add click/select handlers to planets to show educational content
export function initOrbitronica(containerId = 'simulation') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000010);

    // Camera
    const camera = new THREE.PerspectiveCamera(60, container.offsetWidth / container.offsetHeight, 0.1, 10000);
    camera.position.set(0, 50, 200);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);

    // Sun
    const sunGeometry = new THREE.SphereGeometry(12, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Planets
    const planetMeshes = [];
    PLANETS.forEach(planet => {
        let material;
        if (planet.texture) {
            const textureLoader = new THREE.TextureLoader();
            material = new THREE.MeshBasicMaterial({
                map: textureLoader.load(planet.texture, undefined, undefined, () => {
                    // fallback to color if texture fails
                    material.map = null;
                    material.color = new THREE.Color(planet.color);
                })
            });
        } else {
            material = new THREE.MeshBasicMaterial({ color: planet.color });
        }
        const geometry = new THREE.SphereGeometry(planet.radius, 32, 32);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(planet.distance, 0, 0);
        mesh.name = planet.name;
        mesh.userData = { planetName: planet.name.toLowerCase() };
        scene.add(mesh);
        planetMeshes.push(mesh);
    });

    // Animation loop (simple orbit)
    function animate() {
        requestAnimationFrame(animate);
        const t = Date.now() * 0.0001;
        planetMeshes.forEach((mesh, i) => {
            const d = PLANETS[i].distance;
            mesh.position.x = d * Math.cos(t * (1 + i * 0.1));
            mesh.position.z = d * Math.sin(t * (1 + i * 0.1));
        });
        renderer.render(scene, camera);
    }
    animate();

    // Raycaster for click detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    renderer.domElement.addEventListener('click', (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(planetMeshes);
        if (intersects.length > 0) {
            const planetName = intersects[0].object.userData.planetName;
            window.dispatchEvent(new CustomEvent('planet-selected', { detail: { planet: planetName } }));
        }
    });

    // Return objects for further extension
    return { scene, camera, renderer, sun, planetMeshes };
}
