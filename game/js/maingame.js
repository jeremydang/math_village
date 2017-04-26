
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
		"Inn House - where you serve yummy/nfood in the shortest time./n"+
		" And don’t forget to smile !",
		2,
		innFood);

	innHouse.sound = mv.assets["cursor-fx.ogg"];

	cookingHouse = mv.careerhouse(
		cookingFrames, 0, 0,
		"Cooking House",
		"This is where all the food that/ncustomers imagine become true."+
		" We/ntake orders from customers, and/nreward them with delicious dishes.",
		3);

	cookingHouse.sound = mv.assets["cursor-fx.ogg"];

	hospitalHouse = mv.careerhouse(
		hospitalFrames, 0, 0,
		"Hospital House",
		"Siren wailing! Someone needs you at/nHospital House."+
		" Feed them with right/nmedicine and a cheerful spirit./nYou can do it!",
		3);

	hospitalHouse.sound = mv.assets["cursor-fx.ogg"];

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

		tween.onComplete = () => {
			menu();
		};
	});

}

function menu(){

	let menuScene = mv.stage.children.find( element => element.name === "menu");

	if(menuScene){

		menuScene.visible = true;

		menuScene.children.forEach( element => {

			if (element.sound){
				if(element.interactive === false){
					element.interactive = true;
				}
			}
		});

	}
	else{

		mv.stage.removeChild(logo);

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

		let welcomeText = mv.multiText(name, "24px KomikaAxis", "white", 836, 70, 30);


		let menuScene = mv.group (bg,pole, welcomeText, playBtn, helpBtn, settingBtn, creditBtn);

		menuScene.name = "menu";

		mv.stage.addChild(menuScene);

		if (!music.playing) music.play();

		playBtn.release = () => {

			if(player.characterId){

				window.setInterval(function(){

					mv.saveData(player)

				}, 600000);

/*				window.onbeforeunload = () =>{

					mv.saveData(player);

					return "We are saving game data now. Please wait a few seconds and retry.";
				}*/

				menuScene.visible = false;

				menuScene.children.forEach( element => {

					if (element.sound){
						if(element.interactive === true){
							element.interactive = false;
						}
					}
				});

				enterVillage();
			}
			else createCharacter(menuScene);
		};

	}

	
	
}

function createCharacter(menuScene){

	let panel = mv.stage.children.find( element => element.name === "charPanel");

	if(panel){

		panel.visible = true;

		panel.children.forEach( element => {

			if (element.sound){
				if(element.interactive === false){
					element.interactive = true;
				}
			}
		});

	}

	else{

		panel = mv.sprite(mv.assets["rec-panel"]);

		panel.name = "charPanel";

		mv.stage.putCenter(panel);


		let title = mv.text("Create character", "22px KomikaAxis","white", 320, 22);

		let instruct = mv.text("Choose a character that you like !",
		 "18px Georgia", "#24313c", 320, 128);


		let okBtn = mv.button(mv.assets["green-button"], 226, 332);

		okBtn.setSize(190,60);

		okBtn.sound = mv.assets["ok-fx.ogg"];

		okBtn.release = () => {

			player.characterId = currentChar.name;

			window.setInterval(function(){
				
				mv.saveData(player)

			}, 600000);

			window.onbeforeunload = (e) =>{

				mv.saveData(player);

				let dialog = "We are saving game data now. Please wait a few seconds and retry.";

				e.returnValue = dialog;

				return dialog;
			}

			menuScene.visible = false;

			menuScene.children.forEach( element => {

				if (element.sound){
					if(element.interactive === true){
						element.interactive = false;
					}
				}
			});

			panel.visible = false;

			panel.children.forEach( element => {

				if (element.sound){
					if(element.interactive === true){
						element.interactive = false;
					}
				}
			});

			enterVillage();

		}	

		let okText = mv.text("Choose", "20px KomikaAxis","white", 95, 18);

		okBtn.addChild(okText);


		let closeBtn = mv.button(mv.assets["no"], 572, 38);

		closeBtn.sound = mv.assets["cancel-fx.ogg"];

		closeBtn.release = () => {

			panel.visible = false;

			panel.children.forEach( element => {

				if (element.sound){
					if(element.interactive === true){
						element.interactive = false;
					}
				}
			});
		}	


		let backBtn = mv.button(mv.assets["back"], 64, 200);

		backBtn.release = () => {

			let index = charArray.indexOf(currentChar);

			if(index >0){
				index --;
			}
			else index = charArray.length -1;

			currentChar.visible = false;

			currentChar = charArray[index];

			currentChar.visible = true;

		}

		backBtn.sound = mv.assets["cursor-fx.ogg"];


		let nextBtn = mv.button(mv.assets["next"], 516, 200);

		nextBtn.release = () => {
			let index = charArray.indexOf(currentChar);

			if(index < charArray.length -1){
				index ++;
			}
			else index = 0;

			currentChar.visible = false;

			currentChar = charArray[index];

			currentChar.visible = true;

		}

		nextBtn.sound = mv.assets["cursor-fx.ogg"];


		let charArray = [];

		for( let i = 1; i < 6; i ++){

			let charId = "char" + i;

			let charFrames = mv.stripFramesAtlas(
				mv.assets[charId], 
				mv.assets["spritesheet.json"],
				mv.assets["spritesheet.png"], 32, 48);

			let char = mv.character(charFrames, 310, 200, charId);

			char.scaleX = 2;

			char.scaleY = 2;

			char.gotoAndStop(1);

			char.visible = false;

			charArray.push(char);

			panel.addChild(char);
		}

		let currentChar = charArray[0];

		currentChar.visible = true;


		panel.add(title, instruct, okBtn, closeBtn, nextBtn, backBtn);

		mv.stage.addChild(panel);

	}

}

function enterVillage(){

	let villageScene = mv.stage.children.find( element => element.name === "village");

	if(villageScene){

		villageScene.visible = true;

		villageScene.children[0].children.forEach( element => {

			if (element.sound){
				if(element.interactive === false){
					element.interactive = true;
				}
			}
		});

	}
	else{

		let villageMap = mv.map(mv.assets["village-map.json"], mv.assets["village-tile.png"]);

		let villageScene = mv.group(villageMap);

		villageScene.name = "village";


		cookingHouse.setPosition(-29,-15);

		cookingHouse.interactive = false;

		
		innHouse.setPosition(190,200);

		innHouse.interactive = false;


		hospitalHouse.setPosition(465, 0);

		hospitalHouse.offsetY = 170;

		hospitalHouse.offsetX = 170;

		hospitalHouse.interactive = false;


		let currentHouse = null;


		let expBar = mv.sprite(mv.assets["exp-bar"], 17, 0);

		expBar.scaleX = 0.8;

		expBar.scaleY = 0.8;

		let expNode = mv.text(String(player.exp), "18px KomikaAxis", "white", 144, 31);

		expBar.addChild(expNode);


		let goldBar = mv.sprite(mv.assets["gold-bar"], 242, 0);

		goldBar.scaleX = 0.8;

		goldBar.scaleY = 0.8;

		let goldNode = mv.text(String(player.gold), "18px KomikaAxis", "white", 144, 29);

		goldBar.addChild(goldNode);


		let lvBarArray = [];

		for(let i = 1; i < 6; i++){

			let levelBar = mv.sprite(mv.assets["lv"+i], 472, 13);

			levelBar.number = i;

			levelBar.scaleX = 0.8;

			levelBar.scaleY = 0.8;

			levelBar.visible = false;

			lvBarArray.push(levelBar);

		}

		let curLvBar = lvBarArray[0];

		curLvBar.visible = true;

		let pointNode = mv.text("0", "18px KomikaAxis", "white", 136, 15);

		curLvBar.addChild(pointNode);


		careerHouse.forEach( house => {

			if(house.chosen === true){
				if(house.currentLevel){
					lvBarArray.forEach ( bar => {
						if(bar.number === house.currentLevel.number){

							curLvBar.visible = false;

							curLvBar = bar;

							curLvBar.visible = true;
						}
					})
				}

				pointNode.content = String(house.skillPoints);

				pointNode.visible = true;

				currentHouse = house;

			}
			else{
				house.gotoAndStop(2);
			}


			house.over = () => {

				let panel = displayDescription(house, villageScene);

				panel.visible = true;
			};			

			house.out = () => {

				let panel = villageScene.children.find( element => element.name === house.name);

				if(panel) panel.visible = false;
				
			};

			house.doubleClick = () => {

				if(house.chosen === false){

					careerHouse.forEach( allHouse => {
						allHouse.chosen = false;
					})

					house.chosen = true;

					let arrayText = [

					 "You have choose " + house.name + " as your favourite place to be with !/n" +
					 "Double click again to the house to start working now./n" +
					 "If you have made a mistake, you can choose again. Don't worry !"
					];

					villageMap.children.forEach( element => {

						if (element.sound){
							if(element.interactive === true){
								element.interactive = false;
							}
						}
					});


					displayInstruct(villageMap, arrayText, "viInstruct2", true, 0);
				}
				else{

					villageMap.children.forEach( element => {

						if (element.sound){

							if(element.out) element.out();

							if (element.sound){
								if(element.interactive === true){
									element.interactive = false;
								}
							}

						}
					});

					let text = "Are you ready to/nstart your job now?";
					displayConfirm(text, prepareInnHouse, villageMap)
				}


			}

		});

		let backMenuBtn = mv.button(mv.assets["mini-menu"], 880, 13);

		backMenuBtn.setSize(59,61);

		backMenuBtn.release = () => {

			villageScene.visible = false;

			villageMap.children.forEach( element => {

				if (element.sound){
					if(element.interactive === true){
						element.interactive = false;
					}
				}
			});

			menu();

		}

		backMenuBtn.sound = mv.assets["cursor-fx.ogg"];


		let helpBtn = mv.button(mv.assets["question"], 880, 95);

		helpBtn.setSize(59,61);

		helpBtn.release = () => {

			let arrayText = [

			 "Double click a Career House to choose where you will belong to./n" +
			 "If you hover your mouse to each Career House, you will see a nice description/nof them" +
			 " along with their difficulty level."
			];

			villageMap.children.forEach( element => {

				if (element.sound){
					if(element.interactive === true){
						element.interactive = false;
					}
				}
			});


			displayInstruct(villageMap, arrayText, "viInstructShort", false);

		}

		helpBtn.sound = mv.assets["cursor-fx.ogg"];


		villageMap.add(cookingHouse, innHouse, hospitalHouse,
			goldBar, expBar, curLvBar, backMenuBtn, helpBtn);


		if(!currentHouse){

			let arrayText = [
			"Hi from the sky, early birds!/nWe are standing in Math Village," + 
			" where familiar jobs become new.",

			"And don’t worry, new is good!/nSince early waking, early getting," +
			" let’s go and get something cool./nFollow me!",

			 "All you need to do is to choose one career house that you will belong to./n" +
			 "If you hover your mouse to each Career House, you will see a nice description/nof them" +
			 " along with their difficulty level.",

			 "Double click the Career House if you want to choose it./n" +
			 "You can change your choice any time you want.",

			 "In case you get lost, just click the Help icon on the top right of the screen./n" +
			 "I will always be there for you !"
			];

			villageMap.children.forEach( element => {

				if (element.sound){
					if(element.interactive === true){
						element.interactive = false;
					}
				}
			});

			displayInstruct(villageMap, arrayText, "villageInstruct1", true);
		}
		else{

			mv.wait(1000).then ( () => {

				cookingHouse.interactive = true;
				innHouse.interactive = true;
				hospitalHouse.interactive = true;

			})
		}


		mv.stage.addChild(villageScene);

	}


	

}

function displayDescription(house, villageScene){

	let panel = villageScene.children.find( element => element.name === house.name);

	if(panel){
		return panel;
	}

	else{

		let panel = mv.sprite(mv.assets["confirm-panel"]);

		panel.name = house.name;

		panel.height = panel.sourceHeight + 30;

		let houseName = mv.text( house.name, "22px KomikaAxis", "#24313c", panel.width/2, 23);

		let text = mv.multiText(house.description, "17px Georgia", "#24313c", panel.width/2, 63, 22);

		if(house.name === "Cooking House"){

			panel.setPosition(352,36);

		}
		else if( house.name === "Inn House"){

			panel.setPosition(265,122);
		}
		else{

			panel.setPosition(270,36);

		}


		switch(house.difficulty){

			case 3: 

				let star1 = mv.sprite(mv.assets["star-fill"], 0, 160);

				let star2 = mv.sprite(mv.assets["star-fill"], 100, 160);

				let star3 = mv.sprite(mv.assets["star-fill"], 200, 160);


				break;

			case 2:	

				let star1 = mv.sprite(mv.assets["star-fill"], 0, 150);

				let star2 = mv.sprite(mv.assets["star-fill"], 100, 150);

				let star3 = mv.sprite(mv.assets["star-empty"], 200, 150);

				break;

		}

		let star = mv.group(star1, star2, star3);

		star.scaleX = 0.7;

		star.scaleY = 0.7;

		star.x = panel.width/2 - star.width/2;

		panel.add(houseName, text, star);

		panel.visible = false;

		villageScene.addChild(panel);

		return panel;

	}

}

function displayConfirm(text, okMethod, scene){

	let panel = scene.children.find( element => element.name === "confirm");

	if(panel) {

		panel.children.forEach( element => {


			if (element.sound) {
				if(element.interactive === false){
					element.interactive = true;
				}
			}

		});

		panel.visible = true;
	}	

	else{

		let panel = mv.sprite(mv.assets["confirm-panel"]);

		panel.name = "confirm";

		panel.setSize(500,249);


		let yesBtn = mv.button(mv.assets["green-button"], 75, 160);

		yesBtn.setSize(164,58);

		yesBtn.sound = mv.assets["ok-fx.ogg"];

		yesBtn.release = okMethod;

		let yesNode = mv.text("Yes", "22px KomikaAxis", "white", 86, 18);

		yesBtn.addChild(yesNode);


		let noBtn = mv.button(mv.assets["red-button"], 273, 160)

		noBtn.setSize(164,58);

		noBtn.sound = mv.assets["cancel-fx.ogg"];

		let noNode = mv.text("No", "22px KomikaAxis", "white", 86, 18);

		noBtn.addChild(noNode);


		noBtn.release = () => {

			panel.visible = false;

			panel.children.forEach( element => {

				if (element.sound){
					if(element.interactive === true){
						element.interactive = false;
					}
				}
			});

			scene.children.forEach( element => {

				if (element.sound){
					if(element.interactive === false){
						element.interactive = true;
					}
				}
			});
		}

		let confirmText = mv.multiText(text, "24px KomikaAxis", "#24313c", 260, 57, 30);


		panel.add(yesBtn, noBtn, confirmText);

		scene.putCenter(panel);

		scene.addChild(panel);
	}

	

}

function displayInstruct(scene, arrayText, dialogName, firstTime, timeout = 400){

	let dialog = scene.children.find( element => element.name === dialogName);

	if(dialog){

		dialog.visible = true;

		dialog.children.forEach( element => {

			if (element.sound){
				if(element.interactive === false){
					element.interactive = true;
				}
			}
		});

	}
	else{

		let dialog = mv.group();

		dialog.name = dialogName;


		let speechPanel = mv.sprite(mv.assets["speech-panel"]);

		speechPanel.setSize(920, 200);

		scene.putCenter(speechPanel, 0, 200);


		let closeBtn = mv.button(mv.assets["no"]);

		closeBtn.setSize(59,61);

		speechPanel.putTop(closeBtn, 440, 40)

		closeBtn.release = () => {

			dialog.visible = false;

			dialog.children.forEach( element => {

				if (element.sound){
					if(element.interactive === true){
						element.interactive = false;
					}
				}
			});

			scene.children.forEach( element => {

				if (element.sound){
					if(element.interactive === false){
						element.interactive = true;
					}
				}
			});

		}

		closeBtn.sound = mv.assets["cursor-fx.ogg"]; 


		let mentor = mv.sprite(mv.assets["main-mentor"]);

		speechPanel.putTop(mentor, -300, 10);


		let backBtn = mv.button(mv.assets["back"], 776, 544);

		backBtn.setSize(55,57);

		backBtn.release = () => {

			let index = arrayText.indexOf(currentTextRaw);

			if(index > 0){
				index --;
			}

			currentTextRaw = arrayText[index];

			currentText.setContent( currentTextRaw, 56, 40);

			checkButton();

		}

		backBtn.sound = mv.assets["cursor-fx.ogg"];


		let nextBtn = mv.button(mv.assets["next"], 850, 544);

		nextBtn.setSize(55,57);

		nextBtn.release = () => {

			let index = arrayText.indexOf(currentTextRaw);

			if(index < arrayText.length - 1){
				index ++;
			}

			currentTextRaw = arrayText[index];

			currentText.setContent( currentTextRaw, 56, 40);

			checkButton();

		}

		nextBtn.sound = mv.assets["cursor-fx.ogg"];
		

		let currentTextRaw = arrayText[0];


		let currentText = mv.multiText(currentTextRaw, "20px Georgia", "#24313c", 56, 40, 30);

		currentText.setAlign("left");


		speechPanel.addChild(currentText);

		function checkButton(){

			if(currentTextRaw === arrayText[0]){

				if(backBtn.interactive === true) backBtn.interactive = false;

				backBtn.visible = false;

			}
			else if(currentTextRaw === arrayText[arrayText.length - 1]){

				if(nextBtn.interactive === true) nextBtn.interactive = false;

				nextBtn.visible = false;

			}
			else{

				backBtn.visible = true;

				nextBtn.visible = true;

				if(backBtn.interactive === false){
					backBtn.interactive = true;
				}


				if(nextBtn.interactive === false){
					nextBtn.interactive = true;
				}

			}

		};

		checkButton();


		if(firstTime){

			speechPanel.alpha = 0;

			mentor.alpha = 0;

			currentText.alpha = 0;

			nextBtn.interactive = false;

			closeBtn.interactive = false;

			nextBtn.alpha = 0;

			closeBtn.alpha = 0;


			mv.wait(timeout).then( () =>{

				mv.fadeIn(mentor,  30);

				mv.slide(mentor, mentor.x, speechPanel.y - mentor.height, 30);

				mv.fadeIn(speechPanel, 30);

				mv.fadeIn(currentText, 30);

				mv.fadeIn(closeBtn, 30);

				mv.fadeIn(nextBtn, 30);

				mv.assets["warn-fx.wav"].play();

			})
			.then ( () => {

				nextBtn.interactive = true;

				closeBtn.interactive = true;

			});

		}

		dialog.add(mentor, speechPanel, closeBtn, nextBtn, backBtn);

		scene.addChild(dialog);
	}

}

function prepareInnHouse(){

}



