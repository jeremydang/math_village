//------------------------------------//
//Login - Logout//
//------------------------------------// 

function login(username){
  document.getElementById('login-main').style.display = 'none';
  document.getElementById('game').style.display = 'inline-block';
  document.getElementById('user').style.display = 'inline-block';

  var loginFixed = document.getElementById('login-fixed');
  if(loginFixed){
  	loginFixed.setAttribute("href","game.php");
  	loginFixed.innerHTML = "Play";
  }

  document.getElementById("username").innerHTML = "Hello, <span class='red'>"+username.substring(0,12);+"</span>"
}

function logout (){
	window.location.replace("backend/logout.php");
}