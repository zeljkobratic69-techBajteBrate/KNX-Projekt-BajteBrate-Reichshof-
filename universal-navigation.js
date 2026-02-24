/**
 * UNIVERSAL NAVIGATION SYSTEM
 * Für Etagen 2-5 (identische Layouts)
 * Reichshof Hamburg Digital Concierge
 */

const UNIVERSAL_FLOOR_CONFIG = {
    // Basis-Koordinaten für alle identischen Etagen
    floors: ['2og', '3og', '4og', '5og'],
    
    // Startposition: Hauptaufzug (gleich für alle)
    elevator: {
        x: 39.55,
        y: 88.00,
        name: "Hauptaufzug"
    },
    
    // Zimmer-Bereiche
    zones: {
        zone_00_03: {
            name: "Erster Flurabschnitt",
            rooms: [0, 1, 2, 3], // X00, X01, X02, X03
            steps: [
                "4 Schritte geradeaus vom Aufzug",
                "Links durch die Brandschutz-/Rauchschutztür"
            ],
            positions: {
                0: { side: "rechts", distance: "5m", desc: "Direkt rechts nach der Tür" },
                1: { side: "links", distance: "5m", desc: "Direkt links nach der Tür" },
                2: { side: "links", distance: "8m", desc: "Ganz links, 3-4 Schritte weiter" },
                3: { side: "rechts", distance: "8m", desc: "Schräg rechts" }
            }
        },
        
        zone_04_16: {
            name: "Hauptflur",
            rooms: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
            steps: ["Weiter geradeaus durch den Flur"],
            pattern: "alternating", // links, rechts, links, rechts...
            landmarks: {
                7: "Serviceraumtür geradeaus",
                11: "Letztes Zimmer vor der Kurve"
            }
        },
        
        zone_17: {
            name: "SPA-Bereich",
            rooms: [17],
            steps: [
                "Rechts sehen Sie den SPA-Aufzug (direkt zum Keller/SPA)"
            ],
            special: "spa_elevator_access"
        },
        
        zone_18_24: {
            name: "Bereich nach SPA",
            rooms: [18, 19, 20, 21, 22, 23, 24],
            steps: [
                "Von der Position 317, weiter links",
                "Durch die Brandschutz-/Rauchschutztür"
            ],
            startFrom: "318_position"
        },
        
        zone_25_35: {
            name: "TH7 Bereich (erster Teil)",
            rooms: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
            steps: [
                "Rechts abbiegen nach Zimmer 318",
                "Durch die erste Doppel-Brand-/Rauchschutztür (TH7)",
                "Bodenfliesen, kein Teppich",
                "8 Meter geradeaus"
            ],
            th7_info: "Treppenhaus 7 - Fluchtweg von 6.OG bis 1.OG"
        },
        
        zone_36_49: {
            name: "TH7 Bereich (zweiter Teil)",
            rooms: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
            steps: [
                "Weiter durch die zweite Doppel-Brand-/Rauchschutztür",
                "Rechts und Links Abschnitte zu Zimmern"
            ],
            pattern: "complex",
            th5_info: "Treppenhaus 5 - Umgehung rechts für Zimmer 341+"
        }
    }
};

// Sprachnachrichten
const UNIVERSAL_MESSAGES = {
    de: {
        start: "Sie sind im {floor}. Obergeschoss aus dem Aufzug ausgestiegen.",
        elevator_position: "Hauptaufzug Position: 3 Schritte geradeaus, dann {direction}.",
        zone_transition: "Sie passieren in den nächsten Bereich.",
        room_found: "Ihr Zimmer {room} ist auf der {side}, {distance}.",
        landmark: "Orientierungspunkt: {landmark}.",
        th7_warning: "Achtung: Sie gehen durch den Fluchtweg TH7. Bodenfliesen, kein Teppich.",
        spa_info: "Hinweis: Rechts ist der SPA-Aufzug zum Keller.",
        emergency_note: "Im Brandfall: Diese Türen schließen automatisch. Verlassen Sie das Treppenhaus nur wenn gesund und schnell möglich."
    },
    
    en: {
        start: "You have exited the elevator on the {floor}th floor.",
        elevator_position: "Main elevator position: 3 steps straight, then {direction}.",
        zone_transition: "You are entering the next section.",
        room_found: "Your room {room} is on the {side}, {distance}.",
        landmark: "Landmark: {landmark}.",
        th7_warning: "Caution: You are entering emergency exit TH7. Tiled floor, no carpet.",
        spa_info: "Note: SPA elevator to basement is on the right.",
        emergency_note: "In case of fire: These doors close automatically. Only use stairs if healthy and quick."
    },
    
    hr: {
        start: "Izašli ste iz dizala na {floor}. katu.",
        elevator_position: "Položaj glavnog dizala: 3 koraka ravno, zatim {direction}.",
        zone_transition: "Ulazite u sljedeći dio.",
        room_found: "Vaša soba {room} je na {side}, {distance}.",
        landmark: "Orijentir: {landmark}.",
        th7_warning: "Pozor: Ulazite u izlaz za hitne slučajeve TH7. Pločice, bez tepiha.",
        spa_info: "Napomena: DESNO je SPA dizalo za podrum.",
        emergency_note: "U slučaju požara: Vrata se automatski zatvaraju. Koristite stepenice samo ako ste zdravi i brzi."
    },
    
    es: {
        start: "Ha salido del ascensor en el piso {floor}.",
        elevator_position: "Posición del ascensor principal: 3 pasos rectos, luego {direction}.",
        zone_transition: "Está entrando en la siguiente sección.",
        room_found: "Su habitación {room} está a la {side}, {distance}.",
        landmark: "Punto de referencia: {landmark}.",
        th7_warning: "Cuidado: Está entrando en la salida de emergencia TH7. Suelo de baldosas, sin alfombra.",
        spa_info: "Nota: A la derecha está el ascensor del SPA al sótano.",
        emergency_note: "En caso de incendio: Estas puertas se cierran automáticamente."
    }
};

/**
 * Hauptfunktion: Universal Navigation für Etagen 2-5
 * @param {number} floorNum - 2, 3, 4, oder 5
 * @param {number} roomNum - Zimmernummer (z.B. 235)
 * @param {string} lang - 'de', 'en', 'hr', 'es'
 * @returns {Object} Komplette Navigationsdaten
 */
function getUniversalRoute(floorNum, roomNum, lang = 'de') {
    const messages = UNIVERSAL_MESSAGES[lang] || UNIVERSAL_MESSAGES.de;
    const floorKey = floorNum + 'og';
    const baseNum = Math.floor(roomNum / 100) * 100;
    const offset = roomNum - baseNum;
    
    // Bestimme Zone
    let zone = null;
    for (const [zoneName, zoneData] of Object.entries(UNIVERSAL_CONFIG.zones)) {
        if (zoneData.rooms.includes(offset)) {
            zone = { name: zoneName, ...zoneData };
            break;
        }
    }
    
    if (!zone) {
        return { error: "Zimmer nicht im universellen Layout gefunden" };
    }
    
    // Baue Route auf
    const route = [];
    
    // 1. Start
    route.push(messages.start.replace('{floor}', floorNum));
    
    // 2. Zonen-spezifische Schritte
    zone.steps.forEach(step => route.push(step));
    
    // 3. Zimmer-Position
    if (zone.positions && zone.positions[offset]) {
        const pos = zone.positions[offset];
        route.push(messages.room_found
            .replace('{room}', roomNum)
            .replace('{side}', pos.side)
            .replace('{distance}', pos.distance)
        );
    } else if (zone.pattern === 'alternating') {
        const side = (offset % 2 === 0) ? 
            (lang === 'de' ? 'linken' : lang === 'en' ? 'left' : lang === 'hr' ? 'lijevoj' : 'izquierda') :
            (lang === 'de' ? 'rechten' : lang === 'en' ? 'right' : lang === 'hr' ? 'desnoj' : 'derecha');
        route.push(messages.room_found
            .replace('{room}', roomNum)
            .replace('{side}', side)
            .replace('{distance}', 'direkt am Flur')
        );
    }
    
    // 4. Spezielle Hinweise
    if (zone.th7_info) {
        route.push(messages.th7_warning);
    }
    if (zone.special === 'spa_elevator_access') {
        route.push(messages.spa_info);
    }
    
    // 5. Sicherheitshinweis
    route.push(messages.emergency_note);
    
    // Berechne Distanz und Zeit
    const distance = calculateUniversalDistance(offset);
    const time = Math.round(distance * 1.2); // 1.2 Sekunden pro Meter
    
    return {
        room: roomNum,
        floor: floorNum,
        zone: zone.name,
        text: route.join('\n\n'),
        steps: route.length,
        distance: distance + ' Meter',
        estimatedTime: time + ' Sekunden',
        language: lang,
        emergencyExits: getNearbyEmergencyExits(floorNum, offset)
    };
}

/**
 * Distanz-Berechnung basierend auf Zimmer-Offset
 */
function calculateUniversalDistance(offset) {
    // Basis-Distanzen pro Zone
    if (offset <= 3) return 5;
    if (offset <= 16) return 8 + (offset - 4) * 1.5;
    if (offset <= 17) return 25;
    if (offset <= 24) return 30 + (offset - 18) * 2;
    if (offset <= 35) return 45 + (offset - 25) * 1.5;
    return 65 + (offset - 36) * 1.5;
}

/**
 * Finde nächste Notausgänge
 */
function getNearbyEmergencyExits(floorNum, offset) {
    const exits = [];
    
    // TH7 ist immer verfügbar (1-6 OG)
    exits.push({
        name: "TH7",
        description: "Treppenhaus 7 - zwischen Zimmern 27/28",
        distance: offset >= 25 ? "direkt nebenan" : "8 Meter zurück"
    });
    
    // TH2 nur für EG-5OG
    if (floorNum <= 5) {
        exits.push({
            name: "TH2",
            description: "Treppenhaus 2 - bei Heidi Kabel Konferenzraum",
            distance: "15 Meter"
        });
    }
    
    // TH5 für alle
    exits.push({
        name: "TH5",
        description: "Treppenhaus 5 - bei Zimmern 29/30",
        distance: offset >= 35 ? "direkt nebenan" : "12 Meter"
    });
    
    return exits;
}

/**
 * Generische Funktion für alle Zimmer 200-549
 */
function generateRouteForRoom(roomNum, lang = 'de') {
    const floorNum = Math.floor(parseInt(roomNum) / 100);
    
    // Prüfe ob universelles Layout (2-5)
    if (floorNum >= 2 && floorNum <= 5) {
        return getUniversalRoute(floorNum, parseInt(roomNum), lang);
    }
    
    // Sonst: spezifische Navigation
    return { error: "Verwenden Sie getSpecificRoute() für 1OG oder 6OG" };
}

// Export für globale Nutzung
window.UNIVERSAL_NAVIGATION = {
    getRoute: getUniversalRoute,
    generateRoute: generateRouteForRoom,
    config: UNIVERSAL_FLOOR_CONFIG,
    messages: UNIVERSAL_MESSAGES
};