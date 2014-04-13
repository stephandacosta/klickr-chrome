/* ------------------------------------------------------------------------------------*/
/* BACKGROUND RECORDER
/* Consolidates ticks streamed from content script recorders into Klick object
/* ------------------------------------------------------------------------------------*/

var BgRecorder = function(){

  // bind listeners so they can be removed later
  this.bindUpdateActiveTab = helpers.bind(this.updateActiveTab, this);
  this.bindMsgHandler = helpers.bind(this.msgHandler, this);

  // init
  this.isRecording = true;
  this.createKlick();
  this.bindUpdateActiveTab();
  this.addListeners();
  this.msgStart();
  helpers.activeTabSendMessage({action: 'startRecording'});

};

window.BgRecorder = BgRecorder;

/* Display start recording message */
BgRecorder.prototype.msgStart = function(){
  helpers.activeTabSendMessage({
    action: 'createMessage',
    message: 'Start Recording Now',
    duration: 2000,
    coords: undefined
  });
};

/* Display stop recording message */
BgRecorder.prototype.msgStop = function(){
  helpers.activeTabSendMessage({
    action: 'createMessage',
    message: 'Stop Recording Now',
    duration: 2000,
    coords: undefined
  });
};

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
BgRecorder.prototype.updateActiveTab = function(){
  if (this.isRecording){
    var self = this;

    // update active tab and start its recording
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
      self.activeUrl = tabs[0].url;
      self.activeTabId = tabs[0].id;
      chrome.tabs.sendMessage(self.activeTabId, {action: 'startRecording'});
      console.log('BgRecorder: Url changed on tab', self.activeTabId, 'with url', self.activeUrl);
    });

    // stop other tabs from recording
    chrome.tabs.query({'lastFocusedWindow': false}, function(tabs){
      for (var i = 0; i < tabs.length; i++){
        chrome.tabs.sendMessage(tabs[i].id, {action: 'stopRecording'});
      }
    });
  }
};

/* Handles messages from content scripts */
BgRecorder.prototype.msgHandler = function(request, sender, sendResponse){
  var self = this;

  // appends tick to Klick
  if (request.action === 'appendTick') {
    self.appendTick(request.tick, sender.tab);
  }

  // when any recorder script is loaded, refresh the active tab
  else if (request.action === 'recorderReady') {
    self.bindUpdateActiveTab();
  }
};

/* Add listeners */
BgRecorder.prototype.addListeners = function(){
  chrome.tabs.onUpdated.addListener(this.bindUpdateActiveTab);
  chrome.runtime.onMessage.addListener(this.bindMsgHandler);
};

/* Remove listeners */
BgRecorder.prototype.removeListeners = function(){
  chrome.tabs.onUpdated.removeListener(this.bindUpdateActiveTab);
  chrome.runtime.onMessage.removeListener(this.bindMsgHandler);
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
BgRecorder.prototype.appendTick = function(tick, fromTab){
  // if sent from active tab
  if (this.isRecording && this.activeTabId === fromTab.id){
    console.log('BgRecorder: Add', this.activeUrl, tick.url, tick.pageX, tick.pageY);
    this.klick.ticks.push(tick);
  } else {
    // for debugging
    console.log('BgRecorder: REJECT', this.activeUrl, tick.url, tick.pageX, tick.pageY);
  }
};

/* Append tick to Klick object */
BgRecorder.prototype.stop = function(){
  this.isRecording = false;
  helpers.sendMessage({action: 'stopRecording'});
  this.removeListeners();
  this.msgStop();
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