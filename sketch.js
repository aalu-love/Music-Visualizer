var fft;
var img;
let song;
let particles = [];
let baseSize = 0,
  pixelRatio = 0,
  growSize = 0;
let FileDone = false;
var audioFile, audioSrc;
let opacity = 0;
const barLenght = 900;
//let playlist = ['Alan Walker - The Drum (Official Music Video)_2.mp3', 'videoplayback.mp3']
let fileLoad = false;

function windowResized() {
  resizeCanvas(windowWidth, windowHeight - 4.5);
}

const songPlay = () => {
  song.play();
};

const audioEl = document.getElementById("audio");

// File upload
document.getElementById("uploadFile").addEventListener("change", e => loadSong(e.target));

// Load song from user's computer
function loadSong(el) {
  const fileBlob = el.files[0];
  if (fileBlob) {
    audioEl.src = URL.createObjectURL(fileBlob);
    //audioEl.play()
    audioEl.addEventListener("progress", e => {
      console.log(e?.target?.duration);
    });
    song = loadSound(audioEl.src);
    fileLoad = true;
    songPlay;
  }
}

class Particle {
  constructor() {
    this.pos = p5.Vector.random2D().mult(250);
    this.vel = createVector(0, 0);
    this.acc = this.pos.copy().mult(random(0.0001, 0.00001));

    this.w = random(3, 8);
    this.color = [random(200, 255), random(200, 255), random(200, 255)];
  }
  update(energy) {
    // // Add acceleration to velocity
    // this.vel.add(this.acc);

    // // Add velocity to position
    // this.pos.add(this.vel);

    // Check energy value and adjust acceleration and velocity accordingly
    const energyThreshold = 22220;
    const beats = energy / energyThreshold;

    for (let i = 0; i < beats; i++) {
      this.vel.add(this.acc);
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.pos.add(this.vel);
    }
  }

  edges() {
    return this.x > width / 2 || this.x < -width / 2 || this.y > height / 2 || this.y < -height / 2;
  }

  show() {
    noStroke();
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, this.w);
  }
}

function preload(l) {
  img = loadImage("wallpaper.jpg");
  console.log(img);
}

function setup() {
  var myCanvas = createCanvas(windowWidth, windowHeight - 4.5);
  myCanvas.parent("canvas-id");
  angleMode(DEGREES);
  imageMode(CENTER);
  rectMode(CENTER);

  fft = new p5.FFT();

  img.filter(BLUR, 12);
  pixelRatio = img.width / img.height;
  baseSize = Math.max(20 * pixelRatio, (canvas.height / 27) | 0);
  growSize = baseSize * 4;

  slider = createSlider(0, song ? song.duration() : 800, 0);
  slider.position(20, height - 20);
  slider.style("width", `${width - 40}px`);
}

function draw() {
  background(0);
  stroke(255);
  strokeWeight(5);
  noFill();
  translate(width / 2, height / 2);

  fft.analyze();

  const energies = {
    bass: fft.getEnergy("bass"),
    mid: fft.getEnergy("mid"),
    treble: fft.getEnergy("treble"),
  };

  for (const [key, energy] of Object.entries(energies)) {
    energies[key] = baseSize + growSize * energy;
  }

  push();
  image(img, 0, 0, img.width + energies.mid / (pixelRatio * 69), img.height + energies.mid / (pixelRatio * 69));
  pop();

  var wave = fft.waveform();
  stroke(random(20, 255), random(20, 255), random(20, 255));
  for (let t = -1; t <= 1; t += 2) {
    beginShape();
    for (let i = 0; i < width; i += 0.5) {
      let index = floor(map(i, 0, 180, 0, wave.length - 1));
      let r = map(wave[index], -1, 1, 150, 350);
      let x = r * sin(i) * t;
      let y = r * cos(i);
      vertex(x, y);
    }
    endShape();
  }

  const p = new Particle();
  particles.push(p);

  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    if (!particle.edges()) {
      particle.update(energies.mid, energies.bass);
      particle.show();
    } else {
      particles.splice(i--, 1);
    }
  }

    slider.value(song ? song.currentTime() : 0);
}

function mouseClicked() {
  if (fileLoad) {
    if (song.isPlaying()) {
      song.pause();
    } else {
      song.play();
      loop();
    }
  }
}

// function inRange(freq1, freq2, val){
//     if(freq1 < val && val < freq2){
//         return true
//     }
//     return false
// }
