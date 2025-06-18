class VisualEffects {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
    }

    addExhaustParticles(position) {
        const particleCount = 50;
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.PointsMaterial({
            size: 0.01,
            color: 0x00ffff,
            transparent: true,
            blending: THREE.AdditiveBlending
        });

        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            const offset = i * 3;
            positions[offset] = position.x;
            positions[offset + 1] = position.y;
            positions[offset + 2] = position.z;

            velocities.push(new THREE.Vector3(
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.01
            ));
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particles = new THREE.Points(geometry, material);
        
        this.particles.push({
            mesh: particles,
            velocities: velocities,
            life: 1.0
        });

        this.scene.add(particles);
    }

    addPlaneChangeEffect(position) {
        const particleCount = 100;
        const ringGeometry = new THREE.BufferGeometry();
        const ringMaterial = new THREE.PointsMaterial({
            size: 0.005,
            color: 0xff00ff,
            transparent: true,
            blending: THREE.AdditiveBlending
        });

        const positions = new Float32Array(particleCount * 3);
        const radius = 0.05;

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const offset = i * 3;
            positions[offset] = position.x + Math.cos(angle) * radius;
            positions[offset + 1] = position.y + Math.sin(angle) * radius;
            positions[offset + 2] = position.z;
        }

        ringGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const ring = new THREE.Points(ringGeometry, ringMaterial);
        
        this.particles.push({
            mesh: ring,
            life: 2.0,
            type: 'planeChange'
        });

        this.scene.add(ring);
    }

    addGravityAssistEffect(position, planet) {
        // Create spiral effect around planet
        const spiralCount = 50;
        const spiralGeometry = new THREE.BufferGeometry();
        const spiralMaterial = new THREE.LineBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.5
        });

        const points = [];
        const radius = 0.1;
        const turns = 2;

        for (let i = 0; i <= spiralCount; i++) {
            const t = (i / spiralCount) * turns * Math.PI * 2;
            const r = radius * (1 - i / spiralCount);
            points.push(new THREE.Vector3(
                position.x + r * Math.cos(t),
                position.y + r * Math.sin(t),
                position.z
            ));
        }

        spiralGeometry.setFromPoints(points);
        const spiral = new THREE.Line(spiralGeometry, spiralMaterial);
        
        this.particles.push({
            mesh: spiral,
            life: 3.0,
            type: 'gravityAssist'
        });

        this.scene.add(spiral);
    }

    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.life -= deltaTime;

            if (particle.life <= 0) {
                this.scene.remove(particle.mesh);
                this.particles.splice(i, 1);
                continue;
            }

            const positions = particle.mesh.geometry.attributes.position.array;
            for (let j = 0; j < positions.length; j += 3) {
                positions[j] += particle.velocities[j/3].x;
                positions[j + 1] += particle.velocities[j/3].y;
                positions[j + 2] += particle.velocities[j/3].z;
            }
            particle.mesh.geometry.attributes.position.needsUpdate = true;
            particle.mesh.material.opacity = particle.life;
        }
    }
}