class InstrumentView {
    constructor() {
        this.instruments = {
            camera: new CameraInstrument(),
            spectrometer: new SpectrometerInstrument(),
            radar: new RadarInstrument()
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