angular.module('KlickrChromeApp', [])

  .controller('PopupCtrl', function ($scope, $interval) {

    var bg = chrome.extension.getBackgroundPage();

    /* Status update loop */
    $scope.refreshStatus = function(){
      $scope.recorderStatus = bg.Klickr.recorderStatus;
      $scope.editorStatus = bg.editor === undefined ? 'inactive' : bg.editor.getStatus();
    };

    $scope.refreshStatus();
    $interval(function() {
      $scope.refreshStatus();
      $scope.Links = bg.Klickr.latestLinks;  //stephan add
      if ($scope.Links.length>0) {$scope.showRecentLinks = true;}  //stephan add
    }, 500);

    $scope.showMessage = false;
    $scope.message = '';
    $scope.showRecentLinks = false;

    /* ------------------------------------------------------------------------------------*/
    /* TOP NAV
    /* ------------------------------------------------------------------------------------*/

    $scope.canRecord = function(){
      return $scope.recorderStatus === 'ready' && bg.Klickr.bgPlayer.getStatus() !== 'playing';
    };

    $scope.canStop = function(){
      return $scope.recorderStatus === 'recording';
    };

    $scope.canPlay = function(){
      return bg.Klickr.bgPlayer.getStatus() === 'ready';
    };

    $scope.showSaver = function(){
      return $scope.recorderStatus === 'processing';
    };

    // on click handlers
    $scope.startRecording = function(){
      window.close();
      $scope.recorderStatus = 'recording';
      bg.Klickr.startRecording();
    };

    $scope.stopRecording = function(){
      $scope.recorderStatus = 'processing';
      bg.Klickr.bgRecorder.stopRecording();
      $scope.isPaused = true;
    };

    $scope.playRecording = function(){
      window.close();
      bg.Klickr.bgPlayer.play();
    };

    $scope.toHome = function(){
      chrome.tabs.create({url: 'http://www.klickr.io'});
    };

    /* ------------------------------------------------------------------------------------*/
    /* POST-RECORDING PROCESSING
    /* ------------------------------------------------------------------------------------*/


    $scope.replay = function(){
      console.log('Popup: replay');
      if (bg.editor === undefined) throw new Error('Popup: BgEditor should be defined when replay is clicked');
      bg.editor.replay();
      $scope.refreshStatus();
    };

    $scope.pause = function(){
      // $scope.isPaused = !$scope.isPaused;
      console.log('Popup: pause');
      if (bg.editor === undefined) throw new Error('Popup: BgEditor should be defined when pause is clicked');
      bg.editor.pausePlayback();
      $scope.refreshStatus();
    };

    $scope.save = function(){
      console.log('Save', $scope.desc);
      if ($scope.desc === undefined || $scope.desc === ''){
        $scope.errorMsg = 'Give your Klick a name that packs punch';
      } else {
        $scope.recorderStatus = 'saving';
        $scope.message = 'All\'s Good';
        $scope.showMessage = true;
        bg.save($scope.desc);

        bg.Klickr.deleteRecorder();
      }
    };

    $scope.delete = function(){
      bg.Klickr.deleteRecorder();
      window.close();
    };

    $scope.encodedUrl = function(url){
      return encodeURIComponent(url);
    };

  });
