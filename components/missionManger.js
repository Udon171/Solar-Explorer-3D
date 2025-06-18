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
            message: 'Mission Successful! All objectives completed.',
            type: 'success'
        };
    }
}