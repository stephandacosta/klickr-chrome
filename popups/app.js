angular.module('KlickrChromeApp', [])

  .controller('PopupCtrl', function ($scope, $interval) {

    var bg = chrome.extension.getBackgroundPage();
    $scope.showMessage = false;
    $scope.message = '';
    $scope.isPaused = true;

    $scope.recorderStatus = bg.recorderStatus;

    // stephan start
    $interval(function(){
      $scope.Links = bg.latestLinks;
    },500);

    $scope.redirect = function(url){
      chrome.tabs.create({url: url});
    };

    //stephan end


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
    };

    $scope.playRecording = function(){
      window.close();
      bg.bgPlayer.playKlick();
    };

    $scope.replay = function(){
      $scope.isPaused = !$scope.isPaused;
      console.log("App.js: replay");
      bg.bgPlayer.replay();
    };

    $scope.pause = function(){
      $scope.isPaused = !$scope.isPaused;
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
