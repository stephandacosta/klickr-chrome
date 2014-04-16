/* ------------------------------------------------------------------------------------*/
/* EDITOR
/* - The purpose of editor is to control both the current bg-recorder and bg-player
 * instances.
 * - It contains a deep copy of the current klick object (from bg-recorder) and will use
 * this copy to add annotations with the ticks array.
 * - This deep copy of the current klick object will automatically insert annotations
 * for click and keypress events from the klick object.
 * - The editor can knows whether the bg-player instance is currently paused, and can
 * unpause it by resuming playback.
 * - The editor allows users to pause at any moment in the recording and add annotations,
 * and will automatically resume playback after adding the annotation.
/* ------------------------------------------------------------------------------------*/

var BgEditor = function () {
  /* Configurations for each new BgEditor instance */

  this.currentRecorder = window.rec; // reference to current recorder in background // NEED TO CONFIRM WITH JUSTIN THAT THIS ISNT UNDEFINED
  this.currentPlayer = window.bgPlayer; // reference to current player in background // NEED TO CONFIRM WITH LUKE THAT THIS ISNT UNDEFINED
  this.currentIndex = 0; // Current tick object index within ticks array where playback should start at
  this.resumeIndex = 0;
  this.setStatus('ready');
  this.currentKlickObject = _.cloneDeep(this.currentRecorder.getKlick()); // Using lo-dash for _.cloneDeep
  this.addClickAndKeypressAnnotations(); // automatically add annotations for keypress and click events within ticks array
  this.currentPlayer.buildKlickQueue(this.currentKlickObject);

  // add listener for player done
  var self = this;
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'playerDone') {

    }
  });

  console.log('Initating BgEditor with Klick', this.currentKlickObject);
};

BgEditor.prototype.playerDone = function(){
  console.log('BgEditor: Received player done');
  if (self.status !== 'playing') {
    throw new Error('BgEditor: Expected playing status instead of ' + self.status + ' when player is done');
  } else {
    self.setStatus('ready');
  }  
};

/* Control bg-player instance and invoke its pause function, which returns the index
 * within the ticks array of where pause is occurring. */
BgEditor.prototype.pausePlayback = function () {
  console.log('BgEditor: pausePlayback', this.status);
  if (this.status === 'playing') {
    this.currentPlayer.pause();
    this.setStatus('paused');
  }
};

BgEditor.prototype.replay = function(){
  console.log('BgEditor: Replay with status', this.status);
  if (this.status === 'ready'){
    this.currentPlayer.reset();
    this.currentPlayer.buildKlickQueue(this.currentKlickObject);
    this.currentPlayer.play();
    this.setStatus('playing');
  }
};

/* Control bg-player instance and invoke its resume function, which takes an index within
 * the ticks array to resume on. */
BgEditor.prototype.resumePlayback = function () {
  if (this.status === 'paused') {
    this.currentPlayer.resume(this.resumeIndex);
    this.setStatus('playing');
  }
};

/* Prompt users to input a String as their annotation. Append this annotation
 * to the actual tick if the input is nonempty. */
BgEditor.prototype.addAnnotations = function () {
  console.log('BgEditor: Adding annotations, editor status is', this.status);
  if (this.status === 'paused'){
    var message = window.prompt('Please enter the annotation you\'d like to add.');

    if (message && message.length !== 0) {
      this.currentKlickObject.ticks[this.currentIndex].annotation = message;
    }

    console.log('BgEditor: Resuming playback..');
    this.resumePlayback();
  }
};

/* Add annotations for click and keypress events within currentKlickObject */
BgEditor.prototype.addClickAndKeypressAnnotations = function () {
  var ticks = this.currentKlickObject.ticks;
  _.forEach(ticks, function (tick) { // Using lo-dash _.forEach
    if (tick.action === 'keypress') {
      tick.annotation = '[ ' + String.fromCharCode(tick.charCode) + ' ]';
    }
    else if (tick.action === 'click') {
      tick.annotation = '[ Click ]';
    }
  });
};

/* Send (modified) klick object back to bg-recorder instance */
BgEditor.prototype.updateKlick = function () {
  console.log('BgEditor -> BgRecorder: Update Klick');
  this.currentRecorder.updateKlick(this.currentKlickObject);
};

BgEditor.prototype.setStatus = function(status){
  this.status = status;
};

BgEditor.prototype.getStatus = function(){
  return this.status;
};

/* ------------------------------------------------------------------------------------*/
/* LISTENER
/* ------------------------------------------------------------------------------------*/

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // Listening on bgPlayer's pausePlay function
  if (request.action === 'pauseIndex') {
    window.editor.currentIndex = request.rawIndex;
    window.editor.resumeIndex = request.resumeIndex;
    console.log("About to enter addAnnotation");
    window.editor.addAnnotations();
  }
});