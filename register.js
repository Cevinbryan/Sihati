// register.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA9Te56YLPP6XjGcRTAtQnqYzjYt_8kqgM",
  authDomain: "smart-switch-pbl-in2024-db81c.firebaseapp.com",
  databaseURL: "https://smart-switch-pbl-in2024-db81c-default-rtdb.asia-southeast1.firebasedatabase.app/", // URL yang benar untuk region Asia Southeast
  projectId: "smart-switch-pbl-in2024-db81c",
  storageBucket: "smart-switch-pbl-in2024-db81c.appspot.com",
  messagingSenderId: "145953908614",
  appId: "1:145953908614:web:c3814666dbd2f0b4a92e07",
  measurementId: "G-C1GM34C45L"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Fungsi untuk menampilkan pesan error yang lebih user-friendly
function getErrorMessage(errorCode) {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Email sudah terdaftar. Silakan gunakan email lain atau login.';
    case 'auth/weak-password':
      return 'Kata sandi terlalu lemah. Minimal 6 karakter.';
    case 'auth/invalid-email':
      return 'Format email tidak valid.';
    case 'auth/operation-not-allowed':
      return 'Pendaftaran dengan email/password tidak diizinkan.';
    case 'auth/network-request-failed':
      return 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
    default:
      return 'Terjadi kesalahan: ' + errorCode;
  }
}

// Fungsi validasi input
function validateInput(nama, email, username, password, konfirmasi) {
  if (!nama || nama.length < 2) {
    return 'Nama harus diisi minimal 2 karakter.';
  }
  
  if (!email || !email.includes('@')) {
    return 'Email tidak valid.';
  }
  
  if (!username || username.length < 3) {
    return 'Username harus diisi minimal 3 karakter.';
  }
  
  if (!password || password.length < 6) {
    return 'Kata sandi harus minimal 6 karakter.';
  }
  
  if (password !== konfirmasi) {
    return 'Kata sandi dan konfirmasi tidak cocok.';
  }
  
  return null;
}

// Tunggu sampai DOM siap
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Disable tombol submit untuk mencegah double submission
    submitButton.disabled = true;
    submitButton.textContent = 'Mendaftar...';

    const nama = document.getElementById("nama").value.trim();
    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const konfirmasi = document.getElementById("konfirmasi").value;

    // Validasi input
    const validationError = validateInput(nama, email, username, password, konfirmasi);
    if (validationError) {
      alert(validationError);
      submitButton.disabled = false;
      submitButton.textContent = 'Daftar';
      return;
    }

    try {
      console.log('Mencoba membuat akun untuk email:', email);
      
      // Buat user dengan email dan password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('User berhasil dibuat:', user.uid);

      // Simpan data pengguna ke Realtime Database
      await set(ref(database, "akun/" + user.uid), {
        nama: nama,
        username: username,
        email: email,
        uid: user.uid,
        createdAt: new Date().toISOString()
      });

      console.log('Data berhasil disimpan ke database');

      // Update nama tampilan user
      await updateProfile(user, { displayName: nama });

      console.log('Profile berhasil diupdate');

      // Auto-login setelah registrasi berhasil
      // User sudah otomatis login karena createUserWithEmailAndPassword
      console.log('User berhasil login otomatis:', user.email);
      
      // Redirect ke halaman utama/dashboard
      window.location.href = "login.html"; // atau "index.html" sesuai halaman utama Anda
      
    } catch (error) {
      console.error("Error saat mendaftar:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      
      // Tampilkan pesan error yang user-friendly
      alert(getErrorMessage(error.code));
      
      // Re-enable tombol submit
      submitButton.disabled = false;
      submitButton.textContent = 'Daftar';
    }
  });
});

// Tambahkan event listener untuk real-time validation
document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("password");
  const konfirmasiInput = document.getElementById("konfirmasi");
  
  if (passwordInput && konfirmasiInput) {
    konfirmasiInput.addEventListener("input", () => {
      if (konfirmasiInput.value && passwordInput.value !== konfirmasiInput.value) {
        konfirmasiInput.setCustomValidity("Kata sandi tidak cocok");
      } else {
        konfirmasiInput.setCustomValidity("");
      }
    });
  }
});