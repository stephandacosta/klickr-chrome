/* ------------------------------------------------------------------------------------*/
/* Player Class
/*
/* ------------------------------------------------------------------------------------*/

var Player = function(){};

window.Player = Player;

// moves mouse to given destination with duration
  Player.prototype.move = function (endX, endY, duration){
    d3.selectAll('.mouse')
    .transition()
    .duration(duration)
    .style({'top':  endY + 'px', 'left': endX + 'px'});
  };

  // chains mouse moves together
  Player.prototype.processData = function(arr, index, xScale, yScale){
    index = index || 1;
    xScale = xScale || 1;
    yScale = yScale || 1;
    if ( index === arr.length ) {
      $('.mouse').detach();
    } else {
      var xClientOrigin = (arr[index].pageX - arr[index].clientX) * xScale;
      var yClientOrigin = (arr[index].pageY - arr[index].clientY) * yScale;
      //$(window).scrollLeft(xClientOrigin)  $(window).scrollTop(yClientOrigin);
      this.move(arr[index].clientX, arr[index].clientY ,arr[index].t);
      var that = this;
      setTimeout(function(){
        that.processData(arr, index+1);
      }, arr[index].t );
    }
  };

  //test data *** need to be cleared out ******
  var test ={"width":755,"height":618,"ticks":[{"action":"move","pageX":720,"pageY":274,"clientX":720,"clientY":230,"timestamp":1396654158484,"target":""},{"action":"move","pageX":653,"pageY":232,"clientX":653,"clientY":189,"timestamp":1396654158584,"target":""},{"action":"move","pageX":445,"pageY":417,"clientX":445,"clientY":373,"timestamp":1396654158684,"target":""},{"action":"move","pageX":288,"pageY":479,"clientX":288,"clientY":436,"timestamp":1396654158785,"target":""},{"action":"move","pageX":236,"pageY":246,"clientX":236,"clientY":202,"timestamp":1396654158886,"target":""},{"action":"move","pageX":403,"pageY":301,"clientX":403,"clientY":258,"timestamp":1396654158986,"target":""},{"action":"move","pageX":549,"pageY":489,"clientX":549,"clientY":446,"timestamp":1396654159087,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654159187,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654159288,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654159388,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654159488,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654159589,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654159689,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654159789,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654159889,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654159989,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654160089,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654160189,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654160290,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654160390,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654160490,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654160590,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654160691,"target":""}]};

  Player.prototype.playRecording = function(data){
    var xScale = $(window).width() / data["width"];
    var yScale = $(window).height() / data["height"];
    var movement = data["ticks"];
    movement[0].t = 0;
    $('body').append('<div class="mouse" style="position:absolute; background: red; width: 15px; height:15px; border-radius: 7.5px; top: '+movement[0].pageY+'px; left:'+movement[0].pageX+'px;"></div>');
    for (var i = 1; i < movement.length-1; i++){
      movement[i].t = movement[i]["timestamp"] - movement[i-1]["timestamp"];
    }
    this.processData(movement, 1, xScale, yScale);
  };

  Player.prototype.getData = function(){
    var that = this;
    $.ajax({
      url: 'http://127.0.0.1:4568/klicks/'+clickID,
      type: 'GET',
      contentType: 'application/json',
      success: function(data){
        that.playRecording(data);
      }
    });
  };

  Player.prototype.playKlick = function(clickId){
    clickId = clickId || '';
    //when ready for connection with server, uncomment getData and remove playRecording(test), as well as test
    //this.getData();
    this.playRecording(test);
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
      player.playKlick(request.id);
      sendResponse({response: "Player: Playing Klick..."});
    }
  });

});
