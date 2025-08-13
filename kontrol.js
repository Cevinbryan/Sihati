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

  // ==== DOM Elements ====
  const btnToggle = document.getElementById("btnToggle");
  const nilaiArusElem = document.getElementById("nilaiArus");
  const nilaiTeganganElem = document.getElementById("nilaiTegangan");
  const nilaiWattElem = document.getElementById("nilaiWatt");
  const nilaiKwhElem = document.getElementById("nilaiKwh");
  const btnUbahPassword = document.getElementById("btnUbahPassword");
  const passwordLama = document.getElementById("passwordLama");
  const passwordBaru = document.getElementById("passwordBaru");
  const konfirmasiPasswordBaru = document.getElementById("konfirmasiPasswordBaru");
  const pesanPassword = document.getElementById("pesanPassword");

  // ==== Chart Setup ====
  const maxDataPoints = 30;
  let totalEnergiKwh = 0;
  let lastUpdateTime = Date.now();
  let lastSavedTime = 0;
  const saveInterval = 60 * 1000; // 1 menit

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
        scales: { y: { beginAtZero: true }, x: {} },
        plugins: { legend: { labels: { color: "#fff" } } }
      }
    });
  }

  function updateChart(chart, label, value) {
    if (chart.data.labels.length >= maxDataPoints) {
      chart.data.labels.shift();
      chart.data.datasets[0].data.shift();
    }
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(value);
    chart.update("none");
  }

  const chartArus = buatChart(document.getElementById("chartArus").getContext("2d"), "Arus (A)", "rgb(54, 162, 235)");
  const chartTegangan = buatChart(document.getElementById("chartTegangan").getContext("2d"), "Tegangan (V)", "rgb(255, 99, 132)");
  const chartWatt = buatChart(document.getElementById("chartWatt").getContext("2d"), "Daya (Watt)", "rgb(255, 165, 0)");
  const chartKwh = buatChart(document.getElementById("chartKwh").getContext("2d"), "Energi (kWh)", "rgb(128, 0, 128)");

  // ==== Realtime Firebase Listener ====
  db.ref().on("value", (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    let arus = parseFloat((data.powerData?.current || "0").toString().replace(",", ".")) || 0;
    let tegangan = parseFloat((data.powerData?.voltage || "0").toString().replace(",", ".")) || 0;
    const daya = arus * tegangan;
    const waktu = new Date().toLocaleTimeString();

    // Kalkulasi kWh
    const currentTime = Date.now();
    const deltaJam = (currentTime - lastUpdateTime) / (1000 * 3600);
    totalEnergiKwh += (daya * deltaJam) / 1000;
    lastUpdateTime = currentTime;

    // Update UI
    nilaiArusElem.textContent = arus.toFixed(2);
    nilaiTeganganElem.textContent = tegangan.toFixed(2);
    nilaiWattElem.textContent = daya.toFixed(2);
    nilaiKwhElem.textContent = totalEnergiKwh.toFixed(4);

    // Update Charts
    updateChart(chartArus, waktu, arus);
    updateChart(chartTegangan, waktu, tegangan);
    updateChart(chartWatt, waktu, daya);
    updateChart(chartKwh, waktu, totalEnergiKwh);

    // Update tombol relay
    if (btnToggle) {
      const statusRelay = data.relay?.status || "OFF";
      btnToggle.textContent = statusRelay;
      btnToggle.classList.remove("on", "off");
      btnToggle.classList.add(statusRelay.toLowerCase());
    }

    // Simpan histori harian & bulanan setiap 1 menit
    if (Date.now() - lastSavedTime > saveInterval) {
      const now = new Date();
      const tahun = now.getFullYear();
      const bulan = String(now.getMonth() + 1).padStart(2, '0');
      const tanggal = String(now.getDate()).padStart(2, '0');
      const jam = now.toTimeString().split(" ")[0].replace(/:/g, "-");

      // === Simpan history harian ===
      const dailyPath = `powerHistory/${tahun}/${bulan}/${tanggal}T${jam}`;
      db.ref(dailyPath).set({
        current: arus,
        voltage: tegangan,
        watt: daya,
        kwh: totalEnergiKwh,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      });

      // === Simpan history bulanan ===
      const monthlyPath = `monthlyHistory/${tahun}/${bulan}`;
      db.ref(monthlyPath).once("value").then(snapshot => {
        let monthlyData = snapshot.val() || { totalKwh: 0, totalWatt: 0, count: 0 };

        monthlyData.totalKwh = parseFloat(monthlyData.totalKwh) + totalEnergiKwh;
        monthlyData.totalWatt = parseFloat(monthlyData.totalWatt) + daya;
        monthlyData.count = (monthlyData.count || 0) + 1;
        monthlyData.avgWatt = monthlyData.totalWatt / monthlyData.count;

        return db.ref(monthlyPath).set({
          totalKwh: monthlyData.totalKwh,
          totalWatt: monthlyData.totalWatt,
          avgWatt: monthlyData.avgWatt,
          count: monthlyData.count,
          lastUpdate: firebase.database.ServerValue.TIMESTAMP
        });
      });

      lastSavedTime = Date.now();
    }
  });

  // ==== Toggle Relay ====
  if (btnToggle) {
    btnToggle.addEventListener("click", () => {
      const currentText = btnToggle.textContent.trim().toUpperCase();
      const newStatus = currentText === "ON" ? "OFF" : "ON";

      btnToggle.disabled = true;
      btnToggle.textContent = "Loading...";

      db.ref("relay/status").set(newStatus).then(() => {
        btnToggle.textContent = newStatus;
        btnToggle.classList.remove("on", "off");
        btnToggle.classList.add(newStatus.toLowerCase());
        btnToggle.disabled = false;
      }).catch((error) => {
        alert("Gagal mengubah status relay: " + error.message);
        btnToggle.textContent = currentText;
        btnToggle.disabled = false;
      });
    });
  }

  // ==== Ubah Password ====
  if (btnUbahPassword) {
    btnUbahPassword.addEventListener("click", () => {
      const user = firebase.auth().currentUser;
      if (!user) return;

      const credential = firebase.auth.EmailAuthProvider.credential(
        user.email,
        passwordLama.value
      );

      if (passwordBaru.value !== konfirmasiPasswordBaru.value) {
        pesanPassword.textContent = "Konfirmasi password tidak cocok.";
        return;
      }

      user.reauthenticateWithCredential(credential).then(() => {
        return user.updatePassword(passwordBaru.value);
      }).then(() => {
        pesanPassword.textContent = "Password berhasil diubah.";
        passwordLama.value = "";
        passwordBaru.value = "";
        konfirmasiPasswordBaru.value = "";
      }).catch((error) => {
        pesanPassword.textContent = "Gagal: " + error.message;
      });
    });
  }

  // ==== Auth Check ====
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = "index.html";
    }
  });

  // ==== Navigasi Sidebar ====
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

    sidebar.classList.remove("open");
    overlay.classList.remove("active");
    content.classList.remove("shifted");

    [navHome, navSetting, navLogout].forEach(btn => btn.classList.remove("active"));
    if (pageName === "home") navHome.classList.add("active");
    if (pageName === "setting") navSetting.classList.add("active");
    if (pageName === "logout") navLogout.classList.add("active");
  }

  if (navHome) navHome.addEventListener("click", () => showPage("home"));
  if (navSetting) navSetting.addEventListener("click", () => showPage("setting"));
  if (navLogout) {
    navLogout.addEventListener("click", () => {
      showPage("logout");
      firebase.auth().signOut().then(() => {
        window.location.href = "index.html";
      }).catch((error) => {
        alert("Gagal logout: " + error.message);
      });
    });
  }

  // ==== Sidebar Toggle ====
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
    overlay.addEventListener("click", toggleSidebar);
  }
});
