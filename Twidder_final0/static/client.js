// the code required to display a view
displayView = function(viewId){
  const viewContent = window.document.getElementById(viewId).innerText
  window.document.getElementById('content').innerHTML = viewContent
};

//---------------------------------------------
//code that is executed as the page is loaded.
window.onload = function(){
  if(this.localStorage.getItem("token") === null) {
    displayView('welcomeview');
  } else {
    var token = this.localStorage.getItem("token");
    checkSocket(token);
    displayView("profileview");
    document.getElementById("variousMess").style.display = "none";
    infoPerso(token);
    displayOwnMessages(token);
    var geoActive = document.getElementById("buttGeo");
    if(geoActive.checked) {
      getLocation();
    } else {
      localStorage.removeItem('place');
    }
  }
};

//---------------------------------------------
//function to signUp
checkSignup = function(form) {
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
        if(signUpResponse.success==false) {
          document.getElementById("errorSignup").innerHTML = "";
          document.getElementById("errorSignup").style.display = "block";
          document.getElementById("okSignup").style.display = "none";
          document.getElementById("wrongLength1").style.display = "none";
          document.getElementById("wrongSame1").style.display = "none";
          var error = document.createElement('h5');
          error.innerHTML = signUpResponse.message;
          document.getElementById("errorSignup").appendChild(error);
        } else {
          document.getElementById("errorSignup").innerHTML = "";
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

//---------------------------------------------
//function to sign in
checkSignIn = function(form){
  var user = form.logMail.value;
  var password = form.logPswd.value;
  var data = {"email" : user, "password" : password};
  var xhttp = new XMLHttpRequest();
  xhttp.open("PUT", '/sign_in', true);
  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
    var signInResponse = JSON.parse(this.responseText);
    if (signInResponse.success == true) {
      localStorage.setItem("token", signInResponse.message);
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

//---------------------------------------------
//function to display the different tabs
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

//---------------------------------------------
//function to change password
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
    ///////////////////////////// Token protection /////////////////////////////
    // 1. Create blob
    var blob = "";
    for(let i = 0; i < oldPswd.length; i+=3) {
      blob += oldPswd[i];
    }
    for(let i = 0; i < newPswd.length; i+=3) {
      blob += newPswd[i];
    }
    token += blob;
    // 2. Hash the blob
    var shaObj = new jsSHA("SHA-256", "TEXT");
    shaObj.update(token);
    token = shaObj.getHash("HEX");
    // 3. Transmit data
    var data = {"token" : token, "old_password" : oldPswd, "new_password" : newPswd};
    ////////////////////////////////////////////////////////////////////////////
    xhttp.open("POST", '/change_password', true);
    xhttp.onreadystatechange = function() {
      if(this.readyState == 4 && this.status == 200) {
        var changePswdResponse = JSON.parse(this.responseText);
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

//---------------------------------------------
//log out function
var logOut = function() {
  var token = this.localStorage.getItem("token");
  var url = window.location.href;
  ///////////////////////////// Token protection ///////////////////////////////
  // 1. Create blob
  var blob = "";
  for(let i = 0; i < url.length; i+=3) {
    blob += url[i];
  }
  token += blob;
  // 2. Hash the blob
  var shaObj = new jsSHA("SHA-256", "TEXT");
  shaObj.update(token);
  token = shaObj.getHash("HEX");
  // 3. Transmit data
  var data = {"token" : token, "url" : url};
  //////////////////////////////////////////////////////////////////////////////
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", '/sign_out', true);
  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
    var signOutResponse = JSON.parse(this.responseText);
    if (signOutResponse.success==true) {
      localStorage.removeItem('token');
      localStorage.removeItem('place');
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

//---------------------------------------------
//function to display our own personal information
var infoPerso = function(token){
  var url = window.location.href;
  ///////////////////////////// Token protection ///////////////////////////////
  // 1. Create blob
  var blob = "";
  for(let i = 0; i < url.length; i+=3) {
    blob += url[i];
  }
  token += blob;
  // 2. Hash the blob
  var shaObj = new jsSHA("SHA-256", "TEXT");
  shaObj.update(token);
  token = shaObj.getHash("HEX");
  // 3. Transmit data
  var data = {"token" : token, "url" : url};
  //////////////////////////////////////////////////////////////////////////////
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", '/get/data/by_token', true);
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var infoResponse = JSON.parse(this.responseText);
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

//---------------------------------------------
//function to post a message on our own wall
var postOwnMessage = function(form) {
  var token = this.localStorage.getItem("token");
  var dest = null;
  var message = form.message.value;
  var place;
  if (localStorage.getItem('place')!=null) {
    place = localStorage.getItem('place');
  } else {
    place = null;
  }
  ///////////////////////////// Token protection ///////////////////////////////
  // 1. Create blob
  var blob = "";
  for(let i = 0; i < message.length; i+=3) {
    blob += message[i];
  }
  var token2 = token + blob;
  // 2. Hash the blob
  var shaObj = new jsSHA("SHA-256", "TEXT");
  shaObj.update(token2);
  token2 = shaObj.getHash("HEX");
  // 3. Transmit data
  var data = {'token' : token2, 'message' : message, 'email' : dest, 'place' : place};
  //////////////////////////////////////////////////////////////////////////////
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

//---------------------------------------------
//function to post a message on another user's wall
var postmessageUser = function(form) {
  var token = this.localStorage.getItem("token");
  var dest = searchUser(document.forms["searchuser"]).dest;
  var message = form.message.value;
  var place;
  if (localStorage.getItem('place')!=null) {
    place = localStorage.getItem('place');
  } else {
    place = null;
  }
  ///////////////////////////// Token protection ///////////////////////////////
  // 1. Create blob
  var blob = "";
  for(let i = 0; i < dest.length; i+=3) {
    blob += dest[i];
  }
  for(let i = 0; i < message.length; i+=3) {
    blob += message[i];
  }
  token += blob;
  // 2. Hash the blob
  var shaObj = new jsSHA("SHA-256", "TEXT");
  shaObj.update(token);
  token = shaObj.getHash("HEX");
  // 3. Transmit data
  var data = {'token' : token, 'message' : message, 'email' : dest, 'place' : place};
  //////////////////////////////////////////////////////////////////////////////
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", '/post_message', true);
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var postMessageResponse = JSON.parse(this.responseText);
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

//---------------------------------------------
//function to display our own messages on the wall
var displayOwnMessages = function(token) {
  var url = window.location.href;
  ///////////////////////////// Token protection ///////////////////////////////
  // 1. Create blob
  var blob = "";
  for(let i = 0; i < url.length; i+=3) {
    blob += url[i];
  }
  token += blob;
  // 2. Hash the blob
  var shaObj = new jsSHA("SHA-256", "TEXT");
  shaObj.update(token);
  token = shaObj.getHash("HEX");
  // 3. Transmit data
  var data = {"token" : token, "url" : url};
  //////////////////////////////////////////////////////////////////////////////
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", 'get/messages/by_token', true);
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var listMessage = JSON.parse(this.responseText);
      document.getElementById('wallMessage').innerHTML = " ";
      var i;
      for(i=0; i < listMessage.length; i++) {
        var writer = listMessage[i].sender;
        var content = listMessage[i].message;
        var place = listMessage[i].place;
        var id = listMessage[i].id;
        var aux = document.createElement("li");
        aux.setAttribute("id", id);
        aux.setAttribute("draggable", "true");
        aux.setAttribute("ondragstart", "drag(event)");
        if (place!=null) {
          aux.innerHTML = writer + " -- " + place + ":  " + content;
        } else {
          aux.innerHTML = writer + ":  " + content;
        }
        document.getElementById("wallMessage").appendChild(aux);
      }
    }
  }
  xhttp.setRequestHeader("content-type", "application/json; charset=utf-8");
  xhttp.send(JSON.stringify(data));
};

//---------------------------------------------
//function to search another Twidder user (display personal info and messages)
var searchUser = function(form) {
  var went_well=false;
  var email = form.user.value;
  var token = this.localStorage.getItem("token");
  ///////////////////////////// Token protection ///////////////////////////////
  // 1. Create blob
  var blob = "";
  for(let i = 0; i < email.length; i+=3) {
    blob += email[i];
  }
  token += blob;
  // 2. Hash the blob
  var shaObj = new jsSHA("SHA-256", "TEXT");
  shaObj.update(token);
  token = shaObj.getHash("HEX");
  // 3. Transmit data
  var data = {"token" : token, "email" : email};
  //////////////////////////////////////////////////////////////////////////////
  var xhttp1 = new XMLHttpRequest();
  xhttp1.open("POST", '/get/data/by_email', true);
  xhttp1.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
       var userDataResponse = JSON.parse(this.responseText);
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
              for(i in userMessagesResponse) {
                var writer = userMessagesResponse[i].sender;
                var content = userMessagesResponse[i].message;
                var place = userMessagesResponse[i].place;
                var id = userMessagesResponse[i].id;
                var aux = document.createElement("li");
                aux.setAttribute("id", id);
                aux.setAttribute("draggable", "true");
                aux.setAttribute("ondragstart", "drag(event)");
                if (place!=null) {
                  aux.innerHTML = writer + " -- " + place + ":  " + content;
                } else {
                  aux.innerHTML = writer + ":  " + content;
                }
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

//---------------------------------------------
//refresh functions for the buttons
var refreshOwnWall = function() {
  var token = this.localStorage.getItem("token");
  displayOwnMessages(token);
};

var refreshUserWall = function() {
  searchUser(document.forms["searchuser"]);
};

//---------------------------------------------
//function to check if the user is already connected on an other device/browser
function checkSocket(token){
  var socket = new WebSocket("ws://localhost:5000/api");
  socket.onmessage = function(event){
    if(event.data == "sign_out"){
      localStorage.removeItem("token");
      socket.close();
      window.onload();
    }
  }
  socket.onopen = function(){
    socket.send(token);
  }
};

//---------------------------------------------
//function to get the geolocation
function getLocation() {
  var x=document.getElementById("position");

  var showSimplePosition = function(position) {
    var x=document.getElementById("position");
    var lat = position.coords.latitude.toString();
    var long = position.coords.longitude.toString();
    var data = {'lat' : lat, 'long' : long};
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", 'get/position', true);
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var positionResponse = JSON.parse(this.responseText);
        var address = positionResponse.staddress;
        var city = positionResponse.city;
        var country = positionResponse.country;
        var place = city + " - " + country;
        localStorage.setItem('place', place);
      }
    }
    xhttp.setRequestHeader("content-type", "application/json; charset=utf-8");
    xhttp.send(JSON.stringify(data));
  };

  var showErrorPosition = function(error) {
    var x=document.getElementById("position");
    switch(error.code)
      {
      case error.PERMISSION_DENIED:
        x.innerHTML="User denied the request for Geolocation."
        break;
      case error.POSITION_UNAVAILABLE:
        x.innerHTML="Location information is unavailable."
        break;
      case error.TIMEOUT:
        x.innerHTML="The request to get user location timed out."
        break;
      case error.UNKNOWN_ERROR:
        x.innerHTML="An unknown error occurred."
        break;
      }
    };
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showSimplePosition,showErrorPosition);
    x.innerHTML="Geolocation activated."
  } else {
    x.innerHTML="Geolocation is not supported by this browser.";
  }
};

var activateGeoloc = function() {
  if(document.getElementById('buttGeo').checked){
    getLocation();
  }else{
    document.getElementById('position').innerHTML=' ';
    localStorage.removeItem('place');
  }
};

//--------------------------------------------- !!
var resetPswd = function(form){
  email = form.email.value;
  data = {"email" : email};
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", '/reset_password', true);
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var resetPswdResponse = JSON.parse(this.responseText);
      if(resetPswdResponse.success==false) {
        document.getElementById('resetMessage').innerHTML=' ';
        document.getElementById("resetMessage").style.display = "block";
        var error = document.createElement('h5');
        error.innerHTML = resetPswdResponse.message;
        document.getElementById("resetMessage").appendChild(error);
      } else {
        document.getElementById('resetMessage').innerHTML=' ';
        document.getElementById("resetMessage").style.display = "block";
        var success = document.createElement('h4');
        success.innerHTML = resetPswdResponse.message;
        document.getElementById("resetMessage").appendChild(success);
        document.forms['resetPswd'].reset();
      }
    }
  }
  xhttp.setRequestHeader("content-type", "application/json; charset=utf-8");
  xhttp.send(JSON.stringify(data));
};


//---------------------------------------------
//drag and drop functions
function allowDrop(ev) {
  ev.preventDefault();
};

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
};

function drop(ev) {
  ev.preventDefault();
  var message = ev.dataTransfer.getData("text");
  //delete a message
  if (ev.target == document.getElementById("trash")) {
      data = {"id" : message};
      var xhttp = new XMLHttpRequest();
      xhttp.open("POST", '/delete_message', true);
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          var deleteMessResponse = JSON.parse(this.responseText);
          if(deleteMessResponse.success==false) {  //error
            document.getElementById('deleteMessage').innerHTML=' ';
            document.getElementById("deleteMessage").style.display = "block";
            var error = document.createElement('h5');
            error.innerHTML = deleteMessResponse.message;
            document.getElementById("deleteMessage").appendChild(error);
          } else {
            ev.target.appendChild(document.getElementById(message));
          }
        }
      }
      xhttp.setRequestHeader("content-type", "application/json; charset=utf-8");
      xhttp.send(JSON.stringify(data));
  } else {
    //add an existing message into the textarea
    var clone = document.getElementById(message).cloneNode(true);
    clone.id = clone.id + (new Date()).getMilliseconds();
    var text = clone.innerHTML.split(": ");
    text = text[text.length-1];
    document.getElementById(ev.target.id).innerHTML = text;
  }
};

//---------------------------------------------
