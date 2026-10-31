// 15x15 Ludo Board Coordinate System and Path Definitions
// Standard 52-cell perimeter path (Row, Col) clockwise

export const BOARD_SIZE = 15;

export const COLOR_CONFIG = {
  red: {
    id: 'red',
    name: 'Red',
    bg: '#ef4444',
    border: '#b91c1c',
    light: '#fee2e2',
    accent: '#dc2626',
    startIndex: 0, // Path index for Red start: (6, 1)
    homeEntryIndex: 51, // After index 51, enters Red home column
    startPos: { r: 6, c: 1 },
    yardPositions: [
      { r: 2, c: 2 },
      { r: 2, c: 3 },
      { r: 3, c: 2 },
      { r: 3, c: 3 },
    ],
    homeColumn: [
      { r: 7, c: 1 },
      { r: 7, c: 2 },
      { r: 7, c: 3 },
      { r: 7, c: 4 },
      { r: 7, c: 5 },
    ],
    homeTarget: { r: 7, c: 6 },
    yardBox: { rStart: 0, rEnd: 5, cStart: 0, cEnd: 5 },
  },
  green: {
    id: 'green',
    name: 'Green',
    bg: '#22c55e',
    border: '#15803d',
    light: '#dcfce7',
    accent: '#16a34a',
    startIndex: 13, // Path index for Green start: (1, 8)
    homeEntryIndex: 11, // After index 11, enters Green home column
    startPos: { r: 1, c: 8 },
    yardPositions: [
      { r: 2, c: 11 },
      { r: 2, c: 12 },
      { r: 3, c: 11 },
      { r: 3, c: 12 },
    ],
    homeColumn: [
      { r: 1, c: 7 },
      { r: 2, c: 7 },
      { r: 3, c: 7 },
      { r: 4, c: 7 },
      { r: 5, c: 7 },
    ],
    homeTarget: { r: 6, c: 7 },
    yardBox: { rStart: 0, rEnd: 5, cStart: 9, cEnd: 14 },
  },
  yellow: {
    id: 'yellow',
    name: 'Yellow',
    bg: '#eab308',
    border: '#a16207',
    light: '#fef9c3',
    accent: '#ca8a04',
    startIndex: 26, // Path index for Yellow start: (8, 13)
    homeEntryIndex: 24, // After index 24, enters Yellow home column
    startPos: { r: 8, c: 13 },
    yardPositions: [
      { r: 11, c: 11 },
      { r: 11, c: 12 },
      { r: 12, c: 11 },
      { r: 12, c: 12 },
    ],
    homeColumn: [
      { r: 7, c: 13 },
      { r: 7, c: 12 },
      { r: 7, c: 11 },
      { r: 7, c: 10 },
      { r: 7, c: 9 },
    ],
    homeTarget: { r: 7, c: 8 },
    yardBox: { rStart: 9, rEnd: 14, cStart: 9, cEnd: 14 },
  },
  blue: {
    id: 'blue',
    name: 'Blue',
    bg: '#3b82f6',
    border: '#1d4ed8',
    light: '#dbeafe',
    accent: '#2563eb',
    startIndex: 39, // Path index for Blue start: (13, 6)
    homeEntryIndex: 37, // After index 37, enters Blue home column
    startPos: { r: 13, c: 6 },
    yardPositions: [
      { r: 11, c: 2 },
      { r: 11, c: 3 },
      { r: 12, c: 2 },
      { r: 12, c: 3 },
    ],
    homeColumn: [
      { r: 13, c: 7 },
      { r: 12, c: 7 },
      { r: 11, c: 7 },
      { r: 10, c: 7 },
      { r: 9, c: 7 },
    ],
    homeTarget: { r: 8, c: 7 },
    yardBox: { rStart: 9, rEnd: 14, cStart: 0, cEnd: 5 },
  },
};

// 52-cell shared path starting from Red start (r:6, c:1) going clockwise:
// Index 0 is Red's start square: (6, 1)
export const SHARED_PATH = [
  { r: 6, c: 1 },  // 0: Red Start (Safe)
  { r: 6, c: 2 },  // 1
  { r: 6, c: 3 },  // 2
  { r: 6, c: 4 },  // 3
  { r: 6, c: 5 },  // 4
  { r: 5, c: 6 },  // 5: Turn Up
  { r: 4, c: 6 },  // 6
  { r: 3, c: 6 },  // 7
  { r: 2, c: 6 },  // 8: Safe (Star)
  { r: 1, c: 6 },  // 9
  { r: 0, c: 6 },  // 10
  { r: 0, c: 7 },  // 11: Top Center
  { r: 0, c: 8 },  // 12
  { r: 1, c: 8 },  // 13: Green Start (Safe)
  { r: 2, c: 8 },  // 14
  { r: 3, c: 8 },  // 15
  { r: 4, c: 8 },  // 16
  { r: 5, c: 8 },  // 17
  { r: 6, c: 9 },  // 18: Turn Right
  { r: 6, c: 10 }, // 19
  { r: 6, c: 11 }, // 20
  { r: 6, c: 12 }, // 21: Safe (Star)
  { r: 6, c: 13 }, // 22
  { r: 6, c: 14 }, // 23
  { r: 7, c: 14 }, // 24: Right Center
  { r: 8, c: 14 }, // 25
  { r: 8, c: 13 }, // 26: Yellow Start (Safe)
  { r: 8, c: 12 }, // 27
  { r: 8, c: 11 }, // 28
  { r: 8, c: 10 }, // 29
  { r: 8, c: 9 },  // 30
  { r: 9, c: 8 },  // 31: Turn Down
  { r: 10, c: 8 }, // 32
  { r: 11, c: 8 }, // 33
  { r: 12, c: 8 }, // 34: Safe (Star)
  { r: 13, c: 8 }, // 35
  { r: 14, c: 8 }, // 36
  { r: 14, c: 7 }, // 37: Bottom Center
  { r: 14, c: 6 }, // 38
  { r: 13, c: 6 }, // 39: Blue Start (Safe)
  { r: 12, c: 6 }, // 40
  { r: 11, c: 6 }, // 41
  { r: 10, c: 6 }, // 42
  { r: 9, c: 6 },  // 43
  { r: 8, c: 5 },  // 44: Turn Left
  { r: 8, c: 4 },  // 45
  { r: 8, c: 3 },  // 46
  { r: 8, c: 2 },  // 47: Safe (Star)
  { r: 8, c: 1 },  // 48
  { r: 8, c: 0 },  // 49
  { r: 7, c: 0 },  // 50: Left Center
  { r: 6, c: 0 },  // 51
];

// 8 Safe Squares on the shared path
export const SAFE_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

// Colors in clockwise turn order
export const PLAYERS_ORDER = ['red', 'green', 'yellow', 'blue'];

