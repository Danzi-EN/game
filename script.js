const board = document.getElementById('board');
const movesEl = document.getElementById('moves');
const matchedEl = document.getElementById('matched');
const timerEl = document.getElementById('timer');
const messageEl = document.getElementById('message');
const resetButton = document.getElementById('resetButton');

const symbols = ['🐳', '🌙', '🍀', '🍩', '🐣', '🌋', '🎧', '🚀'];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matchedPairs = 0;
let startTime = null;
let timerId = null;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function startTimer() {
  if (timerId) return;
  startTime = Date.now();
  timerId = setInterval(() => {
    const now = Date.now();
    timerEl.textContent = formatTime(now - startTime);
  }, 1000);
}

function stopTimer() {
  if (!timerId) return;
  clearInterval(timerId);
  timerId = null;
}

function resetStats() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  moves = 0;
  matchedPairs = 0;
  movesEl.textContent = `${moves} 회`;
  matchedEl.textContent = `${matchedPairs} / ${symbols.length} 쌍`;
  messageEl.textContent = '';
  stopTimer();
  startTime = null;
  timerEl.textContent = '00:00';
}

function createCard(symbol) {
  const card = document.createElement('article');
  card.className = 'card';
  card.setAttribute('data-symbol', symbol);
  card.innerHTML = `
    <div class="card-inner" tabindex="0" role="button" aria-label="카드 뒤집기">
      <div class="card-face card-back">?</div>
      <div class="card-face card-front">${symbol}</div>
    </div>
  `;

  card.addEventListener('click', () => flipCard(card));
  card.querySelector('.card-inner').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      flipCard(card);
    }
  });

  return card;
}

function buildBoard() {
  const deck = shuffle([...symbols, ...symbols]);
  board.innerHTML = '';
  deck.forEach((symbol) => board.appendChild(createCard(symbol)));
}

function handleMatch() {
  firstCard.classList.add('matched');
  secondCard.classList.add('matched');
  matchedPairs += 1;
  matchedEl.textContent = `${matchedPairs} / ${symbols.length} 쌍`;
  resetTurn();

  if (matchedPairs === symbols.length) {
    stopTimer();
    const spent = startTime ? formatTime(Date.now() - startTime) : '00:00';
    messageEl.textContent = `완벽해요! ${moves}번 만에 ${spent} 걸렸어요.`;
  }
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

function unflipCards() {
  lockBoard = true;
  setTimeout(() => {
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    resetTurn();
  }, 800);
}

function flipCard(card) {
  if (lockBoard) return;
  if (card === firstCard) return;
  if (card.classList.contains('matched')) return;

  startTimer();
  card.classList.add('flipped');

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  moves += 1;
  movesEl.textContent = `${moves} 회`;

  const isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;
  if (isMatch) {
    handleMatch();
  } else {
    unflipCards();
  }
}

function resetGame() {
  resetStats();
  buildBoard();
}

resetButton.addEventListener('click', resetGame);

resetGame();
