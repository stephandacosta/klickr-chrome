/* ------------------------------------------------------------------------------------*/
/* RECORDER
/* - Content script that records mouse movements and sends data to server
/* - Exists on a page, has access to DOM elements, but not to window object
/* - Communicates with background using events
/* ------------------------------------------------------------------------------------*/

/* ------------------------------------------------------------------------------------*/
/* Recorder Class
/* Records a klick and sends to server
/* ------------------------------------------------------------------------------------*/
var Recorder = function(){
  console.log('Initializing recorder...');
  this.server = "http://jy1.cloudapp.net:3000";
  this.rate = 10;
  this.mousePos = undefined;
  this.isRecording = false;

  // Create empty klick object
  this.klick = this.createKlick();

  // Add listeners
  this.addListeners();

  // Keep track of cursor positions
  // (cursor positions are logged using setInterval to prevent excessive logging)
  var self = this;
  window.onmousemove = function(event){
    self.mouseMove.apply(self, [event]);
  };
};

window.Recorder = Recorder;

/* Add other event listeners */
Recorder.prototype.addListeners = function(){
  var self = this;

  $('html').click(function(event){
    // Did the click happen on a <a> tag?
    if ($(event.target).is("a")) {
      self.log("urlChanged", event.pageX, event.pageY, event.clientX, event.clientY, event.timeStamp, event.target.outerHTML, undefined, event.altKey, event.ctrlKey, event.metaKey, event.shiftKey, document.url);
      // need to trigger the stop function for this recorder object and send to background
      self.stop();
      // I'm counting on the fact that clicking on a link will render to a new page.
    } else {
      self.log(event.type, event.pageX, event.pageY, event.clientX, event.clientY, event.timeStamp, event.target.outerHTML, undefined, event.altKey, event.ctrlKey, event.metaKey, event.shiftKey, document.url);
    }
  });

  $('html').keypress(function(event){
    var charCode = event.which || event.keyCode;
    self.log(event.type, event.pageX, event.pageY, event.clientX, event.clientY, event.timeStamp, event.target.outerHTML, charCode, event.altKey, event.ctrlKey, event.metaKey, event.shiftKey);
  });
};

/* Creates a new Klick object */
Recorder.prototype.createKlick = function(){
  return {
    width: window.innerWidth,
    height: window.innerHeight,

    // In order to enable multi-page functionality, we may need to move the url property
    // into each of the objects in the ticks array
    // url: document.URL,
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
Recorder.prototype.log = function(action, pageX, pageY, clientX, clientY, timestamp, target, charCode, altKey, ctrlKey, metaKey, shiftKey, url){
  if ( this.mousePos ) {
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
      shiftKey: shiftKey,
      url: url
    });
  }
};

/* Start recording */
Recorder.prototype.start = function(){
  console.log('Recorder: Started');
  if (!this.isRecording){
    var self = this;
    this.isRecording = true;
    // Willson: made timer a property of the recorder object
    this.timer = setInterval(function(){
      self.log();
    }, this.rate);
  }
};

/* Recorder.prototype.pause
 * Very similar to stop except don't send to background.
 */
// Recorder.prototype.pause = function() {
//   console.log('Recorder: Paused');
//   if (this.isRecording) {
//     this.isRecording = false;
//     clearInterval(this.timer);
//     // repeating stop right now
//     // this.sendToBackground(this.klick);
//   }
// };

/* Stop recording */
Recorder.prototype.stop = function(){
  console.log('Recorder: Stopped');
  if (this.isRecording){
    this.isRecording = false;
    clearInterval(this.timer);
    // Once the recorder stops recording, it will send the klick object to background.js to handle
    this.sendToBackground(this.klick);
  }
};

/* Launch saver box */
Recorder.prototype.displaySaverBox = function(klick){
  console.log('Recorder: Open saver box');
  chrome.runtime.sendMessage({action : "displaySaverBox"}, function(response){
    console.log(response);
  });
};

/* Stage output to extension backgroun for replay */
Recorder.prototype.sendToBackground = function(klick){
  console.log('Recorder: Sending to background');
  chrome.runtime.sendMessage({action : "stage", klick: klick}, function(response){
    console.log(response);
  });
};


/* ------------------------------------------------------------------------------------*/
/* Init
/* ------------------------------------------------------------------------------------*/

$(function(){

  // Helper for routing actions
  window.recorder = new Recorder();

  // Listens to messages from background
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'startRecording'){
      window.recorder.start();
      sendResponse({response: "Recorder: Started recording"});
    }

    // else if (request.action === 'pauseRecording'){
    //   recorder.pause();
    //   sendResponse({response: "Recorder: Paused recording"});
    // }

    else if (request.action === 'stopRecording'){
      window.recorder.stop();
      window.recorder = new Recorder(); // always have a new recorder object ready
      sendResponse({response: "Recorder: Stopped recording"});
    }
  });

});