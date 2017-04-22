

/*INCLUDING: assets object, DisplayObject, Text, Group, Sprite, Map, Character, NPC, Button, MenuButton class,
render(), frame(), frames(), stripFrames()*/

/*
Asset loader
*/

export let assets = {

  toLoad: 0,
  loaded: 0,

  imageExtensions: ["png", "jpg", "gif"],
  fontExtensions: ["ttf", "otf", "ttc", "woff"],
  jsonExtensions: ["json"],
  audioExtensions: ["mp3", "ogg", "wav", "webm"],
  

  load(sources) {

    // Return a Promise when everything has loaded

    return new Promise(resolve => {


      let loadHandler = () => {
        this.loaded += 1;

        console.log(this.loaded);


        if (this.toLoad === this.loaded) {

          this.toLoad = 0;
          this.loaded = 0;      
          console.log("Assets finished loading");

          resolve();      //Resolve the promise
        } 
      };


      this.toLoad = sources.length;

      sources.forEach(source => {

        let extension = source.split(".").pop();
    
        //Load image
        if (this.imageExtensions.indexOf(extension) !== -1) {
          this.loadImage(source, loadHandler);
        }
        //Load fonts 
        else if (this.fontExtensions.indexOf(extension) !== -1) {
          this.loadFont(source, loadHandler);
        }
        //Load JSON  
        else if (this.jsonExtensions.indexOf(extension) !== -1) {
          this.loadJson(source, loadHandler);
        }
        //Load audio
        else if (this.audioExtensions.indexOf(extension) !== -1) {
          this.loadSound(source, loadHandler);
        }
        else {
          console.log("File type not recognized: " + source);
        }
      });
    });
  },

  loadImage(source, loadHandler) {

    let image = new Image();

    image.addEventListener("load", loadHandler, false);

    image.name = source.split("/").pop();

    this[image.name] = image;

    image.src = source;
  },

  loadFont(source, loadHandler) {

    let fontFamily = source.split("/").pop().split(".")[0];

    let newStyle = document.createElement("style");

    let fontFace = "@font-face {font-family: '" + fontFamily + "'; src: url('" + source + "');}";

    newStyle.appendChild(document.createTextNode(fontFace));

    document.head.appendChild(newStyle);

    loadHandler();
  },

  loadJson(source, loadHandler) {

    let http = new XMLHttpRequest();

    http.open("GET", source, true);

    http.responseType = "text";
    
    http.onload = event => {

      if (http.status === 200) {

        let file = JSON.parse(http.responseText);

        file.name = source;

        this[file.name] = file;

        //detect if it is a spritesheet or tilemap

        if (file.frames) {
          this.createTilesetFrames(file, source, loadHandler);
        }
        else if(file.tilesets){
          this.createTileMap(file,source,loadHandler);
        } 
        else {
          loadHandler();
        }
      }
    };

    http.send();
  },
  createTilesetFrames(file, source, loadHandler) {

    let baseUrl = source.replace(/[^\/]*$/, "");

    let imageSource = baseUrl + file.meta.image;

    //Extract and store image data of tileset
    
    let imageLoadHandler = () => {

      this[imageSource] = image;

      Object.keys(file.frames).forEach(frame => {

        this[frame] = file.frames[frame];

        this[frame].source = image;
      });
      
      loadHandler();
    };

    //Load the tileset image

    let image = new Image();
    image.addEventListener("load", imageLoadHandler, false);
    image.src = imageSource;
  },

  createTileMap(file, source, loadHandler){

    let imageSource = "../data/" + file.tilesets.image.replace(/^.*[\\\/]/, '')

    let imageLoadHandler = () => {

      this[imageSource] = image;
        
      loadHandler();
    };

    let image = new Image();
    image.addEventListener("load", imageLoadHandler, false);
    image.src = imageSource;
    image.firstgid = file.tilesets.firstgid;
    image.width = file.tilesets.imagewidth;
    image.height = file.tilesets.imageheight;
    image.row = Math.floor(image.width / file.tilewidth);
    image.column = Math.floor(image.height / file.tileheight);

  },

  loadSound(source, loadHandler) {

    let sound = makeSound(source, loadHandler);     //need to import makeSound function

    sound.name = source.split("/").pop();

    this[sound.name] = sound;
  }
};

/*
make canvas function
*/


export function makeCanvas(
  width = 960, height = 640, 
  border = "none", 
  backgroundColor = "white"
) {

  //Make the canvas element and add it to the DOM
  let canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.style.border = border;
  canvas.style.backgroundColor = backgroundColor;
  document.body.appendChild(canvas);

  //Create the context as a property of the canvas
  canvas.ctx = canvas.getContext("2d");

  //Return the canvas
  return canvas;
}

/*
Display object
*/

class DisplayObject {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;

    this.rotation = 0;
    this.alpha = 1;
    this.visible = true;
    this.scaleX = 1;
    this.scaleY = 1;

    this.pivotX = 0.5;
    this.pivotY = 0.5;

    this.vx = 0;
    this.vy = 0;
    
    this._layer = 0;


    this.children = [];

 
    this.parent = undefined;
    
    
    this.frames = [];
    this.loop = true;
    this._currentFrame = 0;
    this.playing = false;

    this._draggable = undefined;
    

    this._circular = false;


    this._interactive = false;

    this.previousX = 0;
    this.previousY = 0;
  }


  //Global position
  get gx() {
    if (this.parent) {
      return this.x + this.parent.gx;
    } else {
      return this.x;  
    }
  }
  get gy() {
    if (this.parent) {
      return this.y + this.parent.gy;
    } else {
      return this.y;
    }
  }
  
  //Depth layer
  get layer() {
    return this._layer;
  }
  set layer(value) {
    this._layer = value;
    if (this.parent) {
      this.parent.children.sort((a, b) => a.layer - b.layer);
    } 
  }

  
  addChild(sprite) {

    if (sprite.parent) {
      sprite.parent.removeChild(sprite);
    }
    sprite.parent = this;
    this.children.push(sprite);
  }

  removeChild(sprite) {
    if(sprite.parent === this) {
      this.children.splice(this.children.indexOf(sprite), 1);
    } else {
      throw new Error(sprite + "is not a child of " + this);
    }
  }

  get halfWidth() {
    return this.width / 2;
  }
  get halfHeight() {
    return this.height / 2;
  }
  get centerX() {
    return this.x + this.halfWidth;
  }
  get centerY() {
    return this.y + this.halfHeight;
  }

  get position() {
    return {x: this.x, y: this.y};
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }
  
  get localBounds() {
    return {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height
    };
  }
  get globalBounds() {
    return {
      x: this.gx,
      y: this.gy,
      width: this.gx + this.width,
      height: this.gy + this.height
    };
  }

  get empty() {
    if (this.children.length === 0) {
      return true;
    } else {
      return false;
    }
  }


  //Center b inside a
  putCenter(b, xOffset = 0, yOffset = 0) {
    let a = this;
    b.x = (a.x + a.halfWidth - b.halfWidth) + xOffset;
    b.y = (a.y + a.halfHeight - b.halfHeight) + yOffset;
  }

  //Position b above a
  putTop(b, xOffset = 0, yOffset = 0) {
    let a = this;
    b.x = (a.x + a.halfWidth - b.halfWidth) + xOffset;
    b.y = (a.y - b.height) + yOffset;
  }

  //Position b to the right of a
  putRight(b, xOffset = 0, yOffset = 0) {
    let a = this;
    b.x = (a.x + a.width) + xOffset;
    b.y = (a.y + a.halfHeight - b.halfHeight) + yOffset;
  }

  //Position b below a
  putBottom(b, xOffset = 0, yOffset = 0) {
    let a = this;
    b.x = (a.x + a.halfWidth - b.halfWidth) + xOffset;
    b.y = (a.y + a.height) + yOffset;
  }

  //Position b to the left of a
  putLeft(b, xOffset = 0, yOffset = 0) {
    let a = this;
    b.x = (a.x - b.width) + xOffset;
    b.y = (a.y + a.halfHeight - b.halfHeight) + yOffset;
  }



  add(...spritesToAdd) {
    spritesToAdd.forEach(sprite => this.addChild(sprite));
  }
  remove(...spritesToRemove) {
    spritesToRemove.forEach(sprite => this.removeChild(sprite));
  }


  get currentFrame() {
    return this._currentFrame;
  }


  get draggable() {
    return this._draggable;
  }
  set draggable(value) {
    if (value === true) {

      //Push the sprite into the draggableSprites array

      draggableSprites.push(this);
      this._draggable = true;
    }


    if (value === false) {
      draggableSprites.splice(draggableSprites.indexOf(this), 1);
    }
  }


  get interactive() {
    return this._interactive;
  }
  set interactive(value) {
    if (value === true) {

      makeInteractive(this);

      buttons.push(this);

      this._interactive = true;
    }
    if (value === false) {
      buttons.splice(buttons.indexOf(this), 1);
      this._interactive = false;
    }
  }
}

/*
Text
*/

class Text extends DisplayObject {
  constructor(
    content = "", 
    font = "12px sans-serif", 
    fillStyle = "red", 
    x = 0,
    y = 0
  ){
    super();
    
    Object.assign(
      this, {content, font, fillStyle, x, y}
    );

    this.textBaseline = "top";

    this.strokeText = "none";
  }

  render(ctx) {
    ctx.font = this.font;
    ctx.strokeStyle = this.strokeStyle;
    ctx.lineWidth = this.lineWidth;
    ctx.fillStyle = this.fillStyle;

    if (this.width === 0) this.width = ctx.measureText(this.content).width;
    if (this.height === 0) this.height = ctx.measureText("M").width;
    ctx.translate(
      -this.width * this.pivotX, 
      -this.height * this.pivotY
    );
    ctx.textBaseline = this.textBaseline;
    ctx.fillText(
      this.content,
      0,
      0
    );
    if (this.strokeText !== "none") ctx.strokeText();    
  }
}

export function text(content, font, fillStyle, x, y) {
  let sprite = new Text(content, font, fillStyle, x, y);

  stage.addChild(sprite);

  return sprite;
}


/*
Group
*/

class Group extends DisplayObject {
  constructor(...spritesToGroup){

    super();

    spritesToGroup.forEach(sprite => this.addChild(sprite));
  }

  addChild(sprite) {
    if (sprite.parent) {
      sprite.parent.removeChild(sprite);
    }
    sprite.parent = this;
    this.children.push(sprite);

    this.calculateSize();
  }

  removeChild(sprite) {
    if(sprite.parent === this) {
      this.children.splice(this.children.indexOf(sprite), 1);

      this.calculateSize();
    } else {
      throw new Error(`${sprite} is not a child of ${this}`);
    }
  }

  calculateSize() {

    if (this.children.length > 0) {

      this._newWidth = 0;
      this._newHeight = 0;

      this.children.forEach(child => {

        if (child.x + child.width > this._newWidth) {

          this._newWidth = child.x + child.width;
        }
        if (child.y + child.height > this._newHeight) {
          this._newHeight = child.y + child.height;
        }
      }); 
      
      this.width = this._newWidth;
      this.height = this._newHeight;
    }
  }
}

export function group(...spritesToGroup) {

  let sprite = new Group(...spritesToGroup);

  stage.addChild(sprite);

  return sprite;
}

/*
Sprite
*/

class Sprite extends DisplayObject {
  constructor(
    source,
    x = 0, 
    y = 0
  ){
    super();

    Object.assign(this, {x, y});

    //image object

    if(source instanceof Image) {
      this.createFromImage(source); 
    }

    //single frame from a texture atlas

    else if (source.frame) {
      this.createFromAtlas(source);
    }

    //collision object in tilemap

    else if(source.id){
      this.createFromTileMap(source);
    }

    //single frame from function frame

    else if (source.image && !source.data) {
      this.createFromTileset(source);
     }

     //array of frames from function frames

    else if (source.image && source.data) {
      this.createFromTilesetFrames(source);
    }

    //array of frames supplied from a texture atlas

    else if (source instanceof Array) {
      if (source[0] && source[0].source) {
        this.createFromAtlasFrames(source);
      }
      else if (source[0] instanceof Image){
      this.createFromImages(source);
      } 
      else {
        throw new Error(`The image sources in ${source} are not recognized`);
      }
    } 
    else {
      throw new Error(`The image source ${source} is not recognized`);
    }
  }


  createFromImage(source) {
    if (!(source instanceof Image)) {
      throw new Error(`${source} is not an image object`);
    } else {
      this.source = source;
      this.sourceX =  0;
      this.sourceY =  0;
      this.width = source.width;
      this.height = source.height;
      this.sourceWidth = source.width;
      this.sourceHeight = source.height;
    }
  }
  createFromAtlas(source) {
    this.tilesetFrame = source; 
    this.source = this.tilesetFrame.source;
    this.sourceX = this.tilesetFrame.frame.x;
    this.sourceY = this.tilesetFrame.frame.y;
    this.width = this.tilesetFrame.frame.w;
    this.height = this.tilesetFrame.frame.h;
    this.sourceWidth = this.tilesetFrame.frame.w;
    this.sourceHeight = this.tilesetFrame.frame.h;
  }

  createFromTileMap(source) {
    this.source = source;
    this.id = source.id;
    this.sourceX = source.x;
    this.sourceY = source.y;
    this.width = source.width;
    this.height = source.height;
    this.sourceWidth = source.width;
    this.sourceHeight = source.height;
  }

  createFromTileset(source) {
    if (!(source.image instanceof Image)) {
      throw new Error(`${source.image} is not an image object`);
    } else {
      this.source = source.image;
      this.sourceX = source.x;
      this.sourceY = source.y;
      this.width = source.width;
      this.height = source.height;
      this.sourceWidth = source.width;
      this.sourceHeight = source.height;
    }
  }
  createFromTilesetFrames(source) {
    if (!(source.image instanceof Image)) {
      throw new Error(`${source.image} is not an image object`);
    } else {
      this.source = source.image;
      this.frames = source.data;
      //Set the sprite to the first frame
      this.sourceX = this.frames[0][0];
      this.sourceY = this.frames[0][1];
      this.width = source.width;
      this.height = source.height;
      this.sourceWidth = source.width;
      this.sourceHeight = source.height;
    }
  }
  createFromAtlasFrames(source) {
    this.frames = source;
    this.source = source[0].source;
    this.sourceX = source[0].frame.x;
    this.sourceY = source[0].frame.y;
    this.width = source[0].frame.w;
    this.height = source[0].frame.h;
    this.sourceWidth = source[0].frame.w;
    this.sourceHeight = source[0].frame.h;
  }


  gotoAndStop(frameNumber) {
    if (this.frames.length > 0 && frameNumber < this.frames.length) {

      //frames made from function frames(), each frame is an array holding coordinate position

      if (this.frames[0] instanceof Array) {
        this.sourceX = this.frames[frameNumber][0];
        this.sourceY = this.frames[frameNumber][1];
      }

      //frames made from multiple frame extract from texture atlas

      else if (this.frames[frameNumber].frame) {
        this.sourceX = this.frames[frameNumber].frame.x;
        this.sourceY = this.frames[frameNumber].frame.y;
        this.sourceWidth = this.frames[frameNumber].frame.w;
        this.sourceHeight = this.frames[frameNumber].frame.h;
        this.width = this.frames[frameNumber].frame.w;
        this.height = this.frames[frameNumber].frame.h;
      }

      else {
        this.source = this.frames[frameNumber];
        this.sourceX = 0;
        this.sourceY = 0;
        this.width = this.source.width;
        this.height = this.source.height;
        this.sourceWidth = this.source.width;
        this.sourceHeight = this.source.height;
      }

      this._currentFrame = frameNumber;
    } 
    else {
      throw new Error(`Frame number ${frameNumber} does not exist`);
    }
  }
  

  render(ctx) {
    ctx.drawImage(
      this.source,
      this.sourceX, this.sourceY,
      this.sourceWidth, this.sourceHeight,
      -this.width * this.pivotX,
      -this.height * this.pivotY,
      this.width, this.height
    );
  }
}

export function sprite(source, x, y) {

  let sprite = new Sprite(source, x, y);

  if (sprite.frames.length > 0) addStatePlayer(sprite);

  stage.addChild(sprite);

  return sprite;
}

/*
Function to bliting frame for 
tileset image (without texture atlas)
*/

// Single frame
export function frame(source, x, y, width, height) {
  var o = {};
  o.image = source;
  o.x = x;
  o.y = y;
  o.width = width;
  o.height = height;
  return o;
};

//Multiple frames

export function frames(source, arrayOfPositions, width, height) {
  var o = {};
  o.image = source;
  o.data = arrayOfPositions;
  o.width = width;
  o.height = height;
  return o;
};

/*
Function to create an array of coordinate points 
of each frame in a tileset used for bliting
*/


export function stripFrames(image, frameWidth, frameHeight, spacing = 0){

  let positions = [];

  //Find out how many columns and rows there are in the image
  let columns = image.width / frameWidth,
      rows = image.height / frameHeight;

  //Find the total number of frames
  let numberOfFrames = columns * rows;

  for(let i = 0; i < numberOfFrames; i++) {


    let x = (i % columns) * frameWidth,
        y = Math.floor(i / columns) * frameHeight;

    if (spacing && spacing > 0) {
      x += spacing + (spacing * i % columns);
      y += spacing + (spacing * Math.floor(i / columns));
    }

    positions.push([x, y]);
  }

  return frames(image, positions, frameWidth, frameHeight);
};

/*
Render function
*/

export function render(canvas) {

  let ctx = canvas.ctx;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  stage.children.forEach(sprite => {

    //Display a sprite 
    displaySprite(sprite);
  });

  function displaySprite(sprite) {

    //Only display the sprite if it's visible
    //and within the area of the canvas
    if (
      sprite.visible
      && sprite.gx < canvas.width + sprite.width
      && sprite.gx + sprite.width >= -sprite.width
      && sprite.gy < canvas.height + sprite.height
      && sprite.gy + sprite.height >= -sprite.height
    ) {

      ctx.save();

      //Shift the canvas to the center of the sprite's position
      ctx.translate(
        sprite.x + (sprite.width * sprite.pivotX),
        sprite.y + (sprite.height * sprite.pivotY)
      );

      //Set the sprite's `rotation`, `alpha` and `scale`
      ctx.rotate(sprite.rotation);
      ctx.globalAlpha = sprite.alpha * sprite.parent.alpha;
      ctx.scale(sprite.scaleX, sprite.scaleY);

      //Display the sprite's optional drop shadow
      if(sprite.shadow) {
        ctx.shadowColor = sprite.shadowColor;
        ctx.shadowOffsetX = sprite.shadowOffsetX;
        ctx.shadowOffsetY = sprite.shadowOffsetY;
        ctx.shadowBlur = sprite.shadowBlur;
      }

      //Display the optional blend mode
      if (sprite.blendMode) ctx.globalCompositeOperation = sprite.blendMode;

      //Use the sprite's own `render` method to draw the sprite
      if (sprite.render) sprite.render(ctx);

      //If the sprite contains child sprites in its
      //`children` array, display them by recursively calling this very same
      //`displaySprite` function again

      if (sprite.children && sprite.children.length > 0) {

        ctx.translate(-sprite.width * sprite.pivotX , -sprite.height * sprite.pivotY);

        sprite.children.forEach(child => {

          displaySprite(child);
        });
      }
      ctx.restore();
    }
  }
}

