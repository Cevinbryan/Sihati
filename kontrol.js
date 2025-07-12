document.addEventListener("DOMContentLoaded", function () {
  // ==== Firebase Config ====
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
  const db = firebase.database();

  // ==== Elemen DOM ====
  const btnToggle = document.getElementById("btnToggle");
  const nilaiArusElem = document.getElementById("nilaiArus");
  const nilaiTeganganElem = document.getElementById("nilaiTegangan");
  const nilaiWattElem = document.getElementById("nilaiWatt");
  const nilaiKwhElem = document.getElementById("nilaiKwh");

  // ==== Buat Grafik ====
  const maxDataPoints = 30;
  let totalEnergiKwh = 0;

  function buatChart(ctx, label, warna) {
    return new Chart(ctx, {
      type: "line",
      data: {
        labels: Array(maxDataPoints).fill(""),
        datasets: [{
          label: label,
          data: Array(maxDataPoints).fill(0),
          borderColor: warna,
          backgroundColor: warna.replace("rgb", "rgba").replace(")", ", 0.2)"),
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        animation: false,
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  const chartArus = buatChart(document.getElementById("chartArus").getContext("2d"), "Arus (A)", "rgb(54, 162, 235)");
  const chartTegangan = buatChart(document.getElementById("chartTegangan").getContext("2d"), "Tegangan (V)", "rgb(255, 99, 132)");
  const chartWatt = buatChart(document.getElementById("chartWatt").getContext("2d"), "Daya (Watt)", "rgb(255, 165, 0)");
  const chartKwh = buatChart(document.getElementById("chartKwh").getContext("2d"), "Energi (kWh)", "rgb(128, 0, 128)");

  function updateChart(chart, label, value) {
    if (chart.data.labels.length >= maxDataPoints) {
      chart.data.labels.shift();
      chart.data.datasets[0].data.shift();
    }
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(value);
    chart.update();
  }

  // ==== Realtime Data Listener ====
  db.ref().on("value", (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const arus = parseFloat((data.ARUS || "0").replace(",", ".")) || 0;
    const tegangan = parseFloat((data.tegangan || "0").replace(",", ".")) || 0;
    const daya = arus * tegangan;
    const waktu = new Date().toLocaleTimeString();
    const deltaJam = 1 / 3600;
    totalEnergiKwh += (daya * deltaJam) / 1000;

    nilaiArusElem.textContent = arus.toFixed(2);
    nilaiTeganganElem.textContent = tegangan.toFixed(2);
    nilaiWattElem.textContent = daya.toFixed(2);
    nilaiKwhElem.textContent = totalEnergiKwh.toFixed(4);

    // ✅ Gunakan relay.status
    const statusRelay = data.relay?.status || "OFF";
    btnToggle.textContent = statusRelay;
    btnToggle.classList.toggle("off", statusRelay === "OFF");

    updateChart(chartArus, waktu, arus);
    updateChart(chartTegangan, waktu, tegangan);
    updateChart(chartWatt, waktu, daya);
    updateChart(chartKwh, waktu, totalEnergiKwh);
  });

  // ==== Toggle ON/OFF Button ====
  btnToggle.addEventListener("click", function () {
    const status = btnToggle.textContent;
    const baru = status === "ON" ? "OFF" : "ON";
    db.ref("relay/status").set(baru); // ✅ Simpan di relay/status
  });
//rizkyewsqs
  // ==== Sidebar & Navigasi ====
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
    for (const key in pages) {
      pages[key].classList.remove("active");
      navButtons[key].classList.remove("active");
    }
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
    }).catch((error) => {
      alert("Gagal logout: " + error.message);
    });
  });

  document.getElementById("topbarHome").addEventListener("click", () => {
    showPage("Home");
  });

  // ==== Ubah Password ====
  document.getElementById('btnUbahPassword').addEventListener('click', function () {
    const passwordLama = document.getElementById('passwordLama').value;
    const passwordBaru = document.getElementById('passwordBaru').value;
    const konfirmasi = document.getElementById('konfirmasiPasswordBaru').value;
    const pesan = document.getElementById('pesanPassword');

    pesan.textContent = '';
    pesan.style.color = 'red';

    if (!passwordLama || !passwordBaru || !konfirmasi) {
      pesan.textContent = 'Semua kolom harus diisi.';
      return;
    }

    if (passwordBaru !== konfirmasi) {
      pesan.textContent = 'Password baru tidak cocok.';
      return;
    }

    const user = firebase.auth().currentUser;
    if (user) {
      const credential = firebase.auth.EmailAuthProvider.credential(user.email, passwordLama);
      user.reauthenticateWithCredential(credential)
        .then(() => user.updatePassword(passwordBaru))
        .then(() => {
          pesan.style.color = 'green';
          pesan.textContent = 'Password berhasil diubah.';
          document.getElementById('passwordLama').value = '';
          document.getElementById('passwordBaru').value = '';
          document.getElementById('konfirmasiPasswordBaru').value = '';
        })
        .catch((error) => {
          if (error.code === 'auth/wrong-password') {
            pesan.textContent = 'Password lama salah.';
          } else if (error.code === 'auth/weak-password') {
            pesan.textContent = 'Password terlalu lemah (min. 6 karakter).';
          } else {
            pesan.textContent = 'Kesalahan: ' + error.message;
          }
        });
    } else {
      pesan.textContent = 'Pengguna tidak ditemukan.';
    }
  });
});
