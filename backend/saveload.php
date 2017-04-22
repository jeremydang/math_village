<?php

	require_once ('connection.php');
	session_start();

	//Ajax request to load game data
	if ($_SERVER['REQUEST_METHOD'] === 'GET') {

		//Figure out if user has logged in
	    if(isset($_SESSION['username'])){
	    	try{
	    		// Get user uid to access statistics table
	    		$stmt=$conn->prepare("SELECT uid,firstname FROM UserAccount WHERE username=?");
	    		$stmt->execute([$username]);
	    		$user = $stmt->fetch(PDO::FETCH_ASSOC);

	    		// If found user in database
	    		if($user){

	    			// Save user uid into session for later use
	    			$_SESSION['uid'] = $user["uid"];

			        try {
			        	//Get game data statistics
			        	$stmt=$conn->prepare("SELECT * FROM Statistics WHERE UserAccount_uid=?");
		    			$stmt->execute([$user["uid"]]);
		    			$result = $stmt->fetch(PDO::FETCH_ASSOC);
	
		    			//If found game data 
	
		    			if($result){
		    				$name = $user["firstname"];
		    				$characterId = $result["CharacterID"];
		    				$exp = $result["Experience"];
		    				$gold = $result["Gold"];
		    				$house = json_decode($result["CareerObject"]);
		    				
		    				$playerData = compact('name', 'characterId', 'exp', 'gold', 'house');
		    				
		    				echo json_encode($playerData);
		    			}

		    			//If no game data found for this user -> initialize 

		    			else{
		    				try {
		    					//Insert user uid into database
					          	$stmt=$conn->prepare("INSERT INTO Statistics(UserAccount_uid) VALUES(?) ");
			    				$stmt->execute([$user["uid"]]);

			    				//Initilize game data
			    				$name = $user["firstname"];
			    				$characterId = NULL;
			    				$exp = 0;
			    				$gold = 0;
			    				$house = NULL;
			    				
			    				$playerData = compact('name', 'characterId', 'exp', 'gold', 'house');
			    				
			    				echo json_encode($playerData);
					        } 
					        catch (PDOException $e) {
				          		echo "The site database is unavailable right now. Please return later.";
				          		$error = $e->getMessage();
				          	    echo "<script>console.log(".$error.")</script>;";
					        }

		    			}
			        } 
			        catch (PDOException $e) {
		        		echo "The site pdatabase is unavailable right now. Please return later.";
		        		$error = $e->getMessage();
		        	    echo "<script>console.log(".$error.")</script>;";
			        }
	    		}
	    		else{
	    			echo "<script>console.log(\"Cannot detect user in database\");</script>";
	    		}
	    	}
	    	catch(PDOException $e) {
	    		echo "The site database is unavailable right now. Please return later.";
	    		$error = $e->getMessage();
	    	    echo "<script>console.log(".$error.")</script>;";
	    	}
	    }
	    else{
	    	echo "You have to log in before playing game";
	    }
	}

	// Ajax request to save game
	else if($_SERVER['REQUEST_METHOD'] === 'POST'){

		if(isset($_SESSION['uid'])){

			//Get and parse json data from game
			$jsonData = file_get_contents('php://input');

			$saveData = json_decode($jsonData,true);

			if($saveData){

				//Store these data in php variable
				$characterId = $saveData["characterId"];
				$exp = $saveData["exp"];
				$gold = $saveData["gold"];
				$house = json_encode($saveData["house"]);

				try {
					//Update game data to database

			      	$stmt=$conn->prepare("UPDATE Statistics SET CharacterId=?, Experience=?, Gold=?, CareerObject=?
			      							WHERE UserAccount_uid=?");
					$stmt->bindValue(1, $characterId);
					$stmt->bindValue(2, $exp, PDO::PARAM_INT);
					$stmt->bindValue(3, $gold, PDO::PARAM_INT);
					$stmt->bindValue(4, $house);
					$stmt->bindValue(5, $_SESSION['uid']);
			    } 
			    catch (PDOException $e) {
			  		echo "The site database is unavailable right now. Please return later.";
			  		$error = $e->getMessage();
			  	    echo "<script>console.log(".$error.")</script>;";
			    }
			}
			else{
				echo "<script>console.log(\"No json data received from server\");</script>";
			}
		}
		else{
			echo "<script>console.log(\"User uid not found in sessions\");</script>";
		}    	
	}
	else{
	  echo "<script>console.log(\"Cannot detect server request method\");</script>";
	}
?>	