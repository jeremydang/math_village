<?php

	require_once ('connection.php');
	require_once ('validate.php');

	if (isset($_POST["formname"])) {				// AJAX submit the full form

		switch($_POST["formname"]){				// figure out which form it is submitted

			case "login":
				if(!empty($_POST["username"]) && !empty($_POST["password"])){
					$username = sanitizeInput($_POST["username"]);
					$pwd = sanitizeInput($_POST["password"]);
				
					if(checkExistUsername($username,$conn)){
						if(validatePassword($username,$pwd, $conn)){

							session_start();					//save user to
							$_SESSION['id']=session_id();
							$_SESSION['username'] = $username;

							$conn = null;						// close connection to database
						}
						else{
							echo "Password is incorrect. Please enter again.";
						}
					}
					else{
						echo "Username is incorrect. Please enter again.";
					}
				}
				else{
					echo "Please enter valid username or password.";
				}
			break;

			case "signupIdv":

				if(!empty($_POST["firstname"]) && !empty($_POST["lastname"]) &&
					!empty($_POST["username"]) && !empty($_POST["password"]) &&
					!empty($_POST["retypeP"]) && !empty($_POST["email"])) 
				{
					$firstname = sanitizeInput($_POST["firstname"]);
					$lastname = sanitizeInput($_POST["lastname"]);
					$username = sanitizeInput($_POST["username"]);
					$pwd = sanitizeInput($_POST["password"]);
					$retypeP = sanitizeInput($_POST["retypeP"]);
					$email = sanitizeInput($_POST["email"]);
				
					if(!empty($_POST["school"])){		// if user specify school
						$school = sanitizeInput($_POST["school"]);
						$invalidInput = validateAll($conn, $firstname, $lastname, $username, $pwd, $retypeP, $email, $school);

						if (count($invalidInput) === 0){			//no error -> put data to database
							try{

								$hashedPassword = password_hash($pwd, PASSWORD_DEFAULT);	//hash password

								$stmt = $conn->prepare ("INSERT INTO UserAccount (username, password, firstname, lastname,
														 email, school) VALUES (:username, :password, :firstname, :lastname,
														 :email, :school)");

								$stmt->bindParam(':username', $username);
								$stmt->bindParam(':password', $hashedPassword);
								$stmt->bindParam(':firstname', $firstname);
								$stmt->bindParam(':lastname', $lastname);
								$stmt->bindParam(':email', $email);
								$stmt->bindParam(':school', $school);

								$stmt->execute();

								$conn = null;
								/*not return anything, giving sign to JS that sign up is successful. JS will do the
								part displaying message*/
							}
							catch(PDOException $e) {
								echo "The site database is unavailable right now. Please return later.";
								$error = $e->getMessage();
							    echo "<script>console.log(".$error.");</script>";
							}
						}
						else{
							echo json_encode($invalidInput);		//send error array to JS
						}
					}
					else{
						$invalidInput = validateAll($conn ,$firstname, $lastname, $username, $pwd, $retypeP, $email);

						if (count($invalidInput) === 0){			//no error -> put data to database
							try{

								$hashedPassword = password_hash($pwd, PASSWORD_DEFAULT);	//hash password

								$stmt = $conn->prepare ("INSERT INTO UserAccount (username, password, firstname, lastname,
														 email) VALUES (:username, :password, :firstname, :lastname,
														 :email)");

								$stmt->bindParam(':username', $username);
								$stmt->bindParam(':password', $hashedPassword);
								$stmt->bindParam(':firstname', $firstname);
								$stmt->bindParam(':lastname', $lastname);
								$stmt->bindParam(':email', $email);

								$stmt->execute();

								$conn = null;

								/*not return anything, giving sign to JS that sign up is successful. JS will do the
								part displaying message*/

							}
							catch(PDOException $e) {
								echo "The site database is unavailable right now. Please return later.";
								$error = $e->getMessage();
							    echo "<script>console.log(".$error.")</script>;";
							}
						}
						else{
							echo json_encode($invalidInput);		//send error array to JS
						}
					}
				}
				else{
					echo "One or more fields are blank. Please fill all the required fields.";
				}

			break;

			case "signupOrg":

				if (!empty($_POST["email"])) {

					$email = sanitizeInput($_POST["email"]);
					$firstname = sanitizeInput($_POST["firstname"]);
					$lastname = sanitizeInput($_POST["lastname"]);
					$org = sanitizeInput($_POST["org"]);
					$phone = sanitizeInput($_POST["phone"]);

					if(validateEmail($email)){

					    date_default_timezone_set('Etc/UTC');

					    require 'PHPMailer/PHPMailerAutoload.php';

					    $mail = new PHPMailer;

					    $mail->isSMTP();
					    $mail->Host = 'smtp.gmail.com';
					    $mail->Port = 587;
					    $mail->SMTPSecure = 'tls';
					    $mail->SMTPAuth = true;
					    $mail->Username = $sysemail;
					    $mail->Password = $mailpwd;
					    
					    $mail->setFrom('jeremydang2909@gmail.com');
					    
					    $mail->addAddress('dang.np.thanh@gmail.com');

					    if ($mail->addReplyTo($email, $firstname)) {

					        $mail->Subject = "[$org]"."Sign up for Math Village";
					        $mail->isHTML(false);
					        $mail->Body = <<<EOT
							First name: $firstname
							Last name: $lastname
							Email: $email
							Organization: $org
							Phone number: $phone
EOT;

					        if (!$mail->send()) {
					            echo 'Sorry, something went wrong. Please try again later.';
				            	$error = $mail->ErrorInfo;
				                echo "<script>console.log(".$error.");</script>";
					        } 
					        else {
					            /*not return anything, giving sign to JS that sign up is successful. JS will do the
					            part displaying message*/
					        }
					    } 
					    else {
					        echo 'Please enter a valid email address.';
					    }
					}
					else {
					    echo 'Please enter a valid email address.';
					}
				}
				else{
					echo 'One or more fields are blank. Please fill all the required fields.';
				}

			break;

			default:
			echo "Sorry, something went wrong. Please try again later.";

			echo "<script>console.log(\"Form name not found\");</script>";
		}
	}

	else if(count($_POST) === 2){				// AJAX send input separately to validate on the fly

	 	if (!empty($_POST["field"]) && !empty($_POST["value"])){

 			$field = sanitizeInput($_POST["field"]);
 			$value = sanitizeInput($_POST["value"]);
 		
 			switch($field){						// figure out which field is submitted
 				case "name":
 					if(validateMaxLen($value,25)){
 						if(!validateText($value, true)){
 							echo "Name can only contains letters and whitespace";
 						}
 					}
 					else{
 						echo "Name must be less than 25 characters";
 					}
 				break;
 		
 				case "eml":
 					if(validateMaxLen($value,100)){
 						if(!validateEmail($value)){
 							echo "Invalid email format";
 						}
 					}
 					else{
 						echo "Email must be less than 100 characters";
 					}
 				break;
 		
 				case "uname":
 					if(validateMaxLen($value,25)){
 						if(validateText($value)){
 							if(checkExistUsername($value, $conn)){
 								echo "Already existed username";
 							}
 						}
 						else{
 							echo "Username can only contains letters, numbers and underscore";
 						}
 					}
 					else{
 						echo "Username must be less than 25 characters";
 					}
 				break;
 		
 				case "pwd":
 					if(validateMaxLen($value,50)){
 						if(!validateMinLen($value, 6)){ 			
 							echo "Password is too short";
 						}
 					}
 					else{
 						echo "Password must be less than 50 characters";
 					}
 				break;
 		
 				case "schl":
 					if(!validateMaxLen($value,100)){
 						echo "School must be less than 100 characters";
 					}
 				break;
 		
 				default:
 				echo "Sorry, something went wrong. Please try again later.";

 				echo "<script>console.log(\"Field value not found\");</script>";
 			}
 		}
 		else {
 		 	echo "Sorry, something went wrong. Please try again later.";

 		 	echo "<script>console.log(\"Value or field is empty\");</script>";
 		}
 	}

	else {
	 	echo "Sorry, something went wrong. Please try again later.";

	 	echo "<script>console.log(\"Not submitting full form or partly form\");</script>";
	}
	
?>