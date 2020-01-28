

displayView = function(viewId){
  // the code required to display a view
  const viewContent = window.document.getElementById(viewId).innerText
  window.document.getElementById('content').innerHTML = viewContent
};

checkSignup = function(form) {

  var goodLength = function(password) {
    if(password.value.length < 5) {
      var box1 = document.getElementById("password1"); // !! need to erase the previous errors before
      var errorLength = document.createElement('h5');
      errorLength.setAttribute("id", "errorLength");
      errorLength.textContent = "Password too short. You need at least 5 characters.";
      box1.insertAdjacentElement('afterend', errorLength);
      return false;
    } else {
      return true;
    }
  };

  var samePwd = function(password1, password2) {
    if(password1.value != password2.value) {
      var box2 = document.getElementById("password2");
      var errorSame = document.createElement('h5');
      errorSame.setAttribute("id", "errorSame");
      errorSame.textContent = "It is not the same password";
      box2.insertAdjacentElement('afterend', errorSame);
      return false;
    } else {
      return true;
    }
  }

  if(goodLength(form.password1) && samePwd(form.password1, form.password2)) {
    var account = {"email" : form.email.value, "password" : form.password.value, "firstname" : form.firstname.value, "familyname" : form.familyname.value, "gender" : form.gender.value, "city" : form.city.value, "country" : form.country.value};
    let signUpResponse = serverstub.signUp(account);
    console.log(signUpResponse);
    alert(signUpResponse.message);
    if (signUpResponse==false) {
      return false;
    } else {
      //serverstub.signIn(form.email.value, form.password.value);
      //localStorage.setItem("token", signInResponse.data);
      //return displayView("profileview");
      return true;
    }
  } else {
    return false;
  };
};

checkSignIn = function(form){

  // user = document.forms["log"]["logMail"].value;
  // password = document.forms["log"]["logPswd"].value;
  let user = form.logMail.value;
  let password = form.logPswd.value;
  var signInResponse = serverstub.signIn(user, password);
  console.log(signInResponse);
  if(signInResponse.success == true){
    localStorage.setItem("token", signInResponse.data);
    return displayView("profileview");
  }else{
    alert(signInResponse.message);
    return false;
  }
};

window.onload = function(){
  //code that is executed as the page is loaded.
  if(this.localStorage.getItem("token") === null) {
    displayView('welcomeview');
  } else {
    displayView("profileview");
  }
};


function openTab(evt, tabName){
  var i;
  var tabs = document.getElementsByClassName("tab");
  console.log(tabs);
  for(i = 0; i < tabs.length; i++) {
    tabs[i].style.display = "none";
  }
  var tabsMenu = document.getElementsByClassName("tabsMenu");
  for(i = 0; i < tabsMenu.length; i++) {
     tabsMenu[i].className = tabsMenu[i].className.replace(" highlighted", "");
  }
  document.getElementById(tabName).style.display = "block";
  document.getElementById
  evt.currentTarget.className += " highlighted";  //I don't understand this line
};
//The function hides all elements with the class name "tab" (display="none"), and displays the element with the given tab name (display="block");
