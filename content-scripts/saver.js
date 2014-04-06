/* ------------------------------------------------------------------------------------*/
/* Saver Class
/*
/* ------------------------------------------------------------------------------------*/

var Saver= function(){

this.node = $('<div class="saveBox"></div>');

var boxHeight = 300;
var boxWidth = 600;

this.node.css("height", boxHeight);
this.node.css("width", boxWidth);
this.node.css("top", window.innerHeight/2 - boxHeight/2);
this.node.css("left", Math.floor(window.innerWidth/2-(boxWidth/2)));

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
