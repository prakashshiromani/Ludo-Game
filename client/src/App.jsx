import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import LandingPage from './components/LandingPage';
import LudoBoard from './components/LudoBoard';
import Dice from './components/Dice';
import PlayerCard from './components/PlayerCard';
import WinModal from './components/WinModal';
import OnlineLobbyModal from './components/OnlineLobbyModal';
import SpinModal from './components/SpinModal';
import RulesModal from './components/RulesModal';
import EmojiBar from './components/EmojiBar';
import {
  createInitialTokens,
  canTokenMove,
  getMovableTokens,
  calculateMoveDestination,
  calculateStepByStepPath,
  checkCut,
  checkPlayerWon,
  chooseBotMove,
} from './logic/ludoEngine';
import { COLOR_CONFIG, PLAYERS_ORDER } from './constants/ludoPath';
import { sounds } from './audio/soundManager';
import { Volume2, VolumeX, Music, ArrowLeft, RotateCcw, Shield, Coins, Gem } from 'lucide-react';

const TURN_TIME_LIMIT = 15;

export default function App() {
  // Navigation: 'landing' or 'game'
  const [currentScreen, setCurrentScreen] = useState('landing');

  // Currency & Profile
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('ludo_coins');
    return saved ? parseInt(saved, 10) : 10000;
  });
  const [gems, setGems] = useState(() => {
    const saved = localStorage.getItem('ludo_gems');
    return saved ? parseInt(saved, 10) : 150;
  });

  // Modals
  const [spinModalOpen, setSpinModalOpen] = useState(false);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);

  // Audio state
  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(false);

  // Game Settings
  const [gameMode, setGameMode] = useState('vs_computer'); // 'vs_computer' | 'pass_and_play' | 'online'
  const [playerCount, setPlayerCount] = useState(4);
  const [difficulty, setDifficulty] = useState('medium');
  const [tokensToWin, setTokensToWin] = useState(4);

  // Online Multiplayer State
  const [socket, setSocket] = useState(null);
  const [onlineModalOpen, setOnlineModalOpen] = useState(false);
  const [onlineRoom, setOnlineRoom] = useState(null);
  const [myOnlineColor, setMyOnlineColor] = useState(null);
  const [joinError, setJoinError] = useState(null);

  // In-Game Board State
  const [allTokens, setAllTokens] = useState(() => createInitialTokens());
  const [players, setPlayers] = useState([]);
  const [currentTurnIdx, setCurrentTurnIdx] = useState(0);
  const [diceValue, setDiceValue] = useState(null);
  const [hasRolled, setHasRolled] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [movableTokens, setMovableTokens] = useState([]);
  const [consecutiveSixes, setConsecutiveSixes] = useState(0);
  const [winner, setWinner] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Motion & Effects State
  const [animatingToken, setAnimatingToken] = useState(null); // { color, id, coords }
  const [isTokenHopping, setIsTokenHopping] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [rippleCell, setRippleCell] = useState(null);
  const [floatingEmojis, setFloatingEmojis] = useState({}); // { [color]: emoji }

  // Turn Timer Countdown
  const [turnTimeLeft, setTurnTimeLeft] = useState(TURN_TIME_LIMIT);
  const turnTimerRef = useRef(null);
  const botActionTimerRef = useRef(null);

  const activePlayer = players[currentTurnIdx] || players[0] || { color: 'red', name: 'Player 1' };
  const activeColorConfig = COLOR_CONFIG[activePlayer.color] || COLOR_CONFIG.red;

  // Persist currency
  useEffect(() => {
    localStorage.setItem('ludo_coins', coins.toString());
    localStorage.setItem('ludo_gems', gems.toString());
  }, [coins, gems]);

  // Audio Toggles
  const handleToggleSound = () => {
    const s = sounds.toggleSound();
    setSoundOn(s);
  };

  const handleToggleMusic = () => {
    const m = sounds.toggleMusic();
    setMusicOn(m);
  };

  // Claim Spin Reward
  const handleRewardClaimed = (prize) => {
    if (prize.type === 'coins') {
      setCoins((prev) => prev + prize.val);
    } else if (prize.type === 'gems') {
      setGems((prev) => prev + prize.val);
    }
  };

  // Helper to construct player objects
  const setupPlayersList = (mode, count, botDiff, userColor = 'red') => {
    if (mode === 'vs_computer') {
      const colors = count === 2 ? [userColor, userColor === 'red' ? 'yellow' : 'red'] : PLAYERS_ORDER;
      return colors.map((col, idx) => ({
        color: col,
        name: idx === 0 ? 'You (King)' : `Bot ${idx} (${col.toUpperCase()})`,
        isBot: idx !== 0,
        difficulty: botDiff,
      }));
    } else {
      const colors = count === 2 ? ['red', 'yellow'] : PLAYERS_ORDER;
      return colors.map((col, idx) => ({
        color: col,
        name: `Player ${idx + 1} (${COLOR_CONFIG[col].name})`,
        isBot: false,
      }));
    }
  };

  // Start Game from Landing Page
  const handleStartGameFromLanding = ({
    mode,
    playerCount: count,
    difficulty: diff,
    userColor,
    tokensToWin: targetTokens = 4,
  }) => {
    setGameMode(mode);
    setPlayerCount(count);
    setDifficulty(diff || 'medium');
    setTokensToWin(targetTokens);

    const newPlayers = setupPlayersList(mode, count, diff || 'medium', userColor);
    setPlayers(newPlayers);
    setAllTokens(createInitialTokens());
    setCurrentTurnIdx(0);
    setDiceValue(null);
    setHasRolled(false);
    setIsRolling(false);
    setMovableTokens([]);
    setConsecutiveSixes(0);
    setWinner(null);
    setTurnTimeLeft(TURN_TIME_LIMIT);
    setStatusMessage(`${newPlayers[0].name}'s turn. Roll the dice!`);
    setCurrentScreen('game');
  };

  // Socket.io Setup on Mount
  useEffect(() => {
    const socketUrl =
      import.meta.env.VITE_BACKEND_URL ||
      (window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/');
    const s = io(socketUrl, { autoConnect: false });
    setSocket(s);

    s.on('room_created', ({ room, myColor }) => {
      setOnlineRoom(room);
      setMyOnlineColor(myColor);
      setJoinError(null);
    });

    s.on('room_joined', ({ room, myColor }) => {
      setOnlineRoom(room);
      setMyOnlineColor(myColor);
      setJoinError(null);
    });

    s.on('room_updated', ({ room }) => {
      setOnlineRoom(room);
    });

    s.on('join_error', ({ message }) => {
      setJoinError(message);
    });

    s.on('game_started', ({ room }) => {
      setOnlineRoom(room);
      setOnlineModalOpen(false);
      setGameMode('online');
      setPlayers(
        room.players.map((p) => ({
          color: p.color,
          name: p.name,
          isBot: false,
          socketId: p.id,
        }))
      );
      setAllTokens(createInitialTokens());
      setCurrentTurnIdx(0);
      setWinner(null);
      setTurnTimeLeft(TURN_TIME_LIMIT);
      setStatusMessage(`Online match started! ${room.players[0].name}'s turn.`);
      setCurrentScreen('game');
    });

    s.on('dice_rolled', ({ player, diceValue: rolled }) => {
      setIsRolling(true);
      setTimeout(() => {
        setIsRolling(false);
        setDiceValue(rolled);
        setHasRolled(true);

        setAllTokens((curr) => {
          const legal = getMovableTokens(curr[player.color], rolled);
          setMovableTokens(legal);

          if (legal.length === 0) {
            setTimeout(() => {
              if (s.id === player.id) {
                s.emit('pass_turn', { extraTurn: false });
              }
            }, 800);
          } else if (legal.length === 1 && s.id === player.id) {
            setTimeout(() => {
              s.emit('move_token', { tokenId: legal[0].id });
            }, 400);
          }
          return curr;
        });

        setStatusMessage(`${player.name} rolled a ${rolled}!`);
      }, 450);
    });

    s.on('token_moved', ({ color, tokenId, diceValue: dice }) => {
      executeStepByStepMovement(color, tokenId, dice, true);
    });

    s.on('turn_changed', ({ currentTurnIndex, activePlayer: nextPlayer }) => {
      setCurrentTurnIdx(currentTurnIndex);
      setHasRolled(false);
      setDiceValue(null);
      setMovableTokens([]);
      setTurnTimeLeft(TURN_TIME_LIMIT);
      setStatusMessage(`${nextPlayer.name}'s turn. Roll the dice.`);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  // Turn Countdown Timer Loop
  useEffect(() => {
    if (currentScreen !== 'game' || winner || isTokenHopping) return;

    if (turnTimerRef.current) clearInterval(turnTimerRef.current);

    turnTimerRef.current = setInterval(() => {
      setTurnTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(turnTimerRef.current);
          handleTimeOut();
          return 0;
        }
        if (prev <= 5) {
          sounds.playTimerTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (turnTimerRef.current) clearInterval(turnTimerRef.current);
    };
  }, [currentScreen, currentTurnIdx, hasRolled, winner, isTokenHopping]);

  // Turn Timeout Handler
  const handleTimeOut = () => {
    if (winner || isTokenHopping) return;

    if (!hasRolled) {
      // Auto-roll dice on timeout to keep match moving
      handleRollDice();
    } else if (movableTokens.length > 0) {
      // Pick first movable token
      handleTokenClick(movableTokens[0]);
    } else {
      nextTurn(false, `Time up for ${activePlayer.name}! Turn passed.`);
    }
  };

  // Pass Turn
  const nextTurn = (extraTurn = false, customMessage = '') => {
    setHasRolled(false);
    setDiceValue(null);
    setMovableTokens([]);
    setTurnTimeLeft(TURN_TIME_LIMIT);

    if (extraTurn) {
      setStatusMessage(customMessage || `${activePlayer.name} gets a BONUS TURN! Roll again.`);
      return;
    }

    setConsecutiveSixes(0);
    const nextIdx = (currentTurnIdx + 1) % players.length;
    setCurrentTurnIdx(nextIdx);
    const nextPlayer = players[nextIdx];
    setStatusMessage(customMessage || `${nextPlayer.name}'s turn. Roll the dice.`);
  };

  // STEP-BY-STEP HOPPING TOKEN MOVEMENT (Ludo King signature animation)
  const executeStepByStepMovement = (color, tokenId, dice, isOnlineEvent = false) => {
    const token = allTokens[color].find((t) => t.id === tokenId);
    if (!token) return;

    const hops = calculateStepByStepPath(token, dice);
    if (hops.length === 0) return;

    setIsTokenHopping(true);
    setMovableTokens([]);

    let stepIndex = 0;
    const hopInterval = setInterval(() => {
      const currentHop = hops[stepIndex];
      setAnimatingToken({
        color,
        id: tokenId,
        coords: currentHop.coords,
      });

      sounds.playStep(stepIndex);
      stepIndex++;

      if (stepIndex >= hops.length) {
        clearInterval(hopInterval);

        // Final Destination Reached!
        const finalDest = hops[hops.length - 1];
        const opponentCut = checkCut(token, finalDest, allTokens);

        // 1. Check Cut Opponent Shockwave & Screen Shake
        if (opponentCut) {
          sounds.playCutOpponent();
          setScreenShake(true);
          setRippleCell({ r: finalDest.coords.r, c: finalDest.coords.c, type: 'cut' });
          setTimeout(() => setScreenShake(false), 380);
          setTimeout(() => setRippleCell(null), 600);
        } else if (finalDest.state === 'home') {
          sounds.playHomeEnter();
        } else if (
          finalDest.state === 'path' &&
          [0, 8, 13, 21, 26, 34, 39, 47].includes(finalDest.position)
        ) {
          sounds.playSafeZone();
          setRippleCell({ r: finalDest.coords.r, c: finalDest.coords.c, type: 'safe' });
          setTimeout(() => setRippleCell(null), 600);
        }

        // Commit final token positions
        setAllTokens((prev) => {
          const updated = { ...prev };

          // Update moved token
          updated[color] = updated[color].map((t) =>
            t.id === tokenId
              ? {
                  ...t,
                  state: finalDest.state,
                  position: finalDest.position,
                  stepsTaken: finalDest.stepsTaken,
                }
              : t
          );

          // If opponent cut, send back to yard
          if (opponentCut) {
            updated[opponentCut.color] = updated[opponentCut.color].map((t) =>
              t.id === opponentCut.id
                ? { ...t, state: 'yard', position: t.id, stepsTaken: -1 }
                : t
            );
          }

          return updated;
        });

        setAnimatingToken(null);
        setIsTokenHopping(false);

        // Check Victory
        const updatedColorTokens = allTokens[color].map((t) =>
          t.id === tokenId ? { ...t, state: finalDest.state } : t
        );

        if (checkPlayerWon(updatedColorTokens, tokensToWin)) {
          setWinner(color);
          setStatusMessage(`🎉 ${activePlayer.name} HAS WON THE MATCH! 🎉`);
          setCoins((prev) => prev + 2500); // Winner reward
          return;
        }

        // Determine bonus turn
        const bonusTurn = dice === 6 || !!opponentCut || finalDest.state === 'home';
        let bonusReason = '';
        if (opponentCut) bonusReason = `${activePlayer.name} CUT an opponent! Bonus turn!`;
        else if (finalDest.state === 'home') bonusReason = `${activePlayer.name} reached HOME! Bonus turn!`;
        else if (dice === 6) bonusReason = `${activePlayer.name} rolled a 6! Bonus turn!`;

        if (gameMode === 'online') {
          if (!isOnlineEvent && socket) {
            socket.emit('pass_turn', { extraTurn: bonusTurn });
          }
        } else {
          setTimeout(() => {
            nextTurn(bonusTurn, bonusReason);
          }, 400);
        }
      }
    }, 115); // 115ms per hop gives ideal tactile cadence
  };

  // Token Click Handler (for manual selection when multiple options exist)
  const handleTokenClick = (token, forcedDice) => {
    const dice = forcedDice || diceValue;
    if (!token || !dice || isTokenHopping || winner) return;
    if (token.color !== activePlayer.color) return;
    if (!canTokenMove(token, dice)) return;

    if (gameMode === 'online') {
      if (activePlayer.color !== myOnlineColor) return;
      if (socket) {
        socket.emit('move_token', { tokenId: token.id });
      }
      return;
    }

    executeStepByStepMovement(token.color, token.id, dice);
  };

  // Roll Dice Action
  const handleRollDice = () => {
    if (hasRolled || isRolling || winner || isTokenHopping) return;

    if (gameMode === 'online') {
      if (activePlayer.color !== myOnlineColor) return;
      if (socket) socket.emit('roll_dice');
      return;
    }

    setIsRolling(true);
    setTimeout(() => {
      const rolled = Math.floor(Math.random() * 6) + 1;
      setDiceValue(rolled);
      setIsRolling(false);
      setHasRolled(true);

      // Three consecutive 6s rule
      let newSixes = rolled === 6 ? consecutiveSixes + 1 : 0;
      setConsecutiveSixes(newSixes);

      if (newSixes === 3) {
        sounds.playCutOpponent();
        nextTurn(false, `Three 6s in a row! Turn forfeited for ${activePlayer.name}.`);
        return;
      }

      const playerTokens = allTokens[activePlayer.color] || [];
      const legal = getMovableTokens(playerTokens, rolled);

      // Calculate distinct playable choices:
      // Movable tokens already on the track (each represents a unique move)
      const movableOnTrack = legal.filter((t) => t.state !== 'yard');
      // Movable tokens in yard (all 4 do the exact same thing: deploy to start square)
      const canDeployFromYard = legal.some((t) => t.state === 'yard');
      const distinctOptionsCount = movableOnTrack.length + (canDeployFromYard ? 1 : 0);

      if (distinctOptionsCount === 0) {
        setMovableTokens([]);
        setTimeout(() => {
          nextTurn(false, `No legal moves for ${activePlayer.name}. Turn passed.`);
        }, 800);
      } else if (distinctOptionsCount === 1) {
        // EXACTLY 1 ACTION POSSIBLE:
        // Automatically play for ANY player (Pass & Play, vs Computer, etc.)
        const chosenToken =
          movableOnTrack.length === 1
            ? movableOnTrack[0]
            : legal.find((t) => t.state === 'yard');

        setMovableTokens([chosenToken]);
        setStatusMessage(`${activePlayer.name} rolled a ${rolled}! Auto-moving token...`);

        setTimeout(() => {
          executeStepByStepMovement(chosenToken.color, chosenToken.id, rolled);
        }, 400);
      } else {
        // MORE THAN 1 CHOICE AVAILABLE:
        // Player chooses which token to move!
        setMovableTokens(legal);
        if (activePlayer.isBot) {
          setStatusMessage(`${activePlayer.name} rolled a ${rolled}! Thinking...`);
        } else {
          setStatusMessage(`${activePlayer.name} rolled a ${rolled}! Choose which token to move.`);
        }
      }
    }, 450);
  };

  // Bot Turn Automation Effect
  useEffect(() => {
    if (botActionTimerRef.current) clearTimeout(botActionTimerRef.current);

    if (
      currentScreen === 'game' &&
      gameMode !== 'online' &&
      activePlayer.isBot &&
      !winner &&
      !isTokenHopping
    ) {
      if (!hasRolled && !isRolling) {
        botActionTimerRef.current = setTimeout(() => {
          handleRollDice();
        }, 750);
      } else if (hasRolled && movableTokens.length > 0) {
        botActionTimerRef.current = setTimeout(() => {
          const chosen = chooseBotMove(movableTokens, allTokens, diceValue, activePlayer.difficulty);
          if (chosen) {
            handleTokenClick(chosen, diceValue);
          }
        }, 650);
      }
    }

    return () => {
      if (botActionTimerRef.current) clearTimeout(botActionTimerRef.current);
    };
  }, [
    activePlayer,
    hasRolled,
    isRolling,
    movableTokens,
    diceValue,
    winner,
    gameMode,
    isTokenHopping,
    currentScreen,
  ]);

  // Reaction Emoji Handler
  const handleSendEmoji = (emoji) => {
    const color = activePlayer.color;
    setFloatingEmojis((prev) => ({ ...prev, [color]: emoji }));
    setTimeout(() => {
      setFloatingEmojis((prev) => {
        const copy = { ...prev };
        delete copy[color];
        return copy;
      });
    }, 1800);
  };

  // If on Landing Page, render landing menu
  if (currentScreen === 'landing') {
    return (
      <>
        <LandingPage
          onStartGame={handleStartGameFromLanding}
          onOpenOnlineModal={() => {
            if (socket && !socket.connected) socket.connect();
            setOnlineModalOpen(true);
          }}
          soundOn={soundOn}
          onToggleSound={handleToggleSound}
          musicOn={musicOn}
          onToggleMusic={handleToggleMusic}
          coins={coins}
          gems={gems}
          onOpenSpin={() => setSpinModalOpen(true)}
          onOpenRules={() => setRulesModalOpen(true)}
        />

        <SpinModal
          isOpen={spinModalOpen}
          onClose={() => setSpinModalOpen(false)}
          onRewardClaimed={handleRewardClaimed}
        />

        <RulesModal
          isOpen={rulesModalOpen}
          onClose={() => setRulesModalOpen(false)}
        />

        <OnlineLobbyModal
          isOpen={onlineModalOpen}
          onClose={() => setOnlineModalOpen(false)}
          socket={socket}
          room={onlineRoom}
          myColor={myOnlineColor}
          onCreateRoom={(playerName) => socket?.emit('create_room', { playerName })}
          onJoinRoom={(code, playerName) => socket?.emit('join_room', { code, playerName })}
          onStartGame={() => socket?.emit('start_game')}
          joinError={joinError}
        />
      </>
    );
  }

  // GAMEPLAY SCREEN
  const isDiceDisabled =
    hasRolled ||
    isRolling ||
    !!winner ||
    isTokenHopping ||
    (gameMode === 'vs_computer' && activePlayer.isBot) ||
    (gameMode === 'online' && activePlayer.color !== myOnlineColor);

  return (
    <main
      className={`min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col justify-between p-2 md:p-4 select-none relative overflow-hidden ${
        screenShake ? 'animate-shake' : ''
      }`}
    >
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Header Bar */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between py-2 px-3 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        {/* Back to Menu Button */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setCurrentScreen('landing');
          }}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1 text-xs font-bold"
          title="Back to Main Menu"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Menu</span>
        </button>

        {/* Game Title & Mode */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-amber-400 text-base">👑</span>
            <h1 className="text-sm md:text-base font-black tracking-wider text-amber-400">
              LUDO GAME
            </h1>
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {gameMode === 'vs_computer'
              ? `vs AI (${difficulty})`
              : gameMode === 'pass_and_play'
              ? `Pass & Play (${playerCount}P)`
              : `Online Room`}
          </span>
        </div>

        {/* Controls: Audio & Restart */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleToggleSound}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title={soundOn ? 'Mute Sound' : 'Unmute Sound'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          <button
            type="button"
            onClick={handleToggleMusic}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title={musicOn ? 'Stop Ambient Music' : 'Play Ambient Music'}
          >
            <Music className={`w-4 h-4 ${musicOn ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
          </button>

          <button
            type="button"
            onClick={() => handleStartGameFromLanding({ mode: gameMode, playerCount, difficulty, tokensToWin })}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Restart Match"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Top 2 Player Cards (Red & Green) */}
      <div className="max-w-md w-full mx-auto grid grid-cols-2 gap-2 my-1.5">
        <PlayerCard
          color={players[0]?.color || 'red'}
          name={players[0]?.name}
          isActive={currentTurnIdx === 0}
          isBot={players[0]?.isBot}
          tokens={allTokens[players[0]?.color || 'red']}
          timeLeft={currentTurnIdx === 0 ? turnTimeLeft : TURN_TIME_LIMIT}
          maxTime={TURN_TIME_LIMIT}
          floatingEmoji={floatingEmojis[players[0]?.color || 'red']}
        />
        <PlayerCard
          color={players[1]?.color || 'green'}
          name={players[1]?.name}
          isActive={currentTurnIdx === 1}
          isBot={players[1]?.isBot}
          tokens={allTokens[players[1]?.color || 'green']}
          timeLeft={currentTurnIdx === 1 ? turnTimeLeft : TURN_TIME_LIMIT}
          maxTime={TURN_TIME_LIMIT}
          floatingEmoji={floatingEmojis[players[1]?.color || 'green']}
        />
      </div>

      {/* Center 15x15 Ludo Board with Hopping & Ripple Effects */}
      <div className="w-full flex-1 flex items-center justify-center my-auto">
        <LudoBoard
          allTokens={allTokens}
          movableTokens={movableTokens}
          onTokenClick={(t) => handleTokenClick(t)}
          activeColor={activeColorConfig.bg}
          animatingToken={animatingToken}
          rippleCell={rippleCell}
        />
      </div>

      {/* Bottom 2 Player Cards (Blue & Yellow) if 4 players */}
      {players.length > 2 && (
        <div className="max-w-md w-full mx-auto grid grid-cols-2 gap-2 my-1.5">
          <PlayerCard
            color={players[3]?.color || 'blue'}
            name={players[3]?.name}
            isActive={currentTurnIdx === 3}
            isBot={players[3]?.isBot}
            tokens={allTokens[players[3]?.color || 'blue']}
            timeLeft={currentTurnIdx === 3 ? turnTimeLeft : TURN_TIME_LIMIT}
            maxTime={TURN_TIME_LIMIT}
            floatingEmoji={floatingEmojis[players[3]?.color || 'blue']}
          />
          <PlayerCard
            color={players[2]?.color || 'yellow'}
            name={players[2]?.name}
            isActive={currentTurnIdx === 2}
            isBot={players[2]?.isBot}
            tokens={allTokens[players[2]?.color || 'yellow']}
            timeLeft={currentTurnIdx === 2 ? turnTimeLeft : TURN_TIME_LIMIT}
            maxTime={TURN_TIME_LIMIT}
            floatingEmoji={floatingEmojis[players[2]?.color || 'yellow']}
          />
        </div>
      )}

      {/* Reaction Emojis Floating Bar */}
      <div className="max-w-md w-full mx-auto mb-1 flex justify-center">
        <EmojiBar onSendEmoji={handleSendEmoji} />
      </div>

      {/* Status Bar & 3D Interactive Dice */}
      <footer className="max-w-md w-full mx-auto bg-slate-900/95 rounded-2xl border border-slate-800 p-3 shadow-2xl flex items-center justify-between">
        {/* Turn Status Message */}
        <div className="flex-1 pr-3">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block animate-ping"
              style={{ backgroundColor: activeColorConfig.bg }}
            />
            <span className="text-xs font-black uppercase tracking-wider text-slate-300">
              {activePlayer.name}
            </span>
          </div>
          <p className="text-xs md:text-sm font-bold text-slate-100 mt-0.5 leading-snug">
            {statusMessage}
          </p>
        </div>

        {/* 3D Dice */}
        <div className="flex-shrink-0">
          <Dice
            value={diceValue}
            rolling={isRolling}
            onRoll={handleRollDice}
            disabled={isDiceDisabled}
            activeColor={activeColorConfig.bg}
          />
        </div>
      </footer>

      {/* Winner Celebration Modal */}
      {winner && (
        <WinModal
          winnerColor={winner}
          winnerName={players.find((p) => p.color === winner)?.name}
          onRestart={() => handleStartGameFromLanding({ mode: gameMode, playerCount, difficulty, tokensToWin })}
        />
      )}
    </main>
  );
}
