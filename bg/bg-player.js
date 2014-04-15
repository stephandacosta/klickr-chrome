/* ------------------------------------------------------------------------------------*/
/* Background Player
/* ------------------------------------------------------------------------------------*/
var BgPlayer = function(){

  console.log('Initiating BgPlayer...');

  this.reset();
  this.id = ''; // klick object id (corresponds to _id in mongodb)

};

window.BgPlayer = BgPlayer;

/* ------------------------------------------------------------------------------------*/
/* Popup Button Functions
/* ------------------------------------------------------------------------------------*/

/* Pause: Send pause message */
BgPlayer.prototype.pause = function(){
  console.log('BgPlayer: Pause');
  this.setStatus('paused');
  helpers.activeTabSendMessage({action: 'pause'});
};

BgPlayer.prototype.resume = function(num){
  console.log('BgPlayer: Resume');
  this.setStatus('playing');
  this.stagedKlick = this.klickQueue[this.klickQueueIndex];
  console.log(this.stagedKlick);
  helpers.activeTabSendMessage({action: 'resume', klick: this.stagedKlick, index: num});
};

BgPlayer.prototype.play = function(){
  console.log('BgPlayer: Play with klickQueue', this.klickQueue);
  this.setStatus('playing');
  this.stagedKlick = this.klickQueue[0];
  this.klickQueueIndex = 0;
  var that = this;
  chrome.tabs.query({active:true, lastFocusedWindow: true}, function(tabs){
    that.tabId = tabs[0].id;
    if(tabs[0].url !== that.stagedKlick.ticks[0].url){
      // console.log('BgPlayer: Redirecting with stagedKlick', that.stagedKlick);
      that.redirect(that.stagedKlick.ticks[0].url);
    } else {
      // console.log('BgPlayer: Stay on page with stagedKlick', that.stagedKlick);
      that.playStagedKlick();
    }
  });
};

BgPlayer.prototype.getStatus = function(){
  return this.status;
};

/* Valid statuses: Empty, Ready, Playing, Paused */
BgPlayer.prototype.setStatus = function(status){
  this.status = status;
};

/* ------------------------------------------------------------------------------------*/
/* Helper Functions
/* ------------------------------------------------------------------------------------*/

BgPlayer.prototype.getTabById = function(tabId, callback){
  console.log('BgPlayer: getTabById', tabId);
  chrome.tabs.query({}, function(tabs){
    for (var i = 0; i < tabs.length; i++){
      if (tabs[i].id === tabId) callback(tabs[i]);
    }
    callback(null);
  });
};

BgPlayer.prototype.redirect = function(nextUrl, callback){
  console.log('BgPlayer: Redirect', nextUrl);
  callback = callback || function(){};
  this.getTabById(this.tabId, function(tab){
    if (tab === null) return;
    chrome.tabs.update(tab.id, {url: nextUrl}, callback);
  });
};

BgPlayer.prototype.getKlick = function(id){
  var that = this;
  $.ajax({
    url: Klickr.server + '/klicks/' + id,
    type: 'GET',
    contentType: 'application/json',
    success: function(rawKlick){
      that.setStatus('ready');
      that.buildKlickQueue(rawKlick);
    }
  });
};

/* Announce that playback is finished */
BgPlayer.prototype.onPlayFinished = function(){
  chrome.runtime.sendMessage({action:'playerDone'});
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
  this.buildKlickTickLengths(this.klickQueue);
};

/* Plays next subclick. If no more subclicks, player is reset */
BgPlayer.prototype.nextSubKlick = function(){
  var that = this;
  that.klickQueueIndex++;
  console.log(that.klickQueueIndex);
  console.log(that.klickQueue[that.klickQueueIndex]);
  if (that.klickQueueIndex < that.klickQueue.length){
    that.stagedKlick = that.klickQueue[that.klickQueueIndex];
    that.redirect(that.stagedKlick.ticks[0].url, function(){
      chrome.tabs.onUpdated.addListener(function nextSubKlickListener(){

        // after redirect, find tab by ID
        chrome.tabs.query({}, function(tabs){
          var foundTab;
          for(var i = 0; i < tabs.length; i++){
            if(tabs[i].id === that.tabId){
              foundTab = tabs[i];
              break;
            }
          }

          console.log('BgPlayer: NextSubKlick', foundTab);

          // if tab status is complete, then resume playback; else, wait for playerReady for resume playback
          if(foundTab.status === 'complete'){
            console.log('BgPlayer: Status complete', foundTab);
            that.playStagedKlick();
            chrome.tabs.onUpdated.removeListener(nextSubKlickListener);
          }
        });
      });
    });
  }
  else {
    that.onPlayFinished();
    that.reset();
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

BgPlayer.prototype.buildKlickTickLengths = function(subKlicks){
  for(var i = 0; i < subKlicks.length; i++){
    this.klickTickLengths.push(subKlicks[i].ticks.length);
  }
};

BgPlayer.prototype.getRawKlickIndex = function(queueIndex, playerIndex){
  for(var i = 0; i < queueIndex; i++){
    playerIndex += this.klickTickLengths[i]+1;
  }
  return playerIndex;
};

BgPlayer.prototype.playStagedKlick = function(){
  console.log('BgPlayer: playStagedKlick', this.stagedKlick);
  chrome.tabs.sendMessage(this.tabId, {action:'play', klick: this.stagedKlick}, function(res){
    console.log('BgPlayer: playStageKlick responded', res, chrome.runtime.lastError);
    if (res === undefined || res.response === undefined) throw new Error('BgPlayer: Play message not received by Player');
  });
  this.stagedKlick = undefined;
};

BgPlayer.prototype.reset = function(){
  console.log('BgPlayer: Reset');
  this.setStatus('empty');
  this.klickQueue = [];
  this.klickTickLengths = [];
  this.stagedKlick = undefined;
  this.klickQueueIndex = -1;
  this.tabId = '';
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
    }
  });
});

// listener on saver box (replay, save, share) and recorder (stage)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // in multi-page recording, used to store the next klick object that will be given after the page changes to a new url
  if (request.action === 'klickFinished') {
    bgPlayer.nextSubKlick();
  }
  // TODO: Move into pause logic
  else if (request.action === 'klickPaused') {
    var rawKlickIndex = bgPlayer.getRawKlickIndex(bgPlayer.klickQueueIndex, request.index);
    chrome.runtime.sendMessage({action:'pauseIndex', index: rawKlickIndex});
  }

});
