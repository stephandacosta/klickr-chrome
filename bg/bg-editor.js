var Editor = function () {
  this.currentRecorder = window.rec; // reference to current recorder in background
  this.currentPlayer = null; // NEED TO MODIFY // reference to current player in background
  this.isPaused = true;

  // current index of the tick object within ticks array that is being paused on
  this.currentIndex = 0;

  // create a deep copy of the current recorder's klick object using lo-dash
  this.currentKlickObject = _.cloneDeep(this.currentRecorder.getKlick());
  
  // add keypress and click annotations
  this.addClickAndKeypressAnnotations();

  console.log("Current Klick:", this.currentKlickObject);
};

Editor.prototype.pausePlayback = function () {
  // this.currentPlayer.pause() returns an index within the ticks array where paused happen
  
  // this.currentIndex = this.currentPlayer.pause();
  console.log("In pausePlayback");
  this.currentIndex++;  // NEED TO MODIFY
  this.isPaused = true;

  // prompt user for annotation
  console.log("About to enter addAnnotation");
  this.addAnnotations();
};

Editor.prototype.resumePlayback = function () {
  // this.currentPlayer.resume() takes an index within ticks array to resume playback on
  console.log("In resumePlayback");
  if (this.isPaused) {
    this.isPaused = false;
    // this.currentPlayer.resume(this.currentIndex);
  }
};

Editor.prototype.addAnnotations = function () {
  // add annotations to the current klick object and modify it in place
  console.log("In addAnnotations");
  var message = window.prompt("Please enter the annotation you'd like to add.");

  // if annotation is empty then do nothing
  if (message !== "") {
    console.log("Added a new message");
    this.currentKlickObject.ticks[this.currentIndex].annotation = message;
  }
  console.log("About to resumePlayback");
  this.resumePlayback();
};

// add annotations for click and keypress events within currentKlickObject
Editor.prototype.addClickAndKeypressAnnotations = function () {
  var ticks = this.currentKlickObject.ticks;
  _.forEach(ticks, function (tick) {
    if (tick.action === 'keypress') {
      tick.annotation = '[ ' + String.fromCharCode(tick.charCode) + ' ]';
    } 
    else if (tick.action === 'click') {
      tick.annotation = '[ Click ]';
    }
  });
};

// sends the modified klick object to bg-recorder
Editor.prototype.updateKlick = function () {
  console.log("updateKlick is reached");
  this.currentRecorder.updateKlick(this.currentKlickObject);
};