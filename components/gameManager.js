import { MissionManager } from './missionManager.js';

class GameManager {
    constructor() {
        this.missionManager = new MissionManager();
        this.gameState = {
            missionActive: false,
            currentMission: null,
            simulationSpeed: 1,
            elapsedTime: 0,
            resources: {
                fuel: 100,
                power: 100,
                dataCollected: 0
            }
        };
    }

    updateGameState() {
        if (!this.gameState.missionActive) return;

        // Update resources
        this.gameState.resources.fuel -= 0.1 * this.gameState.simulationSpeed;
        this.gameState.resources.power -= 0.05 * this.gameState.simulationSpeed;
        
        if (this.gameState.currentMission?.targetReached) {
            this.gameState.resources.dataCollected += 
                0.5 * this.gameState.currentMission.instruments.length * 
                this.gameState.simulationSpeed;
        }

        // Check mission status
        const missionStatus = this.missionManager.checkMissionStatus(this.gameState);
        if (missionStatus) {
            this.showMissionNotification(missionStatus);
            this.endMission(missionStatus.status);
        }

        this.updateUI();
    }

    showMissionNotification(status) {
        const notification = document.createElement('div');
        notification.className = `mission-notification ${status.type}`;
        notification.innerHTML = `
            <h2>${status.message}</h2>
            <div class="mission-stats">
                <p>Mission Duration: ${Math.floor(this.gameState.currentMission.elapsedTime)} days</p>
                <p>Data Collected: ${Math.floor(this.gameState.resources.dataCollected)} MB</p>
                <p>Remaining Fuel: ${Math.floor(this.gameState.resources.fuel)}%</p>
                <p>Remaining Power: ${Math.floor(this.gameState.resources.power)}%</p>
            </div>
            <button onclick="this.parentElement.remove()">Close</button>
        `;
        document.body.appendChild(notification);
    }

    endMission(status) {
        this.gameState.missionActive = false;
        // Save mission results or update player progress here
    }

    updateUI() {
        const statusDiv = document.getElementById('mission-status');
        if (!statusDiv) return;

        const resources = this.gameState.resources;
        const fuelStatus = resources.fuel < 20 ? 'critical' : 
                            resources.fuel < 40 ? 'warning' : 'normal';
        const powerStatus = resources.power < 20 ? 'critical' : 
                            resources.power < 40 ? 'warning' : 'normal';

        statusDiv.innerHTML = `
            <h3>Mission Status</h3>
            <p>
                <span class="status-indicator ${fuelStatus}"></span>
                Fuel: ${Math.floor(resources.fuel)}%
            </p>
            <p>
                <span class="status-indicator ${powerStatus}"></span>
                Power: ${Math.floor(resources.power)}%
            </p>
            <p>Data: ${Math.floor(resources.dataCollected)} MB</p>
            <p>Time: ${Math.floor(this.gameState.currentMission?.elapsedTime || 0)} days</p>
        `;
    }
}

export { GameManager };