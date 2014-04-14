/* ------------------------------------------------------------------------------------*/
/* Background Player
/* ------------------------------------------------------------------------------------*/
var BgPlayer = function(){

  this.id = ''; // klick object id (corresponds to _id in mongodb)
  this.klickQueue = [];
  this.stagedKlick = undefined;
  this.currentIndex = -1;
  console.log('bgPlayer initiated');

};

window.BgPlayer = BgPlayer;

/* ------------------------------------------------------------------------------------*/
/* Popup Button Functions
/* ------------------------------------------------------------------------------------*/

/* Replay: Send replay message */
BgPlayer.prototype.replay = function(){
  // redirect to the first url in the ticks array
  if(this.klickQueue.length === 0){
    this.klickQueue = this.buildKlickQueue(window.rec.klick);
  }
  console.log('Background: Replay recording');
  this.stagedKlick = this.klickQueue.shift();
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
    console.log(this.stagedKlick);
    helpers.activeTabSendMessage({action:'play', klick: this.stagedKlick});
    this.stagedKlick = undefined;
  }
};

/* ------------------------------------------------------------------------------------*/
/* Helper Functions
/* ------------------------------------------------------------------------------------*/

BgPlayer.prototype.redirect = function(nextUrl){
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    chrome.tabs.update(tabs[0].id, {url: nextUrl});
  });
};

BgPlayer.prototype.getKlick = function(id){
  var that = this;
  $.ajax({
    url: Klickr.server + '/klicks/' + id,
    type: 'GET',
    contentType: 'application/json',
    success: function(rawKlick){
      that.buildKlickQueue(rawKlick);
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
    if(key !== 'ticks'){
      subKlick[key] = rawKlick[key];
    } else {
      subKlick[key] = [tickObj];
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
      bgPlayer.id = params.query.id;
      bgPlayer.getKlick(bgPlayer.id);
      console.log(bgPlayer.id);
    }
  });
});

// listener on saver box (replay, save, share) and recorder (stage)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // in multi-page recording, used to store the next klick object that will be given after the page changes to a new url
  if (request.action === 'klickFinished') {  
    if (bgPlayer.klickQueue.length !== 0){
      bgPlayer.stagedKlick = bgPlayer.klickQueue.shift();
      bgPlayer.redirect(bgPlayer.stagedKlick.ticks[0].url);
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
    bgPlayer.currentIndex = request.index;
  }

  // if the dom is ready and nextKlick is not false, then send the current page a new klick object to restart the player.
  else if (request.action === 'playerReady' && !!bgPlayer.stagedKlick && bgPlayer.currentIndex === -1) {
    helpers.activeTabSendMessage({action: "play", klick: bgPlayer.stagedKlick});
    sendResponse({response: "Background: Processed klickFinished message"});
    bgPlayer.stagedKlick = undefined;
  }
});
