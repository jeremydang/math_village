
//INCLUDING: tweenProperty(), fadeIn(), fadeOut(), pulse(), makeTween(), slide(), walkPath(), removeTween(), wait()


/*
Easing function
*/

let ease = {

  //Linear
  linear(x) {return x;},

  //Smoothstep
  smoothstep(x) {return x * x * (3 - 2 * x);},
  smoothstepSquared(x) {return Math.pow((x * x * (3 - 2 * x)), 2);},
  smoothstepCubed(x) {return Math.pow((x * x * (3 - 2 * x)), 3);},

  //Acceleration
  acceleration(x) {return x * x;},
  accelerationCubed(x) {return Math.pow(x * x, 3);},

  //Deceleration
  deceleration(x) {return 1 - Math.pow(1 - x, 2);},
  decelerationCubed(x) {return 1 - Math.pow(1 - x, 3);},

  //Sine
  sine(x) {return Math.sin(x * Math.PI / 2);},
  sineSquared(x) {return Math.pow(Math.sin(x * Math.PI / 2), 2);},
  sineCubed(x) {return Math.pow(Math.sin(x * Math.PI / 2), 2);},
  inverseSine(x) {return 1 - Math.sin((1 - x) * Math.PI / 2);},
  inverseSineSquared(x) {return 1 - Math.pow(Math.sin((1 - x) * Math.PI / 2), 2);},
  inverseSineCubed(x) {return 1 - Math.pow(Math.sin((1 - x) * Math.PI / 2), 3);},

  //Spline
  spline (t, p0, p1, p2, p3) {
    return 0.5 * (
      (2 * p1) +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t
    );
  }
};

/*
Function to tween sprite's property
*/

export let tweens = [];

export function tweenProperty(
  sprite,                  //Sprite object
  property,                //String property
  startValue,              //Tween start value
  endValue,                //Tween end value
  totalFrames,             //Duration in frames
  type = ["smoothstep"],   //The easing type
  yoyo = false,            
  delayBeforeRepeat = 0    
) {

  let o = {};

  if(type[0] === "spline" ){
    o.startMagnitude = type[1];
    o.endMagnitude = type[2];
  }

  o.start = (startValue, endValue) => {

    o.startValue = JSON.parse(JSON.stringify(startValue));
    o.endValue = JSON.parse(JSON.stringify(endValue));
    o.playing = true;
    o.totalFrames = totalFrames;
    o.frameCounter = 0;

    //Add the tween to the global `tweens` array. The `tweens` array is
    //updated on each frame
    tweens.push(o);
  };

  //Start the tween
  o.start(startValue, endValue);

  //The `update` method will be called on each frame by the game loop.
  o.update = () => {
    
    let time, curvedTime;

    if (o.playing) {

      //If the elapsed frames are less than the total frames,
      //use the tweening formulas to move the sprite
      if (o.frameCounter < o.totalFrames) {

        //Find the normalized value
        let normalizedTime = o.frameCounter / o.totalFrames;

        //Select the correct easing function from the 
        //`ease` object’s library of easing functions

        if (type[0] !== "spline") {
          curvedTime = ease[type](normalizedTime);
        } 

        else {
          curvedTime = ease.spline(normalizedTime, o.startMagnitude, 0, 1, o.endMagnitude);
        }

        //Interpolate the sprite's property based on the curve
        sprite[property] = (o.endValue * curvedTime) + (o.startValue * (1 - curvedTime));

        o.frameCounter += 1;
      }
      //When the tween has finished playing, run the end tasks
      else {
       o.end(); 
      }
    }
  };
    
  //The `end` method will be called when the tween is finished
  o.end = () => {

    //Set `playing` to `false`
    o.playing = false;

    //Call the tween's `onComplete` method, if it's been assigned
    if (o.onComplete) o.onComplete();

    //Remove the tween from the `tweens` array
    tweens.splice(tweens.indexOf(o), 1);

    if (yoyo) {
      wait(delayBeforeRepeat).then(() => {
        o.start(o.endValue, o.startValue);
      });
    }
  };

  o.play = () => o.playing = true;
  o.pause = () => o.playing = false;
  
  return o;
}

/* High level tween functions */

//`fadeOut`
export function fadeOut(sprite, frames = 60) {
  return tweenProperty(
    sprite, "alpha", sprite.alpha, 0, frames, ["sine"]
  );
}

//`fadeIn`
export function fadeIn(sprite, frames = 60) {
  return tweenProperty(
    sprite, "alpha", sprite.alpha, 1, frames, ["sine"]
  );
}

//`pulse`
//Fades the sprite in and out at a steady rate.

export function pulse(sprite, frames = 60, minAlpha = 0) {
  return tweenProperty(
    sprite, "alpha", sprite.alpha, minAlpha, frames, ["smoothstep"], true
  );
}

/*
Function to create complex tweening with multiple tweening properties
*/

function makeTween(tweensToAdd) {

  let o = {};

  o.tweens = [];

  tweensToAdd.forEach(tweenPropertyArguments => {
     
     //Use the tween property arguments to make a new tween
     let newTween = tweenProperty(...tweenPropertyArguments);

     //Push the new tween into this object's internal `tweens` array
     o.tweens.push(newTween);
  });

  //Add a counter to keep track of the
  //number of tweens that have completed their actions
  let completionCounter = 0;
  
  //`o.completed` will be called each time one of the tweens
  //finishes
  o.completed = () => {

    completionCounter += 1;

    //If all tweens have finished, call `onComplete` method

    if (completionCounter === o.tweens.length) {
      if (o.onComplete) o.onComplete();
      completionCounter = 0;
    }
  }; 

  o.tweens.forEach(tween => {
    tween.onComplete = () => o.completed();
  });
  
  o.pause = () => {
    o.tweens.forEach(tween => {
      tween.playing = false;
    });
  };
  o.play = () => {
    o.tweens.forEach(tween => {
      tween.playing = true;
    });
  };

  return o;
}

/* Predefined tweening multiple properties functions */

//Move sprite to another x,y coordinate

export function slide(
  sprite, endX, endY, 
  frames = 60, type = ["smoothstep"], yoyo = false, delayBeforeRepeat = 0
) {
  return makeTween([ 

    //Create the x axis tween
    [sprite, "x", sprite.x, endX, frames, type, yoyo, delayBeforeRepeat],
    //Create the y axis tween
    [sprite, "y", sprite.y, endY, frames, type, yoyo, delayBeforeRepeat]

  ]);
}

//Move sprite to a predefined path

export function walkPath(
  sprite,                   //The sprite
  originalPathArray,        //A 2D array of waypoints
  totalFrames = 300,        //The duration, in frames
  type = ["smoothstep"],    //The easing type
  loop = false,             //Should the animation loop?
  yoyo = false,             //Shoud the direction reverse?
  delayBetweenSections = 0  //Delay, in milliseconds, between sections
) {
  

  let pathArray = JSON.parse(JSON.stringify(originalPathArray));

  let frames = totalFrames / pathArray.length;

  let currentPoint = 0;

  let tween = makePath(currentPoint);


  function makePath(currentPoint) {

    let tween = makeTween([ 

      [
        sprite, 
        "x", 
        pathArray[currentPoint][0], 
        pathArray[currentPoint + 1][0], 
        frames, 
        type
      ],

      [
        sprite, 
        "y", 
        pathArray[currentPoint][1], 
        pathArray[currentPoint + 1][1], 
        frames, 
        type
      ]
    ]);


    tween.onComplete = () => {

      //Advance to the next point
      currentPoint += 1;

      if (currentPoint < pathArray.length - 1) {
        wait(delayBetweenSections).then(() => {
          tween = makePath(currentPoint);
        });
      } 

      else {

        if (loop) {

          if (yoyo) pathArray.reverse();

          wait(delayBetweenSections).then(() => {

            currentPoint = 0;

            sprite.x = pathArray[0][0];
            sprite.y = pathArray[0][1];

            tween = makePath(currentPoint);

          });
        }
      }
    };

    return tween;
  }

  return tween;
}

/*
Remove tween from game
*/

export function removeTween(tweenObject) {

  //Remove the tween if `tweenObject` doesn't have any nested
  //tween objects
  if(!tweenObject.tweens) {
    tweenObject.pause();
    tweens.splice(tweens.indexOf(tweenObject), 1);
  
  //Otherwise, remove the nested tween objects
  } else {
    tweenObject.pause();
    tweenObject.tweens.forEach(element => {
      tweens.splice(tweens.indexOf(element), 1);
    });
  }
}

/*
Wait for a specified time
*/

