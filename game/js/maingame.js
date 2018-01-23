
import {setup} from "/~t6dath00/mathvillage/game/js/setup";

let mv = setup(
  960, 640, initialize, 
  [
    "images/gui.json",
    "images/spritesheet.json",
    "images/village-map.json",
    "images/inn-map.json",
    "sounds/menu-bg.ogg",
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

let villageMusic, careerHouse, innHouse, cookingHouse, 
hospitalHouse, currentHouse, player, uiBar;

let savedInn, savedHospital, savedCooking, savedHouse;

currentHouse = null;


let logoSource = new Image();

logoSource.src = "../images/mvlogo.png";

let logo = mv.sprite(logoSource);

logo.alpha = 0;

mv.stage.addChild(logo);

mv.stage.putCenter(logo);

mv.fadeIn(logo);


function initialize(){

	villageMusic = mv.assets["menu-bg.ogg"];

	villageMusic.loop = true;

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

	savedInn = {};

	savedHospital = {};

	savedCooking = {};

	//Load user previous game data

	mv.loadData()
	.then( (data) => {

		let playerData = data;

		if (playerData){
			if(playerData.house){

				let house = playerData.house

				Object.assign(innHouse, house[0]);
				Object.assign(hospitalHouse, house[1]);
				Object.assign(cookingHouse, house[2]);

			}

			console.log(innHouse);

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

		if (!villageMusic.playing) {

			villageMusic.play();
		}

		playBtn.release = () => {

			if(player.characterId){

				saving();				

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

			saving();

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

			char.name = charId;

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



		let expBar = mv.sprite(mv.assets["exp-bar"], 17, 0);

		expBar.scaleX = 0.8;

		expBar.scaleY = 0.8;

		let expNode = mv.text(String(player.exp), "18px KomikaAxis", "white", 144, 31);

		expBar.addChild(expNode);

		expBar.node = expNode;


		let goldBar = mv.sprite(mv.assets["gold-bar"], 242, 0);

		goldBar.scaleX = 0.8;

		goldBar.scaleY = 0.8;

		let goldNode = mv.text(String(player.gold), "18px KomikaAxis", "white", 144, 29);

		goldBar.addChild(goldNode);

		goldBar.node = goldNode;


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

		curLvBar.node = pointNode;


		uiBar = mv.group(goldBar, expBar, curLvBar);

		uiBar.goldBar = goldBar;

		uiBar.expBar = expBar;

		uiBar.levelBar = curLvBar;


		careerHouse.forEach( house => {

			if(house.chosen === true){
				if(house.currentLevel){
					lvBarArray.forEach ( bar => {
						if(house.currentLevel.number === bar.number){

							curLvBar.visible = false;

							curLvBar = bar;

							curLvBar.visible = true;
						}
					})
				}

				pointNode.content = String(house.skillPoints);

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

					house.gotoAndStop(0);

					currentHouse = house;

					if(house.currentLevel){
						lvBarArray.forEach ( bar => {
							if(house.currentLevel.number === bar.number){

								curLvBar.visible = false;

								curLvBar = bar;

								curLvBar.visible = true;
							}
						})
					}

					pointNode.content = String(house.skillPoints);

					if(!villageMap.children.find( element => element.name === "viInstruct2")){

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

						displayInstruct(villageMap, arrayText, "viInstruct2", true, 0, mv.assets["main-mentor"]);

					}
					
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
					displayConfirm(text, prepareHouse, villageMap)
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


			displayInstruct(villageMap, arrayText, "viInstructShort", false, 0, mv.assets["main-mentor"]);

		}

		helpBtn.sound = mv.assets["cursor-fx.ogg"];


		villageMap.add(cookingHouse, innHouse, hospitalHouse,
			uiBar, backMenuBtn, helpBtn);


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

			displayInstruct(villageMap, arrayText, "villageInstruct1", true, 400, mv.assets["main-mentor"]);
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

let star1, star2, star3;

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

				star1 = mv.sprite(mv.assets["star-fill"], 0, 160);

				star2 = mv.sprite(mv.assets["star-fill"], 100, 160);

				star3 = mv.sprite(mv.assets["star-fill"], 200, 160);


				break;

			case 2:	

				star1 = mv.sprite(mv.assets["star-fill"], 0, 150);

				star2 = mv.sprite(mv.assets["star-fill"], 100, 150);

				star3 = mv.sprite(mv.assets["star-empty"], 200, 150);

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

		let yesNode = mv.text("Yes", "22px KomikaAxis", "white", 86, 18);

		yesBtn.addChild(yesNode);

		yesBtn.release = () =>{

			panel.visible = false;

			panel.children.forEach( element => {

				if (element.sound){
					if(element.interactive === true){
						element.interactive = false;
					}
				}
			});

			scene.visible = false;

			okMethod();
		}


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

		let confirmText = mv.multiText(text, "22px KomikaAxis", "#24313c", 260, 50, 35);


		panel.add(yesBtn, noBtn, confirmText);

		scene.putCenter(panel);

		scene.addChild(panel);
	}

	

}

function displayInstruct(scene, arrayText, dialogName, firstTime, timeout = 400, frameMentor){

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

		return new Promise(resolve => {

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

				resolve();

			}

			closeBtn.sound = mv.assets["cursor-fx.ogg"]; 


			let mentor = mv.sprite(frameMentor);

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

				if(arrayText.length <= 1){

					if(nextBtn.interactive === true) nextBtn.interactive = false;

					nextBtn.visible = false;

					if(backBtn.interactive === true) backBtn.interactive = false;

					backBtn.visible = false;

				}
				else{

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


		});

		
		
	}

}

let innScene, houseMap, character, shortInstruct = [], 
npcArray = [], currentLevel, sceneBound, dialogArray, moodArray;


let timeTick = 0,
npcTick = 900, 
startTick = 0,
startTime = 8,
endTime = 17;




function prepareHouse(){

	switch(currentHouse.name){

		case "Inn House":
			houseMap = mv.map(mv.assets["inn-map.json"], mv.assets["restaurant-tile.png"]);

			houseMap.addCollision();

			break;

		case "Hospital House":

		case "Cooking House":	
	}

	if(!houseMap) return;

	else{

		innScene = mv.group();


		let cupboard = mv.button(mv.assets["cupboard2"], 192, 105);

		if(cupboard.interactive === false){
			cupboard.interactive = true;
		}

		cupboard.release = () => {
			displayOrder ();
		}

		cupboard.sound = mv.assets["cursor-fx.ogg"];
		

		innScene.cupboard = cupboard;


		let clockBar = mv.sprite(mv.assets["clock"], 687, 13);

		let clockNode = mv.text("08:00", "18px KomikaAxis", "white", 85, 15);

		clockBar.scaleX = 0.85;

		clockBar.scaleY = 0.85;

		clockBar.addChild(clockNode);

		clockBar.clockNode = clockNode;

		uiBar.addChild(clockBar);

		uiBar.clockBar = clockBar;


		let backMenuBtn = mv.button(mv.assets["mini-menu"], 895, 13);

		backMenuBtn.setSize(55,55);

		backMenuBtn.release = () => {

			let confirmText = "Are you sure you want to quit?/nYour points will be lost."

			innScene.children.forEach( element => {

				if (element.sound){
					if(element.interactive === true){
						element.interactive = false;
					}
				}
			});

			displayConfirm(confirmText, backtoMenu, innScene);

			function backtoMenu (){

				innScene.visible = false;

				innScene.children.forEach( element => {

					if (element.sound){
						if(element.interactive === true){
							element.interactive = false;
						}
					}
				});

				menu();
			}

		} 

		backMenuBtn.sound = mv.assets["cursor-fx.ogg"];


		let helpBtn = mv.button(mv.assets["question"], 895, 85);

		helpBtn.setSize(55,55);

		helpBtn.release = () => {

			if(shortInstruct.length > 0){

				innScene.children.forEach( element => {

					if (element.sound){
						if(element.interactive === true){
							element.interactive = false;
						}
					}
				});

				displayInstruct(innScene, shortInstruct, "viInstructShort", false, 0, mv.assets["main-mentor"]);

			}

		}

		helpBtn.sound = mv.assets["cursor-fx.ogg"];


		let inventoryBtn = mv.button(mv.assets["info"], 895, 155);

		inventoryBtn.setSize(55,55);

		inventoryBtn.release = () => {

			if(shortInstruct.length > 0){

				innScene.children.forEach( element => {

					if (element.sound){
						if(element.interactive === true){
							element.interactive = false;
						}
					}
				});


				displayInventory();

			}

		}

		inventoryBtn.sound = mv.assets["cursor-fx.ogg"];



		let charId = player.characterId;

		let charFrames = mv.stripFramesAtlas(
			mv.assets[charId], 
			mv.assets["spritesheet.json"],
			mv.assets["spritesheet.png"], 32, 48);


		character = mv.character(charFrames, 256, 200, charId);

		character.scaleX = 1.2;

		character.scaleY = 1.2;

		character.show(character.states.down);



		dialogArray = mv.group();

		moodArray = mv.group();

		innScene.add(houseMap, uiBar, cupboard, character, backMenuBtn, helpBtn, 
			inventoryBtn, dialogArray, moodArray);

		innScene.calculateSize();



		let leftKey = mv.keyboard(65),
		      upKey = mv.keyboard(87),
		      rightKey = mv.keyboard(68),
		      downKey = mv.keyboard(83);

		  leftKey.press = function() {
		    character.playSequence(character.states.walkLeft);
		    character.vx = -5;
		    character.vy = 0;
		  };

		  leftKey.release = function() {
		    if (!rightKey.isDown && character.vy === 0) {
		      character.vx = 0;
		      character.show(character.states.left);
		    }
		  };

		  upKey.press = function() {
		    character.playSequence(character.states.walkUp);
		    character.vy = -5;
		    character.vx = 0;
		  };

		  upKey.release = function() {
		    if (!downKey.isDown && character.vx === 0) {
		      character.vy = 0;
		      character.show(character.states.up);
		    }
		  };

		  rightKey.press = function() {
		    character.playSequence(character.states.walkRight);
		    character.vx = 5;
		    character.vy = 0;
		  };

		  rightKey.release = function() {
		    if (!leftKey.isDown && character.vy === 0) {
		      character.vx = 0;
		      character.show(character.states.right);
		    }
		  };

		  downKey.press = function() {
		    character.playSequence(character.states.walkDown);
		    character.vy = 5;
		    character.vx = 0;
		  };

		  downKey.release = function() {
		    if (!upKey.isDown && character.vx === 0) {
		      character.vy = 0;
		      character.show(character.states.down);
		    }
		  };

		if(!currentHouse.currentLevel){

		  	currentHouse.currentLevel = currentHouse.createLevel(1);
		  }

	  	currentLevel = currentHouse.currentLevel;


	  	

	  	sceneBound = mv.group();

	  	sceneBound.setSize(mv.stage.width -64, mv.stage.height -32);

	  	sceneBound.setPosition(32,96);

	  	// npcTick = currentLevel.NPCfrequency;


	  	mv.stage.addChild(innScene);

	  	if(player.gold === 0){

	  		let arrayText = [
	  		"Hi, " + player.name + "! Welcome to Inn House !" + 
	  		"/nAs you are new here, I will be your mentor.",

	  		"First, to move your character, use the W A S D key./n" +
	  		"Then, your job is to serve the customers./n"+
	  		"When they come in, click at them to get their orders./n",

	  		"After that, click the Calculate button to calculate how much/n"+
	  		" the customers have to pay. You can do it many times, but be sure to be quick./n",

	  		"If the customer's mood turns to angry state, they will leave the house./n" +
	  		"The more customers you serve, the more gold and skill points you will get.",

	  		"If you need any help, just click the Help icon on the top right of the screen./n" +
	  		"I will be right there.",

	  		 "Now let's welcome our first customer./n" +
	  		 "You will get used to the job soon !"
	  		];

	  		innScene.children.forEach( element => {

	  			if (element.sound){
	  				if(element.interactive === true){
	  					element.interactive = false;
	  				}
	  			}
	  		});

	  		displayInstruct(innScene, arrayText, "innInstruct", true, 0,  mv.assets["inn-mentor"]).then( () =>{
	  			mv.state = innGame;
	  		})
		}
		else{
			mv.state = innGame;
		}


	}

}




function innGame(){

	character.x += character.vx;

	character.y += character.vy;

	mv.contain(character, sceneBound);

	for(let i = 0; i < houseMap.collisionObj.length; i ++){
		mv.rectangleCollision(character,  houseMap.collisionObj[i]);
	}

	if(startTick > 60){

		if(timeTick === 1800){

			if(startTime < endTime){

				startTime ++;

				if(startTime < 10){
					uiBar.clockBar.clockNode.content = "0" + startTime + ":00";
				}
				else{
					uiBar.clockBar.clockNode.content = startTime + ":00";
				}

				timeTick = 0;

			}

		}

		if(npcTick === 900){

			let npc = createNPC();

			npcArray.push(npc);

			npcTick = 0;

		}

		timeTick ++;

		npcTick ++;
	}

	else{
		startTick ++;
	}

	for(let i = 0; i < npcArray.length; i ++){

		let npc = npcArray[i];

		if(!npc.tasks.enter){

			if(npc.x < 256){

				if( i > 0){
					let collision = mv.hitTestRectangle(npc, npcArray[i-1]);
 
					if(collision){
						npc.vx = 0;
						npc.show(npc.states.up)

						npc.hasStarted = false;
					}
					else{
						npc.playSequence(npc.states.walkRight);

						npc.hasStarted = true;

						npc.vx = 2;
						npc.vy = 0;
					}
				}
				else{
					npc.playSequence(npc.states.walkRight);

					npc.hasStarted = true;

					npc.vx = 2;
					npc.vy = 0;
				}

			}
			else{

				if(npc.y === 320) npc.hasStarted = false;

				if(npc.y > 288 ){

					if( i > 0){
						let collision = mv.hitTestRectangle(npc, npcArray[i-1]);

						if(collision){
							npc.vy = 0;

							npc.show(npc.states.up);

							npc.hasStarted = false;
						}
						else{

							npc.playSequence(npc.states.walkUp);

							npc.hasStarted = true;

							npc.vy = -2;
							npc.vx = 0;
						}
					}
					else{

						npc.playSequence(npc.states.walkUp);

						npc.hasStarted = true;

						npc.vy = -2;
						npc.vx = 0;
					}

				}
				else{

					npc.show(npc.states.up);
					npc.vx = 0;
					npc.vy = 0;

					npc.tasks.enter = true;

					window.setInterval(npc.decreaseMoodBar, 1000);
				}
			}
		}
		else if(npc.tasks.enter && !npc.tasks.checked){

			if(npc.interactive === false){
				npc.interactive = true;
			}

			npc.release = () => {

				innScene.children.forEach( element => {

					if (element.sound){
						if(element.interactive === true){
							element.interactive = false;
						}
					}
				});

				displayDialog(npc.orderText, npc , npc.name, 
					innScene, "Calculate", displayCalculation );

				mv.assets["warn-fx.wav"].play();

				npc.tasks.checked = true;


			}

		}
		else if(npc.tasks.calculatePrice && !npc.tasks.end){

			let dialog2 = displayDialog(npc.endText, npc , npc.name + "end", 
					innScene);

			if(!npc.tasks.assignSeat){

				mv.assets["warn-fx.wav"].play();

				mv.assets["coin-fx.ogg"].play();

				let curGold = Number(uiBar.goldBar.node.content) ;

				curGold += npc.price;

				uiBar.goldBar.node.content = curGold;

				player.gold += npc.price;

				npc.tasks.assignSeat = true;

			}


				mv.fadeOut(dialog2, 60);

				mv.fadeOut(npc.moodState, 60);

				let tween = mv.fadeOut(npc, 60);

				tween.oncomplete = () =>{

					npc.setPosition(-50, 320);
				}

				npcArray.splice(npcArray.indexOf(npc), 1);

				npc.tasks.end = true;


		}


		npc.x += npc.vx;

		npc.y += npc.vy;

		npc.moodState.setPosition(npc.x, npc.y -50);

		npc.updateMoodState();

	}




}

function createNPC(){

	let name = ["Sam","Addison","Felix","Jackie","Alexis",
				"Bailey","Casey","Connor","Dakota","Dallas",
				"Devon","Evan","Harley","Jade","Jamie",
				"Jan","Jessie","Jude","Julian","Jordan",
				"Delta", "Kendall", "Kim", "Lesley", "Paris",
				"Madison", "Barney", "Marley" , "Riley", "Robin",
				"Ryan", "Regan", "Skye", "Sage", "Silver",
				"Taylor", "Terry", "Tyler", "Zane", "June",
				"April", "Avery", "Chris", "Corey", "Corbin",
				"Cyan", "Devon", "Drew", "Norris", "Noa"] ;

	let orderText = ["Hello, I would like to take ",
					"Good morning, please give me ",
					"Hi, today I want ",
					"Morning, do you have ?",
					"Hi, I want to order ",
					"Hi, how are you? I want ",
					"Hello, I will take ",
					"Good morning, I am thinking of ",
					"Please, I need ",
					"Hi, I would prefer "];

	let annoyText = ["Hurry up. I can’t stand here all day!",
					"Come one. I don’t have a whole day to wait.",
					"I’m pissed. Bring me my food!",
					"What takes you so long? Hurry up!",
					"What a service! I can’t stand it.",
					"I’m running out of time. Quick quick!",
					"Be on your toe! Hurry up !",
					"I’m really late. Please hurry!",
					"Where is my food? What are you doing?",
					"So terrible! I have enough!"];

	let endText = ["Thanks for your service. Have a nice day.",
					"Thanks, have a nice day.",
					"You make my day. Thanks.",
					"Thank you. Goodbye.",
					"Yummy, yummy. Thanks a lot.",
					"Thank you. You are very nice. I will come again.",
					"Thank you.",
					"Good job. Many thanks.",
					"Thanks a lot. Good bye.",
					"I love the smell. Yummy. Thank you very much."] ;

	let textRandomNum = mv.randomInt(0, 9)	;

	let nameRandomNum = mv.randomInt(0, name.length-1);	

	let moodSprite = [];


	let moodImg = [mv.assets["happyMood"], mv.assets["neutralMood"],
	mv.assets["annoyMood"], mv.assets["angryMood"], mv.assets["attentionMood"]];


	moodImg.forEach( (source) => {

		let moodFrame = mv.stripFramesAtlas(
			source, 
			mv.assets["gui.json"],
			mv.assets["gui.png"], 48, 48);

		let mood = mv.sprite(moodFrame);

		mood.name = source.name;

		mood.fps = 8;

		mood.visible = false;

		moodArray.addChild(mood);

		moodSprite.push(mood);

	});


	let npcRandomNum = mv.randomInt(1, 16)		

	let npcId = "npc" + npcRandomNum + "-sprite";

	let npcFrame = mv.stripFramesAtlas(
	  			mv.assets[npcId], 
	  			mv.assets["spritesheet.json"],
	  			mv.assets["spritesheet.png"], 32, 48);
	
	let faceId = "npc" + npcRandomNum + "-face"	;

	let faceFrame = mv.stripFramesAtlas(
	  			mv.assets[faceId], 
	  			mv.assets["spritesheet.json"],
	  			mv.assets["spritesheet.png"], 96, 96);

	let faceset = mv.sprite(faceFrame);  				


	let npc = mv.npc(npcFrame, -30, 320, faceset, moodSprite);


	npc.sound = mv.assets["cursor-fx.ogg"];

	innScene.addChild(npc);

	npc.show(npc.states.left);

	npc.name = name[nameRandomNum];

	npc.scaleX = 1.2;

	npc.scaleY = 1.2;

	npc.orderText = orderText[textRandomNum];

	npc.annoyText = annoyText[textRandomNum];

	npc.endText = endText[textRandomNum];




	for(let i = 0; i <2; i ++) {

		let orderRandomNum = mv.randomInt(0, currentLevel.materials.length -1);

		let orderQuantity = mv.randomInt(1, currentLevel.maxOrder);

		let order = mv.group();

		Object.assign(order, currentLevel.materials[orderRandomNum]);

		order.quantity = orderQuantity;

		order.id = orderRandomNum;

		npc.price += order.price * orderQuantity;

		npc.orders.push(order);

		npc.orderText += orderQuantity + " " + order.name + ", ";

	}

	npc.price = parseFloat(npc.price.toFixed(1));

	npc.orderText = npc.orderText.slice(0, npc.orderText.length - 2);

	return npc;

}

function displayDialog(text, npc, dialogName, scene, buttonNode, method){

	let dialog = dialogArray.children.find( element => element.name === dialogName);

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

		speechPanel.setSize(896, 192);

		scene.putCenter(speechPanel, 0, 193);


		let faceset = npc.faceset

		faceset.setSize(140,140);

		speechPanel.putCenter(faceset, -320, 0);

		if(npc.moodBar < 40) npc.faceset.gotoAndStop(1);


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


		let dialogText = mv.text(text, "22px Georgia", "#24313c", 268, 460);

		dialogText.align = "left";


		dialog.add(speechPanel, closeBtn, npc.faceset, dialogText);


		if(buttonNode && method){

			let actionBtn = mv.button(mv.assets["yellow-button"], 704, 528);

			actionBtn.setSize(164,58);

			actionBtn.sound = mv.assets["ok-fx.ogg"];


			let actionNode = mv.text(buttonNode, "22px KomikaAxis", "white", 86, 18);

			actionBtn.addChild(actionNode);

			actionBtn.release = () =>{

				dialog.children.forEach( element => {

					if (element.sound){
						if(element.interactive === true){
							element.interactive = false;
						}
					}
				});

				method(dialog, npc);
			}

			dialog.addChild(actionBtn);

		}

		dialogArray.addChild(dialog);

		return dialog;

	}	

}

function displayCalculation(dialog, npc){


	let panel = innScene.children.find( element => element.name === npc.name + "panel");

	if(panel) {

		panel.children.forEach( element => {


			if (element.sound) {
				if(element.interactive === false){
					element.interactive = true;
				}
			}

		});

		panel.visible = true;

		let guisystem = new CASTORGUI.GUIManager(mv.canvas);

		let optionsInput = 
		{w: 373,
		 h: 25, 
		 x: 268, 
		 y: 242,
		 placeholder: "  Enter your calculation here..",
		 zIndex: 1000};

		 let input = new CASTORGUI.GUITextfield("input", optionsInput, guisystem);

	}	

	else{

		let panel = mv.sprite(mv.assets["confirm-panel"]);

		panel.name = npc.name + "panel";

		panel.setSize(500,249);


		let closeBtn = mv.button(mv.assets["no"]);

		closeBtn.setSize(50,50);

		panel.putTop(closeBtn, panel.width/2 - closeBtn.width/2 + 15, closeBtn.height/2 + 20)

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

			input.dispose();

			dialog.children.forEach( element => {

				if (element.sound){
					if(element.interactive === false){
						element.interactive = true;
					}
				}
			});
		}

		let priceNode = "Let's calculate how much the customer has to pay:/n";

		npc.orders.forEach( order => {
			priceNode += "each " + order.name + " will cost " + order.price + " euros,/nand "
		})

		priceNode = priceNode.slice(0, priceNode.length - 8);

		priceNode += "/nWhen you finish, press the Enter key."

		let textPrice = mv.multiText(priceNode, "18px Georgia", "#24313c", 40, 32, 25);

		textPrice.setAlign("left");


		let guisystem = new CASTORGUI.GUIManager(mv.canvas);

		let optionsInput = 
		{w: 373,
		 h: 25, 
		 x: 268, 
		 y: 242,
		 placeholder: "  Enter your calculation here.."};

		let input = new CASTORGUI.GUITextfield("input", optionsInput, guisystem);


		let enterKey = mv.keyboard(13);

		let firstCode = 48;

		let value = "";

		for(let i = 0; i < 10; i++){

			let numberKey = mv.keyboard(firstCode);

			numberKey.number = i;

			numberKey.press = () =>{

				value += String(numberKey.number);
				input.setValue(value);
			}

			firstCode ++;
		}

		let periodKey = mv.keyboard (190);

		periodKey.string = ".";

		periodKey.press = () => {
			value += periodKey.string;
			input.setValue(value);
		}

		let backspaceKey = mv.keyboard(8);

		backspaceKey.press = () => {
			if(value.length > 0){
				value = value.slice(0, value.length - 1);
				input.setValue(value);
			}
			
		}


		let incorrectNode = mv.text(
			"Incorrect answer. Please try again.", 
			"16px Georgia", "red", 40, 192);

		incorrectNode.align = "left";

		panel.add(closeBtn, textPrice);

		innScene.putCenter(panel, 0, -100);

		innScene.addChild(panel);

		incorrectNode.visible = false;



		enterKey.press = () => {
			if(input.getValue()){
				let value = parseFloat(input.getValue());

				console.log(value);

				console.log(npc.price);

				if(value !== npc.price){

					incorrectNode.visible = true;

					mv.assets["warn-fx.wav"].play();

				}
				else{
					panel.visible = false;

					dialog.visible = false;

					incorrectNode.visible = false;


					panel.children.forEach( element => {

						if (element.sound){
							if(element.interactive === true){
								element.interactive = false;
							}
						}
					});

					input.dispose();


					npc.tasks.calculatePrice = true;


				}
			}
			
		}
	}

	

	
}

function displayInventory(){

}

function displayOrder(){

}



function saving(){

	window.setInterval(function(){

		Object.assign(savedInn, {
					chosen : innHouse.chosen, 
					currentLevel: innHouse.currentLevel,
					skillPoint: innHouse.skillPoints, 
					currentFrequency: innHouse.currentFrequency, 
					currentRequiredPoints: innHouse.currentRequiredPoints}
					);

				Object.assign(savedHospital, {
					chosen : hospitalHouse.chosen, 
					currentLevel: hospitalHouse.currentLevel,
					skillPoint: hospitalHouse.skillPoints, 
					currentFrequency: hospitalHouse.currentFrequency, 
					currentRequiredPoints: hospitalHouse.currentRequiredPoints}
					);

				Object.assign(savedCooking, {
					chosen : cookingHouse.chosen, 
					currentLevel: cookingHouse.currentLevel,
					skillPoint: cookingHouse.skillPoints, 
					currentFrequency: cookingHouse.currentFrequency, 
					currentRequiredPoints: cookingHouse.currentRequiredPoints}
					);

		savedHouse = [savedInn, savedHospital, savedCooking]

		player.house = savedHouse;

		mv.saveData(player);

		console.log(savedHouse);

	}, 30000);

	window.onbeforeunload = () =>{

		Object.assign(savedInn, {
			chosen : innHouse.chosen, 
			currentLevel: innHouse.currentLevel,
			skillPoint: innHouse.skillPoints, 
			currentFrequency: innHouse.currentFrequency, 
			currentRequiredPoints: innHouse.currentRequiredPoints}
			);

		Object.assign(savedHospital, {
			chosen : hospitalHouse.chosen, 
			currentLevel: hospitalHouse.currentLevel,
			skillPoint: hospitalHouse.skillPoints, 
			currentFrequency: hospitalHouse.currentFrequency, 
			currentRequiredPoints: hospitalHouse.currentRequiredPoints}
			);

		Object.assign(savedCooking, {
			chosen : cookingHouse.chosen, 
			currentLevel: cookingHouse.currentLevel,
			skillPoint: cookingHouse.skillPoints, 
			currentFrequency: cookingHouse.currentFrequency, 
			currentRequiredPoints: cookingHouse.currentRequiredPoints}
			);

		savedHouse = [savedInn, savedHospital, savedCooking]

		player.house = savedHouse;

		mv.saveData(player);

		console.log(savedHouse);

		return "We are saving game data now. Please wait a few seconds and retry.";
	}

}