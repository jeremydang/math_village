
//INCLUDING : makePointer(), keyboard(), addStatePlayer(), makeInteractive()


/*
Function to create pointer object
*/

export function makePointer(element, scale = 1) {

  let pointer = {
    element: element,
    scale: scale,

    _x: 0,
    _y: 0,

    get x() {
      return this._x / this.scale;
    },
    get y() {
      return this._y / this.scale;
    },

    get centerX() {
      return this.x; 
    },
    get centerY() {
      return this.y;
    },

    get position() {
      return {x: this.x, y: this.y};
    },
    
    isDown: false,
    isUp: true,
    tapped: false,

    downTime: 0,
    elapsedTime: 0,

    //Optional `press`,`release` and `tap` methods

    press: undefined,
    release: undefined,
    tap: undefined,

    dragSprite: null,

    dragOffsetX: 0,
    dragOffsetY: 0,
    
    moveHandler(event) {

      let element = event.target;

      this._x = (event.pageX - element.offsetLeft);
      this._y = (event.pageY - element.offsetTop);

      event.preventDefault();
    },

    touchmoveHandler(event) {
      let element = event.target;

      this._x = (event.targetTouches[0].pageX - element.offsetLeft);
      this._y = (event.targetTouches[0].pageY - element.offsetTop);
      event.preventDefault();
    },

    downHandler(event) {

      this.isDown = true;
      this.isUp = false;
      this.tapped = false;

      this.downTime = Date.now();

      if (this.press) this.press();
      event.preventDefault();
    },

    touchstartHandler(event) {
      let element = event.target;

      this._x = event.targetTouches[0].pageX - element.offsetLeft;
      this._y = event.targetTouches[0].pageY - element.offsetTop;

      this.isDown = true;
      this.isUp = false;
      this.tapped = false;

      this.downTime = Date.now();

      if (this.press) this.press();
      event.preventDefault();
    },

    upHandler(event) {

      this.elapsedTime = Math.abs(this.downTime - Date.now());

      if (this.elapsedTime <= 200 && this.tapped === false) {
        this.tapped = true;

        if (this.tap) this.tap(); 
      }
      this.isUp = true;
      this.isDown = false;

      if (this.release) this.release();
      event.preventDefault();
    },

    touchendHandler(event) {

      this.elapsedTime = Math.abs(this.downTime - Date.now());

      if (this.elapsedTime <= 200 && this.tapped === false) {
        this.tapped = true;

        if (this.tap) this.tap(); 
      }
      this.isUp = true;
      this.isDown = false;

      if (this.release) this.release();
      event.preventDefault();
    },

    //`hitTestSprite` figures out if the pointer is touching a sprite
    hitTestSprite(sprite) {


      let hit = false;

      if (!sprite.circular) {

        let left = sprite.gx,
            right = sprite.gx + sprite.width,
            top = sprite.gy,
            bottom = sprite.gy + sprite.height;


        hit 
          = this.x > left && this.x < right 
          && this.y > top && this.y < bottom;
      }

      else {

        let vx = this.x - (sprite.gx + sprite.radius),
            vy = this.y - (sprite.gy + sprite.radius),
            distance = Math.sqrt(vx * vx + vy * vy);

        hit = distance < sprite.radius;
      }
      return hit;
    },

    updateDragAndDrop(draggableSprites) {

      //Check whether the pointer is pressed down
      if (this.isDown) {

        if (this.dragSprite === null) {

          //Loop through the `draggableSprites` in reverse to start searching at the bottom of the stack
          for (let i = draggableSprites.length - 1; i > -1; i--) {
            let sprite = draggableSprites[i];

            if (this.hitTestSprite(sprite) && sprite.draggable) {

              this.dragOffsetX = this.x - sprite.gx;
              this.dragOffsetY = this.y - sprite.gy;

              this.dragSprite = sprite;

              let children = sprite.parent.children;
              children.splice(children.indexOf(sprite), 1);

              //Push the `dragSprite` to the end of its `children` array so that it's
              //displayed last, above all the other sprites
              children.push(sprite);

              //Reorganize the `draggableSpites` array in the same way
              draggableSprites.splice(draggableSprites.indexOf(sprite), 1);
              draggableSprites.push(sprite);

              break;
            }
          }
        } 

        else {
          this.dragSprite.x = this.x - this.dragOffsetX;
          this.dragSprite.y = this.y - this.dragOffsetY;
        }
      }

      if (this.isUp) {
        this.dragSprite = null;
      }

      draggableSprites.some(sprite => {
        if (this.hitTestSprite(sprite) && sprite.draggable) {
          this.element.style.cursor = "pointer";
          return true;
        } else {
          this.element.style.cursor = "auto";
          return false;
        }
      });
    }
  };


  element.addEventListener(
    "mousemove", pointer.moveHandler.bind(pointer), false
  );
  element.addEventListener(
    "mousedown", pointer.downHandler.bind(pointer), false
  );

  window.addEventListener(
    "mouseup", pointer.upHandler.bind(pointer), false
  );

  element.addEventListener(
    "touchmove", pointer.touchmoveHandler.bind(pointer), false
  );
  element.addEventListener(
    "touchstart", pointer.touchstartHandler.bind(pointer), false
  );

  window.addEventListener(
    "touchend", pointer.touchendHandler.bind(pointer), false
  );

  element.style.touchAction = "none";

  return pointer;
}

/*
Create a key object that listen to keyboard event for a specific key code
*/


export function keyboard(keyCode) {
  let key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;

  key.downHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }
    event.preventDefault();
  };

  key.upHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };

  window.addEventListener(
    "keydown", key.downHandler.bind(key), false
  );
  window.addEventListener(
    "keyup", key.upHandler.bind(key), false
  );

  return key;
}


/*
Function to animate sprite
*/

function addStatePlayer(sprite) {
  let frameCounter = 0,
      numberOfFrames = 0,
      startFrame = 0,
      endFrame = 0,
      timerInterval = undefined;

  //Display static states.
  function show(frameNumber) {
    reset();
    sprite.gotoAndStop(frameNumber);
  }

  //Plays all the sprites frames
  function play() {
    if (!sprite.playing) {
      playSequence([0, sprite.frames.length - 1]);
    }
  }

  //Stops the animation at the current frame
  function stop() {
    if (sprite.playing) {
      reset();
      sprite.gotoAndStop(sprite.currentFrame);
    }
  }

  //Play a sequence of frames.
  function playSequence(sequenceArray) {
    reset();

    //Figure out how many frames there are in the range
    startFrame = sequenceArray[0];
    endFrame = sequenceArray[1];
    numberOfFrames = endFrame - startFrame;

    //Compensate for two edge cases:
    //1. If the `startFrame` happens to be `0`
    if (startFrame === 0) {
      numberOfFrames += 1;
      frameCounter += 1;
    }

    //2. If only a two-frame sequence was provided
    if(numberOfFrames === 1){
      numberOfFrames = 2;
      frameCounter += 1;
    };

    //Calculate the frame rate. Set the default fps to 12
    if (!sprite.fps) sprite.fps = 12;
    let frameRate = 1000 / sprite.fps;

    //Set the sprite to the starting frame
    sprite.gotoAndStop(startFrame);

    //If the state isn't already playing, start it
    if(!sprite.playing) {
      timerInterval = setInterval(advanceFrame.bind(this), frameRate);
      sprite.playing = true;
    }
  }

/*  Called by `setInterval` to display the next frame
  in the sequence based on the `frameRate`. When frame sequence
  reaches the end, it will either stop it or loop it*/

  function advanceFrame() {


    if (frameCounter < numberOfFrames) {

      sprite.gotoAndStop(sprite.currentFrame + 1);

      frameCounter += 1;

    } else {
      if (sprite.loop) {
        sprite.gotoAndStop(startFrame);
        frameCounter = 1;
      }
    }
  }

  function reset() {

    if (timerInterval !== undefined && sprite.playing === true) {
      sprite.playing = false;
      frameCounter = 0;
      startFrame = 0;
      endFrame = 0;
      numberOfFrames = 0;
      clearInterval(timerInterval);
    }
  }

  sprite.show = show;
  sprite.play = play;
  sprite.stop = stop;
  sprite.playSequence = playSequence;
}

/*
Function to make sprite interactive
*/

function makeInteractive(o) {

  //function to be called when the sprite is pressed, released,..

  o.press = o.press || undefined;
  o.release = o.release || undefined;
  o.over = o.over || undefined;
  o.out = o.out || undefined;
  o.tap = o.tap || undefined;
  o.doubleClick = o.doubleClick || undefined;

  o.state = "up";

  o.action = "";

  o.pressed = false;

  o.hoverOver = false;

  //The `update` method will be called each frame 
  //inside the game loop
  o.update = (pointer, canvas) => {

    //Figure out if the pointer is touching the sprite
    let hit = pointer.hitTestSprite(o);

    //Figure out the current state and display suitable frame
    if (pointer.isUp) {

      //Up state - no interaction
      o.state = "up";

      //Show the first image state frame, if this is a `Button` sprite
      if (o instanceof Button) o.gotoAndStop(0);
    }

    //If the pointer is touching the sprite, figure out
    //if the over or down state should be displayed
    if (hit) {

      //Over state - the sprite is hover over
      o.state = "over";

      //Show the second image state frame if this sprite has
      //3 frames and it's a `Button` sprite
      if (o.frames && o.frames.length === 3 && o instanceof Button) {
        o.gotoAndStop(1);
      }

      //Down state - the sprite is pressed, active
      if (pointer.isDown) {
        o.state = "down";

        //Show the third frame if this sprite is a `Button` sprite and it
        //has only three frames, or show the second frame if it
        //only has two frames
        if(o instanceof Button) {
          if (o.frames.length === 3) {
            o.gotoAndStop(2);
          } else {
            o.gotoAndStop(1);
          }
        }
      }
    }

    //Perform the correct interactive action

    //a. Run the `press` method if the sprite state is "down" and
    //the sprite hasn't already been pressed
    if (o.state === "down") {
      if (!o.pressed) {
        if (o.press) o.press();
        o.pressed = true;
        o.action = "pressed";
      }
    }

    //b. Run the `release` method if the sprite state is "over" and
    //the sprite has been pressed
    if (o.state === "over") {
      if (o.pressed) {
        if (o.release) o.release();
        o.pressed = false;
        o.action = "released";

        //Call the tap method if the sprite has been tapped
        if (pointer.tapped && o.tap) o.tap();

        //Call the double click method if the sprite has been double click
        if (pointer.tapped){
          if(pointer.tapped && o.doubleClick()) o.doubleClick();
        }
      }

      //Run the `over` method if it has been assigned
      if (!o.hoverOver) {
        if (o.over) o.over();
        o.hoverOver = true;
      }
    }

    //c. Check whether the pointer has been released outside
    //the sprite's area. If the button state is "up" and it's
    //already been pressed, then run the `release` method.
    if (o.state === "up") {
      if (o.pressed) {
        if (o.release) o.release();
        o.pressed = false;
        o.action = "released";
      }

      //Run the `out` method if it has been assigned
      if (o.hoverOver) {
        if (o.out) o.out();
        o.hoverOver = false;
      }
    }
  };
}