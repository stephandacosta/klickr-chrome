/* ------------------------------------------------------------------------------------*/
/* Saver Class
/*
/* ------------------------------------------------------------------------------------*/


var Saver= function(){ 
  var boxHeight = 120;
  var boxWidth = 400;
  this.node = $('<div class="saveBox"></div>');
  this.buildHtml(boxHeight, boxWidth);
};

window.Saver = Saver;

// moves mouse to given destination with duration
Saver.prototype.display = function (){
  $('body').append(this.node);
};

Saver.prototype.buildHtml = function (boxHeight, boxWidth){
  this.node.css("height", boxHeight);
  this.node.css("width", boxWidth);
  this.node.css("z-index", 10000);
  this.node.css("top", window.innerHeight/2 - boxHeight/2);
  this.node.css("left", Math.floor(window.innerWidth/2-(boxWidth/2)));


  this.node.append('<input type="text" placeholder="Enter Description">');

  var menu = ['Replay', 'Save', 'Share'];

  for (var i = 0 ; i < menu.length ; i++){
    var $btn = $('<button type="button" id="' + menu[i].toLowerCase() + '">' + menu[i] + '</button>');
    // $btn.text(menu[i]);
    $btn.css('width', 100);
    $btn.css('height', 50);
    $btn.css('font-size', 20);
    $btn.css('font-weight', 'normal');
    $btn.css('float', 'left');
    $btn.css('margin-left', 5);
    $btn.css('margin-right', 5);
    // $btn.css.css('border', 2);
    // $btn.css.css('border-radius', 15);
    // $btn.css.css('background', white);
    // $btn.text('Replay');
    this.node.append($btn);
  }

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

        //***** check if extension ID needs to be added in argument for security ****
      $('#replay').click(function() {
        chrome.runtime.sendMessage({action: "replay"}, function(response){
          console.log(response);
        });
      });

      $('#save').click(function() {
        chrome.runtime.sendMessage({action: "save"}, function(response){
          console.log(response);
        });
      });

      $('#share').click(function() {
        chrome.runtime.sendMessage({action: "share"}, function(response){
          console.log(response);
        });
      });

    }
  });

});
