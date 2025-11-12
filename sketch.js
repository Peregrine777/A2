// Page navigation variables
let currentPage = "main"; // "main" or "diagram"
let pageButton;
let previousReferenceImageState; // Store reference image state when switching modes

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

  // Ensure lighting diagram controls are hidden on startup since we start with main sketch
  hideLightingDiagramControls();
}

function switchPage() {
  if (currentPage === "main") {
    currentPage = "diagram";
    pageButton.html("View Main Sketch");
    hideMainSketchControls();
    showLightingDiagramControls();
    
    // Hide reference image in diagram mode
    previousReferenceImageState = showReferenceImage; // Store current state
    showReferenceImage = false; // Hide reference image
    updateReferenceImageDisplay(); // Apply the change
    
    // Reset camera for lighting diagram (2D view)
    resetCamera();
  } else {
    currentPage = "main";
    pageButton.html("View Making Of");
    showMainSketchControls();
    hideLightingDiagramControls();
    
    // Restore reference image state when returning to main sketch
    if (previousReferenceImageState !== undefined) {
      showReferenceImage = previousReferenceImageState; // Restore previous state
      updateReferenceImageDisplay(); // Apply the change
      // Update the checkbox to match the restored state
      if (referenceImageCheckbox) {
        referenceImageCheckbox.checked(showReferenceImage);
      }
    }
    
    // Reset camera when returning to main sketch
    resetCamera();
  }
}

function resetCamera() {
  // Reset camera to default position and orientation
  camera(0, 0, height / 2.0 / tan((PI * 20.0) / 180.0), -100, -100, 0, 0, 1, 0);
}

function draw() {
  if (currentPage === "diagram") {
    drawLightingDiagram();
  } else {
    drawMainSketch();
  }
}
