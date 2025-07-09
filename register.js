// Konfigurasi Firebase
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

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nama = document.getElementById("nama").value;
    const email = document.getElementById("email").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const konfirmasi = document.getElementById("konfirmasi").value;

    if (password !== konfirmasi) {
      alert("Kata sandi dan konfirmasi tidak cocok.");
      return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const uid = user.uid;

        return firebase.database().ref("akun/" + uid).set({
          nama: nama,
          username: username,
          email: email,
          uid: uid
        }).then(() => {
          return user.updateProfile({ displayName: nama });
        });
      })
      .then(() => {
        alert("Pendaftaran berhasil! Silakan login.");
        window.location.href = "login.html";
      })
      .catch((error) => {
        alert("Pendaftaran gagal: " + error.message);
      });
  });
});
