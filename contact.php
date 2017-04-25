<?php
	session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Math Village | Contact</title>
	<meta name="keywords" content="">
	<meta name="description" content="">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<link href="images/favicon.png" rel="shortcut icon">

	<!--styles-->
	<link rel="stylesheet" href="css/bootstrap.min.css">
	<link rel="stylesheet" href="css/normalize.css">
	<link rel="stylesheet" href="font-awesome/css/font-awesome.min.css">
	<link rel="stylesheet" href="css/mainstyle.css">
	<link rel="stylesheet" href="css/responsive.css">

	<!--font-google-->
	<link href="https://fonts.googleapis.com/css?family=Arvo" rel="stylesheet">
	<link href="https://fonts.googleapis.com/css?family=Montserrat:700" rel="stylesheet">

	<!--js-->
	<script src="js/login.js"></script>

</head>

<body class="sub-page" id="contact">
	<div id="preloader">
	  <div id="status">
	    <img alt="logo" src="images/mvlogo-min.png">
	  </div>
	</div>

    <div class="container-fluid no-pad">
		  <div class="nav navbar-inverse" id="sub-page">
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
		            <li><a href="index.php">Home</a></li>
		            <li><a href="about.php" class="hidden-sm">About</a></li>
		            <li><a href="getstarted.php">Get started</a></li>
		            <li><a href="leaderboard.php"class="hidden-md hidden-sm">Leaderboard</a></li>
		            <li><a href="contact.php"  class="active">Contact</a></li>
		            <li><a href="login.html" id="login-main">Log in</a></li>
		            <li><a href="game/game.php" class="btn btn-primary hidden-xs" id="game">Play</a></li>
		            <li>
		  	          <div class="dropdown" id="user">
		  	            <a data-toggle="dropdown">
		  	            <i class="fa fa-user-circle fa-lg" aria-hidden="true"></i>
		  	            <i class="fa fa-caret-down" aria-hidden="true"></i>
		  	            </a>
		  	            <ul class="dropdown-menu">
		  	              <li><a id="username"></a></li>
		  	              <li role="presentation" class="divider"></li>
		  	              <li><a href="game/game.php" class=>Play game</a></li>
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
	</div>

   	<?php
		
		if(isset($_SESSION['username'])){
			$username = (string)$_SESSION["username"];
			echo "<script type='text/javascript'>";
			echo "login(\"$username\");";
			echo "</script>";
		}

   	?>

	<div class="container-fluid contact margin-30">
	    <div class="row">
	        <div class="col-md-8 col-md-offset-2 col-sm-10 col-sm-offset-1 text-center">
	            <div class="contact-title">
	                <h1>GET IN TOUCH</h1>
            		<p>Feel free to contact us if you have further inquiries or support.<br>
            		We will try to reply to you as soon as possible.</p>
	            </div>
	        </div>
	    </div>
	</div>
	<div class="container-fluid">
	    <div class="row">
	        <div class="col-md-8 col-md-offset-2 col-sm-10 col-sm-offset-1">

	        	<div class="alert alert-danger" id="alert"></div>

	        	<h4 class ="alert alert-success text-center" id="contact-success">
	        		We have received your message. Thank you for contacting us.
	        	</h4>

	            <form class="contact-form red-bg" action="backend/submit.php" method="POST"
	            		onsubmit="event.preventDefault(); return checkForm(this)">
	                <div class="row">
	                    <div class="col-md-6">
	                    	<input type="hidden" name="formname" value="contact"/>
	                        <input type="text" class="form-control" name="name" placeholder="Name">
	                        <input type="email" class="form-control" name="email" placeholder="Email">
	                        <input type="text" class="form-control" name="subject" placeholder="Subject">                                
	                    </div>
	                    <div class="col-md-6">
	                        <textarea class="form-control" name="message" rows="25" cols="10" id="message"
	                        placeholder="  Message Texts..."></textarea>                            
	                    </div>
	                </div>
	                <input type="submit" class="btn submit-btn" value="SEND MESSAGE">
	            </form>
	        </div>
	    </div>
	    <div class="row text-center">
	    	<div class="col-md-8 col-md-offset-2">
	    		<div class="col-md-4">
    			    <div class="contact-info">
    			        <h3>CALL US</h3>
    			        <p>+358469430446</p>
    			    </div>
	    		</div>

	    		<div class="col-md-4">
		    		<div class="contact-info">
		    		    <h3>EMAIL US</h3>
		    		    <p>dang.np.thanh@gmail.com</p>
		    		</div>
	    		</div>

	    		<div class="col-md-4">
		    		<div class="contact-info">
		    		    <h3>OUR GITHUB</h3>
		    		    <p>https://github.com/<br>jeremydang</p>
		    		</div>
	    		</div>
	    	</div>
	    </div>
	</div>

	<footer class="container-fluid blue-bg" id="sub-page">
		<div class="row">	
			<div class="col-sm-4 text-left image hidden-xs">
				<a href="index.php"><img src="images/mvlogo.png" alt="Logo"></a>
			</div>
			<div class="col-sm-4 hidden-xs text-center social">
			  <ul class="list-inline social">
			    <li >Connect with us on</li><br>
			    <li><a href="#"><i class="fa fa-twitter"></i></a></li>
			    <li><a href="#"><i class="fa fa-facebook"></i></a></li>
			    <li><a href="#"><i class="fa fa-instagram"></i></a></li>
			  </ul>
			</div>
			<div class="col-sm-4 text-right darkgrey">
	            <p>Math Village &copy; 2017</p>
		        <p class="hidden-xs">  Created by <a href="https://github.com/jeremydang">Thanh Dang</a></p>
			</div>
		</div>
	</footer>

	<!--js-lib-->
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
	<script src="js/bootstrap.min.js"></script>
	<script type="text/javascript" src="js/main.js"></script>
</body>
</html>