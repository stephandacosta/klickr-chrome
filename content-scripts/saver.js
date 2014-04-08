/* ------------------------------------------------------------------------------------*/
/* Saver Class
/* - Content script that opens a "saver box" upon recording stop
/* - Saver box main buttons are: Replay, Save, Share. Each button triggers a sendmessge which can be listened to bz background
- Replay triggers background to play 'klick' recording staged in background window
- Save unhides description input forms, which in turn triggers backgraound to add description to staged klick and post to server via recorder content script
- Share shows link to recording stored in klikr.io server
/* ------------------------------------------------------------------------------------*/

/* ------------------------------------------------------------------------------------*/
/* Saver Class
/* Launches a popup to offer actions after recording has stopped
/* These actions trigger the background listeners to dispatch actions to recorder and player
/********* NEED TO CHECK AFTER INTEGRATION IF POST METHOD CAN BE REFACTORED IN SAVER CLASS
/* ------------------------------------------------------------------------------------*/
var Saver= function(){ 
  var boxHeight = 125;  //Height of the saver control box
  var boxWidth = 330;  //Width of the saver control box
  this.node = $('<div class="saveBox"></div>');
  this.buildHtml(boxHeight, boxWidth);
};

window.Saver = Saver;

// pops up the saver box
Saver.prototype.display = function (){
  $('body').append(this.node);
};

// pops out the saver box
Saver.prototype.hide = function (){
  this.node.detach();
};

// constructs the html elements within the saver box
Saver.prototype.buildHtml = function (boxHeight, boxWidth){

  // sizing and positioning of saver box
  this.node.css("height", boxHeight);
  this.node.css("width", boxWidth);
  this.node.css("z-index", 10000);
  this.node.css("top", window.innerHeight/2 - boxHeight/2);
  this.node.css("left", Math.floor(window.innerWidth/2-(boxWidth/2)));

  // close button
  this.node.append('<button type="button" id="close" style="font-size:20px; color=grey; float: right; margin-right: 5px; border: 0.5px solid;">X</button>');

  // klikr.io logo
  this.node.append('<p>Klikr.io</p>');

  // main saver box control buttons
  var menu = ['Replay', 'Save', 'Share'];
  for (var i = 0 ; i < menu.length ; i++){
    var $btn = $('<button type="button" id="' + menu[i].toLowerCase() + '">' + menu[i] + '</button>');
    $btn.css('width', 100);
    $btn.css('height', 50);
    $btn.css('font-size', 20);
    $btn.css('font-weight', 'normal');
    $btn.css('float', 'left');
    $btn.css('margin-left', 5);
    $btn.css('margin-right', 5);
    $btn.css('margin-top', 10);
    this.node.append($btn);
  }

  // description input forms (text input + submit button)
  // hidden until user clicks on 'save'
  this.node.append('<input type="text" id="desc" placeholder="Enter Description" style="visibility:hidden">');
  this.node.append('<button type="button" id="sendToServer" style="visibility:hidden">Submit</button>');

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

    //***** NEED TO CHECK IF EXTENSION ID NEEDS TO BE ADDED IN ARGEMENT FO SECURITY OR DEPLOYMENT ****

    // Replay button: background is instructed to play staged klick
    $('#replay').click(function() {
      chrome.runtime.sendMessage({action: "replay"}, function(response){
        console.log(response);
      });
    });

    // Save button: unhides description input form
    $('#save').click(function() {
      $('#desc').css('visibility', 'visible');
      $('#sendToServer').css('visibility', 'visible');
    });

    // Description form submit button: background is instructed to update description property of staged klick then unhides description input form
    $('#sendToServer').click(function() {
      var description = $('#desc').val();
      chrome.runtime.sendMessage({action: "save", description: description}, function(response){
        console.log(response);
      });
      $('#desc').css('visibility', 'hidden');
      $('#sendToServer').css('visibility', 'hidden');
      $('#save').attr("disabled", "disabled");
    });

    // Share button : NEED TO IMPLEMENT
    $('#share').click(function() {
      chrome.runtime.sendMessage({action: "share"}, function(response){
        console.log(response);
      });
    });

    // Close button : detach saver from DOM
    $('#close').click(function() {
      saver.hide();
    });

  });

});
