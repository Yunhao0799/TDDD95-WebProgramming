displayView = function(viewId){
  // the code required to display a view
  const viewContent = window.document.getElementById(viewId).innerText
  window.document.getElementById('content').innerHTML = viewContent
};

checkPassword = function(form) {

  var goodLength = function(password) {
    if(password.value.length < 5) {
      var box1 = document.getElementById("password1");
      var errorLength = document.createElement('p');
      errorLength.textContent = "Password too short. You need at least 5 characters."; //put it in red and smaller
      box1.insertAdjacentElement('afterend', errorLength);
      return false;
    } else {
      return true;
    }
  };

  var samePwd = function(password1, password2) {
    if(password1.value != password2.value) {
      var box2 = document.getElementById("password2");
      var errorSame = document.createElement('p');
      errorSame.textContent = "It is not the same password"; //put it in red and smaller
      box2.insertAdjacentElement('afterend', errorSame);
      return false;
    } else {
      return true;
    }
  }

  if(goodLength(form.password1) && goodLength(form.password2) && samePwd(form.password1, form.password2)) {
    //I'm not sure we need to check the length of the two passwords...
    return true
  } else {
    return false;
  };
};



window.onload = function(){
  //code that is executed as the page is loaded.
  displayView('welcomeview')
};
