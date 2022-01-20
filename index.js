const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameFrame = 0;
let gameSpeed = 1;
gameOver = false;
dragging = false;
var friction = 1;
var tile_size = 16;
var map_columns = 16;
var map_scale = 1;
var pointer = { x:map_columns * tile_size * 0.5, y:0, down:false };
var floor = canvas.height - canvas.height/23

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
canvas.addEventListener("click", (event) => {

    var rectangle = event.target.getBoundingClientRect();

    pointer.x = (event.pageX - rectangle.left) / map_scale;
    pointer.y = (event.pageY - rectangle.top) / map_scale;
    pointer.down = true;

});

function between(x, min, max) {
    return x >= min && x <= max;
  }

// Player 
const playerLeft = new Image();
playerLeft.src = 'Images/monkey4.png';
const playerRight = new Image();
playerRight.src = 'Images/monkey3.png';

const gravity = 1.5;

class Player {
    constructor(){
        this.position = {
            x: 100,
            y: 100
        };
        this.velocity = {
            x: 0,
            y: 1
        };
        this.radius = 30;
        this.angle = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.frame = 0;
        this.spriteWidth = 27;
        this.spriteHeight = 31;
        //this.behavior = behavior;
        this.jumping = true;
    }
    draw(){
        /*
        c.fillStyle = 'red';
        c.fillRect(this.position.x, this.position.y, this.spriteWidth, this.spriteHeight);
*/

        if( this.position.x >= banana.position.x){
            c.drawImage(playerLeft,  this.position.x - 35, 
                this.position.y - 45, this.radius*3, this.radius*3);
        } else {
            c.drawImage(playerRight,
                this.position.x - 35, this.position.y - 45, this.radius*3, 
                this.radius*3);
        }
    }
    update(){
        this.draw();

        const dx = this.position.x - mouse.x;
        const dy = this.position.y - mouse.y;
        let theta = Math.atan2(dy, dx);
        this.angle = theta;
        
        this.position.y += this.velocity.y;
        if(this.position.y + this.spriteHeight + this.velocity.y <= canvas.height){
            this.velocity.y += gravity/1.5;
        } else {
            this.velocity.y = 0;
        }

        var bananaPositionXCorrection = banana.position.x - 8.1

        console.log(bananaPositionXCorrection - this.position.x, this.position.x - bananaPositionXCorrection)
        if ( !this.jumping && this.position.y > banana.position.y &&
             (between(bananaPositionXCorrection - this.position.x, -3, 3)
             || between(this.position.x - bananaPositionXCorrection , -3, 3))) {
            this.jumping = true;
            this.velocity.y =  -15;
        }

        if (this.jumping){
            this.velocity.x = (banana.position.x - this.position.x - tile_size * 2) * 0.05; 
            pointer.down = false;
        }else{ this.velocity.x = (banana.position.x - this.position.x - tile_size * 0.5) * 0.025; }
    
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    
        this.velocity.y *= friction;
    
        if (this.position.y > floor) { this.position.y = floor; this.jumping = false; }
    }
}
const player = new Player();


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
    player.update();
    banana.update();
}

animate();

window.addEventListener('resize', function(){
    canvasPosition = canvas.getBoundingClientRect();
});
