import Game from "./src/Game.js";

const instructionsMobile = `
    <div class="instruction-item">
      <span class="instruction-label">Move Left:</span>
      <span class="instruction-text">Touch left</span>
    </div>
    <div class="instruction-item">
      <span class="instruction-label">Move Right:</span>
      <span class="instruction-text">Touch right</span>
    </div>
    <div class="instruction-item">
      <span class="instruction-label">Launch:</span>
      <span class="instruction-text">Double tap</span>
    </div>
`;

const instructionsDesktop = `
    <div class="instruction-item">
      <span class="instruction-label">Move Left:</span>
      <span class="kbd">←</span>
    </div>
    <div class="instruction-item">
      <span class="instruction-label">Move Right:</span>
      <span class="kbd">→</span>
    </div>
    <div class="instruction-item">
      <span class="instruction-label">Launch Ball:</span>
      <span class="kbd">Space</span>
    </div>
`;

// Initialize and start the game
document.addEventListener("DOMContentLoaded", () => {
  // Toggle instructions panel when help button is clicked
  document.getElementById("helpButton").addEventListener("click", function () {
    const instructionsPanel = document.getElementById("instructionsPanel");
    instructionsPanel.classList.toggle("hidden");
  });

  // Update instructions based on device width
  const updateInstructions = () => {
    const isMobile = window.innerWidth < 768;
    const instructionsContent = document.querySelector(".instructions-content");

    if (isMobile) {
      instructionsContent.innerHTML = instructionsMobile;
    } else {
      instructionsContent.innerHTML = instructionsDesktop;
    }
  };

  // Update instructions on page load and window resize
  updateInstructions();
  window.addEventListener("resize", updateInstructions);

  // Initialize the game
  const game = new Game("myCanvas");
});
