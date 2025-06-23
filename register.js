// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyChanXgxaGPzSSv_zML9iAcldjdot5aIsQ",
  authDomain: "smart-switch-pblin2024.firebaseapp.com",
  databaseURL: "https://smart-switch-pblin2024-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-switch-pblin2024",
  storageBucket: "smart-switch-pblin2024.firebasestorage.app",
  messagingSenderId: "267223687057",
  appId: "1:267223687057:web:616e7c468db87c6af58430",
  measurementId: "G-2V1C0LHVMB"
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
