(function() {
  angular
    .module('pomodoroApp', ['ngMaterial', 'ngMessages'])
    .config(function($mdThemingProvider) {
      $mdThemingProvider.theme('default')
        .primaryPalette('cyan');
    });

  // Controller
  angular
    .module('pomodoroApp')
    .controller('PomodoroController', PomodoroController);

  PomodoroController.$inject = ['$scope', 'pomodoroService'];

  // Factory
  angular
    .module('pomodoroApp')
    .factory('pomodoroService', pomodoroService);

  pomodoroService.$inject = ['$interval'];

  // Filter
  angular
    .module('pomodoroApp')
    .filter('millisecondsToDuration', millisecondsToDuration);

  // Constructors
  function PomodoroController($scope, pomodoroService) {
    $scope.model = pomodoroService;
  }

  function pomodoroService($interval) {
    var timerPromise;
    var timerInterval = 1000; // ms

    var workDurationDefault = 25; // mins
    var breakDurationDefault = 5; // mins

    // Set by user
    var workDuration = workDurationDefault; // mins
    var breakDuration = breakDurationDefault; // mins

    // Timer
    var timerDuration = convertMinutesToMilliseconds(workDuration); // ms
    var timerRemaining = timerDuration; // ms
    var timerProgress = 100; // %

    // State
    var isTimerRunning = false;
    var isTimerPaused = false;
    var isWorkState = true;

    return {
      workDuration: workDuration,
      breakDuration: breakDuration,
      
      setWorkDuration: setWorkDuration,
      setBreakDuration: setBreakDuration,

      timerDuration: timerDuration,
      getTimerRemaining: getTimerRemaining,
      getTimerProgress: getTimerProgress,

      getIsTimerRunning: getIsTimerRunning,
      isTimerPaused: isTimerPaused,
      getIsWorkState: getIsWorkState,

      start: startTimer,
      stop: stopTimer,
      pause: pauseTimer,
      continue: continueTimer,
      reset: resetState,

      isStartAvailable: isStartAvailable,
      isStopAvailable: isStopAvailable,
      isPauseAvailable: isPauseAvailable,
      isContinueAvailable: isContinueAvailable,
      isResetAvailable: isResetAvailable
    };

    // Public functions

    function getTimerRemaining() {
      return timerRemaining;
    }
    
    function getTimerProgress() {
      return timerProgress;
    }
    
    function getIsTimerRunning() {
      return isTimerRunning;
    }
    
    function getIsWorkState() {
      return isWorkState;
    }
    
    function setWorkDuration(duration) {
      workDuration = duration;
    }
    
    function setBreakDuration(duration) {
      breakDuration = duration; 
    }

    function startTimer() {
      if (isStartAvailable()) {
        resetState();
        timerPromise = $interval(decreaseTimer, timerInterval);
        isTimerRunning = true;
      }
    }

    function stopTimer() {
      if (isStopAvailable()) {
        if (!isTimerPaused) {
          $interval.cancel(timerPromise);
        }

        isTimerRunning = false;
      }
    }

    function pauseTimer() {
      if (isPauseAvailable()) {
        $interval.cancel(timerPromise);
        isTimerPaused = true;
      }
    }

    function continueTimer() {
      if (isContinueAvailable()) {
        timerPromise = $interval(decreaseTimer, timerInterval);
        isTimerPaused = false;
      }
    }

    function resetState() {
      if (isResetAvailable()) {
        isWorkState = true;
        isTimerPaused = false;
        resetTimer();
      }
    }

    function isStartAvailable() {
      return !isTimerRunning && !isTimerPaused &&
        workDuration != null && breakDuration != null;
    }

    function isStopAvailable() {
      return isTimerRunning;
    }

    function isPauseAvailable() {
      return isTimerRunning && !isTimerPaused;
    }

    function isContinueAvailable() {
      return isTimerRunning && isTimerPaused;
    }

    function isResetAvailable() {
      return !isTimerRunning && workDuration != null && 
        breakDuration != null;
    }

    // Private functions

    function resetTimer() {
      var newDuration = convertMinutesToMilliseconds(isWorkState ? workDuration : breakDuration);
      setTimer(newDuration);
    }

    function setTimer(duration) {
      timerDuration = duration;
      timerRemaining = duration;
      timerProgress = 100;
    }

    function decreaseTimer() {
      timerRemaining -= timerInterval;
      timerProgress = Math.floor(timerRemaining / timerDuration * 100);

      if (timerRemaining <= 0) {
        // Switch state
        isWorkState = !isWorkState;
        resetTimer();
      }
    }

    function convertMinutesToMilliseconds(mins) {
      return mins * 60 * 1000;
    }
  }

  // Converts given int from milliseconds to a string indicating
  // a duration with the format 'HH:mm:ss'
  function millisecondsToDuration() {
    return function(ms) {
      var secs = Math.floor((ms / 1000) % 60);
      var mins = Math.floor((ms / 1000 / 60) % 60);
      var hours = Math.floor((ms / 1000 / 60 / 60) % 60);

      if (secs < 10) {
        secs = "0" + secs;
      }

      if (mins < 10) {
        mins = "0" + mins;
      }

      if (hours < 10) {
        hours = "0" + hours;
      }

      return hours + ":" + mins + ":" + secs;
    };
  }

})();