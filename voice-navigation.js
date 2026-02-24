// Elevator Position & Floor Navigation Logic
// Koordiyaten der Aufzüge und Treppenhäuser auf jeder Etage

const ELEVATOR_POSITIONS = {
  zg: { x: 39.55, y: 88.00, name: "Hauptaufzug ZG" },
  "1og": { x: 39.17, y: 89.96, name: "Hauptaufzug 1. OG" },
  "2og": { x: 39.55, y: 88.00, name: "Hauptaufzug 2. OG" },
  "3og": { x: 38.75, y: 89.63, name: "Hauptaufzug 3. OG" },
  "4og": { x: 39.55, y: 88.00, name: "Hauptaufzug 4. OG" },
  "5og": { x: 39.55, y: 88.00, name: "Hauptaufzug 5. OG" },
  "6og": { x: 39.55, y: 88.00, name: "Hauptaufzug 6. OG" }
};

const STAIR_POSITIONS = {
  TH2: {
    name: "Treppenhaus 2 (Fluchtweg)",
    description: "Beside Heidi Kabel Conference, EG to 5OG only",
    floors: {
      zg: { x: 22.49, y: 73.00 },
      "1og": { x: 34.42, y: 74.96 },
      "2og": { x: 22.49, y: 73.00 },
      "3og": { x: 33.42, y: 73.25 },
      "4og": { x: 22.49, y: 73.00 },
      "5og": { x: 22.49, y: 73.00 }
    }
  },
  TH5: {
    name: "Treppenhaus 5",
    description: "Between rooms X29/X28, all floors",
    floors: {
      "1og": { x: 56.75, y: 65.63 },
      "2og": { x: 58.08, y: 65.42 },
      "3og": { x: 57.50, y: 66.50 },
      "4og": { x: 58.08, y: 65.42 },
      "5og": { x: 58.08, y: 65.42 },
      "6og": { x: 58.08, y: 65.42 }
    }
  },
  TH7: {
    name: "Treppenhaus 7",
    description: "Between rooms X27/X28, all floors (1OG-6OG)",
    floors: {
      "1og": { x: 54.00, y: 82.58 },
      "2og": { x: 54.67, y: 82.13 },
      "3og": { x: 54.83, y: 83.13 },
      "4og": { x: 54.67, y: 82.13 },
      "5og": { x: 54.67, y: 82.13 },
      "6og": { x: 54.67, y: 82.13 }
    }
  },
  TH9: {
    name: "Treppenhaus 9 (Fluchtweg)",
    description: "Emergency stairs, all floors (EG-6OG)",
    floors: {
      zg: { x: 39.55, y: 88.00 },
      "1og": { x: 42.42, y: 90.58 },
      "2og": { x: 39.55, y: 88.00 },
      "3og": { x: 42.08, y: 90.00 },
      "4og": { x: 39.55, y: 88.00 },
      "5og": { x: 39.55, y: 88.00 },
      "6og": { x: 39.55, y: 88.00 }
    }
  },
  SPA_AUFZUG: {
    name: "SPA & GYM Aufzug",
    description: "Spa elevator to basement (6OG to Keller)",
    floors: {
      "1og": { x: 52.00, y: 90.46 },
      "2og": { x: 51.83, y: 88.79 },
      "3og": { x: 51.50, y: 90.13 },
      "4og": { x: 51.83, y: 88.79 },
      "5og": { x: 51.83, y: 88.79 },
      "6og": { x: 51.83, y: 88.79 }
    }
  }
};

// Room positioning logic from elevator
const FLOOR_LAYOUTS = {
  "1og": {
    left: { range: "100-102", start: 100, end: 102, description: "Left side exiting main elevator" },
    right: { range: "103-135", start: 103, end: 135, description: "Right side exiting main elevator" }
  },
  "2og": {
    left: { range: "200-211", start: 200, end: 211, description: "Left side exiting main elevator" },
    right: { range: "212-249", start: 212, end: 249, description: "Right side exiting main elevator" }
  },
  "3og": {
    left: { range: "300-311", start: 300, end: 311, description: "Left side exiting main elevator" },
    right: { range: "312-349", start: 312, end: 349, description: "Right side exiting main elevator" }
  },
  "4og": {
    left: { range: "400-411", start: 400, end: 411, description: "Left side exiting main elevator" },
    right: { range: "412-449", start: 412, end: 449, description: "Right side exiting main elevator" }
  },
  "5og": {
    left: { range: "500-511", start: 500, end: 511, description: "Left side exiting main elevator" },
    right: { range: "512-549", start: 512, end: 549, description: "Right side exiting main elevator" }
  },
  "6og": {
    left: { range: "600-604", start: 600, end: 604, description: "Left side exiting main elevator" },
    right: { range: "612-646", start: 612, end: 646, description: "Right side exiting main elevator" }
  }
};

// Voice Navigation Messages
const VOICE_MESSAGES = {
  de: {
    elevator_intro: "Sie sind gerade aus dem Aufzug ausgestiegen. Ihre Zimmernummer ist {room}.",
    left_direction: "Ihr Zimmer liegt auf der LINKEN Seite. Folgen Sie bitte dieser Richtung.",
    right_direction: "Ihr Zimmer liegt auf der RECHTEN Seite. Folgen Sie bitte dieser Richtung.",
    staircase_direction: "Sie können auch das Treppenhaus {stairs} nutzen.",
    distance: "Ihr Zimmer ist ungefähr {distance} Meter vom Aufzug entfernt.",
    floor_floor: "Sie befinden sich im {floor}.",
    welcome: "Willkommen im Hotel Reichshof Hamburg. Ich helfe Ihnen, Ihr Zimmer zu finden.",
    spa_elevator: "Der SPA-Aufzug befindet sich hier. Mit diesem können Sie zum Keller und zur SPA gehen.",
    emergency_exit: "Notausgang: {staircase} ist ein Fluchtweg.",
    barrier_free: "Dieses Zimmer ist {accessibility_info} erreichbar."
  },
  en: {
    elevator_intro: "You have just stepped out of the elevator. Your room number is {room}.",
    left_direction: "Your room is on the LEFT side. Please follow this direction.",
    right_direction: "Your room is on the RIGHT side. Please follow this direction.",
    staircase_direction: "You can also use staircase {stairs}.",
    distance: "Your room is approximately {distance} meters from the elevator.",
    floor_floor: "You are on the {floor}.",
    welcome: "Welcome to Hotel Reichshof Hamburg. I will help you find your room.",
    spa_elevator: "The SPA elevator is here. You can use it to reach the basement and spa.",
    emergency_exit: "Emergency exit: {staircase} is an escape route.",
    barrier_free: "This room is {accessibility_info} accessible."
  },
  hr: {
    elevator_intro: "Upravo ste izašli iz dizala. Vaš broj sobe je {room}.",
    left_direction: "Vaša soba je na LIJEVOJ strani. Molimo vas slijedite ovu smjer.",
    right_direction: "Vaša soba je na DESNOJ strani. Molimo vas slijedite ovu smjer.",
    staircase_direction: "Možete koristiti i stepeništa {stairs}.",
    distance: "Vaša soba je otprilike {distance} metara od dizala.",
    floor_floor: "Nalazite se na {floor}.",
    welcome: "Dobrodošli u Hotel Reichshof Hamburg. Pomoći ću vam pronaći vašu sobu.",
    spa_elevator: "SPA dizalo je ovdje. Možete ga koristiti za putovanje u podrumu i SPA.",
    emergency_exit: "Izlaz za hitne slučajeve: {staircase} je put za bijeg.",
    barrier_free: "Ova soba je {accessibility_info} dostupna."
  }
};

// Calculate distance helper
function calculateDistance(pos1, pos2) {
  // Convert percentages to approximate meters (assuming ~50m width/height typical for hotel floor)
  const xDist = Math.abs(pos1.x - pos2.x) * 0.5;
  const yDist = Math.abs(pos1.y - pos2.y) * 0.5;
  return Math.round(Math.sqrt(xDist * xDist + yDist * yDist));
}

// Get navigation info for a room
function getNavigationInfo(floor, roomNumber) {
  const info = {
    floor: floor,
    room: roomNumber,
    elevator: ELEVATOR_POSITIONS[floor],
    layout: null,
    side: null,
    distance: 0,
    message: ""
  };

  // Determine if room is on left or right
  for (const [side, layout] of Object.entries(FLOOR_LAYOUTS[floor])) {
    if (roomNumber >= layout.start && roomNumber <= layout.end) {
      info.layout = layout;
      info.side = side;
      break;
    }
  }

  return info;
}

// Get voice message
function getVoiceMessage(floor, roomNumber, language = "de", roomCoords = null) {
  const navInfo = getNavigationInfo(floor, roomNumber);
  const messages = VOICE_MESSAGES[language];
  const floorNames = {
    zg: "Erdgeschoss",
    "1og": "1. Obergeschoss",
    "2og": "2. Obergeschoss",
    "3og": "3. Obergeschoss",
    "4og": "4. Obergeschoss",
    "5og": "5. Obergeschoss",
    "6og": "6. Obergeschoss"
  };

  let fullMessage = messages.welcome + "\n\n";
  fullMessage += messages.floor_floor.replace("{floor}", floorNames[floor]) + "\n";
  fullMessage += messages.elevator_intro.replace("{room}", roomNumber) + "\n\n";

  if (navInfo.side === "left") {
    fullMessage += messages.left_direction + "\n";
  } else if (navInfo.side === "right") {
    fullMessage += messages.right_direction + "\n";
  }

  // Add distance if coordinates available
  if (roomCoords) {
    const distance = calculateDistance(navInfo.elevator, roomCoords);
    fullMessage += messages.distance.replace("{distance}", distance) + "\n";
  }

  return {
    text: fullMessage,
    side: navInfo.side,
    elevator: navInfo.elevator,
    layout: navInfo.layout
  };
}

// Export for use in application
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ELEVATOR_POSITIONS,
    STAIR_POSITIONS,
    FLOOR_LAYOUTS,
    VOICE_MESSAGES,
    calculateDistance,
    getNavigationInfo,
    getVoiceMessage
  };
}
