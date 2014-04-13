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

    $scope.canPlay = function(){
      return bg.id !== '';
    };

    // on click handlers
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