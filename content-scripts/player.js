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

  // chains mouse moves together
  Player.prototype.playRecording = function(arr, index, xScale, yScale){
    if ( index === arr.length ) {
      $('.mouse').detach();
      console.log('movement finished');
    } else {
      //$(window).scrollLeft(xClientOrigin)  $(window).scrollTop(yClientOrigin);
      this.move(arr[index].clientX, arr[index].clientY ,arr[index].t);
      var that = this;
      setTimeout(function(){
        that.playRecording(arr, index+1);
      }, arr[index].t);
    }
  };

  //places the mouse in the dom and gives the mouse's initial position and characteristics
  Player.prototype.placeMouse = function(movement){
    $('body').append('<div class="mouse" style="position:absolute; background: blue; width: 15px; z-index: 9999; height:15px; border-radius: 7.5px; top: '+movement[0].pageY+'px; left:'+movement[0].pageX+'px;"></div>');
    this.playRecording(movement, 1);
  };

  //establishes the t value of the movement array
  Player.prototype.setMoveIntervals = function(movement){
    movement[0].t = 0;
    for (var i = 1; i < movement.length-1; i++){
      //movement[i].t = movement[i]["timestamp"] - movement[i-1]["timestamp"];
      movement[i].t = 1;
    }
    movement[movement.length-1].t = 1;
    this.placeMouse(movement);
  };

  //scales x and y so different screen sizes will have the same display. also, checks where the window origin is on the page.
  Player.prototype.scaleXY = function(data){
    var xScale = $(window).width() / data["width"] || 1;
    var yScale = $(window).height() / data["height"] || 1;
    console.log("my width: "+$(window).width() + ", former width: " + data["width"]);
    console.log("x scale:"+xScale);
    for(var i = 0; i < data.ticks.length; i++){
      data.ticks[i].clientX = data.ticks[i].clientX*xScale;
      data.ticks[i].clientY = data.ticks[i].clientY*yScale;
      data.ticks[i].pageX = data.ticks[i].pageX*xScale;
      data.ticks[i].pageY = data.ticks[i].pageY*yScale;
      data.ticks[i].xClientOrigin = data.ticks[i].pageX-data.ticks[i].clientX;
      data.ticks[i].yClientOrigin = data.ticks[i].pageY-data.ticks[i].clientY;
    }
    this.setMoveIntervals(data.ticks);
  };

  //submits an ajax request to the server based on a click id to get movement patterns back
  Player.prototype.getData = function(clickId){
    var that = this;
    $.ajax({
      url: 'http://jyek.cloudapp.net:3004/klicks/'+clickId,
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
    }
  });

});
