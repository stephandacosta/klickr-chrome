/* ------------------------------------------------------------------------------------*/
/* BACKGROUND RECORDER
/* ------------------------------------------------------------------------------------*/

var BgRecorder = function(){
  this.isRecording = true;
  this.createKlick();
  this.initEventHandlers();
  this.updateActiveTabUrl();
  helpers.activeTabSendMessage({
    action: 'createMessage',
    message: 'Start Recording Now',
    duration: 2000,
    coords: undefined
  });
  helpers.activeTabSendMessage({action: 'startRecording'});
};

window.BgRecorder = BgRecorder;

/* Creates a new Klick object */
BgRecorder.prototype.createKlick = function(){
  this.klick = {
    url: document.URL,
    description: '',
    ticks: []
  };
  this.getWindowSize();
};

/* Add description */
BgRecorder.prototype.addDescription = function(desc){
  this.klick.description = desc;
};

/* Update active tab url */
BgRecorder.prototype.updateActiveTabUrl = function(){
  var self = this;
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    self.activeUrl = tabs[0].url;
    console.log('BgRecorder: Url changed', self.activeUrl);
  });
};

/* Add listeners */
BgRecorder.prototype.initEventHandlers = function(){
  var self = this;

  // Update URL for active tab when it changes
  chrome.tabs.onUpdated.addListener(function(){
    self.updateActiveTabUrl();
  });

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // Appends tick to Klick
    if (request.action === 'appendTick') {
      self.klick.ticks.push(request.tick);
    }

    // On change of URL, start recording again when recorder ready
    else if (request.action === 'recorderReady') {
      chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        if (self.isRecording && tabs[0].url === request.url){
          helpers.activeTabSendMessage({action: 'startRecording'});
        }
      });
    }
  });

};

/* Gets inner width and height from active tab */
BgRecorder.prototype.getWindowSize = function(){
  var self = this;
  helpers.activeTabSendMessage({action: 'getWindowSize'}, function(response){
    self.klick.width = response.innerWidth;
    self.klick.height = response.innerHeight;
  });
};

/* Append tick to Klick object */
BgRecorder.prototype.appendTick = function(tick){
  // only accepts ticks from a single URL at one time
  if (this.activeUrl === tick.url){
    this.klick.ticks.append(tick);
  }
};

/* Append tick to Klick object */
BgRecorder.prototype.stop = function(){
  helpers.activeTabSendMessage({action: 'stopRecording'});
  helpers.activeTabSendMessage({
    action: 'createMessage',
    message: 'Stop Recording Now',
    duration: 2000,
    coords: undefined
  });
  window.openSaver();
};

/* Background -> Server: Send current klick object to the server to save */
BgRecorder.prototype.send = function(){
  console.log('BgRecorder -> Server: Push to server...', JSON.stringify(this.klick));
  $.ajax({
    type: 'POST',
    url: Klickr.server + '/klicks',
    data: JSON.stringify(this.klick),
    contentType: 'application/json',
    success: function(data) {
      console.log('BgRecorder -> Server: Klick sent', data);
    },
    error: function(data){
      console.log('BgRecorder -> Server: Klick send failed', data);
    }
  });
};