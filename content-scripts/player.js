/* ------------------------------------------------------------------------------------*/
/* Player Class
/*
/* ------------------------------------------------------------------------------------*/

var Player = function(){};

window.Player = Player;
window.pause = false;


// moves mouse to given destination with duration
  Player.prototype.move = function (endX, endY, duration){
    d3.select('.mouse')
      .transition()
      .duration(duration)
      .style({'top':  endY + 'px', 'left': endX + 'px'});
  };

  // this function is very similar to Recorder.sendToBackground.  sends the nextKlick message to background, passing data over as the klick.
  Player.prototype.sendToBackground = function(data){
    console.log('Player: Sending to background');
    chrome.runtime.sendMessage({action : "nextKlick", klick: data});
  };

  // creates a new klick, starting from the indexes after a urlChanged event has happened.  calls the sendToBackground function and then redirects the page.
  Player.prototype.createNewKlick = function(data, index){
    data.ticks = data.ticks.slice(index+1);
    this.sendToBackground(data);
    setTimeout(function(){
      window.location.href = data.ticks[0].url;
    }, 2000);
  };


  // chains mouse moves together. also adds the scrolling logic. the pageX and pageY values of the movement object at index are passed to move.
  // function operates recursively, waiting the duration of the prior move in a setTimeout before calling the next move.
  Player.prototype.playRecording = function(data, index){
    var movement = data.ticks;
    if ( index === movement.length ) {
      $('.mouse').detach();
      console.log('movement finished');
    } else if (window.pause){
      var input = prompt('Place annotation here');
      movement[index].message = new Message(input, 2000, {top:movement[index].pageY, left:movement[index].pageX});
      window.pause = false;
      this.playRecording(data, index);
    }
      else {
      if(movement[index].action === 'click' || movement[index].action === 'keypress'){
        if(movement[index].url !== movement[index+1].url){
          this.createNewKlick(data, index);
        } else if (movement[index].action === 'click'){
          $($(movement[index].target.tagName)[movement[index].target.index]).trigger('click');
        } else if (movement[index].action === 'keypress'){
          var text = $($(movement[index].target.tagName)[movement[index].target.index]).val();
          $($(movement[index].target.tagName)[movement[index].target.index]).val(text + String.fromCharCode(movement[index].charCode));
        }
      } else if (movement[index].action === 'move'){
        $(window).scrollLeft(movement[index].pageX-movement[index].clientX);
        $(window).scrollTop(movement[index].pageY-movement[index].clientY);
        this.move(movement[index].pageX, movement[index].pageY, movement[index].t);
      }
      if (!!movement[index].message){
        movement[index].message.showMessageOnScreen();
      }
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
  // put movement[0].t === undefined so for multiple recordings, there would not be a lag between recordings
  Player.prototype.setMoveIntervals = function(data){
    var movement = data.ticks;
    if(movement[0].t === undefined){
      if(typeof movement[0].timestamp !== 'number'){
        this.parseDate(movement);
      }
      movement[0].t = 0;
      for (var i = 1; i < movement.length-1; i++){
        movement[i].t = movement[i].timestamp - movement[i-1].timestamp;
      }
      data.ticks = movement;
    }
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

  // submits an ajax request to the server based on a click id to get movement patterns back
  // data passed along to every step in this refactor. movement (which is the ticks array) can be derived in the moment.
  Player.prototype.getData = function(clickId){
    var that = this;
    $.ajax({
      // url: 'http://127.0.0.1:4568/klicks/' + clickId,
      url: 'http://klickr.io/klicks/' + clickId,
      type: 'GET',
      contentType: 'application/json',
      success: function(data){
        if(Array.isArray(data)){
          data = data[data.length-1];
        }
        that.scaleXY(data);
      }
    });
  };

  //  initiates the player methods. if the action is playKlick, idOrKlick is an id, and get request the server.
  //  otherwise, use the klick object and go straight to the playing.
  //  if action is playNextKlick, delay the play back for one second
  Player.prototype.playKlick = function(idOrKlick, action){
    if(action === 'playKlick'){
      console.log('play button clicked');
      idOrKlick = idOrKlick || '';
      this.getData(idOrKlick);
    }

    else if (action === 'playStagedKlick'){
      console.log('replay button clicked');
      this.scaleXY(idOrKlick);
    }

    else if (action === 'playNextKlick'){
      console.log('multi-page recording');
      var that = this;
      setTimeout(function(){
        that.scaleXY(idOrKlick);
      }, 1000);
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

    else if (request.action === 'playStagedKlick' || request.action === 'playNextKlick'){
      player.playKlick(request.klick, request.action);
      sendResponse({response: "Player: Playing Klick..."});
    }
    
    else if (request.action === 'pause'){
      window.pause = true;
    }

  });

  // sends message to background. if the next part of a multi-page click is stored, it will be sent to the player
  chrome.runtime.sendMessage({action : "domReady"});

});
