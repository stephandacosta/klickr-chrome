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
    if (params.host.match(window.hostname)){
      console.log(params.hasOwnProperty('query'), params.query.hasOwnProperty('url'), params.query.hasOwnProperty('id'));
      if (params.query.hasOwnProperty('url') && params.query.hasOwnProperty('id')){
        console.log('Background: Play recording with url', decodeURIComponent(params.query.url), 'and id', params.query.id);
        chrome.tabs.update(tabs[0].id, {url: decodeURIComponent(params.query.url)});
        window.playKlick(params.query.id);
      }
    }
  });
});

// listener on saver box (replay, save, share) and recorder (stage)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  
  // Stage recording: updates background with staged recording sent from recorder.js
  if (request.action === 'stage') {
    console.log('Background: Stage recording in background');
    window.stagedKlick = request.klick;
    sendResponse({response: "background: processed stage message"});
  }

  // Replay recording: requests player to play staged recording
  else if (request.action === 'replay') {
    console.log('Background: Replay recording');
    helpers.activeTabSendMessage({action: "playStagedKlick", klick: window.stagedKlick});
    sendResponse({response: "Background: Processed replay message"});
  }

  // Save recording: staged recording is sent to recorder to be pushed to server
  else if (request.action === 'save') {
    console.log('Background: Save recording');
    window.stagedKlick.description = request.description;
    window.send(window.stagedKlick); // Background.js should take care of saving the klick object and sending it to the server
    sendResponse({response: "background: processed save message"});
  }

  // Share recording: NEEDS TO BE IMPLEMENTED 
  else if (request.action === 'share') {
    console.log('Background: Share recording');
    sendResponse({response: "background: processed share message"});
  }
});

// We want the background.js file to store the current klick object.
// When the stop recording button is clicked, then background.js will send the klick object to the server and clear the klick object.
// Whenever a tick object is created, it is pushed to the tick property of the klick object in background.js
// var currentKlickObject;