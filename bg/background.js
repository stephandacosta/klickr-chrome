/* ------------------------------------------------------------------------------------*/
/* BACKGROUND
/* - Runs perpetually in the background, is at the same level as popups and has full
/* access to Chrome extension classes.
/* - No direct access to browser DOM
/* - Communicates with content scripts using events (ie. messages and listeners)
/* - Communicates with popups through direct function calls.
/* ------------------------------------------------------------------------------------*/
console.log('Background initiated...');

window.hostname = '127.0.0.1:4568';

/* Background -> Recorder: Start recording */
window.startRecording = function(){
  console.log('Background -> Recorder: Start recording');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "startRecording"}, function(response) {
      console.log(response.farewell);
    });
  });
};

/* Background -> Recorder: Stop recording */
window.stopRecording = function(){
  console.log('Background -> Recorder: Stop recording');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "stopRecording"}, function(response) {
      console.log(response.farewell);
    });
  });
};

/* Background -> Recorder: Play recording */
window.playKlick = function(){
  console.log('Background -> Recorder: Play recording');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "playKlick"}, function(response) {
      console.log(response.farewell);
    });
  });
};

/* Listener on tab updates */
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