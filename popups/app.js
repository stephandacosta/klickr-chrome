angular.module('KlickrChromeApp', [])

  .controller('PopupCtrl', function ($scope) {
    var bg = chrome.extension.getBackgroundPage();

    // chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    //   if (request.action === 'sendPauseMessage') {
    //     $scope.isPaused = request.isPaused;
    //     console.log("In app.js and $scope.isPaused is", $scope.isPaused);
    //   }
    // });

    $scope.showMessage = false;
    $scope.message = '';
    // $scope.isPaused = bg.editor.isPaused;

    $interval(function() {
      $scope.recorderStatus = bg.recorderStatus;
      if (bg.editor !== undefined) {
        $scope.isPaused = bg.editor.isPaused;
      }
    }, 500);
    // $scope.recorderStatus = bg.recorderStatus;

    $scope.canRecord = function(){
      return $scope.recorderStatus === 'ready';
    };

    $scope.canStop = function(){
      return $scope.recorderStatus === 'recording';
    };

    $scope.canPlay = function(){
      return bg.bgPlayer.id !== '';
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
      $scope.recorderStatus = 'processing';
      bg.stopRecording();
      $scope.isPaused = true;
    };

    $scope.playRecording = function(){
      window.close();
      bg.bgPlayer.playKlick();
    };

    $scope.replay = function(){
      // $scope.isPaused = !$scope.isPaused;
      console.log("App.js: replay");
      bg.editor.resumePlayback();
    };

    $scope.pause = function(){
      // $scope.isPaused = !$scope.isPaused;
      console.log("App.js: pause");
      bg.editor.pausePlayback();
    };

    $scope.toHome = function(){
      chrome.tabs.create({url: 'http://www.klickr.io'});
    };

    $scope.save = function(){
      console.log('Save', $scope.desc);
      if ($scope.desc === undefined || $scope.desc === ''){
        $scope.errorMsg = 'Give your Klick a name that packs punch';
      } else {
        $scope.recorderStatus = 'saving';
        $scope.message = 'All\'s Good';
        $scope.showMessage = true;
        bg.saveKlick($scope.desc);
      }
    };

    $scope.delete = function(){
      bg.delete();
      window.close();
    };

  });
