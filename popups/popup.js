$(function(){

  $('#view').click(function() {
    chrome.tabs.create({url: "popups/viewer.html"});
  });

  $('#options').click(function() {
    chrome.tabs.create({url: "popups/options.html"});
  });

  $('#start').click(function() {
    chrome.extension.getBackgroundPage().startRecording();
  });

  $('#stop').click(function() {
    chrome.extension.getBackgroundPage().stopRecording();
  });

  $('#play').click(function() {
    chrome.extension.getBackgroundPage().playKlick();
  });

});