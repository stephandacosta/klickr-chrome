// recorder.getKlick -> Klick object
// recorder.updateKlick -> (new Klick object)
// player.playKlick(passes Klick obj)
// player.pause()

var Editor = function () {
  this.currentRecorder = window.rec;
  this.currentPlayer; // this will be the player object in bg-player.js
};