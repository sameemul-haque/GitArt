document.addEventListener("DOMContentLoaded", function () {
  const squaresContainer = document.querySelector(".squares");
  const squares = [];

  for (let i = 0; i < 365; i++) {
    const square = document.createElement("li");
    square.setAttribute("data-level", "0");
    squares.push(square);
    squaresContainer.appendChild(square);
    square.addEventListener("click", function () {
      const currentLevel = parseInt(square.getAttribute("data-level"));
      increaseLevel(square, currentLevel);
    });

    square.addEventListener("contextmenu", function (event) {
      event.preventDefault();
      const currentLevel = parseInt(square.getAttribute("data-level"));
      decreaseLevel(square, currentLevel);
    });
  }

  function increaseLevel(square, currentLevel) {
    if (currentLevel < 4) {
      const newLevel = currentLevel + 1;
      square.setAttribute("data-level", newLevel);
    }
  }

  function decreaseLevel(square, currentLevel) {
    if (currentLevel > 0) {
      const newLevel = currentLevel - 1;
      square.setAttribute("data-level", newLevel);
    }
  }
});
