/* ---------------------------------------------------------- */
/* Logger
/* TODO: Send click, url, width, height
/* ---------------------------------------------------------- */

var Recorder = function(){
  console.log('Initiating recorder...');
  this.server = "http://127.0.0.1:4568";
  this.rate = 100;
  this.output = [];
  this.mousePos = undefined;
  this.actions = {
    move: 'move'
  };

  // Initialize recording
  var self = this;
  window.onmousemove = function(event){
    self.mouseMove.apply(self, event);
  };
};

window.Recorder = Recorder;

Recorder.prototype.mouseMove = function (event) {
  event = event || window.event; // IE
  this.mousePos = {
    x: event.pageX,
    y: event.pageY
  };
};

Recorder.prototype.log = function(name){
  console.log(this.mousePos);
  if (this.mousePos) {
    console.log(name);
    this.output.push({a: name, x: this.mousePos.x, y: this.mousePos.y, t: Date.now()});
  }
};

Recorder.prototype.start = function(){
  console.log('Recorder: Started');
  var self = this;

  timer = setInterval(function(){
    self.log(self.actions.move);
  }, this.rate);
};

Recorder.prototype.stop = function(){
  console.log('Recorder: Stopped');
  clearInterval(timer);
  recorder.send(this.output);
  this.output = [];
};

Recorder.prototype.send = function(output){
  console.log('Recorder: Push to server...', output);
  jQuery.ajax({
    type: "POST",
    url: this.server + '/klicks',
    data: JSON.stringify(output),
    contentType: 'application/json',
    success: function(data) {
      console.log('Recorder: Klick sent', data);
    },
    error: function(data){
      console.log('Recorder: Klick send failed', data);
    }
  });
};

/* ---------------------------------------------------------- */
/* Init
/* ---------------------------------------------------------- */

// Helper for routing actions
var recorder = new Recorder();

// Listens to messages from background
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'startRecording'){
    recorder.start();
    sendResponse({response: "done"});
  } else if (request.action === 'stopRecording'){
    recorder.stop();
    sendResponse({response: "done"});
  }
});

