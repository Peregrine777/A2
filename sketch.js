// Page navigation variables
let currentPage = "main"; // "main" or "diagram"
let pageButton;

function preload() {
  preloadMainSketch();
}

function setup() {
  setupMainSketch();
  setupLightingDiagram();

  // Button to switch pages
  pageButton = createButton("View Lighting Diagram");
  pageButton.position(280, 10);
  pageButton.mousePressed(switchPage);
}

function switchPage() {
  if (currentPage === "main") {
    currentPage = "diagram";
    pageButton.html("View Main Sketch");
    hideMainSketchControls();
    showLightingDiagramControls();
  } else {
    currentPage = "main";
    pageButton.html("View Lighting Diagram");
    showMainSketchControls();
    hideLightingDiagramControls();
  }
}

function draw() {
  if (currentPage === "diagram") {
    drawLightingDiagram();
  } else {
    drawMainSketch();
  }
}
