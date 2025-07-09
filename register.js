// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA9Te56YLPP6XjGcRTAtQnqYzjYt_8kqgM",
  authDomain: "smart-switch-pbl-in2024-db81c.firebaseapp.com",
  projectId: "smart-switch-pbl-in2024-db81c",
  storageBucket: "smart-switch-pbl-in2024-db81c.firebasestorage.app",
  messagingSenderId: "145953908614",
  appId: "1:145953908614:web:c3814666dbd2f0b4a92e07",
  measurementId: "G-C1GM34C45L"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);

// Tangani submit form
document.querySelector("form").addEventListener("submit", function (e) {
  e.preventDefault(); // Mencegah form submit secara default

  // Ambil data dari form
  const nama = document.getElementById("nama").value;
  const email = document.getElementById("email").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const konfirmasi = document.getElementById("konfirmasi").value;

  // Validasi password dan konfirmasi
  if (password !== konfirmasi) {
    alert("Kata sandi dan konfirmasi tidak cocok.");
    return;
  }

  // Buat akun dengan Firebase Authentication
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Akun berhasil dibuat
      const user = userCredential.user;

      // Tambahkan nama dan username ke profile (opsional)
      return user.updateProfile({
        displayName: nama
      });
    })
    .then(() => {
      // Redirect ke halaman login
      alert("Pendaftaran berhasil! Silakan login.");
      window.location.href = "login.html";
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(`Pendaftaran gagal: ${errorMessage}`);
    });
});
