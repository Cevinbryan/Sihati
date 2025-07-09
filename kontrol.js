document.addEventListener("DOMContentLoaded", function () {
  // ==== Konfigurasi Firebase ====
  const firebaseConfig = {
    apiKey: "AIzaSyA9Te56YLPP6XjGcRTAtQnqYzjYt_8kqgM",
    authDomain: "smart-switch-pbl-in2024-db81c.firebaseapp.com",
    projectId: "smart-switch-pbl-in2024-db81c",
    databaseURL: "https://smart-switch-pbl-in2024-db81c-default-rtdb.asia-southeast1.firebasedatabase.app", // GANTI SESUAI REGION
    storageBucket: "smart-switch-pbl-in2024-db81c.appspot.com",
    messagingSenderId: "145953908614",
    appId: "1:145953908614:web:c3814666dbd2f0b4a92e07"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();

  // ==== Ambil Element DOM ====
  const btnToggle = document.getElementById("btnToggle");
  const nilaiArusElem = document.getElementById("nilaiArus");
  const nilaiTeganganElem = document.getElementById("nilaiTegangan");

  const maxDataPoints = 30;

  // ==== Chart.js untuk Arus ====
  const ctxArus = document.getElementById("chartArus").getContext("2d");
  const chartArus = new Chart(ctxArus, {
    type: "line",
    data: {
      labels: Array(maxDataPoints).fill(""),
      datasets: [{
        label: "Arus (A)",
        data: Array(maxDataPoints).fill(0),
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.3)",
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      animation: false,
      scales: { y: { beginAtZero: true, max: 10 } }
    }
  });

  // ==== Chart.js untuk Tegangan ====
  const ctxTegangan = document.getElementById("chartTegangan").getContext("2d");
  const chartTegangan = new Chart(ctxTegangan, {
    type: "line",
    data: {
      labels: Array(maxDataPoints).fill(""),
      datasets: [{
        label: "Tegangan (V)",
        data: Array(maxDataPoints).fill(0),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.3)",
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      animation: false,
      scales: { y: { beginAtZero: true, max: 250 } }
    }
  });

  function updateChart(chart, label, value) {
    if (chart.data.labels.length >= maxDataPoints) {
      chart.data.labels.shift();
      chart.data.datasets[0].data.shift();
    }
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(value);
    chart.update();
  }

  // ==== Realtime Listener dari Firebase ====
  db.ref().on("value", (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const arus = parseFloat((data.ARUS || "0").replace(",", ".")) || 0;
    const tegangan = parseFloat((data.tegangan || "0").replace(",", ".")) || 0;

    nilaiArusElem.textContent = arus.toFixed(2);
    nilaiTeganganElem.textContent = tegangan.toFixed(2);

    const waktu = new Date().toLocaleTimeString();
    updateChart(chartArus, waktu, arus);
    updateChart(chartTegangan, waktu, tegangan);

    // Status tombol
    const tombolStatus = data.tombol || "OFF";
    btnToggle.textContent = tombolStatus;
    btnToggle.classList.toggle("off", tombolStatus === "OFF");
  });

  // ==== Event Tombol ON/OFF ====
  btnToggle.addEventListener("click", function () {
    const statusSekarang = btnToggle.textContent === "ON" ? "ON" : "OFF";
    const statusBaru = statusSekarang === "ON" ? "OFF" : "ON";

    db.ref("tombol").set(statusBaru);
  });

  // ==== Navigasi Sidebar ====
  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menuToggle");
  const mainContent = document.getElementById("mainContent");

  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    mainContent.classList.toggle("shifted");
  });

  const pages = {
    Home: document.getElementById("pageHome"),
    Setting: document.getElementById("pageSetting"),
    Logout: document.getElementById("pageLogout")
  };
  const navButtons = {
    Home: document.getElementById("navHome"),
    Setting: document.getElementById("navSetting"),
    Logout: document.getElementById("navLogout")
  };

  function showPage(page) {
    Object.keys(pages).forEach(p => {
      pages[p].classList.remove("active");
      navButtons[p].classList.remove("active");
    });
    pages[page].classList.add("active");
    navButtons[page].classList.add("active");
    sidebar.classList.remove("open");
    mainContent.classList.remove("shifted");
  }

  navButtons.Home.addEventListener("click", () => showPage("Home"));
  navButtons.Setting.addEventListener("click", () => showPage("Setting"));
  navButtons.Logout.addEventListener("click", () => {
    firebase.auth().signOut().then(() => {
      window.location.href = "login.html";
    }).catch(error => {
      alert("Gagal logout: " + error.message);
    });
  });

  document.getElementById("topbarHome").addEventListener("click", () => {
    window.location.href = "index.html";
  });

  // ==== Ubah Password ====
  document.getElementById('btnUbahPassword').addEventListener('click', function () {
    const passwordLama = document.getElementById('passwordLama').value;
    const passwordBaru = document.getElementById('passwordBaru').value;
    const konfirmasiPasswordBaru = document.getElementById('konfirmasiPasswordBaru').value;
    const pesanPassword = document.getElementById('pesanPassword');

    pesanPassword.textContent = '';
    pesanPassword.style.color = 'red';

    if (!passwordLama || !passwordBaru || !konfirmasiPasswordBaru) {
      pesanPassword.textContent = 'Semua kolom harus diisi.';
      return;
    }

    if (passwordBaru !== konfirmasiPasswordBaru) {
      pesanPassword.textContent = 'Password baru dan konfirmasi tidak cocok.';
      return;
    }

    const user = firebase.auth().currentUser;

    if (user) {
      const credential = firebase.auth.EmailAuthProvider.credential(user.email, passwordLama);
      user.reauthenticateWithCredential(credential)
        .then(() => user.updatePassword(passwordBaru))
        .then(() => {
          pesanPassword.style.color = 'green';
          pesanPassword.textContent = 'Password berhasil diubah.';
          document.getElementById('passwordLama').value = '';
          document.getElementById('passwordBaru').value = '';
          document.getElementById('konfirmasiPasswordBaru').value = '';
        })
        .catch((error) => {
          console.error(error);
          if (error.code === 'auth/wrong-password') {
            pesanPassword.textContent = 'Password lama salah.';
          } else if (error.code === 'auth/weak-password') {
            pesanPassword.textContent = 'Password baru terlalu lemah (minimal 6 karakter).';
          } else {
            pesanPassword.textContent = 'Terjadi kesalahan: ' + error.message;
          }
        });
    } else {
      pesanPassword.textContent = 'Tidak ada pengguna yang login.';
    }
  });
});


