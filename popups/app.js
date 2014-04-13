angular.module('KlickrChromeApp', [])

  .controller('PopupCtrl', function ($scope) {

    var bg = chrome.extension.getBackgroundPage();
    $scope.showSaver = false;
    $scope.showMessage = false;
    $scope.message = '';
    $scope.recorderStatus = bg.recorderStatus;

    $scope.canRecord = function(){
      return $scope.recorderStatus === 'ready';
    };

    $scope.canStop = function(){
      return $scope.recorderStatus === 'recording';
    };

    $scope.canPlay = function(){
      return bg.id !== '';
    };

    $scope.showSaver = function(){
      return $scope.recorderStatus === 'processing';
    };

    // on click handlers
    $scope.startRecording = function(){
      window.close();
      $scope.recorderStatus = 'recording';
      bg.startRecording();
    };

    $scope.stopRecording = function(){
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