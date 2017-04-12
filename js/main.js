
$(document).ready(function(){

  //------------------------------------//
  //Preloader//
  //------------------------------------//
  
  "use strict";
  $(window).on("load", function() { // makes sure the whole site is loaded
    //preloader
    $("#status").fadeOut(); // will first fade out the loading animation
    $("#preloader").delay(450).fadeOut("slow"); // will fade out the white DIV that covers the website.
      
    });    

  //------------------------------------//
  //Navbar//
  //------------------------------------//
  var menu = $('.navbar');
  $(window).bind('scroll', function(e){
    if($(window).scrollTop() > 200){
      if(!menu.hasClass('open')){
        menu.addClass('open');
      }
    }else{
      if(menu.hasClass('open')){
        menu.removeClass('open');
      }
    }
  });

  $(function(){
      // this will get the full URL at the address bar
      var url = window.location.href; 

      // passes on every "a" tag 
      $(".nav > li > a").each(function() {
              // checks if its the same on the address bar
          if(url == (this.href)) { 
              $(this).closest("li").addClass("active");
          }
      });
  });

  //------------------------------------//
  //Fullpage//
  //------------------------------------//

  if(document.getElementById("fullpage") !== null)
  {
      $('#fullpage').fullpage({
          fitToSection: false,
          anchors: ['header', 'feature-1', 'feature-2', 'feature-3', 'feature-4','join-us', 'footer' ],
          sectionsColor: ['#0b1733', '#fedc32', '#03c9a5', '#e13844','#0b1733','#0b1733','#0b1733' ],
          navigation: true,
          navigationPosition: 'right',
          responsiveWidth: 767,
          scrollBar: true,
      });
  }



  //------------------------------------//
  //Wow Animation//
  //------------------------------------// 
  if(typeof WOW !== "undefined"){
    var wow = new WOW(
          {
            boxClass:     'wow',      // animated element css class (default is wow)
            animateClass: 'animated', // animation css class (default is animated)
            offset:       0,          // distance to the element when triggering the animation (default is 0)
            mobile:       false        // trigger animations on mobile devices (true is default)
          }
        );
    wow.init();
  }
  

});

//------------------------------------//
//Login validation//
//------------------------------------// 
var loginForm = document.forms["login"];

loginForm.onsubmit = function(event){

  event.preventDefault(); 

  var action = this.getAttribute("action"), 
  method = this.getAttribute("method"); 

  var username = document.getElementById("username"),
  password = document.getElementById("password"),
  alertElement = document.getElementById("alert"),
  errMess = "";


  if(username.value==""){

    errMess="Please enter a valid username";
    displayErrMess(errMess,alertElement);

  }
  else if(password.value==""){

    errMess="Please enter a valid password" ; 
    displayErrMess(errMess,alertElement);

  }

  else{

    var data = new FormData(loginForm);

    var http = new XMLHttpRequest();
    http.open(method,action,true);

    http.onload = function() {
      if (http.status == 200) {
      

      }
    };

    http.send(data);
  } 

};

function displayErrMess(err,element){
  element.style.display="block";
  element.innerHTML= "<i class=\"fa fa-exclamation-triangle\" aria-hidden=\"true\"></i>" + " " + err;
}