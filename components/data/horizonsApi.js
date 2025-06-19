// horizonsApi.js
// Handles fetching planetary ephemeris data from NASA JPL Horizons API and caching results.

const HORIZONS_API_URL = 'https://ssd-api.jpl.nasa.gov/horizons.api';

/**
 * Fetch ephemeris vectors for a given body and time range.
 * @param {string|number} bodyId - Horizons body ID (e.g., 499 for Mars)
 * @param {string} startTime - ISO date string (e.g., '2025-07-01')
 * @param {string} stopTime - ISO date string (e.g., '2025-07-02')
 * @param {string} stepSize - Step size (e.g., '1d')
 * @returns {Promise<Object>} Ephemeris data
 */
export async function fetchEphemeris(bodyId, startTime, stopTime, stepSize = '1d') {
    const url = `${HORIZONS_API_URL}?format=json&COMMAND=${bodyId}&OBJ_DATA=NO&MAKE_EPHEM=YES&EPHEM_TYPE=VECTORS&START_TIME=${startTime}&STOP_TIME=${stopTime}&STEP_SIZE=${stepSize}`;
    // Simple cache using localStorage
    const cacheKey = `horizons_${bodyId}_${startTime}_${stopTime}_${stepSize}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            return JSON.parse(cached);
        } catch (e) {
            localStorage.removeItem(cacheKey);
        }
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error('Horizons API request failed');
    const data = await response.json();
    localStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
}

// Example body IDs: 499 = Mars, 399 = Earth, 299 = Venus
export const HORIZONS_BODY_IDS = {
    mars: 499,
    earth: 399,
    venus: 299,
    mercury: 199,
    jupiter: 599,
    saturn: 699,
    uranus: 799,
    neptune: 899,
    dwarf_planets: 134340, // Pluto as example
    small_bodies: 2000433 // Eros as example
};
