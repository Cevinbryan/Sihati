// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA9Te56YLPP6XjGcRTAtQnqYzjYt_8kqgM",
  authDomain: "smart-switch-pbl-in2024-db81c.firebaseapp.com",
  projectId: "smart-switch-pbl-in2024-db81c",
  databaseURL: "https://smart-switch-pbl-in2024-db81c-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "smart-switch-pbl-in2024-db81c.appspot.com",
  messagingSenderId: "145953908614",
  appId: "1:145953908614:web:c3814666dbd2f0b4a92e07"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Login
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      window.location.href = "kontrol.html";
    })
    .catch((error) => {
      document.getElementById("pesan").textContent = "Login gagal: " + error.message;
      document.getElementById("pesan").style.color = "red";
    });
});

// Lupa Password
document.getElementById("forgotPasswordLink").addEventListener("click", function (e) {
  e.preventDefault();

  const email = prompt("Masukkan email Anda untuk reset password:");
  if (!email) return;

  auth.sendPasswordResetEmail(email)
    .then(() => {
      document.getElementById("pesan").textContent = "Email reset password telah dikirim.";
      document.getElementById("pesan").style.color = "green";
    })
    .catch((error) => {
      document.getElementById("pesan").textContent = "Gagal mengirim email reset: " + error.message;
      document.getElementById("pesan").style.color = "red";
    });
});
