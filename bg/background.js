/* ------------------------------------------------------------------------------------*/
/* BACKGROUND
/* - Runs perpetually in the background, is at the same level as popups and has full
/* access to Chrome extension classes.
/* - No direct access to browser DOM
/* - Communicates with content scripts using events (ie. messages and listeners)
/* - Communicates with popups through direct function calls.
/* ------------------------------------------------------------------------------------*/
console.log('Background initiated...');

window.hostname = 'localhost:4568';
window.id = '';

/* Background -> Recorder: Start recording */
window.startRecording = function(){
  console.log('Background -> Recorder: Start recording');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "startRecording"}, function(response) {
      console.log(response);
    });
  });
};

/* Background -> Recorder: Stop recording */
window.stopRecording = function(){
  console.log('Background -> Recorder: Stop recording');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "stopRecording"}, function(response) {
      console.log(response);
    });
    // SHOULD THE OPTENING OF SAVER BOX BE PROMISIFIED TO WAIT UNTIL RECORDING ACTUALY STOPS ?
    chrome.tabs.sendMessage(tabs[0].id, {action: "openSaver"}, function(response) {
      console.log(response);
    });
  });
};

/* Background -> Recorder: Play recording */
window.playKlick = function(id){
  console.log('Background -> Recorder: Play recording');
  id = id || window.id;
  if (id !== undefined) window.id = id;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "playKlick", id: id}, function(response) {
      console.log(response);
    });
  });
};

// STEPHAN CODE START
/* Background -> Recorder: Saver display */
window.openSaver = function(){
  console.log('Background -> Saver: displaying');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "openSaver"}, function(response) {
      console.log(response);
    });
  });
};
// STEPHAN CODE END

/* Listener on tab updates */
chrome.tabs.onUpdated.addListener(function(){
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    console.log('Background: Tab update detected', tabs[0].url);
    var url = tabs[0].url;
    var params = window.helpers.parseUrl(url);
    if (params.host.match(window.hostname) || params.host.match(window.hostnameAlt)){
      console.log(params.hasOwnProperty('query'), params.query.hasOwnProperty('url'), params.query.hasOwnProperty('id'));
      if (params.query.hasOwnProperty('url') && params.query.hasOwnProperty('id')){
        console.log('Background: Play recording with url', decodeURIComponent(params.query.url), 'and id', params.query.id);
        chrome.tabs.update(tabs[0].id, {url: decodeURIComponent(params.query.url)});
        window.playKlick(params.query.id);
      }
    }
  });
});

// STEPHAN CODE START
// listener on saver box (replay, save, share) and recorder (stage)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

  // Replay request: requests player to play staged recording
  if (request.action === 'replay') {
      console.log('background: replay');
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "playStagedKlick", klick: window.stagedKlick}, function(response) {
          console.log(response);
        });
      });
      sendResponse({response: "background: processed replay message"});

  // Save request : staged recording is sent to recorder to be pushed to server
  } else if (request.action === 'save') {
      console.log('background: save');
      window.stagedKlick.description = request.description;
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "saveKlick", klick: window.stagedKlick}, function(response) {
        console.log(response);
        });
      });
      sendResponse({response: "background: processed save message"});

  // Share request: NEEDS TO BE IMPLEMENTED 
  } else if (request.action === 'share') {
      console.log('background: share');
      sendResponse({response: "background: processed share message"});

  // Stage request:  updates background staged recording with the one sent through inside the message
  } else if (request.action === 'stage') {
      console.log('background: stage');
      window.stagedKlick = request.klick;
      sendResponse({response: "background: processed stage message"});
  }
});
// STEPHAN CODE END
