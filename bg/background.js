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

Klickr.hostname = 'klickr.io';
Klickr.server = 'http://www.klickr.io';
Klickr.recorderStatus = 'ready';

/* ------------------------------------------------------------------------------------*/
/* RECORDER
/* ------------------------------------------------------------------------------------*/

// chrome.runtime.onMessage.addListener(function(req, sender, res){
//   if (req.action === 'recorderReady'){
//     chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
//       if (tabs[0].id === sender.tab.id){
//         Klickr.recorderStatus = 'ready';
//       }
//     });
//   }
// });

/* Background -> BgRecorder: Start recording */
window.startRecording = function(){
  if (Klickr.recorderStatus === 'ready'){
    Klickr.recorderStatus = 'recording';
    console.log('Background: Start recording');
    window.rec = new BgRecorder();
  }
};

/* Background -> BgRecorder: Stop recording */
window.stopRecording = function(){
  if (Klickr.recorderStatus === 'recording'){
    console.log('Background: Stop recording');
    window.rec.stop();
    Klickr.recorderStatus = 'ready';

    // window.isPaused = true;
  }
};

/* Background -> BgRecorder: Save Klick */
window.saveKlick = function(desc){
  console.log('Background: Save recording');
  window.rec.addDescription(desc);
  window.rec.send();
  window.rec = undefined;
};

/* ------------------------------------------------------------------------------------*/
/* PLAYER
/* ------------------------------------------------------------------------------------*/

// TODO: Refactor into player ?
window.id = ''; // klick object id (corresponds to _id in mongodb)
window.klickQueue = [];
window.stagedKlick = undefined;
window.currentIndex = -1;

/* Replay: Send replay message */
window.replay = function(){
  // redirect to the first url in the ticks array
  console.log('Background: Replay recording');
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    chrome.tabs.update(tabs[0].id, {url: window.rec.klick.ticks[0].url});
  });

};

/* Pause: Send pause message */
window.pause = function(){
  console.log('Background: Pause recording');
  helpers.activeTabSendMessage({action: 'pauseReplay', klick: window.rec.klick});

  // window.isPaused = true;
};

/* Background -> Recorder: Play recording
 * This function can be called in one of two ways:
 * 1) Via a link, in which case the _id is included in the url string
 * 2) Via clicking the play button in popup.js, in which case the _id will be undefined
 */

window.getKlick = function(id){
  $.ajax({
    url: Klickr.server + '/klicks/' + id,
    type: 'GET',
    contentType: 'application/json',
    success: function(data){
      window.buildKlickQueue(data);
    }
  });
};

window.buildKlickQueue = function(rawKlick){
  var ticks = rawKlick.ticks;
  var index = 0;
  window.klickQueue[0] = window.buildKlick(rawKlick, ticks[0]);

  for(var i = 1; i < ticks.length; i++){
    if(ticks[i].url === ticks[i-1].url){
      klickQueue[index].ticks.push(ticks[i]);
    } else {
      index++;
      window.klickQueue[index] = window.buildKlick(rawKlick, ticks[i]);
    }
  }
};

window.buildKlick = function(rawKlick, tickObj){
  var klick = {};
  for(var key in rawKlick){
    if(rawKlick.key !== ticks){
      klick.key = rawKlick.key;
    } else {
      klick.key = [tickObj];
    }
  }
  return klick;
};

window.playKlick = function(){
  console.log('Background -> Recorder: Play recording');
  window.stagedKlick = window.klickQueue.shift();
  helpers.activeTabSendMessage({action: 'play', klick: window.stagedKlick});
};

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

  // Move this piece of code to the replay function
  // else if (request.action === 'replay') {
  //   console.log('Background: Replay recording');
  //   helpers.activeTabSendMessage({action: 'playStagedKlick', klick: window.rec.klick});
  //   sendResponse({response: "Background: Processed replay message"});
  // }

  // Save recording: staged recording is sent to recorder to be pushed to server
  else if (request.action === 'save') {
    console.log('Background: Save recording');
    window.rec.addDescription(request.description);
    window.rec.send();
    window.rec = undefined;
    sendResponse({response: "Background: Processed save message"});
  }

  // in multi-page recording, used to store the next klick object that will be given after the page changes to a new url
  else if (request.action === 'klickFinished') {
    
    if(window.klickQueue.length !== 0){
      window.stagedKlick = window.klickQueue.shift();
      console.log('Background: Store recording in background');
      sendResponse({response: "Background: Processed storage message"});
    } else {
      console.log("Play Finished");
      sendResponse({response: "Background: Finished klick play"});
    }
    
  }

  else if (request.action === 'klickPaused') {
    console.log('Background: store recording and index in background');

  }

  // if the dom is ready and nextKlick is not false, then send the current page a new klick object to restart the player.
  else if (request.action === 'playerReady'){
    
    if(window.currentIndex === -1){
      helpers.activeTabSendMessage({action: "play", klick: window.stagedKlick});
      sendResponse({response: "Background: Processed klickFinished message"});
    }

    else if (window.currentIndex !== -1) {
      helpers.activeTabSendMessage({action: "resume", klick: window.stagedKlick, index: window.currentIndex});
      sendResponse({response: "Background: Processed klickPaused message"});
    }
    
    window.stagedKlick = undefined;
  }

});
