// Variables for lighting diagram
let planeAngle = 0;
let diagramLightDirection;
let diagramLightDirection2;
let twoLightsMode = false;
let twoLightsButton;

// Slide system variables
let currentSlide = 1; // Start with Light Color Recreation slide (the original diagram)
let totalSlides = 2; // 0: Pixel Averaging, 1: Light Color Recreation
let slideButtons = [];
let slideNavContainer;

// Slide 0 variables (Pixel Averaging)
let zoomLevel = 1;
let selectedCellX = 30;
let selectedCellY = 28;
let showGrid = true;

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
  twoLightsButton.mousePressed(toggleTwoLights);

  // Setup slide navigation
  setupSlideNavigation();
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
  let slideNames = ["Pixel Averaging", "Light Color Recreation"];

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
  } else {
    twoLightsButton.style("display", "none");
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

      // Calculate and display average color
      let avgR = 0,
        avgG = 0,
        avgB = 0;
      let pixelCount = 0;

      zoomedImg.loadPixels();
      for (let i = 0; i < zoomedImg.pixels.length; i += 4) {
        avgR += zoomedImg.pixels[i];
        avgG += zoomedImg.pixels[i + 1];
        avgB += zoomedImg.pixels[i + 2];
        pixelCount++;
      }

      avgR = Math.round(avgR / pixelCount);
      avgG = Math.round(avgG / pixelCount);
      avgB = Math.round(avgB / pixelCount);

      // Show average color swatch
      diagramCanvas.fill(avgR, avgG, avgB);
      diagramCanvas.noStroke();
      diagramCanvas.rect(zoomX, zoomY + zoomSize + 20, zoomSize, 30);

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

      // Info panel
      let panelX = 50;
      let panelY = diagramCanvas.height - 160;

      diagramCanvas.fill(50, 50, 50, 200);
      diagramCanvas.stroke(255);
      diagramCanvas.strokeWeight(1);
      diagramCanvas.rect(panelX - 10, panelY - 10, 400, 120);

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
        `Pixel Averaging: ${pixelAvg}x${pixelAvg} samples per cell`,
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
    }
  }

  // Display the 2D canvas on the main canvas
  resetMatrix();
  image(diagramCanvas, -width / 2, -height / 2);
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

function showLightingDiagramControls() {
  slideNavContainer.style("display", "block");
  updateSlideButtons(); // This will show/hide slide-specific controls based on current slide
}

function hideLightingDiagramControls() {
  slideNavContainer.style("display", "none");
  twoLightsButton.style("display", "none");
}
