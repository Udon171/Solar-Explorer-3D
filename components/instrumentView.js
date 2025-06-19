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
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.img = new window.Image();
        this.img.src = `/assets/textures/${planet}.jpg`;
        this.img.onload = () => this.draw();
        this.draw();
        this.attachToView();
    }
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.img.complete) {
            const w = this.canvas.width * this.zoom;
            const h = this.canvas.height * this.zoom;
            this.ctx.drawImage(this.img, (this.canvas.width-w)/2, (this.canvas.height-h)/2, w, h);
        }
    }
    update() { this.draw(); }
    attachToView() {
        const container = document.getElementById('instrument-content');
        container.innerHTML = '';
        container.appendChild(this.canvas);
    }
}

class SpectrometerInstrument extends BaseInstrument {
    initialize(planet) {
        this.planet = planet;
        this.canvas.width = 600;
        this.canvas.height = 200;
        this.drawSpectra();
        this.attachToView();
    }
    drawSpectra() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Fake spectrum: colored bars for demo
        const colors = ['#aaf', '#5cf', '#0cf', '#0af', '#08f', '#05f'];
        for (let i = 0; i < colors.length; i++) {
            this.ctx.fillStyle = colors[i];
            this.ctx.fillRect(i*100, 0, 100, 200);
        }
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px sans-serif';
        this.ctx.fillText('Spectrometer Data', 10, 30);
    }
    update() {}
    attachToView() {
        const container = document.getElementById('instrument-content');
        container.innerHTML = '';
        container.appendChild(this.canvas);
    }
}

class RadarInstrument extends BaseInstrument {
    initialize(planet) {
        this.planet = planet;
        this.canvas.width = 600;
        this.canvas.height = 200;
        this.drawRadar();
        this.attachToView();
    }
    drawRadar() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Fake radar: sine wave for terrain
        this.ctx.strokeStyle = '#0f0';
        this.ctx.beginPath();
        for (let x = 0; x < this.canvas.width; x++) {
            const y = 100 + 50 * Math.sin(x/60);
            if (x === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.stroke();
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px sans-serif';
        this.ctx.fillText('Radar Topography', 10, 30);
    }
    update() {}
    attachToView() {
        const container = document.getElementById('instrument-content');
        container.innerHTML = '';
        container.appendChild(this.canvas);
    }
}

class GravitometerInstrument extends BaseInstrument {
    initialize(planet) {
        this.planet = planet;
        this.canvas.width = 600;
        this.canvas.height = 200;
        this.drawGravity();
        this.attachToView();
    }
    drawGravity() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Fake gravity: gradient bar
        const grad = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        grad.addColorStop(0, '#ff0');
        grad.addColorStop(1, '#f00');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 80, this.canvas.width, 40);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px sans-serif';
        this.ctx.fillText('Gravity Field', 10, 70);
    }
    update() {}
    attachToView() {
        const container = document.getElementById('instrument-content');
        container.innerHTML = '';
        container.appendChild(this.canvas);
    }
}

class MultiSpectralInstrument extends BaseInstrument {
    initialize(planet) {
        this.planet = planet;
        this.band = 'visible';
        this.canvas.width = 600;
        this.canvas.height = 200;
        this.drawBands();
        this.attachToView();
        this.addBandControls();
    }
    drawBands() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Fake bands: colored rectangles
        const bands = {
            visible: '#fff',
            infrared: '#f88',
            ultraviolet: '#88f',
            thermal: '#ff8'
        };
        this.ctx.fillStyle = bands[this.band];
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#222';
        this.ctx.font = '20px sans-serif';
        this.ctx.fillText(`${this.band.charAt(0).toUpperCase()+this.band.slice(1)} Band`, 10, 30);
    }
    update() {}
    attachToView() {
        const container = document.getElementById('instrument-content');
        container.innerHTML = '';
        container.appendChild(this.canvas);
    }
    addBandControls() {
        const container = document.getElementById('instrument-content');
        const bandDiv = document.createElement('div');
        bandDiv.className = 'band-controls';
        ['visible','infrared','ultraviolet','thermal'].forEach(band => {
            const btn = document.createElement('button');
            btn.textContent = band.charAt(0).toUpperCase()+band.slice(1);
            btn.onclick = () => { this.band = band; this.drawBands(); };
            bandDiv.appendChild(btn);
        });
        container.appendChild(bandDiv);
    }
}

export { InstrumentView };