(function() {
  var app = angular.module('localWeatherApp', ['ui.bootstrap']);

  app.controller('weatherCtrl', function($scope, $http) {

    var openWeatherAPIKey = "c9f15a89d37fd14b399de9a117fd78f3";

    $scope.unitClicked = 'C';
    $scope.isMetric = true;

    $scope.convertTemperature = function(unitClicked) {
      var newTemp = convertBetweenCelsiusAndFahrenheit(unitClicked, $scope.temperature);
      $scope.isMetric = (unitClicked === "C");
      $scope.temperature = newTemp;
    }

    function getWeather() {
      var url = "http://api.openweathermap.org/data/2.5/weather?q=";
      var city = geoplugin_city();
      var units = "&units=";
      var unitType = $scope.isMetric ? "metric" : "imperial";
      var key = "&APPID=" + openWeatherAPIKey;

      url += city + units + unitType + key;

      $http.get(url)
        .success(function(data) {
          $scope.country = data.sys.country;
          $scope.temperature = Math.round(data.main.temp);
          $scope.weather = data.weather.pop();
          $scope.city = data.name;
          $scope.weatherImg = "http://openweathermap.org/img/w/" + $scope.weather.icon + ".png";
          updateWeatherBackground();
          createTweetText();
        });
    }

    function handleGeolocationError(error) {
      console.log(error);
    }

    function updateWeatherBackground() {
      var bg, font = "";
      var weather = $scope.weather.main;
      switch (weather) {
        case "Thunderstorm":
          bg = "#10364F";
          font = "white";
          break;
        case "Drizzle":
          bg = "#6ACCD2";
          font = "white";
          break;
        case "Rain":
          bg = "#989BB3";
          font = "white";
          break;
        case "Snow":
          bg = "#FFFFFF";
          font = "black";
          break;
        case "Atmosphere":
          bg = "#DADBD4";
          font = "black";
          break;
        case "Clear":
          bg = "#FFAEB0";
          font = "black";
          break;
        case "Clouds":
          bg = "#84B3C7";
          font = "white";
          break;
        case "Extreme":
          bg = "#D6A9AF";
          font = "white";
          break;
        case "Additional":
          bg = "#D3C7DA";
          font = "white";
          break;
      }

      $scope.weatherStyle = {
        "background-color": bg,
        "color": font
      };
    }

    function createTweetText() {
      var postfix = " +%23weather";
      var text = "Current weather in " + $scope.city + ": " + $scope.weather.main + " (" + $scope.weather.description + ")";

      // Truncate text if too long
      text = text.length > 140 - 3 - postfix.length ? text.substr(0, 140 - 3 - postfix.length) + "... " : text;

      $scope.weatherTweetText = text + postfix;
    }

    function convertBetweenCelsiusAndFahrenheit(unitClicked, degree) {
      // Convert to fahrenheit
      if (unitClicked === 'F') {
        return Math.round(degree * 9.0 / 5.0 + 32);
      } else {
        // Convert to celsius
        return Math.round((degree - 32) * 5.0 / 9.0);
      }
    }

    getWeather();
  });
})();