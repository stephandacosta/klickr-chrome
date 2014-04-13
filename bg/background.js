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

Klickr.hostname = 'klickr.io';
Klickr.server = 'http://www.klickr.io';

// TODO: Refactor into player ?
window.id = ''; // klick object id (corresponds to _id in mongodb)
window.nextKlick = false;

/* ------------------------------------------------------------------------------------*/
/* PLAYER
/* ------------------------------------------------------------------------------------*/



/* ------------------------------------------------------------------------------------*/
/* SAVER
/* ------------------------------------------------------------------------------------*/





/* ------------------------------------------------------------------------------------*/
/* INIT
/* ------------------------------------------------------------------------------------*/

/* Background -> Recorder: Start recording */
window.startRecording = function(){
  console.log('Background: Start recording');
  window.rec = new BgRecorder();
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
    // console.log('Background: Tab update detected', tabs[0].url);
    var url = tabs[0].url;
    var params = window.helpers.parseUrl(url);
    if ( params.host.match(Klickr.hostname) && params.query.hasOwnProperty('url') && params.query.hasOwnProperty('id') ){
      console.log('Background: Play recording with url', decodeURIComponent(params.query.url), 'and id', params.query.id);
      chrome.tabs.update(tabs[0].id, {url: decodeURIComponent(params.query.url)});
      window.playKlick(params.query.id);
    }
  });
});

// listener on saver box (replay, save, share) and recorder (stage)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

  // Sends server to content scripts
  if (request.action === 'getServer') {
    sendResponse({server: Klickr.server});
  }

  // Replay recording: requests player to play staged recording
  else if (request.action === 'replay') {
    console.log('Background: Replay recording');
    helpers.activeTabSendMessage({action: "playStagedKlick", klick: window.rec.klick});
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

});
