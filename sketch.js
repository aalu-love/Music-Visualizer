var fft
var img
let song
let particles = []
let baseSize = 0, pixelRatio = 0, growSize = 0
let FileDone = false
var audioFile, audioSrc
let songs = ['Alan Walker - The Drum (Official Music Video)_2.mp3', 'videoplayback.mp3']

// function loadMusic(){
//     blodFile = document.getElementById('uploadFile')
//     audioFile = document.getElementById('audio')
//     if(blodFile!=undefined){
//         file = blodFile.value.split("\\")[2]
//         if(file!=undefined){
//             audioSrc = file
//             FileDone = true
//             preload()
//         }
//     }
// }

class Particle {
    constructor(){
        this.pos = p5.Vector.random2D().mult(250)
        this.vel = createVector(0, 0)
        this.acc = this.pos.copy().mult(random(0.0001, 0.00001))

        this.w = random(3, 8)
        this.color = [random(200, 255), random(200, 255), random(200, 255), ]
    }
    update(cond){
        this.vel.add(this.acc)
        this.pos.add(this.vel)
        if(cond > 22220){ // mid : 12700, treble : 6150 bass: 14200
            this.vel.add(this.acc)
            this.vel.add(this.acc)
            this.pos.add(this.vel)
            this.pos.add(this.vel)
        }
        if(cond > 24020){ // mid : 12700, treble : 6150 bass: 14200
            this.vel.add(this.acc)
            this.vel.add(this.acc)
            this.pos.add(this.vel)
            this.pos.add(this.vel)
            this.pos.add(this.vel)
            this.pos.add(this.vel)
        }
    }
    edges(){
        if(this.pos.x < -width/2 || this.pos.x > width/2 || this.pos.y < -height/2 || this.pos.y > height/2){
            return true
        }else{
            return false
        }
    }

    show(){
        noStroke()
        fill(this.color)
        ellipse(this.pos.x, this.pos.y, this.w)
    }
}

function preload(l){
    img = loadImage('wallpaper.jpg')
    song = loadSound(songs)
    // if(FileDone){
    //     song = loadSound(audioSrc)
    // }
}

function setup(){
    createCanvas(windowWidth/1.2, windowHeight/1.2);
    angleMode(DEGREES)
    imageMode(CENTER)
    rectMode(CENTER)

    fft = new p5.FFT()

    img.filter(BLUR, 12)
    pixelRatio = (img.width / img.height)
    baseSize = Math.max( 20 * pixelRatio, canvas.height / 27 | 0 )
    growSize = baseSize * 4

}

function draw(){
    background(0)
    stroke(255)
    strokeWeight(5);
    noFill()
    translate(width/2, height/2)

    fft.analyze()
    bassEnergy = fft.getEnergy('bass')
    bassEnergy = (baseSize + growSize * bassEnergy)
    midEnergy = fft.getEnergy('mid')
    midEnergy = (baseSize + growSize * midEnergy)
    trebleEnergy = fft.getEnergy('treble')
    trebleEnergy = (baseSize + growSize * trebleEnergy)

    //console.log("Bass",bass, "Mid",mid, "Low",treble)
  
    push()
    textSize(midEnergy/327)
    image(img, 0, 0, img.width+(midEnergy/(pixelRatio*69)), img.height+(midEnergy/(pixelRatio*69)))
    //fill(255,0,0)
    // rect(0, 0, 20, bass/100)
    //text(floor(midEnergy), 0, 50)
    // fill(0,255,0)
    // rect(30, 0, 20, mid/100)
    //text(floor(val), 0, 0)
    // fill(0,0,255)
    // rect(60, 0, 20, treble/100)
    // text(floor(trebleEnergy), 0, -50)
    pop()

    var wave = fft.waveform();
    
    stroke(random(20, 255), random(20, 255), random(20, 255))
    for(let t = -1;t <= 1;t+=2){
        beginShape()
        for(let i=0; i<width; i += 0.5){
            let index = floor(map(i, 0, 180, 0, wave.length - 1))
            let r = map(wave[index], -1, 1, 150, 350)
            let x = r * sin(i) * t
            let y = r * cos(i)
            vertex(x, y)
        }
        endShape()
    }

    const p = new Particle()
    particles.push(p)

    for(var i=0; i<particles.length; i++){
        if(!particles[i].edges()){
            particles[i].update(midEnergy)
            particles[i].show()
        } else {
            particles.splice(i, 1)
        }
    }

}

function mouseClicked(){
    if(song.isPlaying()){
        song.pause()
        noLoop()
    }else{
        song.play()
        loop()
    }
}


// function inRange(freq1, freq2, val){
//     if(freq1 < val && val < freq2){
//         return true
//     }
//     return false
// }

