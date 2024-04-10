document.addEventListener("DOMContentLoaded", function () {
  const squaresContainer = document.querySelector(".squares");
  const squares = [];

  for (let i = 0; i < 365; i++) {
    const square = document.createElement("li");
    square.setAttribute("data-level", "0");
    squares.push(square);
    squaresContainer.appendChild(square);
  }

  let currentLevel = 0;

  function increaseLevel() {
    if (currentLevel < 4) {
      currentLevel++;
      updateSquareLevel();
    }
  }

  function decreaseLevel() {
    if (currentLevel > 0) {
      currentLevel--;
      updateSquareLevel();
    }
  }

  function updateSquareLevel() {
    squares.forEach((square) => {
      square.setAttribute("data-level", currentLevel);
    });
  }

  squaresContainer.addEventListener("click", increaseLevel);
  squaresContainer.addEventListener("contextmenu", function (event) {
    event.preventDefault();
    decreaseLevel();
  });
});
