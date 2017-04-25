
import {setup} from "js/setup";

let mv = setup(
  960, 640, initialize, 
  [
    "images/gui.json",
    "images/spritesheet.json",
    "images/village-map.json",
    "images/inn-map.json",
    "sounds/menu-bg.ogg",
    "sounds/inn-bg.mp3",
    "sounds/cursor-fx.ogg",
    "sounds/ok-fx.ogg",
    "sounds/cancel-fx.ogg",
    "sounds/coin-fx.ogg",
    "sounds/knock-fx.ogg",
    "sounds/positive-fx.wav",
    "sounds/warn-fx.wav"
  ]
);

mv.start();

let music, careerHouse, innHouse, cookingHouse, hospitalHouse, player;


let logoSource = new Image();

logoSource.src = "../images/mvlogo.png";

let logo = mv.sprite(logoSource);

logo.alpha = 0;

mv.stage.addChild(logo);

mv.stage.putCenter(logo);

mv.fadeIn(logo);


function initialize(){

	music = mv.assets["menu-bg.ogg"];

	music.loop = true;

	//Create career house object and push to array 

	let innFrames = mv.stripFramesAtlas(
		mv.assets["inn-house"], 
		mv.assets["gui.json"],
		mv.assets["gui.png"], 544, 480);

	let cookingFrames = mv.stripFramesAtlas(
		mv.assets["cooking-house"],
		mv.assets["gui.json"],
		mv.assets["gui.png"], 512, 480);

	let hospitalFrames = mv.stripFramesAtlas(
		mv.assets["hospital-house"], 
		mv.assets["gui.json"],
		mv.assets["gui.png"], 608,512);


	let innFood = [ mv.assets["bacon"], mv.assets["baked-potato"], mv.assets["bean-soup"],
				mv.assets["beef-stew"], mv.assets["bingsu"], mv.assets["birdnet-cabbage"],
				mv.assets["bun"], mv.assets["burrito"], mv.assets["cheese-soup"],
				mv.assets["curry"], mv.assets["dimsum"], mv.assets["flan"],
				mv.assets["fondue"], mv.assets["fried-pork-dish"], mv.assets["fried-rice-omelette"],
				mv.assets["frites"], mv.assets["hamburger"], mv.assets["hotdog"],
				mv.assets["hot-fish-soup"], mv.assets["ice-cream"], mv.assets["juice"],
				mv.assets["miso-soup"], mv.assets["noodle"], mv.assets["pasta"],
				mv.assets["pizza"], mv.assets["popcorn"], mv.assets["pudding"],
				mv.assets["rice"], mv.assets["sandwich"], mv.assets["sausage-egg-dish"],
				mv.assets["savory-pancake"], mv.assets["spaghetti"], mv.assets["steak"],
				mv.assets["sundae"], mv.assets["sushi-dish"], mv.assets["sweet-broccoli-stew"],
				mv.assets["sweet-pork-rice"], mv.assets["sweet-salad"], mv.assets["tempura"],
				mv.assets["tempura-rice"], mv.assets["toast"], mv.assets["tomato-salad-bowl"],
				mv.assets["tomato-soup"], mv.assets["vegan-dish"]];


	innHouse = mv.careerhouse(
		innFrames, 0, 0,
		"Inn House",
		"Inn House - where you serve yummy food in the shortest time."+
		"And don’t forget to smile !",
		2,
		innFood);

	cookingHouse = mv.careerhouse(
		cookingFrames, 0, 0,
		"Cooking House",
		"Cooking House - where all the food that customers imagine become true."+
		"We take orders from customers, and reward them with delicious dishes.",
		3);

	hospitalHouse = mv.careerhouse(
		hospitalFrames, 0, 0,
		"Hospital House",
		"Siren wailing! Someone needs you at Hospital House."+
		"Feed them with right medicine and a cheerful spirit. You can do it.",
		3);

	careerHouse = [innHouse, cookingHouse, hospitalHouse];

	//Load user previous game data

	mv.loadData()
	.then( (data) => {

		let playerData = data;

		if (playerData){
			if(!playerData.house){
				playerData.house = careerHouse;
			}

			playerData.gold = Number(playerData.gold);

			playerData.exp = Number(playerData.exp);

			player = mv.player(playerData);

		}
		else{
			console.log("Error in loading player data");
		}

	})
	.then( () => {

		let tween = mv.fadeOut(logo,60);

		tween.onComplete = () => menu();
	});

}

function menu(){

	let bg = mv.sprite(mv.assets["background"]);

	let playBtn = mv.button([mv.assets["play-1"], mv.assets["play-2"]],
	 368,264, "menu", mv.assets["cursor-fx.ogg"]);

	let helpBtn = mv.button([mv.assets["help-1"], mv.assets["help-2"]],
	 368, 328, "menu", mv.assets["cursor-fx.ogg"]);

	let settingBtn = mv.button([mv.assets["setting-1"], mv.assets["setting-2"]],
	 376, 397, "menu", mv.assets["cursor-fx.ogg"]);

	let creditBtn = mv.button([mv.assets["credit-1"], mv.assets["credit-2"]],
	 376, 462, "menu", mv.assets["cursor-fx.ogg"]);

	let pole = mv.sprite(mv.assets["pole"]);

	mv.stage.putCenter(pole, 0, 88);

	let name = "Welcome/n" + player.name.substring(0,6);

	let welcomeText = mv.multiText(name, "24px KomikaAxis", "white", 840, 70, 30);


	let menuScene = mv.group (bg,pole, welcomeText, playBtn, helpBtn, settingBtn, creditBtn);

	mv.stage.addChild(menuScene);

	if (!music.playing) music.play();

	playBtn.release = () => createCharacter();
	
}

function createCharacter(){

	let panel = mv.sprite(mv.assets["rec-panel"]);

	mv.stage.putCenter(panel);


	let title = mv.text("Create character", "24px KomikaAxis","white", 320, 22);

	let charArray = [];

	for( let i = 1; i < 6; i ++){

		let charId = "char" + i;

		let charFrames = mv.stripFramesAtlas(
			mv.assets[charId], 
			mv.assets["spritesheet.json"],
			mv.assets["spritesheet.png"], 32, 48);

		let char = mv.character(charFrames, 310, 200);

		char.scaleX = 2;

		char.scaleY = 2;

		charArray.push(char);
	}

	let currentChar = charArray[0];


	let okBtn = mv.button(mv.assets["green-button"], 116, 332);

	okBtn.setSize(190,60);

	okBtn.sound = mv.assets["ok-fx.ogg"];

	okBtn.release = () => enterVillage();

	let okText = mv.text("Pick", "24px KomikaAxis","white", 95, 15);

	okBtn.addChild(okText);


	let closeBtn = mv.button(mv.assets["red-button"], 334, 332);

	closeBtn.setSize(190,60);

	closeBtn.sound = mv.assets["cancel-fx.ogg"];

	closeBtn.release = () => panel.visible = false;

	let closeText = mv.text("Close", "24px KomikaAxis","white", 95, 15);

	closeBtn.addChild(closeText);



	let backBtn = mv.button(mv.assets["back"], 64, 200);

	backBtn.release = () => {
		let index = charArray.indexOf(currentChar);

		if(index >0){
			index --;
		}
		else index = charArray.length -1;

		panel.removeChild(currentChar);

		currentChar = charArray[index];

		panel.addChild(currentChar);

	}

	okBtn.sound = mv.assets["cursor-fx.ogg"];


	let nextBtn = mv.button(mv.assets["next"], 516, 200);

	nextBtn.release = () => {
		let index = charArray.indexOf(currentChar);

		if(index < charArray.length -1){
			index ++;
		}
		else index = 0;

		panel.removeChild(currentChar);

		currentChar = charArray[index];

		panel.addChild(currentChar);

	}

	okBtn.sound = mv.assets["cursor-fx.ogg"];


	panel.add(title, okBtn, closeBtn, nextBtn, backBtn);

	panel.addChild(currentChar);


	mv.stage.addChild(panel);

	console.log(mv.stage.children);

	console.log(panel.children);

	console.log(mv.assets["spritesheet.json"]);

}

function enterVillage(){

}

