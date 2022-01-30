const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameFrame = 0;
let gameSpeed = 1;
let staggerFrames = 5;
gameOver = false;
dragging = false;
var friction = 1;
var tile_size = 16;
var map_columns = 16;
var map_scale = 1;
var floor = canvas.height - canvas.height/25

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

// Player 
/*
const playerLeft = new Image();
playerLeft.src = 'Images/monkey4.png';
const playerRight = new Image();
playerRight.src = 'Images/monkey3.png';
*/

const spriteSheet = new Image();
spriteSheet.src = 'Images/MonkeySpriteSheetRed.png';
const gravity = 1.5;

class Player {
    constructor(){
        this.position = {
            x: 0,
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
        //this.behavior = behavior;
        this.jumping = true;
        this.jumpingHeight = -35;
        this.speed = 0.01;
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
            if(this.frameY == 3){ this.frameY = 2;}
            c.drawImage(spriteSheet, this.spriteWidth * this.frameX, this.spriteHeight * (this.frameY+1),
                this.spriteWidth, this.spriteHeight, this.position.x-35, 
                this.position.y - 54, this.radius*3, this.radius*3.5);
        }
    }
    update(players, currentIndex){
        this.draw();

        //loops through frames of sprite sheet
        console.log(this.jumpingHeight, this.velocity.y);
        if(this.velocity.y < 0 && this.jumping){ 
            this.frameY = 3;
        }else if(this.velocity.y > 0){
            this.frameY = 0;
        }else{
            this.frameY = 1;
        }
            if(this.frame % staggerFrames == 0 ){
                if(this.frameX > 0){ 
                    this.frameX--; 
                } else { 
                    this.frameX = 3; 
                }
            }
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
            //this.jumping = false;
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


    }
}
const player1 = new Player();
const player2 = new Player();
const player3 = new Player();
const players = [player1,player2, player3];
player2.setPositionX(canvas.width);
player2.setSpeed(0.08);
player2.setJumpingHeight(-14);
player3.setSpeed(0.012);
player3.setJumpingHeight(-15);


// Banana
const bananaPic = new Image();
bananaPic.src = 'Images/banana4.png';
const aura = new Image();
aura.src = 'Images/aura.png';

class Banana {
    constructor() {
        this.position = {
            x: canvas.width/2,
            y: canvas.height/2
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
        c.drawImage(aura, this.position.x - 75, this.position.y - 70, this.radius*10, this.radius*10);
        c.drawImage(bananaPic, this.position.x - 14, this.position.y - 15, this.radius*2, this.radius*2);
    }
    update(){
        this.draw();
        const dx = this.position.x - mouse.x
        const dy = this.position.y - mouse.y
        let distance = Math.sqrt(dx*dx + dy*dy);
        if(distance < this.radius+200 && mouse.click){
            this.position.x = mouse.x;
            this.position.y = mouse.y;
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

function animate(){
    requestAnimationFrame(animate);
    c.clearRect(0,0, canvas.width, canvas.height);
    handleBackground();

    players.forEach((player) => {
        currentIndex = players.indexOf(player);
        player.update(players, currentIndex);
    })
    //console.log(player1.jumping, player1.onHitbox);
    banana.update();
    //console.log(player1.velocity.y);
    gameFrame++;
}

animate();

window.addEventListener('resize', function(){
    canvasPosition = canvas.getBoundingClientRect();
});
