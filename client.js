

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
    localStorage.setItem("token", signInResponse.data);  //problem here
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
    var token = this.localStorage.getItem("token");
    displayView("profileview");
    infoPerso(token);
    displayOwnMessages(token);
  }
};


function openTab(evt, tabName, element){

  var i;
  var tabs = document.getElementsByClassName("tab");
  for(i = 0; i < tabs.length; i++) {
    tabs[i].style.display = "none";
  }
  var tabsMenu = document.getElementsByClassName("tabsMenu");
  for(i = 0; i < tabsMenu.length; i++) {
     tabsMenu[i].style.backgroundColor = "";
     tabsMenu[i].className = tabsMenu[i].className.replace(" highlighted", "");

  }
  document.getElementById(tabName).style.display = "block";
  document.getElementById

  var tabElement = document.getElementById(tabName);
  var computedStyles = window.getComputedStyle(tabElement);
  var thisTabColor = computedStyles.getPropertyValue('background-color');
  document.body.style.backgroundColor = thisTabColor;

  element.style.backgroundColor = thisTabColor;

};
//The function hides all elements with the class name "tab" (display="none"), and displays the element with the given tab name (display="block");


var changePswd = function(form){

  var oldPswd = form.oldPswd.value;
  var newPswd = form.newPswd.value;
  var newPswd2 = form.newPswd2.value;
  var token = this.localStorage.getItem("token");

  var samePwd = function(password1, password2) {
    if(password1 != password2) {
      var box2 = document.getElementById("new2");
      var errorSame = document.createElement('h5');
      errorSame.setAttribute("id", "errorSame");
      errorSame.textContent = "It is not the same password";
      box2.insertAdjacentElement('afterend', errorSame);
      return false;
    } else {
      return true;
    }
  }
  if(samePwd(newPswd, newPswd2)) {
    var changePswdResponse = serverstub.changePassword(token, oldPswd, newPswd);
    console.log(changePswdResponse);
    alert(changePswdResponse.message);
    if(changePswdResponse.success==false) {
      return false;
    } else {
      return true;
    };
  } else {
    return false;
  };
};


var logOut = function() {
  var token = this.localStorage.getItem("token");
  var signOutResponse = serverstub.signOut(token);
  alert(signOutResponse.message);
  if(signOutResponse.success==false) {
    return false;
  } else {
    return displayView("welcomeview");
  }
};

var infoPerso = function(token){
  var info = serverstub.getUserDataByToken(token).data;
  for(i in info) {
    var al = info[i];
    var aux = document.createElement("li");
    aux.innerHTML = i + ": " + al;
    document.getElementById("personalInfo").appendChild(aux);
  }
};

var postmessage = function(form) {
  var token = this.localStorage.getItem("token");
  if(form.dest.value == ""){
    var dest = null;
  } else {
    var dest = form.dest.value;
  }
  console.log(dest);
  var message = form.message.value;
  var postMessageResponse = serverstub.postMessage(token, message, dest);
  alert(postMessageResponse.message);
  if(postMessageResponse.success==false) {
    return false;
  } else {
    return true;
  }
};

var displayOwnMessages = function(token) {
  var listMessage = serverstub.getUserMessagesByToken(token).data;
  for(i in listMessage) {
    var writer = listMessage[i].writer;
    var content = listMessage[i].content;
    var aux = document.createElement("li");
    aux.innerHTML = writer + ": " + content;
    document.getElementById("wallMessage").appendChild(aux);
  }
};

var searchUser = function(form) {
  var email = form.user.value;
  var token = this.localStorage.getItem("token");
  var userDataResponse = serverstub.getUserDataByEmail(token, email);
  var userMessagesResponse = serverstub.getUserMessagesByEmail(token, email);
  if(userDataResponse.success == false || userMessagesResponse.success == false) {
    alert(userDataResponse.message);
    return false;
  } else {
    document.getElementById("resultSearch").style.display="block";
    var infoUser = userDataResponse.data;
    var messageUser = userMessagesResponse.data;
    for(i in infoUser) {
      var al = infoUser[i];
      var aux = document.createElement("li");
      aux.innerHTML = i + ": " + al;
      document.getElementById("userInfo").appendChild(aux);
    }
    for(i in messageUser) {
      var writer = messageUser[i].writer;
      var content = messageUser[i].content;
      var aux = document.createElement("li");
      aux.innerHTML = writer + ": " + content;
      document.getElementById("wallMessageUser").appendChild(aux);
    }
    return false;
  }
}
