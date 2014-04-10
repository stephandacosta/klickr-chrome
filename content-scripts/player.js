/* ------------------------------------------------------------------------------------*/
/* Player Class
/*
/* ------------------------------------------------------------------------------------*/

var Player = function(){};

window.Player = Player;

// moves mouse to given destination with duration
  Player.prototype.move = function (endX, endY, duration){
    d3.select('.mouse')
      .transition()
      .duration(duration)
      .style({'top':  endY + 'px', 'left': endX + 'px'});
  };

  // this function identical to Recorder.sendToBackground. can factor out later
  Player.prototype.sendToBackground = function(data){
    console.log('Recorder: Sending to background');
    chrome.runtime.sendMessage({action : "stage", klick: data}, function(response){
      console.log(response);
    });
  };


  Player.prototype.createNewKlick = function(data, index){
    data.ticks = data.ticks.slice(index);
    this.sendToBackground(data);
  };

  // chains mouse moves together. also adds the scrolling logic. the pageX and pageY values of the movement object at index are passed to move.
  // function operates recursively, waiting the duration of the prior move in a setTimeout before calling the next move.
  Player.prototype.playRecording = function(data, index){
    var movement = data.ticks;
    if ( index === movement.length ) {
      $('.mouse').detach();
      console.log('movement finished');
    } else {

      if(movement[index].action === 'urlChanged'){
        this.createNewKlick(data, index);
      }
      $(window).scrollLeft(movement[index].pageX-movement[index].clientX);
      $(window).scrollTop(movement[index].pageY-movement[index].clientY);
      this.move(movement[index].pageX, movement[index].pageY ,movement[index].t, movement, index);
      var that = this;
      setTimeout(function(){
        that.playRecording(data, index+1);
      }, movement[index].t);
    }
  };

  //places the mouse in the dom and gives the mouse's initial position and characteristics
  Player.prototype.placeMouse = function(data){
    var movement = data.ticks;
    $('body').append('<div class="mouse" style="position:absolute; background: blue; width: 15px; z-index: 9999; height:15px; border-radius: 7.5px; top: '+movement[0].pageY+'px; left:'+movement[0].pageX+'px;"></div>');
    this.playRecording(data, 1);
  };

  //uses Date.parse to turn the timestamp value from a date to an integer.  Also establishes the t value of the movement array.
  Player.prototype.setMoveIntervals = function(data){
    var movement = data.ticks;
    if(typeof movement[0].timestamp !== 'number'){
      this.parseDate(movement);
    }
    movement[0].t = 0;
    for (var i = 1; i < movement.length-1; i++){
      movement[i].t = movement[i].timestamp - movement[i-1].timestamp;
    }
    data.ticks = movement;
    this.placeMouse(data);
  };

  //changes the iso date object in timestamp to an integer of the Date.now() format
  Player.prototype.parseDate = function(movement){
    for(var i = 0; i < movement.length; i++){
      movement[i].timestamp = Date.parse(movement[i].timestamp);
    }
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
    this.setMoveIntervals(data);
  };

  //submits an ajax request to the server based on a click id to get movement patterns back
  // data passed along to every step in this refactor. movement (which is the ticks array) can be derived in the moment.
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
  Player.prototype.playKlick = function(idOrKlick, action){
    if(action === 'playKlick'){
      console.log('play button clicked');
      idOrKlick = idOrKlick || '';
      this.getData(idOrKlick);
    }

    else if(action === 'playStagedKlick'){
      console.log('replay button clicked');
      this.scaleXY(idOrKlick);
    }
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
      player.playKlick(request.id, request.action);
      sendResponse({response: "Player: Playing Klick..."});
    }

    else if (request.action === 'playStagedKlick'){
      player.playKlick(request.klick, request.action);
      sendResponse({response: "Player: Playing Staged Klick..."});
    }
  });

});
