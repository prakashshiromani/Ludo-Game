# 🎲 Ludo Game Web Edition

A modern, high-performance, and cinematic web clone of **Ludo Game** built with **React 19**, **Vite**, **Tailwind CSS**, **Web Audio API**, and **Node.js + Socket.io** for real-time multiplayer!

---

## 🌟 Key Features

### 1. 🏰 Royal Landing Page & Main Menu
- **Interactive Player Profile:** Displays Player Avatar, Level (Lv. 15), Title (*Royal Knight*), Live Coins counter (`🪙 10,000`), and Gems counter (`💎 150`).
- **Daily Lucky Spin Wheel:** Interactive fortune wheel with realistic spinning physics, audio ticks, confetti celebration, and real rewards added to the player balance.
- **Illustrated Rules Guide Modal:** Clear walkthrough of deploying tokens, safe zones, cutting rules, and winning conditions.
- **Ambient Royal Background Music:** Procedural, peaceful ambient synth loop toggleable right from the top bar.

### 2. 🎮 4 Signature Game Modes
- 🤖 **Play vs Computer (AI):** Intelligent bot with selectable difficulty (*Rookie*, *Warrior*, *Master*) and tactical decision engine (cutting, deploying, escaping, safe stars).
- 👥 **Pass & Play (Local):** 2 to 4 players on the same device with smart auto-play.
  - **Smart Auto-Play:** When a player rolls the dice and has only **1 legal movable token** (or all in yard on a 6), the game **automatically hops and plays** the move without needing a manual click!
  - **Manual Choice:** When **more than 1 token** can legally move, tokens pulse with a glowing ring and the player chooses which token to move.
- ⚡ **Quick Rush Mode:** Fast-paced blitz match (1 or 2 tokens to win) for quick gameplay sessions.
- 🌐 **Play Online with Friends:** Create or join private rooms using a 6-digit numeric room code with real-time Socket.io synchronization.

### 3. 🎬 Cinematic Motions & Animations
- **🐇 Step-by-Step Token Hopping:** Tokens hop tile-by-tile across the board with realistic physical jump curves and pitch-shifting audio feedback per step.
- **🎲 3D Tumbling Rolling Dice:** 3D perspective rotation, rapid face shuffling, and active player color radial halos.
- **💥 Cut Shockwave & Screen Shake:** Cutting an opponent token triggers physical camera screen shake, a red shockwave ripple, and a slide whistle as the token flies back to its yard.
- **✨ Safe Star Pulses:** Landing on any of the 8 safe star squares triggers a golden star chime and ripple wave.
- **⏱️ Concentric Circular Turn Timer:** 15-second countdown ring around the active player's avatar shifting from Green ➔ Orange ➔ Red with urgent ticking audio in the final 5 seconds.
- **😂 Floating Reaction Emojis:** Interactive reaction bar (😂, 😡, 👑, 🔥, 👏, 🎲) where tapped emojis float up into the air with playful pop sounds.

### 4. 🔊 Zero-Dependency Sound Synthesizer
- Built completely using the browser's native **Web Audio API**.
- Zero external MP3 downloads required — instantaneous response, zero latency, and 100% offline-ready!

---

## 🚀 How to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- npm (v9.0.0 or higher)

### Option 1: Run Full App (Frontend + Multiplayer Server)
```bash
# 1. Install dependencies (if not already installed)
npm install
npm --prefix client install
npm --prefix server install

# 2. Build the frontend
npm run build

# 3. Start full-stack server (serves frontend & WebSockets on port 3001)
npm start
```
Open your browser and navigate to:  
👉 **`http://localhost:3001`**

---

### Option 2: Run in Development Mode (Live Hot-Reload)
Run these in two separate terminals:

**Terminal 1 (Backend WebSocket Server):**
```bash
npm run server
```

**Terminal 2 (Frontend Vite Dev Server):**
```bash
npm run client
```
Open your browser at: **`http://localhost:5173`**

---

## 🌐 How to Host & Deploy

Since **Ludo Game** uses **Socket.io** for real-time multiplayer, it requires a host that supports long-lived WebSocket connections.

### 🏆 Recommended: Deploy on Render.com (100% Free)
1. Push your code to a **GitHub repository**.
2. Go to [Render.com](https://render.com) and create an account.
3. Click **"New +" ➔ "Web Service"** and connect your GitHub repository.
4. Configure the service settings:
   - **Environment:** `Node`
   - **Build Command:** `npm run build:all`
   - **Start Command:** `npm start`
5. Click **"Deploy Web Service"**.
6. Render will build the React client and start the Node.js server. You will get a free live URL (e.g. `https://ludo-game.onrender.com`).

---

### ⚡ Alternative: Deploy on Railway.app
1. Go to [Railway.app](https://railway.app) and sign in with GitHub.
2. Click **"New Project" ➔ "Deploy from GitHub repo"**.
3. Select your Ludo Game repository.
4. Railway will automatically detect Node.js, run `npm install` and start the app with full WebSocket support.

---

## 📂 Project Structure

```
Ludo/
├── client/                     # Frontend Application (React 19 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── audio/              # Sound Synthesizer (Web Audio API)
│   │   ├── components/
│   │   │   ├── LandingPage.jsx     # Main Menu, Profile Bar, Mode Selector
│   │   │   ├── LudoBoard.jsx       # 15×15 Board Grid, Safe Stars, Yard Box
│   │   │   ├── Dice.jsx            # 3D Animated Tumbling Rolling Dice
│   │   │   ├── Token.jsx           # 3D Pawn, Pulsing Movable Glow, Hopping
│   │   │   ├── PlayerCard.jsx      # Concentric Turn Timer Ring, Emojis
│   │   │   ├── WinModal.jsx        # Confetti Celebration & Winner Crown
│   │   │   ├── SpinModal.jsx       # Daily Lucky Fortune Wheel Modal
│   │   │   ├── RulesModal.jsx      # How to Play Illustrated Guide
│   │   │   ├── EmojiBar.jsx        # Floating In-Game Reaction Emojis
│   │   │   └── OnlineLobbyModal.jsx# 6-Digit Private Room Lobby
│   │   ├── constants/          # 15×15 Coordinates, 52-path definition, Safe Stars
│   │   ├── logic/              # Game rules engine, cut detection, Bot AI
│   │   ├── App.jsx             # Main game state machine & loop
│   │   └── index.css           # 3D keyframes, hopping physics, ripples
├── server/                     # Backend Server (Node.js + Express + Socket.io)
│   ├── index.js                # 6-digit room management & WebSocket sync
│   └── package.json
├── docs/                       # Specifications & Planning Documentation
│   ├── PRD.md                  # Product Requirements Document
│   ├── TRD.md                  # Technical Requirements Document
│   ├── GAME_RULES.md           # Game Rules & Coordinates Specification
│   ├── ARCHITECTURE.md         # Architecture Diagrams & Mermaid Charts
│   └── DEVELOPMENT_PLAN.md     # Sprint-based Development Plan
├── .gitignore                  # Git Ignore configuration
├── package.json                # Root package configuration
└── README.md                   # Project documentation
```

---

## 📜 Official Game Rules

1. **Deploying Tokens:** A player must roll a **6** to bring a token out of the yard onto the start square.
2. **Safe Stars (★):** There are **8 Safe Squares** on the 52-path perimeter. Tokens resting on safe stars cannot be cut by opponents.
3. **Cutting Opponents:** Landing on an opponent token outside a safe square cuts that token, sending it back to its yard, and awards the player a **Bonus Turn**.
4. **Bonus Turns:** Awarded for:
   - Rolling a **6**
   - Cutting an opponent's token
   - Successfully moving a token into the final Home
5. **Three Consecutive 6s:** Rolling three 6s in a row forfeits the third turn.
6. **Winning Condition:** First player to move all required tokens (4 for Classic, 1-2 for Quick Rush) into the central **Final Home** is crowned the winner!

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
