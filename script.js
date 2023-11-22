const video = document.getElementById("video");

const stressLevels = {
  neutral: "Low Stress",
  happy: "Low Stress",
  sad: "Moderate to High Stress",
  angry: "High Stress",
  fearful: "High Stress",
  disgusted: "Moderate Stress",
  surprised: "Moderate Stress",
};

// Replace drawDetections function with stress level labels
function drawStressLabels(canvas, detections) {
  console.log("called");
  detections.forEach((detection) => {
    const { expressions } = detection || {}; // Destructure with default empty object

    const dominantExpression = getDominantExpression(expressions);

    const stressLevel =
      stressLevels[dominantExpression] || "Unknown Stress Level";

    const stressID = document.querySelector("#stress-level");
    if (stressID) {
      stressID.textContent = dominantExpression + "(" + stressLevel + ")";
    }
  });
}

// Example function to get the dominant expression
function getDominantExpression(expressions) {
  let dominantExpression = "neutral";
  let maxProbability = 0;

  for (const expression in expressions) {
    if (expression === "neutral" && expressions[expression] <= 0.8) {
      continue;
    }
    if (expressions[expression] > maxProbability) {
      maxProbability = expressions[expression];
      dominantExpression = expression;
    }
  }

  return dominantExpression;
}

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
  faceapi.nets.faceExpressionNet.loadFromUri("./models"),
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.error(err)
  );
}

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    drawStressLabels(canvas, resizedDetections);
  }, 100);
});
