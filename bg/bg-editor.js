// recorder.getKlick -> Klick object
// recorder.updateKlick -> (new Klick object)
// player.playKlick(passes Klick obj)
// player.pause()

var Editor = function () {
  // reference to current recorder in background
  this.currentRecorder = window.rec;

  // reference to current player in background
  this.currentPlayer = null; // this will be the player object in bg-player.js
  this.isCurrentPlayerPaused = false;
  
  // a deep copy of the current recorder's klick object
  this.currentKlickObject = _.cloneDeep(this.currentRecorder.getKlick());
};

Editor.prototype.pausePlayback = function () {
  // uses the current player's pause function
  this.currentPlayer.pause();
};

Editor.prototype.resumePlayback = function () {
  //
  this.currentPlayer.resume();
};

Editor.prototype.addAnnotations = function () {
  // add annotations to the current klick object and modify it in place
};