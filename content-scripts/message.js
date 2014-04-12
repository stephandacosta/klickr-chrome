/* ------------------------------------------------------------------------------------*/
/* Message Class
/* - Used by both the recorder and player class
/* - Produces <div> elements with text to display to the user
/* - Will have functionality to fade in and out
/* ------------------------------------------------------------------------------------*/

var makeMessage = function (text) {
  var message = $("<div></div>");
  message.text(text);

  return message;
};

/* ------------------------------------------------------------------------------------*/
/* Init
/* ------------------------------------------------------------------------------------*/