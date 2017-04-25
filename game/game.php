<?php
	session_start();

	if(isset($_SESSION['username'])){
	}
	else{
		header("Location: ../login.html");
	}
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Math Village</title>
	<meta name="keywords" content="">
	<meta name="description" content="">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<link href="../images/favicon.png" rel="shortcut icon">

	<!--styles-->
	<link rel="stylesheet" href="css/styles.css">
	<!--font-google-->
	<link href="https://fonts.googleapis.com/css?family=Press+Start+2P" rel="stylesheet">


</head>

<body>
	<div class="logo">
	    <img alt="logo" src="../images/mvlogo.png">
	</div>

	<script src="plugins/traceur-compiler/bin/traceur.js" type="text/javascript"></script>
	<script src="plugins/traceur-compiler/src/bootstrap.js" type="text/javascript"></script>
	<script src="js/maingame.js" type="module"></script>
	<script>traceur.options.experimental = true;</script>
</body>
</html>