/* ------------------------------------------------------------------------------------*/
/* Saver Class
/*
/* ------------------------------------------------------------------------------------*/

var Saver= function(X, Y){

var boxWidth = 800;
var boxHeight = 400;


this.node = $('<div class="saveBox" style="position:fixed; background: red; width: ' + boxWidth +'px; height: ' + boxHeight + 'px; border-radius: 7.5px; top: '+ Math.floor(window.innerHeight/2 - boxHeight/2) +'px; left:'+ Math.floor(window.innerWidth/2-boxWidth/2)+'px;"></div>');



};

window.Saver = Saver;

// moves mouse to given destination with duration
  Saver.prototype.display = function (X, Y){
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
