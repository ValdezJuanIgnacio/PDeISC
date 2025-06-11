const cells = document.querySelectorAll('[data-cell]');
const board = document.getElementById('board');
const statusText = document.getElementById('gameStatus');
const restartBtn = document.getElementById('restartBtn');
const nameModal = document.getElementById('nameModal');
const playerNameInput = document.getElementById('playerNameInput');
const player2NameInput = document.getElementById('player2NameInput');
const modalErrorMsg = document.getElementById('modalErrorMsg');
const vsPlayerBtn = document.getElementById('vsPlayerBtn');
const vsCpuBtn = document.getElementById('vsCpuBtn');
const changeModeBtn = document.getElementById('changeModeBtn');
const rankingList = document.getElementById('rankingList');
const victoriaSound = new Audio('../multimedia/Victoria.mp3');
const errorSound = new Audio('../multimedia/Error.mp3');


let currentPlayer = 'X';
let gameActive = false;
let gameState = ["", "", "", "", "", "", "", "", ""];
let vsCPU = false;
let player1 = '';
let player2 = '';
//combinaciones para ganar
const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];
//detecta el click del usuario y si no esta marcado ya lo marca
function handleCellClick(e) {
  const cell = e.target;
  const index = Array.from(cells).indexOf(cell);
  if (gameState[index] !== "" || !gameActive) return;

  makeMove(index, currentPlayer);
  if (!gameActive || !vsCPU) return;

  setTimeout(() => {
    const cpuIndex = getRandomEmptyCell();
    if (cpuIndex !== -1) {
      makeMove(cpuIndex, 'O');
    }
  }, 500);
}
//verifica el resultado del juego
function makeMove(index, player) {
  if (gameState[index] !== "" || !gameActive) return;

  gameState[index] = player;
  cells[index].textContent = player;
  victoriaSound.volume = 0.2;
  victoriaSound.currentTime = 0;
  victoriaSound.play();
  cells[index].classList.add(player === 'X' ? 'text-blue-300' : 'text-red-400');

  if (checkWin(player)) {
    errorSound.volume = 0.2;
    errorSound.currentTime = 0;
    errorSound.play();
    const winnerName = player === 'X' ? player1 : player2;
    statusText.textContent = `¡${winnerName} (${player}) ganó!`;
    gameActive = false;
    restartBtn.classList.remove('hidden');
    changeModeBtn.classList.remove('hidden');
    updateRanking(`${winnerName} (${player})`);
  } else if (gameState.every(c => c !== "")) {
    errorSound.volume = 0.2;
    errorSound.currentTime = 0;
    errorSound.play();
    statusText.textContent = "Empate";
    gameActive = false;
    restartBtn.classList.remove('hidden');
    changeModeBtn.classList.remove('hidden');
  } else {
    currentPlayer = player === 'X' ? 'O' : 'X';
    statusText.textContent = `Turno de ${currentPlayer === 'X' ? player1 : player2}`;
  }
}
//le muestra las celdas vacias a la maquina para que elija entre cual marcar
function getRandomEmptyCell() {
  const emptyIndices = gameState
    .map((val, idx) => val === "" ? idx : null)
    .filter(idx => idx !== null);
  return emptyIndices.length > 0 ? emptyIndices[Math.floor(Math.random() * emptyIndices.length)] : -1;
}
//analiza si o quien ganó
function checkWin(player) {
  return WINNING_COMBINATIONS.some(combination =>
    combination.every(index => gameState[index] === player)
  );
}
//reinicia el juego
function startGame() {
  gameState = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = 'X';
  gameActive = true;
  statusText.textContent = `Turno de ${player1}`;
  restartBtn.classList.add('hidden');
  changeModeBtn.classList.remove('hidden');

  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove('text-blue-300', 'text-red-400');
  });
  audio.currentTime = 0;
  audio.play();
}
//añade al ranking el nombre del que ganó
function updateRanking(winner) {
  const li = document.createElement('li');
  li.textContent = `🏆 ${winner}`;
  rankingList.prepend(li);
}
//muestra o oculta el nombre del jugador2
function showPlayer2Input(show) {
  player2NameInput.classList.toggle('hidden', !show);
}
//valida los nombres de los jugadores y establece el modo de juego
function handleModeSelection(cpuMode) {
  const name1 = playerNameInput.value.trim();
  const name2 = player2NameInput.value.trim();

  if (name1 === "" || (!cpuMode && name2 === "")) {
    modalErrorMsg.classList.remove('hidden');
    return;
  }

  player1 = name1;
  player2 = cpuMode ? "La máquina" : name2;
  vsCPU = cpuMode;

  nameModal.classList.add('hidden');
  modalErrorMsg.classList.add('hidden');
  startGame();
}

// Eventos
vsPlayerBtn.addEventListener('click', () => {
  showPlayer2Input(true);
  handleModeSelection(false);
});

vsCpuBtn.addEventListener('click', () => {
  showPlayer2Input(false);
  handleModeSelection(true);
});

restartBtn.addEventListener('click', startGame);

changeModeBtn.addEventListener('click', () => {
  gameActive = false;
  nameModal.classList.remove('hidden');
  changeModeBtn.classList.add('hidden');
  restartBtn.classList.add('hidden');
  statusText.textContent = "";
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove('text-blue-300', 'text-red-400');
  });
});

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
//audio
const audio = document.getElementById('musica-fondo');
audio.volume = 0.1; // volumen al 30%
audio.loop = true;
audio.play();
//activa o desactiva el sonido de fondo
const botonMusica = document.getElementById('boton-musica');

  botonMusica.addEventListener('click', () => {
    audio.muted = !audio.muted;

    
    botonMusica.textContent = audio.muted ? ' Activar música' : ' Silenciar música';
  });