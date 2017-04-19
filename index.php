<?php
	session_start();
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
	<link href="images/favicon.png" rel="shortcut icon">

	<!--styles-->
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css">
	<link rel="stylesheet" href="css/bootstrap.min.css">
	<link rel="stylesheet" href="css/normalize.css">
	<link rel="stylesheet" href="font-awesome/css/font-awesome.min.css">
	<link rel="stylesheet" href="css/jquery.fullpage.css">
	<link rel="stylesheet" href="css/mainstyle.css">
	<link rel="stylesheet" href="css/responsive.css">

	<!--font-google-->
	<link href="https://fonts.googleapis.com/css?family=Arvo" rel="stylesheet">
	<link href="https://fonts.googleapis.com/css?family=Montserrat:700" rel="stylesheet">

	<!--js-->
	<script src="js/login.js"></script>

</head>

<body>
	<div id="preloader">
	  <div id="status">
	    <img alt="logo" src="images/mvlogo-min.png">
	  </div>
	</div>

	<div class="navbar navbar-inverse navbar-fixed-top">
	  <div class="container">
	    <div class="navbar-header">
	      <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
	        <span class="icon-bar"></span>
	        <span class="icon-bar"></span>
	        <span class="icon-bar"></span>
	      </button>
	    </div>
	    <div class="navbar-collapse collapse fixed navbar-center">
	      <ul class="nav navbar-nav">
	        <li><a href="index.php" class="active">Home</a></li>
	        <li><a href="about.php">About</a></li>
	        <li><a href="getstarted.php">Get started</a></li>
	        <li><a href="leaderboard.php" class="hidden-sm">Leaderboard</a></li>
	        <li><a href="contact.php">Contact</a></li>
	        <li><a href="login.html" id="login-fixed">Log in</a></li>
	      </ul>
	    </div><!--/.navbar-collapse -->
	  </div>
	</div>

	<div id="fullpage">
		<div class="section main">
			<header>
			  <div class="container-fluid no-pad">
				  <div class="nav navbar-inverse">
				      <div class="navbar-header">
					      <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
					        <span class="icon-bar"></span>
					        <span class="icon-bar"></span>
					        <span class="icon-bar"></span>
					      </button>
					      <a class="logo-menu" href="index.php"><img src="images/mvlogo.png" alt="Logo"></a>
					  </div>
					  <div class="navbar-collapse collapse head">
				        <ul class="nav navbar-nav navbar-right">
				          <li><a href="index.php" class="active">Home</a></li>
				          <li><a href="about.php" class="hidden-sm">About</a></li>
				          <li><a href="getstarted.php">Get started</a></li>
				          <li><a href="leaderboard.php"class="hidden-md hidden-sm">Leaderboard</a></li>
				          <li><a href="contact.php">Contact</a></li>
				          <li><a href="login.html" id="login-main">Log in</a></li>
				          <li><a href="game.php" class="btn btn-primary hidden-xs" id="game">Play</a></li>
				          <li>
					          <div class="dropdown" id="user">
					            <a data-toggle="dropdown">
					            <i class="fa fa-user-circle fa-lg" aria-hidden="true"></i>
					            <i class="fa fa-caret-down" aria-hidden="true"></i>
					            </a>
					            <ul class="dropdown-menu">
					              <li><a id="username"></a></li>
					              <li role="presentation" class="divider"></li>
					              <li><a href="game.php" class=>Play game</a></li>
					              <li><a href="profile.php">User profile</a></li>
					              <li><a onclick="logout()">Sign out 
					              <i class="fa fa-sign-out" aria-hidden="true"></i></a>
					              </li>
					            </ul>
					          </div>
				          </li>
				        </ul>
					  </div>
				   </div>

				   <?php
			   		
			   		if(isset($_SESSION['username'])){
			   			$username = (string)$_SESSION["username"];
			   			echo "<script type='text/javascript'>";
			   			echo "login(\"$username\");";
			   			echo "</script>";
			   		}
	
				   ?>

				    <div class="row header"> 

					    <div class="header-info">
					      <div class="col-md-8 col-md-offset-2 col-sm-10 col-sm-offset-1 
					      				text-center">
					        <h2 class="wow fadeInUp">A MUST HAVE EDUCATED <br> GAME FOR EVERY CHILDREN</h2>
					        <br />
					        <h3 class="subtitle cyan wow fadeInUp" data-wow-delay="0.5s">EXCITING AND ENGAGING
					        														MATH PLATFORM</h3>
					        <br />
				          </div>
				        </div>

				        <div class="action">
				          <div class="col-md-4 col-md-offset-4 col-sm-6 col-sm-offset-3
				           				text-center wow fadeInUp" data-wow-delay="0.8s">
				            
				                <a href="signup.html" class="btn btn-primary btn-wide">JOIN US NOW</a>
			              </div>
				             
			            </div><!--End Button Row-->  
				  </div>
			  </div>
			</header>
		</div>

		<div class="section container-fluid">
			<div class="row feature-1">	
				<div class="col-lg-4 col-lg-offset-4 col-md-6 col-md-offset-3 
							col-sm-8 col-sm-offset-2 col-xs-10 col-xs-offset-1 text-center">
					<h1 class="wow fadeInUp blue">
						<hr  class="line blue margin-20"> WE BUILD GAMES THAT PARENTS WANT THEIR KIDS TO PLAY 
					</h1>
					<a href="about.php" class="wow fadeInUp btn btn-primary btn-wide">About us</a>
				</div>
			</div>
		</div>

		<div class="section container-fluid">
			<div class=" row feature-2 pad-sm">
				<div class="col-md-6 col-md-offset-1  wow fadeInLeft">
					<img src="images/screen2.png" alt="math">
				</div>					
				<div class="col-md-4 info text-right">
					<h1 class="wow fadeInRight blue">
						WE IMPROVE <br>YOUR CHILDREN'S <br>MATH SKILLS
					</h1>
					<p class="wow fadeInRight darkgrey lead visible-lg">
						We implement many math arithmetic problems in  
						most of our game tasks. These problems are 
						of range for elementary students. They include 
						basic operations such as plus, minus, multiply and
						divide mixing together.
					</p>
				</div>
			</div>
		</div>

		<div class="section container-fluid">
			<div class="row feature-3">	
				<div class="row line">
					<div class="col-md-4 col-md-offset-4 
								col-sm-6 col-sm-offset-3 col-xs-8 col-xs-offset-2
								text-center fadeInUp">
						<hr  class="line blue margin-10"> 
					</div>	
				</div>	
				<div class="row info">
					<div class="col-md-6 col-md-offset-3 text-center">
						<h1 class="wow fadeInUp blue">
							OUR GAMES WILL <br>HELP THEM EXPLORE <br>THEIR FUTURE CAREER
						</h1>
					</div>
				</div>			
				<div class="row image">
					<div class="col-md-8 col-md-offset-2 text-center fadeInUp">
						<img  class="wow fadeInUp" src="images/screen3.png" alt="career">
					</div>
				</div>					
			</div>
		</div>

		<div class="section container-fluid">
			<div class=" row feature-4">
				<div class="col-md-5 col-md-offset-1 wow fadeInLeft info text-center">
					<h1 class="yellow"> 
						WE CREATE <br> A COMPETITIVE <br> LEARNING ENVIROMENT 
					</h1>
					<a href="leaderboard.php" class="btn btn-primary btn-wide">VIEW OUR LEADERBOARD</a>
				</div>					
				<div class="col-md-5 text-center">
					<img src="images/screen4.png" alt="leaderboard" class="wow fadeInRight">
				</div>
			</div>
		</div>

		<div class="section container-fluid action-box">
			<div class="row wow fadeIn">	
				<div class="col-md-8 col-md-offset-2 text-center box">
					<h1 class="blue"> READY TO JOIN US? </h1>
					<a href="getstarted.php" class="btn btn-primary btn-wide">GETTING STARTED</a>
				</div>
			</div>
		</div>

		<div class="section fp-auto-height">
			<footer class="container-fluid ">
				<div class="row">	
					<div class="col-sm-4 text-left image hidden-xs">
						<a href="index.php"><img src="images/mvlogo.png" alt="Logo"></a>
					</div>
					<div class="col-sm-4 hidden-xs text-center social">
					  <ul class="list-inline social white">
					    <li>Connect with us on</li><br>
					    <li><a href="#"><i class="fa fa-twitter"></i></a></li>
					    <li><a href="#"><i class="fa fa-facebook"></i></a></li>
					    <li><a href="#"><i class="fa fa-instagram"></i></a></li>
					  </ul>
					</div>
					<div class="col-sm-4 text-right">
			            <p>Math Village &copy; 2017</p>
				        <p class="hidden-xs">  Created by <a href="https://github.com/jeremydang">Thanh Dang</a></p>
					</div>
				</div>
			</footer>
		</div>
	</div>


	<!--js-lib-->
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
	<script src="js/bootstrap.min.js"></script>
	<script src="js/wow.min.js"></script>
	<script type="text/javascript" src="js/jquery.fullpage.min.js"></script>
	<script type="text/javascript" src="js/main.js"></script>
</body>
</html>