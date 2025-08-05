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

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Fungsi Login
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  // Validasi email
  if (!email.includes("@")) {
    tampilkanPesan("Format email tidak valid.", "red");
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Login berhasil, redirect
      window.location.href = "kontrol.html";
    })
    .catch((error) => {
      // Menangani error dengan kode
      let msg;
      switch (error.code) {
        case 'auth/user-not-found':
          msg = "Pengguna tidak ditemukan.";
          break;
        case 'auth/wrong-password':
          msg = "Kata sandi salah.";
          break;
        case 'auth/invalid-email':
          msg = "Email tidak valid.";
          break;
        default:
          msg = "Login gagal: " + error.message;
      }
      tampilkanPesan(msg, "red");
    });
});

// Fungsi Reset Password
document.getElementById("forgotPasswordLink").addEventListener("click", function (e) {
  e.preventDefault();

  const email = prompt("Masukkan email Anda untuk reset password:");
  if (!email || !email.includes("@")) {
    tampilkanPesan("Email tidak valid.", "red");
    return;
  }

  auth.sendPasswordResetEmail(email)
    .then(() => {
      tampilkanPesan("Email reset password telah dikirim.", "green");
    })
    .catch((error) => {
      let msg = "Gagal mengirim email reset: " + error.message;
      tampilkanPesan(msg, "red");
    });
});

// Fungsi untuk menampilkan pesan
function tampilkanPesan(teks, warna) {
  const pesan = document.getElementById("pesan");
  pesan.textContent = teks;
  pesan.style.color = warna;
}
