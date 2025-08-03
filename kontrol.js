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

  // ==== Variabel Global ====
  const maxDataPoints = 30;
  let totalEnergiKwh = 0;
  let lastUpdateTime = Date.now();

  function updateChart(chart, label, value) {
    if (chart.data.labels.length >= maxDataPoints) {
      chart.data.labels.shift();
      chart.data.datasets[0].data.shift();
    }
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(value);
    chart.update("none");
  }

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
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true },
          x: {}
        },
        plugins: {
          legend: {
            labels: { color: "#fff" }
          }
        }
      }
    });
  }

  const chartArus = buatChart(document.getElementById("chartArus").getContext("2d"), "Arus (A)", "rgb(54, 162, 235)");
  const chartTegangan = buatChart(document.getElementById("chartTegangan").getContext("2d"), "Tegangan (V)", "rgb(255, 99, 132)");
  const chartWatt = buatChart(document.getElementById("chartWatt").getContext("2d"), "Daya (Watt)", "rgb(255, 165, 0)");
  const chartKwh = buatChart(document.getElementById("chartKwh").getContext("2d"), "Energi (kWh)", "rgb(128, 0, 128)");

  db.ref().on("value", (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    let arus = 0;
    let tegangan = 0;
    if (data.powerData) {
      arus = parseFloat((data.powerData.current || "0").toString().replace(",", ".")) || 0;
      tegangan = parseFloat((data.powerData.voltage || "0").toString().replace(",", ".")) || 0;
    }

    const daya = arus * tegangan;
    const waktu = new Date().toLocaleTimeString();

    const currentTime = Date.now();
    const deltaJam = (currentTime - lastUpdateTime) / (1000 * 3600);
    totalEnergiKwh += (daya * deltaJam) / 1000;
    lastUpdateTime = currentTime;

    if (nilaiArusElem) nilaiArusElem.textContent = arus.toFixed(2);
    if (nilaiTeganganElem) nilaiTeganganElem.textContent = tegangan.toFixed(2);
    if (nilaiWattElem) nilaiWattElem.textContent = daya.toFixed(2);
    if (nilaiKwhElem) nilaiKwhElem.textContent = totalEnergiKwh.toFixed(4);

    if (btnToggle) {
      const statusRelay = data.relay?.status || "OFF";
      btnToggle.textContent = statusRelay;
      btnToggle.classList.toggle("off", statusRelay === "OFF");
    }

    updateChart(chartArus, waktu, arus);
    updateChart(chartTegangan, waktu, tegangan);
    updateChart(chartWatt, waktu, daya);
    updateChart(chartKwh, waktu, totalEnergiKwh);
  });

  if (btnToggle) {
    btnToggle.addEventListener("click", () => {
      const currentText = btnToggle.textContent.trim().toUpperCase();
      const newStatus = currentText === "ON" ? "OFF" : "ON";

      btnToggle.disabled = true;
      btnToggle.textContent = "Loading...";

      db.ref("relay/status").set(newStatus)
        .then(() => {
          btnToggle.textContent = newStatus;
          btnToggle.disabled = false;
          btnToggle.classList.toggle("off", newStatus === "OFF");
        })
        .catch((error) => {
          alert("Gagal mengubah status relay: " + error.message);
          btnToggle.textContent = currentText;
          btnToggle.disabled = false;
        });
    });
  }

  const connectedRef = db.ref(".info/connected");
  connectedRef.on("value", (snap) => {
    const isConnected = snap.val();
    const statusIndicator = document.getElementById("statusConnection");
    if (statusIndicator) {
      statusIndicator.textContent = isConnected ? "Online" : "Offline";
      statusIndicator.className = isConnected ? "status online" : "status offline";
    }
  });
});

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const content = document.getElementById("mainContent");
const overlay = document.getElementById("overlay");

if (menuToggle && sidebar && content && overlay) {
  function toggleSidebar() {
    const isOpen = sidebar.classList.toggle("open");
    content.classList.toggle("shifted", isOpen);
    overlay.classList.toggle("active", isOpen);
  }

  menuToggle.addEventListener("click", toggleSidebar);
  overlay.addEventListener("click", toggleSidebar); // klik di luar sidebar untuk tutup
}

// ==== Navigasi Halaman ====
const pages = {
  home: document.getElementById("pageHome"),
  setting: document.getElementById("pageSetting"),
  logout: document.getElementById("pageLogout"),
};

const navHome = document.getElementById("navHome");
const navSetting = document.getElementById("navSetting");
const navLogout = document.getElementById("navLogout");

function showPage(pageName) {
  Object.values(pages).forEach(page => page.classList.remove("active"));
  if (pages[pageName]) pages[pageName].classList.add("active");

  // Tutup sidebar & overlay jika sedang dibuka
  sidebar.classList.remove("open");
  overlay.classList.remove("active");
  content.classList.remove("shifted");

  // Update tombol active di sidebar
  [navHome, navSetting, navLogout].forEach(btn => btn.classList.remove("active"));
  if (pageName === "home") navHome.classList.add("active");
  if (pageName === "setting") navSetting.classList.add("active");
  if (pageName === "logout") navLogout.classList.add("active");
}

// Event listener tombol sidebar
if (navHome) navHome.addEventListener("click", () => showPage("home"));
if (navSetting) navSetting.addEventListener("click", () => showPage("setting"));
if (navLogout) navLogout.addEventListener("click", () => showPage("logout"));

if (navLogout) {
  navLogout.addEventListener("click", () => {
    // Tampilkan halaman logout (opsional)
    showPage("logout");

    // Logout Firebase
    firebase.auth().signOut().then(() => {
      // Redirect ke halaman login (index.html)
      window.location.href = "index.html";
    }).catch((error) => {
      alert("Gagal logout: " + error.message);
    });
  });
}

firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    // Jika belum login, redirect ke halaman login
    window.location.href = "index.html";
  }
});
