import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

// Game constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;
const PLAYER_SPEED = 8;
const PLAYER_SIZE = 64; // Define player size constant
const HEALTH_MAX = 5;
const BASE_HEALTH_DRAIN_INTERVAL = 8000; // 8 seconds at normal speed
const BASE_MEME_SPAWN_INTERVAL = 3000; // 3 seconds at normal speed
const BASE_MEME_DESPAWN_TIME = 8000; // 8 seconds before memes disappear
const SPEED_BOOST_MULTIPLIER = 0.6; // 40% faster when at max health
const HEALTH_PER_MEME = 1; // Health restored per meme collected

// Meme types for collection (matching your sprite names)
const MEME_TYPES = [
  "trollface",
  "doge",
  "pepe",
  "nyan",
  "rickroll",
  "stonks",
  "distracted",
  "drake",
];

// Pause Modal Component
function PauseModal({ memesCollected, onResume }) {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      {/* Main modal container */}
      <div className="border-4 border-green-400 bg-black p-8 relative min-w-96">
        {/* Glowing border effects */}
        <div className="absolute inset-0 border-4 border-green-400 opacity-50 animate-pulse"></div>
        <div className="absolute inset-0 border-2 border-green-400 opacity-30"></div>

        <div className="relative z-10 text-center text-green-400">
          {/* Title */}
          <div className="text-3xl mb-6 animate-pulse tracking-wider">
            ⏸️ GAME PAUSED ⏸️
          </div>

          {/* Grid pattern background for retro feel */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,255,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,255,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
            }}
          ></div>

          {/* Score display */}
          <div className="mb-8 relative">
            <div className="text-lg mb-2 tracking-wider">CURRENT SCORE</div>
            <div className="border-2 border-green-400 p-4 bg-black relative">
              <div className="absolute inset-0 border-2 border-green-400 opacity-30"></div>
              <div className="relative z-10">
                <div className="text-2xl font-bold text-green-300 tracking-widest">
                  {memesCollected.toString().padStart(3, "0")}
                </div>
                <div className="text-sm opacity-75 mt-1">MEMES COLLECTED</div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3 text-sm">
            <div className="border border-green-400 p-3 opacity-75">
              <div className="tracking-wider">CONTROLS</div>
              <div className="mt-2 text-xs opacity-60">
                WASD / ARROW KEYS - MOVE
                <br />
                P / ESC - PAUSE/RESUME
                <br />R - RESTART (WHEN GAME OVER)
              </div>
            </div>

            <div className="border border-green-400 p-3 opacity-75">
              <div className="tracking-wider">OBJECTIVE</div>
              <div className="mt-2 text-xs opacity-60">
                COLLECT MEMES TO RESTORE HEALTH
                <br />
                FULL HEALTH = SPEED BOOST!
              </div>
            </div>
          </div>

          {/* Resume button */}
          <div className="mt-6">
            <button
              onClick={onResume}
              className="border-2 border-green-400 bg-black px-6 py-2 text-green-400 hover:bg-green-400 hover:text-black transition-colors duration-200 relative group"
            >
              <div className="absolute inset-0 border-2 border-green-400 opacity-50 group-hover:opacity-100"></div>
              <span className="relative z-10 tracking-wider font-bold">
                ▶️ RESUME GAME
              </span>
            </button>
          </div>

          <div className="mt-4 text-xs opacity-60 animate-pulse">
            Press P or ESC to resume
          </div>
        </div>
      </div>
    </div>
  );
}

// HUD Component
function HUD({ health, memesCollected, speedBoostActive, isPaused, onPause }) {
  return (
    <div className="w-full h-16 flex justify-between items-center px-6 bg-black border-2 border-green-400 text-green-400 text-sm relative">
      {/* Glowing border effect */}
      <div className="absolute inset-0 border-2 border-green-400 opacity-50 animate-pulse"></div>

      {/* Speed boost indicator */}
      {speedBoostActive && (
        <div className="absolute inset-0 border-2 border-yellow-400 opacity-60 animate-ping"></div>
      )}

      <div className="flex items-center gap-4 relative z-10">
        <span
          className={`font-bold tracking-wider ${
            speedBoostActive ? "text-yellow-400" : "text-green-400"
          }`}
        >
          HEALTH:{" "}
          <span
            className={speedBoostActive ? "text-yellow-300" : "text-green-300"}
          >
            {"█".repeat(Math.max(0, health))}
            {"░".repeat(Math.max(0, HEALTH_MAX - health))}
          </span>
        </span>

        {/* Pixel heart icon with speed boost effect */}
        <div
          className={`text-lg ${
            speedBoostActive
              ? "text-yellow-400 animate-pulse"
              : "text-green-400"
          }`}
        >
          ♥
        </div>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        {speedBoostActive && (
          <div className="text-yellow-400 text-xs animate-pulse font-bold">
            ⚡ SPEED BOOST! ⚡
          </div>
        )}
        <span
          className={`font-bold tracking-wider ${
            speedBoostActive ? "text-yellow-400" : "text-green-400"
          }`}
        >
          MEMES COLLECTED:{" "}
          <span
            className={speedBoostActive ? "text-yellow-300" : "text-green-300"}
          >
            {memesCollected.toString().padStart(3, "0")}
          </span>
        </span>

        {/* Pause button */}
        <button
          onClick={onPause}
          className="border border-green-400 px-2 py-1 text-xs hover:bg-green-400 hover:text-black transition-colors duration-200 relative group"
          disabled={isPaused}
        >
          <div className="absolute inset-0 border border-green-400 opacity-50 group-hover:opacity-100"></div>
          <span className="relative z-10 tracking-wider">
            {isPaused ? "⏸️" : "⏸️ PAUSE"}
          </span>
        </button>
      </div>
    </div>
  );
}

// Sprite Component
function Sprite({ type, position, size = 52, memeType = null }) {
  // Image paths for your custom sprites
  const spriteImageMap = {
    wagon: "/sprites/wagon.png",
    ox: "/sprites/ox.png",
    player: "/sprites/ox-wagon.png", // Combined ox + wagon sprite
    trollface: "/sprites/memes/trollface.png",
    doge: "/sprites/memes/doge.png",
    pepe: "/sprites/memes/pepe.png",
    nyan: "/sprites/memes/rainbow.png",
    rickroll: "/sprites/memes/tunes.png",
    stonks: "/sprites/memes/pump.png",
    distracted: "/sprites/memes/star.png",
    drake: "/sprites/memes/drake.png",
  };

  // Determine which sprite to use
  let spriteKey = type;
  if (type === "meme" && memeType) {
    spriteKey = memeType;
  }

  const imageSrc = spriteImageMap[spriteKey];

  // Only render if we have a valid image source
  if (!imageSrc) {
    return null;
  }

  return (
    <div
      className="absolute select-none pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        width: size,
        height: size,
        filter: "drop-shadow(0 0 4px #00ff00)",
      }}
    >
      <img
        src={imageSrc}
        alt={spriteKey}
        className="w-full h-full object-contain pixelated"
        // style={{
        //   imageRendering: "pixelated",
        //   imageRendering: "-moz-crisp-edges",
        //   imageRendering: "crisp-edges",
        // }}
      />
    </div>
  );
}

// GameBoard Component
function GameBoard({
  playerPosition,
  setPlayerPosition,
  memes,
  setMemes,
  setMemesCollected,
  setInventory,
  setHealth,
  gameOver,
  isPaused,
}) {
  const [keys, setKeys] = useState({});

  // Handle keydown/keyup
  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: true }));
    };

    const handleKeyUp = (e) => {
      setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: false }));
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Player movement - FIXED BOUNDARIES
  useEffect(() => {
    if (gameOver || isPaused) return;

    const interval = setInterval(() => {
      setPlayerPosition((pos) => {
        let { x, y } = pos;

        // Fixed movement boundaries to use full canvas
        if (keys["arrowup"] || keys["w"]) y = Math.max(0, y - PLAYER_SPEED);
        if (keys["arrowdown"] || keys["s"])
          y = Math.min(GAME_HEIGHT - PLAYER_SIZE, y + PLAYER_SPEED);
        if (keys["arrowleft"] || keys["a"]) x = Math.max(0, x - PLAYER_SPEED);
        if (keys["arrowright"] || keys["d"])
          x = Math.min(GAME_WIDTH - PLAYER_SIZE, x + PLAYER_SPEED);

        return { x, y };
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [keys, gameOver, isPaused, setPlayerPosition]);

  // Collision detection with health restoration
  useEffect(() => {
    if (isPaused) return;

    memes.forEach((meme, index) => {
      const distance = Math.sqrt(
        Math.pow(playerPosition.x - meme.x, 2) +
          Math.pow(playerPosition.y - meme.y, 2)
      );

      if (distance < 40) {
        // Collision threshold
        // Remove the collected meme
        setMemes((prev) => prev.filter((_, i) => i !== index));

        // Increase meme counter
        setMemesCollected((prev) => prev + 1);

        // Add to inventory
        setInventory((prev) => [...prev, meme.type]);

        // RESTORE HEALTH - This is the key fix!
        setHealth((prev) => {
          console.log(
            `Health restored! Was: ${prev}, Now: ${Math.min(
              HEALTH_MAX,
              prev + HEALTH_PER_MEME
            )}`
          );
          return Math.min(HEALTH_MAX, prev + HEALTH_PER_MEME);
        });
      }
    });
  }, [
    playerPosition,
    memes,
    setMemes,
    setMemesCollected,
    setInventory,
    setHealth,
    isPaused,
  ]);

  return (
    <div
      className="flex-1 relative bg-black overflow-hidden border-2 border-green-400"
      style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
    >
      {/* Glowing border effect */}
      <div className="absolute inset-0 border-2 border-green-400 opacity-30 animate-pulse"></div>

      {/* Grid pattern for retro feel */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      ></div>

      {/* Player sprite */}
      <Sprite type="player" position={playerPosition} size={PLAYER_SIZE} />

      {/* Meme collectibles */}
      {memes.map((meme, index) => (
        <Sprite
          key={index}
          type="meme"
          memeType={meme.type}
          position={meme}
          size={24}
        />
      ))}

      {/* Game Over overlay */}
      {gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="text-green-400 text-center">
            <div className="text-2xl mb-4 animate-pulse">GAME OVER</div>
            <div className="text-sm">Press R to restart</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inventory Component
function Inventory({ inventory }) {
  return (
    <div className="absolute bottom-4 left-4 border-2 border-green-400 bg-black p-3 min-w-32">
      {/* Glowing border */}
      <div className="absolute inset-0 border-2 border-green-400 opacity-50"></div>

      <div className="relative z-10">
        <h2 className="text-green-400 text-xs mb-2 text-center">INVENTORY</h2>
        <div className="grid grid-cols-2 gap-2 min-h-16">
          {inventory.slice(-4).map((item, i) => (
            <div key={i} className="flex items-center justify-center w-8 h-8">
              <Sprite
                type="meme"
                memeType={item}
                position={{ x: 0, y: 0 }}
                size={16}
              />
            </div>
          ))}
          {inventory.length === 0 && (
            <div className="col-span-2 text-green-400 text-xs text-center opacity-50">
              EMPTY
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// MiniMap Component
function MiniMap({ playerPosition, memes }) {
  const scaleX = 80 / GAME_WIDTH; // Adjusted for better representation
  const scaleY = 50 / GAME_HEIGHT;

  return (
    <div className="absolute bottom-4 right-4 border-2 border-green-400 bg-black p-3">
      {/* Glowing border */}
      <div className="absolute inset-0 border-2 border-green-400 opacity-50"></div>

      <div className="relative z-10">
        <h2 className="text-green-400 text-xs mb-2 text-center">MINIMAP</h2>
        <div className="w-20 h-12 relative border border-green-400 bg-black">
          {/* Player dot */}
          <div
            className="absolute w-1 h-1 bg-green-400 animate-pulse rounded-full"
            style={{
              left: Math.max(0, Math.min(78, playerPosition.x * scaleX)),
              top: Math.max(0, Math.min(48, playerPosition.y * scaleY)),
            }}
          ></div>

          {/* Meme dots */}
          {memes.map((meme, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-green-300 opacity-75 rounded-full"
              style={{
                left: Math.max(0, Math.min(78, meme.x * scaleX)),
                top: Math.max(0, Math.min(48, meme.y * scaleY)),
              }}
            ></div>
          ))}
        </div>

        <div className="text-green-400 text-xs mt-1 text-center">
          {Math.floor(playerPosition.x)},{Math.floor(playerPosition.y)}
        </div>
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  const [health, setHealth] = useState(HEALTH_MAX);
  const [memesCollected, setMemesCollected] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 100, y: 200 });
  const [memes, setMemes] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMaxHealth, setIsMaxHealth] = useState(false);
  const [speedBoostActive, setSpeedBoostActive] = useState(false);

  // Check if player is at max health for speed boost
  useEffect(() => {
    const maxHealth = health === HEALTH_MAX;
    setIsMaxHealth(maxHealth);

    if (maxHealth && !speedBoostActive) {
      setSpeedBoostActive(true);
      console.log("SPEED BOOST ACTIVATED!");
    } else if (!maxHealth && speedBoostActive) {
      // Add a small delay before deactivating speed boost to prevent flickering
      const timeout = setTimeout(() => {
        setSpeedBoostActive(false);
        console.log("Speed boost deactivated");
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [health, speedBoostActive]);

  // Calculate dynamic intervals based on speed boost
  const currentHealthDrainInterval = speedBoostActive
    ? BASE_HEALTH_DRAIN_INTERVAL * SPEED_BOOST_MULTIPLIER
    : BASE_HEALTH_DRAIN_INTERVAL;

  const currentMemeSpawnInterval = speedBoostActive
    ? BASE_MEME_SPAWN_INTERVAL * SPEED_BOOST_MULTIPLIER
    : BASE_MEME_SPAWN_INTERVAL;

  // Spawn memes periodically with dynamic speed - FIXED SPAWN BOUNDARIES
  useEffect(() => {
    if (gameOver || !gameStarted || isPaused) return;

    console.log(
      `Spawning memes every ${currentMemeSpawnInterval}ms (Speed boost: ${speedBoostActive})`
    );

    const interval = setInterval(() => {
      const newMeme = {
        x: Math.random() * (GAME_WIDTH - 24), // Account for meme size
        y: Math.random() * (GAME_HEIGHT - 24), // Account for meme size
        type: MEME_TYPES[Math.floor(Math.random() * MEME_TYPES.length)],
        spawnTime: Date.now(),
      };

      setMemes((prev) => [...prev, newMeme]);
    }, currentMemeSpawnInterval);

    return () => clearInterval(interval);
  }, [
    gameOver,
    gameStarted,
    isPaused,
    currentMemeSpawnInterval,
    speedBoostActive,
  ]);

  // Remove old memes (despawn system) with dynamic speed
  useEffect(() => {
    if (gameOver || !gameStarted || isPaused) return;

    const interval = setInterval(() => {
      const currentTime = Date.now();
      const despawnTime = speedBoostActive
        ? BASE_MEME_DESPAWN_TIME * SPEED_BOOST_MULTIPLIER
        : BASE_MEME_DESPAWN_TIME;

      setMemes((prev) =>
        prev.filter((meme) => currentTime - meme.spawnTime < despawnTime)
      );
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [gameOver, gameStarted, isPaused, speedBoostActive]);

  // Health drain over time with dynamic speed
  useEffect(() => {
    if (gameOver || !gameStarted || isPaused) return;

    console.log(
      `Health draining every ${currentHealthDrainInterval}ms (Speed boost: ${speedBoostActive})`
    );

    const interval = setInterval(() => {
      setHealth((prev) => {
        const newHealth = prev - 1;
        console.log(`Health drained: ${prev} -> ${newHealth}`);
        if (newHealth <= 0) {
          setGameOver(true);
          return 0;
        }
        return newHealth;
      });
    }, currentHealthDrainInterval);

    return () => clearInterval(interval);
  }, [
    gameOver,
    gameStarted,
    isPaused,
    currentHealthDrainInterval,
    speedBoostActive,
  ]);

  // Handle pause/resume functionality
  const handlePause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Restart game and keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === "r" && gameOver) {
        setHealth(HEALTH_MAX);
        setMemesCollected(0);
        setInventory([]);
        setPlayerPosition({ x: 100, y: 200 });
        setMemes([]);
        setGameOver(false);
        setIsPaused(false);
        setSpeedBoostActive(false);
        setIsMaxHealth(true);
      }
      if (e.key === " " && !gameStarted) {
        setGameStarted(true);
      }
      // Pause/Resume with P key or Escape
      if (
        (e.key.toLowerCase() === "p" || e.key === "Escape") &&
        gameStarted &&
        !gameOver
      ) {
        if (isPaused) {
          handleResume();
        } else {
          handlePause();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver, gameStarted, isPaused, handlePause, handleResume]);

  // Initial memes - FIXED SPAWN BOUNDARIES
  useEffect(() => {
    if (gameStarted && memes.length === 0 && !isPaused) {
      const initialMemes = Array.from({ length: 3 }, () => ({
        x: Math.random() * (GAME_WIDTH - 24), // Account for meme size
        y: Math.random() * (GAME_HEIGHT - 24), // Account for meme size
        type: MEME_TYPES[Math.floor(Math.random() * MEME_TYPES.length)],
        spawnTime: Date.now(),
      }));
      setMemes(initialMemes);
    }
  }, [gameStarted, memes.length, isPaused]);

  return (
    <div className="min-h-screen w-screen bg-black text-green-400 font-mono overflow-hidden flex items-center justify-center">
      {/* CRT scanlines effect */}
      <div
        className="absolute inset-0 pointer-events-none z-50 opacity-20"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,255,0,0.03) 2px,
            rgba(0,255,0,0.03) 4px
          )`,
        }}
      ></div>

      {/* Game container with fixed dimensions */}
      <div
        className="border-4 border-green-400 relative"
        style={{ width: GAME_WIDTH + 8, height: GAME_HEIGHT + 64 + 8 }}
      >
        <div className="absolute inset-0 border-4 border-green-400 opacity-50 animate-pulse"></div>

        {!gameStarted ? (
          <div className="h-full flex items-center justify-center bg-black">
            <div className="text-center text-green-400">
              <div className="text-4xl mb-8 animate-pulse">MEME TRAIL</div>
              <div className="text-lg mb-4">Survive by collecting memes!</div>
              <div className="text-sm mb-8">
                Use WASD or Arrow Keys to move
                <br />
                Health drains over time
                <br />
                <span className="text-yellow-400">
                  Collect memes to restore health!
                </span>
                <br />
                <span className="text-yellow-400">
                  Max health = SPEED BOOST!
                </span>
                <br />
                <span className="text-green-300">Press P or ESC to pause</span>
              </div>
              <div className="text-lg animate-pulse">Press SPACE to start</div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <HUD
              health={health}
              memesCollected={memesCollected}
              speedBoostActive={speedBoostActive}
              isPaused={isPaused}
              onPause={handlePause}
            />
            <div className="flex-1 relative">
              <GameBoard
                playerPosition={playerPosition}
                setPlayerPosition={setPlayerPosition}
                memes={memes}
                setMemes={setMemes}
                setMemesCollected={setMemesCollected}
                setInventory={setInventory}
                setHealth={setHealth}
                gameOver={gameOver}
                isPaused={isPaused}
              />
              <Inventory inventory={inventory} />
              <MiniMap playerPosition={playerPosition} memes={memes} />

              {/* Pause Modal */}
              {isPaused && (
                <PauseModal
                  memesCollected={memesCollected}
                  onResume={handleResume}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
