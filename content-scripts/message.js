/* ------------------------------------------------------------------------------------*/
/* Message Class
/* - Used by both the recorder and player class
/* - Produces <div> elements with text to display to the user
/* - Will have functionality to fade in and out
/* ------------------------------------------------------------------------------------*/

var makeMessage = function (text, duration, coords) {
  var $message = $("<div></div>");
  $message.text(text);

  // set z-index to be high
  $message.css('z-index', 2147483647);

  // append start message on screen
  $(document.body).append($message);

  if (coords === undefined) {
    // place message in center, relative to viewport
    $message.center();  
  } else {
    // place message relative to top and left of document
    $message.css('position', 'absolute');
    $message.css('top', coords.top + 'px');
    $message.css('left', coords.left + 'px');
  }

  // fadeOut the start message from screen
  $message.fadeOut(duration);
  
  return $message;
};

/* ------------------------------------------------------------------------------------*/
/* Init
/* ------------------------------------------------------------------------------------*/

jQuery.fn.center = function () {
  this.css('position','absolute');
  this.css('top', Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + 
                                                $(window).scrollTop()) + 'px');
  this.css('left', Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + 
                                                $(window).scrollLeft()) + 'px');
  return this;
};