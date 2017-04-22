/*
Class to hold all player data
*/

class Player{
	constructor(
		name = "",
		characterId = "",		// name of character sprite
		exp = 0,
		gold = 0,
		house 							// Object holding all Career House objects
	){
		Object.assign(this, {name, characterId, exp, gold, house});
	}

	get exp(){
		return this.exp;
	}
	get gold(){
		return this.gold;
	}
	set exp(value){
		exp += value;
	}
	set gold (value){
		gold += value;
	}
}

/*
Load previous game function
*/

function loadData(){

	let http = new XMLHttpRequest();

	http.open('GET', '../../backend/saveload.php');

	http.setRequestHeader('Content-Type', 'application/json');

	http.onload = function() {

	    if (http.status === 200) {

         try {
         	let playerData = JSON.parse(http.responseText);

         	return playerData;
         } 
         catch (e) {
         	console.log(http.responseText);
         }
	    }
	    else{
	    	console.log("Error in connection to server. Status is" + http.status);
	    }
	};
}

/*
Save game function - input is player object
*/

function saveData(player){

	let http = new XMLHttpRequest();

	let jsonData = json.stringify(player);			//turn player object into json file

	http.open('POST', '../../backend/saveload.php', true);

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
