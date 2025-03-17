import Game from "./src/Game.js";

// Initialize and start the game
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("helpButton").addEventListener("click", function () {
    const instructionsPanel = document.getElementById("instructionsPanel");
    instructionsPanel.classList.toggle("hidden");
  });
  const game = new Game("myCanvas");
});
