/*
SETUP GAME
*/

module player from "/gamejs/player";
module utilities from "/gamejs/utilities";
module sound from "/gamejs/sound";
module display from "/gamejs/display";
module collision from "/gamejs/collision";
module interactive from "gamejs/interactive";
module tween from "/gamejs/tween";

export class Setup {
  constructor(width = 960, height = 640, setup, assetsToLoad, load) {

    //Assign the library as the object property

    Object.assign(this, utilities);
    Object.assign(this, display);
    Object.assign(this, collision);
    Object.assign(this, interactive);
    Object.assign(this, sound);
    Object.assign(this, tween);

    //Make the canvas and initialize the stage
    this.canvas = this.makeCanvas(width, height);
    this.stage.width = this.canvas.width;
    this.stage.height = this.canvas.height;

    this.pointer = this.makePointer(this.canvas);

    this.scale = 1;

    //Set the game state
    this.state = undefined;

    //Set the defined load and setup function
    this.load = load;
    this.setup = setup;

    this.assetsToLoad = assetsToLoad;

    this.paused = false;
    
    if (!setup) {
      throw new Error(
        "Please supply the setup function in the constructor"
      );
    }
  }

  //The game loop
  gameLoop() {
    requestAnimationFrame(this.gameLoop.bind(this));

    //Update all the buttons 
    if (this.buttons.length > 0) {
      this.canvas.style.cursor = "auto";
      this.buttons.forEach(button => {
        button.update(this.pointer, this.canvas);
        if (button.state === "over" || button.state === "down") {
          if(button.parent !== undefined) {
            this.canvas.style.cursor = "pointer";
          }
        }
      });
    }

    //Update all the tweens
    if (this.tweens.length > 0) {
      for(let i = this.tweens.length - 1; i >= 0; i--) {
        let tween = this.tweens[i];
        if (tween) tween.update();
      }
    }
    
    //Update the pointer for drag and drop
    if (this.draggableSprites.length > 0) {
      this.pointer.updateDragAndDrop(this.draggableSprites);
    }

    //Run the current game state function if it's been defined and
    //the game isn't `paused`
    if(this.state && !this.paused) {
      this.state();
    }

    //Render the canvas
    this.render(this.canvas);

  }

//Load asset, run setup function and game loop

  start() {
    if (this.assetsToLoad) {
      this.assets.load(this.assetsToLoad).then(() => {

        this.state = undefined;

        this.setup();
      });

      if (this.load) {
        this.state = this.load;
      }
    }


    else {
      this.setup();
    }

    this.gameLoop();
  }

  pause() {
    this.paused = true;
  }
  resume() {
    this.paused = false;
  }

  //Center the canvas inside HTML page

  centerCanvas() {

    let center;    

    if (this.canvas.width > this.canvas.height) {
      center = "vertically";
    } else {
      center = "horizontally";
    }
    
    if (center === "horizontally") {
      let margin = (window.innerWidth - this.canvas.width * scaleY) / 2;
      this.canvas.style.marginLeft = margin + "px";
      this.canvas.style.marginRight = margin + "px";
    }

    if (center === "vertically") {
      let margin = (window.innerHeight - this.canvas.height * scaleX) / 2;
      this.canvas.style.marginTop = margin + "px";
      this.canvas.style.marginBottom = margin + "px";
    }

    this.canvas.style.paddingLeft = 0;
    this.canvas.style.paddingRight = 0;
    this.canvas.style.display = "block";
    
    //4. Set the color of the HTML body background
    document.body.style.backgroundColor = backgroundColor;
    
  }
}


export function Setup(
  width = 960, height = 640,
  setup, assetsToLoad, load
) {
  return new Setup (width, height, setup, assetsToLoad, load);
}



