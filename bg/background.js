console.log('Background initiated...');

// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
// 	if (changeInfo.status === 'complete') {
// 		chrome.tabs.executeScript(tabId, {
// 			allFrames: true,
// 			file: 'injected-scripts/keylog.js'
// 		});
// 	}
// });

window.startRecording = function(){
  console.log('Background -> Recorder: Start recording');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "startRecording"}, function(response) {
      console.log(response.farewell);
    });
  });
};

window.stopRecording = function(){
  console.log('Background -> Recorder: Stop recording');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "stopRecording"}, function(response) {
      console.log(response.farewell);
    });
  });
};