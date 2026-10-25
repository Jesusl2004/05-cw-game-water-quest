// Game configuration and state variables
const GAME_DURATION = 30;    // Game duration in seconds
const WINNING_SCORE = 20;    // Minimum score needed to win
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let remainingTime = GAME_DURATION;
let spawnInterval;           // Holds the interval for spawning items
let timerInterval;           // Holds the interval for the game timer
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('current-cans');
const achievementDisplay = document.getElementById('achievements');

function showWinEffect() {
  const splash = document.createElement('div');
  splash.className = 'water-splash';
  splash.setAttribute('aria-hidden', 'true');
  splash.innerHTML = '<span></span>'.repeat(8);
  achievementDisplay.appendChild(splash);
}

// Creates the 3x3 game grid where items will appear
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = ''; // Clear any existing grid cells
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell'; // Each cell represents a grid square
    grid.appendChild(cell);
  }
}

// Ensure the grid is created when the page loads
createGrid();

// Spawns a new item in a random grid cell
function spawnWaterCan() {
  if (!gameActive) return; // Stop if the game is not active
  const cells = document.querySelectorAll('.grid-cell');
  
  // Clear all cells before spawning a new water can
  cells.forEach(cell => (cell.innerHTML = ''));

  // Select a random cell from the grid to place the water can
  const randomCell = cells[Math.floor(Math.random() * cells.length)];

  // Spawn either a water can or an oil obstacle
  randomCell.innerHTML = Math.random() < 0.25
    ? `
      <div class="water-can-wrapper">
        <div class="oil-obstacle" role="button" aria-label="Oil obstacle">🛢️</div>
      </div>
    `
    : `
      <div class="water-can-wrapper">
        <div class="water-can"></div>
      </div>
    `;
}

// Updates the score when an active item is clicked
function collectWaterCan(event) {
  if (!gameActive) return;

  const clickedCan = event.target.closest('.water-can');
  const clickedOil = event.target.closest('.oil-obstacle');
  if (!clickedCan && !clickedOil) return;

  currentCans += clickedCan ? 1 : -2;
  currentCans = Math.max(0, currentCans);
  scoreDisplay.textContent = currentCans;
  event.target.closest('.water-can-wrapper').remove();
}

// Initializes and starts a new game
function startGame() {
  if (gameActive) return; // Prevent starting a new game if one is already active
  gameActive = true;
  currentCans = 0;
  scoreDisplay.textContent = currentCans;
  achievementDisplay.textContent = '';
  remainingTime = GAME_DURATION;
  timerDisplay.textContent = remainingTime;
  createGrid(); // Set up the game grid
  spawnInterval = setInterval(spawnWaterCan, 1000); // Spawn water cans every second
  timerInterval = setInterval(() => {
    remainingTime -= 1;
    timerDisplay.textContent = remainingTime;

    if (remainingTime === 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  gameActive = false; // Mark the game as inactive
  clearInterval(spawnInterval); // Stop spawning water cans
  clearInterval(timerInterval); // Stop the game timer
  const playerWon = currentCans >= WINNING_SCORE;
  achievementDisplay.textContent = playerWon
    ? 'Yay you won! go drink some water, you earned it!'
    : 'haha you lost try again';

  if (playerWon) {
    showWinEffect();
  }
}

// Stops the current game and restores the initial state
function resetGame() {
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  currentCans = 0;
  remainingTime = GAME_DURATION;
  scoreDisplay.textContent = currentCans;
  timerDisplay.textContent = remainingTime;
  achievementDisplay.textContent = '';
  createGrid();
}

// Set up click handler for the start button
document.querySelector('.game-grid').addEventListener('click', collectWaterCan);
document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('reset-game').addEventListener('click', resetGame);
