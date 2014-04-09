/* ------------------------------------------------------------------------------------*/
/* RECORDER
/* - Content script that records mouse movements and sends data to server
/* - Exists on a page, has access to DOM elements, but not to window object
/* - Communicates with background using events
/* TODO: Send click, url, width, height
/* ------------------------------------------------------------------------------------*/

/* ------------------------------------------------------------------------------------*/
/* Recorder Class
/* Records a klick and sends to server
/* ------------------------------------------------------------------------------------*/
var Recorder = function(){
  console.log('Initializing recorder...');
  this.server = "http://jy1.cloudapp.net:3004";
  this.rate = 10;
  this.mousePos = undefined;
  this.isRecording = false;

  // Create empty klick
  this.klick = this.createKlick();

  // Add listners
  this.addListeners();

  // Keep track of cursor positions
  // (cursor positions are logged using setInterval to prevent excessive logging)
  var self = this;
  window.onmousemove = function(event){
    self.mouseMove.apply(self, event);
  };
};

window.Recorder = Recorder;

/* Add other event listeners */
Recorder.prototype.addListeners = function(){
  var self = this;
  $('html').click(function(event){
    // console.log(event);
    self.log(event.type, event.pageX, event.pageY, event.clientX, event.clientY, event.timeStamp, event.target.outerHTML, undefined, event.altKey, event.ctrlKey, event.metaKey, event.shiftKey);
  });
  $('html').keypress(function(event){
    // console.log(event);
    var charCode = event.which || event.keyCode;
    self.log(event.type, event.pageX, event.pageY, event.clientX, event.clientY, event.timeStamp, event.target.outerHTML, charCode, event.altKey, event.ctrlKey, event.metaKey, event.shiftKey);
  });
};

/* Creates a new Klick */
Recorder.prototype.createKlick = function(){
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    url: document.URL,
    description: '',
    ticks: []
  };
};

/* Records cursor positions */
Recorder.prototype.mouseMove = function(event) {
  event = event || window.event; // IE
  this.mousePos = {
    pageX: event.pageX,
    pageY: event.pageY,
    clientX: event.clientX,
    clientY: event.clientY
  };
};

/* Logs to output */
Recorder.prototype.log = function(action, pageX, pageY, clientX, clientY, timestamp, target, charCode, altKey, ctrlKey, metaKey, shiftKey){
  if (this.mousePos){
  action = action || 'move';
  pageX = pageX || this.mousePos.pageX;
  pageY = pageY || this.mousePos.pageY;
  clientX = clientX || this.mousePos.clientX;
  clientY = clientY || this.mousePos.clientY;
  timestamp = timestamp || Date.now();
  this.klick.ticks.push({
    action: action,
    pageX: pageX,
    pageY: pageY,
    clientX: clientX,
    clientY: clientY,
    timestamp: timestamp,
    target: '',
    charCode: charCode,
    altKey: altKey,
    ctrlKey: ctrlKey,
    metaKey: metaKey,
    shiftKey: shiftKey
  });
  }
};

/* Start recording */
Recorder.prototype.start = function(){
  console.log('Recorder: Started');
  if (!this.isRecording){
    var self = this;
    this.isRecording = true;
    timer = setInterval(function(){
      self.log();
    }, this.rate);
  }
};

/* Stop recording */
Recorder.prototype.stop = function(){
  console.log('Recorder: Stopped');
  if (this.isRecording){
    this.isRecording = false;
    clearInterval(timer);
    this.send(this.klick);
    //stephan code start
    this.sendToBackground(this.klick);
    // stephan code end
    this.klick = this.createKlick();
  }
};

/* Send output to server */
Recorder.prototype.send = function(klick){
  console.log('Recorder: Push to server...', JSON.stringify(klick));
  $.ajax({
    type: 'POST',
    url: this.server + '/klicks',
    data: JSON.stringify(klick),
    contentType: 'application/json',
    success: function(data) {
      console.log('Recorder: Klick sent', data);
    },
    error: function(data){
      console.log('Recorder: Klick send failed', data);
    }
  });
};

// STEPHAN CODE START
/* Launch saver box */
Recorder.prototype.displaySaverBox = function(klick){
  console.log('Recorder: Open Saver Box');
  chrome.runtime.sendMessage({action : "displaySaverBox"}, function(response){
  console.log(response);
  });
};
// STEPHAN CODE END

// STEPHAN CODE START
/*Stage output to extension backgroun for replay */
Recorder.prototype.sendToBackground = function(klick){
  console.log('Recorder: Sending to background');
  // ** commented code needs to be inserted if overriding the current send to server function ***
  // if (this.isRecording){
  //   this.isRecording = false;
  //   clearInterval(timer);
  chrome.runtime.sendMessage({action : "stage", klick: klick}, function(response){
    console.log(response);
  });
    // this.klick = this.createKlick();
  // }
};
// STEPHAN CODE END


/* ------------------------------------------------------------------------------------*/
/* Init
/* ------------------------------------------------------------------------------------*/

$(function(){

  // Helper for routing actions
  var recorder = new Recorder();

  // Listens to messages from background
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'startRecording'){
      recorder.start();
      sendResponse({response: "Recorder: Started recording"});
    } else if (request.action === 'stopRecording'){
      recorder.stop();
      sendResponse({response: "Recorder: Stopped recording"});
    }
     // STEPHAN CODE START
     // post request triggered by user clicking on 'save' in saver box via background
     else if (request.action === 'saveKlick'){
      recorder.send(request.klick);
      sendResponse({response: "Recorder: Saved recording"});
    }
     // STEPHAN CODE END
  });

});