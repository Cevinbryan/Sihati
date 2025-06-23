// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBfwaUBVgNkNexSdiUrU2HfLUlE_4jW0w4",
  authDomain: "penekan-saklar-otomatis.firebaseapp.com",
  databaseURL: "https://penekan-saklar-otomatis-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "penekan-saklar-otomatis",
  storageBucket: "penekan-saklar-otomatis.firebasestorage.app",
  messagingSenderId: "75189026968",
  appId: "1:75189026968:web:51497f22927018774310ed",
  measurementId: "G-MJSCD8E7DV"
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
