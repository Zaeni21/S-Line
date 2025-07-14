let video;
let model;
let headPosition = null;
let points = [];
let connections = [];

async function setup() {
  createCanvas(800, 600);

  // Inisialisasi video feed
  video = document.getElementById('video');
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
      video.play();
    })
    .catch(err => {
      console.error("Error accessing webcam:", err);
      alert("Please allow webcam access to use this application.");
    });

  // Memuat model face-api.js
  await tf.setBackend('webgl');
  model = await faceLandmarksDetection.load(
    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
  );

  // Membuat titik acak lainnya (mensimulasikan orang lain)
  for (let i = 0; i < 4; i++) {
    points.push(createVector(random(width), random(height)));
  }

  // Menghubungkan titik (S Line simulasi)
  connections.push([0, 1]);
  connections.push([1, 2]);
  connections.push([2, 3]);
}

function draw() {
  background(255);

  // Menggambar garis merah (S Line)
  stroke(255, 0, 0);
  strokeWeight(2);
  for (let conn of connections) {
    let p1 = points[conn[0]];
    let p2 = points[conn[1]];
    line(p1.x, p1.y, p2.x, p2.y);
  }

  // Menggambar titik
  noStroke();
  fill(0);
  for (let p of points) {
    ellipse(p.x, p.y, 10, 10);
  }

  // Menggambar posisi kepala jika terdeteksi
  if (headPosition) {
    fill(255, 0, 0);
    ellipse(headPosition.x, headPosition.y, 15, 15);
    // Menghubungkan kepala ke titik pertama (contoh S Line)
    stroke(255, 0, 0);
    line(headPosition.x, headPosition.y, points[0].x, points[0].y);
  }
}

// Fungsi untuk mendeteksi wajah secara periodik
async function detectFace() {
  if (!model || !video.readyState === 4) return;
  const predictions = await model.estimateFaces({ input: video });
  if (predictions.length > 0) {
    const face = predictions[0];
    const landmarks = face.scaledMesh;
    // Mengambil posisi tengah wajah
    const nose = landmarks[1]; // Titik hidung sebagai referensi
    headPosition = createVector(map(nose[0], 0, video.width, 0, width), map(nose[1], 0, video.height, 0, height));
  } else {
    headPosition = null; // Tidak ada wajah terdeteksi
  }
  setTimeout(detectFace, 100); // Deteksi setiap 100ms
}

// Memulai deteksi wajah setelah setup
function setupComplete() {
  detectFace();
}
