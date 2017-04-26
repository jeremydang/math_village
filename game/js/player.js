/*
Class to hold all player data
*/

class Player{
	constructor(config){

		this.name = "";

		this.characterId = null;

		this.house = null;

		this.exp = 0;

		this.gold = 0;

		Object.assign(this, config);
	}

	getExp(){
		return this.exp;
	}
	getGold(){
		return this.gold;
	}
	setExp(value){
		if(typeof value === "number"){
			this.exp += value;
		}	
		else{
		  console.log("Wrong type assigning for exp");
		}
	}
	setGold (value){
		if(typeof value === "number"){
			this.gold += value;
		}
		else{
			console.log("Wrong type assigning for gold");
		}
	}
}

export function player(config){
	let player = new Player(config);
	return player;
}

/*
Load previous game data function
*/

export function loadData() {

	return new Promise( resolve => {

		let http = new XMLHttpRequest();

		http.open('GET', '../backend/saveload.php');

		http.setRequestHeader('Content-Type', 'application/json');

		http.onload = function() {

		    if (http.status === 200) {

		        try {
		         	resolve(JSON.parse(http.responseText));
		        }
		        catch (e) {
		         	console.log(http.responseText);
		        }
		    }

		    else{
		    	console.log("Error in connection to server. Status is" + http.status);
		    }
		};

		http.send();
	});
}


/*
Save game function - input is player object
*/

export function saveData(player){

	let http = new XMLHttpRequest();

	let jsonData = JSON.stringify(player);			//turn player object into json file

	http.open('POST', '../backend/saveload.php', true);

	http.setRequestHeader("Content-type", "application/json");

	http.onload = function() {

	    if (http.status === 200) {
	    		if(!http.responseText.trim()){
	    			console.log("Game saved");
	    		}
	    		else{
	    			console.log(http.responseText);
	    		}
	        
	    }
	    else{
	    	console.log("Error in connection to server. Status is" + http.status);
	    }
	};

	http.send(jsonData);
}
