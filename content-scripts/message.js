/* ------------------------------------------------------------------------------------*/
/* Message Class
/* - Used by Player class
/* - Produces <div> element with text to display to user
/* - Built-in functionality to fade out
/* ------------------------------------------------------------------------------------*/


var formatMessage = function(div){
   div.css({
    "background-color": "rgba(230, 230, 250, 0.9)",
    "color": "black",
    "border-radius": "5px",
    "padding": "15px",
    "font-size": "24px",
    "max-width": "50%",
    "z-index": 2147483647
  });
};


var positionMessage = function (div, coords) {
  if (coords === undefined) {
    // place message in center, relative to viewport, for recording messages
    div.css('position','absolute');
    div.css('top', window.innerHeight/2 - div.outerHeight()/2);
    div.css('left', window.innerWidth/2 - div.outerWidth()/2);
  } else {
    // place message relative to top and left of document for annotations
    div.css('position', 'absolute');
    div.css('top', coords.top+ 45 + 'px');
    div.css('left', coords.left + 'px');
  }
};


var Message = function (text, duration, coords) {
  this.$message = $("<div></div>");
  formatMessage(this.$message);
  this.$message.text(text);
  positionMessage(this.$message, coords);
  console.log('text', text, 'duration',duration);
  this.$message.fadeOut(duration, function(){
    console.log('jquery effect done for', text);
  });

  // add this Message object's $message property onto DOM
  $(document.body).append(this.$message);
};


/* ------------------------------------------------------------------------------------*/
/* Init
/* ------------------------------------------------------------------------------------*/

$(function () {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var message;

    if (request.action === 'createMessage'){
      message = new Message(request.message, request.duration, request.coords);
      positionMessage(message.$message);
      sendResponse({response: "Message: Message has been displayed on screen"});
    }
    else if (request.action === 'showRecordMessage'){
      console.log("showRecordMessage is received");
      message = new Message(request.message);
      message.$message.css({
        "position": "absolute",
        "top": 0,
        "left": 0
      });
      $(document.body).append(message.$message);
      window.recordingMessage = message;
      sendResponse({response: "Message: Message has been displayed on screen"});
    }

    else if (request.action === 'removeRecordMessage'){
      if (window.recordingMessage !== undefined) {
        console.log("removeRecordMessage is received");
        window.recordingMessage.$message.fadeOut(3000);
        sendResponse({response: "Message: Message has been displayed on screen"});
      }
    }
  });
});

