angular.module('KlickrChromeApp', [])

  .controller('PopupCtrl', function ($scope) {

    var bg = chrome.extension.getBackgroundPage();
    $scope.showSaver = false;

    $scope.toHome = function(){
      chrome.tabs.create({url: "http://www.klickr.io"});
    };

    $scope.startRecording = function(){
      window.close();
      bg.startRecording();
    };

    $scope.stopRecording = function(){
      $scope.showSaver = true;
      bg.stopRecording();
    };

    $scope.playRecording = function(){
      window.close();
      bg.playKlick();
    };

    $scope.saveKlick = function(){
      bg.saveKlick($scope.desc);
    };

  });