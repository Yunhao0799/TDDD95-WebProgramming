

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
    // var email = localStorage.getItem('email');
    checkSocket(token);
    displayView("profileview");
    document.getElementById("variousMess").style.display = "none";
    infoPerso(token);
    displayOwnMessages(token);
  }
};


checkSignup = function(form) {   //ok
  var goodLength = function(password) {
    if(password.value.length < 5) {
      document.getElementById("errorSignup").style.display = "none";
      document.getElementById("okSignup").style.display = "none";
      document.getElementById("wrongSame1").style.display = "none";
      document.getElementById("wrongLength1").innerHTML = "";
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
      document.getElementById("wrongSame1").innerHTML = "";
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
    var data = {"email" : form.email.value, "password" : form.password1.value, "firstname" : form.firstname.value, "familyname" : form.familyname.value, "gender" : form.gender.value, "city" : form.city.value, "country" : form.country.value};
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", '/sign_up', true);
    xhttp.onreadystatechange = function() {
      if(this.readyState == 4 && this.status == 200) {
        var signUpResponse = JSON.parse(this.responseText);
        //console.log(signUpResponse);
        if(signUpResponse.success==false) {
          document.getElementById("errorSignup").style.display = "block";
          document.getElementById("okSignup").style.display = "none";
          document.getElementById("wrongLength1").style.display = "none";
          document.getElementById("wrongSame1").style.display = "none";
          var error = document.createElement('h5');
          error.innerHTML = signUpResponse.message;
          document.getElementById("errorSignup").appendChild(error);
        } else {
          document.getElementById("wrongSame1").style.display = "none";
          document.getElementById("errorSignup").style.display = "none";
          document.getElementById("wrongLength1").style.display = "none";
          document.getElementById("okSignup").style.display = "block";
          var ok = document.createElement('h4');
          ok.innerHTML = signUpResponse.message;
          document.getElementById("okSignup").appendChild(ok);
          document.forms['sign'].reset();
        }
      }
    }
    xhttp.setRequestHeader("content-type", "application/json; charset=utf-8");
    xhttp.send(JSON.stringify(data));
  } else {
    return false;
  };
};


checkSignIn = function(form){ //ok

  var user = form.logMail.value;
  var password = form.logPswd.value;
  var data = {"email" : user, "password" : password};
  var xhttp = new XMLHttpRequest();
  xhttp.open("PUT", '/sign_in', true);
  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
    var signInResponse = JSON.parse(this.responseText);
    if (signInResponse.success == true) {
      //console.log(signInResponse);
      localStorage.setItem("token", signInResponse.message);
      localStorage.setItem("email", user);
      return window.onload();
    } else {
      document.getElementById('errorSignin').innerHTML = " ";
      document.getElementById("errorSignin").style.display = "block";
      var error = document.createElement('h5');
      error.innerHTML = signInResponse.message;
      document.getElementById("errorSignin").appendChild(error);
      return false;
    }
  }
  };
  xhttp.setRequestHeader("content-type", "application/json; charset=utf-8");
  xhttp.send(JSON.stringify(data));
};

function openTab(evt, tabName, element){ //ok
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


var changePswd = function(form){ //ok

  var oldPswd = form.oldPswd.value;
  var newPswd = form.newPswd.value;
  var newPswd2 = form.newPswd2.value;
  var token = this.localStorage.getItem("token");

  var samePwd = function(password1, password2) {
    if(password1 != password2) {
      document.getElementById("errorNewPass").style.display = "none";
      document.getElementById("okChange").style.display = "none";
      document.getElementById("wrongLength").style.display = "none";
      document.getElementById("wrongSame").innerHTML = "";
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
      document.getElementById("wrongLength").innerHTML = "";
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
    var xhttp = new XMLHttpRequest();
    var data = {"token" : token, "old_password" : oldPswd, "new_password" : newPswd};
    xhttp.open("POST", '/change_password', true);
    xhttp.onreadystatechange = function() {
      if(this.readyState == 4 && this.status == 200) {
        var changePswdResponse = JSON.parse(this.responseText);
        //console.log(changePswdResponse);
        if(changePswdResponse.success==false) {
          document.getElementById("errorNewPass").style.display = "block";
          document.getElementById("okChange").style.display = "none";
          document.getElementById("wrongLength").style.display = "none";
          document.getElementById("wrongSame").style.display = "none";
          var error = document.createElement('h5');
          error.innerHTML = changePswdResponse.message;
          document.getElementById("errorNewPass").appendChild(error);
        } else {
          document.getElementById("wrongSame").style.display = "none";
          document.getElementById("errorNewPass").style.display = "none";
          document.getElementById("wrongLength").style.display = "none";
          document.getElementById("okChange").style.display = "block";
          document.forms['changePassword'].reset();
        }
      }
    }
    xhttp.setRequestHeader("content-type", "application/json; charset=utf-8");
    xhttp.send(JSON.stringify(data));
  } else {
    return false;
  };
};


var logOut = function() {
  var token = this.localStorage.getItem("token");
  var data = {"token" : token};
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", '/sign_out', true);
  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
    var signOutResponse = JSON.parse(this.responseText);
    if (signOutResponse.success==true) {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      location.reload();
      return window.onload();
    } else {
      document.getElementById("variousMess").innerHTML = " ";
      document.getElementById("variousMess").style.display = "block";
      return false;
    }
  }
  };
  xhttp.setRequestHeader("content-type", "application/json; charset=utf-8");
  xhttp.send(JSON.stringify(data));
};


var infoPerso = function(token){  //ok
  var data = {"token" : token};
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", '/get/data/by_token', true);
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var infoResponse = JSON.parse(this.responseText);
      //console.log(infoResponse);
      if(infoResponse.success==true) {
        document.getElementById("personalInfo").innerHTML = " ";
        for(i in infoResponse) {
          if(i!="success") {
            var al = infoResponse[i];
            var aux = document.createElement("li");
            aux.innerHTML = i + ":  " + al;
            document.getElementById("personalInfo").appendChild(aux);
          }
        }
      } else {
        var infoResponse = JSON.parse(this.responseText);
        document.getElementById("personalInfo").innerHTML = " ";
        var error = document.createElement('h5');
        error.innerHTML = infoResponse.message;
        document.getElementById("personalInfo").appendChild(error);
      }
    }
   };
  xhttp.setRequestHeader("content-type", "application/json; charset=utf-8");
  xhttp.send(JSON.stringify(data));
};

var postOwnMessage = function(form) { //ok
  var token = this.localStorage.getItem("token");
  var dest = null;
  var message = form.message.value;
  var data = {'token' : token, 'message' : message, 'email' : dest};
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", '/post_message', true);
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var postMessageResponse = JSON.parse(this.responseText);
      if(postMessageResponse.success==false) {
        document.getElementById("errorPost").style.display = "block";
        var error = document.createElement('h5');
        error.innerHTML = postMessageResponse.message;
        document.getElementById("errorPost").appendChild(error);
      } else {
        displayOwnMessages(token);
        document.forms['postMessOwn'].reset();
      }
    }
   };
  xhttp.setRequestHeader("content-type", "application/json; charset=utf-8");
  xhttp.send(JSON.stringify(data));
};

var postmessageUser = function(form) { //ok
  var token = this.localStorage.getItem("token");
  var dest = searchUser(document.forms["searchuser"]).dest;
  var message = form.message.value;
  var data = {'token' : token, 'message' : message, 'email' : dest};
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", '/post_message', true);
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var postMessageResponse = JSON.parse(this.responseText);
      //console.log(postMessageResponse);
      if(postMessageResponse.success==false) {
        document.getElementById("errorPost2").style.display = "block";
        var error = document.createElement('h5');
        error.innerHTML = postMessageResponse.message;
        document.getElementById("errorPost2").appendChild(error);
      } else {
        searchUser(document.forms["searchuser"]);
        document.forms['postMessUser'].reset();
      }
    }
   };
  xhttp.setRequestHeader("content-type", "application/json; charset=utf-8");
  xhttp.send(JSON.stringify(data));
};


var displayOwnMessages = function(token) { //ok
  var data = {"token" : token};
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", 'get/messages/by_token', true);
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var listMessage = JSON.parse(this.responseText);
      //console.log(listMessage);
      document.getElementById('wallMessage').innerHTML = " ";
      var i;
      for(i=0; i < listMessage.length; i++) {
        var writer = listMessage[i].sender;
        var content = listMessage[i].message;
        var aux = document.createElement("li");
        aux.innerHTML = writer + ":  " + content;
        document.getElementById("wallMessage").appendChild(aux);
      }
    }
  }
  xhttp.setRequestHeader("content-type", "application/json; charset=utf-8");
  xhttp.send(JSON.stringify(data));
};

var searchUser = function(form) {  //ok
  var went_well=false;
  var email = form.user.value;
  var token = this.localStorage.getItem("token");
  var data = {"token" : token, "email" : email};
  var xhttp1 = new XMLHttpRequest();
  xhttp1.open("POST", '/get/data/by_email', true);
  xhttp1.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
       var userDataResponse = JSON.parse(this.responseText);
       //console.log(userDataResponse);
       if(userDataResponse.success==false) {
          went_well=false;
          document.getElementById('errorSearch').innerHTML = " ";
          document.getElementById("resultSearch").style.display="none";
          document.getElementById("errorSearch").style.display="block";
          var post = document.createElement('h5');
          post.innerHTML = userDataResponse.message;
          document.getElementById("errorSearch").appendChild(post);
          return false;
      } else {
        went_well=true;
        document.getElementById("resultSearch").style.display="block";
        document.getElementById("errorSearch").style.display="none";
        document.getElementById('userInfo').innerHTML = " ";
        document.getElementById('wallMessageUser').innerHTML = " ";
        for(i in userDataResponse) {
          if(i!="success") {
            var al = userDataResponse[i];
            var aux = document.createElement("li");
            aux.innerHTML = i + ":  " + al;
            document.getElementById("userInfo").appendChild(aux);
          }
        }
        var xhttp2 = new XMLHttpRequest();
        xhttp2.open("POST", '/get/messages/by_email', true);
        xhttp2.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
              var userMessagesResponse = JSON.parse(this.responseText);
              //console.log(userMessagesResponse);
              for(i in userMessagesResponse) {
                var writer = userMessagesResponse[i].sender;
                var content = userMessagesResponse[i].message;
                var aux = document.createElement("li");
                aux.innerHTML = writer + ":  " + content;
                document.getElementById("wallMessageUser").appendChild(aux);
              }
             }
            }
          xhttp2.setRequestHeader("content-type", "application/json; charset=utf-8");
          xhttp2.send(JSON.stringify(data));
      }
    }
  };
  xhttp1.setRequestHeader("content-type", "application/json; charset=utf-8");
  xhttp1.send(JSON.stringify(data));
  return {
    dest:email,
    result:false,
  }
};

var refreshOwnWall = function() {  //ok
  var token = this.localStorage.getItem("token");
  displayOwnMessages(token);
};

var refreshUserWall = function() {  //ok
  searchUser(document.forms["searchuser"]);
};


function checkSocket(token){
  var socket = new WebSocket("ws://localhost:5000/api");


  // socket.onerror = function(error){
  //   console.log("WS Error: " + error);
  // }

  socket.onmessage = function(event){
    if(event.data == "sign_out"){
      console.log("in the if event loop");
      localStorage.removeItem("token");
      socket.close();
      /*socket.onclose = function() {
        console.log("Error socket closed unexpected");
      }*/

      // localStorage.removeItem('email');
      // displayView('welcomeview');
      window.onload();
    }
  }



  socket.onopen = function(){
    console.log("in onopen function");
    socket.send(token);
  }
};
//problem : geventwebsocket.exceptions.WebSocketError: Socket is dead especially when we refresh the page
