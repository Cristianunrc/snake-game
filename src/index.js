// Global variables
const gameBoard = document.querySelector('#gameBoard')
const ctx = gameBoard.getContext('2d')
const scoreText = document.querySelector('#scoreText')

const apple = new Image()
const banana = new Image()
const orange = new Image()
const pear = new Image()

apple.src = './img/apple.png'
banana.src = './img/banana.png'
orange.src = './img/orange.png'
pear.src = './img/pear.png'

const resetBtn = document.querySelector('#resetBtn')
const playBtn = document.querySelector('#playBtn')
const pauseBtn = document.querySelector('#pauseBtn')

const gameWidth = gameBoard.width
const gameHeight = gameBoard.height
const unitSize = 25

let running = false
let isPaused = false
let incPause = 0

let xVelocity = unitSize
let yVelocity = 0
let foodX, foodY, randomFruit
let score = 0
let snake = [
  {x : unitSize * 4, y : 0},
  {x : unitSize * 3, y : 0},
  {x : unitSize * 2, y : 0},
  {x : unitSize, y : 0},
  {x : 0, y : 0}
]

resetBtn.disabled = true
pauseBtn.disabled = true

window.addEventListener('keydown', changeDirection)
resetBtn.addEventListener('click', resetGame)
playBtn.addEventListener('click', gameStart)
pauseBtn.addEventListener('click', pauseGame)

// Start the game
function gameStart() {
  runningPause(true, false)
  pauseBtn.disabled = false
  playBtn.disabled = true
  scoreText.textContent = score
  if (incPause < 1) {
    createFood()
    drawFood()
  }
  startSound()
  nextTick()
}

// Check if game is running, paused or game over
function nextTick() {
  if (running) {
    setTimeout(() => {
      clearBoard()
      drawFood()
      moveSnake()
      drawSnake()
      checkGameOver()
      nextTick()
    }, 120)
  } else if (isPaused){
    displayPause()
  } else {
    displayGameOver()
  }
}

// Clean board
function clearBoard() {
  ctx.clearRect(0, 0, gameWidth, gameHeight)
}

// Create a random position (x, y) on board for draw the food
function createFood() {
  // The fruit not create in some position occupied by the snake
  do {
    foodX = randomFood(0, gameWidth - unitSize)
    foodY = randomFood(0, gameHeight - unitSize)
  } while (snake.some(snakePart => snakePart.x === foodX && snakePart.y == foodY))
  
  getRandomFruit()
}

// Create a random value with restrictions
function randomFood(min, max) {
  const randNum = Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize
  return randNum
}

// Return a random fruit
function getRandomFruit() {
  const fruits = [apple, banana, orange, pear]
  const randomIndex = Math.floor(Math.random() * fruits.length)
  randomFruit = fruits[randomIndex]
}

// Draw food on board in created position
function drawFood() {
  ctx.drawImage(randomFruit, foodX, foodY, 30, 30)
}

// Snake movements
function moveSnake() {
  const head = {x: snake[0].x + xVelocity,
                y: snake[0].y + yVelocity}
                
  snake.unshift(head)

  if (snake[0].x == foodX && snake[0].y == foodY) { // if snake eat food
    score += 1
    scoreText.textContent = score
    eatSound()
    createFood()
  } else if (snake[0].x < 0 || 
             snake[0].x >= gameWidth || 
             snake[0].y < 0 || 
             snake[0].y >= gameHeight) { // if snake hit limits
    running = false
  } else {
    snake.pop()
  }
}

// Draw snake on board
function drawSnake() {
  ctx.strokeStyle = 'black'
  
  snake.forEach((snakePart, index) => {
    ctx.fillStyle = index === 0 ? 'yellow': 'green'
    ctx.fillRect(snakePart.x, snakePart.y, unitSize, unitSize)
    ctx.strokeRect(snakePart.x, snakePart.y, unitSize, unitSize)
  })
}

// Change direction of snake with keys board
function changeDirection(event) {
  const keyPressed = event.keyCode // obtain the code of key pressed
  const LEFT = 37
  const UP = 38
  const RIGHT = 39
  const DOWN = 40

  const goingUp = (yVelocity == -unitSize)
  const goingDown = (yVelocity == unitSize)
  const goingRight = (xVelocity == unitSize)
  const goingLeft = (xVelocity == -unitSize)

  switch(true) {
    // Go left
    case(keyPressed == LEFT && !goingRight):
      xVelocity = -unitSize
      yVelocity = 0
      break
    // Go right
    case(keyPressed == RIGHT && !goingLeft):
      xVelocity = unitSize
      yVelocity = 0
      break
    // Go down
    case(keyPressed == DOWN && !goingUp):
      xVelocity = 0
      yVelocity = unitSize
      break
    // Go up
    case(keyPressed == UP && !goingDown):
      xVelocity = 0
      yVelocity = -unitSize
      break
  }
}

// Check if snake hit hymself
function checkGameOver() {
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x == snake[0].x && snake[i].y == snake[0].y) {
      running = false
      break
    }
  }
}

// Display a game over
function displayGameOver() {
  const head = snake[1]
  ctx.fillStyle = 'yellow'
  ctx.strokeStyle = 'black'
  ctx.fillRect(head.x, head.y, unitSize, unitSize)
  ctx.strokeRect(head.x, head.y, unitSize, unitSize)

  ctx.font = '50px MV Boli'
  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'
  ctx.fillText('GAME OVER!', gameWidth / 2, gameHeight / 2)
  loseSound()
  disabledButton(true, true, false)
}

// Dsiplay a game pause
function displayPause() {
  ctx.font = '50px MV Boli'
  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'
  ctx.fillText('PAUSE!', gameWidth / 2, gameHeight / 2) 
}

// Reset game and initialize per default the game
function resetGame() {
  score = 0
  incPause = 0
  xVelocity = unitSize
  yVelocity = 0
  snake = [
    {x : unitSize * 4, y : 0},
    {x : unitSize * 3, y : 0},
    {x : unitSize * 2, y : 0},
    {x : unitSize, y : 0},
    {x : 0, y : 0}
  ]
  disabledButton(false, false, true)
  gameStart()
}

// Put the game in pause
function pauseGame() {
  runningPause(false, true)
  incPause += 1
  playBtn.disabled = false
  pauseSound()
}

// Disabled and enabled buttons
function disabledButton(play, pause, reset) {
  playBtn.disabled = play
  pauseBtn.disabled = pause
  resetBtn.disabled = reset
}

// Play sound if snake is eating
function eatSound() {
  const eatSound = document.getElementById('eatSound')
  eatSound.currentTime = 0
  eatSound.play()
}

// Game over sound
function loseSound() {
  const loseSound = document.getElementById('loseSound')
  loseSound.play()
}

// Start and reset game sound
function startSound() {
  const playSound = document.getElementById('playSound')
  playSound.play()
}

// Pause game sound 
function pauseSound() {
  const pauseSound = document.getElementById('pauseSound')
  pauseSound.play()
}

// Put running and isPaused in some mode
function runningPause(run, pause) {
  running = run
  isPaused = pause
}