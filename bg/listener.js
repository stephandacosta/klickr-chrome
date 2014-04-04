console.log('Listener initiated...');

// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
// 	if (changeInfo.status === 'complete') {
// 		chrome.tabs.executeScript(tabId, {
// 			allFrames: true,
// 			file: 'injected-scripts/keylog.js'
// 		});
// 	}
// });

window.start = function(){
  console.log('Listener -> Recorder: Start');
  chrome.extension.sendRequest({test: 'test'});
};