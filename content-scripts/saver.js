/* ------------------------------------------------------------------------------------*/
/* Saver Class
/*
/* ------------------------------------------------------------------------------------*/


var Saver= function(){ 
  var boxHeight = 125;
  var boxWidth = 330;
  this.node = $('<div class="saveBox"></div>');
  this.buildHtml(boxHeight, boxWidth);
};

window.Saver = Saver;

// moves mouse to given destination with duration
Saver.prototype.display = function (){
  $('body').append(this.node);
};

Saver.prototype.hide = function (){
  this.node.detach();
};

Saver.prototype.buildHtml = function (boxHeight, boxWidth){
  this.node.css("height", boxHeight);
  this.node.css("width", boxWidth);
  this.node.css("z-index", 10000);
  this.node.css("top", window.innerHeight/2 - boxHeight/2);
  this.node.css("left", Math.floor(window.innerWidth/2-(boxWidth/2)));


  this.node.append('<button type="button" id="close" style="font-size:20px; color=grey; float: right; margin-right: 5px; border: 0.5px solid;">X</button>');
  this.node.append('<p>Klikr.io</p>');


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
    $btn.css('margin-top', 10);
    // $btn.css.css('border', 2);
    // $btn.css.css('border-radius', 15);
    // $btn.css.css('background', white);
    // $btn.text('Replay');
    this.node.append($btn);
  }

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

        //***** check if extension ID needs to be added in argument for security ****
      $('#replay').click(function() {
        chrome.runtime.sendMessage({action: "replay"}, function(response){
          console.log(response);
        });
      });

      $('#save').click(function() {
        $('#desc').css('visibility', 'visible');
        $('#sendToServer').css('visibility', 'visible');
      });

      $('#sendToServer').click(function() {
        var description = $('#desc').val();
        console.log("Description:", description);
        chrome.runtime.sendMessage({action: "save", description: description}, function(response){
          console.log(response);
        });
        $('#desc').css('visibility', 'hidden');
        $('#sendToServer').css('visibility', 'hidden');
        $('#save').attr("disabled", "disabled");
      });

      $('#share').click(function() {
        chrome.runtime.sendMessage({action: "share"}, function(response){
          console.log(response);
        });
      });

      $('#close').click(function() {
        saver.hide();
      });

    }
  });

});
