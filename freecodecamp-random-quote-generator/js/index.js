(function() {
  var app = angular.module('quoteGeneratorApp', []);

  app.controller('quoteCtrl', function($scope, $http, $sce) {

    $scope.currentQuote = {
      title: "",
      content: "Loading quotes..."
    };
    
    $scope.currentQuoteText = $scope.currentQuote.content;

    $scope.randomiseQuote = function() {
      $http.jsonp("http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1&_jsonp=JSON_CALLBACK")
        .success(function(data) {
          $scope.currentQuote = data.shift();
        $scope.currentQuoteText = $sce.trustAsHtml($scope.currentQuote.content);
        
        if (typeof $scope.currentQuote.custom_meta !== 'undefined' && typeof $scope.currentQuote.custom_meta.Source !== 'undefined') {
          $scope.currentQuote.source = 'Source:' + $scope.currentQuote.custom_meta.Source;
        } else {
          $scope.currentQuote.source = '';
        }
        $scope.createTweetText();
        });
    };
    
    $scope.createTweetText = function() {
      var postfix = "+%23quotes";
      var text = $scope.currentQuote.content.replace(/<(?:.|\n)*?>/gm, "").replace(/&#8217;/g, "'").replace(/ /g, "+") + " ";
      var author = $scope.currentQuote.title.replace(" ", "+");
      
      // Truncate text if too long
      text = text.length > 140 - 3 - author.length - postfix.length ? text.substr(0, 140 - 3 - author.length - postfix.length) + "... " : text;
      
      $scope.currentQuoteLink = text + author + postfix;
    }
  });
})();