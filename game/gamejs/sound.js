
let actx = new AudioContext();

class Sound {
  constructor(source, loadHandler) {

    this.source = source;
    this.loadHandler = loadHandler;

    this.actx = actx;
    this.volumeNode = this.actx.createGain();
    this.panNode = this.actx.createStereoPanner();
    this.convolverNode = this.actx.createConvolver();
    this.delayNode = this.actx.createDelay();
    this.feedbackNode = this.actx.createGain();
    this.filterNode = this.actx.createBiquadFilter();
    this.soundNode = null;
    this.buffer = null;
    this.loop = false;
    this.playing = false;

    this.panValue = 0;
    this.volumeValue = 1;

    this.startTime = 0;
    this.startOffset = 0;
   
    this.playbackRate = 1;
    this.randomPitch = true;

    this.load();   
  }


  load() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", this.source, true);
    xhr.responseType = "arraybuffer";
    xhr.addEventListener("load", () => {

      this.actx.decodeAudioData(
        xhr.response, 
        buffer => {
          this.buffer = buffer;
          this.hasLoaded = true;

          if (this.loadHandler) {
            this.loadHandler();
          }
        }, 

        error => {
          throw new Error("Audio could not be decoded: " + error);
        }
      );
    });

    xhr.send();
  }

  play() {
    this.startTime = this.actx.currentTime;

    this.soundNode = this.actx.createBufferSource();

    this.soundNode.buffer = this.buffer;

    this.soundNode.connect(this.volumeNode);

    this.volumeNode.connect(this.panNode);
    
    this.panNode.connect(this.actx.destination);
    }

    this.soundNode.loop = this.loop;

    this.soundNode.playbackRate.value = this.playbackRate;

    this.soundNode.start(
      this.startTime, 
      this.startOffset % this.buffer.duration
    );
    this.playing = true;

  }

  pause() {
    if (this.playing) {
      this.soundNode.stop(this.actx.currentTime);
      this.startOffset += this.actx.currentTime - this.startTime;
      this.playing = false;
      console.log(this.startOffset);
    }
  }

  restart() {
    if (this.playing) {
      this.soundNode.stop(this.actx.currentTime);
    }
    this.startOffset = 0;
    this.startPoint = 0;
    this.endPoint = this.buffer.duration;
    this.play();
  }

  playFrom(value) {
    if (this.playing) {
      this.soundNode.stop(this.actx.currentTime);
    }
    this.startOffset = value;
    this.play();
  }
  
  playSection(start, end) {
    if (this.playing) {
      this.soundNode.stop(this.actx.currentTime);
    }

    if (this.startOffset === 0) this.startOffset = start;

    this.startTime = this.actx.currentTime;

    this.soundNode = this.actx.createBufferSource();

    this.soundNode.buffer = this.buffer;

    this.soundNode.connect(this.panNode);
    this.panNode.connect(this.volumeNode);
    this.volumeNode.connect(this.actx.destination);

    this.soundNode.loop = this.loop;
    this.soundNode.loopStart = start;
    this.soundNode.loopEnd = end;

    let duration = end - start;

    this.soundNode.start(
      this.startTime, 
      this.startOffset % this.buffer.duration,
      duration
    );

    this.playing = true;
  }


  get volume() {
    return this.volumeValue;
  }
  set volume(value) {
    this.volumeNode.gain.value = value;
    this.volumeValue = value;
  }

  get pan() {
    return this.panNode.pan.value;
  }
  set pan(value) {
    this.panNode.pan.value = value;
  }
}

export function makeSound(source, loadHandler) {
  return new Sound(source, loadHandler);  
}