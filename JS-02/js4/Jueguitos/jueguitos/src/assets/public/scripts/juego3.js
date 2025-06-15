let mode = '';
let names = { player1: 'Jugador 1', player2: 'Jugador 2' };
let scores = { player1: 0, player2: 0 };
let playerTurn = 1;
let choicePlayer1 = '';

const modeButtons = document.querySelectorAll('.select-mode');
const moveButtons = document.querySelectorAll('.play-move');
const nameInput1 = document.getElementById('name1');
const nameInput2 = document.getElementById('name2');
const nameForm = document.getElementById('nameForm');
const errorMsg = document.getElementById('errorMsg');
const startBtn = document.getElementById('startBtn');
const changeModeBtn = document.getElementById('changeModeBtn');
const victoriaSound = new Audio('../multimedia/Victoria.mp3');
const errorSound = new Audio('../multimedia/Error.mp3');

//acciona la funcion selectMode
modeButtons.forEach(btn => {
  btn.addEventListener('click', () => selectMode(btn.dataset.mode));
});
//llama a la startGame para iniciar el juego
startBtn.addEventListener('click', () => startGame());
//llama a la funcion resetModal para reiniciar el juego
changeModeBtn.addEventListener('click', () => resetToModal());
//recibe el boton que se eligió(piedra, papel o tijera))
moveButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    victoriaSound.volume = 0.2;
    victoriaSound.currentTime = 0;
    victoriaSound.play();
    play(btn.dataset.move);
  });
});
//selecciona el modo de juego 
function selectMode(selected) {
  mode = selected;
  nameForm.classList.remove('hidden');
  nameInput1.classList.remove('hidden');
  nameInput2.classList.toggle('hidden', mode === 'machine');
  errorMsg.classList.add('hidden');
  nameInput1.value = '';
  nameInput2.value = '';
}
//Inicia el juego si los campos de los nombres estan llenos 
function startGame() {
  const n1 = nameInput1.value.trim();
  const n2 = nameInput2.value.trim();

  if (!n1 || (mode === 'player' && !n2)) {
    errorMsg.classList.remove('hidden');
    return;
  }

  names.player1 = n1;
  names.player2 = mode === 'player' ? n2 : 'Máquina';

  document.getElementById('modal').classList.add('hidden');
  document.getElementById('game').classList.remove('hidden');
  document.getElementById('currentMode').textContent = `Modo: ${mode === 'player' ? '1 vs 1' : 'vs Máquina'}`;
  updateRanking();
  updateTurn();
  audio.currentTime = 0;
  audio.play();
}
//Resetea todo el juego 
function resetToModal() {
  mode = '';
  playerTurn = 1;
  choicePlayer1 = '';
  scores = { player1: 0, player2: 0 };
  names = { player1: 'Jugador 1', player2: 'Jugador 2' };

  document.getElementById('game').classList.add('hidden');
  document.getElementById('modal').classList.remove('hidden');
  nameForm.classList.add('hidden');
  errorMsg.classList.add('hidden');
  document.getElementById('resultDisplay').textContent = '';
  document.getElementById('currentMode').textContent = '';
  document.getElementById('turnDisplay').textContent = '';
  updateRanking();
  audio.currentTime = 0;
  audio.play();
}
//Actualiza el ranking
function updateRanking() {
  document.getElementById('ranking').innerHTML = `
    <li>${names.player1}: ${scores.player1}</li>
    <li>${names.player2}: ${scores.player2}</li>
  `;
}
//muestra a quien le toca el turno
function updateTurn() {
  if (mode === 'player') {
    document.getElementById('turnDisplay').textContent = `Turno: ${playerTurn === 1 ? names.player1 : names.player2}`;
  } else {
    document.getElementById('turnDisplay').textContent = `${names.player1}, elegí tu jugada.`;
  }
}
//Ejecuta una jugada dependiendo del modo elegido
function play(choice) {
  if (mode === 'machine') {
    const options = ['rock', 'paper', 'scissors'];
    const machineChoice = options[Math.floor(Math.random() * 3)];
    const result = getResult(choice, machineChoice);
    showResult(choice, machineChoice, result);
  } else {
    if (playerTurn === 1) {
      choicePlayer1 = choice;
      playerTurn = 2;
      updateTurn();
    } else {
      const result = getResult(choicePlayer1, choice);
      showResult(choicePlayer1, choice, result);
      playerTurn = 1;
      updateTurn();
    }
  }
}
//Determina el resultado comparando que se eligió
function getResult(p1, p2) {
  if (p1 === p2) return 'draw';
  if (
    (p1 === 'rock' && p2 === 'scissors') ||
    (p1 === 'paper' && p2 === 'rock') ||
    (p1 === 'scissors' && p2 === 'paper')
  ) {
    scores.player1++;
    return 'win1';
  } else {
    scores.player2++;
    return 'win2';
  }
}
//muestra el resultado en pantalla
function showResult(p1, p2, result) {
  const translate = {
    rock: '🗿 Piedra',
    paper: '📄 Papel',
    scissors: '✂️ Tijera'
  };

  let text = `${names.player1} eligió ${translate[p1]} - ${names.player2} eligió ${translate[p2]} → `;
  if (result === 'draw') {
    errorSound.volume = 0.2;
    errorSound.currentTime = 0;
    errorSound.play();
    text += '¡Empate!';
  }
  else if (result === 'win1') text += `¡${names.player1} gana!`;
  else text += `¡${names.player2} gana!`;

  document.getElementById('resultDisplay').textContent = text;
  updateRanking();
}
//audio
const audio = document.getElementById('musica-fondo');
audio.volume = 0.1; // volumen al 30%
audio.loop = true;
audio.play();
//Activa o quita la musica
const botonMusica = document.getElementById('boton-musica');

  botonMusica.addEventListener('click', () => {
    audio.muted = !audio.muted;

    botonMusica.textContent = audio.muted ? ' Activar música' : ' Silenciar música';
  });