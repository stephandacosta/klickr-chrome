/* ------------------------------------------------------------------------------------*/
/* Message Class
/* - Used by both the recorder and player class
/* - Produces <div> elements with text to display to the user
/* - Will have functionality to fade in and out
/* ------------------------------------------------------------------------------------*/

var makeMessage = function (text) {
  var $message = $("<div></div>");
  $message.text(text);
  return $message;
};

var makeStartMessage = function (text, duration) {
  var $message = makeMessage(text);
  // append start message on screen
  $(document.body).append($message);
  // center the start message on screen
  $message.center();
  // fadeOut the start message from screen
  $message.fadeOut(duration);
};

/* ------------------------------------------------------------------------------------*/
/* Init
/* ------------------------------------------------------------------------------------*/

jQuery.fn.center = function () {
  this.css("position","absolute");
  this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + 
                                                $(window).scrollTop()) + "px");
  this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + 
                                                $(window).scrollLeft()) + "px");
  return this;
};