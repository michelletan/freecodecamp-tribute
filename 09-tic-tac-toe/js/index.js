(function() {
  angular
    .module('ticTacToeApp', ['ngMaterial'])
    .config(function($mdThemingProvider) {
      $mdThemingProvider.theme('default')
        .primaryPalette('cyan');
    });

  // Controller
  angular
    .module('ticTacToeApp')
    .controller('TicTacToeController', TicTacToeController);

  TicTacToeController.$inject = ['$scope', '$mdDialog', 'ticTacToeService'];

  // Factory
  angular
    .module('ticTacToeApp')
    .factory('ticTacToeService', ticTacToeService);

  // Constructors
  function TicTacToeController($scope, $mdDialog, ticTacToeService) {
    var vm = this;
    var confirm = $mdDialog.confirm()
      .title('Pick your symbol!')
      .textContent('(X goes first)')
      .ariaLabel('Start Game')
      .ok('X')
      .cancel('O');

    vm.getGrid = getGrid;
    vm.processInput = processInput;
    vm.isGameRunning = isGameRunning;
    vm.isPlayerTurn = isPlayerTurn;
    vm.isPlayerWinner = isPlayerWinner;

    // Init
    showStartDialog();

    // Public functions
    function getGrid() {
      return ticTacToeService.getGridAsFlatArray();
    }

    function processInput(title) {
      // Convert into grid coordinates
      var x = Math.floor(title / 3);
      var y = title % 3;

      ticTacToeService.mark(x, y);

      if (ticTacToeService.isGameEnded()) {
        showStartDialog();
      }
    }

    function isGameRunning() {
      return !ticTacToeService.isGameEnded();
    }

    function isPlayerTurn() {
      return ticTacToeService.isPlayerTurn();
    }

    function isPlayerWinner() {
      return ticTacToeService.isPlayerWinner();
    }

    // Private functions
    function showStartDialog() {
      $mdDialog.show(confirm).then(function() {
        ticTacToeService.startGame(true);
      }, function() {
        ticTacToeService.startGame(false);
      });
    }
  }

  // Set player's turn (isX) before starting game
  // X moves first
  // Check if game has ended with isGameEnd
  function ticTacToeService() {
    var numRows = 3;
    var numCols = 3;

    var gridState = null;
    var isGameRunning = false;
    var isXTurn = true;
    var playerTurn = null;
    var winner = null;

    resetGrid(); // Initialise grid

    return {
      getGrid: getGrid,
      getGridAsFlatArray: getGridAsFlatArray,
      startGame: startGame,
      mark: markForPlayer,
      endGame: endGame,
      resetGame: resetGame,
      isGameEnded: isGameEnded,
      isPlayerTurn: isPlayerTurn,
      isPlayerWinner: isPlayerWinner
    };

    // Public functions
    function getGrid() {
      return gridState;
    }

    function getGridAsFlatArray() {
      return convertGridToFlatArray(gridState);
    }

    function startGame(isPlayerX) {
      if (!isGameRunning) {
        setPlayerTurn(isPlayerX);
        resetGame();
        isGameRunning = true;

        // If computer starts first
        if (!isPlayerX) {
          // Computer move
          markForComputer();
        }
      }
    }

    function markForPlayer(x, y) {
      // Check if square has been marked
      if (!isGameEnded() &&
        isSquareEmpty(x, y)) {

        mark(x, y);

        // Check if player has won
        if (isWinner(playerTurn)) {
          winner = playerTurn;
          endGame();
        }

        if (isGridFilled(gridState)) {
          endGame();
        } else {
          // Proceed with computer turn
          markForComputer();
        }
      }
    }

    function endGame() {
      isGameRunning = false;
    }

    function resetGame() {
      resetGrid();
      winner = null;
      isXTurn = true;
    }

    function isGameEnded() {
      return !isGameRunning;
    }

    function isPlayerTurn() {
      return playerTurn === isXTurn;
    }

    function isPlayerWinner() {
      return winner !== null && winner === playerTurn;
    }

    // Private functions
    // Make a 3x3 grid
    function resetGrid() {
      gridState = new Array(numRows).fill(null);
      gridState = gridState.map(function(val) {
        return new Array(numCols).fill(null);
      });
    }

    function setPlayerTurn(isX) {
      if (!isGameRunning) {
        playerTurn = isX;
      }
    }

    function isSquareEmpty(x, y) {
      return gridState[x][y] === null;
    }

    function isWinner(isX) {
      // Only run the check if winner has not been checked
      if (winner === null) {

        var check = getHighestOccurrenceInRow(isX);

        return check.count === 3;
      } else {
        return winner;
      }
    }

    function mark(x, y) {
      // Check if square has been marked
      if (isSquareEmpty(x, y)) {
        gridState[x][y] = isXTurn; // Mark grid
        isXTurn = !isXTurn; // Switch turns
      }
    }

    function markForComputer() {
      // Find empty square to mark
      var x = null;
      var y = null;

      // Check if computer is close to winning
      var comCheck = getHighestOccurrenceInRow(!playerTurn);
      if (comCheck.count === 2) {
        // Find the empty square in the row and mark it
        comCheck.row.map(function(coor) {
          if (isSquareEmpty(coor[0], coor[1])) {
            x = coor[0];
            y = coor[1];
          }
        });
      } else {
        // Check if opponent is close to winning
        var playerCheck = getHighestOccurrenceInRow(playerTurn);

        // Pick a square where the player has placed their symbol
        // If count === 2, this blocks the player
        playerCheck.row.map(function(coor) {
          if (isSquareEmpty(coor[0], coor[1])) {
            x = coor[0];
            y = coor[1];
          }
        });
      }

      if (x === null || y === null) {
        // Pick random empty square
        var coor = getEmptySquare();

        x = coor[0];
        y = coor[1];
      }

      // Mark chosen square
      mark(x, y);

      // Check if computer has won
      if (isWinner(!playerTurn)) {
        winner = !playerTurn;
        endGame();
      }

      // Check if grid has been filled
      if (isGridFilled(gridState)) {
        endGame();
      }
    }

    // Returns the highest count of the occurrence of either X or O
    // in all possible rows in the grid, and the coordinates of the
    // row.
    function getHighestOccurrenceInRow(isX) {
      var highestCount = 0;
      var result = {
        count: highestCount,
        row: []
      };

      // Check rows
      for (var i = 0; i < numRows; i++) {
        var count = 0;
        var resultRow = [];

        for (var j = 0; j < numCols; j++) {
          if (gridState[i][j] === isX) {
            count++;
          }

          resultRow.push([i, j]);
        }

        if (count > highestCount) {
          highestCount = count;
          result.count = count;
          result.row = resultRow;
        }
      }

      // Check columns
      for (var i = 0; i < numCols; i++) {
        var count = 0;
        var resultRow = [];

        for (var j = 0; j < numRows; j++) {
          if (gridState[j][i] === isX) {
            count++;
          }

          resultRow.push([j, i]);
        }

        if (count > highestCount) {
          highestCount = count;
          result.count = count;
          result.row = resultRow;
        }
      }

      // Check diagonals
      var countLeft = 0;
      var countRight = 0;
      var resultRowLeft = [];
      var resultRowRight = [];

      for (var i = 0; i < numRows; i++) {
        for (var j = 0; j < numCols; j++) {
          // Top-left to bottom-right diagonal
          if (i === j) {
            if (gridState[i][j] === isX) {
              countLeft++;
            }

            resultRowLeft.push([i, j]);
          }

          // Bottom-left to top-right diagonal
          if ((i === 0 && j === (numRows - 1)) ||
            (i === (numCols - 1) && j === 0) ||
            (i !== 0 && j !== 0 && i === j)) {

            if (gridState[i][j] === isX) {
              countRight++;
            }

            resultRowRight.push([i, j]);
          }
        }
      }

      if (countLeft > highestCount) {
        highestCount = countLeft;
        result.count = countLeft;
        result.row = resultRowLeft;
      }

      if (countRight > highestCount) {
        highestCount = countRight;
        result.count = countRight;
        result.row = resultRowRight;
      }

      return result;
    }

    function getEmptySquare() {
      for (var i = 0; i < numRows; i++) {
        for (var j = 0; j < numCols; j++) {
          if (isSquareEmpty(i, j)) {
            return [i, j];
          }
        }
      }

      return null;
    }

    function convertGridToFlatArray(array) {
      return array.reduce(function(prev, curr) {
        return prev.concat(curr);
      }, []);
    }

    function isGridFilled() {
      return getEmptySquare() === null;
    }
  }

})();