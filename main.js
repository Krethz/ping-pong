import { DrawBall } from './modules/drawBall.js'
import { DrawPaddle } from './modules/drawPaddle.js'
// import keyUpHandler from './helpers/keyUpHandler.js'
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.3/firebase-app.js"
import { getDatabase, ref, set, push, update, get, child, remove, onValue } from "https://www.gstatic.com/firebasejs/9.6.3/firebase-database.js"

// Set the configuration for your app
const firebaseConfig = {
    apiKey: "AIzaSyCJVo4bySTlfBncdwf8MOlDctSd5mOaw0w",
    authDomain: "pingpong-by-andreum.firebaseapp.com",
    databaseURL: "https://pingpong-by-andreum-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "pingpong-by-andreum",
    storageBucket: "pingpong-by-andreum.appspot.com",
    messagingSenderId: "728405365765",
    appId: "1:728405365765:web:52dac9eaa83cd3f701f86c",
    measurementId: "G-G3P4E222N6"
}

const firebase = initializeApp(firebaseConfig)
const db = getDatabase(firebase)

// Get a reference to the database service
const dbRef = ref(db)

const ballRadiusRef = ref(db, "/game/ball/ballRadius")
const ballXref = ref(db, "/game/ball/x")
const ballYref = ref(db, "/game/ball/y")

const player1LivesRef = ref(db, "/game/player1/lives")
const player1PaddleHeightRef = ref(db, "/game/player1/paddleHeight")
const player1PaddleWidthRef = ref(db, "/game/player1/paddleWidth")
const player1PaddleXref = ref(db, "/game/player1/paddleX")
const player1PaddleYref = ref(db, "/game/player1/paddleY")

const player2LivesRef = ref(db, "/game/player2/lives")
const player2PaddleHeightRef = ref(db, "/game/player2/paddleHeight")
const player2PaddleWidthRef = ref(db, "/game/player2/paddleWidth")
const player2PaddleXref = ref(db, "/game/player2/paddleX")
const player2PaddleYref = ref(db, "/game/player2/paddleY")

const chatRef = ref(db, "/game/chat")
////////////////////////


const canvas = document.getElementById('myCanvas')
const ctx = canvas.getContext('2d')

let modal = document.getElementById("myModal")
let pauseModal = document.getElementById("pauseModal")
let winnerText = document.getElementById("winnerText")
let livesPlayer1 = document.getElementById("livesPlayer1")
let livesPlayer2 = document.getElementById("livesPlayer2")


let gameTable = document.getElementById("gameTable")
let landing = document.getElementById("landing")
let chat = document.getElementById("chat")

const wallBounce = new Audio("./resources/bounce.wav")
const paddleBounce = new Audio("./resources/basketball.wav")
const winnerSound = new Audio("./resources/win_sound.wav")
const playingSound = new Audio("./resources/hammerhead-funk-loop.wav")
playingSound.loop = true
let ballImage = new Image()
ballImage.src = "./resources/ball.png"

let lives1 = 111
let lives2 = 111
let gameStatus = 1
let turn = 2

var upPressed = false
var downPressed = false
var wPressed = false
var sPressed = false
var pausePressed = false

///BALL SETTINGS
let x = canvas.width / 2
let y = canvas.height - 30
let ballRadius = 8
let ballColor = "red"

let dx = 2
let dy = -2

///PADDLE SETTINGS
let player1_paddleHeight = 60
let player1_paddleWidth = 10
let player1_paddleY = (canvas.height - player1_paddleHeight) / 2
let player1_paddleX = player1_paddleWidth
let player1_color = "black"

let player2_paddleHeight = 60
let player2_paddleWidth = 10
let player2_paddleY = (canvas.height - player2_paddleHeight) / 2
let player2_paddleX = (canvas.width - player2_paddleWidth)
let player2_color = "gray"

/// CHAT

const msgScreen = document.getElementById("messages") //the <ul> that displays all the <li> msgs
const msgForm = document.getElementById("messageForm") //the input form
const msgInput = document.getElementById("msg-input") //the input element to write messages
const msgBtn = document.getElementById("msg-btn") //the Send button

///////////

// playingSound.play()

let newGameButton = document.getElementById("newGameButton")
let viewGameButton = document.getElementById("viewGameButton")

newGameButton.onclick = () => {
    get(ref(db, "/game")).then((snapshot) => {

        if (!snapshot.exists()){
                    viewGameButton.style.display = "none"
                    gameTable.style.display = "block"
                    landing.style.display = "none"
                    draw()
        }
        else{
            modal.style.display = "block";
            modalText.innerHTML = "Game is already running, join to view!"
            newGameButton.style.display = "none"
        }
    })
}

viewGameButton.onclick= () => {
    get(ref(db, "/game")).then((snapshot) => {

        if (snapshot.exists()){
                    viewGameButton.style.display = "none"
                    gameTable.style.display = "block"
                    landing.style.display = "none"
                    chat.style.display = "block"
                    document.addEventListener('DOMContentLoaded', init());
                    drawStream()
        }
        else{
            modal.style.display = "block";
            modalText.innerHTML = "There is no game running, start a new one!"
        }
    })
}


///CHAT FUNCTIONS

let name="";
function init() {
  name = prompt("Please enter your name");
}

msgForm.addEventListener('submit', sendMessage);

function sendMessage(e){
    e.preventDefault();
    const timestamp = Date.now();
    const chatTxt = document.getElementById("msg-input")
    if(!chatTxt.value) return
    const message = chatTxt.value;
    chatTxt.value = ""
    set(ref(db,"game/chat/" + timestamp),{
        user: name,
        msg: message,
    });
}

const fetchChat = ref(db, "game/chat/");
onValue(fetchChat, (snapshot) => {
    const messages = snapshot.val();
    const length = Object.keys(messages).length-1
    const lastMessage = Object.keys(messages)[length]

    if(name === messages[lastMessage].user){
        const msg = "<li class='my-msg'>" + messages[lastMessage].msg + "</li>";
        document.getElementById("messages").innerHTML += msg;
    }else{
        const msg = "<li class='msg'> <i class = 'msg-name'>" + messages[lastMessage].user + ":</i> " + messages[lastMessage].msg + "</li>";
        document.getElementById("messages").innerHTML += msg;
    }

});


/////////////////////////////

function draw() {
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    var ball = new DrawBall(ctx, x, y, ballRadius, ballColor, ballImage)
    var player1_paddle = new DrawPaddle(ctx, canvas, 0, player1_paddleY, player1_paddleWidth, player1_paddleHeight, player1_color)
    var player2_paddle = new DrawPaddle(ctx, canvas, player2_paddleX, player2_paddleY, player2_paddleWidth, player2_paddleHeight, player2_color)

    update(ref(db, 'game/ball/'), {
        x: x,
        y: y,
        ballRadius: ballRadius,
        dx: dx,
        dy: dy
    })
    update(ref(db, 'game/player1/'), {
        lives: lives1,
        paddleY: player1_paddleY,
        paddleX: player1_paddleX,
        paddleHeight: player1_paddleHeight,
        paddleWidth: player1_paddleWidth

    })
    update(ref(db, 'game/player2/'), {
        lives: lives2,
        paddleY: player2_paddleY,
        paddleX: player2_paddleX,
        paddleHeight: player2_paddleHeight,
        paddleWidth: player2_paddleWidth
    })

    player1_paddle.printPaddle()
    player2_paddle.printPaddle()
    livesPlayer1.innerHTML = lives1
    livesPlayer2.innerHTML = lives2
    ball.printBall()
    //printInfo()

    if (lives1 > 0 && lives2 > 0) {
        if (y + dy > canvas.height - ballRadius || y + dy < ballRadius) {
            dy = -dy
            // wallBounce.play()
        } else if (x + dx > canvas.width - ballRadius) {  //(x + dx < ballRadius)
            if (y > player2_paddleY && y < player2_paddleY + player2_paddleHeight) {
                dx = -dx
                // paddleBounce.play()
            } else {
                lives2--
                wallBounce.play()
                if (lives2 != 0) dx = -dx
            }
        } else if (x + dx < ballRadius) {
            if (y > player1_paddleY && y < player1_paddleY + player1_paddleHeight) {
                dx = -dx
                // paddleBounce.play()
            } else {
                lives1--
                // wallBounce.play()
                if (lives1 != 0) dx = -dx
            }
        }
    } else {
        if (lives1 <= 0) {
            gameStatus = 0
            modal.style.display = "block";
            modalText.innerHTML = "PLAYER 2 WINS!"
            remove(dbRef, "/game")
            // playingSound.pause()
            // winnerSound.play()
        } else if (lives2 <= 0) {
            modal.style.display = "block";
            modalText.innerHTML = "PLAYER 1 WINS!"
            // playingSound.pause()
            // winnerSound.play()
            remove(dbRef, "/game")
            gameStatus = 0
        }
    }

    if (downPressed && player2_paddleY < canvas.height - player2_paddleHeight) {
        player2_paddleY += 5
    }
    else if (upPressed && player2_paddleY > 0) {
        player2_paddleY -= 5
    }

    if (sPressed && player1_paddleY < canvas.height - player1_paddleHeight) {
        player1_paddleY += 5
    }
    else if (wPressed && player1_paddleY > 0) {
        player1_paddleY -= 5
    }

    x += dx
    y += dy

    if (gameStatus) requestAnimationFrame(draw)
}


function drawStream() {
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    onValue(ballXref, (snapshot) => {
        x = snapshot.val()
    })
    
    onValue(ballYref, (snapshot) => {
        y = snapshot.val()
    })

    onValue(ballRadiusRef, (snapshot) => {
        ballRadius = snapshot.val()
    })

    let ball = new DrawBall(ctx, x, y, ballRadius, ballColor, ballImage)
    ball.printBall()


    onValue(player1LivesRef, (snapshot) => {
        livesPlayer1.innerHTML = snapshot.val()
    })

    onValue(player1PaddleHeightRef, (snapshot) => {
        player1_paddleHeight = snapshot.val()
    })

    onValue(player1PaddleWidthRef, (snapshot) => {
        player1_paddleWidth = snapshot.val()
    })

    onValue(player1PaddleXref, (snapshot) => {
        player1_paddleX = snapshot.val()
    })

    onValue(player1PaddleYref, (snapshot) => {
        player1_paddleY = snapshot.val()
    })

    let player1_paddle = new DrawPaddle(ctx, canvas, player1_paddleX-player1_paddleWidth, player1_paddleY, player1_paddleWidth, player1_paddleHeight, player1_color)
    player1_paddle.printPaddle()



    onValue(player2LivesRef, (snapshot) => {
        livesPlayer2.innerHTML = snapshot.val()
    })

    onValue(player2PaddleHeightRef, (snapshot) => {
        player2_paddleHeight = snapshot.val()
    })

    onValue(player2PaddleWidthRef, (snapshot) => {
        player2_paddleWidth = snapshot.val()
    })

    onValue(player2PaddleXref, (snapshot) => {
        player2_paddleX = snapshot.val()
    })

    onValue(player2PaddleYref, (snapshot) => {
        player2_paddleY = snapshot.val()
    })
    
    let player2_paddle = new DrawPaddle(ctx, canvas, player2_paddleX, player2_paddleY, player2_paddleWidth, player2_paddleHeight, player2_color)
    player2_paddle.printPaddle()

    requestAnimationFrame(drawStream)
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyUpHandler({ keyCode }) {

    switch (keyCode) {
        case 38: upPressed = false; break
        case 40: downPressed = false; break
        case 87: wPressed = false; break
        case 83: sPressed = false; break
    }
}

function keyDownHandler({ keyCode }) {

    switch (keyCode) {
        case 38: upPressed = true; break
        case 40: downPressed = true; break
        case 87: wPressed = true; break
        case 83: sPressed = true; break
        case 116: remove(dbRef, "/game"); break
        case 80: {
            if (gameStatus) {
                pauseModal.style.display = "block";
                pausePressed = true
                gameStatus = 0
                pauseModalText.innerHTML = "Game is paused"
            } else {
                pauseModal.style.display = "none";
                pausePressed = false
                gameStatus = 1
                draw()
            }
        }; break
    }
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        document.location.reload()
        modal.style.display = "none";
    }

    if (event.target == pauseModal) {
        pauseModal.style.display = "none";
        gameStatus = 1;
        draw()
    }
}

