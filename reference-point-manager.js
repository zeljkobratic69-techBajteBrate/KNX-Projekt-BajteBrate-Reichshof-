// ============================================
// REFERENCE POINT MANAGER
// ============================================
// Upravljanje LIFT, TH i ostalim referentnim točkama
// ============================================

const REFERENCE_POINT_STORAGE_KEY = 'reichshof_reference_points_coords';

/**
 * Postavlja koordinate za referentnu točku (LIFT, TH, itd.)
 */
function setReferencePointCoords(floor, pointKey, x, y) {
    const coords = getReferencePointsCoords();
    
    if (!coords[floor]) {
        coords[floor] = {};
    }
    
    coords[floor][pointKey] = {
        x: Number(x),
        y: Number(y),
        timestamp: new Date().toISOString(),
        source: 'manual'
    };
    
    localStorage.setItem(REFERENCE_POINT_STORAGE_KEY, JSON.stringify(coords));
    return coords[floor][pointKey];
}

/**
 * Dobavlja sve koordinate referentnih točaka
 */
function getReferencePointsCoords() {
    try {
        const raw = localStorage.getItem(REFERENCE_POINT_STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        return {};
    }
}

/**
 * Dobavlja koordinate specifične referentne točke
 */
function getReferencePointCoords(floor, pointKey) {
    const coords = getReferencePointsCoords();
    return coords[floor]?.[pointKey] || null;
}

/**
 * Briše koordinate referentne točke
 */
function clearReferencePointCoords(floor, pointKey) {
    const coords = getReferencePointsCoords();
    if (coords[floor]?.[pointKey]) {
        delete coords[floor][pointKey];
        localStorage.setItem(REFERENCE_POINT_STORAGE_KEY, JSON.stringify(coords));
    }
}

/**
 * Exportuje sve referentne točke
 */
function exportReferencePoints() {
    const coords = getReferencePointsCoords();
    const blob = new Blob([JSON.stringify(coords, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'reference-points-coords.json';
    link.click();
    URL.revokeObjectURL(url);
    showNotification('Reference points exported', 'success');
}

/**
 * Aktivira draggable marker mode za referentne točke (LIFT, TH)
 */
function activateDraggableReferenceMarker(floorNumber, pointKey, floorKey, title, markerColor, initialX, initialY) {
    // Zatvori postojeći overlay ako postoji
    const existingOverlay = document.getElementById('reference-marker-overlay');
    if (existingOverlay) existingOverlay.remove();
    
    // Stvori overlay
    const overlay = document.createElement('div');
    overlay.id = 'reference-marker-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
    `;
    
    let currentX = initialX || 50;
    let currentY = initialY || 50;
    
    overlay.innerHTML = `
        <div style="background: var(--card-bg); padding: 2rem; border-radius: var(--border-radius); max-width: 900px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
            <h3 style="color: ${markerColor}; margin-bottom: 1.5rem; text-align: center; font-size: 1.3rem;">
                ${title} <span style="color: var(--accent);">(${floorKey})</span>
            </h3>
            
            <div style="position: relative; width: 100%; max-height: 65vh; overflow: auto; border: 3px solid ${markerColor}; border-radius: var(--border-radius); margin-bottom: 1.5rem; background: #1a1a2e; cursor: crosshair;">
                <img id="ref-draggable-map" src="" style="width: 100%; display: block; user-select: none; pointer-events: none;" draggable="false">
                <div id="ref-draggable-marker" style="position: absolute; width: 35px; height: 35px; background: ${markerColor}; border: 5px solid white; border-radius: 50%; transform: translate(-50%, -50%); cursor: grab; box-shadow: 0 0 40px ${markerColor}, 0 0 10px rgba(255,255,255,0.8); z-index: 100; left: ${currentX}%; top: ${currentY}%; transition: transform 0.2s ease, box-shadow 0.2s ease;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-weight: bold; font-size: 18px;">+</div>
                </div>
            </div>
            
            <div style="text-align: center; margin-bottom: 1rem; padding: 0.75rem; background: rgba(59, 130, 246, 0.2); border-radius: 8px;">
                <strong style="color: ${markerColor};">💡 Tipp:</strong> 
                <span style="color: #cbd5e1;">Klicken Sie direkt auf die Karte oder ziehen Sie den Marker</span>
            </div>
            
            <div style="background: rgba(251, 191, 36, 0.1); padding: 1.25rem; border-radius: var(--border-radius); margin-bottom: 1.5rem;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <label style="color: ${markerColor}; font-weight: bold; display: block; margin-bottom: 0.5rem; font-size: 1rem;">
                            X-Koordinate: <span id="ref-current-x">${currentX.toFixed(2)}%</span>
                        </label>
                        <input type="range" id="ref-x-slider" min="0" max="100" step="0.1" value="${currentX}" style="width: 100%;">
                    </div>
                    <div>
                        <label style="color: ${markerColor}; font-weight: bold; display: block; margin-bottom: 0.5rem; font-size: 1rem;">
                            Y-Koordinate: <span id="ref-current-y">${currentY.toFixed(2)}%</span>
                        </label>
                        <input type="range" id="ref-y-slider" min="0" max="100" step="0.1" value="${currentY}" style="width: 100%;">
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem;">
                    <button class="btn" onclick="nudgeRefMarker(-1, 0)" style="font-size: 0.9rem;">
                        ⬅️ Links (1%)
                    </button>
                    <button class="btn" onclick="nudgeRefMarker(1, 0)" style="font-size: 0.9rem;">
                        ➡️ Rechts (1%)
                    </button>
                    <button class="btn" onclick="nudgeRefMarker(0, -1)" style="font-size: 0.9rem;">
                        ⬆️ Oben (1%)
                    </button>
                    <button class="btn" onclick="nudgeRefMarker(0, 1)" style="font-size: 0.9rem;">
                        ⬇️ Unten (1%)
                    </button>
                </div>
                
                <div style="margin-top: 1rem; display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.75rem;">
                    <button class="btn" onclick="nudgeRefMarker(-0.1, 0)" style="font-size: 0.85rem; background: rgba(100,100,100,0.3);">
                        ← Fein
                    </button>
                    <button class="btn" onclick="nudgeRefMarker(0.1, 0)" style="font-size: 0.85rem; background: rgba(100,100,100,0.3);">
                        Fein →
                    </button>
                    <button class="btn" onclick="nudgeRefMarker(0, -0.1)" style="font-size: 0.85rem; background: rgba(100,100,100,0.3);">
                        ↑ Fein
                    </button>
                    <button class="btn" onclick="nudgeRefMarker(0, 0.1)" style="font-size: 0.85rem; background: rgba(100,100,100,0.3);">
                        Fein ↓
                    </button>
                    <button class="btn" onclick="resetRefMarkerToCenter()" style="font-size: 0.85rem; background: rgba(251,191,36,0.3); color: var(--accent);">
                        🎯 Zentrum
                    </button>
                </div>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button class="btn" onclick="saveRefMarkerPosition()" style="background: #22c55e; color: white; padding: 1rem 2.5rem; font-size: 1.1rem; font-weight: bold;">
                    ✅ Speichern
                </button>
                <button class="btn" onclick="cancelRefMarkerMode()" style="background: #ef4444; color: white; padding: 1rem 2.5rem; font-size: 1.1rem; font-weight: bold;">
                    ❌ Abbrechen
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Load SVG za trenutni floor
    const svgMap = document.getElementById('ref-draggable-map');
    if (svgMap) {
        svgMap.src = `svg/${floorNumber}og.svg`;
    }
    
    // Draggable elements
    const marker = document.getElementById('ref-draggable-marker');
    const mapPreview = document.getElementById('ref-draggable-map');
    const xSlider = document.getElementById('ref-x-slider');
    const ySlider = document.getElementById('ref-y-slider');
    const xDisplay = document.getElementById('ref-current-x');
    const yDisplay = document.getElementById('ref-current-y');
    
    let isDragging = false;
    
    // Mouse drag - povećan radius catch area
    marker.addEventListener('mousedown', (e) => {
        isDragging = true;
        marker.style.cursor = 'grabbing';
        e.preventDefault();
        e.stopPropagation();
    });
    
    // VAŽNO: Klik na KONTEJNER (ne samo sliku) premješta marker
    const mapContainer = mapPreview.parentElement;
    
    mapContainer.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const rect = mapPreview.getBoundingClientRect();
        currentX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        currentY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
        updateRefMarkerPos();
        e.preventDefault();
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            marker.style.cursor = 'grab';
        }
    });
    
    // Touch support
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
        updateRefMarkerPos();
        e.preventDefault();
    });
    
    document.addEventListener('touchend', () => {
        isDragging = false;
    });
    
    // DIREKTNI KLIK NA MAPU - marker skoči na to mjesto!
    mapPreview.addEventListener('click', (e) => {
        if (isDragging) return; // Ignoriraj ako je drag u tijeku
        const rect = mapPreview.getBoundingClientRect();
        currentX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        currentY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
        updateRefMarkerPos();
        
        // Vizualni feedback - marker "bljesne"
        marker.style.transform = 'translate(-50%, -50%) scale(1.3)';
        setTimeout(() => {
            marker.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 200);
        
        e.preventDefault();
    });
    
    // Sliders
    xSlider.addEventListener('input', (e) => {
        currentX = parseFloat(e.target.value);
        updateRefMarkerPos();
    });
    
    ySlider.addEventListener('input', (e) => {
        currentY = parseFloat(e.target.value);
        updateRefMarkerPos();
    });
    
    function updateRefMarkerPos() {
        // VAŽNO: Računaj poziciju prema SLICI, ne prema kontejneru!
        const imgRect = mapPreview.getBoundingClientRect();
        const containerRect = mapPreview.parentElement.getBoundingClientRect();
        
        // Pixel pozicija unutar slike
        const pixelX = (currentX / 100) * imgRect.width;
        const pixelY = (currentY / 100) * imgRect.height;
        
        // Offset slike unutar kontejnera
        const offsetX = imgRect.left - containerRect.left;
        const offsetY = imgRect.top - containerRect.top;
        
        // Postavi marker pixel-perfect prema slici
        marker.style.left = (offsetX + pixelX) + 'px';
        marker.style.top = (offsetY + pixelY) + 'px';
        
        // Update UI
        xSlider.value = currentX;
        ySlider.value = currentY;
        xDisplay.textContent = currentX.toFixed(2) + '%';
        yDisplay.textContent = currentY.toFixed(2) + '%';
    }
    
    // Nudge funkcija za fine-tuning
    window.nudgeRefMarker = (dx, dy) => {
        currentX = Math.max(0, Math.min(100, currentX + dx));
        currentY = Math.max(0, Math.min(100, currentY + dy));
        updateRefMarkerPos();
    };
    
    // Reset na centar mape
    window.resetRefMarkerToCenter = () => {
        currentX = 50;
        currentY = 50;
        updateRefMarkerPos();
        
        // Vizualni feedback
        marker.style.transform = 'translate(-50%, -50%) scale(1.5)';
        marker.style.boxShadow = `0 0 60px ${markerColor}, 0 0 20px rgba(255,255,255,0.8)`;
        setTimeout(() => {
            marker.style.transform = 'translate(-50%, -50%) scale(1)';
            marker.style.boxShadow = `0 0 40px ${markerColor}, 0 0 10px rgba(255,255,255,0.8)`;
        }, 300);
    };
    
    // Save
    window.saveRefMarkerPosition = () => {
        setReferencePointCoords(floorKey, pointKey, currentX, currentY);
        showNotification(`${title} gespeichert (${currentX.toFixed(2)}%, ${currentY.toFixed(2)}%)`, 'success');
        overlay.remove();
    };
    
    // Cancel
    window.cancelRefMarkerMode = () => {
        overlay.remove();
    };
    
    // ESC key
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

/**
 * Ručno postavljanje markera za LIFT sa draggable sistemom
 */
async function setLiftMarker(floorNumber) {
    const floorKey = floorNumber === 0 ? 'EG' : `${floorNumber}OG`;
    const current = getReferencePointCoords(floorKey, 'LIFT_MAIN') || {};
    
    activateDraggableReferenceMarker(
        floorNumber,
        'LIFT_MAIN',
        floorKey,
        '🛗 LIFT Hauptaufzug',
        '#3b82f6', // Plava boja za LIFT
        current.x || 50,
        current.y || 50
    );
}

/**
 * Ručno postavljanje markera za TH (Treppenhaus) sa draggable sistemom
 */
async function setTHMarker(floorNumber, direction = 'NORTH') {
    const floorKey = floorNumber === 0 ? 'EG' : `${floorNumber}OG`;
    const pointKey = `TH_${direction}`;
    const current = getReferencePointCoords(floorKey, pointKey) || {};
    
    const dirName = direction === 'NORTH' ? 'Nord' : direction === 'SOUTH' ? 'Süd' : direction;
    
    activateDraggableReferenceMarker(
        floorNumber,
        pointKey,
        floorKey,
        `🚪🔥 TH (Nottreppe) ${dirName}`,
        '#22c55e', // Zelena boja za TH
        current.x || 50,
        current.y || 50
    );
}

/**
 * Prikazuje referentnu točku na mapi
 */
function displayReferencePointOnMap(pointKey, x, y, icon = '📍') {
    const mapWrapper = document.getElementById('map-wrapper');
    if (!mapWrapper) return;
    
    // Ukloni postojeći marker ako postoji
    const existingMarker = document.getElementById(`ref-marker-${pointKey}`);
    if (existingMarker) {
        existingMarker.remove();
    }
    
    // Kreiraj novi marker
    const marker = document.createElement('div');
    marker.id = `ref-marker-${pointKey}`;
    marker.style.cssText = `
        position: absolute;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        border: 3px solid white;
        z-index: 50;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        cursor: pointer;
        left: ${x}%;
        top: ${y}%;
    `;
    
    // Boja ovisno o tipu
    if (pointKey.includes('LIFT')) {
        marker.style.background = '#3b82f6'; // plava za LIFT
        marker.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.8)';
    } else if (pointKey.includes('TH')) {
        marker.style.background = '#22c55e'; // zelena za TH (emergency exit)
        marker.style.boxShadow = '0 0 15px rgba(34, 197, 94, 0.8)';
    } else {
        marker.style.background = '#f59e0b'; // narančasta za ostalo
        marker.style.boxShadow = '0 0 15px rgba(245, 158, 11, 0.8)';
    }
    
    marker.innerHTML = icon;
    marker.title = pointKey;
    
    // Click event za info
    marker.addEventListener('click', () => {
        showNotification(`${icon} ${pointKey}: ${x}%, ${y}%`, 'info');
    });
    
    mapWrapper.appendChild(marker);
}

/**
 * Prikazuje sve referentne točke na trenutnom spratu
 */
function displayAllReferencePointsOnFloor(floorNumber) {
    const floorKey = floorNumber === 0 ? 'EG' : `${floorNumber}OG`;
    const coords = getReferencePointsCoords();
    const floorCoords = coords[floorKey];
    
    if (!floorCoords) return;
    
    Object.entries(floorCoords).forEach(([pointKey, point]) => {
        let icon = '📍';
        if (pointKey.includes('LIFT')) icon = '🛗';
        else if (pointKey.includes('TH')) icon = '🚪';
        else if (pointKey.includes('SPA')) icon = '💆';
        
        displayReferencePointOnMap(pointKey, point.x, point.y, icon);
    });
}

/**
 * Čisti sve markere referentnih točaka sa mape
 */
function clearAllReferenceMarkersFromMap() {
    const markers = document.querySelectorAll('[id^="ref-marker-"]');
    markers.forEach(marker => marker.remove());
}

/**
 * Panel za upravljanje referentnim točkama
 */
function openReferencePointsPanel(floorNumber) {
    const floorKey = floorNumber === 0 ? 'EG' : `${floorNumber}OG`;
    
    const panel = `
        <div style="background: rgba(0,0,0,0.9); padding: 2rem; border-radius: 12px; max-width: 500px;">
            <h3 style="color: var(--accent); margin-bottom: 1.5rem;">
                📍 Referentne točke - ${floorKey}
            </h3>
            
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <button class="btn" onclick="setLiftMarker(${floorNumber})" style="justify-content: flex-start;">
                    🛗 LIFT Hauptaufzug markieren
                </button>
                
                <button class="btn" onclick="setTHMarker(${floorNumber}, 'NORTH')" style="justify-content: flex-start;">
                    🚪 TH Nord (Notausgang) markieren
                </button>
                
                <button class="btn" onclick="setTHMarker(${floorNumber}, 'SOUTH')" style="justify-content: flex-start;">
                    🚪 TH Süd (Notausgang) markieren
                </button>
                
                <hr style="border-color: rgba(251,191,36,0.3); margin: 0.5rem 0;">
                
                <button class="btn" onclick="displayAllReferencePointsOnFloor(${floorNumber})" style="justify-content: flex-start;">
                    👁️ Alle Marker anzeigen
                </button>
                
                <button class="btn" onclick="clearAllReferenceMarkersFromMap()" style="justify-content: flex-start;">
                    🧹 Marker ausblenden
                </button>
                
                <button class="btn" onclick="exportReferencePoints()" style="justify-content: flex-start;">
                    📥 Export alle Referenzpunkte
                </button>
                
                <button class="btn gold-bg" onclick="closeReferencePointsPanel()" style="margin-top: 1rem;">
                    Schließen
                </button>
            </div>
        </div>
    `;
    
    let overlay = document.getElementById('reference-points-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'reference-points-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.85);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        `;
        document.body.appendChild(overlay);
    }
    
    overlay.innerHTML = panel;
    overlay.style.display = 'flex';
}

function closeReferencePointsPanel() {
    const overlay = document.getElementById('reference-points-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Eksportiraj funkcije globalno
if (typeof window !== 'undefined') {
    window.setReferencePointCoords = setReferencePointCoords;
    window.getReferencePointsCoords = getReferencePointsCoords;
    window.getReferencePointCoords = getReferencePointCoords;
    window.clearReferencePointCoords = clearReferencePointCoords;
    window.exportReferencePoints = exportReferencePoints;
    window.activateDraggableReferenceMarker = activateDraggableReferenceMarker;
    window.setLiftMarker = setLiftMarker;
    window.setTHMarker = setTHMarker;
    window.displayReferencePointOnMap = displayReferencePointOnMap;
    window.displayAllReferencePointsOnFloor = displayAllReferencePointsOnFloor;
    window.clearAllReferenceMarkersFromMap = clearAllReferenceMarkersFromMap;
    window.openReferencePointsPanel = openReferencePointsPanel;
    window.closeReferencePointsPanel = closeReferencePointsPanel;
}
