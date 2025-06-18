class OrbitalMechanics {
    constructor() {
        this.constants = {
            G: 6.67430e-11,        // Gravitational constant
            AU: 149597870.7,       // Astronomical Unit in km
            SUN_MASS: 1.989e30,    // Solar mass in kg
            YEAR: 31557600,        // Seconds in a year
            DAY: 86400             // Seconds in a day
        };

        this.planets = {
            mercury: {
                mass: 3.285e23,
                radius: 2439.7,
                semiMajorAxis: 0.387098 * this.constants.AU,
                eccentricity: 0.205630,
                inclination: 7.005,
                period: 87.969
            },
            venus: {
                mass: 4.867e24,
                radius: 6051.8,
                semiMajorAxis: 0.723332 * this.constants.AU,
                eccentricity: 0.006772,
                inclination: 3.39458,
                period: 224.701
            },
            mars: {
                mass: 6.39e23,
                radius: 3389.5,
                semiMajorAxis: 1.523679 * this.constants.AU,
                eccentricity: 0.093405,
                inclination: 1.85061,
                period: 686.980
            }
        };
    }

    calculateHohmannTransfer(startPlanet, targetPlanet) {
        const r1 = this.planets[startPlanet].semiMajorAxis;
        const r2 = this.planets[targetPlanet].semiMajorAxis;
        const mu = this.constants.G * this.constants.SUN_MASS;

        // Calculate transfer orbit parameters
        const a_transfer = (r1 + r2) / 2;
        const e_transfer = Math.abs(r2 - r1) / (r2 + r1);
        
        // Calculate velocities
        const v1_circular = Math.sqrt(mu / r1);
        const v2_circular = Math.sqrt(mu / r2);
        const v1_transfer = Math.sqrt(mu * (2/r1 - 1/a_transfer));
        const v2_transfer = Math.sqrt(mu * (2/r2 - 1/a_transfer));

        // Calculate delta-v
        const deltaV1 = Math.abs(v1_transfer - v1_circular);
        const deltaV2 = Math.abs(v2_circular - v2_transfer);

        // Calculate transfer time
        const transferTime = Math.PI * Math.sqrt(Math.pow(a_transfer, 3) / mu);
        const transferDays = transferTime / this.constants.DAY;

        // Calculate phase angle
        const phaseAngle = this.calculatePhaseAngle(startPlanet, targetPlanet, transferDays);

        return {
            semiMajorAxis: a_transfer,
            eccentricity: e_transfer,
            transferTime: transferDays,
            deltaV1,
            deltaV2,
            totalDeltaV: deltaV1 + deltaV2,
            phaseAngle,
            energyCost: 0.5 * (deltaV1 + deltaV2) * 1000, // kg*km^2/s^2
            orbitParameters: {
                perihelion: r1,
                aphelion: r2,
                period: transferDays
            }
        };
    }

    calculatePhaseAngle(startPlanet, targetPlanet, transferTime) {
        const startPeriod = this.planets[startPlanet].period;
        const targetPeriod = this.planets[targetPlanet].period;
        
        // Calculate angular velocities
        const n1 = 360 / startPeriod;
        const n2 = 360 / targetPeriod;
        
        // Calculate phase angle
        const phi = 180 - (n2 * transferTime);
        return (phi + 360) % 360;
    }

    getOrbitalPosition(params, time) {
        const { semiMajorAxis, eccentricity, meanAnomaly } = params;
        
        // Solve Kepler's equation using Newton-Raphson method
        let E = meanAnomaly;
        let delta = 1;
        while (Math.abs(delta) > 1e-6) {
            delta = (E - eccentricity * Math.sin(E) - meanAnomaly) / 
                   (1 - eccentricity * Math.cos(E));
            E -= delta;
        }

        // Calculate position in orbital plane
        const x = semiMajorAxis * (Math.cos(E) - eccentricity);
        const y = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity) * Math.sin(E);
        
        // Include time-based perturbations
        const perturbation = this.calculatePerturbations(time);
        
        return {
            x: x + perturbation.x,
            y: y + perturbation.y,
            z: perturbation.z,
            velocity: this.calculateVelocity(params, E)
        };
    }

    calculatePerturbations(time) {
        // Simplified perturbation model including:
        // - Solar radiation pressure
        // - Gravitational effects from other planets
        const solarPressure = Math.sin(time / 86400) * 0.0001;
        const planetaryEffect = Math.cos(time / 86400) * 0.0002;
        
        return {
            x: solarPressure,
            y: planetaryEffect,
            z: (solarPressure + planetaryEffect) * 0.5
        };
    }

    calculateVelocity(params, E) {
        const { semiMajorAxis, eccentricity } = params;
        const mu = this.constants.G * this.constants.SUN_MASS;
        
        const p = semiMajorAxis * (1 - eccentricity * eccentricity);
        const r = semiMajorAxis * (1 - eccentricity * Math.cos(E));
        
        const v = Math.sqrt(mu * (2/r - 1/semiMajorAxis));
        return v;
    }

    getLaunchWindow(startPlanet, targetPlanet) {
        const transfer = this.calculateHohmannTransfer(startPlanet, targetPlanet);
        const alignmentPeriod = this.calculateAlignmentPeriod(startPlanet, targetPlanet);
        
        return {
            nextWindow: this.findNextAlignment(startPlanet, targetPlanet),
            transferDuration: transfer.transferTime,
            windowDuration: 3, // Days of acceptable launch window
            repeatPeriod: alignmentPeriod,
            energyRequirements: transfer.energyCost,
            deltaV: transfer.totalDeltaV
        };
    }

    calculateAlignmentPeriod(planet1, planet2) {
        const T1 = this.planets[planet1].period;
        const T2 = this.planets[planet2].period;
        return (T1 * T2) / Math.abs(T1 - T2); // Synodic period
    }

    calculateGravityAssist(spacecraft, planet, approachVelocity) {
        const planet_data = this.planets[planet];
        const mu = this.constants.G * planet_data.mass;
        
        // Calculate hyperbolic excess velocity
        const v_inf = Math.sqrt(
            Math.pow(approachVelocity.x, 2) + 
            Math.pow(approachVelocity.y, 2) + 
            Math.pow(approachVelocity.z, 2)
        );
        
        // Calculate minimum approach distance (adding safety margin)
        const r_p = planet_data.radius * 1.1;
        
        // Calculate bend angle
        const delta = 2 * Math.asin(1 / (1 + (r_p * v_inf * v_inf) / mu));
        
        // Calculate velocity change
        const deltaV = 2 * v_inf * Math.sin(delta / 2);
        
        return {
            bendAngle: delta * (180 / Math.PI),
            velocityChange: deltaV,
            periapsisRadius: r_p,
            timeOfFlyby: (2 * r_p) / v_inf, // Approximate flyby duration
            energyGain: 0.5 * spacecraft.mass * (Math.pow(v_inf + deltaV, 2) - Math.pow(v_inf, 2))
        };
    }

    planGravityAssistTrajectory(startPlanet, assistPlanet, targetPlanet) {
        const firstLeg = this.calculateHohmannTransfer(startPlanet, assistPlanet);
        const approachVel = this.calculateApproachVelocity(firstLeg);
        const assist = this.calculateGravityAssist(
            { mass: 1000 }, // Spacecraft mass in kg
            assistPlanet,
            approachVel
        );
        const secondLeg = this.calculateHohmannTransfer(assistPlanet, targetPlanet);
        
        return {
            totalDeltaV: firstLeg.totalDeltaV + assist.velocityChange + secondLeg.deltaV2,
            trajectory: [firstLeg, assist, secondLeg]
        };
    }

    calculateApproachVelocity(transfer) {
        const mu = this.constants.G * this.constants.SUN_MASS;
        const v1 = Math.sqrt(mu / transfer.orbitParameters.perihelion);
        const v2 = Math.sqrt(mu / transfer.orbitParameters.aphelion);
        
        return {
            x: v1,
            y: 0,
            z: -v2
        };
   }

    calculateInclinationChange(orbit, targetInclination) {
        const v_orbit = Math.sqrt(
            this.constants.G * this.constants.SUN_MASS / orbit.semiMajorAxis
        );
        
        // Calculate angle between orbital planes
        const deltaI = Math.abs(orbit.inclination - targetInclination);
        
        // Calculate delta-v required for inclination change
        const deltaV = 2 * v_orbit * Math.sin(deltaI / 2);
        
        // Calculate optimal points for plane change
        const nodeAngle = Math.atan2(
            Math.sin(orbit.longitude) * Math.cos(targetInclination),
            Math.cos(orbit.longitude)
        );
        
        return {
            deltaV,
            optimalPoint: {
                trueAnomaly: nodeAngle,
                meanAnomaly: this.trueToMeanAnomaly(nodeAngle, orbit.eccentricity)
            },
            energyCost: 0.5 * deltaV * deltaV,
            planeChangeAngle: deltaI
        };
    }

    combinedTransferWithInclination(startPlanet, targetPlanet) {
        const basicTransfer = this.calculateHohmannTransfer(startPlanet, targetPlanet);
        const inclinationChange = this.calculateInclinationChange(
            {
                semiMajorAxis: basicTransfer.semiMajorAxis,
                inclination: this.planets[startPlanet].inclination,
                longitude: 0,
                eccentricity: basicTransfer.eccentricity
            },
            this.planets[targetPlanet].inclination
        );
        
        // Calculate optimal combined maneuver
        const combinedDeltaV = Math.sqrt(
            Math.pow(basicTransfer.deltaV1, 2) + 
            Math.pow(inclinationChange.deltaV, 2)
        );
        
        return {
            transfer: basicTransfer,
            planeChange: inclinationChange,
            combinedDeltaV,
            totalEnergyCost: basicTransfer.energyCost + inclinationChange.energyCost,
            optimalSequence: [
                {
                    type: 'Transfer Injection',
                    deltaV: basicTransfer.deltaV1,
                    time: 0
                },
                {
                    type: 'Plane Change',
                    deltaV: inclinationChange.deltaV,
                    time: basicTransfer.transferTime * 0.5 // Mid-transfer plane change
                },
                {
                    type: 'Orbit Insertion',
                    deltaV: basicTransfer.deltaV2,
                    time: basicTransfer.transferTime
                }
            ]
        };
    }
}