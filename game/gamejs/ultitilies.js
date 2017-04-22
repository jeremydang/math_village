
//INCLUDING: Global variable, remove(), outsideBounds(), contain(), distance(), randomInt(), randomFloat(), move()


/*
Global array, variable and object
*/

//Stage object
export let stage = new DisplayObject();

//All buttons and interactive sprites - updated in game loop

export let buttons = [];

export let draggableSprites = [];

export let tweens = [];

//Game own variable

export let level = [];

export let player = null;

export let NPC = [];


/*
Universal function to remove sprite from its parent
*/

export function remove(...spritesToRemove) {
  spritesToRemove.forEach(sprite => {
    sprite.parent.removeChild(sprite);
  });
}

/*
Check whether sprite has been out of bounds
*/

export function outsideBounds(sprite, bounds, extra = undefined){

  let x = bounds.x,
      y = bounds.y,
      width = bounds.width,
      height = bounds.height;


  let collision;

  //Left
  if (sprite.x < x - sprite.width) {
    collision = "left";
  }
  //Top
  if (sprite.y < y - sprite.height) {
    collision = "top";
  }
  //Right
  if (sprite.x > width) {
    collision = "right";
  }
  //Bottom
  if (sprite.y > height) {
    collision = "bottom";
  }

  if (collision && extra) extra(collision);

  return collision;
};
/*

/*
Keep the sprite contain in the boundary
*/

export function contain (sprite, bounds, bounce = false, extra = undefined){

  let x = bounds.x,
      y = bounds.y,
      width = bounds.width,
      height = bounds.height;



  //Left
  if (sprite.x < x) {
    if (bounce) sprite.vx *= -1;

    if(sprite.mass) sprite.vx /= sprite.mass;
    sprite.x = x;
  }
  //Top
  if (sprite.y < y) {
    if (bounce) sprite.vy *= -1;
    if(sprite.mass) sprite.vy /= sprite.mass;
    sprite.y = y;
  }
  //Right
  if (sprite.x + sprite.width > width) {
    if (bounce) sprite.vx *= -1;
    if(sprite.mass) sprite.vx /= sprite.mass;
    sprite.x = width - sprite.width;
  }
  //Bottom
  if (sprite.y + sprite.height > height) {
    if (bounce) sprite.vy *= -1;
    if(sprite.mass) sprite.vy /= sprite.mass;
    sprite.y = height - sprite.height;
  }

  //The `extra` function runs if there was a collision
  //and `extra` has been defined
  if (collision && extra) extra(collision);
};

/*
Find the distance in pixels between two sprites.
*/

export function distance(s1, s2) {
  let vx = s2.centerX - s1.centerX,
      vy = s2.centerY - s1.centerY;
  return Math.sqrt(vx * vx + vy * vy);
}

/*
Create random number
*/

export let randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export let randomFloat = (min, max) => {
  return min + Math.random() * (max - min);
}

/*
Move sprite or multiple sprite
*/

export function move(...sprites) {
  if (sprites.length === 1) {
    let s = sprites[0];
    s.x += s.vx;
    s.y += s.vy;
  }
  else {
    for (let i = 0; i < sprites.length; i++) {
      let s = sprites[i];
      s.x += s.vx;
      s.y += s.vy;
    }
  }
}