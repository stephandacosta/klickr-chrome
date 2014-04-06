/* ------------------------------------------------------------------------------------*/
/* Saver Class
/*
/* ------------------------------------------------------------------------------------*/

var Saver= function(){

this.node = $('<div class="input-group saveBox"><span class="input-group-addon">Description</span><input type="text" class="form-control" placeholder="Description  "></div>');
this.node.append(
  '<p></p><p></p>'+
  '<div class="btn-group">'+
    '<ul class="dropdown-menu" role="menu">' +
      '<li><a href="#">Action</a></li>' +
      '<li><a href="#">Another action</a></li>' +
      '<li><a href="#">Something else here</a></li>' +
      '<li class="divider"></li>' +
      '<li><a href="#">Separated link</a></li>' +
    '</ul>'+
  '</div>');

var boxHeight = 300;
var boxWidth = 600;

this.node.css("height", boxHeight);
this.node.css("width", boxWidth);
this.node.css("top", window.innerHeight/2 - boxHeight/2);
this.node.css("left", Math.floor(window.innerWidth/2-(boxWidth/2)));

// this.node.append($('<div class="input-group"><span class="input-group-addon">Description</span><input type="text" class="form-control" placeholder="Description  "></div>'));
// this.node.append($('<p></p>'));
// this.node.append($('<p class="saveBox">Description</p>'));
// this.node.append($('<input id="description"></input>'));
};

window.Saver = Saver;

// moves mouse to given destination with duration
  Saver.prototype.display = function (){
    console.log('windowwidth', window.innerWidth);
    $('body').append(this.node);

  };



/* ------------------------------------------------------------------------------------*/
/* Init
/* ------------------------------------------------------------------------------------*/

$(function(){

  //helper for playing back mouse actions
  var saver = new Saver();

  // Listens to messages from background
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'openSaver'){
      saver.display();
      sendResponse({response: "Saver: Displaying..."});
    }
  });

});
