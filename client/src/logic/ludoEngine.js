import { COLOR_CONFIG, SHARED_PATH, SAFE_INDICES, PLAYERS_ORDER } from '../constants/ludoPath';

export const TOTAL_STEPS_TO_HOME = 57;

export function createInitialTokens() {
  const tokens = {};
  PLAYERS_ORDER.forEach((color) => {
    tokens[color] = [0, 1, 2, 3].map((id) => ({
      id,
      color,
      state: 'yard', // 'yard' | 'path' | 'home_column' | 'home'
      position: id, // yard slot index (0..3)
      stepsTaken: -1,
    }));
  });
  return tokens;
}

// Check if a specific token can legally move with the current dice value
export function canTokenMove(token, diceValue) {
  if (!token || !diceValue) return false;

  // In yard: only can move out on a 6
  if (token.state === 'yard') {
    return diceValue === 6;
  }

  // Already in final home: cannot move
  if (token.state === 'home') {
    return false;
  }

  // On path or home column: cannot overshoot final home
  const targetSteps = token.stepsTaken + diceValue;
  return targetSteps <= TOTAL_STEPS_TO_HOME;
}

// Get all movable tokens for the active player
export function getMovableTokens(playerTokens, diceValue) {
  if (!playerTokens || !diceValue) return [];
  return playerTokens.filter((token) => canTokenMove(token, diceValue));
}

// Compute the destination coordinates and state for a move
export function calculateMoveDestination(token, diceValue) {
  const config = COLOR_CONFIG[token.color];

  // Moving out of yard
  if (token.state === 'yard' && diceValue === 6) {
    return {
      state: 'path',
      position: config.startIndex,
      stepsTaken: 0,
      coords: config.startPos,
    };
  }

  const newSteps = token.stepsTaken + diceValue;

  // Reached Final Home
  if (newSteps === TOTAL_STEPS_TO_HOME) {
    return {
      state: 'home',
      position: 5,
      stepsTaken: TOTAL_STEPS_TO_HOME,
      coords: config.homeTarget,
    };
  }

  // In Home Column (steps 52 to 56)
  if (newSteps >= 52) {
    const hcIndex = newSteps - 52;
    return {
      state: 'home_column',
      position: hcIndex,
      stepsTaken: newSteps,
      coords: config.homeColumn[hcIndex],
    };
  }

  // On Shared Path (steps 0 to 51)
  const newPathIndex = (config.startIndex + newSteps) % 52;
  return {
    state: 'path',
    position: newPathIndex,
    stepsTaken: newSteps,
    coords: SHARED_PATH[newPathIndex],
  };
}

// Compute the sequence of tile-by-tile hops for smooth Ludo King animation
export function calculateStepByStepPath(token, diceValue) {
  const config = COLOR_CONFIG[token.color];

  // Moving out of yard onto start square
  if (token.state === 'yard' && diceValue === 6) {
    return [
      {
        state: 'path',
        position: config.startIndex,
        stepsTaken: 0,
        coords: config.startPos,
      },
    ];
  }

  const hops = [];
  const startStep = token.stepsTaken;

  for (let s = 1; s <= diceValue; s++) {
    const currentStep = startStep + s;

    if (currentStep === TOTAL_STEPS_TO_HOME) {
      hops.push({
        state: 'home',
        position: 5,
        stepsTaken: TOTAL_STEPS_TO_HOME,
        coords: config.homeTarget,
      });
    } else if (currentStep >= 52) {
      const hcIndex = currentStep - 52;
      hops.push({
        state: 'home_column',
        position: hcIndex,
        stepsTaken: currentStep,
        coords: config.homeColumn[hcIndex],
      });
    } else {
      const pathIdx = (config.startIndex + currentStep) % 52;
      hops.push({
        state: 'path',
        position: pathIdx,
        stepsTaken: currentStep,
        coords: SHARED_PATH[pathIdx],
      });
    }
  }

  return hops;
}

// Check if move cuts any opponent tokens
export function checkCut(movedToken, newDestination, allTokens) {
  // Can only cut on shared path and NOT in safe squares
  if (newDestination.state !== 'path') return null;
  if (SAFE_INDICES.includes(newDestination.position)) return null;

  for (const color of PLAYERS_ORDER) {
    if (color === movedToken.color) continue;

    const opponentTokens = allTokens[color] || [];
    for (const opp of opponentTokens) {
      if (opp.state === 'path' && opp.position === newDestination.position) {
        return opp; // Token to be cut
      }
    }
  }

  return null;
}

// Check if a player has won (all 4 tokens in home)
export function checkPlayerWon(playerTokens, tokensRequired = 4) {
  if (!playerTokens) return false;
  const homeTokens = playerTokens.filter((t) => t.state === 'home');
  return homeTokens.length >= tokensRequired;
}

// AI Bot Decision Engine (with difficulty modes: 'easy', 'medium', 'hard')
export function chooseBotMove(movableTokens, allTokens, diceValue, difficulty = 'medium') {
  if (!movableTokens || movableTokens.length === 0) return null;
  if (movableTokens.length === 1) return movableTokens[0];

  // In Easy mode, 40% chance of random pick for human-like mistakes
  if (difficulty === 'easy' && Math.random() < 0.4) {
    return movableTokens[Math.floor(Math.random() * movableTokens.length)];
  }

  let bestScore = -Infinity;
  let bestToken = movableTokens[0];

  for (const token of movableTokens) {
    let score = 0;
    const dest = calculateMoveDestination(token, diceValue);

    // 1. Cut Opponent (+100)
    const cutOpponent = checkCut(token, dest, allTokens);
    if (cutOpponent) {
      score += difficulty === 'hard' ? 140 : 100;
    }

    // 2. Reach Final Home (+90)
    if (dest.state === 'home') {
      score += 90;
    }

    // 3. Deploy out of yard (+70)
    if (token.state === 'yard' && diceValue === 6) {
      score += 70;
    }

    // 4. Land on Safe Square (+50)
    if (dest.state === 'path' && SAFE_INDICES.includes(dest.position)) {
      score += 50;
    }

    // 5. Enter Home Column (+45)
    if (dest.state === 'home_column' && token.state === 'path') {
      score += 45;
    }

    // 6. Danger avoidance in Hard mode (+30 if escaping an opponent behind)
    if (difficulty === 'hard' && token.state === 'path') {
      // Check if any opponent is 1-6 squares behind
      for (const oppColor of PLAYERS_ORDER) {
        if (oppColor === token.color) continue;
        const opps = allTokens[oppColor] || [];
        for (const opp of opps) {
          if (opp.state === 'path') {
            const distance = (token.position - opp.position + 52) % 52;
            if (distance >= 1 && distance <= 6) {
              score += 35; // Run away!
            }
          }
        }
      }
    }

    // 7. Progress closer to home
    score += (token.stepsTaken || 0) * 0.5;

    if (score > bestScore) {
      bestScore = score;
      bestToken = token;
    }
  }

  return bestToken;
}
