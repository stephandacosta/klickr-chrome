/* ------------------------------------------------------------------------------------*/
/* Message Class
/* - Used by both the recorder and player class
/* - Produces <div> elements with text to display to the user
/* - Will have functionality fade out
/* ------------------------------------------------------------------------------------*/

var Message = function (text, duration, coords) {
  this.$message = $("<div></div>"); 
  this.$message.text(text);
  this.$message.css('z-index', 2147483647);

  this.showMessageOnScreen = function () {
    if (coords === undefined) {
      // place message in center, relative to viewport
      this.$message.center();  
    } else {
      // place message relative to top and left of document
      this.$message.css('position', 'absolute');
      this.$message.css('top', coords.top + 'px');
      this.$message.css('left', coords.left + 'px');
    }
    this.$message.fadeOut(duration);
  };

  // add this Message object's $message property onto DOM
  $(document.body).append(this.$message);
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