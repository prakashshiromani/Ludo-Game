import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Serve static frontend files from client/dist if built
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

// Active rooms in memory: { [roomCode]: RoomData }
const rooms = new Map();

// Generate a random 6-digit numeric room code
function generateRoomCode() {
  let code;
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms.has(code));
  return code;
}

const COLOR_ORDER = ['red', 'green', 'yellow', 'blue'];

io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // Create a new multiplayer room
  socket.on('create_room', ({ playerName }) => {
    const code = generateRoomCode();
    const newRoom = {
      code,
      hostId: socket.id,
      players: [
        {
          id: socket.id,
          name: playerName || 'Player 1',
          color: 'red',
          ready: true,
        },
      ],
      status: 'waiting', // 'waiting' | 'in_progress' | 'finished'
      currentTurnIndex: 0,
      diceValue: null,
    };

    rooms.set(code, newRoom);
    socket.join(code);
    socket.roomCode = code;

    socket.emit('room_created', { room: newRoom, myColor: 'red' });
    console.log(`[Room Created] Code: ${code} by ${playerName || 'Player 1'}`);
  });

  // Join an existing room with code
  socket.on('join_room', ({ code, playerName }) => {
    const room = rooms.get(code);

    if (!room) {
      return socket.emit('join_error', { message: 'Room not found. Check the 6-digit code.' });
    }

    if (room.players.length >= 4) {
      return socket.emit('join_error', { message: 'Room is already full (maximum 4 players).' });
    }

    if (room.status !== 'waiting') {
      return socket.emit('join_error', { message: 'Game has already started in this room.' });
    }

    const assignedColor = COLOR_ORDER[room.players.length];
    const newPlayer = {
      id: socket.id,
      name: playerName || `Player ${room.players.length + 1}`,
      color: assignedColor,
      ready: true,
    };

    room.players.push(newPlayer);
    socket.join(code);
    socket.roomCode = code;

    socket.emit('room_joined', { room, myColor: assignedColor });
    io.to(code).emit('room_updated', { room });
    console.log(`[Player Joined] ${newPlayer.name} joined room ${code} as ${assignedColor}`);
  });

  // Host starts the game
  socket.on('start_game', () => {
    const code = socket.roomCode;
    const room = rooms.get(code);
    if (!room) return;

    if (room.hostId !== socket.id) {
      return socket.emit('error', { message: 'Only the host can start the game.' });
    }

    room.status = 'in_progress';
    room.currentTurnIndex = 0;
    io.to(code).emit('game_started', { room });
    console.log(`[Game Started] Room ${code}`);
  });

  // Handle dice roll
  socket.on('roll_dice', () => {
    const code = socket.roomCode;
    const room = rooms.get(code);
    if (!room || room.status !== 'in_progress') return;

    const activePlayer = room.players[room.currentTurnIndex];
    if (activePlayer.id !== socket.id) {
      return socket.emit('error', { message: 'Not your turn!' });
    }

    const rolled = Math.floor(Math.random() * 6) + 1;
    room.diceValue = rolled;

    io.to(code).emit('dice_rolled', {
      player: activePlayer,
      diceValue: rolled,
    });
  });

  // Handle token move
  socket.on('move_token', ({ tokenId }) => {
    const code = socket.roomCode;
    const room = rooms.get(code);
    if (!room || room.status !== 'in_progress') return;

    const activePlayer = room.players[room.currentTurnIndex];
    if (activePlayer.id !== socket.id) return;

    io.to(code).emit('token_moved', {
      color: activePlayer.color,
      tokenId,
      diceValue: room.diceValue,
    });
  });

  // Handle turn passing
  socket.on('pass_turn', ({ extraTurn = false }) => {
    const code = socket.roomCode;
    const room = rooms.get(code);
    if (!room || room.status !== 'in_progress') return;

    if (!extraTurn) {
      room.currentTurnIndex = (room.currentTurnIndex + 1) % room.players.length;
    }
    room.diceValue = null;

    io.to(code).emit('turn_changed', {
      currentTurnIndex: room.currentTurnIndex,
      activePlayer: room.players[room.currentTurnIndex],
    });
  });

  // Handle player disconnect
  socket.on('disconnect', () => {
    const code = socket.roomCode;
    if (code && rooms.has(code)) {
      const room = rooms.get(code);
      room.players = room.players.filter((p) => p.id !== socket.id);

      if (room.players.length === 0) {
        rooms.delete(code);
        console.log(`[Room Deleted] Room ${code} is empty.`);
      } else {
        if (room.hostId === socket.id) {
          room.hostId = room.players[0].id;
        }
        io.to(code).emit('player_left', {
          room,
          message: 'A player has left the match.',
        });
      }
    }
    console.log(`[Socket Disconnected] ID: ${socket.id}`);
  });
});

// Fallback route to serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🎲 Ludo Server running on http://localhost:${PORT}`);
  console.log(`===============================================`);
});

