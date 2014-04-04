console.log('Recorder initiated...');

var timer;
var rate = 100;
var mousePos;
var output = [];
var server = "http://127.0.0.1:4568";

var action = {
  move: 'move',
  onclick: 'onclick',
  ondblclick: 'ondblclick',
  onmousedown: 'onmousedown',
  onmouseover: 'onmouseover',
  onmouseout: 'onmouseout',
  onmouseup: 'onmouseup'
};

var handler = {};

handler.mouseMove = function (event) {
  event = event || window.event; // IE-ism
  mousePos = {
    x: event.clientX,
    y: event.clientY
  };
};

handler.action = function(name){
  console.log(name, mousePos);
  if (mousePos) {
    output.push({a: name, x: mousePos.x, y: mousePos.y, t: Date.now()});
  }
};

var send = function(output){
  console.log('Listener: Sending output...', output);
  jQuery.ajax({
    type: "POST",
    url: server + '/recording',
    data: JSON.stringify(output),
    contentType: 'application/json',
    success: function(data) {
      console.log('Ajax: Success');
    },
    error: function(data){
      console.log('Ajax: Failure');
    }
  });
};

window.onmousemove = handler.mouseMove;

var recorder = {};
window.recorder = recorder;

recorder.start = function(){
  console.log('Recorder: Started');
  timer = setInterval(function(){
    handler.action(action.move);
  }, rate);
};

recorder.stop = function(){
  console.log('Recorder: Stopped');
  clearInterval(timer);
  console.log(output);
  send(output);
  output = [];
};


handler.startRecording = recorder.start;
handler.stopRecording = recorder.stop;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (handler.hasOwnProperty(request.action)){
    handler[request.action]();
    sendResponse({response: "done"});
  }
});