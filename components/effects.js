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