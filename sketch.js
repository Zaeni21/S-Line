let video;
let model;
let headPosition = null;
let points = [];
let connections = [];

async function setup() {
  createCanvas(800, 600);

  // Inisialisasi video feed
  video = document.getElementById('video');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.play();
  } catch (err) {
    console.error("Webcam error:", err);
    alert("Gagal akses kamera, cek izin di pengaturan browser bro!");
    return; // Hentikan setup jika kamera gagal
  }

  // Memuat model face-api.js
  try {
    await tf.setBackend('webgl');
    model = await faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
    );
    console.log("Model loaded successfully!");
  } catch (err) {
    console.error("Model loading error:", err);
    alert("Gagal muat model wajah, cek koneksi internet bro!");
    return;
  }

  // Titik acak lainnya
  for (let i = 0; i < 4; i++) {
    points.push(createVector(random(width), random(height)));
  }
  connections.push([0, 1], [1, 2], [2, 3]);

  // Mulai deteksi wajah
  detectFace();
}

function draw() {
  background(255);

  // Gambar garis merah
  stroke(255, 0, 0);
  strokeWeight(2);
  for (let conn of connections) {
    let p1 = points[conn[0]];
    let p2 = points[conn[1]];
    line(p1.x, p1.y, p2.x, p2.y);
  }

  // Gambar titik
  noStroke();
  fill(0);
  for (let p of points) {
    ellipse(p.x, p.y, 10, 10);
  }

  // Gambar posisi kepala
  if (headPosition) {
    fill(255, 0, 0);
    ellipse(headPosition.x, headPosition.y, 15, 15);
    stroke(255, 0, 0);
    line(headPosition.x, headPosition.y, points[0].x, points[0].y);
  }
}

// Deteksi wajah
async function detectFace() {
  if (!model || video.readyState !== 4) {
    setTimeout(detectFace, 100);
    return;
  }
  try {
    const predictions = await model.estimateFaces({ input: video });
    if (predictions.length > 0) {
      const face = predictions[0];
      const landmarks = face.scaledMesh;
      const nose = landmarks[1]; // Titik hidung
      headPosition = createVector(
        map(nose[0], 0, video.width, 0, width),
        map(nose[1], 0, video.height, 0, height)
      );
    } else {
      headPosition = null;
    }
  } catch (err) {
    console.error("Face detection error:", err);
  }
  setTimeout(detectFace, 100);
}
