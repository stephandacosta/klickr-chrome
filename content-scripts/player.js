/* ------------------------------------------------------------------------------------*/
/* Player Class
/*
/* ------------------------------------------------------------------------------------*/

var Player = function(){};

window.Player = Player;

// moves mouse to given destination with duration
  Player.prototype.move = function (endX, endY, duration, action){
    if(action === 'move'){
      d3.select('.mouse')
       .transition()
       .duration(duration)
       .style({'top':  endY + 'px', 'left': endX + 'px'});
    } else if(action === 'click'){

    }
  };

  // chains mouse moves together. also adds the scrolling logic. the pageX and pageY values of the movement object at index are passed to move.
  // function operates recursively, waiting the duration of the prior move in a setTimeout before calling the next move.
  Player.prototype.playRecording = function(movement, index){
    //maybe try removing setTimeout
    if ( index === movement.length ) {
      $('.mouse').detach();
      console.log('movement finished');
    } else {
      //$(window).scrollLeft(xClientOrigin)  $(window).scrollTop(yClientOrigin);

      // Willson: the idea I have is to look at the current arr[index] and check that object's event.type.
      // If the event.type is a 'click' event, then redirect to the event.target page first before continuing
      // processing playRecording for arr[index + 1].

      $(window).scrollLeft(movement[index].pageX-movement[index].clientX);
      $(window).scrollTop(movement[index].pageY-movement[index].clientY);
      this.move(movement[index].pageX, movement[index].pageY ,movement[index].t, movement[index].action);

      var that = this;
      setTimeout(function(){
        that.playRecording(movement, index+1);
      }, movement[index].t);
    }
  };

  //places the mouse in the dom and gives the mouse's initial position and characteristics
  Player.prototype.placeMouse = function(movement){
    $('body').append('<div class="mouse" style="position:absolute; background: blue; width: 15px; z-index: 9999; height:15px; border-radius: 7.5px; top: '+movement[0].pageY+'px; left:'+movement[0].pageX+'px;"></div>');
    this.playRecording(movement, 1);
  };

  //uses Date.parse to turn the timestamp value from a date to an integer.  Also establishes the t value of the movement array.
  Player.prototype.setMoveIntervals = function(movement){
    movement[0].t = 0;
    for (var i = 1; i < movement.length-1; i++){
      movement[i].t = movement[i].timestamp - movement[i-1].timestamp;
    }
    this.placeMouse(movement);
  };

  //changes the iso date object in timestamp to an integer of the Date.now() format
  Player.prototype.parseDate = function(movement){
    for(var i = 0; i < movement.length; i++){
      movement[i].timestamp = Date.parse(movement[i].timestamp);
    }
    setMoveIntervals(movement);
  };

  //scales clientX, clientY, pageX, and pageY so different screen sizes will have the same display.
  Player.prototype.scaleXY = function(data){
    console.log('played klick', data);
    var xScale = $(window).width() / data.width || 1;
    var yScale = $(window).height() / data.height || 1;
    data.width = $(window).width();
    data.height = $(window).height();
    for(var i = 0; i < data.ticks.length; i++){
      data.ticks[i].clientX = data.ticks[i].clientX*xScale;
      data.ticks[i].clientY = data.ticks[i].clientY*yScale;
      data.ticks[i].pageX = data.ticks[i].pageX*xScale;
      data.ticks[i].pageY = data.ticks[i].pageY*yScale;
    }
    this.setMoveIntervals(data.ticks);
  };

  //submits an ajax request to the server based on a click id to get movement patterns back
  Player.prototype.getData = function(clickId){
    var that = this;
    $.ajax({
      url: 'http://jy1.cloudapp.net:3000/klicks/'+clickId,
      type: 'GET',
      contentType: 'application/json',
      success: function(data){
        console.log(data);
        if(Array.isArray(data)){
          data = data[data.length-1];
        }
        that.scaleXY(data);
      }
    });
  };

  //initiates the player methods
  Player.prototype.playKlick = function(clickId){
    clickId = clickId || '';
    this.getData(clickId);
  };


/* ------------------------------------------------------------------------------------*/
/* Init
/* ------------------------------------------------------------------------------------*/

$(function(){

  //helper for playing back mouse actions
  var player = new Player();

  // Listens to messages from background
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'playKlick'){
      console.log('play button clicked');
      player.playKlick(request.id);
      sendResponse({response: "Player: Playing Klick..."});
    } else if (request.action === 'playStagedKlick'){
      console.log('replay button clicked');
      console.log('staged klick: ', request.klick);
      player.scaleXY(request.klick);
      // ##### CHECK PLAYBACK WORKING
      sendResponse({response: "Player: Playing Staged Klick..."});
    }
  });

});

