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
    bgPlayer.klickQueue = [];
    window.rec = new BgRecorder();
  }
};

/* Background -> BgRecorder: Stop recording */
window.stopRecording = function(){
  if (Klickr.recorderStatus === 'recording'){
    console.log('Background: Stop recording');
    window.rec.stop();
    bgPlayer.buildKlickQueue(window.rec.klick);
    Klickr.recorderStatus = 'ready';
  }
};

/* Background -> BgRecorder: Save Klick */
window.saveKlick = function(desc){
  console.log('Background: Save recording');
  window.rec.addDescription(desc);
  window.rec.send();
  window.rec = undefined;
};
