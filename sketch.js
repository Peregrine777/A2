// Page navigation variables
let currentPage = "main"; // "main" or "diagram"
let pageButton;

function preload() {
  preloadMainSketch();
}

function setup() {
  setupMainSketch();
  setupLightingDiagram();

  // Button to switch pages with new styling
  pageButton = createButton("View Making Of");
  pageButton.class("btn page-btn");
  pageButton.position(20, window.innerHeight - 80); // Bottom left position
  pageButton.mousePressed(switchPage);
}

function switchPage() {
  if (currentPage === "main") {
    currentPage = "diagram";
    pageButton.html("View Main Sketch");
    hideMainSketchControls();
    showLightingDiagramControls();
    // Reset camera for lighting diagram (2D view)
    resetCamera();
  } else {
    currentPage = "main";
    pageButton.html("View Making Of");
    showMainSketchControls();
    hideLightingDiagramControls();
    // Reset camera when returning to main sketch
    resetCamera();
  }
}

function resetCamera() {
  // Reset camera to default position and orientation
  camera(0, 0, height / 2.0 / tan((PI * 30.0) / 180.0), 0, 0, 0, 0, 1, 0);
}

function draw() {
  if (currentPage === "diagram") {
    drawLightingDiagram();
  } else {
    drawMainSketch();
  }
}
