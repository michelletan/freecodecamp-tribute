(function() {
  angular
    .module('wikipediaViewerApp', ['ui.bootstrap']);

  // Controller
  angular
    .module('wikipediaViewerApp')
    .controller('WikiController', WikiController);

  WikiController.$inject = ['$http', '$sce', 'wikipediaFactory'];

  // Factory
  angular
    .module('wikipediaViewerApp')
    .factory('wikipediaFactory', wikipediaFactory);

  wikipediaFactory.$inject = ['$http'];

  // Filter
  angular
    .module('wikipediaViewerApp')
    .filter('trustHtml', trustHtml);

  trustHtml.$inject = ['$sce'];

  // Constructors
  function WikiController($http, $sce, wikipediaFactory) {
    var vm = this;

    var randomWikiPageUrl = "https://en.wikipedia.org/wiki/Special:Random?dummy=";

    vm.wikiPageUrl = "";

    vm.showRandomArticle = function() {
      vm.wikiPageUrl = $sce.trustAsResourceUrl(randomWikiPageUrl + (new Date()).getTime());
      vm.isRandomVisible = true;
      vm.isSearchVisible = false;
    };

    vm.showSearch = function(searchText) {
      vm.isRandomVisible = false;
      vm.isSearchVisible = true;
      wikipediaFactory
        .getSearchResults(searchText)
        .then(function(data) {
        console.log(data);
          vm.results = data.data.query.search;
          vm.totalHits = data.data.query.searchinfo.totalhits;
        });

    };
  }

  function wikipediaFactory($http) {
    var service = {
      getSearchResults: getSearchResults
    };

    return service;

    function getSearchResults(keyword) {
      var endpoint = "https://en.wikipedia.org/w/api.php";
      var format = "?format=json";
      var action = "&action=query";
      var list = "&list=search";
      var srsearch = "&srsearch=" + keyword;
      var prop = "&prop=info&inprop=url";
      var callback = "&callback=JSON_CALLBACK";

      var url = endpoint + format + action + list + srsearch + prop + callback;

      return $http.jsonp(url);
    }
  }

  function trustHtml($sce) {
    return function(html) {
      return $sce.trustAsHtml(html);
    };
  }

})();