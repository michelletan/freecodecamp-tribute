(function() {
  angular
    .module('twitchStreamerApp', ['ngMaterial']);

  // Controller
  angular
    .module('twitchStreamerApp')
    .controller('TwitchController', TwitchController);

  TwitchController.$inject = ['$http', '$window', 'twitchFactory'];

  // Factory
  angular
    .module('twitchStreamerApp')
    .factory('twitchFactory', twitchFactory);

  twitchFactory.$inject = ['$http'];

  // Filter
  angular
    .module('twitchStreamerApp')
    .filter('trustHtml', trustHtml);

  trustHtml.$inject = ['$sce'];

  // Constructors
  function TwitchController($http, $window, twitchFactory) {
    var vm = this;

    var streamerIds = ["ESL_SC2", "OgamingSC2", "cretetion", "freecodecamp", "storbeck", "habathcx", "RobotCaleb", "noobs2ninjas", "brunofin", "comster404"];

    vm.tabs = [{
      label: "All",
      isCardShown: function(status) {
        return true;
      }
    }, {
      label: "Streaming",
      isCardShown: isStreamOnline
    }, {
      label: "Offline",
      isCardShown: isStreamOffline
    }, {
      label: "Closed",
      isCardShown: isStreamClosed
    }];
    
    vm.openStream = openLinkInNewWindow;

    getStatusOfStreamers();

    function openLinkInNewWindow(link) {
      $window.open(link, '_blank');
    }

    function getStatusOfStreamers() {
      vm.streamers = [];
      streamerIds.map(function(id) {
        twitchFactory.getTwitchStream(id).then(function(response) {
          // Add the id of the streamer to the response data
          var stream = response.data;
          stream.id = id;
          stream.status = stream.stream ?
            'Currently streaming: ' + stream.stream.game :
            (stream.error ? 'Does not exist' : 'Offline');
          vm.streamers.push(stream);

        });
      });
    }

    function isStreamOnline(status) {
      return status.indexOf('Currently streaming') > -1;
    }

    function isStreamOffline(status) {
      return status === 'Offline';
    }

    function isStreamClosed(status) {
      return status === 'Does not exist';
    }
  }

  function twitchFactory($http) {
    var service = {
      getTwitchStream: getTwitchStream
    };

    return service;

    function getTwitchStream(broadcaster) {
      var endpoint = "https://api.twitch.tv/kraken/streams";
      var channel = "/" + broadcaster;
      var callback = "?callback=JSON_CALLBACK";

      var url = endpoint + channel + callback;

      return $http.jsonp(url);
    }
  }

  function trustHtml($sce) {
    return function(html) {
      return $sce.trustAsHtml(html);
    };
  }

})();