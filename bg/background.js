/* ------------------------------------------------------------------------------------*/
/* BACKGROUND
/* Overall controller between BgEditor, BgPlayer and BgRecorder
/* ------------------------------------------------------------------------------------*/

var Klickr = function(){
  this.hostname = 'klickr.io';
  this.server = 'http://www.klickr.io';
  
  this.bgRecorder = undefined;
};

window.Klickr = new Klickr();

window.latestLinks = [];