// ============================================
        // GLOBALE VARIABLEN & KONFIGURATION
        // ============================================
        const CONFIG = {
            version: '3.0.0',
            cacheName: 'reichshof-concierge-v3',
            svgUrl: './svg/',
            analyticsKey: 'reichshof_analytics_v3'
        };
        
        const LANGUAGE_STORAGE_KEY = 'reichshof_language';
        const VISUAL_RESTORE_KEY = 'reichshof_restore_visual_on_start';
        const FORCE_ORIGINAL_VISUAL_MODE = true;
        const normalizeLanguageCode = (lang) => {
            const value = String(lang || '').toLowerCase();
            if (value.startsWith('de')) return 'de';
            if (value.startsWith('en')) return 'en';
            if (value.startsWith('es')) return 'es';
            return 'de';
        };
        let currentLanguage = normalizeLanguageCode(localStorage.getItem(LANGUAGE_STORAGE_KEY) || localStorage.getItem('language') || 'de');
        let currentFontSize = parseInt(localStorage.getItem('fontSize')) || 16;
        let highContrast = localStorage.getItem('highContrast') === 'true';
        let isVoiceListening = false;
        let recognition = null;
        let currentRoom = null;
        let currentRoomNumber = null;
        let currentFloor = 1;
        let wheelchairRoute = false;
        let deferredPrompt = null;
        let backendStatusState = 'static';
        const MANUAL_COORDS_KEY = 'reichshof_manual_coords';
        const MANUAL_ROUTES_KEY = 'reichshof_manual_routes';
        const ROUTE_LOGIC_STORAGE_KEY = 'reichshof_route_logic';
        let manualRoomRoutes = {};
        let routeLogicConfig = {};
        const pdfFolder = './pdf/';
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        const isHttpContext = window.location.protocol === 'http:' || window.location.protocol === 'https:';
        const shouldProbeBackend = isHttpContext && (window.location.port === '3000' || window.location.port === '3001' || window.location.search.includes('backendProbe=1'));
        const HOTEL_LINKS = {
            stadtRestaurantPage: 'https://www.reichshof-hotel-hamburg.de/dining/stadt-restaurant/',
            stadtRestaurantMenuPdf: 'https://www.reichshof-hotel-hamburg.de/wp-content/uploads/2026/02/Stadtrestaurant-DE-Karte-Februar-2026.pdf',
            emilsPage: 'https://www.reichshof-hotel-hamburg.de/dining/emils-cafe-bistro-bar/',
            emilsFoodMenuPdf: 'https://www.reichshof-hotel-hamburg.de/wp-content/uploads/2025/12/EMILS-Food-Menu-A5_NEU.pdf',
            emilsDrinksMenuPdf: 'https://www.reichshof-hotel-hamburg.de/wp-content/uploads/2025/12/EMILS-Drinks-Menu-A4_NEU.pdf',
            afternoonTeaPdf: 'https://www.reichshof-hotel-hamburg.de/wp-content/uploads/2025/12/Afternoon-Tea-Karte-deutsch.pdf',
            bar1910Page: 'https://www.reichshof-hotel-hamburg.de/dining/bar-1910/',
            bar1910MenuPdf: 'https://www.reichshof-hotel-hamburg.de/wp-content/uploads/2025/12/Bar-1910-Karte-August-2025.pdf',
            spaPriceListPdf: 'https://www.reichshof-hotel-hamburg.de/wp-content/uploads/2025/12/Preisliste-Spa.pdf.pdf',
            vouchers: 'https://reichshofhamburg.giftpro.co.uk/vouchers/monetary-voucher/',
            clubReichshof: 'https://www.reichshof-hotel-hamburg.de/club-reichshof/',
            offers: 'https://www.reichshof-hotel-hamburg.de/offers/'
        };
        const HOUSEKEEPING_REQUESTS = [
            { id: 'towels', icon: '🧺', labelKey: 'hk_towels' },
            { id: 'water', icon: '💧', labelKey: 'hk_water' },
            { id: 'cleaning', icon: '🧹', labelKey: 'hk_cleaning' },
            { id: 'pillow', icon: '🛏️', labelKey: 'hk_pillow' },
            { id: 'toiletries', icon: '🧴', labelKey: 'hk_toiletries' },
            { id: 'coffee', icon: '☕', labelKey: 'hk_coffee' }
        ];
        const BREAKFAST_ALLERGEN_FILTERS = [
            { id: 'all', icon: '🍽️', labelKey: 'allergen_all' },
            { id: 'gluten', icon: '🥨', labelKey: 'allergen_without_gluten' },
            { id: 'lactose', icon: '🥛', labelKey: 'allergen_without_lactose' },
            { id: 'nuts', icon: '🥜', labelKey: 'allergen_without_nuts' },
            { id: 'eggs', icon: '🥚', labelKey: 'allergen_without_eggs' }
        ];
        const BREAKFAST_DISHES = [
            { nameKey: 'dish_scrambled_eggs', icon: '🍳', allergens: ['eggs'] },
            { nameKey: 'dish_bread_rolls', icon: '🥖', allergens: ['gluten'] },
            { nameKey: 'dish_muesli', icon: '🥣', allergens: ['gluten', 'nuts'] },
            { nameKey: 'dish_yogurt', icon: '🥛', allergens: ['lactose'] },
            { nameKey: 'dish_fruit_salad', icon: '🍎', allergens: [] },
            { nameKey: 'dish_salmon_plate', icon: '🐟', allergens: [] }
        ];
        const HISTORY_POIS = {
            langer_memorial: {
                floor: 0,
                location: 'Zwischengeschoss · oberer Treppenabsatz',
                message: 'Route zur Gründer-Gedenktafel geladen.'
            },
            reichshof_book: {
                floor: 0,
                location: 'Lobby · Front Office / Marketplace-Regal',
                message: 'Route zum Reichshof-Buch im Marketplace geladen.'
            }
        };
        const FEATURE_TEXTS = {
            de: {
                nav_housekeeping: 'Hausservice', nav_breakfast: 'Frühstück', nav_history: 'Historie',
                housekeeping_title: 'Housekeeping & Hilfe', housekeeping_intro: 'Service-Anfragen ohne Sprachbarriere: Tippen Sie einfach auf den gewünschten Service.',
                housekeeping_status_default: 'Bitte wählen Sie einen Service aus.', housekeeping_feedback: 'Feedback / Trinkgeld',
                hk_towels: 'Zusätzliche Handtücher', hk_water: 'Wasserflaschen', hk_cleaning: 'Zimmerreinigung', hk_pillow: 'Extra Kissen', hk_toiletries: 'Shampoo / Duschgel', hk_coffee: 'Kaffee / Tee',
                breakfast_title: 'Frühstücks-Ampel & Allergen-Karte', breakfast_ampel_title: 'Frühstücks-Ampel (Uhrzeiten)',
                ampel_1: 'Sehr entspannt', ampel_2: 'Moderate Auslastung', ampel_3: 'Stoßzeit (Wartezeit möglich)', ampel_4: 'Gemütlicher Ausklang',
                allergen_title: 'Allergen-Karte (visuell + Filter)', allergen_note: 'Hinweis: Bei starker Unverträglichkeit bitte zusätzlich unser F&B-Team ansprechen.',
                allergen_all: 'Alle', allergen_without_gluten: 'Ohne Gluten', allergen_without_lactose: 'Ohne Laktose', allergen_without_nuts: 'Ohne Nüsse', allergen_without_eggs: 'Ohne Eier',
                dish_scrambled_eggs: 'Rührei', dish_bread_rolls: 'Brot & Brötchen', dish_muesli: 'Müsli', dish_yogurt: 'Joghurt', dish_fruit_salad: 'Obstsalat', dish_salmon_plate: 'Lachsplatte',
                allergen_contains: 'Enthält', allergen_none_known: 'Keine bekannten Hauptallergene',
                fo_stay_title: 'FO Empfehlung: Im Haus genießen', fo_stay_text: 'Für einen entspannten Abend empfehlen wir unser In-House-Angebot statt externer Wege im HBF-Umfeld.',
                fo_stay_item_1: 'Bar 1910: historische Atmosphäre, Signature Drinks, Billard.', fo_stay_item_2: 'EMIL\'S Bar: lockere Lounge für den späten Abend.', fo_stay_item_3: 'Stadt-Restaurant: regionale Küche direkt im Haus.', fo_stay_note: 'Sicherer am Abend: kein Großstadttrubel, kurze Wege direkt zum Zimmer.',
                luggage_title: 'Gepäck-Security (Kofferraum)', luggage_item_1: 'Gepäckraum nur für autorisiertes Personal, videoüberwacht.', luggage_item_2: 'Ausgabe nur gegen Original-Ticket/Koffernummer.', luggage_item_3: 'Tipp: Foto von Koffer + Ticket direkt beim Abgeben machen.', luggage_note: 'Bei Ticketverlust: Ausgabe nur mit Ausweis zur Sicherheit aller Gäste.',
                market_title: '24h Marketplace (Kühlschrank)', market_location_label: 'Standort', market_location_text: 'Lobby gegenüber Front Office, neben dem Aufgang zu den Konferenzräumen.', market_content_label: 'Inhalt', market_content_text: 'Getränke, Snacks, Reise-Utensilien, Essentials für späte Anreisen.', market_note: 'Rund um die Uhr verfügbar – ideal bei Late Check-in oder Nachtbedarf.',
                history_title: 'Historie POI & Erlebnisorte', history_langer_title: 'Gründer-Gedenktafel', history_langer_desc: 'POI: Anton Emil Langer Gedenktafel im Zwischengeschoss (oberer Treppenabsatz).', history_langer_note: 'Ein ruhiger Moment für die Geschichte des Hauses seit 1910.', history_langer_btn: 'Auf Etagenplan anzeigen',
                history_book_title: 'Reichshof Buch', history_book_desc: 'Standort: Front Office und Marketplace-Regal.', history_book_note: 'Exklusives Buch zur Geschichte des Reichshofs – zum Lesen oder als Souvenir.', history_book_btn: 'Weg zum Marketplace',
                history_autosilo_title: 'Historisches Autosilo', history_autosilo_desc: 'Besichtigung als geführte Story-Station über Sales-/Event-Kollegen möglich.', history_autosilo_note: 'Bitte Führung am Front Office oder bei Sales anfragen.',
                housekeeping_sent_prefix: 'Anfrage gesendet', housekeeping_team_suffix: 'Unser Team kümmert sich darum.', housekeeping_feedback_sent: 'Danke für Ihr Feedback. Die Rückmeldung wurde intern weitergeleitet.',
                voice_assistant_start: 'Sprachassistent aktiv. Ich höre zu.', voice_heard_prefix: 'Gesagt',
                book_cross_sell_text: 'Möchten Sie ein Stück Reichshof mit nach Hause nehmen? Das exklusive Jubiläumsbuch zur Geschichte der Familie Langer erhalten Sie direkt bei unseren Kollegen am Front Office oder im Marketplace in der Lobby.',
                audio_route_to_memorial: 'Gehen Sie von der Lobby aus über die prachtvolle Freitreppe, circa 20 Stufen, nach oben. Oben angekommen, finden Sie auf der rechten Seite die große Ehrentafel unseres Gründers Anton Emil Langer. Hier schlägt das historische Herz unseres Hauses.',
                history_team_title: 'Unser Concierge-Team',
                history_team_text: 'Liebe Gaeste, fuer Insiderfragen oder Expertenwissen: Unser menschlicher Concierge hilft gern. Front Office, meist ganz rechts am Tresen (Beschilderung vorhanden). Ein Reichshof-Team – Respekt und Teamplay, heute wie in hundert Jahren.',
                history_team_btn: 'Front Office anrufen'
            },
            en: {
                nav_housekeeping: 'Housekeeping', nav_breakfast: 'Breakfast', nav_history: 'History',
                housekeeping_title: 'Housekeeping & Help', housekeeping_intro: 'Service requests without language barrier: just tap what you need.', housekeeping_status_default: 'Please select a service request.', housekeeping_feedback: 'Feedback / Tip',
                hk_towels: 'Extra towels', hk_water: 'Water bottles', hk_cleaning: 'Room cleaning', hk_pillow: 'Extra pillow', hk_toiletries: 'Shampoo / Shower gel', hk_coffee: 'Coffee / Tea',
                breakfast_title: 'Breakfast Traffic Light & Allergen Map', breakfast_ampel_title: 'Breakfast Traffic Light (Times)', ampel_1: 'Very relaxed', ampel_2: 'Moderate occupancy', ampel_3: 'Peak time (wait possible)', ampel_4: 'Calmer late period',
                allergen_title: 'Allergen Map (visual + filters)', allergen_note: 'Note: for severe intolerances, please also contact our F&B team.',
                allergen_all: 'All', allergen_without_gluten: 'No gluten', allergen_without_lactose: 'No lactose', allergen_without_nuts: 'No nuts', allergen_without_eggs: 'No eggs',
                dish_scrambled_eggs: 'Scrambled eggs', dish_bread_rolls: 'Bread & rolls', dish_muesli: 'Muesli', dish_yogurt: 'Yogurt', dish_fruit_salad: 'Fruit salad', dish_salmon_plate: 'Salmon platter',
                allergen_contains: 'Contains', allergen_none_known: 'No known major allergens',
                fo_stay_title: 'FO Recommendation: Stay in-house', fo_stay_text: 'For a relaxed evening we recommend our in-house options instead of external routes around the central station.', fo_stay_item_1: 'Bar 1910: historic atmosphere, signature drinks, billiards.', fo_stay_item_2: 'EMIL\'S Bar: relaxed lounge for late evenings.', fo_stay_item_3: 'Stadt Restaurant: regional cuisine inside the hotel.', fo_stay_note: 'Safer at night: no city hassle, short way back to your room.',
                luggage_title: 'Luggage Security (Storage Room)', luggage_item_1: 'Storage room is restricted to authorized staff and monitored by video.', luggage_item_2: 'Collection only with original ticket/luggage number.', luggage_item_3: 'Tip: take a photo of luggage and ticket at drop-off.', luggage_note: 'If ticket is lost: collection only with ID for guest safety.',
                market_title: '24h Marketplace (Fridge)', market_location_label: 'Location', market_location_text: 'Lobby opposite Front Office, next to conference stairway.', market_content_label: 'Content', market_content_text: 'Drinks, snacks, travel essentials, late-arrival basics.', market_note: 'Available 24/7 – ideal for late check-in or night needs.',
                history_title: 'History POI & Experience Spots', history_langer_title: 'Founder Memorial Plaque', history_langer_desc: 'POI: Anton Emil Langer memorial plaque in mezzanine (top landing).', history_langer_note: 'A quiet moment with the hotel history since 1910.', history_langer_btn: 'Show on floor plan',
                history_book_title: 'Reichshof Book', history_book_desc: 'Location: Front Office and Marketplace shelf.', history_book_note: 'Exclusive Reichshof history book – read or buy as souvenir.', history_book_btn: 'Route to marketplace',
                history_autosilo_title: 'Historic Car Silo', history_autosilo_desc: 'Guided visit possible via Sales/Event colleagues.', history_autosilo_note: 'Please request guidance at Front Office or Sales.',
                housekeeping_sent_prefix: 'Request sent', housekeeping_team_suffix: 'Our team is taking care of it.', housekeeping_feedback_sent: 'Thanks for your feedback. It has been forwarded internally.',
                voice_assistant_start: 'Voice assistant active. I am listening.', voice_heard_prefix: 'Heard',
                book_cross_sell_text: 'Would you like to take a piece of Reichshof home? The exclusive anniversary book on the Langer family history is available directly from our colleagues at the Front Office or in the Marketplace in the lobby.',
                audio_route_to_memorial: 'From the lobby, go up the magnificent staircase, about 20 steps. At the top, you will find the large memorial plaque of our founder Anton Emil Langer on the right side. This is where the historic heart of our house beats.',
                history_team_title: 'Our Concierge Team',
                history_team_text: 'Dear guest, for insider questions or expert knowledge, our human concierge is happy to help. Front Office, usually far right at the counter (signage available). One Reichshof team - respect and teamwork, today and in a hundred years.',
                history_team_btn: 'Call Front Office'
            },
            es: {
                nav_housekeeping: 'Housekeeping', nav_breakfast: 'Desayuno', nav_history: 'Historia',
                housekeeping_title: 'Housekeeping y ayuda', housekeeping_intro: 'Solicitudes de servicio sin barrera de idioma: toque lo que necesita.', housekeeping_status_default: 'Seleccione una solicitud de servicio.', housekeeping_feedback: 'Feedback / Propina',
                hk_towels: 'Toallas extra', hk_water: 'Botellas de agua', hk_cleaning: 'Limpieza de habitación', hk_pillow: 'Almohada extra', hk_toiletries: 'Champú / Gel de ducha', hk_coffee: 'Café / Té',
                breakfast_title: 'Semáforo de desayuno y mapa de alérgenos', breakfast_ampel_title: 'Semáforo de desayuno (horarios)', ampel_1: 'Muy tranquilo', ampel_2: 'Ocupación moderada', ampel_3: 'Hora punta (posible espera)', ampel_4: 'Tramo final más tranquilo',
                allergen_title: 'Mapa de alérgenos (visual + filtros)', allergen_note: 'Nota: en caso de intolerancias severas, contacte también a nuestro equipo F&B.',
                allergen_all: 'Todos', allergen_without_gluten: 'Sin gluten', allergen_without_lactose: 'Sin lactosa', allergen_without_nuts: 'Sin frutos secos', allergen_without_eggs: 'Sin huevo',
                dish_scrambled_eggs: 'Huevos revueltos', dish_bread_rolls: 'Pan y bollos', dish_muesli: 'Muesli', dish_yogurt: 'Yogur', dish_fruit_salad: 'Ensalada de frutas', dish_salmon_plate: 'Plato de salmón',
                allergen_contains: 'Contiene', allergen_none_known: 'Sin alérgenos principales conocidos',
                fo_stay_title: 'Recomendación FO: Quédese en el hotel', fo_stay_text: 'Para una noche relajada recomendamos opciones internas en lugar de salir al entorno de la estación central.', fo_stay_item_1: 'Bar 1910: ambiente histórico, cócteles de autor, billar.', fo_stay_item_2: 'Bar EMIL\'S: lounge relajado para la noche.', fo_stay_item_3: 'Stadt Restaurant: cocina regional dentro del hotel.', fo_stay_note: 'Más seguro por la noche: menos ruido urbano y vuelta corta a la habitación.',
                luggage_title: 'Seguridad de equipaje (almacén)', luggage_item_1: 'El almacén es solo para personal autorizado y con videovigilancia.', luggage_item_2: 'Entrega solo con ticket original/número de equipaje.', luggage_item_3: 'Consejo: haga una foto del equipaje y del ticket al dejarlo.', luggage_note: 'Si pierde el ticket: entrega solo con identificación por seguridad.',
                market_title: 'Marketplace 24h (frigorífico)', market_location_label: 'Ubicación', market_location_text: 'Lobby frente a Front Office, junto a la subida de conferencias.', market_content_label: 'Contenido', market_content_text: 'Bebidas, snacks, artículos de viaje y básicos para llegadas tardías.', market_note: 'Disponible 24/7: ideal para check-in tardío o necesidades nocturnas.',
                history_title: 'POI histórico y puntos de experiencia', history_langer_title: 'Placa conmemorativa del fundador', history_langer_desc: 'POI: placa de Anton Emil Langer en entresuelo (descanso superior).', history_langer_note: 'Un momento tranquilo para la historia del hotel desde 1910.', history_langer_btn: 'Mostrar en plano',
                history_book_title: 'Libro Reichshof', history_book_desc: 'Ubicación: Front Office y estante del marketplace.', history_book_note: 'Libro exclusivo de la historia Reichshof: para leer o comprar.', history_book_btn: 'Ruta al marketplace',
                history_autosilo_title: 'Autosilo histórico', history_autosilo_desc: 'Visita guiada posible con colegas de Sales/Event.', history_autosilo_note: 'Solicite la visita en Front Office o Sales.',
                housekeeping_sent_prefix: 'Solicitud enviada', housekeeping_team_suffix: 'Nuestro equipo ya se encarga.', housekeeping_feedback_sent: 'Gracias por su feedback. Se ha enviado internamente.',
                voice_assistant_start: 'Asistente de voz activo. Estoy escuchando.', voice_heard_prefix: 'Dicho',
                book_cross_sell_text: '¿Desea llevarse un pedazo de Reichshof a casa? El libro exclusivo del aniversario sobre la historia de la familia Langer está disponible directamente con nuestros colegas en el Front Office o en el Marketplace en el lobby.',
                audio_route_to_memorial: 'Desde el lobby, suba por la magnífica escalera, aproximadamente 20 escalones. En la parte superior, encontrará la gran placa conmemorativa de nuestro fundador Anton Emil Langer en el lado derecho. Aquí late el corazón histórico de nuestra casa.',
                history_team_title: 'Nuestro equipo de concierge',
                history_team_text: 'Estimado huesped, para preguntas de insider o conocimiento experto, nuestro concierge humano ayuda con gusto. Front Office, normalmente al extremo derecho del mostrador (hay senalizacion). Un solo equipo Reichshof: respeto y trabajo en equipo, hoy y dentro de cien anos.',
                history_team_btn: 'Llamar a Front Office'
            }
        };

        function fxText(key) {
            const langPack = FEATURE_TEXTS[currentLanguage] || FEATURE_TEXTS.de;
            return langPack[key] || FEATURE_TEXTS.de[key] || key;
        }
        const SOS_PLAN_BACKEND_BASE = window.SOS_PLAN_BACKEND_BASE || localStorage.getItem('sosPlanBackendBase') || 'https://tvoj-backend.com/';
        
        // ============================================
        // ROOM DATABASE – FALLBACK (HARDCODED)
        // ============================================
        window.roomsDatabase = {
            "212": { floor: "2", oldNumber: "200", category: "Accessible Medium Room", bedType: "King bed", accessible: true, navigation: { de: "Von der Rezeption: Hauptfahrstuhl zum 2. OG. Beim Verlassen rechts, erste Tür links.", en: "From reception: Main elevator to 2nd floor, right, first door left.", es: "Desde recepción: Ascensor principal al 2º piso, derecha, primera puerta izquierda." } },
            "218": { floor: "2", oldNumber: "217", category: "Accessible Medium Room", bedType: "King bed", accessible: true, navigation: { de: "Von Rezeption → Hauptlift 2.OG → bis Ende Flur → rechts (SPA Lift) → links → erste Tür links.", en: "From reception → main elevator 2nd floor → end of corridor → right (SPA elevator) → left → first door left.", es: "Desde recepción → ascensor principal 2º piso → final pasillo → derecha (ascensor SPA) → izquierda → primera puerta izquierda." } },
            "318": { floor: "3", oldNumber: "317", category: "Accessible Medium Room", bedType: "King bed", accessible: true, navigation: { de: "Von Rezeption → Hauptlift 3.OG → Zimmerkarte halten → bis Ende Flur → rechts (SPA Lift) → links → erste Tür links.", en: "From reception → main elevator 3rd floor → hold room card → end of corridor → right (SPA elevator) → left → first door left.", es: "Desde recepción → ascensor principal 3ª planta → mantener tarjeta → final pasillo → derecha (ascensor SPA) → izquierda → primera puerta izquierda." } },
            "327": { floor: "3", oldNumber: "325", category: "Medium Room", bedType: "King bed", accessible: false, navigation: { de: "Aus Fahrstuhl Lobby → rechts → bis Ende Flurabschnitt → bei Zimmer 317 rechts (SPA Aufzug) → 3m links → Zimmer 327.", en: "From lobby elevator → right → to end of corridor → at Room 317 right (SPA elevator) → 3m left → Room 327.", es: "Desde ascensor lobby → derecha → final pasillo → en Habitación 317 derecha (ascensor SPA) → 3m izquierda → Habitación 327." } },
            "411": { floor: "4", oldNumber: "409", category: "Medium Room", bedType: "King bed", accessible: false, navigation: { de: "Von Rezeption → Hauptlift 4.OG → rechts aus Fahrstuhl → durch Brandschutztür → Flur 8m → Zimmer 411 rechts.", en: "From reception → main elevator 4th floor → right → through fire door → corridor 8m → Room 411 right.", es: "Desde recepción → ascensor principal 4ª planta → derecha → puerta incendios → pasillo 8m → Habitación 411 derecha." } }
        };
        window.roomMapping = { "200":"212", "217":"218", "317":"318", "325":"327", "409":"411" };
        
        // ============================================
        // ROOM MANAGER – LÄDT KOORDINATEN AUS JSON
        // ============================================
        const roomManager = (function(){
            const self = {
                rooms: {},
                getManualCoords() {
                    try {
                        return JSON.parse(localStorage.getItem(MANUAL_COORDS_KEY) || '{}');
                    } catch (_) {
                        return {};
                    }
                },
                setManualCoords(roomNumber, x, y) {
                    const all = this.getManualCoords();
                    all[String(roomNumber)] = { x: Number(x), y: Number(y) };
                    localStorage.setItem(MANUAL_COORDS_KEY, JSON.stringify(all));
                },
                clearManualCoords(roomNumber) {
                    const all = this.getManualCoords();
                    delete all[String(roomNumber)];
                    localStorage.setItem(MANUAL_COORDS_KEY, JSON.stringify(all));
                },
                async loadRooms() {
                    if (!isHttpContext) {
                        this.rooms = window.roomsDatabase;
                        console.info('roomManager: file:// context detected, using embedded roomsDatabase');
                        return;
                    }
                    const candidates = ['rooms-updated.json', 'rooms-with-coords-preview.json', 'rooms-normalized.json'];
                    let loaded = null;
                    for (const c of candidates) {
                        try {
                            const resp = await fetch(c);
                            if (!resp.ok) continue;
                            const json = await resp.json();
                            loaded = { file: c, json };
                            break;
                        } catch (e) {
                            console.warn('roomManager: failed to fetch', c, e);
                        }
                    }
                    if (loaded && loaded.json) {
                        this.rooms = loaded.json;
                        window.roomsDatabase = this.rooms;
                        console.log('✅ roomManager: loaded rooms from', loaded.file);
                    } else {
                        console.warn('⚠️ roomManager: using embedded roomsDatabase (hardcoded)');
                        this.rooms = window.roomsDatabase;
                    }
                },
                getRoomPosition(roomNumber) {
                    if (!roomNumber) return null;
                    const manual = this.getManualCoords()[String(roomNumber)];
                    if (manual && typeof manual.x === 'number' && typeof manual.y === 'number') {
                        return { x: manual.x, y: manual.y, source: 'manual' };
                    }
                    const r = this.rooms[roomNumber] || Object.values(this.rooms).find(x => String(x.roomNumber) === String(roomNumber) || String(x.id) === String(roomNumber));
                    if (!r) return null;
                    if (typeof r.x === 'number' && typeof r.y === 'number') return { x: r.x, y: r.y, source: 'auto' };
                    return null;
                },
                getSvgForFloor(floor) {
                    if (floor === undefined || floor === null) return '1og.svg';
                    const fRaw = String(floor).replace('.', '').trim();
                    const f = fRaw.toLowerCase();
                    if (['mz','mezzanine','zg','eg','g','ground','0'].includes(f)) return 'zg.svg';
                    return `${fRaw}og.svg`;
                },
                findRoom(q) {
                    if (!q) return null;
                    q = String(q).trim();
                    if (this.rooms[q]) return this.rooms[q];
                    return Object.values(this.rooms).find(r => (r.altIds||[]).includes(q) || String(r.roomNumber) === q || String(r.id) === q) || null;
                }
            };
            window.roomManager = self;
            return self;
        })();
        
        // ============================================
        // VOLLSTÄNDIGE ÜBERSETZUNGEN (DE/EN/ES)
        // ============================================
        const translations = {
            de: {
                // Navigation
                nav_home: 'Start',
                nav_hotel_info: 'Hotelinfo',
                nav_room_search: 'Zimmersuche',
                nav_floor_plans: 'Grundrisse',
                nav_accessibility: 'Barrierefrei',
                nav_emergency: 'Notfall',
                nav_qr_codes: 'QR-Codes',
                nav_gallery: 'Galerie',
                
                // Header & Suche
                brand_name: 'Reichshof Hamburg',
                brand_sub: 'Digital Concierge v3.0.0',
                skip_to_content: 'Zum Hauptinhalt springen',
                offline_mode: 'Offline-Modus - Daten werden aus dem Cache geladen',
                search_placeholder: 'Zimmernummer eingeben...',
                find_room: 'ZIMMER FINDEN',
                show_examples: 'BEISPIELE ANZEIGEN',
                search_initial_hint: 'Geben Sie eine Zimmernummer ein, um Informationen und Navigationsanleitung zu erhalten.',
                
                // Accessibility Toolbar
                a11y_read: 'Vorlesen',
                a11y_bluefilter: 'Blaufilter',
                a11y_reset: 'Reset',
                visual_restore_title: 'Visuelle Einstellungen beim Start wiederherstellen',
                visual_restore_on: 'Auto-Restore: EIN',
                visual_restore_off: 'Auto-Restore: AUS',
                
                // Home
                home_welcome: 'Willkommen im Reichshof Hamburg',
                home_subtitle: 'Ihr digitaler Concierge für barrierefreie Navigation und Information',
                card_find_room_title: 'Zimmer finden',
                card_find_room_text: 'Schnelle Suche mit neuer oder alter Zimmernummer. Voice Assistant in 3 Sprachen verfügbar.',
                card_hotel_info_title: 'Hotelinformationen',
                card_hotel_info_text: 'Alle Bereiche des Hotels: Bar 1910, Restaurant, SPA, Konferenzräume und mehr.',
                card_accessibility_title: 'Barrierefreiheit',
                card_accessibility_text: 'Detaillierte Informationen zu barrierefreien Zimmern (212, 218, 318) und Zugängen.',
                card_qr_title: 'QR-Code System',
                card_qr_text: 'Microsite QR-Codes für direkten Zugriff auf wichtige Informationen im Hotel.',
                manifesto_title: '„Dieses System ist für alle da.“',
                manifesto_line_1: 'Für Gäste, die ihren Weg schnell finden wollen.',
                manifesto_line_2: 'Für Menschen, die nicht fragen möchten.',
                manifesto_line_3: 'Für Menschen, die nicht fragen können.',
                manifesto_line_4: 'Auch für Systeme, die Unterstützung brauchen.',
                manifesto_line_5: 'Niemand soll hier verloren gehen.',
                system_message: 'Dieses System ist für alle da. Niemand soll hier verloren gehen.',
                
                // Hotel Informationen
                hotel_areas_title: 'Hotelbereiche & Informationen',
                more_info: 'Mehr Informationen',
                bar1910_title: 'Bar 1910',
                bar1910_description: 'Original-Art-Déco-Bar mit Sommerpause vom 28.07.–03.09.2025. Geöffnet Di–Sa: 18:00–01:00.',
                bar1910_alt: 'Historische Bar 1910 im Art-Déco-Stil mit Holztresen und gemütlicher Beleuchtung',
                emils_title: 'EMIL\'S Bistro, Café & Bar',
                emils_description: 'Täglich von 9–0 Uhr. Genießen Sie hausgemachte Kuchen, Kaffee, Snacks und Afternoon Tea.',
                emils_alt: 'EMIL\'S Bistro mit modernen Sitzgelegenheiten und Tischen in der Hotel-Lobby',
                restaurant_title: 'Stadt-Restaurant',
                restaurant_description: 'Tradition trifft Moderne: Frühstück, Events und Abendbetrieb. Barrierefreier Zugang durch die Lobby.',
                restaurant_alt: 'Stadt-Restaurant mit eleganten Tischen, Stühlen und moderner Einrichtung',
                spa_title: 'SPA & Gym',
                spa_description: 'Fitnessstudio 24/7 geöffnet. Sauna täglich 16–22 Uhr (€10). Zugang über SPA-Fahrstuhl.',
                spa_alt: 'Modernes Fitnessstudio mit Cardiogeräten und freien Gewichten',
                
                // Room Search & Navigation
                room_found: 'Zimmer gefunden',
                room_not_found: 'Zimmer nicht gefunden',
                floor: 'Etage',
                fridge: 'Minibar',
                view: 'Aussicht',
                bed: 'Bett',
                door_width: 'Türbreite',
                bath: 'Bad',
                turning_circle: 'Bewegungsfläche',
                emergency_system: 'Notrufsystem',
                navigation: 'Navigations-Anleitung',
                
                // Room numbers & details
                room_212: 'Zimmer 212',
                room_212_full: 'Zimmer 212 (2. OG)',
                room_212_short: 'Zimmer 212',
                room_212_desc: '2. OG, barrierefrei',
                navigate_to_212: 'Navigation zu Zimmer 212',
                bath_212: 'Unterfahrbares Waschbecken',
                turning_circle_150: '150 cm Wendekreis',
                
                room_218: 'Zimmer 218',
                room_218_full: 'Zimmer 218 (2. OG)',
                room_218_short: 'Zimmer 218',
                room_218_desc: '2. OG, barrierefrei',
                navigate_to_218: 'Navigation zu Zimmer 218',
                bath_218: 'Duschstuhl, Haltegriffe',
                bed_218: 'Höhe 50 cm',
                
                room_318: 'Zimmer 318',
                room_318_full: 'Zimmer 318 (3. OG)',
                room_318_short: 'Zimmer 318',
                room_318_desc: '3. OG, barrierefrei',
                navigate_to_318: 'Navigation zu Zimmer 318',
                bath_318: 'Bodengleiche Dusche, Haltegriffe',
                bed_318: 'Höhe 55 cm, elektrisch verstellbar',
                door_90cm: '90 cm',
                
                room_327: 'Zimmer 327',
                room_411: 'Zimmer 411',
                
                // Emergency badges
                emergency_pull_cord: 'Notruf: Zugleine',
                emergency_bed_button: 'Bett-Alarm',
                emergency_visual_alarm: 'Visueller Alarm',
                
                // Emergency section
                emergency_title: 'Notfall & Sicherheit',
                emergency_flashing_title: 'Blinkender Alarm',
                emergency_flashing_desc: 'Optisches Signal vor Zimmern 212, 218, 318 bei Notfall.',
                emergency_pullcord_title: 'Bad-Zugleine',
                emergency_pullcord_desc: '24/7 Notruf. Tür wird automatisch für Rettungskräfte entriegelt.',
                emergency_numbers_title: 'Notrufnummern',
                emergency_numbers_desc: 'Rezeption: 156<br>Haustechnik: 770<br>Notruf: 112',
                emergency_note_title: 'Wichtiger Hinweis',
                fire_department: 'Feuerwehr:',
                fire_department_time: 'In ca. 10 Min vor Ort.',
                fire_doors: 'Brandschutztüren schließen automatisch.',
                smoking_ban: 'Rauchen verboten',
                smoking_ban_desc: 'im gesamten Hotel (Hohe Strafkosten).',
                evacuation: 'Evakuierung:',
                evacuation_point: 'Sammelpunkt vor dem Haupteingang.',
                
                // Floor plans
                floor_plans_title: 'Grundrisse & Etagenpläne',
                floor_eg: 'EG',
                floor_1og: '1. OG',
                floor_2og: '2. OG',
                floor_3og: '3. OG',
                floor_4og: '4. OG',
                floor_5og: '5. OG',
                floor_6og: '6. OG',
                floor_plan_placeholder_title: 'Etagenplan wählen',
                floor_plan_placeholder_text: 'Wählen Sie eine Etage aus, um den Grundriss anzuzeigen.',
                floor_plan_hint_title: 'Hinweis',
                floor_plan_hint_text: 'Klicken Sie auf ein Zimmer im Grundriss, um direkt zur Zimmersuche zu springen.',
                
                // Lift guide
                lift_guide_title: 'Lift-Guide',
                spa_elevator: 'SPA-Aufzug (110cm):',
                spa_elevator_desc: 'Voll barrierefrei zu allen Etagen und SPA.',
                th9_elevator: 'TH9 Historisch (70cm):',
                th9_elevator_desc: 'Zu schmal für Rollstühle. Historischer Aufzug.',
                elevator_operation: 'Bedienung:',
                elevator_operation_desc: 'Zimmerkarte für Etagen ab 2. OG erforderlich.',
                
                // Accessibility page
                accessibility_title: 'Barrierefreiheit',
                accessible_rooms_title: 'Barrierefreie Zimmer:',
                
                // QR codes
                qr_title: 'QR-Code Navigation',
                qr_intro: 'Alle wichtigen Informationen auf einen Blick. Nutzen Sie die QR-Codes im Hotel für direkten Zugriff.',
                qr_generator_title: 'QR-Code Generator',
                qr_generator_desc: 'Generieren Sie einen QR-Code für ein spezifisches Zimmer.',
                qr_room_placeholder: 'Zimmernummer',
                qr_generate: 'QR-Code generieren',
                qr_online_ready: 'Online-Modus – QR bereit',
                restaurant_short: 'Restaurant',
                restaurant_access_desc: 'Barrierefreier Zugang',
                spa_short: 'SPA & Fitness',
                spa_access_desc: 'Zugang über Aufzug',
                emergency_info_short: 'Notfallinformation',
                emergency_info_desc: 'Evakuierungsplan',
                accessible_wc_short: 'Barrierefreie WC',
                accessible_wc_desc: 'EG, neben Rezeption',
                floor_plan_eg_short: 'Lageplan EG',
                floor_plan_eg_desc: 'Barrierefreie Wege',
                
                // Gallery
                gallery_title: 'Fotogalerie',
                gallery_all: 'Alle',
                gallery_lobby: 'Lobby',
                gallery_rooms: 'Zimmer',
                gallery_restaurant: 'Restaurant',
                gallery_spa: 'SPA',
                gallery_conference: 'Konferenz',
                gallery_lobby_alt: 'Panoramafoto der Lobby mit Rezeption, Sitzbereichen und Zugang zum Restaurant',
                gallery_restaurant_alt: 'Blick auf das Stadt-Restaurant von der Lobby aus',
                gallery_room_alt: 'Modernes Hotelzimmer mit komfortabler Einrichtung',
                gallery_spa_alt: 'Modernes Fitnessstudio mit verschiedenen Trainingsgeräten',
                gallery_conference_alt: 'Moderner Konferenzraum mit Tischen und Stühlen',
                gallery_bar1910_alt: 'Historische Bar 1910 im Art-Déco-Stil',
                
                // Footer
                footer_accessibility: 'Barrierefreiheit',
                footer_emergency: 'Notfall',
                footer_qr: 'QR-Codes',
                footer_reception: '📞 Rezeption: +49 40 370 2590',
                footer_copyright: '© 2026 Reichshof Hamburg | Digital Concierge v3.0.0',
                online: '● Online – System aktiv',
                offline: '● Offline – keine Verbindung',
                enable_push: 'Push-Dienste aktivieren',
                wcag_statement: 'WCAG 2.1 AA konform | Barrierefreiheit ab 28.06.2025 verpflichtend',
                
                // Voice settings
                voice_settings: 'Stimmeinstellungen',
                voice_settings_title: 'Stimmeinstellungen',
                voice_settings_desc: 'Wählen Sie bevorzugte Stimmen für jede Sprache.',
                voice_preview: 'Vorschau',
                voice_save: 'Speichern',
                voice_close: 'Schliessen',
                voice_saved: 'Einstellungen gespeichert',
                voice_save_error: 'Fehler beim Speichern',
                language_de: 'Deutsch',
                language_en: 'English',
                language_es: 'Español',
                speech_started: 'Sprachausgabe startet',
                speech_stopped: 'Sprachausgabe beendet',
                
                // WCAG toolbar
                increase_font: 'Schriftgröße erhöhen',
                decrease_font: 'Schriftgröße verringern',
                reset_font: 'Schriftgröße zurücksetzen',
                speak_title: 'Seitentitel vorlesen',
                voice_assistant_label: 'Sprachassistent aktivieren',
                
                // Messages
                loading: 'Laden...',
                local_mode_notice: 'Lokaler Dateimodus erkannt – Online-Funktionen (API, Service Worker) sind eingeschränkt.',
                high_contrast_on: 'Hoher Kontrast aktiviert',
                high_contrast_off: 'Hoher Kontrast deaktiviert',
                blue_filter_on: 'Blaufilter aktiviert',
                blue_filter_off: 'Blaufilter deaktiviert',
                font_increased: 'Schriftgröße erhöht',
                font_decreased: 'Schriftgröße verringert',
                font_reset: 'Schriftgröße zurückgesetzt',
                accessibility_reset_done: 'Alle Barrierefreiheitseinstellungen zurückgesetzt',
                manual_marker_set: 'Manueller Marker gespeichert',
                manual_marker_missing: 'Keine manuellen Marker vorhanden',
                manual_marker_cleared: 'Manueller Marker entfernt',
                voice_listening: 'Höre zu... Sprechen Sie jetzt',
                voice_stopped: 'Spracherkennung gestoppt',
                voice_not_supported: 'Spracherkennung nicht unterstützt',
                welcome: 'Willkommen beim Reichshof Concierge!',
                
                // Routes and templates
                routes: {
                    mainElevator: 'Hauptfahrstuhl nutzen (Zimmerkarte erforderlich).',
                    spaElevator: 'Nutzen Sie den SPA-Aufzug für Ebene -1.',
                    th9Note: 'Achtung: Historischer Lift (TH9) nicht rollstuhlgerecht!'
                },
                templates: {
                    generic: 'Vom Empfang folgen Sie den Schildern zum Aufzug. Nehmen Sie den Aufzug auf die gewünschte Etage und folgen Sie der Beschilderung zum Zimmer.',
                    spa: 'Für den SPA-Bereich nutzen Sie bitte den SPA-Aufzug zum Untergeschoss (-1).'
                },
                
                // Analytics
                analytics_title: 'Nutzung & Analytics',
                close: 'Schließen'
            },
            en: {
                // Navigation
                nav_home: 'Home',
                nav_hotel_info: 'Hotel Info',
                nav_room_search: 'Room Search',
                nav_floor_plans: 'Floor Plans',
                nav_accessibility: 'Accessibility',
                nav_emergency: 'Emergency',
                nav_qr_codes: 'QR Codes',
                nav_gallery: 'Gallery',
                
                // Header & Search
                brand_name: 'Reichshof Hamburg',
                brand_sub: 'Digital Concierge v3.0.0',
                skip_to_content: 'Skip to main content',
                offline_mode: 'Offline mode - Data loaded from cache',
                search_placeholder: 'Enter room number...',
                find_room: 'FIND ROOM',
                show_examples: 'SHOW EXAMPLES',
                search_initial_hint: 'Enter a room number to get information and navigation instructions.',
                
                // Accessibility Toolbar
                a11y_read: 'Read aloud',
                a11y_bluefilter: 'Blue filter',
                a11y_reset: 'Reset',
                visual_restore_title: 'Restore visual settings on startup',
                visual_restore_on: 'Auto-Restore: ON',
                visual_restore_off: 'Auto-Restore: OFF',
                
                // Home
                home_welcome: 'Welcome to Reichshof Hamburg',
                home_subtitle: 'Your digital concierge for accessible navigation and information',
                card_find_room_title: 'Find Room',
                card_find_room_text: 'Quick search with new or old room number. Voice Assistant available in 3 languages.',
                card_hotel_info_title: 'Hotel Information',
                card_hotel_info_text: 'All hotel areas: Bar 1910, Restaurant, SPA, Conference rooms and more.',
                card_accessibility_title: 'Accessibility',
                card_accessibility_text: 'Detailed information about accessible rooms (212, 218, 318) and entrances.',
                card_qr_title: 'QR Code System',
                card_qr_text: 'Microsite QR codes for direct access to important hotel information.',
                manifesto_title: '“This system is for everyone.”',
                manifesto_line_1: 'For guests who want to find their way quickly.',
                manifesto_line_2: 'For people who do not want to ask.',
                manifesto_line_3: 'For people who cannot ask.',
                manifesto_line_4: 'Also for systems that need support.',
                manifesto_line_5: 'No one should get lost here.',
                system_message: 'This system is for everyone. No one should get lost here.',
                
                // Hotel Information
                hotel_areas_title: 'Hotel Areas & Information',
                more_info: 'More Information',
                bar1910_title: 'Bar 1910',
                bar1910_description: 'Original Art Déco bar, closed during summer from 28.07.–03.09.2025. Open Tue–Sat: 6 PM – 1 AM.',
                bar1910_alt: 'Historic Bar 1910 in Art Déco style with wooden counter and cozy lighting',
                emils_title: 'EMIL\'S Bistro, Café & Bar',
                emils_description: 'Daily from 9 AM to 12 AM. Enjoy homemade cakes, coffee, snacks and afternoon tea.',
                emils_alt: 'EMIL\'S Bistro with modern seating and tables in the hotel lobby',
                restaurant_title: 'Stadt-Restaurant',
                restaurant_description: 'Tradition meets modernity: breakfast, events and evening dining. Barrier-free access through the lobby.',
                restaurant_alt: 'Stadt-Restaurant with elegant tables, chairs and modern interior',
                spa_title: 'SPA & Gym',
                spa_description: 'Fitness studio open 24/7. Sauna daily 4–10 PM (€10). Access via SPA elevator.',
                spa_alt: 'Modern fitness studio with cardio equipment and free weights',
                
                // Room Search & Navigation
                room_found: 'Room found',
                room_not_found: 'Room not found',
                floor: 'Floor',
                fridge: 'Minibar',
                view: 'View',
                bed: 'Bed',
                door_width: 'Door width',
                bath: 'Bath',
                turning_circle: 'Turning circle',
                emergency_system: 'Emergency system',
                navigation: 'Navigation',
                
                // Room numbers & details
                room_212: 'Room 212',
                room_212_full: 'Room 212 (2nd floor)',
                room_212_short: 'Room 212',
                room_212_desc: '2nd floor, accessible',
                navigate_to_212: 'Navigate to Room 212',
                bath_212: 'Wheelchair-accessible sink',
                turning_circle_150: '150 cm turning circle',
                
                room_218: 'Room 218',
                room_218_full: 'Room 218 (2nd floor)',
                room_218_short: 'Room 218',
                room_218_desc: '2nd floor, accessible',
                navigate_to_218: 'Navigate to Room 218',
                bath_218: 'Shower chair, grab rails',
                bed_218: 'Height 50 cm',
                
                room_318: 'Room 318',
                room_318_full: 'Room 318 (3rd floor)',
                room_318_short: 'Room 318',
                room_318_desc: '3rd floor, accessible',
                navigate_to_318: 'Navigate to Room 318',
                bath_318: 'Ground-level shower, grab rails',
                bed_318: 'Height 55 cm, electrically adjustable',
                door_90cm: '90 cm',
                
                room_327: 'Room 327',
                room_411: 'Room 411',
                
                // Emergency badges
                emergency_pull_cord: 'Emergency: Pull cord',
                emergency_bed_button: 'Bed alarm',
                emergency_visual_alarm: 'Visual alarm',
                
                // Emergency section
                emergency_title: 'Emergency & Safety',
                emergency_flashing_title: 'Flashing alarm',
                emergency_flashing_desc: 'Visual signal outside rooms 212, 218, 318 in case of emergency.',
                emergency_pullcord_title: 'Bathroom pull cord',
                emergency_pullcord_desc: '24/7 emergency call. Door automatically unlocks for rescue forces.',
                emergency_numbers_title: 'Emergency numbers',
                emergency_numbers_desc: 'Reception: 156<br>Engineering: 770<br>Emergency: 112',
                emergency_note_title: 'Important note',
                fire_department: 'Fire department:',
                fire_department_time: 'On site within approx. 10 minutes.',
                fire_doors: 'Fire doors close automatically.',
                smoking_ban: 'Smoking prohibited',
                smoking_ban_desc: 'throughout the hotel (High penalties).',
                evacuation: 'Evacuation:',
                evacuation_point: 'Assembly point in front of the main entrance.',
                
                // Floor plans
                floor_plans_title: 'Floor Plans & Navigation',
                floor_eg: 'GF',
                floor_1og: '1st',
                floor_2og: '2nd',
                floor_3og: '3rd',
                floor_4og: '4th',
                floor_5og: '5th',
                floor_6og: '6th',
                floor_plan_placeholder_title: 'Select floor',
                floor_plan_placeholder_text: 'Select a floor to display the floor plan.',
                floor_plan_hint_title: 'Note',
                floor_plan_hint_text: 'Click on a room in the floor plan to jump directly to the room search.',
                
                // Lift guide
                lift_guide_title: 'Elevator Guide',
                spa_elevator: 'SPA elevator (110cm):',
                spa_elevator_desc: 'Fully accessible to all floors and SPA.',
                th9_elevator: 'TH9 Historic (70cm):',
                th9_elevator_desc: 'Too narrow for wheelchairs. Historic elevator.',
                elevator_operation: 'Operation:',
                elevator_operation_desc: 'Room card required for floors from 2nd floor.',
                
                // Accessibility page
                accessibility_title: 'Accessibility',
                accessible_rooms_title: 'Accessible rooms:',
                
                // QR codes
                qr_title: 'QR Code Navigation',
                qr_intro: 'All important information at a glance. Use the QR codes in the hotel for direct access.',
                qr_generator_title: 'QR Code Generator',
                qr_generator_desc: 'Generate a QR code for a specific room.',
                qr_room_placeholder: 'Room number',
                qr_generate: 'Generate QR code',
                qr_online_ready: 'Online mode - QR ready',
                restaurant_short: 'Restaurant',
                restaurant_access_desc: 'Accessible entrance',
                spa_short: 'SPA & Fitness',
                spa_access_desc: 'Access via elevator',
                emergency_info_short: 'Emergency info',
                emergency_info_desc: 'Evacuation plan',
                accessible_wc_short: 'Accessible WC',
                accessible_wc_desc: 'GF, next to reception',
                floor_plan_eg_short: 'Floor plan GF',
                floor_plan_eg_desc: 'Accessible routes',
                
                // Gallery
                gallery_title: 'Photo Gallery',
                gallery_all: 'All',
                gallery_lobby: 'Lobby',
                gallery_rooms: 'Rooms',
                gallery_restaurant: 'Restaurant',
                gallery_spa: 'SPA',
                gallery_conference: 'Conference',
                gallery_lobby_alt: 'Panoramic view of the lobby with reception, seating areas and access to the restaurant',
                gallery_restaurant_alt: 'View of the Stadt-Restaurant from the lobby',
                gallery_room_alt: 'Modern hotel room with comfortable furnishings',
                gallery_spa_alt: 'Modern fitness studio with various exercise equipment',
                gallery_conference_alt: 'Modern conference room with tables and chairs',
                gallery_bar1910_alt: 'Historic Bar 1910 in Art Déco style',
                
                // Footer
                footer_accessibility: 'Accessibility',
                footer_emergency: 'Emergency',
                footer_qr: 'QR Codes',
                footer_reception: '📞 Reception: +49 40 370 2590',
                footer_copyright: '© 2026 Reichshof Hamburg | Digital Concierge v3.0.0',
                online: '● Online',
                offline: '● Offline',
                enable_push: 'Enable push notifications',
                wcag_statement: 'WCAG 2.1 AA compliant | Accessibility mandatory from 28.06.2025',
                
                // Voice settings
                voice_settings: 'Voice settings',
                voice_settings_title: 'Voice settings',
                voice_settings_desc: 'Choose preferred voices for each language.',
                voice_preview: 'Preview',
                voice_save: 'Save',
                voice_close: 'Close',
                voice_saved: 'Settings saved',
                voice_save_error: 'Error saving settings',
                language_de: 'German',
                language_en: 'English',
                language_es: 'Spanish',
                speech_started: 'Reading started',
                speech_stopped: 'Reading finished',
                
                // WCAG toolbar
                increase_font: 'Increase font size',
                decrease_font: 'Decrease font size',
                reset_font: 'Reset font size',
                speak_title: 'Read page title aloud',
                voice_assistant_label: 'Activate voice assistant',
                
                // Messages
                loading: 'Loading...',
                local_mode_notice: 'Local file mode detected – online features (API, Service Worker) are limited.',
                high_contrast_on: 'High contrast enabled',
                high_contrast_off: 'High contrast disabled',
                blue_filter_on: 'Blue filter enabled',
                blue_filter_off: 'Blue filter disabled',
                font_increased: 'Font size increased',
                font_decreased: 'Font size decreased',
                font_reset: 'Font size reset',
                accessibility_reset_done: 'All accessibility settings reset',
                manual_marker_set: 'Manual marker saved',
                manual_marker_missing: 'No manual markers found',
                manual_marker_cleared: 'Manual marker removed',
                voice_listening: 'Listening... Speak now',
                voice_stopped: 'Voice recognition stopped',
                voice_not_supported: 'Voice recognition not supported',
                welcome: 'Welcome to Reichshof Concierge!',
                
                // Routes and templates
                routes: {
                    mainElevator: 'Use main elevator (room card required).',
                    spaElevator: 'Use SPA elevator for level -1.',
                    th9Note: 'Note: Historic lift (TH9) not wheelchair accessible!'
                },
                templates: {
                    generic: 'From reception, follow the signs to the elevator. Take the elevator to the requested floor and follow the signage to the room.',
                    spa: 'For the SPA area, please use the SPA elevator to the basement level (-1).'
                },
                
                // Analytics
                analytics_title: 'Usage & Analytics',
                close: 'Close'
            },
            es: {
                // Navigation
                nav_home: 'Inicio',
                nav_hotel_info: 'Info Hotel',
                nav_room_search: 'Buscar Habitación',
                nav_floor_plans: 'Planos',
                nav_accessibility: 'Accesibilidad',
                nav_emergency: 'Emergencia',
                nav_qr_codes: 'Códigos QR',
                nav_gallery: 'Galería',
                
                // Header & Search
                brand_name: 'Reichshof Hamburg',
                brand_sub: 'Conserje Digital v3.0.0',
                skip_to_content: 'Saltar al contenido principal',
                offline_mode: 'Modo sin conexión - Datos cargados desde caché',
                search_placeholder: 'Ingrese número de habitación...',
                find_room: 'BUSCAR HABITACIÓN',
                show_examples: 'MOSTRAR EJEMPLOS',
                search_initial_hint: 'Introduzca un número de habitación para obtener información e instrucciones de navegación.',
                
                // Accessibility Toolbar
                a11y_read: 'Leer en voz alta',
                a11y_bluefilter: 'Filtro azul',
                a11y_reset: 'Restablecer',
                visual_restore_title: 'Restaurar ajustes visuales al iniciar',
                visual_restore_on: 'Auto-Restore: SI',
                visual_restore_off: 'Auto-Restore: NO',
                
                // Home
                home_welcome: 'Bienvenido al Reichshof Hamburgo',
                home_subtitle: 'Su conserje digital para navegación e información accesible',
                card_find_room_title: 'Buscar habitación',
                card_find_room_text: 'Búsqueda rápida con número de habitación nuevo o antiguo. Asistente de voz disponible en 3 idiomas.',
                card_hotel_info_title: 'Información del hotel',
                card_hotel_info_text: 'Todas las áreas del hotel: Bar 1910, Restaurante, SPA, salas de conferencias y más.',
                card_accessibility_title: 'Accesibilidad',
                card_accessibility_text: 'Información detallada sobre habitaciones accesibles (212, 218, 318) y accesos.',
                card_qr_title: 'Sistema de Códigos QR',
                card_qr_text: 'Códigos QR de micrositio para acceso directo a información importante del hotel.',
                manifesto_title: '«Este sistema es para todos.»',
                manifesto_line_1: 'Para huéspedes que quieren encontrar su camino rápidamente.',
                manifesto_line_2: 'Para personas que no quieren preguntar.',
                manifesto_line_3: 'Para personas que no pueden preguntar.',
                manifesto_line_4: 'También para sistemas que necesitan apoyo.',
                manifesto_line_5: 'Nadie debería perderse aquí.',
                system_message: 'Este sistema es para todos. Nadie debería perderse aquí.',
                
                // Hotel Information
                hotel_areas_title: 'Áreas del Hotel e Información',
                more_info: 'Más información',
                bar1910_title: 'Bar 1910',
                bar1910_description: 'Bar original Art Déco, cerrado del 28.07.–03.09.2025. Abierto de mar a sáb: 18:00–01:00.',
                bar1910_alt: 'Bar histórico 1910 en estilo Art Déco con mostrador de madera e iluminación acogedora',
                emils_title: 'EMIL\'S Bistro, Café & Bar',
                emils_description: 'Abierto de 9 a 0 horas. Disfrute de pasteles caseros, café, aperitivos y té de la tarde.',
                emils_alt: 'EMIL\'S Bistro con asientos modernos y mesas en el vestíbulo del hotel',
                restaurant_title: 'Stadt-Restaurant',
                restaurant_description: 'Tradición y modernidad: desayuno, eventos y cenas. Acceso accesible a través del vestíbulo.',
                restaurant_alt: 'Stadt-Restaurant con mesas elegantes, sillas e interior moderno',
                spa_title: 'SPA & Gimnasio',
                spa_description: 'Gimnasio abierto 24/7. Sauna todos los días de 16 a 22 h (€10). Acceso por ascensor SPA.',
                spa_alt: 'Gimnasio moderno con equipos cardiovasculares y pesas libres',
                
                // Room Search & Navigation
                room_found: 'Habitación encontrada',
                room_not_found: 'Habitación no encontrada',
                floor: 'Planta',
                fridge: 'Minibar',
                view: 'Vista',
                bed: 'Cama',
                door_width: 'Ancho de puerta',
                bath: 'Baño',
                turning_circle: 'Espacio de maniobra',
                emergency_system: 'Sistema de emergencia',
                navigation: 'Navegación',
                
                // Room numbers & details
                room_212: 'Habitación 212',
                room_212_full: 'Habitación 212 (2ª planta)',
                room_212_short: 'Habitación 212',
                room_212_desc: '2ª planta, accesible',
                navigate_to_212: 'Navegar a Habitación 212',
                bath_212: 'Lavabo accesible para sillas de ruedas',
                turning_circle_150: '150 cm de círculo de giro',
                
                room_218: 'Habitación 218',
                room_218_full: 'Habitación 218 (2ª planta)',
                room_218_short: 'Habitación 218',
                room_218_desc: '2ª planta, accesible',
                navigate_to_218: 'Navegar a Habitación 218',
                bath_218: 'Silla de ducha, asideros',
                bed_218: 'Altura 50 cm',
                
                room_318: 'Habitación 318',
                room_318_full: 'Habitación 318 (3ª planta)',
                room_318_short: 'Habitación 318',
                room_318_desc: '3ª planta, accesible',
                navigate_to_318: 'Navegar a Habitación 318',
                bath_318: 'Ducha a ras de suelo, asideros',
                bed_318: 'Altura 55 cm, ajustable eléctricamente',
                door_90cm: '90 cm',
                
                room_327: 'Habitación 327',
                room_411: 'Habitación 411',
                
                // Emergency badges
                emergency_pull_cord: 'Emergencia: Cordón de llamada',
                emergency_bed_button: 'Alarma en cama',
                emergency_visual_alarm: 'Alarma visual',
                
                // Emergency section
                emergency_title: 'Emergencia y Seguridad',
                emergency_flashing_title: 'Alarma intermitente',
                emergency_flashing_desc: 'Señal visual fuera de las habitaciones 212, 218, 318 en caso de emergencia.',
                emergency_pullcord_title: 'Cordón en el baño',
                emergency_pullcord_desc: 'Llamada de emergencia 24/7. La puerta se desbloquea automáticamente para los servicios de rescate.',
                emergency_numbers_title: 'Números de emergencia',
                emergency_numbers_desc: 'Recepcion: 156<br>Mantenimiento: 770<br>Emergencia: 112',
                emergency_note_title: 'Aviso importante',
                fire_department: 'Bomberos:',
                fire_department_time: 'En el lugar en aprox. 10 minutos.',
                fire_doors: 'Las puertas cortafuegos se cierran automáticamente.',
                smoking_ban: 'Prohibido fumar',
                smoking_ban_desc: 'en todo el hotel (Altas multas).',
                evacuation: 'Evacuación:',
                evacuation_point: 'Punto de encuentro frente a la entrada principal.',
                
                // Floor plans
                floor_plans_title: 'Planos y Navegación',
                floor_eg: 'PB',
                floor_1og: '1ª',
                floor_2og: '2ª',
                floor_3og: '3ª',
                floor_4og: '4ª',
                floor_5og: '5ª',
                floor_6og: '6ª',
                floor_plan_placeholder_title: 'Seleccione planta',
                floor_plan_placeholder_text: 'Seleccione una planta para ver el plano.',
                floor_plan_hint_title: 'Nota',
                floor_plan_hint_text: 'Haga clic en una habitación en el plano para ir directamente a la búsqueda.',
                
                // Lift guide
                lift_guide_title: 'Guía de Ascensores',
                spa_elevator: 'Ascensor SPA (110cm):',
                spa_elevator_desc: 'Totalmente accesible a todas las plantas y SPA.',
                th9_elevator: 'TH9 Histórico (70cm):',
                th9_elevator_desc: 'Demasiado estrecho para sillas de ruedas. Ascensor histórico.',
                elevator_operation: 'Funcionamiento:',
                elevator_operation_desc: 'Tarjeta de habitación necesaria a partir de la 2ª planta.',
                
                // Accessibility page
                accessibility_title: 'Accesibilidad',
                accessible_rooms_title: 'Habitaciones accesibles:',
                
                // QR codes
                qr_title: 'Navegación con Códigos QR',
                qr_intro: 'Toda la información importante de un vistazo. Utilice los códigos QR en el hotel para acceso directo.',
                qr_generator_title: 'Generador de Códigos QR',
                qr_generator_desc: 'Genere un código QR para una habitación específica.',
                qr_room_placeholder: 'Número de habitación',
                qr_generate: 'Generar código QR',
                qr_online_ready: 'Modo en línea - QR listo',
                restaurant_short: 'Restaurante',
                restaurant_access_desc: 'Acceso accesible',
                spa_short: 'SPA & Fitness',
                spa_access_desc: 'Acceso por ascensor',
                emergency_info_short: 'Información de emergencia',
                emergency_info_desc: 'Plan de evacuación',
                accessible_wc_short: 'WC accesible',
                accessible_wc_desc: 'PB, junto a recepción',
                floor_plan_eg_short: 'Plano PB',
                floor_plan_eg_desc: 'Rutas accesibles',
                
                // Gallery
                gallery_title: 'Galería de Fotos',
                gallery_all: 'Todas',
                gallery_lobby: 'Lobby',
                gallery_rooms: 'Habitaciones',
                gallery_restaurant: 'Restaurante',
                gallery_spa: 'SPA',
                gallery_conference: 'Conferencia',
                gallery_lobby_alt: 'Vista panorámica del vestíbulo con recepción, áreas de estar y acceso al restaurante',
                gallery_restaurant_alt: 'Vista del Stadt-Restaurant desde el vestíbulo',
                gallery_room_alt: 'Habitación de hotel moderna con mobiliario confortable',
                gallery_spa_alt: 'Gimnasio moderno con varios equipos de ejercicio',
                gallery_conference_alt: 'Sala de conferencias moderna con mesas y sillas',
                gallery_bar1910_alt: 'Bar histórico 1910 en estilo Art Déco',
                
                // Footer
                footer_accessibility: 'Accesibilidad',
                footer_emergency: 'Emergencia',
                footer_qr: 'Códigos QR',
                footer_reception: '📞 Recepción: +49 40 370 2590',
                footer_copyright: '© 2026 Reichshof Hamburg | Conserje Digital v3.0.0',
                online: '● En línea',
                offline: '● Sin conexión',
                enable_push: 'Activar notificaciones push',
                wcag_statement: 'Conforme con WCAG 2.1 AA | Accesibilidad obligatoria a partir del 28.06.2025',
                system_message: 'Este sistema es para todos. Nadie debería perderse aquí.',


        // Voice settings
        voice_settings: 'Configuración de voz',
        voice_settings_title: 'Configuración de voz',
        voice_settings_desc: 'Elija las voces preferidas para cada idioma.',
        voice_preview: 'Vista previa',
        voice_save: 'Guardar',
        voice_close: 'Cerrar',
        voice_saved: 'Configuración guardada',
        voice_save_error: 'Error al guardar',
        language_de: 'Alemán',
        language_en: 'Inglés',
        language_es: 'Español',
        speech_started: 'Lectura iniciada',
        speech_stopped: 'Lectura finalizada',
        
        // WCAG toolbar
        increase_font: 'Aumentar tamaño de fuente',
        decrease_font: 'Disminuir tamaño de fuente',
        reset_font: 'Restablecer tamaño de fuente',
        speak_title: 'Leer título de la página',
        voice_assistant_label: 'Activar asistente de voz',
                
                // Messages
                loading: 'Cargando...',
                local_mode_notice: 'Modo de archivo local detectado: las funciones en línea (API, Service Worker) están limitadas.',
                high_contrast_on: 'Alto contraste activado',
                high_contrast_off: 'Alto contraste desactivado',
                blue_filter_on: 'Filtro azul activado',
                blue_filter_off: 'Filtro azul desactivado',
                font_increased: 'Tamaño de fuente aumentado',
                font_decreased: 'Tamaño de fuente disminuido',
                font_reset: 'Tamaño de fuente restablecido',
                accessibility_reset_done: 'Todos los ajustes de accesibilidad fueron restablecidos',
                manual_marker_set: 'Marcador manual guardado',
                manual_marker_missing: 'No se encontraron marcadores manuales',
                manual_marker_cleared: 'Marcador manual eliminado',
                voice_listening: 'Escuchando... Hable ahora',
                voice_stopped: 'Reconocimiento de voz detenido',
                voice_not_supported: 'Reconocimiento de voz no compatible',
                welcome: '¡Bienvenido al Conserje Reichshof!',
                
                // Routes and templates
                routes: {
                    mainElevator: 'Use el ascensor principal (se requiere tarjeta de habitación).',
                    spaElevator: 'Use el ascensor SPA para el nivel -1.',
                    th9Note: 'Nota: ¡El ascensor histórico (TH9) no es accesible para sillas de ruedas!'
                },
                templates: {
                    generic: 'Desde recepción, siga las señales al ascensor. Tome el ascensor hasta la planta solicitada y siga la señalización hacia la habitación.',
                    spa: 'Para la zona SPA, utilice el ascensor SPA hasta el sótano (-1).'
                },
                
                // Analytics
                analytics_title: 'Uso y Analítica',
                close: 'Cerrar'
            }
        };

        // ============================================
        // HILFSFUNKTION t() – ÜBERSETZUNG
        // ============================================
        function normalizeMojibake(text) {
            if (typeof text !== 'string') return text;
            if (!/[����]/.test(text)) return text;
            try {
                return decodeURIComponent(escape(text));
            } catch (_) {
                return text;
            }
        }

        function t(keyPath) {
            const lang = currentLanguage || 'de';
            const parts = keyPath.split('.');
            let node = translations[lang] || translations['de'] || {};
            for (const p of parts) {
                if (node && Object.prototype.hasOwnProperty.call(node, p)) {
                    node = node[p];
                } else {
                    node = translations['de'] || {};
                    for (const q of parts) {
                        node = node && node[q] ? node[q] : null;
                    }
                    break;
            }
          }

                    return typeof node === 'string' ? normalizeMojibake(node) : '';
        }
        
        // ============================================
        // UI-UPDATE (data-i18n, placeholder, aria)
        // ============================================
        function updateUI() {
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                const txt = t(key);
                if (txt) el.textContent = txt;
            });
            
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                const txt = t(key);
                if (txt) el.placeholder = txt;
            });
            
            document.querySelectorAll('[data-i18n-aria]').forEach(el => {
                const key = el.getAttribute('data-i18n-aria');
                const txt = t(key);
                if (txt) el.setAttribute('aria-label', txt);
            });

            document.querySelectorAll('[data-i18n-alt]').forEach(el => {
                const key = el.getAttribute('data-i18n-alt');
                const txt = t(key);
                if (txt) el.setAttribute('alt', txt);
            });
        }

        function setTextById(id, text) {
            const node = document.getElementById(id);
            if (node) node.textContent = text;
        }

        function localizeFeatureBlocks() {
            setTextById('nav-housekeeping-label', fxText('nav_housekeeping'));
            setTextById('nav-breakfast-label', fxText('nav_breakfast'));
            setTextById('nav-history-label', fxText('nav_history'));

            const foTitle = document.getElementById('fo-stay-title');
            if (foTitle) foTitle.innerHTML = `<i class="fas fa-glass-cheers"></i> ${fxText('fo_stay_title')}`;
            setTextById('fo-stay-text', fxText('fo_stay_text'));
            setTextById('fo-stay-item-1', fxText('fo_stay_item_1'));
            setTextById('fo-stay-item-2', fxText('fo_stay_item_2'));
            setTextById('fo-stay-item-3', fxText('fo_stay_item_3'));
            setTextById('fo-stay-note', fxText('fo_stay_note'));

            const luggageTitle = document.getElementById('luggage-title');
            if (luggageTitle) luggageTitle.innerHTML = `<i class="fas fa-suitcase"></i> ${fxText('luggage_title')}`;
            setTextById('luggage-item-1', fxText('luggage_item_1'));
            setTextById('luggage-item-2', fxText('luggage_item_2'));
            setTextById('luggage-item-3', fxText('luggage_item_3'));
            setTextById('luggage-note', fxText('luggage_note'));

            const marketTitle = document.getElementById('market-title');
            if (marketTitle) marketTitle.innerHTML = `<i class="fas fa-store"></i> ${fxText('market_title')}`;
            const marketLocation = document.getElementById('market-location');
            if (marketLocation) marketLocation.innerHTML = `<strong>${fxText('market_location_label')}:</strong> ${fxText('market_location_text')}`;
            const marketContent = document.getElementById('market-content');
            if (marketContent) marketContent.innerHTML = `<strong>${fxText('market_content_label')}:</strong> ${fxText('market_content_text')}`;
            setTextById('market-note', fxText('market_note'));

            setTextById('housekeeping-title', fxText('housekeeping_title'));
            setTextById('housekeeping-intro', fxText('housekeeping_intro'));
            setTextById('housekeeping-feedback-label', fxText('housekeeping_feedback'));

            setTextById('breakfast-guide-title', fxText('breakfast_title'));
            setTextById('breakfast-ampel-title', fxText('breakfast_ampel_title'));
            setTextById('ampel-label-1', fxText('ampel_1'));
            setTextById('ampel-label-2', fxText('ampel_2'));
            setTextById('ampel-label-3', fxText('ampel_3'));
            setTextById('ampel-label-4', fxText('ampel_4'));
            setTextById('allergen-title', fxText('allergen_title'));
            setTextById('allergen-note', fxText('allergen_note'));

            setTextById('history-poi-title', fxText('history_title'));
            const historyLangerTitle = document.getElementById('history-langer-title');
            if (historyLangerTitle) {
                historyLangerTitle.innerHTML = `<img class="history-coin" src="img/Anton-Emil-Langer.png" alt="Anton Emil Langer"> ${fxText('history_langer_title')}`;
            }
            setTextById('history-langer-desc', fxText('history_langer_desc'));
            setTextById('history-langer-note', fxText('history_langer_note'));
            setTextById('history-langer-btn', fxText('history_langer_btn'));
            const crossSellText = document.getElementById('book-cross-sell-text');
            if (crossSellText) {
                crossSellText.innerHTML = `<i class="fas fa-book" style="margin-right:0.4rem; color:#b8860b;"></i>${fxText('book_cross_sell_text')}`;
            }
            const historyBookTitle = document.getElementById('history-book-title');
            if (historyBookTitle) historyBookTitle.innerHTML = `<i class="fas fa-book"></i> ${fxText('history_book_title')}`;
            setTextById('history-book-desc', fxText('history_book_desc'));
            setTextById('history-book-note', fxText('history_book_note'));
            setTextById('history-book-btn', fxText('history_book_btn'));
            const historyAutosiloTitle = document.getElementById('history-autosilo-title');
            if (historyAutosiloTitle) historyAutosiloTitle.innerHTML = `<i class="fas fa-car"></i> ${fxText('history_autosilo_title')}`;
            setTextById('history-autosilo-desc', fxText('history_autosilo_desc'));
            setTextById('history-autosilo-note', fxText('history_autosilo_note'));
            const historyTeamTitle = document.getElementById('history-team-title');
            if (historyTeamTitle) historyTeamTitle.innerHTML = `<i class="fas fa-users"></i> ${fxText('history_team_title')}`;
            setTextById('history-team-text', fxText('history_team_text'));
            setTextById('history-team-btn', fxText('history_team_btn'));
        }
        
        // ============================================
        // KERN FUNKTIONEN
        // ============================================
        function setLanguage(lang) {
            lang = normalizeLanguageCode(lang);
            currentLanguage = lang;
            localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
            localStorage.setItem('language', lang);
            
            document.querySelectorAll('[data-lang]').forEach(btn => {
                const isActive = btn.getAttribute('data-lang') === lang;
                btn.classList.toggle('active', isActive);
                btn.setAttribute('aria-pressed', isActive);
                if (isActive) {
                    btn.style.background = '#fbbf24';
                    btn.style.color = '#000';
                    btn.style.border = '2px solid #fbbf24';
                } else {
                    btn.style.background = '#334155';
                    btn.style.color = '#fff';
                    btn.style.border = '2px solid transparent';
                }
            });
            
            const searchInput = document.getElementById('roomInput');
            const roomInput = document.getElementById('room-input');
            const placeholder = t('search_placeholder');
            if (searchInput) searchInput.placeholder = placeholder;
            if (roomInput) roomInput.placeholder = placeholder;
            
            updateUI();
            localizeFeatureBlocks();
            initHousekeepingModule();
            initBreakfastGuideModule();
            document.documentElement.lang = lang;
            updateRuntimeModeIndicator();
            updateBackendStatusBadge(backendStatusState);
            updateQrRuntimeBadge();
            updateVisualRestoreButton();
            
            showNotification(
                lang === 'de' ? 'Sprache: Deutsch' :
                lang === 'en' ? 'Language: English' :
                'Idioma: Español',
                'info'
            );
        }
        
        function showSection(sectionId) {
            document.querySelectorAll('.section').forEach(s => {
                s.classList.remove('active');
                s.classList.add('hidden');
            });
            const target = document.getElementById(sectionId);
            if (target) {
                target.classList.remove('hidden');
                target.classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
                if (link.getAttribute('onclick')?.includes(`'${sectionId}'`)) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                }
            });
            if (sectionId === 'qr-codes') updateQrRuntimeBadge();
        }
        
        function searchRoomGlobal() {
            const input = document.getElementById('roomInput');
            if (input && input.value) searchRoomNumber(input.value);
        }
        
        function searchRoom() {
            const input = document.getElementById('room-input');
            if (input && input.value) searchRoomNumber(input.value);
        }
        
        function searchRoomNumber(roomNumber) {
            if (!roomNumber || roomNumber.trim() === '') {
                showNotification('Bitte geben Sie eine Zimmernummer ein', 'error');
                return;
            }
            const resultBox = document.getElementById('search-result');
            if (!resultBox) return;
            
            resultBox.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--accent);"></i>
                    <p style="margin-top: 1rem; color: #94a3b8;">${t('loading')} ${roomNumber}...</p>
                </div>
            `;
            resultBox.classList.add('visible');
            showSection('room-search');
            
            setTimeout(() => displayRoomResult(roomNumber), 500);
        }

        function setManualMarkerForRoom(roomNumber) {
            const resolved = String(roomNumber || currentRoomNumber || '').trim();
            if (!resolved) return;
            
            // Aktiviraj draggable marker mode
            activateDraggableMarkerMode(resolved);
        }
        
        function activateDraggableMarkerMode(roomNumber) {
            // Zatvori postojeći mode ako postoji
            const existingOverlay = document.getElementById('marker-placement-overlay');
            if (existingOverlay) existingOverlay.remove();
            
            // Stvori overlay sa kontrolama
            const overlay = document.createElement('div');
            overlay.id = 'marker-placement-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.85);
                z-index: 9999;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 2rem;
            `;
            
            const current = window.roomManager?.getRoomPosition?.(roomNumber) || { x: 50, y: 50 };
            let currentX = typeof current.x === 'number' ? current.x : 50;
            let currentY = typeof current.y === 'number' ? current.y : 50;
            
            // NOVI FIX: Ako nema manualne koordinate, koristi postojeće iz rooms database
            if (currentX === 50 && currentY === 50 && window.roomsDatabase?.[roomNumber]) {
                const dbRoom = window.roomsDatabase[roomNumber];
                if (typeof dbRoom.x === 'number') currentX = dbRoom.x;
                if (typeof dbRoom.y === 'number') currentY = dbRoom.y;
            }
            
            overlay.innerHTML = `
                <div style="background: var(--card-bg); padding: 2rem; border-radius: var(--border-radius); max-width: 800px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
                    <h3 style="color: var(--accent); margin-bottom: 1.5rem; text-align: center;">
                        <i class="fas fa-map-marker-alt"></i> Marker für Zimmer ${roomNumber} setzen
                    </h3>
                    
                    <div style="position: relative; width: 100%; max-height: 60vh; overflow: auto; border: 3px solid var(--accent); border-radius: var(--border-radius); margin-bottom: 1.5rem; background: #1a1a2e; cursor: crosshair;">
                        <img id="draggable-map-preview" src="" style="width: 100%; display: block; user-select: none; pointer-events: none;" draggable="false">
                        <div id="draggable-marker" style="position: absolute; width: 35px; height: 35px; background: #ef4444; border: 5px solid white; border-radius: 50%; transform: translate(-50%, -50%); cursor: grab; box-shadow: 0 0 40px rgba(239, 68, 68, 0.9), 0 0 10px rgba(255, 255, 255, 0.8); z-index: 100; left: ${currentX}%; top: ${currentY}%; transition: transform 0.2s ease, box-shadow 0.2s ease;">
                            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-weight: bold; font-size: 18px;">+</div>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-bottom: 1rem; padding: 0.75rem; background: rgba(239, 68, 68, 0.2); border-radius: 8px;">
                        <strong style="color: #ef4444;">💡 Tipp:</strong> 
                        <span style="color: #cbd5e1;">Klicken Sie direkt auf die Karte oder ziehen Sie den Marker</span>
                    </div>
                    
                    <div style="background: rgba(251, 191, 36, 0.1); padding: 1rem; border-radius: var(--border-radius); margin-bottom: 1.5rem;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                            <div>
                                <label style="color: var(--accent); font-weight: bold; display: block; margin-bottom: 0.5rem;">
                                    X-Koordinate: <span id="current-x-display">${currentX.toFixed(2)}%</span>
                                </label>
                                <input type="range" id="x-slider" min="0" max="100" step="0.1" value="${currentX}" style="width: 100%;">
                            </div>
                            <div>
                                <label style="color: var(--accent); font-weight: bold; display: block; margin-bottom: 0.5rem;">
                                    Y-Koordinate: <span id="current-y-display">${currentY.toFixed(2)}%</span>
                                </label>
                                <input type="range" id="y-slider" min="0" max="100" step="0.1" value="${currentY}" style="width: 100%;">
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem;">
                            <button class="btn" onclick="nudgeMarker(-1, 0)" style="font-size: 0.85rem;">
                                ⬅️ Links (1%)
                            </button>
                            <button class="btn" onclick="nudgeMarker(1, 0)" style="font-size: 0.85rem;">
                                ➡️ Rechts (1%)
                            </button>
                            <button class="btn" onclick="nudgeMarker(0, -1)" style="font-size: 0.85rem;">
                                ⬆️ Oben (1%)
                            </button>
                            <button class="btn" onclick="nudgeMarker(0, 1)" style="font-size: 0.85rem;">
                                ⬇️ Unten (1%)
                            </button>
                        </div>
                        
                        <div style="margin-top: 1rem; display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem;">
                            <button class="btn" onclick="nudgeMarker(-0.1, 0)" style="font-size: 0.8rem; background: rgba(100,100,100,0.3);">
                                ← Fein
                            </button>
                            <button class="btn" onclick="nudgeMarker(0.1, 0)" style="font-size: 0.8rem; background: rgba(100,100,100,0.3);">
                                Fein →
                            </button>
                            <button class="btn" onclick="nudgeMarker(0, -0.1)" style="font-size: 0.8rem; background: rgba(100,100,100,0.3);">
                                ↑ Fein
                            </button>
                            <button class="btn" onclick="nudgeMarker(0, 0.1)" style="font-size: 0.8rem; background: rgba(100,100,100,0.3);">
                                Fein ↓
                            </button>
                            <button class="btn" onclick="resetMarkerToCenter()" style="font-size: 0.8rem; background: rgba(251,191,36,0.3); color: var(--accent);">
                                🎯 Zentrum
                            </button>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button class="btn" onclick="saveDraggableMarkerPosition()" style="background: #22c55e; color: white; padding: 0.75rem 2rem; font-size: 1rem;">
                            <i class="fas fa-check"></i> Speichern
                        </button>
                        <button class="btn" onclick="cancelDraggableMarkerMode()" style="background: #ef4444; color: white; padding: 0.75rem 2rem; font-size: 1rem;">
                            <i class="fas fa-times"></i> Abbrechen
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            // Load trenutni floor SVG
            const room = window.roomsDatabase?.[roomNumber];
            const floorNum = room?.floor || Math.floor(parseInt(roomNumber) / 100);
            const svgPreview = document.getElementById('draggable-map-preview');
            if (svgPreview) {
                svgPreview.src = `svg/${floorNum}og.svg`;
            }
            
            // Draggable marker functionality
            const marker = document.getElementById('draggable-marker');
            const mapPreview = document.getElementById('draggable-map-preview');
            const xSlider = document.getElementById('x-slider');
            const ySlider = document.getElementById('y-slider');
            const xDisplay = document.getElementById('current-x-display');
            const yDisplay = document.getElementById('current-y-display');
            
            let isDragging = false;
            
            // Mouse drag - verbessert
            marker.addEventListener('mousedown', (e) => {
                isDragging = true;
                marker.style.cursor = 'grabbing';
                e.preventDefault();
                e.stopPropagation();
            });
            
            // WICHTIG: Klik na KONTEJNER omogućava drag po cijeloj karti
            const mapContainer = mapPreview.parentElement;
            
            mapContainer.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const rect = mapPreview.getBoundingClientRect();
                currentX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                currentY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
                updateMarkerPosition();
                e.preventDefault();
            });
            
            document.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    marker.style.cursor = 'grab';
                }
            });
            
            // Touch drag
            marker.addEventListener('touchstart', (e) => {
                isDragging = true;
                e.preventDefault();
                e.stopPropagation();
            });
            
            mapContainer.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                const rect = mapPreview.getBoundingClientRect();
                const touch = e.touches[0];
                currentX = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
                currentY = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100));
                updateMarkerPosition();
                e.preventDefault();
            });
            
            document.addEventListener('touchend', () => {
                isDragging = false;
            });
            
            // DIREKTNI KLIK NA MAPU - marker skoči!
            mapPreview.addEventListener('click', (e) => {
                if (isDragging) return; // Ignoriraj ako je drag u tijeku
                const rect = mapPreview.getBoundingClientRect();
                currentX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                currentY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
                updateMarkerPosition();
                
                // Vizualni feedback
                marker.style.transform = 'translate(-50%, -50%) scale(1.3)';
                setTimeout(() => {
                    marker.style.transform = 'translate(-50%, -50%) scale(1)';
                }, 200);
                
                e.preventDefault();
            });
            
            // Sliders
            xSlider.addEventListener('input', (e) => {
                currentX = parseFloat(e.target.value);
                updateMarkerPosition();
            });
            
            ySlider.addEventListener('input', (e) => {
                currentY = parseFloat(e.target.value);
                updateMarkerPosition();
            });
            
            function updateMarkerPosition() {
                // VAŽNO: Računaj poziciju prema SLICI, ne prema kontejneru!
                const imgRect = mapPreview.getBoundingClientRect();
                const containerRect = mapPreview.parentElement.getBoundingClientRect();
                
                // Pixel pozicija unutar slike
                const pixelX = (currentX / 100) * imgRect.width;
                const pixelY = (currentY / 100) * imgRect.height;
                
                // Offset slike unutar kontejnera (ako slika ne popunjava container)
                const offsetX = imgRect.left - containerRect.left;
                const offsetY = imgRect.top - containerRect.top;
                
                // Postavi marker pixel-perfect prema slici
                marker.style.left = (offsetX + pixelX) + 'px';
                marker.style.top = (offsetY + pixelY) + 'px';
                
                // Update UI displaya
                xSlider.value = currentX;
                ySlider.value = currentY;
                xDisplay.textContent = currentX.toFixed(2) + '%';
                yDisplay.textContent = currentY.toFixed(2) + '%';
            }
            
            // Nudge funkcija za fine-tuning
            window.nudgeMarker = (dx, dy) => {
                currentX = Math.max(0, Math.min(100, currentX + dx));
                currentY = Math.max(0, Math.min(100, currentY + dy));
                updateMarkerPosition();
            };
            
            // Reset na centar mape
            window.resetMarkerToCenter = () => {
                currentX = 50;
                currentY = 50;
                updateMarkerPosition();
                
                // Vizualni feedback
                marker.style.transform = 'translate(-50%, -50%) scale(1.5)';
                marker.style.boxShadow = '0 0 60px rgba(239, 68, 68, 0.9), 0 0 20px rgba(255, 255, 255, 0.8)';
                setTimeout(() => {
                    marker.style.transform = 'translate(-50%, -50%) scale(1)';
                    marker.style.boxShadow = '0 0 40px rgba(239, 68, 68, 0.9), 0 0 10px rgba(255, 255, 255, 0.8)';
                }, 300);
            };
            
            // Save function
            window.saveDraggableMarkerPosition = () => {
                window.roomManager?.setManualCoords?.(roomNumber, currentX, currentY);
                showNotification(`Marker gespeichert: ${roomNumber} (${currentX.toFixed(2)}%, ${currentY.toFixed(2)}%)`, 'success');
                overlay.remove();
                displayRoomResult(roomNumber);
            };
            
            // Cancel function
            window.cancelDraggableMarkerMode = () => {
                overlay.remove();
            };
            
            // ESC key za cancel
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    overlay.remove();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
        }

        function clearManualMarkerForRoom(roomNumber) {
            const resolved = String(roomNumber || currentRoomNumber || '').trim();
            if (!resolved) return;
            window.roomManager?.clearManualCoords?.(resolved);
            showNotification(`${t('manual_marker_cleared')} (${resolved})`, 'info');
            displayRoomResult(resolved);
        }

        function verifyRoomMarker(roomNumber) {
            const resolved = String(roomNumber || currentRoomNumber || '').trim();
            if (!resolved) return;
            const pos = window.roomManager?.getRoomPosition?.(resolved);
            if (!pos) {
                showNotification(`${t('manual_marker_missing')} (${resolved})`, 'warn');
                return;
            }
            showNotification(`Room ${resolved}: X ${pos.x}% · Y ${pos.y}% · ${pos.source || 'auto'}`, 'info');
        }

        function copyMarkerToAdjacentFloor(roomNumber, direction = 1) {
            const resolved = String(roomNumber || currentRoomNumber || '').trim();
            if (!/^\d{3}$/.test(resolved)) {
                showNotification('Ungültige Zimmernummer für Copy-Workflow', 'error');
                return;
            }

            const base = parseInt(resolved, 10);
            const delta = direction >= 0 ? 100 : -100;
            const target = String(base + delta).padStart(3, '0');
            if (!/^\d{3}$/.test(target) || parseInt(target, 10) <= 0) {
                showNotification('Zielzimmer außerhalb gültigem Bereich', 'error');
                return;
            }

            const pos = window.roomManager?.getRoomPosition?.(resolved);
            if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') {
                showNotification(`${t('manual_marker_missing')} (${resolved})`, 'warn');
                return;
            }

            window.roomManager?.setManualCoords?.(target, pos.x, pos.y);
            showNotification(`Marker kopiert: ${resolved} → ${target} (${pos.x}%, ${pos.y}%)`, 'success');
            searchRoomNumber(target);
        }

        function exportManualMarkers() {
            const data = window.roomManager?.getManualCoords?.() || {};
            if (!Object.keys(data).length) {
                showNotification(t('manual_marker_missing'), 'warn');
                return;
            }
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'room-manual-coords.json';
            link.click();
            URL.revokeObjectURL(url);
            showNotification('Manual coords exported', 'success');
        }

        function getEmergencyPlan(roomNumber) {
            const data = (window.hotelMapRegistry || {})[String(roomNumber)];
            if (!data) return null;
            return {
                url: `${pdfFolder}${data.file}#page=${data.page}`,
                fileName: data.file,
                page: data.page
            };
        }

        async function getEmergencyPlanFromBackend(roomNumber) {
            try {
                const response = await fetch(`/api/plan/${encodeURIComponent(roomNumber)}`);
                if (!response.ok) return null;
                const payload = await response.json();
                if (!payload) return null;
                if (payload.url) return payload;
                if (payload.file && payload.page) {
                    return {
                        url: `${pdfFolder}${payload.file}#page=${payload.page}`,
                        fileName: payload.file,
                        page: payload.page
                    };
                }
                return null;
            } catch (_) {
                return null;
            }
        }

        function activateEmergencyContrast() {
            if (!document.body.classList.contains('high-contrast')) {
                document.body.classList.add('high-contrast');
                localStorage.setItem('highContrast', 'true');
            }
        }

        function openSafetyViewer(url, roomNumber) {
            const viewer = document.getElementById('pdf-viewer');
            const title = document.getElementById('safety-title');
            if (!viewer) return;

            viewer.src = url;
            viewer.style.display = 'block';
            if (title) title.style.display = 'block';

            activateEmergencyContrast();

            if (window.speakText) {
                const num = parseInt(roomNumber, 10);
                const floor = String(roomNumber).charAt(0);
                const message = num >= 612 && num <= 646
                    ? (currentLanguage === 'de'
                        ? 'Ihre Position wurde erkannt. Sie befinden sich im Dachgeschoss. Der Evakuierungsplan ist geladen. Folgen Sie den markierten Ausgängen und benutzen Sie keinen Aufzug.'
                        : currentLanguage === 'en'
                            ? 'Your location has been identified. You are on the attic level. The evacuation plan is loaded. Follow the marked exits and do not use the elevator.'
                            : 'Su ubicación ha sido identificada. Se encuentra en el ático. El plan de evacuación está cargado. Siga las salidas marcadas y no utilice el ascensor.')
                    : (currentLanguage === 'de'
                        ? `Ihre Position wurde erkannt. Sie befinden sich auf Etage ${floor}. Der Evakuierungsplan ist geladen. Folgen Sie den markierten Ausgängen und benutzen Sie keinen Aufzug.`
                        : currentLanguage === 'en'
                            ? `Your location has been identified. You are on floor ${floor}. The evacuation plan is loaded. Follow the marked exits and do not use the elevator.`
                            : `Su ubicación ha sido identificada. Se encuentra en la planta ${floor}. El plan de evacuación está cargado. Siga las salidas marcadas y no utilice el ascensor.`);
                window.speakText(message);
            }

            setDashboardLastEvent('Safety plan opened', `room ${roomNumber}`);

            updateTechDashboard();
        }

        async function probeBackendPlan() {
            if (!isHttpContext) return false;
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 1500);
            try {
                const response = await fetch('/api/plan/212', { signal: controller.signal });
                clearTimeout(timeout);
                return response.ok;
            } catch (_) {
                clearTimeout(timeout);
                return false;
            }
        }

        function setDashboardLastEvent(type, details = '') {
            const payload = {
                type,
                details,
                at: new Date().toISOString()
            };
            localStorage.setItem('reichshof_last_event', JSON.stringify(payload));
        }

        function getDashboardLastEvent() {
            try {
                const raw = localStorage.getItem('reichshof_last_event');
                if (!raw) return null;
                return JSON.parse(raw);
            } catch (_) {
                return null;
            }
        }

        async function updateTechDashboard() {
            const container = document.getElementById('tech-dashboard-content');
            if (!container) return;

            const hasPdfMap = !!window.hotelMapRegistry;
            const hasEmergencyDom = !!document.getElementById('pdf-viewer') && !!document.getElementById('safety-title');
            const hasSwSupport = isHttpContext && ('serviceWorker' in navigator);
            const swActive = hasSwSupport && (!!navigator.serviceWorker.controller || !!(await navigator.serviceWorker.getRegistration()));
            const backendUp = shouldProbeBackend ? await probeBackendPlan() : false;
            backendStatusState = shouldProbeBackend ? (backendUp ? 'connected' : 'fallback') : 'static';
            updateBackendStatusBadge(backendStatusState);
            const lastEvent = getDashboardLastEvent();
            const lastEventText = lastEvent
                ? `${lastEvent.type}${lastEvent.details ? ` · ${lastEvent.details}` : ''} · ${new Date(lastEvent.at).toLocaleString('de-DE')}`
                : 'No events yet';

            container.innerHTML = `
                <ul>
                    <li><span class="${hasPdfMap ? 'ok' : 'bad'}">${hasPdfMap ? '●' : '●'}</span> PDF Registry: ${hasPdfMap ? 'loaded' : 'missing'}</li>
                    <li><span class="${hasEmergencyDom ? 'ok' : 'bad'}">${hasEmergencyDom ? '●' : '●'}</span> Emergency Viewer DOM: ${hasEmergencyDom ? 'ready' : 'missing'}</li>
                    <li><span class="${swActive ? 'ok' : 'warn'}">${swActive ? '●' : '●'}</span> Service Worker: ${swActive ? 'active' : 'not active yet'}</li>
                    <li><span class="${backendUp ? 'ok' : 'warn'}">${backendUp ? '●' : '●'}</span> Backend /api/plan: ${backendUp ? 'reachable' : (shouldProbeBackend ? 'fallback mode' : 'probe disabled')}</li>
                </ul>
                <p style="margin-top:0.5rem; font-size:0.78rem; color:#94a3b8;"><strong>Last event:</strong> ${lastEventText}</p>
            `;
        }

        function updateBackendStatusBadge(state = 'static') {
            const badge = document.getElementById('backend-status-badge');
            if (!badge) return;

            badge.classList.remove('backend-on', 'backend-off', 'backend-static');

            let text;
            if (state === 'connected') {
                badge.classList.add('backend-on');
                text = currentLanguage === 'de' ? 'Backend: Verbunden' : currentLanguage === 'en' ? 'Backend: Connected' : 'Backend: Conectado';
            } else if (state === 'fallback') {
                badge.classList.add('backend-off');
                text = currentLanguage === 'de' ? 'Backend: Fallback' : currentLanguage === 'en' ? 'Backend: Fallback' : 'Backend: Fallback';
            } else {
                badge.classList.add('backend-static');
                text = currentLanguage === 'de' ? 'Backend: Statisch' : currentLanguage === 'en' ? 'Backend: Static' : 'Backend: Estático';
            }

            badge.textContent = text;
        }

        function updateRuntimeModeIndicator() {
            const indicator = document.getElementById('local-mode-indicator');
            if (!indicator) return;
            indicator.style.display = isHttpContext ? 'none' : 'block';
        }

        function navigateToSafetyPlan(roomNumber) {
            const data = (window.hotelMapRegistry || {})[String(roomNumber)];
            if (!data) return;

            const url = `./pdf/${data.file}#page=${data.page}`;
            openSafetyViewer(url, roomNumber);

            if (window.speakText) {
                const msg = currentLanguage === 'de'
                    ? `Ihr Sicherheitsplan für Zimmer ${roomNumber} wurde geladen.`
                    : currentLanguage === 'en'
                        ? `Your safety plan for room ${roomNumber} has been loaded.`
                        : `Su plan de seguridad para la habitación ${roomNumber} se ha cargado.`;
                window.speakText(msg);
            }
        }

        function extractRoomNumberFromSvgFile(svgFileName) {
            const match = String(svgFileName || '').match(/(\d{3})/);
            return match ? match[1] : null;
        }

        function ensureSvgRoomId(svgRoot, roomNumber) {
            if (!svgRoot || !roomNumber) return null;
            const targetId = `room-${roomNumber}`;
            let roomElement = svgRoot.querySelector(`#${targetId}`);
            if (roomElement) return roomElement;

            roomElement = svgRoot.querySelector(`[id="${roomNumber}"]`) ||
                svgRoot.querySelector(`[data-room="${roomNumber}"]`) ||
                svgRoot.querySelector(`[aria-label*="${roomNumber}"]`) ||
                svgRoot.querySelector(`text[id*="${roomNumber}"]`) ||
                svgRoot.querySelector('g, path, rect, polygon');

            if (roomElement && !roomElement.id) {
                roomElement.id = targetId;
            }
            return roomElement;
        }

        function buildSosPlanUrl(roomNumber) {
            const base = String(SOS_PLAN_BACKEND_BASE || '').trim();
            if (!base) return null;
            const normalizedBase = base.endsWith('/') ? base : `${base}/`;
            return `${normalizedBase}${encodeURIComponent(String(roomNumber || '000'))}`;
        }

        async function loadSosPlanForRoom(roomNumber) {
            const url = buildSosPlanUrl(roomNumber);
            if (!url || !isHttpContext) return false;

            try {
                const response = await fetch(url, { cache: 'no-store' });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const planMarkup = await response.text();
                if (!planMarkup || !planMarkup.trim()) {
                    throw new Error('Empty plan response');
                }

                const container = document.getElementById('svg-container');
                if (container) {
                    container.innerHTML = planMarkup;
                    return true;
                }
                return false;
            } catch (error) {
                console.warn('SOS: evacuation plan fetch failed', error);
                return false;
            }
        }

        async function activateSOS(roomNumber) {
            const resolvedRoom = roomNumber
                || currentRoom?.newNumber
                || currentRoom?.roomNumber
                || new URLSearchParams(window.location.search).get('room')
                || '000';

            if ('vibrate' in navigator) {
                navigator.vibrate([200, 200, 200, 200, 200, 400, 600, 200, 600, 200, 600, 400, 200, 200, 200]);
            }

            if (window.speakText) {
                const sosText = currentLanguage === 'de'
                    ? `SOS Alarm Zimmer ${resolvedRoom}`
                    : currentLanguage === 'en'
                        ? `SOS alarm room ${resolvedRoom}`
                        : `Alarma SOS habitación ${resolvedRoom}`;
                window.speakText(sosText);
            }

            const svgRoot = document.querySelector('#svg-container svg');
            const roomElement = ensureSvgRoomId(svgRoot, resolvedRoom);
            if (roomElement) {
                roomElement.classList.add('sos-active-room');
            }

            const panel = document.getElementById('sos-panel');
            if (panel) panel.style.display = 'block';

            const planLoaded = await loadSosPlanForRoom(resolvedRoom);
            if (planLoaded) {
                showNotification(
                    currentLanguage === 'de'
                        ? `Evakuierungsplan für Zimmer ${resolvedRoom} geladen.`
                        : currentLanguage === 'en'
                            ? `Evacuation plan for room ${resolvedRoom} loaded.`
                            : `Plano de evacuación para la habitación ${resolvedRoom} cargado.`,
                    'success'
                );
            } else if (isHttpContext) {
                showNotification(
                    currentLanguage === 'de'
                        ? `SOS aktiv. Plan-Server für Zimmer ${resolvedRoom} derzeit nicht erreichbar.`
                        : currentLanguage === 'en'
                            ? `SOS active. Plan server for room ${resolvedRoom} is currently unreachable.`
                            : `SOS activo. El servidor del plano para la habitación ${resolvedRoom} no está disponible actualmente.`,
                    'warn'
                );
            }

            setDashboardLastEvent('SOS activated', `room ${resolvedRoom}`);
            updateTechDashboard();
        }
        
        function displayRoomResult(roomNumber) {
            const resultBox = document.getElementById('search-result');
            if (!resultBox) return;
            const runtimeNotice = getSearchRuntimeNotice();
            
            let room = window.roomsDatabase[roomNumber];
            let foundByMapping = false;
            if (!room && window.roomMapping[roomNumber]) {
                room = window.roomsDatabase[window.roomMapping[roomNumber]];
                foundByMapping = true;
            }
            
            if (room) {
                const isAccessible = room.accessible;
                const displayNumber = foundByMapping ? window.roomMapping[roomNumber] : roomNumber;
                
                resultBox.innerHTML = `
                    <div style="margin-bottom: 2rem;">
                        ${runtimeNotice}
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
                            <div>
                                <h3 style="color: var(--accent); font-size: 1.8rem; margin-bottom: 0.5rem;">
                                    🚪 ${t('room_found')} ${displayNumber}
                                    ${isAccessible ? '<span class="badge-wc" style="margin-left: 10px;"><i class="fas fa-wheelchair"></i> ' + t('accessible_rooms_title') + '</span>' : ''}
                                </h3>
                                ${foundByMapping ? `<p style="color: var(--warning);">Eingabe: ${roomNumber} → Gefunden: ${displayNumber}</p>` : ''}
                            </div>
                            ${isAccessible ? `
                            <div style="background: rgba(251, 191, 36, 0.2); padding: 10px 15px; border-radius: var(--border-radius); border: 1px solid var(--accent);">
                                <strong style="color: var(--accent);">♿ ${t('accessible_rooms_title')}</strong>
                            </div>
                            ` : ''}
                        </div>
                        <div id="map-wrapper" style="position: relative; display: inline-block; width: 100%;">
                            <img id="floor-svg" src="svg/${room.floor}og.svg" alt="${t('floor')} ${room.floor}" style="width: 100%; height: auto;">
                            <div id="room-marker" style="position: absolute; width: 15px; height: 15px; background-color: red; border-radius: 50%; display: none; transform: translate(-50%, -50%); box-shadow: 0 0 10px white; border: 2px solid white; z-index: 10;"></div> 
                        </div>
                        <div class="room-grid">
                            <div class="room-info-item">
                                <div class="room-info-label">${t('floor')}</div>
                                <div class="room-info-value">${room.floor}. OG</div>
                            </div>
                            ${room.oldNumber ? `
                            <div class="room-info-item">
                                <div class="room-info-label">Alte Nr.</div>
                                <div class="room-info-value" style="color: var(--warning);">${room.oldNumber}</div>
                            </div>
                            ` : ''}
                            <div class="room-info-item">
                                <div class="room-info-label">${t('room_type') || 'Kategorie'}</div>
                                <div class="room-info-value">${room.category || '—'}</div>
                            </div>
                            <div class="room-info-item">
                                <div class="room-info-label">${t('bed')}</div>
                                <div class="room-info-value">${room.bedType || room.bedSize || '—'}</div>
                            </div>
                        </div>
                        ${isAccessible ? `
                        <div style="margin: 1.5rem 0; padding: 1.5rem; background: rgba(251, 191, 36, 0.1); border-radius: var(--border-radius); border: 1px solid rgba(251, 191, 36, 0.3);">
                            <h4 style="color: var(--accent); margin-bottom: 0.5rem;"><i class="fas fa-wheelchair"></i> ${t('accessible_rooms_title')}</h4>
                            <p style="color: #e2e8f0;">${t('accessibleNote') || 'Dieses Zimmer verfügt über spezielle Einrichtungen für mobilitätseingeschränkte Gäste.'}</p>
                            <div style="margin-top:12px; display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
                                <span class="emergency-badge"><i class="fas fa-phone emergency-icon flash"></i> ${t('emergency_pull_cord')}</span>
                                <span class="emergency-badge"><i class="fas fa-bed emergency-icon flash"></i> ${t('emergency_bed_button')}</span>
                                <span class="emergency-badge"><i class="fas fa-bell-slash emergency-icon flash"></i> ${t('emergency_visual_alarm')}</span>
                            </div>
                        </div>
                        ` : ''}
                        <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--secondary);">
                            <h4 style="color: var(--accent); margin-bottom: 1rem;"><i class="fas fa-directions"></i> ${t('navigation')}</h4>
                            <div style="background: rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: var(--border-radius);">
                                <p style="line-height: 1.6;">${buildNavigationText(room)}</p>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                        <button class="btn gold-bg" onclick="speakNavigation('${displayNumber}')" style="flex: 1;">
                            <i class="fas fa-volume-up"></i> Audio-Anleitung
                        </button>
                        <button class="btn" onclick="showSection('floor-plans'); loadFloor(${parseInt(room.floor)})" style="flex: 1;">
                            <i class="fas fa-map"></i> Auf Plan zeigen
                        </button>
                        <button class="btn" onclick="generateSpecificQR('${displayNumber}')" style="flex: 1;">
                            <i class="fas fa-qrcode"></i> QR-Code
                        </button>
                    </div>
                    
                    <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(239, 68, 68, 0.1); border-radius: var(--border-radius); border: 2px solid #ef4444;">
                        <h4 style="color: #ef4444; margin-bottom: 0.5rem;">
                            <i class="fas fa-exclamation-triangle"></i> ${currentLanguage === 'de' ? 'Notfall-Navigation' : currentLanguage === 'en' ? 'Emergency Navigation' : 'Navegación de Emergencia'}
                        </h4>
                        <p style="font-size: 0.9rem; color: #fca5a5; margin-bottom: 0.75rem;">
                            ${currentLanguage === 'de' ? 'Im Brandfall: LIFT NICHT BENUTZEN!' : currentLanguage === 'en' ? 'In case of fire: DO NOT USE ELEVATOR!' : 'En caso de incendio: ¡NO USAR ASCENSOR!'}
                        </p>
                        <button class="btn" onclick="activateEmergencyMode('${displayNumber}', '${currentLanguage}')" style="background: #ef4444; color: white; width: 100%;">
                            🚪 ${currentLanguage === 'de' ? 'Zum nächsten Notausgang (TH)' : currentLanguage === 'en' ? 'To nearest emergency exit (TH)' : 'A la salida de emergencia más cercana (TH)'}
                        </button>
                    </div>
                    
                    <div style="margin-top: 1rem; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: var(--border-radius);">
                        <h4 style="color: var(--accent); margin-bottom: 0.5rem; font-size: 0.95rem;">
                            <i class="fas fa-tools"></i> Marker Werkzeuge
                        </h4>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <button class="btn" onclick="setManualMarkerForRoom('${displayNumber}')" style="flex: 1; font-size: 0.85rem;">
                                <i class="fas fa-map-pin"></i> Marker setzen
                            </button>
                            <button class="btn" onclick="copyMarkerToAdjacentFloor('${displayNumber}', 1)" style="flex: 1; font-size: 0.85rem;">
                                <i class="fas fa-arrow-up"></i> +100
                            </button>
                            <button class="btn" onclick="copyMarkerToAdjacentFloor('${displayNumber}', -1)" style="flex: 1; font-size: 0.85rem;">
                                <i class="fas fa-arrow-down"></i> -100
                            </button>
                            <button class="btn" onclick="verifyRoomMarker('${displayNumber}')" style="flex: 1; font-size: 0.85rem;">
                                <i class="fas fa-check-circle"></i> Prüfen
                            </button>
                            <button class="btn" onclick="clearManualMarkerForRoom('${displayNumber}')" style="flex: 1; font-size: 0.85rem;">
                                <i class="fas fa-eraser"></i> Löschen
                            </button>
                            <button class="btn" onclick="exportManualMarkers()" style="flex: 1; font-size: 0.85rem;">
                                <i class="fas fa-file-export"></i> Export
                            </button>
                        </div>
                    </div>
                `;
                
                setTimeout(() => {
                    try {
                        const svgImg = document.getElementById('floor-svg');
                        if (svgImg) {
                            if (window.roomManager?.getSvgForFloor) {
                                svgImg.src = `svg/${window.roomManager.getSvgForFloor(room.floor)}`;
                            } else {
                                svgImg.src = `svg/${room.floor}og.svg`;
                            }
                        }
                        const marker = document.getElementById('room-marker');
                        let pos = window.roomManager?.getRoomPosition?.(displayNumber);
                        if (!pos && room && (room.x !== undefined || room.y !== undefined)) {
                            pos = { x: room.x, y: room.y };
                        }
                        if (marker && pos?.x && pos?.y) {
                            marker.style.display = 'block';
                            marker.style.left = pos.x + '%';
                            marker.style.top = pos.y + '%';
                        }
                    } catch (e) {
                        console.warn('Marker placement failed', e);
                    }
                }, 60);
                
                currentRoom = room;
                currentRoomNumber = displayNumber;
                trackEvent('room_search_success', { room_id: displayNumber, query: roomNumber });
                setDashboardLastEvent('Room search success', `${roomNumber} → ${displayNumber}`);
                updateTechDashboard();

                getEmergencyPlanFromBackend(displayNumber)
                    .then((backendSafety) => backendSafety || getEmergencyPlan(displayNumber))
                    .then((safety) => {
                        if (safety) openSafetyViewer(safety.url, displayNumber);
                    });
                
                const navText = buildNavigationText(room) || '';
                const speakMsg = `${currentLanguage === 'de' ? 'Zimmer gefunden' : currentLanguage === 'en' ? 'Room found' : 'Habitación encontrada'} ${displayNumber}. ${navText}`.trim();
                speakText(speakMsg);
            } else {
                resultBox.innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        ${runtimeNotice}
                        <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: var(--danger); margin-bottom: 1rem;"></i>
                        <h3 style="color: var(--danger); margin-bottom: 0.5rem;">${t('room_not_found')}</h3>
                        <p>${t('room_not_found')}: ${roomNumber}</p>
                    </div>
                `;
                trackEvent('room_search_fail', { query: roomNumber });
                setDashboardLastEvent('Room search failed', roomNumber);
                updateTechDashboard();
            }
            resultBox.classList.add('visible');
        }
        
        function showExampleRooms() {
            const resultBox = document.getElementById('search-result');
            if (!resultBox) return;
            let html = `<div style="margin-bottom:2rem;"><h3 style="color:var(--accent); margin-bottom:1.5rem;">${t('show_examples')}</h3><div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px,1fr)); gap:1rem;">`;
            Object.entries(window.roomsDatabase).forEach(([num, rm]) => {
                html += `<div style="background:rgba(255,255,255,0.05); padding:1.5rem; border-radius:var(--border-radius); cursor:pointer; border:1px solid rgba(251,191,36,0.1);" onclick="searchRoomNumber('${num}')" onmouseover="this.style.borderColor='var(--accent)'; this.style.transform='translateY(-3px)'" onmouseout="this.style.borderColor='rgba(251,191,36,0.1)'; this.style.transform='translateY(0)'"><div style="font-size:1.5rem; font-weight:bold; color:var(--accent);">${num}</div><div style="color:#94a3b8; font-size:0.9rem;">${rm.floor}. OG</div>${rm.accessible ? '<div style="color:var(--accent); margin-top:0.5rem;"><i class="fas fa-wheelchair"></i> ' + t('accessible_rooms_title') + '</div>' : ''}</div>`;
            });
            html += `</div></div>`;
            resultBox.innerHTML = html;
            resultBox.classList.add('visible');
            showSection('room-search');
        }
        
        function speakNavigation(roomNumber) {
            const room = window.roomsDatabase[roomNumber];
            if (room?.navigation) speakText(room.navigation[currentLanguage] || room.navigation.de);
        }
        
        function speakCurrentSection() {
            const active = document.querySelector('.section.active');
            if (active) speakText(active.innerText.replace(/\s+/g,' ').substring(0,500));
        }
        
        function speakPageTitle() { speakText(document.title); }
        
        function speakText(text, languageOverride = null) {
            if (!text || !('speechSynthesis' in window)) return;
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            const lang = languageOverride || currentLanguage;
            utterance.lang = lang === 'de' ? 'de-DE' : lang === 'en' ? 'en-US' : 'es-ES';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
        
        function toggleVoiceAssistant() {
            if (!isVoiceListening) {
                speakText(fxText('voice_assistant_start'));
            }
            startListening(currentLanguage === 'de' ? 'de-DE' : currentLanguage === 'en' ? 'en-US' : 'es-ES');
        }

        function startListening(lang = 'de-DE') {
            if (!SpeechRecognitionAPI) {
                showNotification(t('voice_not_supported'), 'error');
                return;
            }

            if (isVoiceListening) { stopVoiceRecognition(); return; }
            startVoiceRecognition(lang);
        }
        
        function startVoiceRecognition(lang) {
            recognition = new SpeechRecognitionAPI();
            recognition.lang = lang || (currentLanguage === 'de' ? 'de-DE' : currentLanguage === 'en' ? 'en-US' : 'es-ES');
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.onstart = () => {
                isVoiceListening = true;
                document.getElementById('voice-btn')?.classList.add('listening');
                document.getElementById('mic-icon')?.classList.add('fa-microphone-slash');
                const micBadge = document.getElementById('mic-active-indicator');
                if (micBadge) {
                    micBadge.textContent = 'MIC ACTIVE';
                    micBadge.classList.add('active');
                }
                showNotification(t('voice_listening'), 'info');
            };
            recognition.onresult = (e) => {
                const transcript = String(e.results?.[0]?.[0]?.transcript || '').trim();
                const nums = transcript.match(/\d+/g);
                if (nums?.[0]) {
                    const roomNum = nums[0].padStart(3,'0');
                    document.getElementById('room-input').value = roomNum;
                    document.getElementById('roomInput').value = roomNum;
                    searchRoomNumber(roomNum);
                } else {
                    showNotification(`${fxText('voice_heard_prefix')}: ${transcript}`, 'success');
                    speakText(transcript);
                }
            };
            recognition.onerror = () => showNotification(t('voice_not_supported'), 'error');
            recognition.onend = stopVoiceRecognition;
            recognition.start();
        }
        
        function stopVoiceRecognition() {
            isVoiceListening = false;
            document.getElementById('voice-btn')?.classList.remove('listening');
            document.getElementById('mic-icon')?.classList.remove('fa-microphone-slash');
            const micBadge = document.getElementById('mic-active-indicator');
            if (micBadge) {
                micBadge.textContent = 'MIC OFF';
                micBadge.classList.remove('active');
            }
        }

        function toggleNewspaperQR() {
            if (!hasQRCodeLib()) {
                showNewspaperQrFallback();
                showNotification(
                    currentLanguage === 'de' ? 'QR-Modul nicht geladen. Nutze Fallback-Bild: img/ai-robot-smiley.gif'
                    : currentLanguage === 'en' ? 'QR module not loaded. Using fallback image: img/ai-robot-smiley.gif'
                    : 'Módulo QR no cargado. Usando imagen de respaldo: img/ai-robot-smiley.gif',
                    'info'
                );
                return;
            }
            const panel = document.getElementById('newspaper-qr-panel');
            const canvas = document.getElementById('newspaper-qr-canvas');
            const fallback = document.getElementById('newspaper-qr-fallback');
            if (!panel || !canvas) return;

            const isHidden = panel.style.display === 'none' || !panel.style.display;
            if (!isHidden) {
                panel.style.display = 'none';
                return;
            }

            const url = 'https://www.sharemagazines.de/lesen';
            QRCode.toCanvas(canvas, url, { width: 180, margin: 2 }, (error) => {
                if (error) {
                    showNewspaperQrFallback();
                    showNotification('Newspaper QR konnte nicht generiert werden, statisches Bild wird genutzt', 'warn');
                    return;
                }
                canvas.style.display = 'block';
                if (fallback) fallback.style.display = 'none';
                panel.style.display = 'block';
                showNotification('Newspaper QR ist bereit', 'success');
            });
        }

        function openNewspaperSection() {
            showSection('qr-codes');
            const panel = document.getElementById('newspaper-qr-panel');
            if (panel && panel.style.display !== 'block') {
                setTimeout(() => toggleNewspaperQR(), 120);
            }
        }

        function openExternalLink(url) {
            if (!url) return;
            window.open(url, '_blank', 'noopener');
        }

        function openFrontOfficeCall() {
            window.location.href = 'tel:156';
        }

        function hasQRCodeLib() {
            return typeof window.QRCode !== 'undefined' && typeof window.QRCode.toCanvas === 'function';
        }

        function sendHousekeepingRequest(requestId) {
            const request = HOUSEKEEPING_REQUESTS.find(item => item.id === requestId);
            if (!request) return;
            const statusNode = document.getElementById('housekeeping-status');
            const label = fxText(request.labelKey);
            if (statusNode) {
                statusNode.textContent = `${fxText('housekeeping_sent_prefix')}: ${label}. ${fxText('housekeeping_team_suffix')}`;
            }
            showNotification(`✅ ${label}`, 'success');
        }

        function sendHousekeepingFeedback() {
            const statusNode = document.getElementById('housekeeping-status');
            if (statusNode) {
                statusNode.textContent = fxText('housekeeping_feedback_sent');
            }
            showNotification(`❤️ ${fxText('housekeeping_feedback')}`, 'success');
        }

        function initHousekeepingModule() {
            const grid = document.getElementById('housekeeping-request-grid');
            if (!grid) return;

            grid.innerHTML = '';
            HOUSEKEEPING_REQUESTS.forEach((request) => {
                const button = document.createElement('button');
                button.className = 'btn hk-request-btn';
                button.type = 'button';
                button.innerHTML = `<span class="hk-request-icon">${request.icon}</span><span>${fxText(request.labelKey)}</span>`;
                button.addEventListener('click', () => sendHousekeepingRequest(request.id));
                grid.appendChild(button);
            });

            const statusNode = document.getElementById('housekeeping-status');
            if (statusNode) statusNode.textContent = fxText('housekeeping_status_default');
        }

        function getAllergenLabel(allergenId) {
            const filter = BREAKFAST_ALLERGEN_FILTERS.find(item => item.id === allergenId);
            return filter ? fxText(filter.labelKey) : allergenId;
        }

        function renderAllergenDishes(filterId = 'all') {
            const dishGrid = document.getElementById('allergen-dish-grid');
            if (!dishGrid) return;

            const visibleDishes = BREAKFAST_DISHES.filter((dish) => {
                if (filterId === 'all') return true;
                return !dish.allergens.includes(filterId);
            });

            dishGrid.innerHTML = '';
            visibleDishes.forEach((dish) => {
                const card = document.createElement('article');
                card.className = 'allergen-dish-card';
                const allergenText = dish.allergens.length
                    ? `${fxText('allergen_contains')}: ${dish.allergens.map(getAllergenLabel).join(', ')}`
                    : fxText('allergen_none_known');
                card.innerHTML = `
                    <div class="allergen-dish-title">${dish.icon} ${fxText(dish.nameKey)}</div>
                    <div class="allergen-dish-meta">${allergenText}</div>
                `;
                dishGrid.appendChild(card);
            });
        }

        function setAllergenFilter(filterId = 'all') {
            document.querySelectorAll('.allergen-filter-btn').forEach((button) => {
                const isActive = button.getAttribute('data-filter') === filterId;
                button.classList.toggle('active', isActive);
            });
            renderAllergenDishes(filterId);
            if (filterId !== 'all') {
                showNotification(`Filter aktiv: ${getAllergenLabel(filterId)}`, 'info');
            }
        }

        function initBreakfastGuideModule() {
            const filterBar = document.getElementById('allergen-filter-bar');
            if (!filterBar) return;

            filterBar.innerHTML = '';
            BREAKFAST_ALLERGEN_FILTERS.forEach((filter) => {
                const button = document.createElement('button');
                button.className = `btn allergen-filter-btn${filter.id === 'all' ? ' active' : ''}`;
                button.type = 'button';
                button.setAttribute('data-filter', filter.id);
                button.textContent = `${filter.icon} ${fxText(filter.labelKey)}`;
                button.addEventListener('click', () => setAllergenFilter(filter.id));
                filterBar.appendChild(button);
            });

            renderAllergenDishes('all');
        }

        function openHistoryPoiOnMap(poiId) {
            const poi = HISTORY_POIS[poiId];
            if (!poi) return;
            showSection('floor-plans');
            loadFloor(poi.floor);
            showNotification(`${poi.message} (${poi.location})`, 'info');
            // Show cross-sell for Reichshof book when viewing memorial plaque
            if (poiId === 'langer_memorial') {
                setTimeout(() => {
                    const crossSellDiv = document.getElementById('book-cross-sell');
                    const crossSellText = document.getElementById('book-cross-sell-text');
                    if (crossSellDiv) {
                        crossSellDiv.style.display = 'block';
                        crossSellDiv.style.animation = 'fadeIn 0.5s ease-in';
                    }
                    if (crossSellText) {
                        crossSellText.innerHTML = `<i class="fas fa-book" style="margin-right:0.4rem; color:#b8860b;"></i>${fxText('book_cross_sell_text')}`;
                    }
                }, 800);
            }
        }

        function speakHistoryRoute() {
            const routeText = fxText('audio_route_to_memorial');
            speakText(routeText);
        }

        function showNewspaperQrFallback() {
            const panel = document.getElementById('newspaper-qr-panel');
            const canvas = document.getElementById('newspaper-qr-canvas');
            const fallback = document.getElementById('newspaper-qr-fallback');
            if (canvas) canvas.style.display = 'none';
            if (fallback) fallback.style.display = 'block';
            if (panel) panel.style.display = 'block';
        }

        function openStadtRestaurantPage() {
            openExternalLink(HOTEL_LINKS.stadtRestaurantPage);
        }

        function openRestaurantMenu() {
            openExternalLink(HOTEL_LINKS.stadtRestaurantMenuPdf);
        }

        function openRestaurantReservation() {
            openExternalLink(HOTEL_LINKS.stadtRestaurantPage);
            showNotification(
                currentLanguage === 'de'
                    ? 'Stadt-Restaurant · Tel: +49 40 370 2590 · Di–Sa 18–23 Uhr'
                    : currentLanguage === 'en'
                        ? 'Stadt Restaurant · Phone: +49 40 370 2590 · Tue–Sat 6pm–11pm'
                        : 'Stadt Restaurant · Tel: +49 40 370 2590 · Mar–Sáb 18:00–23:00',
                'info'
            );
        }

        function openEmilsPage() {
            openExternalLink(HOTEL_LINKS.emilsPage);
        }

        function openEmilsFoodMenu() {
            openExternalLink(HOTEL_LINKS.emilsFoodMenuPdf);
        }

        function openEmilsDrinksMenu() {
            openExternalLink(HOTEL_LINKS.emilsDrinksMenuPdf);
        }

        function openAfternoonTeaCard() {
            openExternalLink(HOTEL_LINKS.afternoonTeaPdf);
            showNotification(
                currentLanguage === 'de'
                    ? 'Martha’s Afternoon Tea · 35€ · Mo–So 12–18 Uhr · Vorbestellung: +49 40 370 2590'
                    : currentLanguage === 'en'
                        ? 'Martha’s Afternoon Tea · €35 · Mon–Sun 12pm–6pm · Pre-order: +49 40 370 2590'
                        : 'Martha’s Afternoon Tea · 35€ · Lun–Dom 12:00–18:00 · Reserva previa: +49 40 370 2590',
                'info'
            );
        }

        function openBar1910Page() {
            openExternalLink(HOTEL_LINKS.bar1910Page);
        }

        function openBar1910Menu() {
            openExternalLink(HOTEL_LINKS.bar1910MenuPdf);
        }

        function openSpaPriceList() {
            openExternalLink(HOTEL_LINKS.spaPriceListPdf);
        }

        function showSpaContact() {
            showNotification(
                currentLanguage === 'de'
                    ? 'Spa Kontakt: Rezeption · +49 40 370 2590 · info@hamburg-reichshof.com'
                    : currentLanguage === 'en'
                        ? 'Spa contact: Reception · +49 40 370 2590 · info@hamburg-reichshof.com'
                        : 'Contacto Spa: Recepción · +49 40 370 2590 · info@hamburg-reichshof.com',
                'info'
            );
        }

        function openGiftVouchers() {
            openExternalLink(HOTEL_LINKS.vouchers);
        }

        function openClubReichshof() {
            openExternalLink(HOTEL_LINKS.clubReichshof);
        }

        function openOffersPage() {
            openExternalLink(HOTEL_LINKS.offers);
        }
        
        function toggleHighContrast() {
            document.body.classList.toggle('high-contrast');
            localStorage.setItem('highContrast', document.body.classList.contains('high-contrast'));
            showNotification(t(document.body.classList.contains('high-contrast') ? 'high_contrast_on' : 'high_contrast_off'), 'info');
        }
        
        function increaseFontSize() { adjustFontSize(2); }
        function decreaseFontSize() { adjustFontSize(-2); }
        function resetFontSize() { adjustFontSize(0); }
        
        function adjustFontSize(delta) {
            let size = parseInt(localStorage.getItem('fontSize')) || 16;
            if (delta === 0) size = 16;
            else size = Math.min(Math.max(size + delta, 12), 24);
            document.documentElement.style.fontSize = size + 'px';
            localStorage.setItem('fontSize', size);
            currentFontSize = size;
            showNotification(t(delta > 0 ? 'font_increased' : delta < 0 ? 'font_decreased' : 'font_reset'), 'info');
        }
        
        function toggleBlueFilter() {
            let f = document.getElementById('blue-filter');
            if (!f) {
                f = document.createElement('div');
                f.id = 'blue-filter';
                f.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,100,255,0.1); pointer-events:none; z-index:9998; display:none;';
                document.body.appendChild(f);
            }
            f.style.display = f.style.display === 'none' ? 'block' : 'none';
            localStorage.setItem('blueFilter', f.style.display !== 'none');
            showNotification(t(f.style.display !== 'none' ? 'blue_filter_on' : 'blue_filter_off'), 'info');
        }

        function isVisualRestoreEnabled() {
            return localStorage.getItem(VISUAL_RESTORE_KEY) === 'true';
        }

        function applyDefaultVisualMode() {
            document.body.classList.remove('high-contrast');
            const blueFilterLayer = document.getElementById('blue-filter');
            if (blueFilterLayer) blueFilterLayer.style.display = 'none';
            currentFontSize = 16;
            document.documentElement.style.fontSize = '16px';
        }

        function updateVisualRestoreButton() {
            const button = document.getElementById('restore-visual-btn');
            const label = document.getElementById('restore-visual-label');
            if (!button || !label) return;

            const enabled = isVisualRestoreEnabled();
            label.textContent = enabled ? t('visual_restore_on') : t('visual_restore_off');
            button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
            button.classList.toggle('active', enabled);
        }

        function toggleVisualRestore() {
            const enabled = !isVisualRestoreEnabled();
            localStorage.setItem(VISUAL_RESTORE_KEY, enabled ? 'true' : 'false');
            if (!enabled) {
                applyDefaultVisualMode();
            }
            updateVisualRestoreButton();
            showNotification(
                enabled
                    ? (currentLanguage === 'de' ? 'Auto-Restore aktiviert' : currentLanguage === 'en' ? 'Auto-restore enabled' : 'Auto-restauración activada')
                    : (currentLanguage === 'de' ? 'Auto-Restore deaktiviert' : currentLanguage === 'en' ? 'Auto-restore disabled' : 'Auto-restauración desactivada'),
                'info'
            );
        }
        
        function resetAccessibility() {
            document.body.classList.remove('high-contrast');
            localStorage.removeItem('highContrast');
            resetFontSize();
            const f = document.getElementById('blue-filter');
            if (f) { f.style.display = 'none'; localStorage.removeItem('blueFilter'); }
            showNotification(t('accessibility_reset_done'), 'success');
        }
        
        function loadFloor(floorNumber) {
            currentFloor = floorNumber;
            document.querySelectorAll('.floor-tab').forEach((t,i) => t.classList.toggle('active', i === floorNumber));
            const container = document.getElementById('svg-container');
            if (!container) return;
            container.innerHTML = `<div class="map-placeholder"><i class="fas fa-spinner fa-spin" style="font-size:3rem; color:var(--accent);"></i><h3>${t('floor_plan_placeholder_title')}</h3><p>${t('floor_plan_placeholder_text')}</p></div>`;
            setTimeout(() => {
                const roomsOnFloor = Object.entries(window.roomsDatabase).filter(([,r]) => parseInt(r.floor) === floorNumber);
                let html = `<div style="padding:2rem; text-align:center;"><h3 style="color:var(--accent); margin-bottom:1.5rem;">${['EG','1. OG','2. OG','3. OG','4. OG','5. OG','6. OG'][floorNumber] || t('floor')}</h3>`;
                
                // NOVO: Dugmad za LIFT i TH označavanje
                html += `
                    <div style="margin-bottom: 2rem; padding: 1rem; background: rgba(251,191,36,0.1); border-radius: var(--border-radius); border: 1px solid rgba(251,191,36,0.3);">
                        <h4 style="color: var(--accent); margin-bottom: 1rem; font-size: 1.1rem;">📍 Referentne točke označavanje</h4>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">
                            <button class="btn" onclick="openReferencePointsPanel(${floorNumber})" style="font-size: 0.9rem;">
                                <i class="fas fa-map-marker-alt"></i> Panel referentnih točaka
                            </button>
                            <button class="btn" onclick="setLiftMarker(${floorNumber})" style="font-size: 0.9rem; background: #3b82f6;">
                                🛗 LIFT markieren
                            </button>
                            <button class="btn" onclick="setTHMarker(${floorNumber}, 'NORTH')" style="font-size: 0.9rem; background: #22c55e;">
                                🚪 TH Nord
                            </button>
                            <button class="btn" onclick="setTHMarker(${floorNumber}, 'SOUTH')" style="font-size: 0.9rem; background: #22c55e;">
                                🚪 TH Süd
                            </button>
                            <button class="btn" onclick="displayAllReferencePointsOnFloor(${floorNumber})" style="font-size: 0.9rem;">
                                👁️ Prikaži sve
                            </button>
                        </div>
                    </div>
                `;
                
                if (roomsOnFloor.length) {
                    html += `<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(120px,1fr)); gap:1rem;">`;
                    roomsOnFloor.forEach(([num, r]) => {
                        html += `<div style="background:${r.accessible ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.05)'}; border:2px solid ${r.accessible ? 'var(--accent)' : 'var(--secondary)'}; border-radius:var(--border-radius); padding:1.5rem 1rem; text-align:center; cursor:pointer;" onclick="searchRoomNumber('${num}')"><div style="font-size:1.5rem; font-weight:bold; color:${r.accessible ? 'var(--accent)' : 'white'};">${num}</div>${r.accessible ? '<div style="color:var(--accent); margin-top:0.5rem;"><i class="fas fa-wheelchair"></i></div>' : ''}</div>`;
                    });
                    html += `</div><p style="margin-top:2rem;">${roomsOnFloor.length} Zimmer | <span style="color:var(--accent);">${roomsOnFloor.filter(([,r]) => r.accessible).length} ${t('accessible_rooms_title')}</span></p>`;
                } else {
                    html += `<div style="padding:3rem; color:#94a3b8;"><i class="fas fa-door-closed" style="font-size:3rem;"></i><p>${t('room_not_found')}</p></div>`;
                }
                container.innerHTML = html;
                trackEvent('floor_view', { floor: floorNumber });
            }, 300);
        }
        
        function showQRInfo(qrId) {
            const map = {
                'zimmer-212': t('room_212_desc'),
                'zimmer-218': t('room_218_desc'),
                'zimmer-318': t('room_318_desc'),
                'bereich-restaurant': t('restaurant_access_desc'),
                'bereich-spa': t('spa_access_desc'),
                'notfall-info': t('emergency_info_desc'),
                'wc-barrierefrei': t('accessible_wc_desc'),
                'lageplan-eg': t('floor_plan_eg_desc')
            };
            showNotification(map[qrId] || 'QR-Information', 'info');
            showSection('qr-codes');
        }

        function getQrRuntimeNoticeHtml() {
            if (!navigator.onLine) {
                return `<div style="margin: 0 0 1rem 0; padding: 0.75rem 0.95rem; border: 1px solid rgba(245, 158, 11, 0.5); border-radius: var(--border-radius); background: rgba(245, 158, 11, 0.12); color: #fde68a;"><i class="fas fa-wifi-slash" style="margin-right: 8px;"></i>${t('offline_mode')}</div>`;
            }
            if (!isHttpContext) {
                return `<div style="margin: 0 0 1rem 0; padding: 0.75rem 0.95rem; border: 1px solid rgba(59, 130, 246, 0.45); border-radius: var(--border-radius); background: rgba(59, 130, 246, 0.12); color: #bfdbfe;"><i class="fas fa-file-alt" style="margin-right: 8px;"></i>${t('local_mode_notice')}</div>`;
            }
            return '';
        }

        function updateQrRuntimeNotice(targetElementId = 'qr-status') {
            const statusNode = document.getElementById(targetElementId);
            if (!statusNode) return;
            const notice = getQrRuntimeNoticeHtml();
            if (!notice) return;
            statusNode.innerHTML = `${notice}${statusNode.innerHTML || ''}`;
        }

        function updateQrRuntimeBadge() {
            const badge = document.getElementById('qr-runtime-badge');
            if (!badge) return;

            if (!navigator.onLine) {
                badge.style.border = '1px solid rgba(245,158,11,0.5)';
                badge.style.background = 'rgba(245,158,11,0.12)';
                badge.style.color = '#fde68a';
                badge.innerHTML = `<i class="fas fa-wifi-slash" style="margin-right: 8px;"></i>${t('offline_mode')}`;
                return;
            }

            if (!isHttpContext) {
                badge.style.border = '1px solid rgba(59,130,246,0.45)';
                badge.style.background = 'rgba(59,130,246,0.12)';
                badge.style.color = '#bfdbfe';
                badge.innerHTML = `<i class="fas fa-file-alt" style="margin-right: 8px;"></i>${t('local_mode_notice')}`;
                return;
            }

            badge.style.border = '1px solid rgba(34,197,94,0.4)';
            badge.style.background = 'rgba(34,197,94,0.12)';
            badge.style.color = '#86efac';
            badge.innerHTML = `<i class="fas fa-circle" style="margin-right: 8px;"></i>${t('qr_online_ready')}`;
        }
        
        function generateRoomQR() {
            if (!hasQRCodeLib()) {
                showNotification(
                    currentLanguage === 'de' ? 'QR-Modul nicht geladen (CDN). Bitte Seite neu laden.'
                    : currentLanguage === 'en' ? 'QR module not loaded (CDN). Please reload the page.'
                    : 'Módulo QR no cargado (CDN). Vuelva a cargar la página.',
                    'error'
                );
                return;
            }
            const input = document.getElementById('qr-room-input');
            if (!input?.value) { showNotification(t('qr_room_placeholder'), 'error'); return; }
            const roomNumber = input.value.trim();
            const roomId = window.roomsDatabase[roomNumber] ? roomNumber : window.roomMapping[roomNumber];
            if (!roomId) { showNotification(t('room_not_found'), 'error'); return; }
            const url = `${window.location.origin}?room=${roomId}`;
            const resultDiv = document.getElementById('qr-result');
            resultDiv.innerHTML = '';

            const runtimeNotice = getQrRuntimeNoticeHtml();
            if (runtimeNotice) {
                const noticeWrap = document.createElement('div');
                noticeWrap.innerHTML = runtimeNotice;
                resultDiv.appendChild(noticeWrap);
            }

            const canvas = document.createElement('canvas');
            canvas.style.cssText = 'display:block; margin:0 auto; border:1px solid var(--secondary); border-radius:var(--border-radius); padding:10px; background:white;';
            QRCode.toCanvas(canvas, url, { width:200, margin:2 }, (err) => {
                if (err) { showNotification(t('qr_generate'), 'error'); return; }
                resultDiv.appendChild(canvas);
                const btn = document.createElement('button');
                btn.className = 'btn gold-bg';
                btn.style.marginTop = '1rem';
                btn.innerHTML = '<i class="fas fa-download"></i> ' + t('qr_generate');
                btn.onclick = () => {
                    const a = document.createElement('a');
                    a.download = `zimmer-${roomId}-qr.png`;
                    a.href = canvas.toDataURL('image/png');
                    a.click();
                };
                resultDiv.appendChild(btn);
                showNotification(t('qr_generate') + ' ' + roomId, 'success');
                trackEvent('qr_generated', { room_id: roomId });
            });
        }
        
        function generateSpecificQR(roomNumber) {
            const input = document.getElementById('qr-room-input');
            if (input) input.value = roomNumber;
            generateRoomQR();
            showSection('qr-codes');
        }

        function generateConciergeQR() {
            if (!hasQRCodeLib()) {
                showNotification(
                    currentLanguage === 'de' ? 'QR-Modul nicht geladen (CDN). Bitte Seite neu laden.'
                    : currentLanguage === 'en' ? 'QR module not loaded (CDN). Please reload the page.'
                    : 'Módulo QR no cargado (CDN). Vuelva a cargar la página.',
                    'error'
                );
                return;
            }
            const roomInput = document.getElementById('roomNumberInput');
            const canvas = document.getElementById('qr-canvas');
            const container = document.getElementById('qrcode-container');
            const statusText = document.getElementById('qr-status');
            const printBtn = document.getElementById('printButton');

            if (!roomInput || !canvas || !container || !statusText || !printBtn) return;

            const room = roomInput.value.trim();
            if (!room) {
                showNotification(
                    currentLanguage === 'de' ? 'Bitte Zimmernummer eingeben!' :
                    currentLanguage === 'en' ? 'Please enter a room number!' :
                    '¡Introduzca un número de habitación!',
                    'error'
                );
                return;
            }

            const url = `${window.location.origin}${window.location.pathname}?room=${room}`;
            QRCode.toCanvas(canvas, url, { width: 200, margin: 2 }, (error) => {
                if (error) {
                    showNotification(
                        currentLanguage === 'de' ? 'QR-Fehler' :
                        currentLanguage === 'en' ? 'QR error' :
                        'Error de QR',
                        'error'
                    );
                    return;
                }
                container.style.visibility = 'visible';
                printBtn.style.visibility = 'visible';
                const printRoom = document.getElementById('print-room-num');
                if (printRoom) printRoom.innerText = room;
                const readyText = currentLanguage === 'de'
                    ? `QR-Code für <strong>Zimmer ${room}</strong> ist bereit.<br>Scannen für personalisierten Guide.`
                    : currentLanguage === 'en'
                        ? `QR code for <strong>room ${room}</strong> is ready.<br>Scan for personalized guidance.`
                        : `El código QR para la <strong>habitación ${room}</strong> está listo.<br>Escanéelo para una guía personalizada.`;
                statusText.innerHTML = readyText;
                statusText.style.color = '#00F2FF';
                updateQrRuntimeNotice('qr-status');
            });
        }

        function printQRCodeDirect() {
            window.print();
        }

        function printQRCode() {
            openPinModal('qr');
        }
        
        function filterGallery(cat) {
            document.querySelectorAll('.gallery-filter .btn').forEach(b => b.classList.remove('active'));
            event.target.classList.add('active');
            document.querySelectorAll('.gallery-item').forEach(i => i.style.display = (cat === 'all' || i.dataset.category === cat) ? 'block' : 'none');
        }
        
        function showNotification(message, type = 'info', duration = 4000) {
            const n = document.getElementById('notification');
            if (!n) return;
            n.textContent = message;
            n.className = `notification ${type} show`;
            n.style.display = 'block';
            setTimeout(() => { n.classList.remove('show'); n.style.display = 'none'; }, duration);
        }
        
        function updateConnectionStatus() {
            const ind = document.getElementById('offline-indicator');
            const st = document.getElementById('connection-status');
            if (!navigator.onLine) {
                ind?.classList.add('show');
                if (st) { st.textContent = t('offline'); st.style.color = 'var(--danger)'; }
                showNotification(t('offline'), 'error');
            } else {
                ind?.classList.remove('show');
                if (st) { st.textContent = t('online'); st.style.color = 'var(--success)'; }
            }
            updateQrRuntimeBadge();
        }
        
        function registerServiceWorker() {
            if (isHttpContext && 'serviceWorker' in navigator) {
                navigator.serviceWorker.register('service-worker.js').catch(e => console.warn('SW not registered'));
            }
        }
        
        function requestNotificationPermission() {
            if (!('Notification' in window)) return;
            Notification.requestPermission().then(p => {
                showNotification(p === 'granted' ? t('enable_push') : t('voice_not_supported'), p === 'granted' ? 'success' : 'error');
            });
        }
        
        function initAnalytics() {
            let d = JSON.parse(localStorage.getItem(CONFIG.analyticsKey) || '{}');
            d.visits = (d.visits||0)+1;
            d.lastVisit = new Date().toISOString();
            localStorage.setItem(CONFIG.analyticsKey, JSON.stringify(d));
        }
        
        function trackEvent(name, details = {}) {
            let d = JSON.parse(localStorage.getItem(CONFIG.analyticsKey) || '{}');
            d.events = d.events || [];
            d.events.push({ name, details, timestamp: new Date().toISOString(), language: currentLanguage });
            if (d.events.length > 100) d.events = d.events.slice(-100);
            localStorage.setItem(CONFIG.analyticsKey, JSON.stringify(d));
        }
        
        function toggleAnalytics() {
            const panel = document.getElementById('analytics-panel');
            const overlay = document.getElementById('analytics-overlay');
            const isShown = panel.style.display === 'block';
            panel.style.display = isShown ? 'none' : 'block';
            overlay.style.display = isShown ? 'none' : 'block';
            if (!isShown) displayAnalytics();
        }
        
        function displayAnalytics() {
            const d = JSON.parse(localStorage.getItem(CONFIG.analyticsKey) || '{}');
            const ev = d.events || [];
            document.getElementById('analytics-content').innerHTML = `<div>Besuche: ${d.visits||0}</div><div>Suchen: ${ev.filter(e => e.name === 'room_search_success').length}</div><div>Letzter Besuch: ${d.lastVisit ? new Date(d.lastVisit).toLocaleString('de-DE') : 'Nie'}</div><details><summary>Events</summary><ul>${ev.slice(-10).map(e => `<li>${e.timestamp.split('T')[1].split('.')[0]} - ${e.name}</li>`).join('')}</ul></details><button onclick="localStorage.removeItem(CONFIG.analyticsKey); displayAnalytics();">Daten löschen</button>`;
        }
        
        function showAnalyticsPanel() { toggleAnalytics(); }

        function getRouteLookupKeys(roomId) {
            const primary = String(roomId || '').trim();
            if (!primary) return [];
            const keys = new Set([primary]);
            const mapped = window.roomMapping?.[primary];
            if (mapped) keys.add(String(mapped));
            const reverse = Object.entries(window.roomMapping || {}).find(([, newNum]) => String(newNum) === primary);
            if (reverse?.[0]) keys.add(String(reverse[0]));
            return [...keys];
        }

        async function loadManualRoutes() {
            let fileRoutes = {};
            if (isHttpContext) {
                try {
                    const response = await fetch('manual-room-routes.json');
                    if (response.ok) {
                        const parsed = await response.json();
                        if (parsed && typeof parsed === 'object') fileRoutes = parsed;
                    }
                } catch (_) {
                }
            }

            let localRoutes = {};
            try {
                localRoutes = JSON.parse(localStorage.getItem(MANUAL_ROUTES_KEY) || '{}');
            } catch (_) {
                localRoutes = {};
            }

            manualRoomRoutes = { ...fileRoutes, ...localRoutes };
        }

        async function loadRouteLogicConfig() {
            let fileConfig = {};
            if (isHttpContext) {
                try {
                    const response = await fetch('manual-route-logic.json');
                    if (response.ok) {
                        const parsed = await response.json();
                        if (parsed && typeof parsed === 'object') fileConfig = parsed;
                    }
                } catch (_) {
                }
            }

            let localConfig = {};
            try {
                localConfig = JSON.parse(localStorage.getItem(ROUTE_LOGIC_STORAGE_KEY) || '{}');
            } catch (_) {
                localConfig = {};
            }

            routeLogicConfig = { ...fileConfig, ...localConfig };
        }

        function getSearchRuntimeNotice() {
            if (!navigator.onLine) {
                return `<div style="margin: 0 0 1rem 0; padding: 0.85rem 1rem; border: 1px solid rgba(245, 158, 11, 0.5); border-radius: var(--border-radius); background: rgba(245, 158, 11, 0.12); color: #fde68a;"><i class="fas fa-wifi-slash" style="margin-right: 8px;"></i>${t('offline_mode')}</div>`;
            }

            if (!isHttpContext) {
                return `<div style="margin: 0 0 1rem 0; padding: 0.85rem 1rem; border: 1px solid rgba(59, 130, 246, 0.45); border-radius: var(--border-radius); background: rgba(59, 130, 246, 0.12); color: #bfdbfe;"><i class="fas fa-file-alt" style="margin-right: 8px;"></i>${t('local_mode_notice')}</div>`;
            }

            return '';
        }

        function getRouteLogicText(key, lang = currentLanguage) {
            const langPack = routeLogicConfig?.[lang] || {};
            const dePack = routeLogicConfig?.de || {};
            return langPack[key] || dePack[key] || null;
        }

        function generateLogicalRouteText(roomId, lang = currentLanguage) {
            const roomStr = String(roomId || '').trim();
            if (!/^\d{3}$/.test(roomStr)) return null;

            const roomNum = parseInt(roomStr, 10);
            const floor = Math.floor(roomNum / 100);
            const within = (a, b) => roomNum >= a && roomNum <= b;

            if (roomNum === 700 || roomNum === 800) {
                return getRouteLogicText('f7f8_special', lang)?.replaceAll('{room}', roomStr) || null;
            }

            if (floor >= 2 && floor <= 5) {
                if (roomNum % 100 <= 11) {
                    return getRouteLogicText('f2to5_left', lang)
                        ?.replaceAll('{room}', roomStr)
                        ?.replaceAll('{floor}', String(floor)) || null;
                }
                if (roomNum % 100 >= 12 && roomNum % 100 <= 49) {
                    return getRouteLogicText('f2to5_right', lang)
                        ?.replaceAll('{room}', roomStr)
                        ?.replaceAll('{floor}', String(floor)) || null;
                }
            }

            if (floor === 6) {
                if (within(600, 604)) {
                    return getRouteLogicText('f6_left', lang)?.replaceAll('{room}', roomStr) || null;
                }
                if (within(612, 646)) {
                    return getRouteLogicText('f6_right', lang)?.replaceAll('{room}', roomStr) || null;
                }
            }

            if (floor === 1) {
                if (roomNum === 100) {
                    return getRouteLogicText('f1_room100', lang) || null;
                }
                if (within(101, 102)) {
                    return getRouteLogicText('f1_left_101_102', lang)
                        ?.replaceAll('{room}', roomStr) || null;
                }
                if (within(103, 135)) {
                    return getRouteLogicText('f1_right_103_135', lang)
                        ?.replaceAll('{room}', roomStr) || null;
                }
            }

            return null;
        }

        function getManualRouteText(roomId, lang = currentLanguage) {
            const keys = getRouteLookupKeys(roomId);
            for (const key of keys) {
                const entry = manualRoomRoutes?.[key];
                if (!entry) continue;
                if (typeof entry === 'string') return entry;
                if (typeof entry === 'object') {
                    return entry[lang] || entry.de || entry.en || entry.es || null;
                }
            }
            return null;
        }
        
        function buildNavigationText(room) {
            if (!room) return t('templates.generic');
            const id = room.newNumber || Object.keys(window.roomsDatabase).find(k => window.roomsDatabase[k] === room);
            
            // NOVO: Pokušaj koristiti kompletni navigacijski sistem
            if (typeof window.buildCompleteVoiceNavigation === 'function') {
                try {
                    // Async wrapper - trebat će refaktorirati za pravi async poziv kasnije
                    window.buildCompleteVoiceNavigation(id, currentLanguage, room)
                        .then(navText => {
                            if (navText && navText.length > 50) {
                                // Ažuriraj navigacijski tekst ako je dostupan
                                const navContainer = document.querySelector('#search-result .room-info-value:last-child');
                                if (navContainer) {
                                    navContainer.innerHTML = navText;
                                }
                            }
                        })
                        .catch(() => {});
                } catch (e) {
                    console.log('Voice navigation builder not yet loaded');
                }
            }
            
            // POSTOJEĆI FALLBACK SISTEM
            const manualText = getManualRouteText(id, currentLanguage);
            if (manualText) return manualText;
            const logicalText = generateLogicalRouteText(id, currentLanguage);
            if (logicalText) return logicalText;
            if (translations[currentLanguage]?.templates?.rooms?.[id]) {
                return translations[currentLanguage].templates.rooms[id][currentLanguage] || translations[currentLanguage].templates.rooms[id].de || '';
            }
            if (room.navigation) return room.navigation[currentLanguage] || room.navigation.de;
            if (room.floor && parseInt(room.floor) <= 0) return t('templates.spa');
            if (room.accessible) return `${t('templates.generic')} ${t('routes.mainElevator')} ${t('routes.th9Note')}`.trim();
            return t('templates.generic');
        }
        
        function getRoute(start, endRoomNumber) {
            const resolved = window.roomsDatabase[endRoomNumber] ? endRoomNumber : (window.roomMapping[endRoomNumber] || endRoomNumber);
            const room = window.roomsDatabase[resolved];
            if (!room) return t('routes.mainElevator');
            if (parseInt(room.floor) <= 0) return t('routes.spaElevator');
            if (room.accessible) return `${t('routes.mainElevator')} ${t('routes.th9Note')}`;
            return t('routes.mainElevator');
        }
        
        // ============================================
        // HILFSFUNKTIONEN – FALLBACKS FÜR FEHLENDE DEFINITIONEN
        // ============================================
        function initCoordinatePicker() {
            console.info('Coordinate picker ready (manual mapping tools enabled)');
        }
        function populateVoiceSettings() {
            console.log('Voice settings placeholder');
        }
        window.initCoordinatePicker = initCoordinatePicker;
        window.populateVoiceSettings = populateVoiceSettings;
        
        // ============================================
        // EVENT LISTENERS & INIT
        // ============================================
        function setupEventListeners() {
            window.addEventListener('online', updateConnectionStatus);
            window.addEventListener('offline', updateConnectionStatus);
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    showSection('room-search');
                    document.getElementById('room-input')?.focus();
                }
                if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
                    e.preventDefault();
                    const langs = ['de','en','es'];
                    const next = (langs.indexOf(currentLanguage)+1)%langs.length;
                    setLanguage(langs[next]);
                }
            });
            document.getElementById('room-input')?.addEventListener('keypress', e => { if (e.key === 'Enter') searchRoom(); });
            document.getElementById('roomInput')?.addEventListener('keypress', e => { if (e.key === 'Enter') searchRoomGlobal(); });
        }
        
        window.onload = async () => {
            await roomManager.loadRooms();
            await loadManualRoutes();
            await loadRouteLogicConfig();
            updateQrRuntimeBadge();
            const urlParams = new URLSearchParams(window.location.search);
            const roomParam = urlParams.get('room');
            const sectionParam = urlParams.get('section');
            if (sectionParam) showSection(sectionParam);
            if (roomParam) {
                setTimeout(() => {
                    searchRoomNumber(roomParam);
                    document.getElementById('room-search')?.scrollIntoView({ behavior: 'smooth' });
                }, 300);
            }
        };
        
        function initializeApp() {
            console.log('🚀 Reichshof Concierge initializing...');
            const savedLanguage = normalizeLanguageCode(localStorage.getItem(LANGUAGE_STORAGE_KEY) || localStorage.getItem('language'));
            if (savedLanguage) {
                currentLanguage = savedLanguage;
                setLanguage(savedLanguage);
            } else {
                setLanguage(currentLanguage);
            }

            if (FORCE_ORIGINAL_VISUAL_MODE) {
                localStorage.setItem(VISUAL_RESTORE_KEY, 'false');
                localStorage.setItem('blueFilter', 'false');
                localStorage.setItem('highContrast', 'false');
            }

            const shouldRestoreVisual = !FORCE_ORIGINAL_VISUAL_MODE && isVisualRestoreEnabled();
            const savedFontSize = localStorage.getItem('fontSize');
            if (shouldRestoreVisual) {
                if (savedFontSize) {
                    currentFontSize = parseInt(savedFontSize);
                    document.documentElement.style.fontSize = currentFontSize + 'px';
                }
                if (localStorage.getItem('highContrast') === 'true') {
                    document.body.classList.add('high-contrast');
                }
                const blueFilterLayer = document.getElementById('blue-filter');
                if (blueFilterLayer) {
                    blueFilterLayer.style.display = localStorage.getItem('blueFilter') === 'true' ? 'block' : 'none';
                }
            } else {
                applyDefaultVisualMode();
            }

            updateVisualRestoreButton();
            initAnalytics();
            setupEventListeners();
            window.addEventListener('online', updateConnectionStatus);
            window.addEventListener('offline', updateConnectionStatus);
            updateConnectionStatus();
            loadFloor(1);
            localizeFeatureBlocks();
            initHousekeepingModule();
            initBreakfastGuideModule();
            updateRuntimeModeIndicator();
            updateBackendStatusBadge(backendStatusState);
            try { initCoordinatePicker(); } catch (e) { console.warn('initCoordinatePicker not available', e); }
            try { populateVoiceSettings(); } catch (e) { /* ignore */ }
            setTimeout(() => showNotification(t('welcome'), 'info', 5000), 1000);
            updateUI();
            updateTechDashboard();
            console.log('✅ Reichshof Concierge ready!');
        }
        
        // ============================================
        // 15. EXPORT FUNKTIONEN FÜR HTML (UNVERÄNDERT)
        // ============================================
        window.showSection = showSection;
        window.setLanguage = setLanguage;
        window.searchRoom = searchRoom;
        window.searchRoomGlobal = searchRoomGlobal;
        window.searchRoomNumber = searchRoomNumber;
        window.showExampleRooms = showExampleRooms;
        window.loadFloor = loadFloor;
        window.toggleVoiceAssistant = toggleVoiceAssistant;
        window.toggleHighContrast = toggleHighContrast;
        window.increaseFontSize = increaseFontSize;
        window.decreaseFontSize = decreaseFontSize;
        window.resetFontSize = resetFontSize;
        window.toggleBlueFilter = toggleBlueFilter;
        window.toggleVisualRestore = toggleVisualRestore;
        window.resetAccessibility = resetAccessibility;
        window.speakCurrentSection = speakCurrentSection;
        window.speakPageTitle = speakPageTitle;
        window.speakText = speakText;
        window.speakNavigation = speakNavigation;
        window.showQRInfo = showQRInfo;
        window.generateRoomQR = generateRoomQR;
        window.generateSpecificQR = generateSpecificQR;
        window.generateConciergeQR = generateConciergeQR;
        window.printQRCode = printQRCode;
        window.printFireProtocol = printFireProtocol;
        window.requestFireProtocolPin = requestFireProtocolPin;
        window.setManualMarkerForRoom = setManualMarkerForRoom;
        window.copyMarkerToAdjacentFloor = copyMarkerToAdjacentFloor;
        window.verifyRoomMarker = verifyRoomMarker;
        window.clearManualMarkerForRoom = clearManualMarkerForRoom;
        window.exportManualMarkers = exportManualMarkers;
        window.toggleNewspaperQR = toggleNewspaperQR;
        window.openNewspaperSection = openNewspaperSection;
        window.openRestaurantMenu = openRestaurantMenu;
        window.openRestaurantReservation = openRestaurantReservation;
        window.openStadtRestaurantPage = openStadtRestaurantPage;
        window.openEmilsPage = openEmilsPage;
        window.openEmilsFoodMenu = openEmilsFoodMenu;
        window.openEmilsDrinksMenu = openEmilsDrinksMenu;
        window.openAfternoonTeaCard = openAfternoonTeaCard;
        window.openBar1910Page = openBar1910Page;
        window.openBar1910Menu = openBar1910Menu;
        window.openSpaPriceList = openSpaPriceList;
        window.showSpaContact = showSpaContact;
        window.openGiftVouchers = openGiftVouchers;
        window.openClubReichshof = openClubReichshof;
        window.openOffersPage = openOffersPage;
        window.openFrontOfficeCall = openFrontOfficeCall;
        window.sendHousekeepingFeedback = sendHousekeepingFeedback;
        window.sendHousekeepingRequest = sendHousekeepingRequest;
        window.setAllergenFilter = setAllergenFilter;
        window.openHistoryPoiOnMap = openHistoryPoiOnMap;
        window.speakHistoryRoute = speakHistoryRoute;
        window.navigateToSafetyPlan = navigateToSafetyPlan;
        window.activateSOS = activateSOS;
        window.filterGallery = filterGallery;
        window.requestNotificationPermission = requestNotificationPermission;
        window.showAnalyticsPanel = showAnalyticsPanel;
        window.toggleAnalytics = toggleAnalytics;
        window.installPwa = installPwa;
        window.dismissPwaBanner = dismissPwaBanner;
        window.openPinModal = openPinModal;
        window.closePinModal = closePinModal;
        window.submitPinModal = submitPinModal;

        let pendingPrintAction = null;
        const PIN_SESSION_KEY = 'pinSessionUntil';
        const PIN_FAIL_KEY = 'pinFailCount';
        const PIN_LOCK_KEY = 'pinLockUntil';
        const PIN_SESSION_MS = 10 * 60 * 1000;
        const PIN_LOCK_MS = 5 * 60 * 1000;
        const PIN_MAX_FAILS = 3;

        function isPinSessionValid() {
            const until = Number(localStorage.getItem(PIN_SESSION_KEY) || 0);
            return Date.now() < until;
        }

        function isPinLocked() {
            const lockUntil = Number(localStorage.getItem(PIN_LOCK_KEY) || 0);
            return Date.now() < lockUntil;
        }

        function handlePinKeyDown(evt) {
            const modal = document.getElementById('pin-modal');
            if (!modal || modal.style.display !== 'block') return;
            if (evt.key === 'Escape') closePinModal();
        }

        function openPinModal(action) {
            if (isPinSessionValid()) {
                if (action === 'fire-protocol') {
                    printFireProtocol();
                } else if (action === 'qr') {
                    printQRCodeDirect();
                }
                return;
            }
            if (isPinLocked()) {
                showNotification('PIN gesperrt. Bitte spaeter erneut versuchen.', 'error');
                return;
            }
            pendingPrintAction = action;
            const overlay = document.getElementById('pin-modal-overlay');
            const modal = document.getElementById('pin-modal');
            const input = document.getElementById('pin-input');
            const error = document.getElementById('pin-error');
            if (error) error.style.display = 'none';
            if (overlay) overlay.style.display = 'block';
            if (modal) {
                modal.style.display = 'block';
                modal.setAttribute('aria-hidden', 'false');
            }
            if (input) {
                input.value = '';
                input.focus();
                input.onkeydown = (evt) => {
                    if (evt.key === 'Enter') submitPinModal();
                };
            }
            document.addEventListener('keydown', handlePinKeyDown);
        }

        function closePinModal() {
            const overlay = document.getElementById('pin-modal-overlay');
            const modal = document.getElementById('pin-modal');
            if (overlay) overlay.style.display = 'none';
            if (modal) {
                modal.style.display = 'none';
                modal.setAttribute('aria-hidden', 'true');
            }
            pendingPrintAction = null;
            document.removeEventListener('keydown', handlePinKeyDown);
        }

        function submitPinModal() {
            const input = document.getElementById('pin-input');
            const error = document.getElementById('pin-error');
            const pin = input ? input.value.trim() : '';
            if (pin === '1910') {
                localStorage.setItem(PIN_SESSION_KEY, String(Date.now() + PIN_SESSION_MS));
                localStorage.setItem(PIN_FAIL_KEY, '0');
                const action = pendingPrintAction;
                closePinModal();
                if (action === 'fire-protocol') {
                    printFireProtocol();
                } else if (action === 'qr') {
                    printQRCodeDirect();
                }
                return;
            }
            if (error) error.style.display = 'block';
            const fails = Number(localStorage.getItem(PIN_FAIL_KEY) || 0) + 1;
            if (fails >= PIN_MAX_FAILS) {
                localStorage.setItem(PIN_FAIL_KEY, '0');
                localStorage.setItem(PIN_LOCK_KEY, String(Date.now() + PIN_LOCK_MS));
                showNotification('Zu viele Versuche. Bitte 5 Minuten warten.', 'error');
                closePinModal();
                return;
            }
            localStorage.setItem(PIN_FAIL_KEY, String(fails));
            showNotification('Falscher PIN.', 'error');
        }

        function requestFireProtocolPin() {
            openPinModal('fire-protocol');
        }

        function printFireProtocol() {
            const stamp = document.getElementById('fire-protocol-timestamp');
            if (stamp) {
                const now = new Date();
                stamp.textContent = now.toLocaleString('de-DE');
            }
            document.body.classList.add('print-fire-protocol');
            window.print();
        }

        window.addEventListener('afterprint', () => {
            document.body.classList.remove('print-fire-protocol');
        });
        
        // ============================================
        // PWA FUNKTIONEN
        // ============================================
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            setTimeout(() => {
                const banner = document.getElementById('pwa-banner');
                if (banner && deferredPrompt) banner.style.display = 'flex';
            }, 5000);
        });
        
        function installPwa() {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(() => {
                    deferredPrompt = null;
                    dismissPwaBanner();
                });
            }
        }
        
        function dismissPwaBanner() {
            document.getElementById('pwa-banner').style.display = 'none';
        }
        // ============================================
// VOICE SETTINGS MODAL FUNKTIONEN
// ============================================

// Popuni dropdown liste sa dostupnim glasovima
function populateVoiceSelects() {
    const voices = window.speechSynthesis.getVoices();
    const langs = ['de', 'en', 'es'];
    
    langs.forEach(lang => {
        const select = document.getElementById(`voice-select-${lang}`);
        if (!select) return;
        
        select.innerHTML = ''; // OÄisti
        
        // Default opcija
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = lang === 'de' ? 'Standard (automatisch)' : 
                                    lang === 'en' ? 'Default (automatic)' : 'Por defecto (automático)';
        select.appendChild(defaultOption);
        
        // Filtriraj glasove po jeziku
        const langVoices = voices.filter(v => v.lang.startsWith(lang));
        langVoices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            select.appendChild(option);
        });
        
        // Postavi saÄuvani izbor ako postoji
        const saved = localStorage.getItem(`voice_${lang}`);
        if (saved) {
            select.value = saved;
        }
    });
}

// SaÄuvaj izbor glasova
function saveVoiceSelection() {
    const langs = ['de', 'en', 'es'];
    langs.forEach(lang => {
        const select = document.getElementById(`voice-select-${lang}`);
        if (select) {
            localStorage.setItem(`voice_${lang}`, select.value);
        }
    });
    closeVoiceSettings();
    showNotification('Stimmeinstellungen gespeichert', 'success');
}

// Zatvori modal
function closeVoiceSettings() {
    document.getElementById('voice-settings-modal').style.display = 'none';
}

// Otvori modal
function openVoiceSettings() {
    populateVoiceSelects(); // OsvjeÅ¾i listu glasova
    document.getElementById('voice-settings-modal').style.display = 'block';
}

// Pregled glasa za odreÄ‘eni jezik
function previewVoice(lang) {
    const select = document.getElementById(`voice-select-${lang}`);
    const voiceName = select.value;
    
    let text = '';
    if (lang === 'de') text = 'Dies ist eine Vorschau der ausgewählten Stimme.';
    else if (lang === 'en') text = 'This is a preview of the selected voice.';
    else if (lang === 'es') text = 'Esta es una vista previa de la voz seleccionada.';
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voiceName) {
        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = voices.find(v => v.name === voiceName);
        if (selectedVoice) utterance.voice = selectedVoice;
    }
    
    utterance.lang = lang === 'de' ? 'de-DE' : lang === 'en' ? 'en-US' : 'es-ES';
    utterance.rate = 0.9;
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
}

// Modificirana speakText funkcija koja koristi saÄuvani glas
function setSpeechLiveCaption(text = '', active = false) {
    const caption = document.getElementById('speech-live-caption');
    if (!caption) return;

    if (!active || !text) {
        caption.style.display = 'none';
        caption.textContent = '';
        return;
    }

    caption.textContent = text;
    caption.style.display = 'block';
}

function speakText(text, lang = currentLanguage) {
    if (!text || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    
    // Pripremi tekst
    let cleanText = text
        .replace(/(\d{3})/g, (match) => {
            const number = parseInt(match, 10);
            return number.toLocaleString(lang === 'de' ? 'de-DE' : lang === 'en' ? 'en-US' : 'es-ES');
        })
        .replace(/m²/g, 'Quadratmeter')
        .replace(/°C/g, 'Grad Celsius')
        .replace(/&/g, 'und')
        .replace(/\+/g, 'plus')
        .replace(/\//g, ' ')
        .replace(/\./g, '. ')
        .replace(/\s+/g, ' ');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // PokuÅ¡aj koristiti saÄuvani glas
    const savedVoiceName = localStorage.getItem(`voice_${lang}`);
    if (savedVoiceName) {
        const voices = window.speechSynthesis.getVoices();
        const savedVoice = voices.find(v => v.name === savedVoiceName);
        if (savedVoice) utterance.voice = savedVoice;
    }

    if (!utterance.voice) {
        const voices = window.speechSynthesis.getVoices();
        const languagePrefix = (lang || currentLanguage || 'de').toLowerCase();
        const autoVoice = voices.find(v => String(v.lang || '').toLowerCase().startsWith(languagePrefix));
        if (autoVoice) utterance.voice = autoVoice;
    }
    
    utterance.lang = lang === 'de' ? 'de-DE' : lang === 'en' ? 'en-US' : 'es-ES';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    const captionText = cleanText.length > 320 ? `${cleanText.slice(0, 320)}…` : cleanText;
    utterance.onstart = () => setSpeechLiveCaption(captionText, true);
    utterance.onend = () => setSpeechLiveCaption('', false);
    utterance.onerror = () => setSpeechLiveCaption('', false);
    
    window.speechSynthesis.speak(utterance);
}

   // Populate voice lists on load.
    document.addEventListener('DOMContentLoaded', function() {

    // Popuni voice liste nakon Å¡to se glasovi uÄitaju
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = populateVoiceSelects;
    }
    populateVoiceSelects(); // PokuÅ¡aj odmah
 });

    // ============================================
    // MARK REFERENCE POINT (LIFT/TH)
    // ============================================
    function markReferencePoint(floor, pointKey) {
        console.log(`🎯 Marking reference point: ${pointKey} on floor ${floor}`);
        
        // Map floor names to PDF filenames (lowercase in pdf folder)
        const floorPdfMap = {
            'EG': 'pdf/zg.pdf',
            '1OG': 'pdf/1og.pdf',
            '2OG': 'pdf/2og.pdf',
            '3OG': 'pdf/3og.pdf',
            '4OG': 'pdf/4og.pdf',
            '5OG': 'pdf/5og.pdf',
            '6OG': 'pdf/6og.pdf'
        };
        
        const pdfPath = floorPdfMap[floor];
        if (!pdfPath) {
            alert(`Grundriss für ${floor} nicht gefunden!`);
            return;
        }
        
        // Call activateDraggableReferenceMarker from reference-point-manager.js
        if (typeof activateDraggableReferenceMarker === 'function') {
            activateDraggableReferenceMarker(floor, pointKey, pdfPath);
        } else {
            console.error('❌ activateDraggableReferenceMarker not found!');
            alert('Fehler: Reference point manager nicht geladen!');
        }
    }

    // Voice button now starts listening directly.
        // ============================================
        // FINAL INIT
        // ============================================
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof initializeApp === 'function') {
                console.log("🚀 Starte Initialisierung...");
                initializeApp();
            }
            console.log('🎯 Reichshof Concierge v3.0.0 - READY');
        });
    
