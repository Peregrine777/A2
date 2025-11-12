////////////////
// Parameters //
////////////////
let cols = 40;
let rows = 40;
let pixelSize = 10;
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

  // --- 2D overlay canvas ---
  overlay = createGraphics(200, 200); // small preview on top
  overlay.position(0, 0);
  overlay.background(50);

  // --- 2D canvas for lighting diagram ---
  diagramCanvas = createGraphics(800, 800);
  diagramCanvas.background(30);

  // Button to toggle test sphere
  sphereButton = createButton("Toggle Sphere");
  sphereButton.position(10, 10);
  sphereButton.mousePressed(() => (showSphere = !showSphere));

  // File input for local images
  fileInput = createFileInput(handleFile);
  fileInput.position(10, 40);

  // Dropdown for web images
  webImageDropdown = createSelect();
  webImageDropdown.position(10, 70);
  webImageDropdown.option("Select an image");
  webImages.forEach((url) => {
    webImageDropdown.option(url);
  });
  webImageDropdown.changed(handleWebImageSelection);

  //Dropdown for light type
  lightTypeDropdown = createSelect();
  // either rgb or white light
  lightTypeDropdown.position(10, 100);
  lightTypeDropdown.option("RGB Lights");
  lightTypeDropdown.option("White Light");
  lightTypeDropdown.option("Ambient Light");
  lightTypeDropdown.changed(() => {
    lightType = lightTypeDropdown.value();
    console.log("Light type changed to:", lightType);
  });

  //Slider for pixel averaging
  avgSlider = createSlider(1, 16, pixelAvg, 1);
  avgSlider.position(10, 150);
  avgSlider.input(() => {
    pixelAvg = avgSlider.value();
    console.log("Pixel averaging set to:", pixelAvg);
    avgValueDisplay.html(pixelAvg); // Update the display value
  });
  // label for slider
  avgLabel = createDiv("Pixel Averaging:");
  avgLabel.position(10, 130);
  // Value display for slider
  avgValueDisplay = createDiv(pixelAvg);
  avgValueDisplay.position(150, 150);

  // define RGB light directions (not using perceptual, so just a guess)
  redLight = createVector(-colStrength, -colStrength, -1).normalize();
  greenLight = createVector(colStrength, -colStrength, -1).normalize();
  blueLight = createVector(-0.0, colStrength, -1).normalize();

  img.loadPixels(); // Load pixel array once
  imgPixels = img.pixels; // Store reference to pixels array
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
  let selectedUrl = webImageDropdown.value();
  if (selectedUrl && selectedUrl !== "Select an image") {
    loadImage(
      selectedUrl,
      (loadedImg) => {
        // success callback
        img = loadedImg;
        img.loadPixels();
        imgPixels = img.pixels;
        console.log("Image loaded and pixels ready:", selectedUrl);
      },
      () => {
        // error callback
        console.error("Failed to load image from URL:", selectedUrl);
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
  sphereButton.style("display", "block");
  fileInput.style("display", "block");
  webImageDropdown.style("display", "block");
  lightTypeDropdown.style("display", "block");
  avgSlider.style("display", "block");
  avgLabel.style("display", "block");
  avgValueDisplay.style("display", "block");
}

function hideMainSketchControls() {
  sphereButton.style("display", "none");
  fileInput.style("display", "none");
  webImageDropdown.style("display", "none");
  lightTypeDropdown.style("display", "none");
  avgSlider.style("display", "none");
  avgLabel.style("display", "none");
  avgValueDisplay.style("display", "none");
}
