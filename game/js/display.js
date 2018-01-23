

/*INCLUDING: assets object, DisplayObject, Text, multiText(), Group, Sprite, Map, character(), npc(),
 button(), CarrerHouse class, render(), frame(), frames(), stripFrames(), stripFramesAtlas()*/

/*
Asset loader
*/

import {makeSound} from "/~t6dath00/mathvillage/game/js/sound";

import {hitTestPoint} from "/~t6dath00/mathvillage/game/js/collision";

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

    http.open("GET", source);

    http.setRequestHeader('Content-Type', 'application/json');
    
    http.onload = event => {

      if (http.status === 200) {

        let file = JSON.parse(http.responseText);

        file.name = source.split("/").pop();

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

      this[image.name] = image;

      Object.keys(file.frames).forEach(frame => {

        this[frame] = file.frames[frame];

        this[frame].source = image;

        this[frame].name = frame;
      });
      
      loadHandler();
    };

    //Load the tileset image

    let image = new Image();
    image.addEventListener("load", imageLoadHandler, false);
    image.src = imageSource;
    image.name = imageSource.split("/").pop();
  },

  createTileMap(file, source, loadHandler){

    let imageSource = "images/" + file.tilesets.image.replace(/^.*[\\\/]/, '');

    let imageLoadHandler = () => {

      this[image.name] = image;
        
      loadHandler();
    };

    let image = new Image();
    image.addEventListener("load", imageLoadHandler, false);
    image.src = imageSource;
    image.name = imageSource.split("/").pop();
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
  backgroundColor = "black"
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

    this.offsetX = 0;
    this.offsetY = 0;

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

  swapChildren(child1, child2) {
    let index1 = this.children.indexOf(child1),
        index2 = this.children.indexOf(child2);
    if (index1 !== -1 && index2 !== -1) {
      //Swap the indexes
      child1.childIndex = index2;
      child2.childIndex = index1;
      //Swap the array positions
      this.children[index1] = child2;
      this.children[index2] = child1;
    } else {
      throw new Error(`Both objects must be a child of the caller ${this}`);
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

  setSize(w, h) {
    this.width = w;
    this.height = h;
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

      makeInteractive(this, this.offsetX, this.offsetY);

      buttons.push(this);

      this._interactive = true;
    }
    if (value === false) {
      buttons.splice(buttons.indexOf(this), 1);
      this._interactive = false;
    }
  }
}

export let stage = new DisplayObject();

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

    this.align = "center";
  }

  render(ctx) {
    ctx.font = this.font;
    ctx.strokeStyle = this.strokeStyle;
    ctx.lineWidth = this.lineWidth;
    ctx.fillStyle = this.fillStyle;

    if (this.width === 0) this.width = ctx.measureText(this.content).width;
    if (this.height === 0) this.height = ctx.measureText("M").width;

    ctx.textBaseline = this.textBaseline;

    if(this.align === "center"){
      ctx.translate(
        -this.width , 
        -this.height
      );

      ctx.fillText(
        this.content,
        0,
        0
      );
    }
    else if(this.align === "left"){

      ctx.fillText(
        this.content,
        this.x,
        this.y
      );
    }

    if (this.strokeText !== "none") ctx.strokeText();    
  }
}

export function text(content, font, fillStyle, x, y) {
  let sprite = new Text(content, font, fillStyle, x, y);

  return sprite;
}

// Function to create multi line text

export function multiText(content, font= "16px sans-serif", 
  fillStyle = "white", x = 0, y = 0, lineHeight = 1.2) {

  let sprite = new DisplayObject();

  let multiText = [];

  let lines = content.split('/n');

  for( let i = 0; i < lines.length; i ++){

    let text = new Text (lines[i], font, fillStyle, x, y);

    multiText.unshift(text);

    sprite.addChild(text);

    y += lineHeight;

  }

  sprite.content = multiText;

  sprite.x = 0;

  sprite.y = 0;

  Object.assign(sprite, {font, fillStyle, lineHeight});

  sprite.setContent = (newContent, xCoor, yCoor) => {

    sprite.children = [];

    let multiText = [];

    let lines = newContent.split('/n');

    let y = yCoor;

    for( let i = 0; i < lines.length; i ++){

      let text = new Text (lines[i], sprite.font, sprite.fillStyle, xCoor, y);

      text.align = sprite.align;

      sprite.addChild(text);

      multiText.unshift(text);

      y += sprite.lineHeight;

    }
    sprite.content = multiText;
  };

  sprite.setAlign = (align) => {

    sprite.align = align;

    sprite.content.forEach( text => text.align = align);

  };

  
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

  return sprite;
}

/*
Map
*/

class Map extends DisplayObject {
  constructor(
    source,
    img,
    x = 0, 
    y = 0
  ){
    super();

    Object.assign(this, {source, x, y});

    // Map property
    this.row = source.height;
    this.column = source.width;
    this.tileWidth = source.tilewidth;
    this.tileHeight = source.tileheight
    this.width = this.column * this.tileWidth;
    this.height= this.row * this.tileHeight;
    this.layers = source.layers;
    // Collision objects
    this.collisionObj = [];
    this.chairObj = [];

    //Tile set property
    this.tileset = {
      image: img,
      firstgid: source.tilesets.firstgid,
      width: source.tilesets.imagewidth,
      height: source.tilesets.imageheight,
      row: Math.floor(source.tilesets.imageheight / source.tileheight),
      column: Math.floor(source.tilesets.imagewidth / source.tilewidth)
    };
  }

  //Function to get a specific tile from tileset, given the tile index

  getTile(tileId){

    let tile = {
      img: this.tileset.image,
      x: 0,
      y: 0
    }
    let id = tileId - this.tileset.firstgid;
    let idX = Math.floor(id % this.tileset.column);
    let idY = Math.floor(id / this.tileset.column);

    tile.x = (idX * this.tileWidth);
    tile.y = (idY * this.tileHeight);

    return tile;
  }

  render(ctx){

    for( let layerIdx = 0; layerIdx < this.layers.length; layerIdx ++){

      if(this.layers[layerIdx].type !== "tilelayer") continue;

      else{
        let data = this.layers[layerIdx].data;
        let dataLength = data.length;

        for(let tileIdx = 0; tileIdx < dataLength; tileIdx ++){
          let tileId = data[tileIdx];

          if(tileId === 0) continue;

          let tile = this.getTile(tileId);

          let worldX = (-this.width*this.pivotX) + Math.floor(tileIdx % this.column) * this.tileWidth;

          let worldY = (-this.height*this.pivotY) + Math.floor(tileIdx / this.column) * this.tileHeight;

          ctx.drawImage(tile.img, tile.x, tile.y, this.tileWidth, this.tileHeight, 
                                  worldX, worldY, this.tileWidth, this.tileHeight)
        }
      }
    }
  }

  addCollision(){

    for( let layerIdx = 0; layerIdx < this.layers.length; layerIdx ++){

      if(this.layers[layerIdx].type !== "objectgroup") continue;

      else{

        let objects = this.layers[layerIdx].objects;

        if(this.layers[layerIdx].name === "collision"){

          for(let i = 0; i < objects.length; i++){

            let obj = new DisplayObject();

            obj.setSize(objects[i].width, objects[i].height);

            obj.setPosition(objects[i].x, objects[i].y);

            this.collisionObj.push(obj);

          }
        }

        else if(this.layers[layerIdx].name === "chair"){

          for(let i = 0; i < objects.length; i++){

            let obj = new DisplayObject();

            obj.setSize(objects[i].width, objects[i].height);

            obj.setPosition(objects[i].x, objects[i].y);

            this.chairObj.push(obj);
          }
        }
      }
    }
  }
}

export function map(source, image, x, y) {

  let map = new Map(source, image, x, y);

  return map;
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

  return sprite;
}

/*
Character & NPC sprite
*/

class Character extends Sprite{
  constructor(source, x, y, name = ""){

    super(source, x, y);

    Object.assign(this, {name});

    this.states = {
      up: 10,
      left: 4,
      down: 1,
      right: 7,
      walkUp: [9, 11],
      walkLeft: [3, 5],
      walkDown: [0, 2],
      walkRight: [6, 8]
    }

    this.fps = 12;

  }
}

export function character(source, x, y, name) {

  let sprite = new Character(source, x, y);

  addStatePlayer(sprite);

  return sprite;
}

export function npc(source, x, y, fs, moodImg) {

  let sprite = new Character(source, x, y);

  addStatePlayer(sprite);

  sprite.faceset = fs;

  sprite.orders = [];

  sprite.price = 0;

  sprite.moodBar = 100;

  if(moodImg){

    moodImg.forEach( (mood) => {

      let property = mood.name;
      sprite[property] = mood; 

    });

  }

  sprite.moodState = sprite.attentionMood;

  sprite.tasks = {
    enter:false,
    checked: false,
    calculatePrice: false,
    assignSeat: false,
    deliverFood: false,
    end: false
  };

  sprite.increaseMoodBar = () => sprite.moodBar += 20;

  sprite.decreaseMoodBar = () => sprite.moodBar --;

  sprite.updateMoodState = () => {

    if(sprite.tasks.enter){

        if(sprite.tasks.checked === true){

          sprite.moodState.visible = false;

          if(sprite.moodBar >= 80){
            sprite.moodState = sprite.happyMood;
          }
          else if (sprite.moodBar >= 60 && sprite.moodBar < 80){
            sprite.moodState = sprite.neutralMood;
          }
          else if (sprite.moodBar >= 40 && sprite.moodBar < 60){
            sprite.moodState = sprite.annoyMood;
          }
          else{
            sprite.moodState = sprite.angryMood;
          }
        }

        else{
          sprite.moodState = sprite.attentionMood;
        }

        sprite.moodState.visible = true;

        sprite.moodState.play();


      };

    }

    
  
  return sprite;
}



/*
Button
*/

class Button extends Sprite {
  constructor(source, x = 0, y = 0, type = "button", sound) {
    super(source, x, y);
    this.interactive = true;

    Object.assign(this, {type, sound});
  }
}

export function button(source, x, y, type, sound) {
  let sprite = new Button(source, x, y, type, sound);
  return sprite;
}

/*
CareerHouse
*/

class CareerHouse extends Sprite {
  constructor(source, x = 0, y = 0, name, description, difficulty, materials = []) {

    super(source, x, y);

    Object.assign(this, {name,description,difficulty, materials});

    this._chosen = false;

    this._currentLevel = null;

    this._skillPoints = 0 ;

    this.currentFrequency = 1800;

    this.currentRequiredPoints = 300;

  }

  get chosen(){
    return this._chosen;
  }
  set chosen (value){
    if(typeof value === "boolean"){
      this._chosen = value;
    }
    else{
      console.log("Wrong type assigning for chosen");
    }
  }

  get skillPoints(){
    return this._skillPoints;
  }
  set skillPoints(value){
    if(typeof value === "number"){
      this._skillPoints += value;
    }
    else{
      console.log("Wrong type assigning for skill points");
    }
  }

  get currentLevel(){
    return this._currentLevel;
  }

  set currentLevel(level){

      this._currentLevel = level;

  }

  createMaterial(source, price, stock){

    let material = new Sprite(source);

    material.name = source.name.replace(/-/g, " ")

    material.price = price;

    material.stock = stock;

    return material;
  }

  createLevel(number){

    let level = {};

    level.number = number;

    level.materials = [];

    level.maxOrder = level.number + 1;

    const pointsPerDay = 10;

    const stock = 50;


    if(number === 1){

      level.NPCfrequency = this.currentFrequency;

      level.requiredPoints = this.currentRequiredPoints;

      level.pointsPerDay = pointsPerDay;

      level.maxMaterial = 10;

    }
    else{

      level.NPCfrequency = this.currentFrequency - number * 60 ;

      level.requiredPoints = this.currentRequiredPoints + 150 * Math.pow(number, number);

      level.pointsPerDay = pointsPerDay + number;

      level.maxMaterial = number * 7;

    }

    this.currentFrequency = level.NPCfrequency;

    this.currentRequiredPoints = level.requiredPoints;


    let i = 0;

    let previousIdx = [];

    let sameMaterial = false;

    while(i < level.maxMaterial) {

      let materialIdx = randomInt(0, this.materials.length -1);

      for( let i2 = 0; i2 < i; i2 ++){

        if (materialIdx === previousIdx[i2]) {

          sameMaterial = true;

          break;
        }

      }

      if(sameMaterial === false){

        previousIdx.push(materialIdx);

        let price = parseFloat(randomFloat(2,5).toFixed(1));

        let newMaterial = this.createMaterial(this.materials[materialIdx], price, stock);

        level.materials.push(newMaterial);

        i ++;

      }
      else{
        sameMaterial = false;
      }

    }

    return level;


  }
}

export function careerhouse(source, x, y, name, description, difficulty, materials){
  let house = new CareerHouse(source, x, y, name, description, difficulty, materials);

  house.scaleX = 0.6;

  house.scaleY = 0.6;

  house.offsetX = 150;

  house.offsetY = 150;


  return house;
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
Create random number
*/

export let randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export let randomFloat = (min, max) => {
  return min + Math.random() * (max - min);
}


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

export function stripFramesAtlas(image, atlas, sourceImg, frameWidth, frameHeight, spacing = 0){


  let arrayFrames = [];

  //Find out how many columns and rows there are in the image
  let columns = image.frame.w / frameWidth,
      rows = image.frame.h / frameHeight;

  //Find the total number of frames
  let numberOfFrames = columns * rows;

  for(let i = 0; i < numberOfFrames; i++) {

    let x = (i % columns) * frameWidth + image.frame.x,
        y = Math.floor(i / columns) * frameHeight + image.frame.y;

    if (spacing && spacing > 0) {
      x += spacing + (spacing * i % columns);
      y += spacing + (spacing * Math.floor(i / columns));
    }

    let obj = {
      frame : {
        x: x,
        y: y,
        w: frameWidth,
        h: frameHeight
      },
      source: sourceImg
    }

    let objName = image.name + i.toString();

    atlas[frames[objName]] = obj;

    arrayFrames.push(obj);

  }

  return arrayFrames;
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
        
    if (sprite.align && sprite.align === "left") {

      if (sprite.render) sprite.render(ctx);
      
      //If the sprite contains child sprites in its
      //`children` array, display them by recursively calling this very same
      //`displaySprite` function again

      if (sprite.children && sprite.children.length > 0) {
      
        sprite.children.forEach(child => {
      
          displaySprite(child);
        });
      }

    }
    else{

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
};

/*
Function to make sprite interactive
*/

export let buttons = [];

function makeInteractive(o, offsetX, offsetY) {

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

  o.click = 0;

  //The `update` method will be called each frame 
  //inside the game loop
  o.update = (pointer, canvas) => {

    //Figure out if the pointer is touching the sprite
    let hit = pointer.hitTestSprite(o, offsetX, offsetY);

    //Figure out the current state and display suitable frame
    if (pointer.isUp) {

      //Up state - no interaction
      o.state = "up";

      //Show the first image state frame, if this is a `Button` sprite
      if (o instanceof Button) {
        if(o.type === "menu"){
          o.gotoAndStop(0);
        }
        else{
          o.scaleX = 1;
          o.scaleY = 1;
          o.alpha = 1;
        }

      }
      else if(o instanceof CareerHouse){

        if(o.chosen === true){
          o.gotoAndStop(0);
        }
        else{
          o.gotoAndStop(2);
        }
        
      }
    }

    //If the pointer is touching the sprite, figure out
    //if the over or down state should be displayed
    if (hit) {

      //Over state - the sprite is hover over
      o.state = "over";


      if (o instanceof Button) {
        if(o.type === "menu"){
          o.gotoAndStop(1);
        }
        else{
          o.scaleX = 1;
          o.scaleY = 1;
          o.alpha = 0.8;
        }

      }
      else if(o instanceof CareerHouse){
        o.gotoAndStop(1);
      }

      //Down state - the sprite is pressed, active
      if (pointer.isDown) {
        o.state = "down";


        if (o instanceof Button) {
          if(o.type === "menu"){
            o.gotoAndStop(1);
          }
          else{
            o.scaleX = 0.9;
            o.scaleY = 0.9;
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

        o.click ++;

        if (o.release) o.release();

        o.pressed = false;

        o.action = "released";

        if(o.sound) o.sound.play();

        //Call the tap method if the sprite has been tapped
        if (pointer.tapped && o.tap){
          o.tap();
        } 

        //Call the double click method if the sprite has been double click

        setTimeout(function(){
          if(o.click > 1){
            if(o.doubleClick) o.doubleClick();

          }
          o.click = 0;

        }, 300);

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

      if (o.hoverOver || pointer.outCanvas) {
        if (o.out) o.out();
        o.hoverOver = false;
      }


    }
  };
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

  sprite.hasStarted = false;    

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
    if(!sprite.hasStarted){

      reset();

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

      if (!sprite.fps) sprite.fps = 12;
      let frameRate = 1000 / sprite.fps;

      sprite.gotoAndStop(startFrame);

      if(!sprite.playing) {
        timerInterval = setInterval(advanceFrame.bind(this), frameRate);
        sprite.playing = true;
      }

    }
    
  }


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

