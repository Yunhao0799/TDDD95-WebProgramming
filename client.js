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
    serverstub.signUp(account);
    console.log(serverstub.signUp(account));  //doesn't work, always error : User already exists
    alert(serverstub.signUp(account).message);
    if (serverstub.signUp(account).success==false) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  };
};



window.onload = function(){
  //code that is executed as the page is loaded.
  displayView('welcomeview')
};
