displayView = function(viewId){
  // the code required to display a view
  const viewContent = window.document.getElementById(viewId).innerText
  window.document.getElementById('content').innerHTML = viewContent
};
window.onload = function(){
  //code that is executed as the page is loaded.
  //You shall put your own custom code here.
  //window.alert("Hello TDDD97!");
  displayView('welcomeview')
};