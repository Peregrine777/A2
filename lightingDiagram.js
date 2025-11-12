// Variables for lighting diagram
let planeAngle = 0;
let diagramLightDirection;
let diagramLightDirection2;
let twoLightsMode = false;
let twoLightsButton;

// Slide system variables
let currentSlide = 1; // Start with Light Color Recreation slide (the original diagram)
let totalSlides = 3; // 0: Pixel Averaging, 1: Light Color Recreation, 2: Z-Depth Problems
let slideButtons = [];
let slideNavContainer;

// Slide 0 variables (Pixel Averaging)
let zoomLevel = 1;
let selectedCellX = 30;
let selectedCellY = 28;
let showGrid = true;
let samplingModeSlider;
let samplingModeValueDisplay;
let samplingModeContainer;
let currentSamplingMode = 1; // 1 = single pixel, higher = expanding square

function setupLightingDiagram() {
  // Define light direction for diagram (pointing from light source toward the plane)
  diagramLightDirection = createVector(1, -1, 0).normalize(); // Top-right light (red)
  diagramLightDirection2 = createVector(-1, -1, 0).normalize(); // Top-left light (blue)

  // Button to toggle two lights mode with styling
  twoLightsButton = createButton("Add Second Light");
  twoLightsButton.class("btn btn-secondary");
  twoLightsButton.position(20, 500);
  twoLightsButton.style("width", "180px"); // Set fixed width to prevent overflow
  twoLightsButton.style("display", "none"); // Initially hidden
  twoLightsButton.hide(); // Use p5.js hide() method for more reliable hiding
  twoLightsButton.mousePressed(toggleTwoLights);

  // Setup slide navigation
  setupSlideNavigation();

  // Setup pixel averaging controls (initially hidden)
  setupPixelAveragingControls();
}

function setupSlideNavigation() {
  // Create container for slide buttons
  slideNavContainer = createDiv("");
  slideNavContainer.position(100, 0); // Position on canvas instead of full width
  slideNavContainer.style("width", "auto");
  slideNavContainer.style("display", "none"); // Initially hidden
  slideNavContainer.style("z-index", "1000");
  slideNavContainer.style("display-flex", "flex");
  slideNavContainer.style("flex-direction", "row");
  slideNavContainer.style("align-items", "center");
  slideNavContainer.style("gap", "10px");

  // Create slide buttons
  let slideNames = [
    "Pixel Averaging",
    "Light Color Recreation",
    "Z-Depth Problems",
  ];

  for (let i = 0; i < totalSlides; i++) {
    let btn = createButton(slideNames[i]);
    btn.parent(slideNavContainer);
    btn.class("btn");
    btn.style("margin", "0 5px");
    btn.style("display", "inline-block");
    btn.style("width", "200px"); // Fixed width to prevent stretching
    btn.style("font-size", "12px");
    btn.style("white-space", "nowrap"); // Prevent text wrapping

    // Closure to capture the correct slide index
    (function (slideIndex) {
      btn.mousePressed(() => switchSlide(slideIndex));
    })(i);

    slideButtons.push(btn);
  }

  // Set initial active slide
  updateSlideButtons();
}

function setupPixelAveragingControls() {
  // Create container for pixel averaging slider
  samplingModeContainer = createDiv("");
  samplingModeContainer.position(250, 450);
  samplingModeContainer.style("display", "none"); // Initially hidden
  samplingModeContainer.style("width", "300px");
  samplingModeContainer.style("padding", "12px");
  samplingModeContainer.style("background", "rgba(40, 40, 50, 0.95)");
  samplingModeContainer.style("border-radius", "8px");
  samplingModeContainer.style("border", "1px solid rgba(255, 255, 255, 0.2)");

  let sliderLabel = createDiv("");
  sliderLabel.parent(samplingModeContainer);
  sliderLabel.style("display", "flex");
  sliderLabel.style("justify-content", "space-between");
  sliderLabel.style("align-items", "center");
  sliderLabel.style("color", "rgba(255, 255, 255, 0.9)");
  sliderLabel.style("font-size", "14px");
  sliderLabel.style("font-weight", "500");
  sliderLabel.style("margin-bottom", "8px");

  let labelText = createSpan("Sampling Pattern");
  labelText.parent(sliderLabel);

  samplingModeValueDisplay = createSpan(
    getSamplingModeText(currentSamplingMode)
  );
  samplingModeValueDisplay.parent(sliderLabel);
  samplingModeValueDisplay.style("background", "rgba(102, 126, 234, 0.2)");
  samplingModeValueDisplay.style("border-radius", "4px");
  samplingModeValueDisplay.style("color", "#667eea");
  samplingModeValueDisplay.style("font-weight", "600");
  samplingModeValueDisplay.style("padding", "2px 8px");
  samplingModeValueDisplay.style("min-width", "80px");
  samplingModeValueDisplay.style("text-align", "center");

  samplingModeSlider = createSlider(1, 16, currentSamplingMode, 1);
  samplingModeSlider.parent(samplingModeContainer);
  samplingModeSlider.style("width", "100%");
  samplingModeSlider.input(() => {
    currentSamplingMode = samplingModeSlider.value();
    samplingModeValueDisplay.html(getSamplingModeText(currentSamplingMode));
    console.log("Sampling mode set to:", currentSamplingMode);
  });
}

function getSamplingModeText(mode) {
  if (mode === 1) return "1×1 pixel";
  return `${mode}×${mode} pixels`;
}

function switchSlide(slideIndex) {
  console.log("Switching to slide:", slideIndex);
  currentSlide = slideIndex;
  updateSlideButtons();
}

function updateSlideButtons() {
  console.log("Current slide:", currentSlide);
  // Update button styles to show active slide
  for (let i = 0; i < slideButtons.length; i++) {
    if (i === currentSlide) {
      slideButtons[i].style(
        "background",
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      );
    } else {
      slideButtons[i].style("background", "rgba(255, 255, 255, 0.1)");
    }
  }

  // Show/hide slide-specific controls
  if (currentSlide === 1) {
    // Light Color Recreation slide
    twoLightsButton.style("display", "block");
    if (samplingModeContainer) {
      samplingModeContainer.style("display", "none");
    }
  } else if (currentSlide === 0) {
    // Pixel Averaging slide
    twoLightsButton.style("display", "none");
    if (samplingModeContainer) {
      samplingModeContainer.style("display", "block");
    }
  } else {
    twoLightsButton.style("display", "none");
    if (samplingModeContainer) {
      samplingModeContainer.style("display", "none");
    }
  }
}

function toggleTwoLights() {
  twoLightsMode = !twoLightsMode;
  if (twoLightsMode) {
    twoLightsButton.html("Single Light Mode");
  } else {
    twoLightsButton.html("Add Second Light");
  }
}

function drawLightingDiagram() {
  // Clear the main canvas
  background(30);

  // Draw the appropriate slide
  switch (currentSlide) {
    case 0:
      drawPixelAveragingSlide();
      break;
    case 1:
      drawLightColorRecreationSlide();
      break;
    case 2:
      drawZDepthProblemsSlide();
      break;
  }
}

function drawPixelAveragingSlide() {
  // Draw on the 2D canvas
  diagramCanvas.background(40);

  let centerX = diagramCanvas.width / 2;
  let centerY = diagramCanvas.height / 2;

  // Draw title
  diagramCanvas.fill(255);
  diagramCanvas.textAlign(CENTER);
  diagramCanvas.textSize(24);
  diagramCanvas.text("Pixel Averaging & Grid Sampling", centerX, 50);

  // Use the main sketch image if available
  if (img) {
    let displaySize = 300;
    let imgX = centerX - displaySize / 2;
    let imgY = 100;

    // Draw the source image
    diagramCanvas.image(img, imgX, imgY, displaySize, displaySize);

    // Draw grid overlay
    if (showGrid) {
      let cellW = displaySize / cols;
      let cellH = displaySize / rows;

      diagramCanvas.stroke(255, 255, 0, 150);
      diagramCanvas.strokeWeight(1);
      diagramCanvas.noFill();

      // Draw grid lines
      for (let x = 0; x <= cols; x++) {
        diagramCanvas.line(
          imgX + x * cellW,
          imgY,
          imgX + x * cellW,
          imgY + displaySize
        );
      }
      for (let y = 0; y <= rows; y++) {
        diagramCanvas.line(
          imgX,
          imgY + y * cellH,
          imgX + displaySize,
          imgY + y * cellH
        );
      }

      // Highlight selected cell
      let selectedX = imgX + selectedCellX * cellW;
      let selectedY = imgY + selectedCellY * cellH;
      diagramCanvas.stroke(255, 100, 100);
      diagramCanvas.strokeWeight(3);
      diagramCanvas.rect(selectedX, selectedY, cellW, cellH);

      // Show zoomed cell
      let zoomSize = 150;
      let zoomX = centerX + 200;
      let zoomY = 150;

      // Calculate the actual pixel region
      let actualCellW = img.width / cols;
      let actualCellH = img.height / rows;
      let srcX = selectedCellX * actualCellW;
      let srcY = selectedCellY * actualCellH;

      // Draw zoomed section
      diagramCanvas.fill(60);
      diagramCanvas.stroke(255);
      diagramCanvas.strokeWeight(2);
      diagramCanvas.rect(zoomX - 5, zoomY - 5, zoomSize + 10, zoomSize + 10);

      // Copy and scale the selected region
      let zoomedImg = img.get(srcX, srcY, actualCellW, actualCellH);
      diagramCanvas.image(zoomedImg, zoomX, zoomY, zoomSize, zoomSize);

      // Calculate and display average color using current sampling mode
      let avgR = 0,
        avgG = 0,
        avgB = 0;
      let pixelCount = 0;

      // Sample pixels based on current sampling mode
      for (let i = 0; i < currentSamplingMode; i++) {
        for (let j = 0; j < currentSamplingMode; j++) {
          let sampleX = constrain(srcX + i, 0, img.width - 1);
          let sampleY = constrain(srcY + j, 0, img.height - 1);
          let sampleColor = img.get(sampleX, sampleY);

          avgR += red(sampleColor);
          avgG += green(sampleColor);
          avgB += blue(sampleColor);
          pixelCount++;
        }
      }

      avgR = Math.round(avgR / pixelCount);
      avgG = Math.round(avgG / pixelCount);
      avgB = Math.round(avgB / pixelCount);

      // Show average color swatch
      diagramCanvas.fill(avgR, avgG, avgB);
      diagramCanvas.noStroke();
      diagramCanvas.rect(zoomX, zoomY + zoomSize + 20, zoomSize, 30);

      // Draw sampling pattern visualization on zoomed image
      diagramCanvas.stroke(255, 255, 0);
      diagramCanvas.strokeWeight(2);
      diagramCanvas.noFill();
      let pixelScale = zoomSize / actualCellW;
      for (let i = 0; i < currentSamplingMode; i++) {
        for (let j = 0; j < currentSamplingMode; j++) {
          let rectX = zoomX + i * pixelScale;
          let rectY = zoomY + j * pixelScale;
          let rectW = pixelScale;
          let rectH = pixelScale;
          diagramCanvas.rect(rectX, rectY, rectW, rectH);
        }
      }

      // Labels and info
      diagramCanvas.fill(255);
      diagramCanvas.textAlign(LEFT);
      diagramCanvas.textSize(14);
      diagramCanvas.text("Selected Cell (Zoomed)", zoomX, zoomY - 10);
      diagramCanvas.text(
        `Average RGB: (${avgR}, ${avgG}, ${avgB})`,
        zoomX,
        zoomY + zoomSize + 70
      );
      diagramCanvas.text(
        `Sampling: ${getSamplingModeText(currentSamplingMode)}`,
        zoomX,
        zoomY + zoomSize + 90
      );

      // Show processed image result
      drawProcessedImagePreview(centerX, centerY);

      // Info panel
      let panelX = 50;
      let panelY = diagramCanvas.height - 180;

      diagramCanvas.fill(50, 50, 50, 200);
      diagramCanvas.stroke(255);
      diagramCanvas.strokeWeight(1);
      diagramCanvas.rect(panelX - 10, panelY - 10, 500, 160);

      diagramCanvas.fill(255);
      diagramCanvas.noStroke();
      diagramCanvas.textAlign(LEFT);
      diagramCanvas.textSize(14);

      diagramCanvas.text(`Grid Size: ${cols} x ${rows}`, panelX, panelY + 15);
      diagramCanvas.text(
        `Selected Cell: (${selectedCellX}, ${selectedCellY})`,
        panelX,
        panelY + 35
      );
      diagramCanvas.text(
        `Sampling Pattern: ${getSamplingModeText(currentSamplingMode)}`,
        panelX,
        panelY + 55
      );
      diagramCanvas.text(
        "Each grid cell averages multiple pixels to reduce noise",
        panelX,
        panelY + 75
      );
      diagramCanvas.text(
        "and create smoother color transitions in the final result.",
        panelX,
        panelY + 95
      );
      diagramCanvas.text(
        "Use the slider to see how sampling affects color accuracy.",
        panelX,
        panelY + 115
      );
      diagramCanvas.text(
        "Higher sampling values increase quality but require more computation.",
        panelX,
        panelY + 135
      );
    }
  }

  // Display the 2D canvas on the main canvas
  resetMatrix();
  image(diagramCanvas, -width / 2, -height / 2);
}

function drawProcessedImagePreview(centerX, centerY) {
  // Draw a small preview of what the processed image looks like
  let previewSize = 150;
  let previewX = centerX - 350;
  let previewY = 450;

  // Background for preview
  diagramCanvas.fill(60);
  diagramCanvas.stroke(255);
  diagramCanvas.strokeWeight(2);
  diagramCanvas.rect(previewX - 5, previewY - 5, previewSize, previewSize);

  // Draw processed image preview
  let cellW = img.width / cols;
  let cellH = img.height / rows;
  let previewCellW = previewSize / cols;
  let previewCellH = previewSize / rows;

  diagramCanvas.noStroke();

  // Sample a smaller area for performance
  let startX = Math.max(0, selectedCellX - 15);
  let endX = Math.min(cols, selectedCellX + 15);
  let startY = Math.max(0, selectedCellY - 15);
  let endY = Math.min(rows, selectedCellY + 15);

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      // Calculate source pixel coordinates
      let srcX = Math.floor(x * cellW);
      let srcY = Math.floor(y * cellH);

      // Calculate average color using current sampling mode
      let avgR = 0,
        avgG = 0,
        avgB = 0;
      let pixelCount = 0;

      for (let i = 0; i < currentSamplingMode; i++) {
        for (let j = 0; j < currentSamplingMode; j++) {
          let sampleX = constrain(srcX + i, 0, img.width - 1);
          let sampleY = constrain(srcY + j, 0, img.height - 1);
          let sampleColor = img.get(sampleX, sampleY);

          avgR += red(sampleColor);
          avgG += green(sampleColor);
          avgB += blue(sampleColor);
          pixelCount++;
        }
      }

      avgR = avgR / pixelCount;
      avgG = avgG / pixelCount;
      avgB = avgB / pixelCount;

      // Draw the cell
      diagramCanvas.fill(avgR, avgG, avgB);
      let drawX =
        previewX + (x - startX) * previewCellW * (30 / (endX - startX));
      let drawY =
        previewY + (y - startY) * previewCellH * (30 / (endY - startY));
      let drawW = previewCellW * (30 / (endX - startX));
      let drawH = previewCellH * (30 / (endY - startY));
      diagramCanvas.rect(drawX, drawY, drawW, drawH);
    }
  }

  // Label
  diagramCanvas.fill(255);
  diagramCanvas.textAlign(LEFT);
  diagramCanvas.textSize(12);
  diagramCanvas.text("Processed Result", previewX, previewY - 10);
}

function drawLightColorRecreationSlide() {
  // Clear the main canvas
  background(30);

  // Draw on the 2D canvas
  diagramCanvas.background(30);

  // Set up 2D coordinate system
  let centerX = diagramCanvas.width / 2;
  let centerY = diagramCanvas.height / 2;

  // Update plane angle for animation (sweep back and forth 90 degrees)
  planeAngle = (sin(frameCount * 0.02) * PI) / 4; // Oscillates between -45° and +45°

  // Calculate plane normal vector (rotated)
  let normal = createVector(sin(planeAngle), -cos(planeAngle), 0).normalize();

  // Calculate lighting contributions
  let brightness1 = max(0, normal.dot(diagramLightDirection));
  let brightness2 = twoLightsMode
    ? max(0, normal.dot(diagramLightDirection2))
    : 0;

  // Calculate final color (red from right light, blue from left light)
  let finalRed = brightness1 * 255;
  let finalGreen = 0;
  let finalBlue = brightness2 * 255;

  // Draw title
  diagramCanvas.fill(255);
  diagramCanvas.textAlign(CENTER);
  diagramCanvas.textSize(24);
  diagramCanvas.text("Plane Lighting Diagram", centerX, 100);

  // Draw light source (red - top right)
  diagramCanvas.fill(255, 100, 100);
  diagramCanvas.noStroke();
  diagramCanvas.circle(centerX + 200, centerY - 200, 30);

  // Draw second light source if enabled (blue - top left)
  if (twoLightsMode) {
    diagramCanvas.fill(100, 100, 255);
    diagramCanvas.circle(centerX - 200, centerY - 200, 30);
  }

  // Draw light ray lines from red light
  diagramCanvas.stroke(255, 100, 100, 150);
  diagramCanvas.strokeWeight(2);
  for (let i = -2; i <= 2; i++) {
    diagramCanvas.line(
      centerX + 200 + i * 15,
      centerY - 200,
      centerX + i * 20,
      centerY
    );
  }

  // Draw light ray lines from blue light if enabled
  if (twoLightsMode) {
    diagramCanvas.stroke(100, 100, 255, 150);
    for (let i = -2; i <= 2; i++) {
      diagramCanvas.line(
        centerX - 200 + i * 15,
        centerY - 200,
        centerX + i * 20,
        centerY
      );
    }
  }

  // Draw the plane (rectangle) with colored lighting
  diagramCanvas.push();
  diagramCanvas.translate(centerX, centerY);
  diagramCanvas.rotate(planeAngle);

  // Color the plane based on both light contributions
  diagramCanvas.fill(finalRed, finalGreen, finalBlue);
  diagramCanvas.stroke(255);
  diagramCanvas.strokeWeight(2);
  diagramCanvas.rect(-100, -10, 200, 20);
  diagramCanvas.pop();

  // Draw normal vector
  diagramCanvas.stroke(255, 100, 100);
  diagramCanvas.strokeWeight(4);
  let normalScale = 80;
  diagramCanvas.line(
    centerX,
    centerY,
    centerX + normal.x * normalScale,
    centerY + normal.y * normalScale
  );

  // Arrow for normal
  diagramCanvas.push();
  diagramCanvas.translate(
    centerX + normal.x * normalScale,
    centerY + normal.y * normalScale
  );
  diagramCanvas.rotate(atan2(normal.y, normal.x));
  diagramCanvas.fill(255, 100, 100);
  diagramCanvas.noStroke();
  diagramCanvas.triangle(0, 0, -10, -5, -10, 5);
  diagramCanvas.pop();

  // Draw light direction vector (red light)
  diagramCanvas.stroke(255, 100, 100);
  diagramCanvas.strokeWeight(4);
  let lightScale = 80;
  diagramCanvas.line(
    centerX,
    centerY,
    centerX + diagramLightDirection.x * lightScale,
    centerY + diagramLightDirection.y * lightScale
  );

  // Arrow for red light direction
  diagramCanvas.push();
  diagramCanvas.translate(
    centerX + diagramLightDirection.x * lightScale,
    centerY + diagramLightDirection.y * lightScale
  );
  diagramCanvas.rotate(atan2(diagramLightDirection.y, diagramLightDirection.x));
  diagramCanvas.fill(255, 100, 100);
  diagramCanvas.noStroke();
  diagramCanvas.triangle(0, 0, -10, -5, -10, 5);
  diagramCanvas.pop();

  // Draw second light direction vector if enabled (blue light)
  if (twoLightsMode) {
    diagramCanvas.stroke(100, 100, 255);
    diagramCanvas.strokeWeight(4);
    diagramCanvas.line(
      centerX,
      centerY,
      centerX + diagramLightDirection2.x * lightScale,
      centerY + diagramLightDirection2.y * lightScale
    );

    // Arrow for blue light direction
    diagramCanvas.push();
    diagramCanvas.translate(
      centerX + diagramLightDirection2.x * lightScale,
      centerY + diagramLightDirection2.y * lightScale
    );
    diagramCanvas.rotate(
      atan2(diagramLightDirection2.y, diagramLightDirection2.x)
    );
    diagramCanvas.fill(100, 100, 255);
    diagramCanvas.noStroke();
    diagramCanvas.triangle(0, 0, -10, -5, -10, 5);
    diagramCanvas.pop();
  }

  // Display information with proper colors for each label
  diagramCanvas.textAlign(LEFT);
  diagramCanvas.textSize(16);

  // Labels with appropriate colors
  diagramCanvas.fill(255, 150, 150); // Light red color for red light label
  diagramCanvas.text("Red Light", centerX + 210, centerY - 190);

  if (twoLightsMode) {
    diagramCanvas.fill(150, 150, 255); // Light blue color for blue light label
    diagramCanvas.text("Blue Light", centerX - 280, centerY - 190);
  }

  diagramCanvas.fill(255, 200, 200); // Light red for normal vector label
  diagramCanvas.text(
    "Normal Vector",
    centerX + normal.x * normalScale + 10,
    centerY + normal.y * normalScale - 10
  );

  diagramCanvas.fill(255, 150, 150); // Light red for red light direction label
  diagramCanvas.text(
    "Red Light Direction",
    centerX + diagramLightDirection.x * lightScale + 10,
    centerY + diagramLightDirection.y * lightScale + 20
  );

  if (twoLightsMode) {
    diagramCanvas.fill(150, 150, 255); // Light blue for blue light direction label
    diagramCanvas.text(
      "Blue Light Direction",
      centerX + diagramLightDirection2.x * lightScale - 120,
      centerY + diagramLightDirection2.y * lightScale + 20
    );
  }

  // Information panel
  let panelX = 50;
  let panelY = diagramCanvas.height - 200;

  diagramCanvas.fill(50, 50, 50, 200);
  diagramCanvas.stroke(255);
  diagramCanvas.strokeWeight(1);
  diagramCanvas.rect(panelX - 10, panelY - 10, 300, 150);

  diagramCanvas.fill(255);
  diagramCanvas.noStroke();
  diagramCanvas.textAlign(LEFT);
  diagramCanvas.textSize(14);

  diagramCanvas.text(
    "Plane Angle: " + degrees(planeAngle).toFixed(1) + "°",
    panelX,
    panelY + 15
  );
  diagramCanvas.text(
    "Red Light Dot Product: " + brightness1.toFixed(3),
    panelX,
    panelY + 35
  );
  if (twoLightsMode) {
    diagramCanvas.text(
      "Blue Light Dot Product: " + brightness2.toFixed(3),
      panelX,
      panelY + 50
    );
    diagramCanvas.text(
      "Final Color: R=" +
        finalRed.toFixed(0) +
        " G=" +
        finalGreen.toFixed(0) +
        " B=" +
        finalBlue.toFixed(0),
      panelX,
      panelY + 65
    );

    diagramCanvas.text(
      "Two colored lights demonstrate how",
      panelX,
      panelY + 90
    );
    diagramCanvas.text(
      "surface orientation affects the final",
      panelX,
      panelY + 105
    );
    diagramCanvas.text(
      "color by mixing light contributions.",
      panelX,
      panelY + 120
    );
  } else {
    diagramCanvas.text(
      "Brightness: " + (brightness1 * 100).toFixed(1) + "%",
      panelX,
      panelY + 50
    );

    diagramCanvas.text(
      "The brightness of the plane depends on",
      panelX,
      panelY + 80
    );
    diagramCanvas.text(
      "the angle between the normal vector",
      panelX,
      panelY + 95
    );
    diagramCanvas.text(
      "and the light direction (dot product).",
      panelX,
      panelY + 110
    );

    // Show angle between vectors
    let angle = acos(constrain(brightness1, -1, 1));
    diagramCanvas.text(
      "Angle between vectors: " + degrees(angle).toFixed(1) + "°",
      panelX,
      panelY + 125
    );
  }

  // Display the 2D canvas on the main canvas
  resetMatrix();
  image(diagramCanvas, -width / 2, -height / 2);
}

function drawZDepthProblemsSlide() {
  // Clear the main canvas
  background(30);

  // Draw on the 2D canvas
  diagramCanvas.background(30);

  // Set up 2D coordinate system
  let centerX = diagramCanvas.width / 2;
  let centerY = diagramCanvas.height / 2;

  // Animation time for comparison
  let animTime = frameCount * 0.01;

  // Draw title
  diagramCanvas.fill(255);
  diagramCanvas.textAlign(CENTER);
  diagramCanvas.textSize(24);
  diagramCanvas.text("Why Z-Depth for Brightness Fails", centerX, 50);

  // Draw subtitle
  diagramCanvas.textSize(16);
  diagramCanvas.fill(200, 200, 200);
  diagramCanvas.text(
    "Comparing Angle-Based vs Z-Depth Brightness Methods",
    centerX,
    75
  );

  // Setup comparison areas
  let leftX = centerX - 200;
  let rightX = centerX + 200;
  let compY = centerY - 50;

  // Common plane angle (oscillating)
  let planeAngle = (sin(animTime) * PI) / 4; // -45° to +45°

  // Light directions (same as main diagram)
  let redDir = createVector(1, -1, -0.5).normalize(); // Red light from top-right
  let greenDir = createVector(-1, -1, -0.5).normalize(); // Green light from top-left
  let blueDir = createVector(0, 1, -0.5).normalize(); // Blue light from bottom

  // Calculate plane normal
  let normal = createVector(sin(planeAngle), 0, cos(planeAngle)).normalize();

  // Method 1: Correct angle-based lighting (dot product)
  let redDot = max(0, normal.dot(redDir));
  let greenDot = max(0, normal.dot(greenDir));
  let blueDot = max(0, normal.dot(blueDir));

  let correctRed = redDot * 255;
  let correctGreen = greenDot * 255;
  let correctBlue = blueDot * 255;

  // Method 2: Incorrect z-depth based brightness
  // When using z-depth, all light directions get "flattened" toward the viewer
  let depthFactor = 0.3; // Simulating z-depth compression
  let flatRedDir = createVector(
    redDir.x * depthFactor,
    redDir.y * depthFactor,
    -1
  ).normalize();
  let flatGreenDir = createVector(
    greenDir.x * depthFactor,
    greenDir.y * depthFactor,
    -1
  ).normalize();
  let flatBlueDir = createVector(
    blueDir.x * depthFactor,
    blueDir.y * depthFactor,
    -1
  ).normalize();

  let redDepthDot = max(0, normal.dot(flatRedDir));
  let greenDepthDot = max(0, normal.dot(flatGreenDir));
  let blueDepthDot = max(0, normal.dot(flatBlueDir));

  let depthRed = redDepthDot * 255;
  let depthGreen = greenDepthDot * 255;
  let depthBlue = blueDepthDot * 255;

  // Draw "CORRECT" method on left
  diagramCanvas.textAlign(CENTER);
  diagramCanvas.fill(100, 255, 100);
  diagramCanvas.textSize(18);
  diagramCanvas.text("CORRECT: Angle-Based", leftX, compY - 80);

  // Draw the plane for correct method
  diagramCanvas.push();
  diagramCanvas.translate(leftX, compY);
  diagramCanvas.fill(correctRed, correctGreen, correctBlue);
  diagramCanvas.stroke(255);
  diagramCanvas.strokeWeight(2);
  diagramCanvas.rect(-60, -10, 120, 20);
  diagramCanvas.pop();

  // Draw light direction arrows for correct method
  let arrowScale = 60;

  // Red light arrow
  diagramCanvas.stroke(255, 100, 100);
  diagramCanvas.strokeWeight(3);
  diagramCanvas.line(
    leftX,
    compY,
    leftX + redDir.x * arrowScale,
    compY + redDir.y * arrowScale
  );

  // Green light arrow
  diagramCanvas.stroke(100, 255, 100);
  diagramCanvas.line(
    leftX,
    compY,
    leftX + greenDir.x * arrowScale,
    compY + greenDir.y * arrowScale
  );

  // Blue light arrow
  diagramCanvas.stroke(100, 100, 255);
  diagramCanvas.line(
    leftX,
    compY,
    leftX + blueDir.x * arrowScale,
    compY + blueDir.y * arrowScale
  );

  // Draw "WRONG" method on right
  diagramCanvas.textAlign(CENTER);
  diagramCanvas.fill(255, 100, 100);
  diagramCanvas.textSize(18);
  diagramCanvas.text("WRONG: Z-Depth Based", rightX, compY - 80);

  // Draw the plane for incorrect method
  diagramCanvas.push();
  diagramCanvas.translate(rightX, compY);
  diagramCanvas.fill(depthRed, depthGreen, depthBlue);
  diagramCanvas.stroke(255);
  diagramCanvas.strokeWeight(2);
  diagramCanvas.rect(-60, -10, 120, 20);
  diagramCanvas.pop();

  // Draw flattened light direction arrows for incorrect method
  diagramCanvas.stroke(255, 100, 100);
  diagramCanvas.strokeWeight(3);
  diagramCanvas.line(
    rightX,
    compY,
    rightX + flatRedDir.x * arrowScale,
    compY + flatRedDir.y * arrowScale
  );

  diagramCanvas.stroke(100, 255, 100);
  diagramCanvas.line(
    rightX,
    compY,
    rightX + flatGreenDir.x * arrowScale,
    compY + flatGreenDir.y * arrowScale
  );

  diagramCanvas.stroke(100, 100, 255);
  diagramCanvas.line(
    rightX,
    compY,
    rightX + flatBlueDir.x * arrowScale,
    compY + flatBlueDir.y * arrowScale
  );

  // Draw angular difference comparison
  let infoY = compY + 100;

  // Calculate angular separations
  let correctRedGreenAngle = acos(constrain(redDir.dot(greenDir), -1, 1));
  let correctRedBlueAngle = acos(constrain(redDir.dot(blueDir), -1, 1));
  let correctGreenBlueAngle = acos(constrain(greenDir.dot(blueDir), -1, 1));

  let depthRedGreenAngle = acos(constrain(flatRedDir.dot(flatGreenDir), -1, 1));
  let depthRedBlueAngle = acos(constrain(flatRedDir.dot(flatBlueDir), -1, 1));
  let depthGreenBlueAngle = acos(
    constrain(flatGreenDir.dot(flatBlueDir), -1, 1)
  );

  // Info panels
  let panelWidth = 180;
  let panelHeight = 140;

  // Left panel (correct method)
  diagramCanvas.fill(50, 50, 50, 200);
  diagramCanvas.stroke(100, 255, 100);
  diagramCanvas.strokeWeight(2);
  diagramCanvas.rect(leftX - panelWidth / 2, infoY, panelWidth, panelHeight);

  diagramCanvas.fill(255);
  diagramCanvas.noStroke();
  diagramCanvas.textAlign(CENTER);
  diagramCanvas.textSize(12);
  diagramCanvas.text("Light Separations:", leftX, infoY + 20);
  diagramCanvas.text(
    `R-G: ${degrees(correctRedGreenAngle).toFixed(1)}°`,
    leftX,
    infoY + 40
  );
  diagramCanvas.text(
    `R-B: ${degrees(correctRedBlueAngle).toFixed(1)}°`,
    leftX,
    infoY + 55
  );
  diagramCanvas.text(
    `G-B: ${degrees(correctGreenBlueAngle).toFixed(1)}°`,
    leftX,
    infoY + 70
  );

  diagramCanvas.fill(100, 255, 100);
  diagramCanvas.text("Wide angular separation", leftX, infoY + 90);
  diagramCanvas.text("= Good color range", leftX, infoY + 105);
  diagramCanvas.text("= Accurate reproduction", leftX, infoY + 120);

  // Right panel (incorrect method)
  diagramCanvas.fill(50, 50, 50, 200);
  diagramCanvas.stroke(255, 100, 100);
  diagramCanvas.strokeWeight(2);
  diagramCanvas.rect(rightX - panelWidth / 2, infoY, panelWidth, panelHeight);

  diagramCanvas.fill(255);
  diagramCanvas.noStroke();
  diagramCanvas.textAlign(CENTER);
  diagramCanvas.textSize(12);
  diagramCanvas.text("Light Separations:", rightX, infoY + 20);
  diagramCanvas.text(
    `R-G: ${degrees(depthRedGreenAngle).toFixed(1)}°`,
    rightX,
    infoY + 40
  );
  diagramCanvas.text(
    `R-B: ${degrees(depthRedBlueAngle).toFixed(1)}°`,
    rightX,
    infoY + 55
  );
  diagramCanvas.text(
    `G-B: ${degrees(depthGreenBlueAngle).toFixed(1)}°`,
    rightX,
    infoY + 70
  );

  diagramCanvas.fill(255, 100, 100);
  diagramCanvas.text("Narrow angular separation", rightX, infoY + 90);
  diagramCanvas.text("= Limited color range", rightX, infoY + 105);
  diagramCanvas.text("= Poor reproduction", rightX, infoY + 120);

  // Main explanation panel
  let mainPanelY = diagramCanvas.height - 120;
  diagramCanvas.fill(40, 40, 40, 240);
  diagramCanvas.stroke(255);
  diagramCanvas.strokeWeight(1);
  diagramCanvas.rect(50, mainPanelY, diagramCanvas.width - 100, 100);

  diagramCanvas.fill(255);
  diagramCanvas.textAlign(LEFT);
  diagramCanvas.textSize(14);
  diagramCanvas.text(
    "The Problem with Z-Depth Brightness:",
    70,
    mainPanelY + 20
  );
  diagramCanvas.text(
    "• Using Z-depth compresses light directions toward the viewer",
    70,
    mainPanelY + 40
  );
  diagramCanvas.text(
    "• This reduces angular separation between RGB lights",
    70,
    mainPanelY + 55
  );
  diagramCanvas.text(
    "• Smaller angles = less color discrimination = muddy, inaccurate colors",
    70,
    mainPanelY + 70
  );
  diagramCanvas.text(
    "• Surface orientation method preserves the full angular range",
    70,
    mainPanelY + 85
  );

  // Display the 2D canvas on the main canvas
  resetMatrix();
  image(diagramCanvas, -width / 2, -height / 2);
}

function showLightingDiagramControls() {
  slideNavContainer.style("display", "block");
  // Make sure the button is available to be shown by updateSlideButtons
  if (twoLightsButton) {
    twoLightsButton.show();
  }
  updateSlideButtons(); // This will show/hide slide-specific controls based on current slide
}

function hideLightingDiagramControls() {
  slideNavContainer.style("display", "none");
  twoLightsButton.style("display", "none");
  if (samplingModeContainer) {
    samplingModeContainer.style("display", "none");
  }
  // Force hide the button explicitly to ensure it's not visible on main sketch
  if (twoLightsButton) {
    twoLightsButton.hide();
  }
}
