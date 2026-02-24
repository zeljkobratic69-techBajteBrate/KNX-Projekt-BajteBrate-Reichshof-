/**
 * SPECIFIC NAVIGATION SYSTEM
 * Für Etagen 1OG und 6OG (spezielle Layouts)
 * Reichshof Hamburg Digital Concierge
 */

const SPECIFIC_FLOOR_CONFIG = {
    // 1.OG - komplett anderes Layout (TH9 Start)
    "1og": {
        name: "1. Obergeschoss",
        startPoint: "TH9 vom Erdgeschoss/Lobby",
        elevator: { x: 39.17, y: 89.96, name: "Hauptaufzug 1.OG" },
        
        zones: [
            {
                name: "TH9 Bereich",
                rooms: [103, 104, 105, 106],
                entry: "Rechts durch erste Brandschutztür, dann mit Zimmerkarte zweite Doppeltür",
                route: [
                    "Direkt danach rechts: Zimmer 103",
                    "3 Schritte weiter links: Zimmer 104",
                    "3 Schritte weiter rechts: Zimmer 105",
                    "Geradeaus am Ende: Zimmer 106"
                ],
                spaElevator: "Rechts von Zimmer 106"
            },
            {
                name: "Linker Bereich (107-113)",
                rooms: [107, 108, 109, 110, 111, 112, 113],
                entry: "Links von Zimmer 106, 3 Schritte",
                route: [
                    "Links: Zimmer 107",
                    "Weiter geradeaus durch Brandschutztür",
                    "Links: Zimmer 108",
                    "2 Schritte rechts: Zimmer 109",
                    "2 Schritte links: Zimmer 110",
                    "Links: Zimmer 111",
                    "Rechts: Zimmer 112",
                    "Geradeaus: Zimmer 113"
                ]
            },
            {
                name: "Rechter Bereich (114-135)",
                rooms: [114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135],
                entry: "Von 107 rechts, durch TH7 Doppeltüren",
                th7Info: "Bodenfliesen, 8 Meter",
                subZones: {
                    "114-116": "Direkt nach TH7: 115 links, 116 rechts",
                    "117-122": "Rechts abbiegen: 117, 118 links, 119 rechts, 120 links, 121 rechts, 122 geradeaus",
                    "123-135": "Weiter durch TH5: komplexes Layout mit Appartement-Zwischenetage"
                }
            },
            {
                name: "Konferenzbereich (100-102)",
                rooms: [100, 101, 102],
                entry: "Vom Aufzug LINKS (nicht TH9 rechts)",
                special: "Hinter dem Konferenzbereich, Wendeltreppe"
            }
        ],
        
        referencePoints: {
            "TH9": { x: 42.42, y: 90.58, description: "Hauptfluchtweg EG-6OG" },
            "TH7": { x: 54.00, y: 82.58, description: "Bei Zimmern 117/118" },
            "TH5": { x: 56.75, y: 65.63, description: "Bei Zimmern 129/128" },
            "SPA_AUFZUG": { x: 52.00, y: 90.46, description: "Neben Zimmer 107" }
        }
    },
    
    // 6.OG - reduziertes Layout (nur 47 Zimmer)
    "6og": {
        name: "6. Obergeschoss",
        startPoint: "Hauptaufzug",
        elevator: { x: 39.55, y: 88.00, name: "Hauptaufzug 6.OG" },
        
        zones: [
            {
                name: "Linker Bereich (600-604)",
                rooms: [600, 601, 602, 603, 604],
                count: 5,
                entry: "Aus dem Aufzug LINKS durch Brandschutztür",
                route: [
                    "Rechts: Zimmer 600",
                    "2 Schritte rechts: Zimmer 602",
                    "Links: Zimmer 601",
                    "Weiter geradeaus Ende Flur:",
                    "Rechts: Zimmer 604",
                    "Links: Zimmer 603"
                ],
                note: "Nur 5 Zimmer, kompakte Anordnung"
            },
            {
                name: "Rechter Bereich (612-646)",
                rooms: [612, 613, 614, 615, 616, 617, 618, 619, 620, 621, 622, 623, 624, 
                        625, 626, 627, 628, 629, 630, 631, 632, 633, 634, 635, 636, 637, 
                        638, 639, 640, 641, 642, 643, 644, 645, 646],
                count: 35,
                entry: "Aus dem Aufzug RECHTS",
                route: [
                    "Schräg links: Zimmer 612",
                    "Rechts: Zimmer 614",
                    "Links: Zimmer 613",
                    "Weiter links: 615",
                    "Rechts: 616",
                    "Geradeaus: 617",
                    "Rechts von 617: SPA-Aufzug",
                    "Links von 617: 618",
                    "Weiter geradeaus Ende: 619 (links), 620 (rechts)",
                    "Gegenüber: 621 (links)",
                    "Weiter: 622 (links), 623 (rechts), 624 (geradeaus)"
                ],
                th7Section: "Nach 618 rechts: TH7 Bereich mit 625-646",
                th5Section: "TH5 Umgehung für 640-646"
            }
        ],
        
        missingRooms: "605-611 existieren nicht!",
        note: "Kein TH2 auf dieser Etage (nur bis 5.OG)",
        
        referencePoints: {
            "TH7": { x: 54.67, y: 82.13, description: "Bei Zimmern 627/628" },
            "TH5": { x: 58.08, y: 65.42, description: "Bei Zimmern 642/641" },
            "SPA_AUFZUG": { x: 51.83, y: 88.79, description: "Neben Zimmer 617, direkt zu SPA/GYM" }
        }
    }
};

// Sprachnachrichten für spezifische Etagen
const SPECIFIC_MESSAGES = {
    de: {
        "1og_start": "Sie sind im 1. Obergeschoss. Diese Etage hat ein besonderes Layout.",
        "1og_th9": "Starten Sie vom TH9 Treppenhaus, das vom Erdgeschoss kommt.",
        "1og_spa": "Der SPA-Aufzug ist neben Zimmer 107.",
        "1og_complex": "Diese Etage ist komplexer. Folgen Sie den Schritten genau.",
        
        "6og_start": "Sie sind im 6. Obergeschoss, der obersten Etage mit Zimmern.",
        "6og_limited": "Hinweis: Nur 47 Zimmer (600-604 und 612-646). Zimmer 605-611 gibt es nicht.",
        "6og_no_th2": "Wichtig: Treppenhaus TH2 gibt es auf dieser Etage nicht! Nutzen Sie TH7 oder TH5.",
        "6og_spa": "SPA-Aufzug direkt neben Zimmer 617 - fährt zum Keller.",
        
        landmark_107: "Orientierung: Zimmer 107 ist der Schlüsselpunkt links vom TH9.",
        landmark_617: "Orientierung: Zimmer 617 - hier ist der SPA-Aufzug."
    },
    
    en: {
        "1og_start": "You are on the 1st floor. This floor has a special layout.",
        "1og_th9": "Start from TH9 staircase, coming from the ground floor.",
        "1og_spa": "The SPA elevator is next to room 107.",
        "1og_complex": "This floor is more complex. Follow the steps exactly.",
        
        "6og_start": "You are on the 6th floor, the top floor with rooms.",
        "6og_limited": "Note: Only 47 rooms (600-604 and 612-646). Rooms 605-611 do not exist.",
        "6og_no_th2": "Important: Staircase TH2 is not available on this floor! Use TH7 or TH5.",
        "6og_spa": "SPA elevator right next to room 617 - goes to basement.",
        
        landmark_107: "Landmark: Room 107 is the key point left of TH9.",
        landmark_617: "Landmark: Room 617 - here is the SPA elevator."
    },
    
    hr: {
        "1og_start": "Nalazite se na 1. katu. Ova etaža ima poseban raspored.",
        "1og_th9": "Krenite od stepeništa TH9, koje dolazi iz prizemlja.",
        "1og_spa": "SPA dizalo je pored sobe 107.",
        "1og_complex": "Ova etaža je složenija. Pažljivo slijedite korake.",
        
        "6og_start": "Nalazite se na 6. katu, najvišoj etaži sa sobama.",
        "6og_limited": "Napomena: Samo 47 soba (600-604 i 612-646). Sobe 605-611 ne postoje.",
        "6og_no_th2": "Važno: Stepenište TH2 ne postoji na ovoj etaži! Koristite TH7 ili TH5.",
        "6og_spa": "SPA dizalo odmah pored sobe 617 - vodi u podrum.",
        
        landmark_107: "Orijentir: Soba 107 je ključna točka lijevo od TH9.",
        landmark_617: "Orijentir: Soba 617 - ovdje je SPA dizalo."
    },
    
    es: {
        "1og_start": "Está en el 1er piso. Esta planta tiene un diseño especial.",
        "1og_th9": "Comience desde la escalera TH9, que viene de la planta baja.",
        "1og_spa": "El ascensor del SPA está al lado de la habitación 107.",
        "1og_complex": "Esta planta es más compleja. Siga los pasos exactamente.",
        
        "6og_start": "Está en el 6to piso, la planta superior con habitaciones.",
        "6og_limited": "Nota: Solo 47 habitaciones (600-604 y 612-646). Las habitaciones 605-611 no existen.",
        "6og_no_th2": "¡Importante: La escalera TH2 no está disponible en esta planta! Use TH7 o TH5.",
        "6og_spa": "Ascensor del SPA justo al lado de la habitación 617 - va al sótano.",
        
        landmark_107: "Punto de referencia: Habitación 107 es el punto clave a la izquierda de TH9.",
        landmark_617: "Punto de referencia: Habitación 617 - aquí está el ascensor del SPA."
    }
};

/**
 * Navigation für 1.OG
 */
function get1OGRoute(roomNum, lang = 'de') {
    const config = SPECIFIC_FLOOR_CONFIG["1og"];
    const messages = SPECIFIC_MESSAGES[lang];
    const room = parseInt(roomNum);
    
    const route = [];
    route.push(messages["1og_start"]);
    route.push(messages["1og_th9"]);
    
    // Finde Zone
    let zone = null;
    for (const z of config.zones) {
        if (z.rooms.includes(room)) {
            zone = z;
            break;
        }
    }
    
    if (!zone) {
        // Prüfe Konferenzbereich 100-102
        if (room >= 100 && room <= 102) {
            route.push("Vom Aufzug LINKS (nicht rechts zum TH9)");
            route.push("Hinter dem Konferenzbereich");
            route.push(`Zimmer ${room} befindet sich hier.`);
            route.push("Hinweis: Wendeltreppe, Konferenztreppenhaus");
        } else {
            return { error: `Zimmer ${room} nicht in 1.OG Layout gefunden` };
        }
    } else {
        route.push(`Bereich: ${zone.name}`);
        route.push(`Eingang: ${zone.entry}`);
        
        if (zone.route) {
            zone.route.forEach(step => route.push(step));
        }
        
        if (zone.spaElevator) {
            route.push(messages["1og_spa"]);
        }
    }
    
    // Spezielle Hinweise
    if (room === 107) {
        route.push(messages.landmark_107);
    }
    
    route.push(messages["1og_complex"]);
    
    return {
        room: roomNum,
        floor: "1og",
        text: route.join('\n\n'),
        zone: zone ? zone.name : "Konferenzbereich",
        landmarks: ["TH9", "Zimmer 107", "SPA-Aufzug"],
        emergencyExits: ["TH9", "TH7", "TH5"]
    };
}

/**
 * Navigation für 6.OG
 */
function get6OGRoute(roomNum, lang = 'de') {
    const config = SPECIFIC_FLOOR_CONFIG["6og"];
    const messages = SPECIFIC_MESSAGES[lang];
    const room = parseInt(roomNum);
    
    // Prüfe ob Zimmer existiert
    if ((room >= 605 && room <= 611) || room < 600 || room > 646) {
        return { 
            error: `Zimmer ${room} existiert nicht im 6.OG! 
Verfügbare Zimmer: 600-604 und 612-646.
Hinweis: 605-611 gibt es nicht.`
        };
    }
    
    const route = [];
    route.push(messages["6og_start"]);
    route.push(messages["6og_limited"]);
    route.push(messages["6og_no_th2"]);
    
    // Finde Zone
    const zone = config.zones.find(z => z.rooms.includes(room));
    
    if (zone) {
        route.push(`Bereich: ${zone.name} (${zone.count} Zimmer)`);
        route.push(zone.entry);
        
        if (zone.route) {
            // Suche spezifischen Schritt für dieses Zimmer
            const specificStep = zone.route.find(r => r.includes(room.toString()));
            if (specificStep) {
                route.push(`→ ${specificStep}`);
            } else {
                // Generische Position
                const index = zone.rooms.indexOf(room);
                route.push(`Zimmer ${room} ist die ${index + 1}. von ${zone.count} in diesem Bereich.`);
            }
        }
        
        if (zone.th7Section && room >= 625) {
            route.push(`TH7 Bereich: ${zone.th7Section}`);
        }
    }
    
    // Wichtige Landmark
    if (room >= 615 && room <= 619) {
        route.push(messages.landmark_617);
        route.push(messages["6og_spa"]);
    }
    
    return {
        room: roomNum,
        floor: "6og",
        text: route.join('\n\n'),
        zone: zone ? zone.name : "Unbekannt",
        note: "Kein TH2 auf dieser Etage!",
        landmarks: ["Zimmer 617 (SPA-Aufzug)", "TH7", "TH5"],
        emergencyExits: ["TH7", "TH5"] // Kein TH2!
    };
}

/**
 * Hauptfunktion für spezifische Etagen
 */
function getSpecificRoute(floorNum, roomNum, lang = 'de') {
    if (floorNum === 1 || floorNum === "1og") {
        return get1OGRoute(roomNum, lang);
    }
    if (floorNum === 6 || floorNum === "6og") {
        return get6OGRoute(roomNum, lang);
    }
    return { error: "Verwenden Sie getUniversalRoute() für Etagen 2-5" };
}

// Export
window.SPECIFIC_NAVIGATION = {
    get1OG: get1OGRoute,
    get6OG: get6OGRoute,
    getRoute: getSpecificRoute,
    config: SPECIFIC_FLOOR_CONFIG,
    messages: SPECIFIC_MESSAGES
};