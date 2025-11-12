// #region Parameters
let cols = 50;
let rows = 50;
let pixelSize = 10;
let colStrength = 0.8; // Angular difference between RGB lights, recommend 0.7;
let overSizePanels = 1.35; // to prevent gaps when rotated, range 1.0 to 1.5;
let pixelAvg = 4; // We are downsampling, 1 for nearest pixel, higher for averaging
let brightnessOffset = 900; // Offset for depth-based brightness positioning
// #endregion

// #region Variable Definitions
let img;
let imgPixels;
let showSphere = false;
let showReferenceImage = true; // Toggle for showing reference image overlay
let useOrthographic = true; // Toggle for orthographic vs perspective projection
let fileInput, sphereButton, orthographicCheckbox, referenceImageCheckbox;
let webImageDropdown;
let lightTypeDropdown;
let lightType = "RGB Lights"; // default light type
let lightMode = "Point"; // default light mode

let falloffConstant = 0;
let falloffLinear = 0.0001;
let falloffQuadratic = 0.000003;

let panelModeDropdown;
let panelMode = "Depth-Based Brightness"; // default panel mode
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
  "https://d1uuxsymbea74i.cloudfront.net/images/cms/1_6_passport_photo_young_female_9061ba5533.jpg",
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

// Advanced options variables
let advancedOptionsContainer;
let isAdvancedOptionsVisible = false;
let advancedToggleButton;
let advancedOptionsPanel; // New separate panel for advanced options
let advancedPanelMinimizeButton;
let gridResolutionSlider, gridResolutionValueDisplay;
let panelSizeSlider, panelSizeValueDisplay;
let colStrengthSlider, colStrengthValueDisplay;
let overSizeAmountSlider, overSizeAmountValueDisplay;
let brightnessOffsetSlider, brightnessOffsetValueDisplay;
// #endregion

function preloadMainSketch() {
  img = loadImage(
    "https://images.pexels.com/photos/53141/rose-red-blossom-bloom-53141.jpeg"
  );
}

function setupMainSketch() {
  // --- WEBGL canvas ---
  wgl = createCanvas(1000, 1000, WEBGL);
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
  overlay.background(50);

  // Initial setup for reference image display
  updateReferenceImageDisplay();

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
  // Lighting Mode Section
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

  // Light Mode Section
  let lightModeTitle = createDiv("Light Source Type");
  lightModeTitle.parent(controlPanelContent);
  lightModeTitle.style("font-size", "14px");
  lightModeTitle.style("font-weight", "500");
  lightModeTitle.style("color", "rgba(255, 255, 255, 0.9)");
  lightModeTitle.style("margin-bottom", "12px");
  let lightModeDropdown = createSelect();
  lightModeDropdown.parent(controlPanelContent);
  lightModeDropdown.option("Point");
  lightModeDropdown.option("Directional");
  lightModeDropdown.changed(() => {
    lightMode = lightModeDropdown.value();
    console.log("Light mode changed to:", lightMode);
  });

  // Panel Mode Section
  let panelTitle = createDiv("Panel Mode");
  panelTitle.parent(controlPanelContent);
  panelTitle.style("font-size", "14px");
  panelTitle.style("font-weight", "500");
  panelTitle.style("color", "rgba(255, 255, 255, 0.9)");
  panelTitle.style("margin-bottom", "12px");
  panelTitle.style("margin-top", "16px");

  panelModeDropdown = createSelect();
  panelModeDropdown.parent(controlPanelContent);
  panelModeDropdown.option("Depth-Based Brightness");
  panelModeDropdown.option("Color + Orientation");
  panelModeDropdown.changed(() => {
    panelMode = panelModeDropdown.value();
    console.log("Panel mode changed to:", panelMode);
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

  // Orthographic projection toggle checkbox
  let orthographicContainer = createDiv("");
  orthographicContainer.parent(controlPanelContent);
  orthographicContainer.style("margin-top", "12px");
  orthographicContainer.style("display", "flex");
  orthographicContainer.style("align-items", "center");

  orthographicCheckbox = createCheckbox("", useOrthographic);
  orthographicCheckbox.parent(orthographicContainer);
  orthographicCheckbox.style("margin-right", "8px");
  orthographicCheckbox.changed(() => {
    useOrthographic = orthographicCheckbox.checked();
    // Reset camera to initial position when toggling orthographic view
    camera(0, 0, height / 2.0 / tan((PI * 30.0) / 180.0), 0, 0, 0, 0, 1, 0);
    console.log(
      "Orthographic projection:",
      useOrthographic ? "enabled" : "disabled"
    );
  });

  let orthographicLabel = createSpan("Orthographic View");
  orthographicLabel.parent(orthographicContainer);
  orthographicLabel.style("color", "rgba(255, 255, 255, 0.9)");
  orthographicLabel.style("font-size", "14px");

  // Reference image toggle checkbox
  let referenceImageContainer = createDiv("");
  referenceImageContainer.parent(controlPanelContent);
  referenceImageContainer.style("margin-top", "12px");
  referenceImageContainer.style("display", "flex");
  referenceImageContainer.style("align-items", "center");

  referenceImageCheckbox = createCheckbox("", showReferenceImage);
  referenceImageCheckbox.parent(referenceImageContainer);
  referenceImageCheckbox.style("margin-right", "8px");
  referenceImageCheckbox.changed(() => {
    showReferenceImage = referenceImageCheckbox.checked();
    updateReferenceImageDisplay();
    console.log("Reference image:", showReferenceImage ? "visible" : "hidden");
  });

  let referenceImageLabel = createSpan("Show Reference Image");
  referenceImageLabel.parent(referenceImageContainer);
  referenceImageLabel.style("color", "rgba(255, 255, 255, 0.9)");
  referenceImageLabel.style("font-size", "14px");

  // Advanced options toggle button
  advancedToggleButton = createButton("Show Advanced Options");
  advancedToggleButton.parent(controlPanelContent);
  advancedToggleButton.class("btn btn-secondary");
  advancedToggleButton.style("margin-top", "12px");
  advancedToggleButton.mousePressed(toggleAdvancedOptions);

  // Advanced options container (initially hidden)
  setupAdvancedOptions();
}

function updateReferenceImageDisplay() {
  if (showReferenceImage && img) {
    // Position overlay in top-right corner of the screen
    overlay.position(width - overlay.width - 20, 20);
    overlay.background(25);
    overlay.image(img, 0, 0, overlay.width, overlay.height);
    overlay.show();
  } else {
    overlay.hide();
  }
}

function setupAdvancedOptions() {
  // Create separate panel for advanced options
  advancedOptionsPanel = createDiv("");
  advancedOptionsPanel.class("control-panel");
  advancedOptionsPanel.position(360, 20); // Position to the right of main panel
  advancedOptionsPanel.style("display", "none"); // Initially hidden

  // Create minimize button for advanced panel
  advancedPanelMinimizeButton = createButton("−");
  advancedPanelMinimizeButton.parent(advancedOptionsPanel);
  advancedPanelMinimizeButton.class("minimize-btn");
  advancedPanelMinimizeButton.mousePressed(toggleAdvancedOptions);

  // Create advanced options content container
  advancedOptionsContainer = createDiv("");
  advancedOptionsContainer.parent(advancedOptionsPanel);

  let advancedTitle = createDiv("Advanced Options");
  advancedTitle.parent(advancedOptionsContainer);
  advancedTitle.style("margin", "0 0 20px 0");
  advancedTitle.style("font-size", "18px");
  advancedTitle.style("font-weight", "600");
  advancedTitle.style("color", "#ffffff");
  advancedTitle.style("border-bottom", "2px solid rgba(255, 255, 255, 0.1)");
  advancedTitle.style("padding-bottom", "8px");
  advancedTitle.style("font-size", "14px");
  advancedTitle.style("font-weight", "500");
  advancedTitle.style("color", "rgba(255, 255, 255, 0.9)");
  advancedTitle.style("margin-bottom", "16px");

  // Grid Resolution (combined cols/rows)
  let gridSliderGroup = createDiv("");
  gridSliderGroup.parent(advancedOptionsContainer);
  gridSliderGroup.class("slider-group");

  let gridSliderLabel = createDiv("");
  gridSliderLabel.parent(gridSliderGroup);
  gridSliderLabel.class("slider-label");

  let gridLabelText = createSpan("Grid Resolution");
  gridLabelText.parent(gridSliderLabel);

  gridResolutionValueDisplay = createSpan(cols + "×" + rows);
  gridResolutionValueDisplay.parent(gridSliderLabel);
  gridResolutionValueDisplay.class("slider-value");

  gridResolutionSlider = createSlider(10, 100, cols, 5);
  gridResolutionSlider.parent(gridSliderGroup);
  gridResolutionSlider.input(() => {
    cols = rows = gridResolutionSlider.value(); // Keep grid square
    gridResolutionValueDisplay.html(cols + "×" + rows);
    console.log("Grid resolution set to:", cols + "x" + rows);
  });

  // Panel Size (pixelSize)
  let panelSliderGroup = createDiv("");
  panelSliderGroup.parent(advancedOptionsContainer);
  panelSliderGroup.class("slider-group");

  let panelSliderLabel = createDiv("");
  panelSliderLabel.parent(panelSliderGroup);
  panelSliderLabel.class("slider-label");

  let panelLabelText = createSpan("Panel Size");
  panelLabelText.parent(panelSliderLabel);

  panelSizeValueDisplay = createSpan(pixelSize);
  panelSizeValueDisplay.parent(panelSliderLabel);
  panelSizeValueDisplay.class("slider-value");

  panelSizeSlider = createSlider(2, 20, pixelSize, 1);
  panelSizeSlider.parent(panelSliderGroup);
  panelSizeSlider.input(() => {
    pixelSize = panelSizeSlider.value();
    panelSizeValueDisplay.html(pixelSize);
    console.log("Panel size set to:", pixelSize);
  });

  // Color Strength (colStrength)
  let colStrengthSliderGroup = createDiv("");
  colStrengthSliderGroup.parent(advancedOptionsContainer);
  colStrengthSliderGroup.class("slider-group");

  let colStrengthSliderLabel = createDiv("");
  colStrengthSliderLabel.parent(colStrengthSliderGroup);
  colStrengthSliderLabel.class("slider-label");

  let colStrengthLabelText = createSpan("Color Separation");
  colStrengthLabelText.parent(colStrengthSliderLabel);

  colStrengthValueDisplay = createSpan(colStrength.toFixed(2));
  colStrengthValueDisplay.parent(colStrengthSliderLabel);
  colStrengthValueDisplay.class("slider-value");

  colStrengthSlider = createSlider(0.0, 1.0, colStrength, 0.05);
  colStrengthSlider.parent(colStrengthSliderGroup);
  colStrengthSlider.input(() => {
    colStrength = colStrengthSlider.value();
    colStrengthValueDisplay.html(colStrength.toFixed(2));
    console.log("Color separation set to:", colStrength);
    // Update light directions when colStrength changes
    redLight = createVector(-colStrength, -colStrength, -1).normalize();
    greenLight = createVector(colStrength, -colStrength, -1).normalize();
    blueLight = createVector(-0.0, colStrength, -1).normalize();
  });

  // Oversize Amount (overSizePanels)
  let oversizeSliderGroup = createDiv("");
  oversizeSliderGroup.parent(advancedOptionsContainer);
  oversizeSliderGroup.class("slider-group");

  let oversizeSliderLabel = createDiv("");
  oversizeSliderLabel.parent(oversizeSliderGroup);
  oversizeSliderLabel.class("slider-label");

  let oversizeLabelText = createSpan("Panel Overlap");
  oversizeLabelText.parent(oversizeSliderLabel);

  overSizeAmountValueDisplay = createSpan(overSizePanels.toFixed(2));
  overSizeAmountValueDisplay.parent(oversizeSliderLabel);
  overSizeAmountValueDisplay.class("slider-value");

  overSizeAmountSlider = createSlider(1.0, 1.35, overSizePanels, 0.05);
  overSizeAmountSlider.parent(oversizeSliderGroup);
  overSizeAmountSlider.input(() => {
    overSizePanels = overSizeAmountSlider.value();
    overSizeAmountValueDisplay.html(overSizePanels.toFixed(2));
    console.log("Panel overlap set to:", overSizePanels);
  });

  // Brightness Offset (brightnessOffset)
  let brightnessOffsetSliderGroup = createDiv("");
  brightnessOffsetSliderGroup.parent(advancedOptionsContainer);
  brightnessOffsetSliderGroup.class("slider-group");

  let brightnessOffsetSliderLabel = createDiv("");
  brightnessOffsetSliderLabel.parent(brightnessOffsetSliderGroup);
  brightnessOffsetSliderLabel.class("slider-label");

  let brightnessOffsetLabelText = createSpan("Brightness Offset");
  brightnessOffsetLabelText.parent(brightnessOffsetSliderLabel);

  brightnessOffsetValueDisplay = createSpan(brightnessOffset);
  brightnessOffsetValueDisplay.parent(brightnessOffsetSliderLabel);
  brightnessOffsetValueDisplay.class("slider-value");

  brightnessOffsetSlider = createSlider(0, 2000, brightnessOffset, 50);
  brightnessOffsetSlider.parent(brightnessOffsetSliderGroup);
  brightnessOffsetSlider.input(() => {
    brightnessOffset = brightnessOffsetSlider.value();
    brightnessOffsetValueDisplay.html(brightnessOffset);
    console.log("Brightness offset set to:", brightnessOffset);
  });
}

function toggleAdvancedOptions() {
  isAdvancedOptionsVisible = !isAdvancedOptionsVisible;

  if (isAdvancedOptionsVisible) {
    advancedOptionsPanel.style("display", "block");
    advancedToggleButton.html("Hide Advanced Options");
  } else {
    advancedOptionsPanel.style("display", "none");
    advancedToggleButton.html("Show Advanced Options");
  }
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
  if (url.includes("passport_photo_young_female")) return "Portrait";
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
        updateReferenceImageDisplay(); // Update reference image display
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
  updateReferenceImageDisplay(); // Update reference image display
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
        updateReferenceImageDisplay(); // Update reference image display
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

function isMouseOverUI() {
  // Check if mouse is over any UI panel
  let controlPanelRect = controlPanel.elt.getBoundingClientRect();
  let advancedPanelRect = null;

  if (advancedOptionsPanel && isAdvancedOptionsVisible) {
    advancedPanelRect = advancedOptionsPanel.elt.getBoundingClientRect();
  }

  // Check if mouse is within control panel bounds
  if (
    mouseX >= controlPanelRect.left &&
    mouseX <= controlPanelRect.right &&
    mouseY >= controlPanelRect.top &&
    mouseY <= controlPanelRect.bottom
  ) {
    return true;
  }

  // Check if mouse is within advanced panel bounds (if visible)
  if (
    advancedPanelRect &&
    mouseX >= advancedPanelRect.left &&
    mouseX <= advancedPanelRect.right &&
    mouseY >= advancedPanelRect.top &&
    mouseY <= advancedPanelRect.bottom
  ) {
    return true;
  }

  return false;
}

function drawMainSketch() {
  background(0);

  // Only enable orbit control if mouse is not over UI elements
  if (!isMouseOverUI()) {
    orbitControl();
  }

  // Set camera projection
  if (useOrthographic) {
    // Set orthographic projection with extended far clipping plane
    // Parameters: left, right, bottom, top, near, far
    let scale = 400; // Adjust this to control zoom level in orthographic mode
    ortho(-scale, scale, -scale, scale, -5000, 50000);
  } else {
    // Set perspective projection with extended far clipping plane
    // Parameters: fovy, aspect, near, far
    perspective(PI / 5, width / height, 1, 100000);
  }

  if (lightMode === "Point") {
    if (lightType === "White Light") {
      // Use a single white point light
      pointLight(255, 255, 255, 0, 0, 500);
    } else if (lightType === "Ambient Light") {
      let lightDistance = 900; // Distance of point lights from origin
      let redLightPos = p5.Vector.mult(redLight, lightDistance);
      redLightPos = p5.Vector.mult(redLightPos, -1);
      let greenLightPos = p5.Vector.mult(greenLight, lightDistance);
      greenLightPos = p5.Vector.mult(greenLightPos, -1);
      let blueLightPos = p5.Vector.mult(blueLight, lightDistance);
      blueLightPos = p5.Vector.mult(blueLightPos, -1);

      pointLight(255, 255, 255, redLightPos.x, redLightPos.y, redLightPos.z);
      pointLight(
        255,
        255,
        255,
        greenLightPos.x,
        greenLightPos.y,
        greenLightPos.z
      );
      pointLight(255, 255, 255, blueLightPos.x, blueLightPos.y, blueLightPos.z);
    } else {
      //RGB Point lights
      let lightDistance = 1000; // Distance of point lights from origin
      let redLightPos = p5.Vector.mult(redLight, lightDistance);
      redLightPos = p5.Vector.mult(redLightPos, -1.0);
      let greenLightPos = p5.Vector.mult(greenLight, lightDistance);
      greenLightPos = p5.Vector.mult(greenLightPos, -1);
      let blueLightPos = p5.Vector.mult(blueLight, lightDistance);
      blueLightPos = p5.Vector.mult(blueLightPos, -0.8);

      // Draw light position indicators
      // push();
      // translate(redLightPos.x, redLightPos.y, redLightPos.z);
      // fill(255, 0, 0);
      // noStroke();
      // sphere(5);
      // pop();
      // push();
      // translate(greenLightPos.x, greenLightPos.y, greenLightPos.z);
      // fill(0, 255, 0);
      // noStroke();
      // sphere(5);
      // pop();
      // push();
      // translate(blueLightPos.x, blueLightPos.y, blueLightPos.z);
      // fill(0, 0, 255);
      // noStroke();
      // sphere(5);
      // pop();

      pointLight(255, 0, 0, redLightPos.x, redLightPos.y, redLightPos.z);
      pointLight(0, 255, 0, greenLightPos.x, greenLightPos.y, greenLightPos.z);
      pointLight(0, 0, 255, blueLightPos.x, blueLightPos.y, blueLightPos.z);

      // Enhance light falloff for better distance-based dimming
      // Parameters: constant, linear, quadratic (higher quadratic = faster falloff)
      useFalloff = true;
      lightFalloff(0, 0.00001, 0.0000015);
    }
  }
  if (lightMode === "Directional") {
    if (lightType === "White Light") {
      // Use a single white light
      directionalLight(255, 255, 255, 0, 0, -1);
    } else if (lightType === "Ambient Light") {
      // Use ambient light
      directionalLight(255, 255, 255, redLight.x, redLight.y, redLight.z);
      directionalLight(255, 255, 255, greenLight.x, greenLight.y, greenLight.z);
      directionalLight(255, 255, 255, blueLight.x, blueLight.y, blueLight.z);
    } else {
      // directional rgb
      directionalLight(255, 0, 0, redLight.x, redLight.y, redLight.z);
      directionalLight(0, 255, 0, greenLight.x, greenLight.y, greenLight.z);
      directionalLight(0, 0, 255, blueLight.x, blueLight.y, blueLight.z);
    }
  }

  if (showSphere) drawSphere();

  if (!img) return;

  // Update reference image display (this updates the 2D overlay canvas position and content)
  if (showReferenceImage) {
    updateReferenceImageDisplay();
  }

  // Draw the array of planes
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

      push();
      translate(x * pixelSize, y * pixelSize, 0);

      if (panelMode === "Depth-Based Brightness") {
        // Mode 2: White panels, brightness controlled by distance using inverse square law
        let pixelBrightness = brightness(c) / 255; // 0-1 range
        // clamp brightness
        pixelBrightness = constrain(pixelBrightness, 0, 1);

        let distance =
          -calculateDepthFromBrightness(pixelBrightness) + brightnessOffset;

        // Move panel back based on calculated distance
        translate(0, 0, distance);

        // Use pure white material
        specularMaterial(255, 255, 255);
        shininess(1);
      } else {
        specularMaterial(brightness(c) * 1.4);
      }
      // Mode 1: Color + Orientation (original implementation)
      let r = constrain(red(c) / 255, 0, 1);
      let g = constrain(green(c) / 255, 0, 1);
      let b = constrain(blue(c) / 255, 0, 1);

      let norm = p5.Vector.mult(redLight, r)
        .add(p5.Vector.mult(greenLight, g))
        .add(p5.Vector.mult(blueLight, b));

      if (norm.mag() > 0) norm.normalize();
      else norm = createVector(0, 1, 0);

      let axis = createVector(0, 0, 1).cross(norm);
      let angle = acos(createVector(0, 0, 1).dot(norm));
      if (axis.mag() > 0) {
        axis.normalize();
        rotate(angle, axis);
      }

      plane(pixelSize * overSizePanels, pixelSize * overSizePanels);

      pop();
    }
  }
}

function calculateDepthFromBrightness(brightnessValue) {
  const constant = falloffConstant;
  const linear = falloffLinear;
  const quadratic = falloffQuadratic;

  const inv = 1 / brightnessValue;

  // Handle purely linear attenuation (no quadratic term)
  if (Math.abs(quadratic) < 1e-8) {
    const d = (inv - constant) / linear;
    return d >= 0 ? d : null;
  }

  // Quadratic case: solve ax^2 + bx + c = 0
  const a = quadratic;
  const b = linear;
  const c = constant - inv;

  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) {
    // No real solution — target brightness cannot be achieved
    return null;
  }

  const sqrtDisc = Math.sqrt(discriminant);

  // Numerically stable quadratic formula variant
  const q = -0.5 * (b + Math.sign(b) * sqrtDisc);
  const d1 = q / a;
  const d2 = c / q;

  // Pick the smallest non-negative distance
  const candidates = [d1, d2].filter((d) => d >= 0 && Number.isFinite(d));
  if (candidates.length === 0) return null;

  return Math.min(...candidates);
}

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
  if (advancedOptionsPanel && isAdvancedOptionsVisible) {
    advancedOptionsPanel.style("display", "block");
  }
}

function hideMainSketchControls() {
  if (controlPanel) {
    controlPanel.style("display", "none");
  }
  if (advancedOptionsPanel) {
    advancedOptionsPanel.style("display", "none");
  }
}
