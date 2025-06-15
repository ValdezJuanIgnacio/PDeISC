const green = document.getElementById('green');
const red = document.getElementById('red');
const yellow = document.getElementById('yellow');
const blue = document.getElementById('blue');
const startBtn = document.getElementById('startBtn');
const statusText = document.getElementById('status');
const rankingList = document.getElementById('rankingList');
const victoriaSound = new Audio('../multimedia/Victoria.mp3');
const errorSound = new Audio('../multimedia/Error.mp3');

const buttons = [green, red, yellow, blue];
const colors = ['green', 'red', 'yellow', 'blue'];

let sequence = [];
let playerSequence = [];
let level = 0;
let waitingForInput = false;
let playerName = null;
let ranking = [];

const nameModal = document.getElementById('nameModal');
const playerNameInput = document.getElementById('playerNameInput');
const confirmNameBtn = document.getElementById('confirmNameBtn');
const modalErrorMsg = document.getElementById('modalErrorMsg');
const errorName = document.getElementById('errorName');
//ilumina los botones
function lightUp(color) {
    const btn = buttons[colors.indexOf(color)];
    btn.classList.add('brightness-150', 'shadow-[0_0_12px_4px_rgba(255,255,255,0.5)]');
    setTimeout(() => btn.classList.remove('brightness-150', 'shadow-[0_0_12px_4px_rgba(255,255,255,0.5)]'), 600);
}
//Acciona la secuencia de los colores del juego
function playSequence() {
    waitingForInput = false;
    let i = 0;
    const interval = setInterval(() => {
        lightUp(sequence[i]);
        i++;
        if (i >= sequence.length) {
            clearInterval(interval);
            waitingForInput = true;
            statusText.textContent = `Turno de ${playerName}: nivel ${level}`;
            playerSequence = [];
        }
    }, 800);
}
//Funcion para cuando el jugador toca un boton
buttons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
        if (!waitingForInput) return;

        lightUp(colors[idx]);
        playerSequence.push(colors[idx]);
        //Si le erra
        const currentStep = playerSequence.length - 1;
        if (playerSequence[currentStep] !== sequence[currentStep]) {
            errorSound.volume = 0.2;
            errorSound.currentTime = 0;
            errorSound.play();
            statusText.textContent = `¡Fallaste! Juego terminado en nivel ${level}.`;
            waitingForInput = false;
            startBtn.disabled = false;
            addToRanking(playerName, level);
            renderRanking();
            return;
        }
        //Si toca el que va
        if (playerSequence.length === sequence.length) {
            statusText.textContent = `¡Correcto! Preparando siguiente nivel...`;
            waitingForInput = false;
            setTimeout(nextLevel, 1000);
        }
    });
});
//Hace comenzar el juego
function startGame(name) {
    playerName = name;
    sequence = [];
    level = 0;
    startBtn.disabled = true;
    statusText.textContent = `Comenzando juego para ${playerName}...`;
    nextLevel();
    audio.currentTime = 0;
    audio.play();
}
//Avanza al siguiente nivel
function nextLevel() {
    level++;
    victoriaSound.volume = 0.2;
    victoriaSound.currentTime = 0; // Reinicia el audio por si está en reproducción
    victoriaSound.play();
    statusText.textContent = `Nivel ${level}`;
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    sequence.push(randomColor);
    playSequence();
}
//agrega el nombre del jugador al ranking
function addToRanking(name, lvl) {
    ranking.push({ name, level: lvl });
    ranking.sort((a, b) => b.level - a.level);
}
//Muestra el ranking en pantalla
function renderRanking() {
    rankingList.innerHTML = '';
    ranking.forEach(({ name, level }) => {
        const li = document.createElement('li');
        li.textContent = `${name} - Nivel ${level}`;
        li.className = "border-b border-gray-700 py-1";
        rankingList.appendChild(li);
    });
}
//Muestra el modal para mostrar el nombre
startBtn.addEventListener('click', () => {
    modalErrorMsg.classList.add('hidden');
    playerNameInput.value = '';
    nameModal.classList.remove('hidden');
    playerNameInput.focus();
});
//chequea el nombre ingresado
confirmNameBtn.addEventListener('click', () => {
    const name = playerNameInput.value.trim();
    if (!name) {
        modalErrorMsg.classList.remove('hidden');
        playerNameInput.focus();
        return;
    }
    modalErrorMsg.classList.add('hidden');
    nameModal.classList.add('hidden');
    startGame(name);
});
//envia el nombre ingresado
playerNameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') confirmNameBtn.click();
});
//audio
const audio = document.getElementById('musica-fondo');
audio.volume = 0.1; 
audio.loop = true;
audio.play();
//Activa o desactiva la musica
const botonMusica = document.getElementById('boton-musica');

  botonMusica.addEventListener('click', () => {
    audio.muted = !audio.muted;

    botonMusica.textContent = audio.muted ? ' Activar música' : ' Silenciar música';
  });
