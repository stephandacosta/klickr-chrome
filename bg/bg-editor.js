// recorder.getKlick -> Klick object
// recorder.updateKlick -> (new Klick object)
// player.playKlick(passes Klick obj)
// player.pause()

var Editor = function () {
  // reference to current recorder in background
  this.currentRecorder = window.rec;

  // reference to current player in background
  this.currentPlayer = null;
  this.isCurrentPlayerPaused = false;

  // current index of the tick object within ticks array that is being paused on
  this.currentIndex = window.currentIndex;

  // create a deep copy of the current recorder's klick object using lo-dash
  this.currentKlickObject = _.cloneDeep(this.currentRecorder.getKlick());
};

Editor.prototype.pausePlayback = function () {
  // this.currentPlayer.pause() returns an index within the ticks array where paused happen
  this.currentIndex = this.currentPlayer.pause(); // return an index
  this.isCurrentPlayerPaused = true;
};

Editor.prototype.resumePlayback = function () {
  // this.currentPlayer.resume() takes an index within ticks array to resume playback on
  if (!this.isCurrentPlayerPaused) {
    this.currentPlayer.resume(this.currentIndex);
    this.isCurrentPlayerPaused = false;  
  }
};

Editor.prototype.addAnnotations = function () {
  // add annotations to the current klick object and modify it in place
  var message = window.prompt("Please enter the annotation you'd like to add.");
  this.currentKlickObject.ticks[this.currentIndex].annotation = message;
};

// sends the modified klick object to bg-recorder
Editor.prototype.updateKlick = function () {
  this.currentRecorder.updateKlick(this.currentKlickObject);
};