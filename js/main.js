
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

  //------------------------------------//
  //Fullpage//
  //------------------------------------//

  if(document.getElementById("fullpage"))
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
//Display error//
//------------------------------------// 


function displayErrMess(err,element){
  if(err && element){

    element.style.display="block";
    
    element.innerHTML= "<i class=\"fa fa-exclamation-triangle\" aria-hidden=\"true\"></i>" + " " + err;
  }
}

//------------------------------------//
//Login validation//
//------------------------------------// 

function validateLogin(form){

  var action = form.getAttribute("action"), 
  method = form.getAttribute("method"), 
  errMess = "",
  alert = document.getElementById("alert");
  
  if(form.username.value ===  "" || form.password.value === ""){
    errMess="Please enter a valid username or password.";
    displayErrMess(errMess,alert);
  }
  else{
  
    var data = new FormData(form);
  
    var http = new XMLHttpRequest();
    http.open(method,action,true);
  
    http.onreadystatechange = function() {

      if (this.readyState == 4){
        if(this.status == 200){
          if(!this.responseText.trim()){
            window.location.replace('index.php');

          }
          else{
            errMess= this.responseText;
          }
          
        }
        else{
            errMess= "Sorry, something went wrong. Please try again later.";
        }
        displayErrMess(errMess,alert);
      }
      
    };
  
    http.send(data);
  } 

}

//------------------------------------//
//Signup//
//------------------------------------// 

  //Styling

  $('.signup').find('input, textarea').on('blur focus', function (e) {
    
    var $this = $(this),
        label = $this.prev('label');

      if (e.type === 'focus') {
            label.addClass('active highlight');
          
      } else if (e.type === 'blur') {
        if( $this.val() === '' ) {
          label.removeClass('active highlight'); 
        } else {
          label.removeClass('highlight');   
        }   
      } 

  });

$('.tab a').on('click', function (e) {
  
  e.preventDefault();
  
  $(this).parent().addClass('active');
  $(this).parent().siblings().removeClass('active');
  
  target = $(this).attr('href');

  $('.tab-content > div').not(target).hide();
  
  $(target).fadeIn(600);
  
});

  //Form handling

function checkForm(form){

  var action = form.getAttribute("action"), 
  method = form.getAttribute("method"), 
  errMess = "", alert = document.getElementById("alert");
    
  if (form.formname.value === "signupIdv") {

    //reset error field
    document.getElementById("name").innerHTML = "";
    document.getElementById("uname").innerHTML = "";
    document.getElementById("eml").innerHTML = "";
    document.getElementById("pwd").innerHTML = "";
    document.getElementById("schl").innerHTML = "";

    //check blank field
    if(form.firstname.value ===  "" || form.lastname.value === "" 
      || form.username.value ===  "" || form.password.value ===  ""
      || form.retypeP.value ===  ""|| form.email.value ===  ""){

      errMess = "One or more fields are blank. Please fill all the required fields.";

      displayErrMess(errMess,alert);
    }
  }

  if(!errMess){
    var data = new FormData(form);
    
    var http = new XMLHttpRequest();

    http.open(method,action,true);
    
    http.onreadystatechange = function() {

      if (this.readyState == 4){
                
        if (this.status == 200) {
          var response = this.responseText;
            try{

              var errMessArr = JSON.parse(response);

              for (var i in errMessArr){

                var obj = errMessArr[i];

                for (var field in obj){
                  displayErrMess(obj[field],document.getElementById(field));
                }
                
              }
              errMess = "One or more fields are invalid. Please enter again.";
              displayErrMess(errMess,alert);
            }
            catch(e){
              if(!response.trim()){             //successfully signning up

                form.style.display = "none";
                alert.style.display = "none";

                switch(form.formname.value){
                  case "signupIdv":

                  document.getElementById("idv-success").style.display = "block";

                  setTimeout(function(){window.location.replace('login.html');}, 5000);

                  break;

                  case "signupOrg":

                  document.getElementById("org-success").style.display = "block";
                }
              }
              else{                                 // other errors
                errMess = response;
                displayErrMess(errMess,alert);
              }
            }
        }
        else{
          errMess= "Sorry, something went wrong. Please try again later.";
          displayErrMess(errMess,alert);
          console.log("Error -> Status: " + this.status + " : " + this.statusText);
        }
      }
    };

    http.send(data);
  }
}

function validate(field, value){

  if(value){

    var  errMess = "", alert = document.getElementById("alert");

    var form = document.getElementById("signupIdv"),
       method = form.getAttribute("method"), 
       action = form.getAttribute("action");
        
    if (field !== "retypeP") {
      
      var http = new XMLHttpRequest();

      http.open(method,action,true);

      http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      
      http.onreadystatechange = function() {
  
        if (this.readyState == 4){
                  
          if (this.status == 200) {
            var response = this.responseText;
            var fieldErr = document.getElementById(field);
            if(response.trim() !== ""){
              displayErrMess(response,fieldErr);
            }
            else{
              fieldErr.style.display="none";
            }

            if(field === "pwd"){        //check in case user fill retype pass first
              var repwd = form.retypeP.value;
              if(repwd){
                if (document.getElementById("pwd").style.display == "none") {
                  if(value !== repwd){
                    displayErrMess("Password mismatch. Please enter again", document.getElementById("pwd"));
                  }
                }
              }
            }
          }
          else{
            errMess= "Sorry, something went wrong. Please try again later.";
            displayErrMess(errMess,alert);

            console.log("Error -> Status: " + this.status + " : " + this.statusText);
          }
        }
      };
      http.send(encodeURI("field="+field +"&"+ "value="+value));
    }
    else{
    var pwd = form.password.value;                 //check retype pass
      if(pwd){    //only check if password is not blank
        if(value !== pwd){
          displayErrMess("Password mismatch. Please enter again", document.getElementById("pwd"));
        }
        else{
          document.getElementById("pwd").style.display = "none";
        }
      }
    }
  }
}
