(function() {
  angular
    .module('calculatorApp', ['ngMaterial'])
    .config(function($mdThemingProvider) {
      $mdThemingProvider.theme('default')
        .primaryPalette('light-green');
    });

  // Controller
  angular
    .module('calculatorApp')
    .controller('CalculatorController', CalculatorController);

  CalculatorController.$inject = ['$scope', 'calculatorService'];

  angular
    .module('calculatorApp')
    .factory('calculatorService', calculatorService);

  // Constructors
  function CalculatorController($scope, calculatorService) {
    var vm = this;

    var defaultDisplay = '0';
    var prev = defaultDisplay;

    vm.tiles = [
      '', '', 'AC', 'CE',
      '7', '8', '9', '/',
      '4', '5', '6', '*',
      '1', '2', '3', '-',
      '.', '0', '=', '+'
    ];

    vm.display = defaultDisplay;

    vm.processInput = processInput;

    function parseInputToNumber(input) {
      return parseFloat(input);
    }

    function processInput(input) {
      if (calculatorService.isNumber(parseFloat(input))) {
        if (calculatorService.isOperation(prev)) {
          calculatorService.addInput(prev);
          prev = input;
        } else {
          prev += input;
        }

        addToDisplay(input);

      } else if (calculatorService.isOperation(input) ||
        prev === '.') {
        // Previous has to be a number
        if (calculatorService.isNumber(parseFloat(prev)) &&
          prev.slice(-1) !== '.') {

          calculatorService.addInput(parseFloat(prev));
          prev = input;

          addToDisplay(input);
        }
      } else if (input === '.') {
        // Previous has to be a number
        if (calculatorService.isNumber(parseFloat(prev))) {
          prev += input;

          addToDisplay(input);
        }
      } else if (input === '=') {

        if (calculatorService.isNumber(parseFloat(prev))) {
          calculatorService.addInput(parseFloat(prev));
        } else {
          calculatorService.addInput(prev);
        }

        var result = calculatorService.getOutput().toString();

        vm.display = result;
        prev = result;

      } else if (input === 'AC') {
        calculatorService.clearMemory();
        resetDisplay();

      } else if (input === 'CE') {
        calculatorService.removePreviousInput();
        clearOneInput();
      }
    }

    function addToDisplay(input) {
      if (vm.display === defaultDisplay ||
        vm.display.indexOf('NaN') > -1 ||
        vm.display.indexOf('Infinity') > -1) {
        vm.display = input;
      } else {
        vm.display += input;
      }
    }

    function clearOneInput() {
      if (vm.display.length === 1) {
        vm.display = defaultDisplay;
        prev = defaultDisplay;
      } else {
        // Remove the last char of display
        vm.display = vm.display.slice(0, -1);

        // Get last char of display
        prev = vm.display.slice(-1);
      }
    }

    function resetDisplay() {
      vm.display = defaultDisplay;
      prev = defaultDisplay;
    }

  }

  function calculatorService() {
    var memory = [];

    return {
      addInput: addInput,
      getOutput: getOutput,
      removePreviousInput: removePreviousInput,
      clearMemory: clearMemory,
      isNumber: isNumber,
      isOperation: isOperation
    };

    // Public functions
    function addInput(input) {
      if (!isNumber(input) && !isOperation(input)) {
        return;
      }

      // Check that no consecutive numbers or operations are inserted
      if (memory.length > 0) {
        var prev = memory[memory.length - 1];

        // If the prev and current input are the same types
        // Do not accept input
        if (!(isNumber(prev) ? !isNumber(input) : isNumber(input))) {
          return;
        }
      }

      memory.push(input);
    }

    function getOutput() {
      var result = calculate();
      clearMemory();

      return result;
    }

    function removePreviousInput() {
      if (memory.length > 0) {
        memory.pop();
      }
    }

    function clearMemory() {
      memory = [];
    }

    // Private functions
    function calculate() {
      var copy = memory.slice();

      while (copy.length > 1) {
        // Get the highest priority operation
        var index = getIndexOfNextOperation(copy);

        if (index < 0) {
          return;
        }

        var operator = copy[index];

        // Retrieve the numbers around the operation
        var x = copy[index - 1];
        var y = copy[index + 1];

        var result = executeOperator(operator, x, y);

        // Remove the operation and 2 numbers
        // Insert back at the index of the first number
        copy.splice(index - 1, 3, result);

      }

      // Only the result is left
      return copy.pop();
    }

    function getIndexOfNextOperation(array) {
      var operations = ['*', '/', '+', '-'];
      var index = -1;

      for (var i = 0; i < operations.length; i++) {
        if ((index = array.indexOf(operations[i])) > -1) {
          return index;
        }
      }

      return index;
    }

    function executeOperator(op, x, y) {
      switch (op) {
        case '*':
          return x * y;
        case '/':
          return x / y;
        case '+':
          return x + y;
        case '-':
          return x - y;
      }
    }

    function isNumber(input) {
      return typeof input === 'number' && !isNaN(input);
    }

    function isOperation(input) {
      return typeof input === 'string' && input.match(/[+\-*\/]/);
    }
  }

})();