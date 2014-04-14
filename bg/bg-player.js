/* ------------------------------------------------------------------------------------*/
/* Background Player
/* ------------------------------------------------------------------------------------*/

var BgPlayer = function(){

  this.id = ''; // klick object id (corresponds to _id in mongodb)
  this.klickQueue = [];
  this.stagedKlick = undefined;
  this.currentIndex = -1;

};

window.BgPlayer = BgPlayer;

/* ------------------------------------------------------------------------------------*/
/* Popup Button Functions
/* ------------------------------------------------------------------------------------*/


/* Replay: Send replay message */
BgPlayer.prototype.replay = function(){
  // redirect to the first url in the ticks array
  console.log('Background: Replay recording');
  this.stagedKlick = klickQueue.shift();
  this.redirect(this.stagedKlick.ticks[0].url);
};

/* Pause: Send pause message */
BgPlayer.prototype.pause = function(){
  console.log('Background: Pause recording');
  helpers.activeTabSendMessage({action: 'pause'});
};

BgPlayer.prototype.resume = function(){
  helpers.activeTabSendMessage({action: "resume", klick: this.stagedKlick, index: this.currentIndex});
  sendResponse({response: "Background: Resume player"});
};

BgPlayer.prototype.playKlick = function(){
  if(this.id === ''){
    console.log('please try using a klickr link.');
    return;
  } else {
    console.log('Background -> Recorder: Play recording');
    this.stagedKlick = this.klickQueue.shift();
    helpers.activeTabSendMessage({action: 'play', klick: this.stagedKlick});
  }
};


/* ------------------------------------------------------------------------------------*/
/* Helper Fnctions
/* ------------------------------------------------------------------------------------*/

BgPlayer.prototype.redirect = function(nextUrl){
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    chrome.tabs.update(tabs[0].id, {url: nextUrl});
  });
};

BgPlayer.prototype.getKlick = function(id){
  $.ajax({
    url: Klickr.server + '/klicks/' + id,
    type: 'GET',
    contentType: 'application/json',
    success: function(rawKlick){
      this.buildKlickQueue(rawKlick);
    }
  });
};

BgPlayer.prototype.buildKlickQueue = function(rawKlick){
  var ticks = rawKlick.ticks;
  var index = 0;
  this.klickQueue[0] = this.buildSubKlick(rawKlick, ticks[0]);

  for(var i = 1; i < ticks.length; i++){
    if(ticks[i].url === ticks[i-1].url){
      this.klickQueue[index].ticks.push(ticks[i]);
    } else {
      index++;
      this.klickQueue[index] = this.buildSubKlick(rawKlick, ticks[i]);
    }
  }
};

BgPlayer.prototype.buildSubKlick = function(rawKlick, tickObj){
  var subKlick = {};
  for(var key in rawKlick){
    if(rawKlick.key !== ticks){
      subKlick.key = rawKlick.key;
    } else {
      subKlick.key = [tickObj];
    }
  }
  return subKlick;
};

/* ------------------------------------------------------------------------------------*/
/* Init and Player Listeners
/* ------------------------------------------------------------------------------------*/

var bgPlayer = new BgPlayer();


chrome.tabs.onUpdated.addListener(function(){
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    // console.log('Background: Tab update detected', tabs[0].url);
    var url = tabs[0].url;
    var params = window.helpers.parseUrl(url);
    if ( params.host.match(Klickr.hostname) && params.query.hasOwnProperty('url') && params.query.hasOwnProperty('id') ){
      console.log('Background: Play recording with url', decodeURIComponent(params.query.url), 'and id', params.query.id);
      chrome.tabs.update(tabs[0].id, {url: decodeURIComponent(params.query.url)});
      //this.playKlick(params.query.id);
    }
  });
});

// listener on saver box (replay, save, share) and recorder (stage)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

  // Sends server to content scripts
  if (request.action === 'getServer') {
    sendResponse({server: Klickr.server});
  }

  // Save recording: staged recording is sent to recorder to be pushed to server
  else if (request.action === 'save') {
    console.log('Background: Save recording');
    window.rec.addDescription(request.description);
    window.rec.send();
    window.rec = undefined;
    this.klickQueue = [];
    sendResponse({response: "Background: Processed save message"});
  }

  // in multi-page recording, used to store the next klick object that will be given after the page changes to a new url
  else if (request.action === 'klickFinished') {
    
    if(this.klickQueue.length !== 0){
      this.stagedKlick = this.klickQueue.shift();
      this.redirect(this.stagedKlick.ticks[0].url);
      console.log('Background: Store recording in background');
      sendResponse({response: "Background: Processed storage message"});
    }

    else {
      console.log("Play Finished");
      sendResponse({response: "Background: Finished klick play"});
    }
    
  }
  
  // event received from player when there has been a pause
  else if (request.action === 'klickPaused') {
    console.log('Background: store recording and index in background');
    this.currentIndex = request.index;
  }

  // if the dom is ready and nextKlick is not false, then send the current page a new klick object to restart the player.
  else if (request.action === 'playerReady'){
  
    if(!!this.stagedKlick){

      if(this.currentIndex === -1){
        helpers.activeTabSendMessage({action: "play", klick: this.stagedKlick});
        sendResponse({response: "Background: Processed klickFinished message"});
      }

      else if (this.currentIndex !== -1) {

      }
      this.stagedKlick = undefined;
    }

    else if (this.id !== '') {
      getKlick(this.id);
    }
  }

});
