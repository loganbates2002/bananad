let gameloop = new GameLoop();

const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

gameloop.canvas = canvas;
gameloop.c = c;
gameloop.canvas.width = canvas.width;
gameloop.canvas.height = canvas.height;
//console.log(gameloop);


let gameFrame = 0;
let gameSpeed = 1;
let staggerFrames = 10;
gameOver = false;
dragging = false;
var friction = 1;
var tile_size = 16;
var map_columns = 16;
var map_scale = 1;
var floor = gameloop.canvas.height - gameloop.canvas.height/25 
var finishStart = false;
var monkeys = [];
var monkeyTimer = 10;
var interval = 5000
var finalCircleX = 0;
var finalCircleY = 0;

// Mouse Interactivity
let canvasPosition = canvas.getBoundingClientRect();
const mouse = {
    x: canvas.width/2,
    y: canvas.height/2,
    click: false
}
canvas.addEventListener("mousemove", function(event) { 
    mouse.x = event.x - canvasPosition.left;
    mouse.y = event.y - canvasPosition.top;
});
canvas.addEventListener('mousedown', function(event){
    mouse.click = true;
    mouse.x = event.x - canvasPosition.left;
    mouse.y = event.y - canvasPosition.top;
});
canvas.addEventListener('mouseup', function(){
    mouse.click = false;
    dragging = false;
})
function between(x, min, max) {
    return x >= min && x <= max;
  }
function toggleScreen(id,toggle) {
    let element = document.getElementById(id);
    let display = ( toggle ) ? 'block' : 'none';
    element.style.display = display;
}



// Player 
const spriteSheet = new Image();
spriteSheet.src = 'Images/MonkeySpriteSheetRed.png';
const gravity = 1.5;

class Player {
    constructor(speed, jumpingHeight, positionX){
        this.position = {
            x: positionX,
            y: canvas.height
        };
        this.velocity = {
            x: 0,
            y: 1
        };
        this.radius = 30;
        this.angle = 0;
        this.frameX = 3;
        this.frameY = 1;
        this.frame = 0;
        this.spriteWidth = 49;
        this.spriteHeight = 52;
        this.jumping = true;
        this.jumpingHeight = jumpingHeight;
        this.speed = speed;
        this.hitboxHeight = 30;
        this.hitboxWidth = 35;
        this.hitboxPositionX = this.position.x;
        this.hitboxPositionY = this.position.y;
        this.onHitbox = false;
    }
    setPositionX(x){
        this.position.x = x;
    }
    setJumpingHeight(x){
        this.jumpingHeight = x;
    }
    setSpeed(x){
        this.speed = x;
    }

    draw(){
        /* draw hitbox
        c.fillStyle = 'blue';
        c.fillRect(this.hitboxPositionX, this.hitboxPositionY, this.hitboxWidth, this.hitboxHeight); */

        if( this.position.x >= banana.position.x){
            c.drawImage(spriteSheet, this.spriteWidth * this.frameX, this.spriteHeight * this.frameY,
                this.spriteWidth, this.spriteHeight, this.position.x-35, 
                this.position.y - 61, this.radius*3, this.radius*3.5);
        } else {
            if(this.frameY == 1){ this.frameY = 2;}
            c.drawImage(spriteSheet, this.spriteWidth * this.frameX, this.spriteHeight * this.frameY,
                this.spriteWidth, this.spriteHeight, this.position.x-35, 
                this.position.y - 54, this.radius*3, this.radius*3.5);
        }
    }
    spriteSheetAnimation(){
        if(this.velocity.y < 0){ 
            this.frameY = 3;
        }else if(this.velocity.y > 0){
            this.frameY = 0;
        }else{
            this.frameY = 1;
        }
        var xVelocityInt = parseInt(this.velocity.x, 10)
        //console.log(xVelocityInt)
        if(this.frame % (staggerFrames / Math.abs(xVelocityInt)) == 0 ){
            if(this.frameX > 0){ 
                this.frameX--; 
            } else { 
                this.frameX = 3; 
            }
        }
    }
    update(players, currentIndex){
        this.spriteSheetAnimation();
        this.draw();

        //loops through frames of sprite sheet
        //console.log(this.jumpingHeight, this.velocity.y);
        this.frame ++;
        

        const dx = this.position.x - mouse.x;
        const dy = this.position.y - mouse.y;
        let theta = Math.atan2(dy, dx);
        this.angle = theta;
        var bananaPositionXCorrection = banana.position.x - 8.1
        var holdY = 0;

        //Player collision detection
        players.forEach((monkey) => {
            if(players.indexOf(monkey) != currentIndex){
                if((!monkey.jumping) || this.onHitbox == false){  
                    if(this.hitboxPositionY + this.hitboxHeight <= monkey.hitboxPositionY 
                        && this.hitboxPositionY + this.hitboxHeight + this.velocity.y >= monkey.hitboxPositionY
                        && this.hitboxPositionX + this.hitboxWidth >= monkey.hitboxPositionX
                        && this.hitboxPositionX <= monkey.hitboxPositionX + monkey.hitboxWidth){
                            this.velocity.y = 0;
                            this.velocity.x = 0;
                            this.jumping = false;
                            this.onHitbox = true;
                            holdY = this.position.y;
                            //console.log("hit");
                    } else {
                        this.onHitbox = false;
                    }
                } else {
                    this.onHitbox = false;
                }
            }
        })

        if(this.position.y + (this.spriteHeight-20) + this.velocity.y <= canvas.height ){
            this.velocity.y += gravity/2;
            //this.jumping = false;
        } else {
            this.velocity.y = 0;
            //this.jumping = false;
        }

        // jump when directly under banana
        if (!this.jumping && this.position.y > banana.position.y &&
             (between(bananaPositionXCorrection - this.position.x, -3, 3)
             || between(this.position.x - bananaPositionXCorrection , -3, 3))) {
            this.jumping = true;
            this.velocity.y =  this.jumpingHeight;
        }
        if (this.jumping){ this.velocity.x = (banana.position.x - this.position.x - tile_size * 2) * 0.05; 
        }else{ 
            this.velocity.x = (banana.position.x - this.position.x /*- tile_size * .5*/) * this.speed; 
        }
    
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.velocity.y *= friction;
    
        if (this.position.y > floor) { this.position.y = floor; this.jumping = false; }
        if (this.velocity.y == 0) { this.jumping = false; }
        
        if(this.onHitbox){
            this.position.y = holdY;
            this.jumping = false;
        }
        this.hitboxPositionX = this.position.x;
        this.hitboxPositionY = this.position.y;

        const bananaMonkeyDx = banana.position.x - this.position.x
        const bananaMonkeyDy = banana.position.y - this.position.y
        let BMDistance = Math.sqrt(bananaMonkeyDx*bananaMonkeyDx + bananaMonkeyDy*bananaMonkeyDy);
        if(BMDistance < banana.radius+30){
            finalCircleX = banana.position.x
            finalCircleY = banana.position.y
            cancelAnimationFrame(animationId)
            closeScreen();
        }

    }
}

const players = [];



// Banana
const bananaPic = new Image();
bananaPic.src = 'Images/banana4.png';
const aura = new Image();
aura.src = 'Images/aura.png';

class Banana {
    constructor() {
        this.position = {
            x: canvas.width/2.043,
            y: canvas.height/2.39
        };
        this.velocity = {
            x: 0,
            y: 0
        };
        this.radius = 15;
        this.angle = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.frame = 0;
        this.spriteWidth = 27;
        this.spriteHeight = 31;
    }
    draw(){
        c.drawImage(aura, this.position.x -57, this.position.y - 50, this.radius*10, this.radius*10);
        c.drawImage(bananaPic, this.position.x , this.position.y , this.radius*2, this.radius*2);
    }
    update(){
        this.draw();
        const dx = this.position.x - mouse.x
        const dy = this.position.y - mouse.y
        let distance = Math.sqrt(dx*dx + dy*dy);
        if(distance < this.radius+100 && mouse.click){
            this.position.x = mouse.x - 10;
            this.position.y = mouse.y - 10;
        }
    }
}
const banana = new Banana();

// Background
const backgroundTrees = new Image();
backgroundTrees.src = 'Images/treebackground.png';

function handleBackground(){
    c.drawImage(backgroundTrees, 0, 0, canvas.width, canvas.height);
    c.drawImage(backgroundTrees, 0, 0, canvas.width, canvas.height);
}

var step = 10000
function addPlayers(players){
    setTimeout(function() {
        const speed = Math.random() * (0.05 - 0.012) + 0.012;
        const jumpingHeight = -(Math.random() * (25 - 10) + 10);
        const positionX = (Math.round(Math.random())) * canvas.width;
        players.push( new Player(speed, jumpingHeight, positionX));
        if(step-100 > 50){
            step -= 1300;
        } else {
            step = 50
        }
        console.log(step);
        addPlayers(players);
    }, step )
}

let animationId
function animate(){
    animationId = requestAnimationFrame(animate);
    gameloop.c.clearRect(0,0, canvas.width, canvas.height);
    handleBackground();

//loops through players array and updates each monkey every frame
    players.forEach((player) => {
        currentIndex = players.indexOf(player);
        player.update(players, currentIndex);
    })


    banana.update();
    gameFrame++;
    //console.log(gameFrame);
}

function drawCenterCircle(newLineWidth){
    c.lineWidth = newLineWidth;
    c.strokeStyle = 'white';
    c.stroke();
    c.arc(canvas.width/2.015, canvas.height/2.28, 1000, 0, 2*Math.PI, true);
    c.stroke();
}

function drawCircle(newRadius, finx, finy){
    c.lineWidth = 100;
    c.strokeStyle = 'white';
    c.stroke();
    c.arc(finx, finy, newRadius, 0, 2*Math.PI, true);
    c.stroke();
}

function openScreen(){
    newLineWidth = 2000;
    if(newLineWidth - (gameFrame*2) > 10){
        c.clearRect(0,0, canvas.width, canvas.height);
        handleBackground();
        newLineWidth = newLineWidth - (gameFrame*2);
        drawCenterCircle(newLineWidth);
        banana.update();
        //console.log(newLineWidth);
        gameFrame += 1;
        gameFrame *= 1.08;
        requestAnimationFrame(openScreen);
    } else {
        newLineWidth = 10;
        gameFrame = 1;
    }
    newLineWidth = 10;
}
var closeRadius = 1500;
var closeMultiplier = 1;
function closeScreen(){
   // drawCircle(closeRadius, finalCircleX+15, finalCircleY+20);
    if(closeRadius > 10){
        if((closeRadius - closeMultiplier) > 0){
            closeRadius = closeRadius - closeMultiplier;
        } else {
            closeRadius = 5
        }
        drawCircle(closeRadius, finalCircleX+15, finalCircleY+20);
        console.log(finalCircleX, finalCircleY);
        closeMultiplier += .2;
        requestAnimationFrame(closeScreen);
    } else {
        c.clearRect(0,0, canvas.width, canvas.height);
        banana.update();
        const speedFin = 0.03;
        const jumpingHeightFin = canvas.height - banana.position.y;
        const positionXFin = 0;
        const finalMonkey = new Player(speedFin, jumpingHeightFin, positionXFin);
        while(players.length) {
            players.pop();
        }
        players.push(finalMonkey);
        console.log(players);
        endGame(finalMonkey);
    }

}

function endGame(){
    c.clearRect(0,0, canvas.width, canvas.height);
    players.forEach((player) => {
        currentIndex = players.indexOf(player);
        player.update(players, currentIndex);
    })
    banana.update();
    location.reload();
    requestAnimationFrame(endGame);
    
}

function startGame(){
    // removes title
    var el = document.getElementById('textBox');
    el.remove();
    if(gameFrame == 0){
        openScreen();
        gameloop.start();
    }

    //console.log(gameFrame);
    //console.log(newLineWidth);
    const speed1 = Math.random() * (0.05 - 0.012) + 0.012;
    const jumpingHeight1 = -(Math.random() * (25 - 10) + 10);
    const positionX1 = (Math.round(Math.random())) * canvas.width;
    players.push( new Player(speed1, jumpingHeight1, positionX1));

    setTimeout(function(){
        animate();
        addPlayers(players);
    }, 2000);
}

window.addEventListener('resize', function(){
    canvasPosition = canvas.getBoundingClientRect();
});
