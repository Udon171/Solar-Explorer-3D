class InstrumentVisualizer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
    }

    initializeCanvas(containerId) {
        const container = document.getElementById(containerId);
        this.canvas = document.createElement('canvas');
        this.canvas.width = container.clientWidth;
        this.canvas.height = 200;
        this.ctx = this.canvas.getContext('2d');
        container.appendChild(this.canvas);
    }

    drawSpectrometer(data) {
        if (!this.ctx) return;
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        this.ctx.clearRect(0, 0, width, height);

        // Draw background grid
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.beginPath();
        for (let i = 0; i < width; i += 50) {
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, height);
        }
        for (let i = 0; i < height; i += 50) {
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(width, i);
        }
        this.ctx.stroke();

        // Draw spectrometer data
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.beginPath();
        this.ctx.moveTo(0, height / 2);
        
        // Simulate spectral lines
        for (let x = 0; x < width; x++) {
            const y = height/2 + Math.sin(x/20) * 30 * Math.random();
            this.ctx.lineTo(x, y);
        }
        this.ctx.stroke();
    }

    drawRadarMap(features) {
        if (!this.ctx) return;
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        this.ctx.clearRect(0, 0, width, height);

        // Draw topographic circles
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
        for (let i = 1; i <= 5; i++) {
            this.ctx.beginPath();
            this.ctx.arc(width/2, height/2, i * 30, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Draw feature points
        features.forEach((feature, index) => {
            const angle = (index / features.length) * Math.PI * 2;
            const x = width/2 + Math.cos(angle) * 100;
            const y = height/2 + Math.sin(angle) * 100;

            this.ctx.fillStyle = '#00ff00';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(feature, x + 10, y);
        });
    }
}