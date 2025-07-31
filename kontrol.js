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

  const microSelect = document.getElementById("microSelect");
  const btnToggle = document.getElementById("btnToggle");
  const nilaiArusElem = document.getElementById("nilaiArus");
  const nilaiTeganganElem = document.getElementById("nilaiTegangan");
  const nilaiWattElem = document.getElementById("nilaiWatt");
  const nilaiKwhElem = document.getElementById("nilaiKwh");

  let currentMicro = null;
  let currentListener = null;
  let totalEnergiKwh = 0;
  let lastUpdateTime = Date.now();

  // === Load daftar mikrokontroler ===
  db.ref("mikrokontroler").once("value", (snapshot) => {
    microSelect.innerHTML = "";
    snapshot.forEach((child) => {
      const id = child.key;
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = id;
      microSelect.appendChild(opt);
    });
    currentMicro = microSelect.value;
    listenRealtime(currentMicro);
  });

  microSelect.addEventListener("change", () => {
    currentMicro = microSelect.value;
    totalEnergiKwh = 0;
    lastUpdateTime = Date.now();
    if (currentListener) currentListener.off();
    listenRealtime(currentMicro);
  });

  function listenRealtime(microId) {
    const ref = db.ref(`mikrokontroler/${microId}`);
    currentListener = ref;
    ref.on("value", (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      let arus = parseFloat(data.powerData?.current?.toString().replace(",", ".")) || 0;
      let tegangan = parseFloat(data.powerData?.voltage?.toString().replace(",", ".")) || 0;
      const daya = arus * tegangan;
      const waktu = new Date().toLocaleTimeString();
      const now = Date.now();
      const deltaJam = (now - lastUpdateTime) / (1000 * 3600);
      totalEnergiKwh += (daya * deltaJam) / 1000;
      lastUpdateTime = now;

      nilaiArusElem.textContent = arus.toFixed(2);
      nilaiTeganganElem.textContent = tegangan.toFixed(2);
      nilaiWattElem.textContent = daya.toFixed(2);
      nilaiKwhElem.textContent = totalEnergiKwh.toFixed(4);

      updateChart(chartArus, waktu, arus);
      updateChart(chartTegangan, waktu, tegangan);
      updateChart(chartWatt, waktu, daya);
      updateChart(chartKwh, waktu, totalEnergiKwh);

      const statusRelay = data.relay?.status || "OFF";
      btnToggle.textContent = statusRelay;
      btnToggle.classList.toggle("off", statusRelay === "OFF");
    });
  }

  btnToggle.addEventListener("click", () => {
    if (!currentMicro) return;
    const currentText = btnToggle.textContent.trim().toUpperCase();
    const newStatus = currentText === "ON" ? "OFF" : "ON";
    btnToggle.disabled = true;
    btnToggle.textContent = "Loading...";
    db.ref(`mikrokontroler/${currentMicro}/relay/status`).set(newStatus)
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

  // ==== Grafik ====
  const maxDataPoints = 30;
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

  // ==== Navigasi Sidebar ====
  const menuToggleBtn = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  if (menuToggleBtn && sidebar) {
    menuToggleBtn.addEventListener("click", () => sidebar.classList.toggle("open"));
  }

  const navHome = document.getElementById("navHome");
  const navSetting = document.getElementById("navSetting");
  const navLogout = document.getElementById("navLogout");
  const pageHome = document.getElementById("pageHome");
  const pageSetting = document.getElementById("pageSetting");

  function showPage(pageToShow) {
    [pageHome, pageSetting].forEach(p => p.classList.remove("active"));
    pageToShow.classList.add("active");
    [navHome, navSetting].forEach(b => b.classList.remove("active"));
    if (pageToShow === pageHome) navHome.classList.add("active");
    if (pageToShow === pageSetting) navSetting.classList.add("active");
    sidebar.classList.remove("open");
  }

  navHome?.addEventListener("click", () => showPage(pageHome));
  navSetting?.addEventListener("click", () => showPage(pageSetting));
  navLogout?.addEventListener("click", () => window.location.href = "login.html");

  // ==== Cek Status Koneksi ====
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
