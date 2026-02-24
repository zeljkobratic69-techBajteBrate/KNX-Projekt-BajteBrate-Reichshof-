# 📍 NAVIGACIJSKI SISTEM - Priručnik za upotrebu

## 🎯 Pregled sistema

Kompletna govorna navigacija sastoji se od **3 segmenta**:

1. **Recepcija → Lift** (uvijek isto za sve sobe)
2. **Lift → Etažna referentna točka** (sprat-specifično)
3. **Referentna točka → Konkretna soba** (soba-specifično)

---

## 📂 Struktura fajlova

### 1. `voice-navigation-system.json`
Glavni konfiguracijski fajl sa:
- Osnovnim segmentima (recepcija→lift, lift→sprat)
- Detaljnim rutama za specifične sobe
- Terminologijom i referencijskim točkama

### 2. `manual-room-routes.json`
Dodatne specifične rute koje definirate ručno:
```json
{
  "200": {
    "de": "Von den Liften im 2. OG: nach dem Ausstieg links abbiegen...",
    "en": "From the elevators on the 2nd floor: turn left after exiting...",
    "es": "Desde los ascensores en la 2ª planta: gire a la izquierda..."
  }
}
```

### 3. `manual-route-logic.json`
Template logika za grupne rute (npr. sve sobe 200-211 idu lijevo):
```json
{
  "de": {
    "f2to5_left": "Vom Lift auf {floor}. OG: links abbiegen. Dieser Flur führt zu den Zimmern xx00–xx11. Folgen Sie dem Flur bis Zimmer {room}."
  }
}
```

### 4. `js/voice-navigation-builder.js`
JavaScript modul koji sastavlja sve segmente

---

## 🔧 Kako dodati novu sobu (primjer sobe 227)

### Opcija A: Specifična ruta (preporučeno za kompleksne puteve)

Dodajte u `voice-navigation-system.json` → `detailed_room_routes`:

```json
"227": {
  "de": "Zimmer 227: Nach 3 Schritten rechts abbiegen. Folgen Sie dem Flur geradeaus bis zum Ende, dann links. Nach 3 Metern, vorbei bei Zimmern 217 und 218, biegen Sie rechts ab. Gleich nach Zimmer 225 auf Ihrer linken Seite und Zimmer 226 auf Ihrer rechten Seite befindet sich Ihr Zimmer 227 links.",
  "en": "Room 227: After 3 steps, turn right. Follow the corridor straight to the end, then left. After 3 meters, past rooms 217 and 218, turn right. Just after room 225 on your left and room 226 on your right, your room 227 is on the left.",
  "es": "Habitación 227: Después de 3 pasos, gire a la derecha. Siga el pasillo recto hasta el final, luego a la izquierda..."
}
```

### Opcija B: Grupna template logika

Ako soba 227 spada u grupu (npr. sve sobe 212-249 na 2. spratu idu desno):

Koristi se automatski postojeći template iz `manual-route-logic.json`:
```json
"f2to5_right": "Vom Lift auf {floor}. OG: rechts abbiegen. Dieser Flur führt zu den Zimmern xx12–xx49. Folgen Sie dem Flur bis Zimmer {room}."
```

---

## 🎤 Terminologija (distance_markers, direction_terms)

Koristite standardne fraze iz `voice-navigation-system.json`:

### Udaljenosti:
- `"3_steps"` → "etwa 3 Schritte" / "about 3 steps"
- `"3_meters"` → "3 Meter" / "3 meters"
- `"5_meters"` → "5 Meter" / "5 meters"
- `"10_meters"` → "10 Meter" / "10 meters"

### Smjerovi:
- `"left"` → "links" / "left" / "izquierda"
- `"right"` → "rechts" / "right" / "derecha"
- `"straight"` → "geradeaus" / "straight" / "recto"
- `"turn_left"` → "links abbiegen" / "turn left"
- `"turn_right"` → "rechts abbiegen" / "turn right"
- `"at_the_end"` → "am Ende" / "at the end"
- `"past_room"` → "vorbei bei Zimmer" / "past room"
- `"on_your_left"` → "auf Ihrer linken Seite" / "on your left"
- `"on_your_right"` → "auf Ihrer rechten Seite" / "on your right"

---

## 📍 Referentne točke (reference_points)

### 1. Obergeschoss (1. sprat):
- `hans_albers` - "Veranstaltungsraum Hans Albers"
- `heidi_kabel` - "Veranstaltungsraum Heidi Kabel"
- `restrooms` - "Damen/Herren-WC"

### Zajedničke (svi spratovi):
- `fire_doors` - "Brandschutztüren (Zimmerkarte erforderlich)"
- `elevator` - "Fahrstuhl"

---

## ♿ Pristupačnost (accessibility_notes)

Za sobe sa pristupačnošću automatski se dodaje:
```json
"wheelchair_route": {
  "de": "Rollstuhlgerechte Route: {route}",
  "en": "Wheelchair-accessible route: {route}"
}
```

---

## 🚀 Primjer kompletne navigacije za sobu 227

**Segment 1 (Recepcija → Lift):**
> "Von der Rezeption aus: Bitte nehmen Sie den Fahrstuhl an. Legen Sie Ihre Zimmerkarte nah an den Kartenleser im Fahrstuhl. Drücken Sie Ihre Obergeschoss-Etage an, wo Ihr Zimmer liegt."

**Segment 2 (Lift → Etaža 2):**
> "Sie befinden sich im 2. Obergeschoss. Nach dem Verlassen des Fahrstuhls:"

**Segment 3 (Detaljne upute → Soba 227):**
> "Nach 3 Schritten rechts abbiegen. Folgen Sie dem Flur geradeaus bis zum Ende, dann links. Nach 3 Metern, vorbei bei Zimmern 217 und 218, biegen Sie rechts ab. Gleich nach Zimmer 225 auf Ihrer linken Seite und Zimmer 226 auf Ihrer rechten Seite befindet sich Ihr Zimmer 227 links."

---

## 📝 Workflow za označavanje soba

1. **Označite X,Y koordinate** na mapi
2. **Zapišite tekst navigacije** sa mjerenjima (koraci/metri)
3. **Dodajte u odgovarajući JSON fajl:**
   - `voice-navigation-system.json` za detaljne rute
   - `manual-room-routes.json` za brze dodatke
4. **Testirajte govornu navigaciju** klikom na "Audio-Anleitung"
5. **Exportujte sve markere** sa "Marker Export"

---

## 🎯 Prioritet izvora navigacije

Sistem provjerava ovim redoslijedom:

1. ✅ `voice-navigation-system.json` → `detailed_room_routes`
2. ✅ `manual-room-routes.json`
3. ✅ `manual-route-logic.json` (template logika)
4. ✅ `roomsDatabase[room].navigation`
5. ⚠️ Fallback generička poruka

---

## 🔍 Testiranje

**Pokretanje testa:**
```javascript
// U browser konzoli:
buildCompleteVoiceNavigation('227', 'de').then(nav => console.log(nav));
```

**Očekivani rezultat:**
Kompletan string sa sva 3 segmenta spojena.

---

## 💡 Savjeti

1. **Budite konzistentni:** Koristite iste fraze za iste radnje
2. **Dodajte metrike:** "3 Meter", "5 Schritte"
3. **Navedite orijentire:** "vorbei bei Zimmer 217"
4. **Stranu navesti:** "auf Ihrer linken Seite"
5. **Testrajte sa TTS:** Slušajte kako zvuči govorna navigacija

---

## 📞 Status

✅ Mapa poboljšana (veća, bolji marker)
✅ Navigacijski sistem kreiran
✅ Integracija sa postojećim kodom
✅ Primer za sobu 227 dodan
⏳ Dodavanje ostalih soba u tijeku...

---

**Verzija:** 1.0  
**Datum:** 23.02.2026  
**Projekt:** Digital Concierge Reichshof Hamburg
