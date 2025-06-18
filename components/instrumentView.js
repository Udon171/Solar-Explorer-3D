class InstrumentView {
    constructor() {
        this.instruments = {
            camera: new CameraInstrument(),
            spectrometer: new SpectrometerInstrument(),
            radar: new RadarInstrument(),
            gravitometer: new GravitometerInstrument(),
            multiSpectral: new MultiSpectralInstrument()
        };
        
        this.activeInstrument = null;
        this.container = document.getElementById('instrument-view');
    }

    activate(instrumentType, planet) {
        if (!this.instruments[instrumentType]) return;
        
        this.activeInstrument = this.instruments[instrumentType];
        this.container.style.display = 'block';
        this.activeInstrument.initialize(planet);
    }

    update(deltaTime) {
        if (this.activeInstrument) {
            this.activeInstrument.update(deltaTime);
        }
    }
}

class BaseInstrument {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
    }

    initialize(planet) {
        throw new Error('Initialize method must be implemented');
    }

    update(deltaTime) {
        throw new Error('Update method must be implemented');
    }
}

class CameraInstrument extends BaseInstrument {
    initialize(planet) {
        this.planet = planet;
        this.zoom = 1.0;
        this.position = { x: 0, y: 0 };
        this.loadPlanetTexture();
    }

    loadPlanetTexture() {
        const texture = new Image();
        texture.src = `/assets/textures/${this.planet}.jpg`;
        texture.onload = () => {
            this.texture = texture;
            this.render();
        };
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.texture) {
            this.ctx.save();
            this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
            this.ctx.scale(this.zoom, this.zoom);
            this.ctx.drawImage(
                this.texture, 
                -this.texture.width/2 + this.position.x, 
                -this.texture.height/2 + this.position.y
            );
            this.ctx.restore();
        }
    }

    update(deltaTime) {
        this.render();
    }
}

class SpectrometerInstrument extends BaseInstrument {
    initialize(planet) {
        this.planet = planet;
        this.data = PLANET_DATA[planet].atmosphere;
        this.spectrum = [];
        this.generateSpectrum();
    }

    generateSpectrum() {
        // Simulated spectral lines based on atmospheric composition
        const compounds = this.data.split(',');
        compounds.forEach(compound => {
            const percentage = parseFloat(compound);
            const wavelength = Math.random() * 400 + 380; // visible spectrum
            this.spectrum.push({ wavelength, intensity: percentage });
        });
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw spectrum graph
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        
        this.spectrum.forEach((point, index) => {
            const x = (point.wavelength - 380) / (780 - 380) * this.canvas.width;
            const y = this.canvas.height - (point.intensity * this.canvas.height / 100);
            
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        
        this.ctx.stroke();
    }

    update(deltaTime) {
        this.render();
    }
}

class RadarInstrument extends BaseInstrument {
    initialize(planet) {
        this.planet = planet;
        this.features = PLANET_DATA[planet].surfaceFeatures;
        this.scanAngle = 0;
        this.scanData = new Array(360).fill(0);
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw radar sweep
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        
        // Draw background circle
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#003300';
        this.ctx.lineWidth = 2;
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Draw sweep line
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(
            centerX + Math.cos(this.scanAngle) * radius,
            centerY + Math.sin(this.scanAngle) * radius
        );
        this.ctx.stroke();
        
        // Draw detected features
        this.features.forEach((feature, index) => {
            const angle = (index / this.features.length) * Math.PI * 2;
            const distance = radius * 0.7;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            this.ctx.beginPath();
            this.ctx.fillStyle = '#00ff00';
            this.ctx.arc(x, y, 4, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillText(feature, x + 10, y);
        });
    }

    update(deltaTime) {
        this.scanAngle += deltaTime * 2;
        if (this.scanAngle > Math.PI * 2) {
            this.scanAngle = 0;
        }
        this.render();
    }
}

class GravitometerInstrument extends BaseInstrument {
    initialize(planet) {
        this.planet = planet;
        this.data = PLANET_DATA[planet].gravity;
        this.anomalyPoints = [];
        this.scanAngle = 0;
        this.generateGravityData();
    }

    generateGravityData() {
        // Generate simulated gravity anomalies
        const baseGravity = parseFloat(this.data);
        for (let i = 0; i < 5; i++) {
            this.anomalyPoints.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                strength: (Math.random() - 0.5) * 0.5 * baseGravity,
                radius: Math.random() * 50 + 20
            });
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw gravity heat map
        const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        
        for (let x = 0; x < this.canvas.width; x++) {
            for (let y = 0; y < this.canvas.height; y++) {
                const gravity = this.calculateGravityAt(x, y);
                const color = this.getGravityColor(gravity);
                const idx = (y * this.canvas.width + x) * 4;
                
                imageData.data[idx] = color.r;
                imageData.data[idx + 1] = color.g;
                imageData.data[idx + 2] = color.b;
                imageData.data[idx + 3] = 255;
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
        
        // Draw scanning line
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.scanAngle * this.canvas.height);
        this.ctx.lineTo(this.canvas.width, this.scanAngle * this.canvas.height);
        this.ctx.stroke();
    }

    calculateGravityAt(x, y) {
        let totalGravity = parseFloat(this.data);
        
        this.anomalyPoints.forEach(point => {
            const distance = Math.sqrt(
                Math.pow(x - point.x, 2) + 
                Math.pow(y - point.y, 2)
            );
            if (distance < point.radius) {
                totalGravity += point.strength * (1 - distance/point.radius);
            }
        });
        
        return totalGravity;
    }

    getGravityColor(gravity) {
        const baseGravity = parseFloat(this.data);
        const variation = (gravity - baseGravity) / baseGravity;
        
        if (variation > 0) {
            return {
                r: 255 * variation,
                g: 100 * variation,
                b: 0
            };
        } else {
            return {
                r: 0,
                g: 100 * -variation,
                b: 255 * -variation
            };
        }
    }

    update(deltaTime) {
        this.scanAngle += deltaTime * 0.1;
        if (this.scanAngle > 1) this.scanAngle = 0;
        this.render();
    }
}

class MultiSpectralInstrument extends BaseInstrument {
    initialize(planet) {
        this.planet = planet;
        this.bands = ['visible', 'infrared', 'ultraviolet', 'thermal'];
        this.currentBand = 'visible';
        this.data = PLANET_DATA[planet];
        this.generateSpectralData();
    }

    generateSpectralData() {
        this.spectralData = {
            visible: {
                image: `/assets/textures/${this.planet}.jpg`,
                features: this.data.surfaceFeatures
            },
            infrared: {
                temperature: this.data.temperature,
                hotspots: this.generateHotspots()
            },
            ultraviolet: {
                atmosphere: this.data.atmosphere,
                radiation: this.generateRadiationLevels()
            },
            thermal: {
                tempRange: this.generateTemperatureRange()
            }
        };
    }

    generateHotspots() {
        return Array(3).fill(0).map(() => ({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            temp: Math.random() * 100 + 200
        }));
    }

    generateRadiationLevels() {
        return Array(5).fill(0).map(() => ({
            level: Math.random() * 100,
            type: ['alpha', 'beta', 'gamma'][Math.floor(Math.random() * 3)]
        }));
    }

    generateTemperatureRange() {
        const baseTemp = parseInt(this.data.temperature);
        return {
            min: baseTemp - 20,
            max: baseTemp + 20,
            current: baseTemp
        };
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        switch(this.currentBand) {
            case 'visible':
                this.renderVisibleSpectrum();
                break;
            case 'infrared':
                this.renderInfraredSpectrum();
                break;
            case 'ultraviolet':
                this.renderUltravioletSpectrum();
                break;
            case 'thermal':
                this.renderThermalSpectrum();
                break;
        }
    }

    renderVisibleSpectrum() {
        const img = new Image();
        img.src = this.spectralData.visible.image;
        img.onload = () => {
            this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
        };
    }

    renderInfraredSpectrum() {
        // Create infrared heat map
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        gradient.addColorStop(0, 'blue');
        gradient.addColorStop(0.5, 'yellow');
        gradient.addColorStop(1, 'red');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw hotspots
        this.spectralData.infrared.hotspots.forEach(spot => {
            const gradient = this.ctx.createRadialGradient(
                spot.x, spot.y, 0,
                spot.x, spot.y, 50
            );
            gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        });
    }

    update(deltaTime) {
        this.render();
    }

    switchBand(band) {
        if (this.bands.includes(band)) {
            this.currentBand = band;
            this.render();
        }
    }
}