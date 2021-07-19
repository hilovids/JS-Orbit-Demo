const canvas = document.getElementById('canvas'); // grabs our canvas
const context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let planet = new Image();
planet.src = 'planet.png';

let sunPic = new Image();
sunPic.src = 'sun.png';

let bodyArray = [];
let maxSize = 10;

let dotArray = [];
let maxDots = 10000;

let gravity = 2;
let stableSystem = true;
let twinSun = false;

let targetString = "";
window.onmousedown = e => {
    console.log(e.target.tagName);
    targetString = e.target.tagName;
    console.log(targetString);  // to get the element tag name alone
} 

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function changeStability() {
    stableSystem = !stableSystem;
    console.log ("Stability: " + stableSystem);
    init();
    //animate();
}

function enableTwinSun() {
    twinSun = true;
    console.log ("Twin Sun: " + stableSystem);
    twinSunInit();
    //animate();
}

class Body{
    constructor(mass, xPos, yPos, xVel, yVel){
        this.mass = mass;
        this.x = xPos;
        this.y = yPos;
        this.xVel = xVel;
        this.yVel = yVel;
        this.image = 'planet.png'; // randomize this
        this.color = '#' + Math.floor(Math.random()*16777215).toString(16);
        this.size = this.mass / 20;
        //this.dots = [];
    }
    attractionCalc(body){
        let dist = Math.sqrt(Math.pow(this.x - body.x,2) + Math.pow(this.y - body.y,2));
        let force = gravity * (this.mass * body.mass) / (Math.pow(dist, 2));
        let angleDeg = Math.atan2(body.y - this.y, body.x - this.x);
        let xForce = Math.cos(angleDeg)*force / this.mass;
        let yForce = Math.sin(angleDeg)*force / this.mass;
        return [xForce, yForce];
    }
    update(index){
        this.x += this.xVel;
        this.y += this.yVel;
        if(stableSystem && !twinSun){
            this.xVel += this.attractionCalc(sun)[0];
            this.yVel += this.attractionCalc(sun)[1];
        }
        if(twinSun){
            this.xVel += this.attractionCalc(sun)[0];
            this.yVel += this.attractionCalc(sun)[1];
            this.xVel += this.attractionCalc(sun2)[0];
            this.yVel += this.attractionCalc(sun2)[1];
        }
        for(let i = 0; i < bodyArray.length; i++){
            if(i != index){
                this.xVel += this.attractionCalc(bodyArray[i])[0];
                this.yVel += this.attractionCalc(bodyArray[i])[1];
                //console.log(this.attractionCalc(bodyArray[i])[0]);
            }
        }
        if(this.y > canvas.height * 3 || this.y < 0 - (canvas.height * 2) || this.x > canvas.width * 3 || this.x < 0 - (canvas.width * 2)){
            console.log("Planet " +  index + " is offscreen!");
            bodyArray.splice(index, 1)
            if(stableSystem && bodyArray.length == 0){
                dotArray = [];
            } else if (!stableSystem && bodyArray.length == 1){
                dotArray = [];
            }
            console.log("Number of trail dots: " + dotArray.length);
        } else {
            this.draw(index);
        }
    }
    draw(index){
        let bodyToDraw;
        let strokeTextContent;
        if(index < 0) {
            bodyToDraw = sunPic;
            strokeTextContent = "";
        } else {
            bodyToDraw = planet;
            strokeTextContent = "Planet " + index;
        }
        dotArray.unshift([this.x,this.y,this.color])
        if(dotArray.length >= maxDots){
            dotArray.pop();
        }
        context.drawImage(bodyToDraw,this.x - (50 * this.size / 2), this.y - (50 * this.size / 2), 50 * this.size, 50 * this.size);
        context.font = "30px Arial";
        context.strokeStyle = "#FFFFFF";
        context.strokeText(strokeTextContent, this.x + this.size, this.y + this.size, 100);
    }
}

let sun = new Body(1000, canvas.width / 2, canvas.height / 2, 0, 0);
sun.size = 3;

let sun2 = new Body(1000, canvas.width / 2, canvas.height / 2, 0, 0);
sun2.size = 3;

function spawnBody(){
    if(bodyArray.length < maxSize){
        let toPush = new Body(30*Math.random(), Math.random()*canvas.width, Math.random()*canvas.height, randomIntFromInterval(-5, 5)*Math.random(), randomIntFromInterval(-5, 5)*Math.random());
        bodyArray.push(toPush);
        console.log("Spawned planet at " + toPush.x + "," + toPush.y);
        console.log("Total number of planets: " + bodyArray.length);
    }
}

function spawnOrbitingBody(){
    if(bodyArray.length < maxSize){
        var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
        //var plusOrMinusHeight = Math.random() < 0.5 ? -1 : 1;
        let toPush = new Body(15, canvas.width / 2, randomIntFromInterval(1, 2) / 3 * canvas.height, randomIntFromInterval(2, 3) * plusOrMinus, 0);
        bodyArray.push(toPush);
        console.log("Spawned planet at " + toPush.x + "," + toPush.y);
        console.log("Total number of planets: " + bodyArray.length);
    }
}

function init(){
    twinSun = false;
    bodyArray = [];
    dotArray = [];
    sun = new Body(1000, canvas.width / 2, canvas.height / 2, 0, 0);
    sun.size = 3;
    if(!stableSystem){
        let sun = new Body(1000, canvas.width / 2, canvas.height / 2, 0, 0);
        sun.size = 3;
        bodyArray.push(sun);
    }
}

let shouldDrawLine = false;
let startPoint = [];
let currentPoint = [];

function animate(){
    requestAnimationFrame(animate);
    canvas.width = window.innerWidth; // dynamically changes the width of the canvas
    canvas.height = window.innerHeight;
    context.clearRect(0,0,innerWidth, innerHeight);

    drawLine();
    
    for(let i = 0; i < dotArray.length; i++){
        draw(dotArray[i]);
    }
    
    if(stableSystem){
        sun.draw(-1);
    }
    
    if(twinSun){
        sun.draw(-1);
        sun2.draw(-2);
    }
    
    for(let i = 0; i < bodyArray.length; i++){
        bodyArray[i].update(i);
    }
}

function changeMovement(e){
    currentPoint = [e.pageX, e.pageY];
    console.log(currentPoint);
}

function draw(dot){
    context.fillStyle = dot[2];
    context.fillRect(dot[0],dot[1],2,2);
}

function drawLine(){
    if(shouldDrawLine){
    context.beginPath();
    context.moveTo(startPoint[0], startPoint[1]);
    context.lineTo(currentPoint[0], currentPoint[1]);
    context.strokeStyle = "#FF0000";
    context.lineWidth = 1;
    //context.closePath();
    context.stroke();    
}
}

function setStart(e){
    shouldDrawLine = true;
    startPoint = [e.pageX, e.pageY];
}

function spawnAtClick(e){
    currentPoint = [e.pageX, e.pageY];
    let angleDeg = Math.atan2(currentPoint[1] - startPoint[1], currentPoint[0] - startPoint[0]);
    let force = Math.sqrt(Math.pow(currentPoint[0] - startPoint[0],2) + Math.pow(currentPoint[1] - startPoint[1],2)) / 3;
    let xForce = Math.cos(angleDeg)*force / 15;
    let yForce = Math.sin(angleDeg)*force / 15;
    if(bodyArray.length < maxSize && targetString != "BUTTON"){
        let toPush = new Body(15, startPoint[0], startPoint[1], xForce, yForce);
        bodyArray.push(toPush);
        console.log("Spawned planet at " + toPush.x + "," + toPush.y);
        console.log("Total number of planets: " + bodyArray.length);
    }
    console.log(currentPoint);
    console.log(startPoint);
    shouldDrawLine = false;
}

function twinSunInit(){
        bodyArray = [];
        dotArray = [];
        sun = new Body(1000, canvas.width / 3, canvas.height / 2, 0, 0);            
        sun.size = 3;
        //bodyArray.push(sun);
        sun2 = new Body(1000, 2 * canvas.width / 3, canvas.height / 2, 0, 0);
        sun2.size = 3;
        //bodyArray.push(sun2);
}

document.addEventListener('mousemove', changeMovement);
document.addEventListener('mousedown', setStart);
document.addEventListener('mouseup', spawnAtClick);
init();
animate();