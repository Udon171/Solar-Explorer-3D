// missionManager.js
// Renamed from missionManger.js for consistency

class MissionManager {
    constructor() {
        this.missionConditions = {
            mars: {
                maxTime: 260, // days
                minFuel: 10,
                minPower: 20,
                requiredData: 100 // MB
            },
            venus: {
                maxTime: 180,
                minFuel: 15,
                minPower: 25,
                requiredData: 150
            },
            earth: {
                maxTime: 365, // days
                minFuel: 5,
                minPower: 10,
                requiredData: 80
            },
            mercury: {
                maxTime: 120,
                minFuel: 8,
                minPower: 12,
                requiredData: 60
            },
            jupiter: {
                maxTime: 800,
                minFuel: 30,
                minPower: 40,
                requiredData: 200
            },
            saturn: {
                maxTime: 1200,
                minFuel: 40,
                minPower: 50,
                requiredData: 250
            },
            uranus: {
                maxTime: 2500,
                minFuel: 60,
                minPower: 70,
                requiredData: 300
            },
            neptune: {
                maxTime: 3500,
                minFuel: 80,
                minPower: 90,
                requiredData: 350
            },
            dwarf_planets: {
                maxTime: 5000,
                minFuel: 100,
                minPower: 100,
                requiredData: 400
            },
            small_bodies: {
                maxTime: 2000,
                minFuel: 20,
                minPower: 20,
                requiredData: 120
            }
        };
    }

    checkMissionStatus(gameState) {
        const mission = gameState.currentMission;
        const conditions = this.missionConditions[mission.target];
        
        // Check failure conditions
        if (gameState.resources.fuel < conditions.minFuel) {
            return this.missionFailed('Critical fuel level reached');
        }
        
        if (gameState.resources.power < conditions.minPower) {
            return this.missionFailed('Power systems critical');
        }
        
        if (mission.elapsedTime > conditions.maxTime) {
            return this.missionFailed('Mission time exceeded');
        }

        // Check success conditions
        if (mission.dataCollected >= conditions.requiredData && 
            mission.targetReached) {
            return this.missionSucceeded();
        }

        return null;
    }

    missionFailed(reason) {
        return {
            status: 'failed',
            message: `Mission Failed: ${reason}`,
            type: 'error'
        };
    }

    missionSucceeded() {
        return {
            status: 'success',
            message: 'Mission Succeeded!',
            type: 'success'
        };
    }
}

export { MissionManager };
