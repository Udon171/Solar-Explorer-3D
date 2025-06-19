// instrumentConfig.js
// Static configuration for instruments

export const INSTRUMENT_CONFIG = {
    camera: {
        name: 'High Resolution Camera',
        powerUsage: 5,
        dataRate: 10,
        description: 'Captures detailed surface images'
    },
    spectrometer: {
        name: 'Mass Spectrometer',
        powerUsage: 8,
        dataRate: 5,
        description: 'Analyzes atmospheric composition'
    },
    radar: {
        name: 'Surface Radar',
        powerUsage: 12,
        dataRate: 15,
        description: 'Maps surface topology'
    },
    gravitometer: {
        name: 'High-Precision Gravitometer',
        powerUsage: 15,
        dataRate: 8,
        description: 'Measures gravitational fields and anomalies'
    },
    multiSpectral: {
        name: 'Multi-Spectral Imager',
        powerUsage: 20,
        dataRate: 25,
        description: 'Captures data across multiple wavelength bands'
    }
};
