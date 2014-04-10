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

/* CONFIGURATIONS */
window.hostname = 'jy1.cloudapp.net';
window.server = 'http://jy1.cloudapp.net:3000';
window.id = ''; // klick object id (corresponds to _id in mongodb)

// This array will consist of all the Klick objects that a user sends to background before
// he clicks save. Once he clicks save, will need to process each of the objects in this array
// to produce one consolidated object to send to server.
window.currentKlickObjects = [];

/* Background -> Recorder: Start recording */
window.startRecording = function(){
  console.log('Background -> Recorder: Start recording');
  helpers.activeTabSendMessage({action: "startRecording"});
};

/* Background -> Recorder: Stop recording */
window.stopRecording = function(){
  console.log('Background -> Recorder: Stop recording');
  helpers.activeTabSendMessage({action: "stopRecording"});
  window.openSaver();
};

/* Background -> Recorder: Pause recording */
// If you pause, you have to start back up first!
// Start -> Pause -> Start -> Stop
// window.pauseRecording = function(){
//   console.log('Background -> Recorder: Pause recording');
//   helpers.activeTabSendMessage({action: "pauseRecording"});
// };

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

/* Background -> Server: Send current klick object to the server to save */
window.send = function(klick){
  console.log('Background -> Server: Push to server...', JSON.stringify(klick));
  $.ajax({
    type: 'POST',
    url: window.server + '/klicks',
    data: JSON.stringify(klick),
    contentType: 'application/json',
    success: function(data) {
      console.log('Background -> Server: Klick sent', data);
    },
    error: function(data){
      console.log('Background -> Server: Klick send failed', data);
    }
  });
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
  
  // Stage recording: updates background with staged recording sent from recorder.js
  if (request.action === 'stage') {
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
    helpers.activeTabSendMessage({action: "playStagedKlick", klick: window.stagedKlick});
    sendResponse({response: "Background: Processed replay message"});
  }

  // Save recording: staged recording is sent to recorder to be pushed to server
  else if (request.action === 'save') {
    console.log('Background: Save recording');

    // need to modify code below to not use window.stagedKlick anymore
    // instead, need to first consolidate window.currentKlickObjects into one object and then
    // add the description property onto it

    // need to add validation so that when save happens, the consolidated object's keys
    // must be an array with length greater than 0
    window.stagedKlick.description = request.description;
    window.send(window.stagedKlick); // Background.js should take care of saving the klick object and sending it to the server
    
    // need to clear out window.currentKlickObjects to empty array
    window.currentKlickObjects = [];
    sendResponse({response: "Background: Processed save message"});
  }

  // Share recording: NEEDS TO BE IMPLEMENTED 
  // else if (request.action === 'share') {
  //   console.log('Background: Share recording');
  //   sendResponse({response: "Background: Processed share message"});
  // }
});