// ============================================
// EMERGENCY NAVIGATION SYSTEM
// ============================================
// Navigacija u slučaju POŽARA:
// - OD sobe → DO najbližeg TREPPENHAUS (TH)
// - LIFT NE RADI (automatski u EG)
// - Vizuelni i audio alarm
// ============================================

let floorReferencePoints = null;

async function loadFloorReferencePoints() {
    if (floorReferencePoints) return floorReferencePoints;
    
    try {
        const response = await fetch('floor-reference-points.json');
        floorReferencePoints = await response.json();
        return floorReferencePoints;
    } catch (error) {
        console.warn('Floor reference points not loaded', error);
        return null;
    }
}

/**
 * Pronalazi najbliži TH (Treppenhaus) za datu sobu
 * @param {string} roomNumber - broj sobe
 * @returns {object|null} - najbliži TH sa podacima
 */
async function findNearestEmergencyExit(roomNumber) {
    const refPoints = await loadFloorReferencePoints();
    if (!refPoints) return null;
    
    const floor = roomNumber.charAt(0);
    const floorKey = floor === '0' ? 'EG' : `${floor}OG`;
    
    const floorPoints = refPoints.reference_points?.[floorKey];
    if (!floorPoints) return null;
    
    // Pronađi sve TH na spratu
    const emergencyExits = Object.entries(floorPoints)
        .filter(([key, point]) => point.type === 'emergency_exit')
        .map(([key, point]) => ({ key, ...point }));
    
    if (emergencyExits.length === 0) return null;
    
    // Pronađi koordinate sobe
    const roomCoords = window.roomManager?.getRoomPosition?.(roomNumber);
    if (!roomCoords || !roomCoords.x || !roomCoords.y) {
        // Ako nema koordinata, vrati prvi dostupni TH
        return emergencyExits[0];
    }
    
    // Izračunaj udaljenost do svakog TH
    let nearestExit = null;
    let minDistance = Infinity;
    
    emergencyExits.forEach(exit => {
        if (!exit.x || !exit.y) return; // skip ako nema koordinata
        
        const distance = Math.sqrt(
            Math.pow(exit.x - roomCoords.x, 2) + 
            Math.pow(exit.y - roomCoords.y, 2)
        );
        
        if (distance < minDistance) {
            minDistance = distance;
            nearestExit = exit;
        }
    });
    
    return nearestExit || emergencyExits[0];
}

/**
 * Generira emergency navigacijski tekst OD sobe DO TH
 * @param {string} roomNumber - broj sobe
 * @param {string} language - jezik
 * @returns {string} - navigacijski tekst
 */
async function buildEmergencyNavigation(roomNumber, language = 'de') {
    const refPoints = await loadFloorReferencePoints();
    if (!refPoints) return getEmergencyFallbackText(language);
    
    const nearestExit = await findNearestEmergencyExit(roomNumber);
    const rules = refPoints.emergency_navigation_rules?.[language];
    
    if (!rules) return getEmergencyFallbackText(language);
    
    let navigation = `${rules.alert}\n\n${rules.instruction}\n\n`;
    
    if (nearestExit) {
        const exitName = nearestExit.name?.[language] || nearestExit.name?.de || 'Treppenhaus';
        navigation += `${t('nearest_exit')}: ${exitName}\n\n`;
    }
    
    navigation += rules.direction_to_nearest_th;
    
    return navigation;
}

/**
 * Fallback emergency tekst ako nema učitanih podataka
 */
function getEmergencyFallbackText(language = 'de') {
    if (language === 'de') {
        return '⚠️ FEUERALARM: AUFZUG NICHT BENUTZEN! ⚠️\n\nBenutzen Sie das nächstgelegene Treppenhaus. Folgen Sie den grünen Notausgang-Schildern.';
    } else if (language === 'en') {
        return '⚠️ FIRE ALARM: DO NOT USE ELEVATOR! ⚠️\n\nUse the nearest stairwell. Follow the green emergency exit signs.';
    } else {
        return '⚠️ ALARMA DE INCENDIO: ¡NO USAR ASCENSOR! ⚠️\n\nUse la escalera más cercana. Siga los carteles verdes de salida de emergencia.';
    }
}

/**
 * Aktivira emergency režim za sobu
 * @param {string} roomNumber - broj sobe
 * @param {string} language - jezik
 */
async function activateEmergencyMode(roomNumber, language = 'de') {
    //振動 (vibration) ako je podržano
    if ('vibrate' in navigator) {
        navigator.vibrate([300, 100, 300, 100, 300, 100, 600]);
    }
    
    // Dobavi emergency navigaciju
    const emergencyNav = await buildEmergencyNavigation(roomNumber, language);
    
    // Prikaži vizuelno
    showEmergencyAlert(emergencyNav, roomNumber);
    
    // Izgovori glasovno
    if (window.speakText) {
        window.speakText(emergencyNav, language);
    }
    
    // Označi nearest TH na mapi
    const nearestExit = await findNearestEmergencyExit(roomNumber);
    if (nearestExit && nearestExit.x && nearestExit.y) {
        highlightEmergencyExitOnMap(nearestExit);
    }
    
    // Aktiviraj high contrast za bolju vidljivost
    if (!document.body.classList.contains('high-contrast')) {
        document.body.classList.add('high-contrast');
    }
    
    return emergencyNav;
}

/**
 * Prikazuje emergency alert na ekranu
 */
function showEmergencyAlert(message, roomNumber) {
    // Kreiraj emergency overlay
    let overlay = document.getElementById('emergency-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'emergency-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(239, 68, 68, 0.95);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            color: white;
            text-align: center;
            animation: emergencyFlash 1s ease-in-out infinite;
        `;
        document.body.appendChild(overlay);
    }
    
    overlay.innerHTML = `
        <div style="max-width: 600px; background: rgba(0,0,0,0.8); padding: 3rem; border-radius: 12px; border: 4px solid white;">
            <h1 style="font-size: 3rem; margin-bottom: 2rem; animation: emergencyPulse 0.5s ease-in-out infinite;">
                🔥 NOTFALL / EMERGENCY 🔥
            </h1>
            <div style="font-size: 1.5rem; line-height: 1.8; white-space: pre-wrap; margin-bottom: 2rem;">
                ${message}
            </div>
            <button onclick="closeEmergencyOverlay()" 
                    style="padding: 1.5rem 3rem; font-size: 1.3rem; background: white; color: #ef4444; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
                ${currentLanguage === 'de' ? 'VERSTANDEN' : currentLanguage === 'en' ? 'UNDERSTOOD' : 'ENTENDIDO'}
            </button>
        </div>
    `;
    
    // Dodaj CSS animacije
    if (!document.getElementById('emergency-animations')) {
        const style = document.createElement('style');
        style.id = 'emergency-animations';
        style.textContent = `
            @keyframes emergencyFlash {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.8; }
            }
            @keyframes emergencyPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Zatvara emergency overlay
 */
function closeEmergencyOverlay() {
    const overlay = document.getElementById('emergency-overlay');
    if (overlay) {
        overlay.remove();
    }
}

/**
 * Označava emergency exit na mapi
 */
function highlightEmergencyExitOnMap(exitPoint) {
    // Pronađi ili kreiraj marker za TH
    let marker = document.getElementById('emergency-exit-marker');
    if (!marker) {
        marker = document.createElement('div');
        marker.id = 'emergency-exit-marker';
        marker.style.cssText = `
            position: absolute;
            width: 40px;
            height: 40px;
            background-color: #22c55e;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 30px rgba(34, 197, 94, 0.9), 0 0 60px rgba(34, 197, 94, 0.5);
            border: 4px solid white;
            z-index: 200;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            animation: emergencyExitPulse 0.8s ease-in-out infinite;
        `;
        marker.innerHTML = '🚪';
        
        const mapWrapper = document.getElementById('map-wrapper');
        if (mapWrapper) {
            mapWrapper.appendChild(marker);
        }
        
        // Dodaj animaciju
        if (!document.getElementById('exit-marker-animation')) {
            const style = document.createElement('style');
            style.id = 'exit-marker-animation';
            style.textContent = `
                @keyframes emergencyExitPulse {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); }
                    50% { transform: translate(-50%, -50%) scale(1.3); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    marker.style.display = 'flex';
    marker.style.left = exitPoint.x + '%';
    marker.style.top = exitPoint.y + '%';
}

/**
 * Pronalazi LIFT poziciju za dati sprat
 */
async function findLiftPosition(floorNumber) {
    const refPoints = await loadFloorReferencePoints();
    if (!refPoints) return null;
    
    const floorKey = floorNumber === 0 ? 'EG' : `${floorNumber}OG`;
    const liftMain = refPoints.reference_points?.[floorKey]?.LIFT_MAIN;
    
    return liftMain || null;
}

/**
 * Pronalazi sve TH na datom spratu
 */
async function findAllEmergencyExitsOnFloor(floorNumber) {
    const refPoints = await loadFloorReferencePoints();
    if (!refPoints) return [];
    
    const floorKey = floorNumber === 0 ? 'EG' : `${floorNumber}OG`;
    const floorPoints = refPoints.reference_points?.[floorKey];
    
    if (!floorPoints) return [];
    
    return Object.entries(floorPoints)
        .filter(([key, point]) => point.type === 'emergency_exit')
        .map(([key, point]) => ({ key, ...point }));
}

// Eksportiraj funkcije globalno
if (typeof window !== 'undefined') {
    window.loadFloorReferencePoints = loadFloorReferencePoints;
    window.findNearestEmergencyExit = findNearestEmergencyExit;
    window.buildEmergencyNavigation = buildEmergencyNavigation;
    window.activateEmergencyMode = activateEmergencyMode;
    window.closeEmergencyOverlay = closeEmergencyOverlay;
    window.findLiftPosition = findLiftPosition;
    window.findAllEmergencyExitsOnFloor = findAllEmergencyExitsOnFloor;
}
