// Firebase Konfigurasi
const firebaseConfig = {
  apiKey: "AIzaSyChanXgxaGPzSSv_zML9iAcldjdot5aIsQ",
  authDomain: "smart-switch-pblin2024.firebaseapp.com",
  databaseURL: "https://smart-switch-pblin2024-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-switch-pblin2024",
  storageBucket: "smart-switch-pblin2024.appspot.com",
  messagingSenderId: "267223687057",
  appId: "1:267223687057:web:616e7c468db87c6af58430"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Elemen-elemen
const btnToggle = document.getElementById('btnToggle');
const nilaiArusElem = document.getElementById('nilaiArus');
const nilaiTeganganElem = document.getElementById('nilaiTegangan');
const maxDataPoints = 30;

// Chart Arus
const ctxArus = document.getElementById('chartArus').getContext('2d');
const chartArus = new Chart(ctxArus, {
  type: 'line',
  data: {
    labels: Array(maxDataPoints).fill(''),
    datasets: [{
      label: 'Arus (A)',
      data: Array(maxDataPoints).fill(0),
      borderColor: 'rgb(54, 162, 235)',
      backgroundColor: 'rgba(54, 162, 235, 0.3)',
      fill: true,
      tension: 0.3
    }]
  },
  options: {
    animation: false,
    scales: { y: { beginAtZero: true, max: 10 } }
  }
});

// Chart Tegangan
const ctxTegangan = document.getElementById('chartTegangan').getContext('2d');
const chartTegangan = new Chart(ctxTegangan, {
  type: 'line',
  data: {
    labels: Array(maxDataPoints).fill(''),
    datasets: [{
      label: 'Tegangan (V)',
      data: Array(maxDataPoints).fill(0),
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.3)',
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

// Realtime Listener
function listenToFirebase() {
  db.ref().on('value', (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const arus = parseFloat((data.ARUS || "0").replace(",", ".")) || 0;
    const tegangan = parseFloat((data.tegangan || "0").replace(",", ".")) || 0;

    nilaiArusElem.textContent = arus.toFixed(2);
    nilaiTeganganElem.textContent = tegangan.toFixed(2);

    const waktu = new Date().toLocaleTimeString();
    updateChart(chartArus, waktu, arus);
    updateChart(chartTegangan, waktu, tegangan);

    const tombolStatus = data.tombol || "OFF";
    btnToggle.textContent = tombolStatus;
    btnToggle.classList.toggle("off", tombolStatus === "OFF");
  });
}

// Tombol ON/OFF
btnToggle.addEventListener('click', () => {
  const statusSekarang = btnToggle.classList.contains("off") ? "OFF" : "ON";
  const statusBaru = statusSekarang === "ON" ? "OFF" : "ON";
  db.ref("tombol").set(statusBaru);
});

listenToFirebase();

// Sidebar toggle
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");
const mainContent = document.getElementById("mainContent");

menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  mainContent.classList.toggle("shifted");
});

// Navigasi
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
  window.location.href = "kontrol.html";
});

// Ubah Password
document.getElementById("btnUbahPassword").addEventListener("click", () => {
  const lama = document.getElementById("passwordLama").value;
  const baru = document.getElementById("passwordBaru").value;
  const konfirmasi = document.getElementById("konfirmasiPasswordBaru").value;
  const pesan = document.getElementById("pesanPassword");

  if (baru !== konfirmasi) {
    pesan.textContent = "Konfirmasi password tidak cocok!";
    pesan.style.color = "red";
    return;
  }

  db.ref("pengaturan/password").once("value").then(snapshot => {
    const currentPassword = snapshot.val() || "";

    if (lama === currentPassword) {
      db.ref("pengaturan/password").set(baru)
        .then(() => {
          pesan.textContent = "Password berhasil diubah.";
          pesan.style.color = "green";
        })
        .catch(() => {
          pesan.textContent = "Gagal mengubah password.";
          pesan.style.color = "red";
        });
    } else {
      pesan.textContent = "Password lama salah!";
      pesan.style.color = "red";
    }
  });
});
