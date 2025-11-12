////////////////
// Parameters //
////////////////
let cols = 50;
let rows = 50;
let pixelSize = 4;
let colStrength = 0.8; // Angular difference between RGB lights, recommend 0.7;
let overSizePanels = 1.35; // to prevent gaps when rotated, range 1.0 to 1.5;
let pixelAvg = 4; // We are downsampling, 1 for nearest pixel, higher for averaging

/////////////////
// Definitions //
/////////////////
let img;
let imgPixels;
let showSphere = false;
let fileInput, sphereButton;
let webImageDropdown;
let lightTypeDropdown;
let lightType = "RGB Lights"; // default light type
let avgSlider;
let planeAngleOld, planeAngleNew;

let redLight, greenLight, blueLight;
let wgl; // WEBGL canvas
let overlay; // 2D overlay canvas
let diagramCanvas; // 2D canvas for lighting diagram

let webImages = [
  "https://images.pexels.com/photos/53141/rose-red-blossom-bloom-53141.jpeg",
  "https://images.pexels.com/photos/206893/pexels-photo-206893.jpeg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/RGB_combination_on_wall.png/1920px-RGB_combination_on_wall.png",
];

// UI element references for hiding/showing
let avgLabel, avgValueDisplay;

// New UI variables
let controlPanel;
let fileSection;
let fileModeButtons = {};
let currentFileMode = "selectURL";
let urlInput;
let isControlPanelMinimized = false;
let minimizeButton;
let controlPanelContent;

function preloadMainSketch() {
  img = loadImage(
    "https://images.pexels.com/photos/53141/rose-red-blossom-bloom-53141.jpeg"
  );
}

function setupMainSketch() {
  // --- WEBGL canvas ---
  wgl = createCanvas(800, 800, WEBGL);
  wgl.position(0, 0); // background canvas
  noStroke();

  setupUI();

  // define RGB light directions (not using perceptual, so just a guess)
  redLight = createVector(-colStrength, -colStrength, -1).normalize();
  greenLight = createVector(colStrength, -colStrength, -1).normalize();
  blueLight = createVector(-0.0, colStrength, -1).normalize();

  img.loadPixels(); // Load pixel array once
  imgPixels = img.pixels; // Store reference to pixels array
}

function setupUI() {
  // --- 2D overlay canvas ---
  overlay = createGraphics(200, 200); // small preview on top
  overlay.position(0, 0);
  overlay.background(50);

  // --- 2D canvas for lighting diagram ---
  diagramCanvas = createGraphics(800, 800);
  diagramCanvas.background(30);

  // Create main control panel
  controlPanel = createDiv("");
  controlPanel.class("control-panel");
  controlPanel.position(20, 20);

  // Create minimize button
  minimizeButton = createButton("−");
  minimizeButton.parent(controlPanel);
  minimizeButton.class("minimize-btn");
  minimizeButton.mousePressed(toggleControlPanel);

  // Create control panel content container
  controlPanelContent = createDiv("");
  controlPanelContent.parent(controlPanel);

  // Create control panel content
  let title = createDiv("Plane Lighting Controls");
  title.parent(controlPanelContent);
  title.style("margin", "0 0 20px 0");
  title.style("font-size", "18px");
  title.style("font-weight", "600");
  title.style("color", "#ffffff");
  title.style("border-bottom", "2px solid rgba(255, 255, 255, 0.1)");
  title.style("padding-bottom", "8px");

  // File selection section
  setupFileSelection();

  // Section divider
  let divider1 = createDiv("");
  divider1.parent(controlPanelContent);
  divider1.class("section-divider");

  // Lighting controls
  setupLightingControls();

  // Section divider
  let divider2 = createDiv("");
  divider2.parent(controlPanelContent);
  divider2.class("section-divider");

  // Processing controls
  setupProcessingControls();

  // Section divider
  let divider3 = createDiv("");
  divider3.parent(controlPanelContent);
  divider3.class("section-divider");

  // Utility controls
  setupUtilityControls();
}

function setupFileSelection() {
  fileSection = createDiv("");
  fileSection.parent(controlPanelContent);
  fileSection.class("file-section");

  let fileSectionTitle = createDiv("Image Source");
  fileSectionTitle.parent(fileSection);
  fileSectionTitle.style("font-size", "14px");
  fileSectionTitle.style("font-weight", "500");
  fileSectionTitle.style("color", "rgba(255, 255, 255, 0.9)");
  fileSectionTitle.style("margin-bottom", "12px");

  // File mode selector buttons
  let modeSelector = createDiv("");
  modeSelector.parent(fileSection);
  modeSelector.class("file-mode-selector");

  // Create mode buttons
  fileModeButtons.selectURL = createButton("Select URL");
  fileModeButtons.selectURL.parent(modeSelector);
  fileModeButtons.selectURL.class("file-mode-btn active");
  fileModeButtons.selectURL.mousePressed(() => switchFileMode("selectURL"));

  fileModeButtons.browse = createButton("Browse...");
  fileModeButtons.browse.parent(modeSelector);
  fileModeButtons.browse.class("file-mode-btn");
  fileModeButtons.browse.mousePressed(() => switchFileMode("browse"));

  fileModeButtons.pasteURL = createButton("Paste URL");
  fileModeButtons.pasteURL.parent(modeSelector);
  fileModeButtons.pasteURL.class("file-mode-btn");
  fileModeButtons.pasteURL.mousePressed(() => switchFileMode("pasteURL"));

  // File input area
  let fileInputArea = createDiv("");
  fileInputArea.parent(fileSection);
  fileInputArea.class("file-input-area");
  fileInputArea.id("fileInputArea");

  // Create all input methods (initially hidden)
  setupSelectURL(fileInputArea);
  setupBrowseFile(fileInputArea);
  setupPasteURL(fileInputArea);

  // Show initial mode
  switchFileMode("selectURL");
}

function setupSelectURL(parent) {
  webImageDropdown = createSelect();
  webImageDropdown.parent(parent);
  webImageDropdown.id("selectURL");
  webImageDropdown.option("Choose from gallery...");
  webImages.forEach((url, index) => {
    let name = getImageName(url, index);
    webImageDropdown.option(name, url);
  });
  webImageDropdown.changed(handleWebImageSelection);
}

function setupBrowseFile(parent) {
  fileInput = createFileInput(handleFile);
  fileInput.parent(parent);
  fileInput.id("browse");
  fileInput.attribute("accept", "image/*");
  fileInput.style("display", "none");
}

function setupPasteURL(parent) {
  urlInput = createInput("", "text");
  urlInput.parent(parent);
  urlInput.id("pasteURL");
  urlInput.attribute("placeholder", "Paste image URL here...");
  urlInput.style("display", "none");

  let loadButton = createButton("Load Image");
  loadButton.parent(parent);
  loadButton.class("btn btn-secondary");
  loadButton.style("display", "none");
  loadButton.id("loadUrlButton");
  loadButton.style("margin-top", "8px");
  loadButton.mousePressed(handleURLInput);
}

function setupLightingControls() {
  let lightingTitle = createDiv("Lighting Mode");
  lightingTitle.parent(controlPanelContent);
  lightingTitle.style("font-size", "14px");
  lightingTitle.style("font-weight", "500");
  lightingTitle.style("color", "rgba(255, 255, 255, 0.9)");
  lightingTitle.style("margin-bottom", "12px");

  lightTypeDropdown = createSelect();
  lightTypeDropdown.parent(controlPanelContent);
  lightTypeDropdown.option("RGB Lights");
  lightTypeDropdown.option("White Light");
  lightTypeDropdown.option("Ambient Light");
  lightTypeDropdown.changed(() => {
    lightType = lightTypeDropdown.value();
    console.log("Light type changed to:", lightType);
  });
}

function setupProcessingControls() {
  let processingTitle = createDiv("Processing Settings");
  processingTitle.parent(controlPanelContent);
  processingTitle.style("font-size", "14px");
  processingTitle.style("font-weight", "500");
  processingTitle.style("color", "rgba(255, 255, 255, 0.9)");
  processingTitle.style("margin-bottom", "12px");

  // Pixel averaging slider with better styling
  let sliderGroup = createDiv("");
  sliderGroup.parent(controlPanelContent);
  sliderGroup.class("slider-group");

  let sliderLabel = createDiv("");
  sliderLabel.parent(sliderGroup);
  sliderLabel.class("slider-label");

  let labelText = createSpan("Pixel Averaging");
  labelText.parent(sliderLabel);

  avgValueDisplay = createSpan(pixelAvg);
  avgValueDisplay.parent(sliderLabel);
  avgValueDisplay.class("slider-value");

  avgSlider = createSlider(1, 16, pixelAvg, 1);
  avgSlider.parent(sliderGroup);
  avgSlider.input(() => {
    pixelAvg = avgSlider.value();
    console.log("Pixel averaging set to:", pixelAvg);
    avgValueDisplay.html(pixelAvg);
  });
}

function setupUtilityControls() {
  let utilityTitle = createDiv("Utilities");
  utilityTitle.parent(controlPanelContent);
  utilityTitle.style("font-size", "14px");
  utilityTitle.style("font-weight", "500");
  utilityTitle.style("color", "rgba(255, 255, 255, 0.9)");
  utilityTitle.style("margin-bottom", "12px");

  sphereButton = createButton("Toggle Test Sphere");
  sphereButton.parent(controlPanelContent);
  sphereButton.class("btn");
  sphereButton.mousePressed(() => (showSphere = !showSphere));
}

function switchFileMode(mode) {
  // Update button states
  Object.keys(fileModeButtons).forEach((key) => {
    if (key === mode) {
      fileModeButtons[key].addClass("active");
    } else {
      fileModeButtons[key].removeClass("active");
    }
  });

  // Hide all inputs
  select("#selectURL").style("display", "none");
  select("#browse").style("display", "none");
  select("#pasteURL").style("display", "none");
  select("#loadUrlButton").style("display", "none");

  // Show selected input
  currentFileMode = mode;
  switch (mode) {
    case "selectURL":
      select("#selectURL").style("display", "block");
      break;
    case "browse":
      select("#browse").style("display", "block");
      break;
    case "pasteURL":
      select("#pasteURL").style("display", "block");
      select("#loadUrlButton").style("display", "block");
      break;
  }
}

function getImageName(url, index) {
  if (url.includes("rose-red-blossom")) return "Red Rose";
  if (url.includes("pexels-photo-206893")) return "WinXP-esque";
  if (url.includes("RGB_combination")) return "RGB Light Demo";
  return `Image ${index + 1}`;
}

function handleURLInput() {
  let url = urlInput.value().trim();
  if (url) {
    select("#loadUrlButton").addClass("loading");
    loadImage(
      url,
      (loadedImg) => {
        img = loadedImg;
        img.loadPixels();
        imgPixels = img.pixels;
        select("#loadUrlButton").removeClass("loading");
        console.log("Image loaded from URL:", url);
      },
      () => {
        select("#loadUrlButton").removeClass("loading");
        console.error("Failed to load image from URL:", url);
        alert("Failed to load image. Please check the URL and try again.");
      }
    );
  }
}

function toggleControlPanel() {
  isControlPanelMinimized = !isControlPanelMinimized;

  if (isControlPanelMinimized) {
    // Minimize
    controlPanelContent.style("display", "none");
    controlPanel.style("width", "60px");
    controlPanel.style("height", "60px");
    minimizeButton.html("+");
    minimizeButton.style("font-size", "20px");
  } else {
    // Expand
    controlPanelContent.style("display", "block");
    controlPanel.style("width", "320px");
    controlPanel.style("height", "auto");
    minimizeButton.html("−");
    minimizeButton.style("font-size", "16px");
  }
}

function handleFile(file) {
  if (file.type === "image") {
    img = loadImage(file.data);
  } else {
    console.log("Not an image file!");
  }
  img.loadPixels(); // Load pixel array once
  imgPixels = img.pixels; // Store reference to pixels array
}

function handleWebImageSelection() {
  let selectedValue = webImageDropdown.value();
  if (selectedValue && selectedValue !== "Choose from gallery...") {
    // selectedValue is now the actual URL since we set it as the option value
    loadImage(
      selectedValue,
      (loadedImg) => {
        // success callback
        img = loadedImg;
        img.loadPixels();
        imgPixels = img.pixels;
        console.log("Image loaded from gallery:", selectedValue);
      },
      () => {
        // error callback
        console.error("Failed to load image from gallery:", selectedValue);
        alert("Failed to load the selected image. Please try another one.");
      }
    );
  }
}

function drawMainSketch() {
  background(0);
  orbitControl();

  if (lightType === "White Light") {
    // Use a single white light
    directionalLight(255, 255, 255, 0, 0, -1);
  } else if (lightType === "Ambient Light") {
    // Use ambient light
    directionalLight(255, 255, 255, redLight.x, redLight.y, redLight.z);
    directionalLight(255, 255, 255, greenLight.x, greenLight.y, greenLight.z);
    directionalLight(255, 255, 255, blueLight.x, blueLight.y, blueLight.z);
  } else {
    directionalLight(255, 0, 0, redLight.x, redLight.y, redLight.z);
    directionalLight(0, 255, 0, greenLight.x, greenLight.y, greenLight.z);
    directionalLight(0, 0, 255, blueLight.x, blueLight.y, blueLight.z);
  }

  if (showSphere) drawSphere();

  if (!img) return;

  overlay.background(25);
  overlay.image(img, 0, 0, overlay.width, overlay.height);

  // draw the overlay at top-left corner of main canvas
  push();
  resetMatrix(); // switch to 2D coordinates
  image(overlay, -overlay.width / 2, height / 2 - overlay.height + 20);
  pop();

  // --- now draw cubes/planes ---
  let cellW = img.width / cols;
  let cellH = img.height / rows;

  // Starting in top left
  translate((-cols * pixelSize) / 2, (-rows * pixelSize) / 2, 0);

  //Draw the array of planes
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let px = int(x * cellW);
      let py = int(y * cellH);

      // Get color at
      let c = img.get(px, py);

      let sumR = 0,
        sumG = 0,
        sumB = 0;
      let count = 0;

      for (let i = 0; i < pixelAvg; i++) {
        for (let j = 0; j < pixelAvg; j++) {
          let x = px + i;
          let y = py + j;
          let idx = 4 * (y * img.width + x); // index in pixels array

          sumR += imgPixels[idx]; // red
          sumG += imgPixels[idx + 1]; // green
          sumB += imgPixels[idx + 2]; // blue
          count++;
        }
      }

      let avgC = color(sumR / count, sumG / count, sumB / count);
      c = avgC;

      let r = red(c) / 255;
      let g = green(c) / 255;
      let b = blue(c) / 255;

      let norm = p5.Vector.mult(redLight, r)
        .add(p5.Vector.mult(greenLight, g))
        .add(p5.Vector.mult(blueLight, b));

      if (norm.mag() > 0) norm.normalize();
      else norm = createVector(0, 1, 0);

      push();
      translate(x * pixelSize, y * pixelSize, 0);

      specularMaterial(brightness(c) * 1.4);

      let axis = createVector(0, 0, 1).cross(norm);
      let angle = acos(createVector(0, 0, 1).dot(norm));
      if (axis.mag() > 0) {
        axis.normalize();
        rotate(angle, axis);
      }

      plane(pixelSize * overSizePanels, pixelSize * overSizePanels); //magic number to (lazily) prevent gaps when rotated
      pop();
    }
  }
}

// TODO: Plane angle function

function drawSphere() {
  push();
  translate(0, 0, 0);
  specularMaterial(255);
  sphere(100);
  pop();
}

function showMainSketchControls() {
  if (controlPanel) {
    controlPanel.style("display", "block");
  }
}

function hideMainSketchControls() {
  if (controlPanel) {
    controlPanel.style("display", "none");
  }
}
