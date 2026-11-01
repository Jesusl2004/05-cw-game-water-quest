// Game configuration and state variables
const DIFFICULTIES = {
  easy: { label: 'Easy', duration: 45, winningScore: 15, spawnInterval: 1200, oilChance: 0.15 },
  normal: { label: 'Normal', duration: 30, winningScore: 20, spawnInterval: 1000, oilChance: 0.25 },
  hard: { label: 'Hard', duration: 20, winningScore: 25, spawnInterval: 700, oilChance: 0.35 }
};
const MILESTONE_MESSAGES = [
  { score: 5, message: 'Great start!' },
  { score: 10, message: 'Halfway there!' },
  { score: 15, message: 'You are on a roll!' },
  { score: 20, message: 'Amazing work!' },
  { score: 25, message: 'Incredible! You reached 25 points!' }
];
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let selectedDifficulty = 'normal';
let reachedMilestones = new Set();
let remainingTime = DIFFICULTIES[selectedDifficulty].duration;
let spawnInterval;           // Holds the interval for spawning items
let timerInterval;           // Holds the interval for the game timer
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('current-cans');
const achievementDisplay = document.getElementById('achievements');
const winningScoreDisplay = document.getElementById('winning-score');
const difficultyButtons = document.querySelectorAll('.difficulty-button');
const gameOverSound = document.getElementById('game-over-sound');

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

  // Spawn a water can, bonus storm, or oil obstacle
  const itemRoll = Math.random();
  const difficulty = DIFFICULTIES[selectedDifficulty];
  if (itemRoll < difficulty.oilChance) {
    randomCell.innerHTML = `
      <div class="water-can-wrapper">
        <div class="oil-obstacle" role="button" aria-label="Oil obstacle">🛢️</div>
      </div>
    `;
  } else if (itemRoll < difficulty.oilChance + 0.15) {
    randomCell.innerHTML = `
      <div class="water-can-wrapper">
        <div class="storm-bonus" role="button" aria-label="Storm bonus worth 2 points">🌩️</div>
      </div>
    `;
  } else {
    randomCell.innerHTML = `
      <div class="water-can-wrapper">
        <div class="water-can"></div>
      </div>
    `;
  }
}

// Updates the score when an active item is clicked
function collectWaterCan(event) {
  if (!gameActive) return;

  const clickedCan = event.target.closest('.water-can');
  const clickedOil = event.target.closest('.oil-obstacle');
  const clickedStorm = event.target.closest('.storm-bonus');
  if (!clickedCan && !clickedOil && !clickedStorm) return;

  currentCans += clickedCan ? 1 : clickedStorm ? 2 : -2;
  currentCans = Math.max(0, currentCans);
  scoreDisplay.textContent = currentCans;
  showMilestoneMessage();
  event.target.closest('.water-can-wrapper').remove();
}

function showMilestoneMessage() {
  const reachedMessage = MILESTONE_MESSAGES.find(milestone =>
    currentCans >= milestone.score && !reachedMilestones.has(milestone.score)
  );

  if (!reachedMessage) return;

  reachedMilestones.add(reachedMessage.score);
  achievementDisplay.textContent = reachedMessage.message;
}

// Initializes and starts a new game
function startGame() {
  if (gameActive) return; // Prevent starting a new game if one is already active
  const difficulty = DIFFICULTIES[selectedDifficulty];
  gameActive = true;
  currentCans = 0;
  reachedMilestones = new Set();
  scoreDisplay.textContent = currentCans;
  achievementDisplay.textContent = '';
  remainingTime = difficulty.duration;
  timerDisplay.textContent = remainingTime;
  setDifficultyButtonsDisabled(true);
  createGrid(); // Set up the game grid
  spawnWaterCan();
  spawnInterval = setInterval(spawnWaterCan, difficulty.spawnInterval);
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
  setDifficultyButtonsDisabled(false);
  const playerWon = currentCans >= DIFFICULTIES[selectedDifficulty].winningScore;
  achievementDisplay.textContent = playerWon
    ? 'Yay you won! go drink some water, you earned it!'
    : 'haha you lost try again';

  if (playerWon) {
    showWinEffect();
  } else {
    gameOverSound.currentTime = 0;
    gameOverSound.play().catch(() => {
      achievementDisplay.textContent += ' Sound effect unavailable.';
    });
  }
}

// Stops the current game and restores the initial state
function resetGame() {
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  currentCans = 0;
  reachedMilestones = new Set();
  remainingTime = DIFFICULTIES[selectedDifficulty].duration;
  scoreDisplay.textContent = currentCans;
  timerDisplay.textContent = remainingTime;
  achievementDisplay.textContent = '';
  setDifficultyButtonsDisabled(false);
  createGrid();
}

function updateDifficulty(difficulty) {
  if (gameActive || !DIFFICULTIES[difficulty]) return;

  selectedDifficulty = difficulty;
  const settings = DIFFICULTIES[selectedDifficulty];
  winningScoreDisplay.textContent = settings.winningScore;
  remainingTime = settings.duration;
  timerDisplay.textContent = remainingTime;
  difficultyButtons.forEach(button => {
    const isSelected = button.dataset.difficulty === selectedDifficulty;
    button.classList.toggle('active', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
  });
}

function setDifficultyButtonsDisabled(disabled) {
  difficultyButtons.forEach(button => {
    button.disabled = disabled;
  });
}

// Set up click handler for the start button
document.querySelector('.game-grid').addEventListener('click', collectWaterCan);
document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('reset-game').addEventListener('click', resetGame);
difficultyButtons.forEach(button => {
  button.addEventListener('click', () => updateDifficulty(button.dataset.difficulty));
});
