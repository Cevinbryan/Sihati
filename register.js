// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA9Te56YLPP6XjGcRTAtQnqYzjYt_8kqgM",
  authDomain: "smart-switch-pbl-in2024-db81c.firebaseapp.com",
  databaseURL: "https://smart-switch-pbl-in2024-db81c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-switch-pbl-in2024-db81c",
  storageBucket: "smart-switch-pbl-in2024-db81c.firebasestorage.app",
  messagingSenderId: "145953908614",
  appId: "1:145953908614:web:c3814666dbd2f0b4a92e07",
  measurementId: "G-C1GM34C45L"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const errorMessage = document.createElement("div");
  errorMessage.id = "error-message";
  errorMessage.style.color = "red";
  errorMessage.style.textAlign = "center";
  errorMessage.style.marginBottom = "10px";
  form.prepend(errorMessage); // Tambahkan elemen error ke form

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorMessage.textContent = ""; // Reset pesan error

    const nama = document.getElementById("nama").value.trim();
    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const konfirmasi = document.getElementById("konfirmasi").value;
    const submitButton = form.querySelector("button[type='submit']");

    if (password !== konfirmasi) {
      errorMessage.textContent = "Kata sandi dan konfirmasi tidak cocok.";
      return;
    }

    if (password.length < 6) {
      errorMessage.textContent = "Kata sandi minimal 6 karakter.";
      return;
    }

    if (username.includes(" ")) {
      errorMessage.textContent = "Username tidak boleh mengandung spasi.";
      return;
    }

    // Nonaktifkan tombol submit sementara
    submitButton.disabled = true;
    submitButton.textContent = "Memproses...";

    // Cek apakah username sudah digunakan (opsional tapi disarankan)
    firebase.database().ref("akun").orderByChild("username").equalTo(username).once("value")
      .then((snapshot) => {
        if (snapshot.exists()) {
          throw new Error("Username sudah digunakan. Silakan pilih yang lain.");
        }

        // Buat akun baru
        return firebase.auth().createUserWithEmailAndPassword(email, password);
      })
      .then((userCredential) => {
        const user = userCredential.user;
        const uid = user.uid;

        // Simpan data pengguna ke database
        return firebase.database().ref("akun/" + uid).set({
          nama: nama,
          username: username,
          email: email,
          uid: uid
        }).then(() => {
          // Update profil pengguna
          return user.updateProfile({ displayName: nama });
        });
      })
      .then(() => {
        alert("Pendaftaran berhasil! Silakan login.");
        window.location.href = "login.html";
      })
      .catch((error) => {
        errorMessage.textContent = "Pendaftaran gagal: " + error.message;
      })
      .finally(() => {
        // Aktifkan kembali tombol submit
        submitButton.disabled = false;
        submitButton.textContent = "Daftar";
      });
  });
});
