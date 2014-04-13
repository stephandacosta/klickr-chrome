angular.module('KlickrChromeApp', [])

  .controller('PopupCtrl', function ($scope) {

    var bg = chrome.extension.getBackgroundPage();
    $scope.showSaver = false;
    $scope.showMessage = false;
    $scope.message = '';

    // truthy tests
    $scope.isRecording = function(){
      return bg.rec !== undefined;
    };

    // $scope.isPaused = function(){
    //   return bg.isPaused;
    // };

    $scope.canPlay = function(){
      return bg.id !== '';
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

    $scope.replay = function(){
      bg.replay();
    };

    $scope.toHome = function(){
      chrome.tabs.create({url: 'http://www.klickr.io'});

    $scope.pause = function(){
      bg.pause();
    };

    $scope.saveKlick = function(){
      console.log('Save Klick', $scope.desc);
      if ($scope.desc === undefined || $scope.desc === ''){
        $scope.errorMsg = 'Give your Klick a title..';
      } else {
        $scope.showSaver = false;
        $scope.message = 'All\'s Good';
        $scope.showMessage = true;
        bg.saveKlick($scope.desc);
      }
    };

  });