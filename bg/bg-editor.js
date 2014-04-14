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

var Editor = function () {
  /* Configurations for each new Editor instance */
  
  this.currentRecorder = window.rec; // reference to current recorder in background
  this.currentPlayer = null; // reference to current player in background // NEED TO MODIFY 
  this.currentIndex = 0; // Current tick object index within ticks array where playback should start at
  this.currentKlickObject = _.cloneDeep(this.currentRecorder.getKlick()); // Using lo-dash for _.cloneDeep
  this.isPaused = true; // when an editor is first created, the recording is not being played back - therefore it is initially paused
  this.addClickAndKeypressAnnotations(); // automatically add annotations for keypress and click events within ticks array
  console.log("Current Klick:", this.currentKlickObject);
};

/* Control bg-player instance and invoke its pause function, which returns the index
 * within the ticks array of where pause is occurring. */
Editor.prototype.pausePlayback = function () {
  // this.currentIndex = this.currentPlayer.pause(); // NEED TO UNCOMMENT
  console.log("In pausePlayback");
  this.currentIndex++;  // NEED TO MODIFY
  this.isPaused = true;

  console.log("About to enter addAnnotation");
  this.addAnnotations();
};

/* Control bg-player instance and invoke its resume function, which takes an index within
 * the ticks array to resume on. */
Editor.prototype.resumePlayback = function () {
  console.log("In resumePlayback");
  if (this.isPaused) {
    this.isPaused = false;
    // this.currentPlayer.resume(this.currentIndex); // NEED TO UNCOMMENT
  }
};

/* Prompt users to input a String as their annotation. Append this annotation 
 * to the actual tick if the input is nonempty. */
Editor.prototype.addAnnotations = function () {
  console.log("In addAnnotations");
  var message = window.prompt("Please enter the annotation you'd like to add.");

  if (message.length !== 0) {
    console.log("Added a new message");
    this.currentKlickObject.ticks[this.currentIndex].annotation = message;
  }
  console.log("About to resumePlayback");
  this.resumePlayback();
};

/* Add annotations for click and keypress events within currentKlickObject */
Editor.prototype.addClickAndKeypressAnnotations = function () {
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
Editor.prototype.updateKlick = function () {
  console.log("updateKlick is reached");
  this.currentRecorder.updateKlick(this.currentKlickObject);
};