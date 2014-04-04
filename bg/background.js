/* ------------------------------------------------------------------------------------*/
/* BACKGROUND
/* - Runs perpetually in the background, is at the same level as popups and has full
/* access to Chrome extension classes.
/* - No direct access to browser DOM
/* - Communicates with content scripts using events (ie. messages and listeners)
/* - Communicates with popups through direct function calls.
/* ------------------------------------------------------------------------------------*/
console.log('Background initiated...');

// Background -> Recorder: Start recording
window.startRecording = function(){
  console.log('Background -> Recorder: Start recording');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "startRecording"}, function(response) {
      console.log(response.farewell);
    });
  });
};

// Background -> Recorder: Stop recording
window.stopRecording = function(){
  console.log('Background -> Recorder: Stop recording');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "stopRecording"}, function(response) {
      console.log(response.farewell);
    });
  });
};

// Background -> Recorder: Play recording
window.playRecording = function(){
  console.log('Background -> Recorder: Play recording');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "playRecording"}, function(response) {
      console.log(response.farewell);
    });
  });
};

/*
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
  if (changeInfo.status === 'complete') {
    chrome.tabs.executeScript(tabId, {
      allFrames: true,
      file: 'injected-scripts/keylog.js'
    });
  }
});
*/