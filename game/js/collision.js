//INCLUDING: - hitTestPoint(), hitTestCircle(), hitTestRectangle(), rectangleCollision(), circleCollision()


/*
Detect collision between a point and a sprite
*/

export
function hitTestPoint(point, sprite) {

  let shape, left, right, top, bottom, vx, vy, magnitude, hit;

  if (sprite.radius) {
    shape = "circle";
  } else {
    shape = "rectangle";
  }

  if (shape === "rectangle") {
    left = sprite.x;
    right = sprite.x + sprite.width;
    top = sprite.y;
    bottom = sprite.y + sprite.height;

    hit = point.x > left && point.x < right && point.y > top && point.y < bottom;
  }

  if (shape === "circle") {
    vx = point.x - sprite.centerX,
    vy = point.y - sprite.centerY,
    magnitude = Math.sqrt(vx * vx + vy * vy);

    hit = magnitude < sprite.radius;
  }

  return hit;
}


/*
Detect collision between 2 circular sprite
*/

export
function hitTestCircle(c1, c2, global = false) {
  let vx, vy, magnitude, combinedRadii, hit;

  if (global) {
    //Use global coordinates
    vx = (c2.gx + c2.radius) - (c1.gx + c1.radius);
    vy = (c2.gy + c2.radius) - (c1.gy + c1.radius);
  } else {
    //Use local coordinates
    vx = c2.centerX - c1.centerX;
    vy = c2.centerY - c1.centerY;
  }

  magnitude = Math.sqrt(vx * vx + vy * vy);

  combinedRadii = c1.radius + c2.radius;

  hit = magnitude < combinedRadii;

  return hit;
};

/*
Block collision between 2 circular sprite from overlapping
*/

export
function circleCollision(c1, c2, bounce = false, global = false) {

  let magnitude, combinedRadii, overlap,
    vx, vy, dx, dy, s = {},
    hit = false;


  if (global) {
    //Use global coordinates
    vx = (c2.gx + c2.radius) - (c1.gx + c1.radius);
    vy = (c2.gy + c2.radius) - (c1.gy + c1.radius);
  } else {
    //Use local coordinates
    vx = c2.centerX - c1.centerX;
    vy = c2.centerY - c1.centerY;
  }

  magnitude = Math.sqrt(vx * vx + vy * vy);

  combinedRadii = c1.radius + c2.radius;

  if (magnitude < combinedRadii) {

    hit = true;

    overlap = combinedRadii - magnitude;

    let quantumPadding = 0.3;
    overlap += quantumPadding;

    dx = vx / magnitude;
    dy = vy / magnitude;

    c1.x -= overlap * dx;
    c1.y -= overlap * dy;

    if (bounce) {

      s.x = vy;
      s.y = -vx;
      bounceOffSurface(c1, s);
    }
  }
  return hit;
}

/*
Block collision between 2 rectangular sprite from overlapping
*/

export
function rectangleCollision(
  r1, r2, bounce = false, global = true
) {

  let collision, combinedHalfWidths, combinedHalfHeights,
    overlapX, overlapY, vx, vy;

  if (global) {
    vx = (r1.gx + r1.halfWidth) - (r2.gx + r2.halfWidth);
    vy = (r1.gy + r1.halfHeight) - (r2.gy + r2.halfHeight);
  } else {
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;
  }

  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  if (Math.abs(vx) < combinedHalfWidths) {

    if (Math.abs(vy) < combinedHalfHeights) {

      overlapX = combinedHalfWidths - Math.abs(vx);
      overlapY = combinedHalfHeights - Math.abs(vy);

      if (overlapX >= overlapY) {

        if (vy > 0) {
          collision = "top";
          r1.y = r1.y + overlapY;
        } else {
          collision = "bottom";
          r1.y = r1.y - overlapY;
        }

        if (bounce) {
          r1.vy *= -1;
        }
      } else {

        if (vx > 0) {
          collision = "left";
          r1.x = r1.x + overlapX;
        } else {
          collision = "right";
          r1.x = r1.x - overlapX;
        }

        if (bounce) {
          r1.vx *= -1;
        }
      }
    } else {
      //No collision
    }
  } else {
    //No collision
  }
  return collision;
}


