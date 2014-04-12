/* ------------------------------------------------------------------------------------*/
/* BACKGROUND
/* - Runs perpetually in the background, is at the same level as popups and has full
/* access to Chrome extension classes
/* - No direct access to browser DOM
/* - Communicates with content scripts using events (ie. messages and listeners)
/* - Communicates with popups through direct function calls
/* - Communicates with server by sending current Klick object
/* ------------------------------------------------------------------------------------*/
console.log('Background initiated...');

/* ------------------------------------------------------------------------------------*/
/* CONFIG
/* ------------------------------------------------------------------------------------*/

var Klickr = {};
window.Klickr = Klickr;

window.hostname = 'klickr.io';
window.server = 'http://www.klickr.io';
window.id = ''; // klick object id (corresponds to _id in mongodb)

// This array will consist of all the Klick objects that a user sends to background before
// he clicks save. Once he clicks save, will need to process each of the objects in this array
// to produce one consolidated object to send to server.
window.currentKlickObjects = [];
window.nextKlick = false;

/* ------------------------------------------------------------------------------------*/
/* RECORDER
/* ------------------------------------------------------------------------------------*/

var Recorder = function(){
  this.isRecording = true;
  this.createKlick();
  this.addListeners();
  helpers.activeTabSendMessage({action: 'startRecording'});
};
window.Recorder = Recorder;

/* Creates a new Klick object */
Recorder.prototype.createKlick = function(){
  this.klick = {
    url: document.URL,
    description: '',
    ticks: []
  };
  this.getWindowSize();
};

/* Add description */
Recorder.prototype.addDescription = function(desc){
  this.klick.description = desc;
};

/* Add listeners */
Recorder.prototype.addListeners = function(){
  var self = this;

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // Appends tick to Klick
    if (request.action === 'appendTick') {
      self.klick.ticks.push(request.tick);
    }

    // On change of URL, start recording again when recorder ready
    else if (request.action === 'recorderReady') {
      console.log('Recorder ready', request);
      chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        console.log('Background Recorder: Active tab is', tabs[0].url);
        if (self.isRecording && tabs[0].url === request.url){
          console.log('Background Recorder: Start recording again');
          helpers.activeTabSendMessage({action: 'startRecording'});
        }
      });
    }
  });

};

/* Gets inner width and height from active tab */
Recorder.prototype.getWindowSize = function(){
  var self = this;
  helpers.activeTabSendMessage({action: 'getWindowSize'}, function(response){
    self.klick.width = response.innerWidth;
    self.klick.height = response.innerHeight;
  });
};

/* Append tick to Klick object */
Recorder.prototype.appendTick = function(tick){
  this.klick.ticks.append(tick);
};

/* Append tick to Klick object */
Recorder.prototype.stop = function(){
  console.log('Background Recorder: Stopped', this);
  helpers.activeTabSendMessage({action: "stopRecording"});
  window.openSaver();
};

/* Background -> Server: Send current klick object to the server to save */
Recorder.prototype.send = function(){
  console.log('Background Recorder -> Server: Push to server...', JSON.stringify(this.klick));
  $.ajax({
    type: 'POST',
    url: window.server + '/klicks',
    data: JSON.stringify(this.klick),
    contentType: 'application/json',
    success: function(data) {
      console.log('Background -> Server: Klick sent', data);
    },
    error: function(data){
      console.log('Background -> Server: Klick send failed', data);
    }
  });
};

/* ------------------------------------------------------------------------------------*/
/* PLAYER
/* ------------------------------------------------------------------------------------*/



/* ------------------------------------------------------------------------------------*/
/* SAVER
/* ------------------------------------------------------------------------------------*/





/* ------------------------------------------------------------------------------------*/
/* POPUP METHODS
/* ------------------------------------------------------------------------------------*/

/* Background -> Recorder: Start recording */
window.startRecording = function(){
  console.log('Background: Start recording');
  window.rec = new Recorder();
};

/* Background -> Recorder: Stop recording */
window.stopRecording = function(){
  console.log('Background: Stop recording');
  window.rec.stop();
};

/* Background -> Recorder: Play recording
 * This function can be called in one of two ways:
 * 1) Via a link, in which case the _id is included in the url string
 * 2) Via clicking the play button in popup.js, in which case the _id will be undefined
 */
window.playKlick = function(id){
  console.log('Background -> Recorder: Play recording');
  id = id || window.id;
  if (id !== undefined) window.id = id;
  helpers.activeTabSendMessage({action: "playKlick", id: id});
};

/* Background -> Recorder: Saver display */
window.openSaver = function(){
  console.log('Background -> Saver: Displaying');
  helpers.activeTabSendMessage({action: "openSaver"});
};

/* ------------------------------------------------------------------------------------*/
/* LISTENER LOGIC
/* ------------------------------------------------------------------------------------*/

chrome.tabs.onUpdated.addListener(function(){
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    console.log('Background: Tab update detected', tabs[0].url);
    var url = tabs[0].url;
    var params = window.helpers.parseUrl(url);
    if ( params.host.match(window.hostname) && params.query.hasOwnProperty('url') && params.query.hasOwnProperty('id') ){
      console.log('Background: Play recording with url', decodeURIComponent(params.query.url), 'and id', params.query.id);
      chrome.tabs.update(tabs[0].id, {url: decodeURIComponent(params.query.url)});
      window.playKlick(params.query.id);
    }
  });
});

// listener on saver box (replay, save, share) and recorder (stage)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

  var finalKlickObject;

  // Sends server to content scripts
  if (request.action === 'getServer') {
    sendResponse({server: window.server});
  }

  // Stage recording: updates background with staged recording sent from recorder.js
  else if (request.action === 'stage') {
    console.log('Background: Stage recording in background');
    // Append the klick object coming from recorder.js to the currentKlickObjects
    window.currentKlickObjects.push(request.klick);
    sendResponse({response: "Background: Processed stage message"});
  }

  // Replay recording: requests player to play staged recording
  else if (request.action === 'replay') {
    console.log('Background: Replay recording');

    // need to modify code below to not use window.stagedKlick anymore
    // instead, the value of the "klick" property should be the object that results from
    // consolidating window.currentKlickObjects
    finalKlickObject = helpers.consolidateKlickObjects(window.currentKlickObjects);
    helpers.activeTabSendMessage({action: "playStagedKlick", klick: finalKlickObject});
    sendResponse({response: "Background: Processed replay message"});
  }

  // Save recording: staged recording is sent to recorder to be pushed to server
  else if (request.action === 'save') {
    console.log('Background: Save recording');
    window.rec.addDescription(request.description);
    window.rec.send();
    window.rec = undefined;
    sendResponse({response: "Background: Processed save message"});
  }

  // in multi-page recording, used to store the next klick object that will be given after the page changes to a new url
  else if (request.action === 'nextKlick') {
    console.log('Background: Store recording in background');
    window.nextKlick = request.klick;
    sendResponse({response: "Background: Processed storage message"});
  }

  // if the dom is ready and nextKlick is not false, then send the current page a new klick object to restart the player.
  else if (request.action === 'domReady' && !!window.nextKlick){
    helpers.activeTabSendMessage({action: "playNextKlick", klick: window.nextKlick});
    window.nextKlick = false;
    sendResponse({response: "Background: Processed nextKlick message"});
  }

  // Share recording: NEEDS TO BE IMPLEMENTED
  // else if (request.action === 'share') {
  //   console.log('Background: Share recording');
  //   sendResponse({response: "Background: Processed share message"});
  // }
});
