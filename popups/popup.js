document.addEventListener('DOMContentLoaded', function () {
  $('#viewerLink').click(function() {
    chrome.tabs.create({url: "popups/viewer.html"});
  });
  $('#optionsLink').click(function() {
    chrome.tabs.create({url: "popups/options.html"});
  });
  $('#start').click(function() {
    chrome.extension.getBackgroundPage().start();
  });
  $('#stop').click(function() {
    chrome.extension.getBackgroundPage().stop();
  });
});