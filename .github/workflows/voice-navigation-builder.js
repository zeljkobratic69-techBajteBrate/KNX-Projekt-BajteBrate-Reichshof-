// ============================================
// VOICE NAVIGATION BUILDER - KOMPLETNA GOVORNA NAVIGACIJA
// ============================================
// Ovaj modul sastavlja navigaciju u 3 segmenta:
// 1. Recepcija → Lift (uvijek isto)
// 2. Lift → Referentna točka na spratu (sprat-specifično)
// 3. Referentna točka → Konkretna soba (soba-specifično)
// ============================================

let voiceNavData = null;

async function loadVoiceNavigationData() {
    if (voiceNavData) return voiceNavData;
    
    try {
        const response = await fetch('voice-navigation-system.json');
        voiceNavData = await response.json();
        return voiceNavData;
    } catch (error) {
        console.warn('Voice navigation data not loaded', error);
        return null;
    }
}

/**
 * Sastavlja kompletnu govornu navigaciju za sobu
 * @param {string} roomNumber - broj sobe (npr. "227")
 * @param {string} language - jezik ('de', 'en', 'es')
 * @param {object} roomData - dodatni podaci o sobi iz baze
 * @returns {string} - kompletna govorna navigacija
 */
async function buildCompleteVoiceNavigation(roomNumber, language = 'de', roomData = null) {
    const navData = await loadVoiceNavigationData();
    if (!navData) return buildFallbackNavigation(roomNumber, language, roomData);
    
    const floor = roomNumber.charAt(0);
    const segments = [];
    
    // SEGMENT 1: Recepcija → Lift (uvijek isto)
    const receptionToLift = navData.navigation_segments?.reception_to_lift?.[language];
    if (receptionToLift) {
        segments.push(receptionToLift);
    }
    
    // SEGMENT 2: Lift → Etažna referentna točka
    const floorExit = navData.navigation_segments?.floor_exits?.[floor]?.[language];
    if (floorExit) {
        segments.push(floorExit);
    }
    
    // SEGMENT 3: Detaljne upute do sobe
    let detailedRoute = null;
    
    // Prvo provjeri specifične rute
    if (navData.detailed_room_routes?.[roomNumber]?.[language]) {
        detailedRoute = navData.detailed_room_routes[roomNumber][language];
    }
    // Zatim provjeri manual-room-routes.json
    else if (window.manualRoomRoutes?.[roomNumber]?.[language]) {
        detailedRoute = window.manualRoomRoutes[roomNumber][language];
    }
    // Ako nema, koristi template logiku iz manual-route-logic.json
    else if (window.routeLogicConfig?.[language]) {
        detailedRoute = buildRouteFromTemplate(roomNumber, language, roomData);
    }
    
    if (detailedRoute) {
        segments.push(detailedRoute);
    }
    
    // ACCESSIBILITY: Dodaj napomene ako je potrebno
    if (roomData?.accessible) {
        const accessNote = navData.accessibility_notes?.wheelchair_route?.[language];
        if (accessNote) {
            segments.push(accessNote.replace('{route}', 'Barrierefreier Zugang verfügbar'));
        }
    }
    
    // Sastavi sve segmente
    return segments.join(' ');
}

/**
 * Gradi rutu na osnovu template logike (iz manual-route-logic.json)
 */
function buildRouteFromTemplate(roomNumber, language, roomData) {
    if (!window.routeLogicConfig?.[language]) return null;
    
    const floor = parseInt(roomNumber.charAt(0));
    const roomNum = parseInt(roomNumber);
    const config = window.routeLogicConfig[language];
    
    // Logika za spratove 2-5
    if (floor >= 2 && floor <= 5) {
        const lastTwoDigits = roomNum % 100;
        
        if (lastTwoDigits >= 0 && lastTwoDigits <= 11) {
            return config.f2to5_left
                .replace('{floor}', floor)
                .replace('{room}', roomNumber);
        } else if (lastTwoDigits >= 12 && lastTwoDigits <= 49) {
            return config.f2to5_right
                .replace('{floor}', floor)
                .replace('{room}', roomNumber);
        }
    }
    
    // Logika za 6. sprat
    if (floor === 6) {
        const lastTwoDigits = roomNum % 100;
        
        if (lastTwoDigits >= 0 && lastTwoDigits <= 4) {
            return config.f6_left.replace('{room}', roomNumber);
        } else if (lastTwoDigits >= 12 && lastTwoDigits <= 46) {
            return config.f6_right.replace('{room}', roomNumber);
        }
    }
    
    // Logika za 1. sprat
    if (floor === 1) {
        if (roomNumber === '100') {
            return config.f1_room100;
        } else if (roomNumber === '101' || roomNumber === '102') {
            return config.f1_left_101_102.replace('{room}', roomNumber);
        } else if (roomNum >= 103 && roomNum <= 135) {
            return config.f1_right_103_135.replace('{room}', roomNumber);
        }
    }
    
    // Logika za apartmane 700/800
    if (roomNumber === '700' || roomNumber === '800') {
        return config.f7f8_special?.replace('{room}', roomNumber);
    }
    
    return null;
}

/**
 * Fallback navigacija ako nema učitanih podataka
 */
function buildFallbackNavigation(roomNumber, language, roomData) {
    const floor = roomNumber.charAt(0);
    
    if (language === 'de') {
        return `Ihr Zimmer ${roomNumber} befindet sich im ${floor}. Obergeschoss. Bitte nehmen Sie den Fahrstuhl zur Etage ${floor}. Nach dem Verlassen des Fahrstuhls folgen Sie den Zimmernummern zu Ihrem Zimmer.`;
    } else if (language === 'en') {
        return `Your room ${roomNumber} is located on the ${floor}th floor. Please take the elevator to floor ${floor}. After exiting the elevator, follow the room numbers to your room.`;
    } else {
        return `Su habitación ${roomNumber} está en el piso ${floor}. Por favor, tome el ascensor al piso ${floor}. Después de salir del ascensor, siga los números de habitación.`;
    }
}

/**
 * Priprema navigaciju za ispis teksta (npr. na ekranu)
 */
function buildTextNavigation(roomNumber, language = 'de', roomData = null) {
    return buildCompleteVoiceNavigation(roomNumber, language, roomData);
}

/**
 * Priprema navigaciju za govor (TTS)
 */
async function buildSpeechNavigation(roomNumber, language = 'de', roomData = null) {
    const text = await buildCompleteVoiceNavigation(roomNumber, language, roomData);
    
    // Možete dodati dodatne TTS prilagodbe ovdje
    // npr. zamjena brojeva sa riječima, pauze, naglasci
    return text;
}

// Eksportiraj funkcije za globalnu upotrebu
if (typeof window !== 'undefined') {
    window.buildCompleteVoiceNavigation = buildCompleteVoiceNavigation;
    window.buildTextNavigation = buildTextNavigation;
    window.buildSpeechNavigation = buildSpeechNavigation;
    window.loadVoiceNavigationData = loadVoiceNavigationData;
}
