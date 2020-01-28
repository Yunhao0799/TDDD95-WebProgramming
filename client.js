

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
    console.log(signUpResponse);  //doesn't work, always error : User already exists
    alert(signUpResponse.message);
    if (signUpResponse==false) {
      return false;
    } else {
      
      return true;
    }
  } else {
    return false;
  };
};

checkSignIn = function(form){

  let user, password;
  // user = document.forms["log"]["logMail"].value;
  // password = document.forms["log"]["logPswd"].value;
  user = form.logMail.value;
  user = form.logPswd.value;
  var signInResponse = serverstub.signIn(user, password);
  
  console.log(signInResponse);

  if(signInResponse.success == true){
    localStorage.setItem("token", signInResponse.data);
    return displayView("profileview");
  }else{
    alert(signInResponse.message);
    return false;
  }
}

window.onload = function(){
  //code that is executed as the page is loaded.
  if(this.localStorage.getItem("token") === null)
    displayView('welcomeview')
  else  
    displayView("profileview")
};


function openTab(tabName){
  let tabs = document.getElementsByClassName("tab");
  console.log(x);
  for(let i = 0; i < tabs.length; i++)
    tabs[i].style.display = "none";

  // let tabMenu = document.getElementsByClassName("tabsMenu");
  // for(let i = 0; i < tabMenu.length; i++)
  //   tabMenu[i].className = tabMenu[i].className.replace(" highlighted", "");

  
  document.getElementById(tabName).style.display = "block";
  // evt.currentTarget.className += " highlighted";
}
