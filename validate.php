<?php

	function validateMinLen($input, $length){
		return strlen($input) >= $length;
	}

	function validateMaxLen($input, $length){
		return strlen($input) <= $length;
	}

	function validateText($input, $strict=false){
		if(!$strict){
			return (preg_match("#^[a-zA-Z0-9\_\-\.]+$#", $input));
		}
		else{
			return (preg_match ("#^[a-zA-Z\s]+$#", $input)); 
		}
	}

	function checkExistUsername($username,$conn){

		try{
			$stmt=$conn->prepare("SELECT * FROM UserAccount WHERE username= ?");
			$stmt->execute([$username]);
			return $result = $stmt->fetchColumn();
		}
		catch(PDOException $e) {
			echo "The site database is unavailable right now. Please return later.";
			$error = $e->getMessage();
		    echo "<script>console.log(".$error.")</script>;";
		}
	}

	function validatePassword($username, $pwd, $conn) {
		try{
			$stmt=$conn->prepare("SELECT password FROM UserAccount WHERE username= ?");
			$stmt->execute([$username]);
			$hashedPassword = $stmt->fetchColumn();
			return password_verify($pwd, $hashedPassword);
		}
		catch(PDOException $e) {
			echo "The site database is unavailable right now. Please return later.";
			$error = $e->getMessage();
		    echo "<script>console.log(".$error.");</script>";
		}
	}

	function checkRetypePassword($pwd, $retypeP){
		return $pwd === $retypeP;
	}

	function validateEmail($email){
		return filter_var($email, FILTER_VALIDATE_EMAIL);
	}


	function validateAll($conn, $firstname, $lastname, $username, $pwd, $retypeP, $email, $school = ""){
		$invalidInput = array();

		//validate name: max length, invalid characters

		if(validateMaxLen($firstname,25) && validateMaxLen($lastname,25) ){
			if(!validateText($firstname, true) || !validateText($lastname, true)){ 			//use strict validation
				array_push($invalidInput, array("name" => "Name can only contains letters and whitespace."));
			}
		}
		else{
			array_push($invalidInput, array("name" => "Name must be less than 25 characters."));
		}

		//validate username : max length, existed username, invalid characters

		if(validateMaxLen($username,25)){
			if(validateText($username)){
				if(checkExistUsername($username,$conn)){
					array_push($invalidInput, array("uname" => "Already existed username. Please try another."));
				}
			}
			else{
				array_push($invalidInput, array("uname" => "Username can only contains letters, numbers and underscore."));
			}
		}
		else{
			array_push($invalidInput, array("uname" => "Username must be less than 25 characters."));
		}

		//validate password : min length, max length, retype pwd

		if(validateMaxLen($pwd,50)){
			if(validateMinLen($pwd, 6)){ 			
				if(!checkRetypePassword($pwd, $retypeP)){
					array_push($invalidInput, array("pwd" => "Password mismatch. Please enter again."));
				}
			}
			else{
				array_push($invalidInput, array("pwd" => "Password is too short"));
			}
		}
		else{
			array_push($invalidInput, array("pwd" => "Password must be less than 50 characters."));
		}

		//validate email

		if(validateMaxLen($email,100)){
			if(!validateEmail($email)){
				array_push($invalidInput, array("eml" => "Please enter valid email address."));
			}
		}
		else{
			array_push($invalidInput, array("eml" => "Email must be less than 100 characters."));
		}

		//validate school if specified

		if($school){
			if(!validateMaxLen($school,100)){
				array_push($invalidInput, array("schl" => "School must be less than 100 characters."));
			}
		}

		return $invalidInput;

	}

	function sanitizeInput($input){
		return htmlentities($input, ENT_QUOTES, 'UTF-8');
	}
?>