

displayView = function(viewId){
  // the code required to display a view
  const viewContent = window.document.getElementById(viewId).innerText
  window.document.getElementById('content').innerHTML = viewContent
};

window.onload = function(){
  //code that is executed as the page is loaded.
  if(this.localStorage.getItem("token") === null) {
    displayView('welcomeview');
  } else {
    var token = this.localStorage.getItem("token");
    displayView("profileview");
    document.getElementById("variousMess").style.display = "none";
    infoPerso(token);
    displayOwnMessages(token);
  }
};


checkSignup = function(form) {

  var goodLength = function(password) {
    if(password.value.length < 5) {
      document.getElementById("errorSignup").style.display = "none";
      document.getElementById("okSignup").style.display = "none";
      document.getElementById("wrongSame1").style.display = "none";
      document.getElementById("wrongLength1").style.display = "block";
      var errorLength = document.createElement('h5');
      errorLength.innerHTML = "Password too short. You need at least 5 characters.";
      document.getElementById("wrongLength1").appendChild(errorLength);
      return false;
    } else {
      return true;
    }
  };
  var samePwd = function(password1, password2) {
    if(password1.value != password2.value) {
      document.getElementById("errorSignup").style.display = "none";
      document.getElementById("okSignup").style.display = "none";
      document.getElementById("wrongLength1").style.display = "none";
      document.getElementById("wrongSame1").style.display = "block";
      var errorSame = document.createElement('h5');
      errorSame.innerHTML = "It is not the same password";
      document.getElementById("wrongSame1").appendChild(errorSame);
      return false;
    } else {
      return true;
    }
  };
  if(goodLength(form.password1) && samePwd(form.password1, form.password2)) {
    var account = {"email" : form.email.value, "password" : form.password1.value, "firstname" : form.firstname.value, "familyname" : form.familyname.value, "gender" : form.gender.value, "city" : form.city.value, "country" : form.country.value};
    let signUpResponse = serverstub.signUp(account);
    console.log(signUpResponse);
    if (signUpResponse.success==false) {
      document.getElementById("errorSignup").style.display = "block";
      document.getElementById("okSignup").style.display = "none";
      document.getElementById("wrongLength1").style.display = "none";
      document.getElementById("wrongSame1").style.display = "none";
      var error = document.createElement('h5');
      error.innerHTML = signUpResponse.message;
      document.getElementById("errorSignup").appendChild(error);
      return false;
    } else {
      document.getElementById("wrongSame1").style.display = "none";
      document.getElementById("errorSignup").style.display = "none";
      document.getElementById("wrongLength1").style.display = "none";
      document.getElementById("okSignup").style.display = "block";
      var ok = document.createElement('h4');
      ok.innerHTML = signUpResponse.message;
      document.getElementById("okSignup").appendChild(ok);
      document.forms['sign'].reset();
      return false;
    }
  } else {
    return false;
  };
};

checkSignIn = function(form){

  let user = form.logMail.value;
  let password = form.logPswd.value;
  var signInResponse = serverstub.signIn(user, password);
  console.log(signInResponse);
  if(signInResponse.success == true){
    localStorage.setItem("token", signInResponse.data);
    return displayView("profileview");
  }else{
    document.getElementById("errorSignin").style.display = "block";
    var error = document.createElement('h5');
    error.innerHTML = signInResponse.message;
    document.getElementById("errorSignin").appendChild(error);
    return false;
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
  evt.currentTarget.className += " highlighted";
};
//The function hides all elements with the class name "tab" (display="none"), and displays the element with the given tab name (display="block");


var changePswd = function(form){

  var oldPswd = form.oldPswd.value;
  var newPswd = form.newPswd.value;
  var newPswd2 = form.newPswd2.value;
  var token = this.localStorage.getItem("token");

  var samePwd = function(password1, password2) {
    if(password1 != password2) {
      document.getElementById("errorNewPass").style.display = "none";
      document.getElementById("okChange").style.display = "none";
      document.getElementById("wrongLength").style.display = "none";
      document.getElementById("wrongSame").style.display = "block";
      var errorSame = document.createElement('h5');
      errorSame.innerHTML = "It is not the same password";
      document.getElementById("wrongSame").appendChild(errorSame);
      return false;
    } else {
      return true;
    }
  }

  var goodLength = function(password) {
    if(password.length < 5) {
      document.getElementById("errorNewPass").style.display = "none";
      document.getElementById("okChange").style.display = "none";
      document.getElementById("wrongSame").style.display = "none";
      document.getElementById("wrongLength").style.display = "block";
      var errorLength = document.createElement('h5');
      errorLength.innerHTML = "Password too short. You need at least 5 characters.";
      document.getElementById("wrongLength").appendChild(errorLength);
      return false;
    } else {
      return true;
    }
  };

  if(samePwd(newPswd, newPswd2) && goodLength(newPswd)) {
    var changePswdResponse = serverstub.changePassword(token, oldPswd, newPswd);
    console.log(changePswdResponse);
    if(changePswdResponse.success==false) {
      document.getElementById("errorNewPass").style.display = "block";
      document.getElementById("okChange").style.display = "none";
      document.getElementById("wrongLength").style.display = "none";
      document.getElementById("wrongSame").style.display = "none";
      var error = document.createElement('h5');
      error.innerHTML = changePswdResponse.message;
      document.getElementById("errorNewPass").appendChild(error);
      return false;
    } else {
      document.getElementById("wrongSame").style.display = "none";
      document.getElementById("errorNewPass").style.display = "none";
      document.getElementById("wrongLength").style.display = "none";
      document.getElementById("okChange").style.display = "block";
      document.forms['changePassword'].reset();
      return false;
    };
  } else {
    return false;
  };
};


var logOut = function() {
  var token = this.localStorage.getItem("token");
  var signOutResponse = serverstub.signOut(token);
  if(signOutResponse.success==false) {
    document.getElementById("variousMess").style.display = "block";
    return false;
  } else {
    localStorage.removeItem('token');
    return displayView("welcomeview");
  }
};

var infoPerso = function(token){
  var info = serverstub.getUserDataByToken(token).data;
  for(i in info) {
    var al = info[i];
    var aux = document.createElement("li");
    aux.innerHTML = i + ":  " + al;
    document.getElementById("personalInfo").appendChild(aux);
  }
};

var postOwnMessage = function(form) {
  var token = this.localStorage.getItem("token");
  //if(form.dest.value == null){
  var dest = null;
    //var dest = this.localStorage.getItem("dest");
  var message = form.message.value;
  var postMessageResponse = serverstub.postMessage(token, message, dest);
  if(postMessageResponse.success==false) {
    document.getElementById("errorPost").style.display = "block";
    var error = document.createElement('h5');
    error.innerHTML = postMessageResponse.message;
    document.getElementById("errorPost").appendChild(error);
    return false;
  } else {
    displayOwnMessages(token);
    document.forms['postMessOwn'].reset();
    return false;
  }
};

var postmessageUser = function(form) {
  var token = this.localStorage.getItem("token");
  var dest = searchUser(document.forms["searchuser"]).dest;
  console.log(dest);
  var message = form.message.value;
  var postMessageResponse = serverstub.postMessage(token, message, dest);
  if(postMessageResponse.success==false) {
    document.getElementById("errorPost").style.display = "block";
    var error = document.createElement('h5');
    error.innerHTML = postMessageResponse.message;
    document.getElementById("errorPost").appendChild(error);
    return false;
  } else {
    searchUser(document.forms["searchuser"]);
    document.forms['postMessUser'].reset();
    return false;
  }
};


var displayOwnMessages = function(token) {
  var listMessage = serverstub.getUserMessagesByToken(token).data;
  document.getElementById('wallMessage').innerHTML = " ";
  for(i in listMessage) {
    var writer = listMessage[i].writer;
    var content = listMessage[i].content;
    var aux = document.createElement("li");
    aux.innerHTML = writer + ":  " + content;
    document.getElementById("wallMessage").appendChild(aux);
  }
};

var searchUser = function(form) {
  var email = form.user.value;
  //this.localStorage.setItem("dest", email);
  var token = this.localStorage.getItem("token");
  var userDataResponse = serverstub.getUserDataByEmail(token, email);
  var userMessagesResponse = serverstub.getUserMessagesByEmail(token, email);
  if(userDataResponse.success == false || userMessagesResponse.success == false) {
    document.getElementById('errorSearch').innerHTML = " ";
    document.getElementById("resultSearch").style.display="none";
    document.getElementById("errorSearch").style.display="block";
    var post = document.createElement('h5');
    post.innerHTML = userDataResponse.message;
    document.getElementById("errorSearch").appendChild(post);
    return false;
  } else {
    document.getElementById("resultSearch").style.display="block";
    document.getElementById("errorSearch").style.display="none";
    document.getElementById('userInfo').innerHTML = " ";
    document.getElementById('wallMessageUser').innerHTML = " ";
    var infoUser = userDataResponse.data;
    var messageUser = userMessagesResponse.data;
    for(i in infoUser) {
      var al = infoUser[i];
      var aux = document.createElement("li");
      aux.innerHTML = i + ":  " + al;
      document.getElementById("userInfo").appendChild(aux);
    }
    for(i in messageUser) {
      var writer = messageUser[i].writer;
      var content = messageUser[i].content;
      var aux = document.createElement("li");
      aux.innerHTML = writer + ":  " + content;
      document.getElementById("wallMessageUser").appendChild(aux);
    }
    return {
      dest:email,
      result:false,
    }
  }
};

var refreshOwnWall = function() {
  var token = this.localStorage.getItem("token");
  displayOwnMessages(token);
};

var refreshUserWall = function() {
  searchUser(document.forms["searchuser"]);
};
