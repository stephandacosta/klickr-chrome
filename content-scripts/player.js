/* ------------------------------------------------------------------------------------*/
/* Player Class
/*
/* ------------------------------------------------------------------------------------*/


/* ------------------------------------------------------------------------------------*/
/* Init
/* ------------------------------------------------------------------------------------*/

$(function(){

// moves mouse to given destination with duration
  var move = function (endX, endY, duration){
    d3.selectAll('.mouse')
    .transition()
    .duration(duration)
    .style({'top':  endY + 'px', 'left': endX + 'px'});
  };

  // chains mouse moves together
  var processData = function(arr, index, xScale, yScale){
    index = index || 0;
    xScale = xScale || 1;
    yScale = yScale || 1;
    if ( index === arr.length ) {
      return;
    } else {
      move(arr[index].pageX,arr[index].pageY,arr[index].t );
      setTimeout(function(){
        processData(arr, index+1);
      }, arr[index].t );
    }
  };

  //test data *** need to be cleared out ******
  var test ={"width":755,"height":618,"ticks":[{"action":"move","pageX":720,"pageY":274,"clientX":720,"clientY":230,"timestamp":1396654158484,"target":""},{"action":"move","pageX":653,"pageY":232,"clientX":653,"clientY":189,"timestamp":1396654158584,"target":""},{"action":"move","pageX":445,"pageY":417,"clientX":445,"clientY":373,"timestamp":1396654158684,"target":""},{"action":"move","pageX":288,"pageY":479,"clientX":288,"clientY":436,"timestamp":1396654158785,"target":""},{"action":"move","pageX":236,"pageY":246,"clientX":236,"clientY":202,"timestamp":1396654158886,"target":""},{"action":"move","pageX":403,"pageY":301,"clientX":403,"clientY":258,"timestamp":1396654158986,"target":""},{"action":"move","pageX":549,"pageY":489,"clientX":549,"clientY":446,"timestamp":1396654159087,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654159187,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654159288,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654159388,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654159488,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654159589,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654159689,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654159789,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654159889,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654159989,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654160089,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654160189,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654160290,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654160390,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654160490,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654160590,"target":""},{"action":"move","pageX":717,"pageY":293,"clientX":717,"clientY":250,"timestamp":1396654160691,"target":""}]};

  var playRecording = function(){
    var xScale = window.width / test["width"];
    var yScale = window.height / test["height"];
    var movement = test["ticks"];
    movement[0].t = 0;
    for (var i = 1; i < movement.length-1; i++){
      movement[i].t = movement[i]["timestamp"] - movement[i-1]["timestamp"];
    }
    processData(movement, 0, xScale, yScale);
  };

  // Listens to messages from background
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'playRecording'){
      $('body').append('<div class="mouse" style="position:absolute; background: red; width: 15px; height:15px; border-radius: 7.5px; top: 100px; left:100px;"></div>');
      playRecording();
    }
  });

});

