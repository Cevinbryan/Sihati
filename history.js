// ==== Config Firebase ====
const firebaseConfig = {
  apiKey: "AIzaSyA9Te56YLPP6XjGcRTAtQnqYzjYt_8kqgM",
  authDomain: "smart-switch-pbl-in2024-db81c.firebaseapp.com",
  databaseURL: "https://smart-switch-pbl-in2024-db81c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-switch-pbl-in2024-db81c",
  storageBucket: "smart-switch-pbl-in2024-db81c.appspot.com",
  messagingSenderId: "145953908614",
  appId: "1:145953908614:web:c3814666dbd2f0b4a92e07"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Elemen DOM
const selectTahun = document.getElementById("selectTahun");
const selectBulan = document.getElementById("selectBulan");
const totalEnergyElem = document.getElementById("totalEnergy");
const totalCostElem = document.getElementById("totalCost");

// Tarif listrik per kWh
const tarifPerKwh = 1358.82;

// Setup Chart.js
function buatChart(ctx, label, warna) {
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: label,
        data: [],
        borderColor: warna,
        backgroundColor: warna.replace("rgb", "rgba").replace(")", ", 0.2)"),
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true },
        x: {
          ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 10 }
        }
      },
      plugins: {
        legend: { labels: { color: "#eee" } }
      }
    }
  });
}

const chartArus = buatChart(document.getElementById("chartArus").getContext("2d"), "Arus (A)", "rgb(54, 162, 235)");
const chartTegangan = buatChart(document.getElementById("chartTegangan").getContext("2d"), "Tegangan (V)", "rgb(255, 99, 132)");
const chartDaya = buatChart(document.getElementById("chartDaya").getContext("2d"), "Daya (Watt)", "rgb(255, 165, 0)");
const chartEnergi = buatChart(document.getElementById("chartEnergi").getContext("2d"), "Energi (kWh)", "rgb(128, 0, 128)");

// Fungsi nama bulan
function namaBulan(kodeBulan) {
  const bulan = {
    "01": "Januari", "02": "Februari", "03": "Maret", "04": "April",
    "05": "Mei", "06": "Juni", "07": "Juli", "08": "Agustus",
    "09": "September", "10": "Oktober", "11": "November", "12": "Desember"
  };
  return bulan[kodeBulan] || kodeBulan;
}

// Ambil list tahun dari Firebase
async function loadTahunFromFirebase() {
  const snapshot = await db.ref("history").once("value");
  const data = snapshot.val();
  if (!data) return [];
  return Object.keys(data).sort((a,b) => b - a); // Descending
}

// Ambil list bulan dari tahun tertentu
async function loadBulanFromFirebase(tahun) {
  const snapshot = await db.ref(`history/${tahun}`).once("value");
  const data = snapshot.val();
  if (!data) return [];
  return Object.keys(data).sort(); // Ascending
}

// Isi dropdown tahun & bulan
async function populateDropdowns() {
  const tahunList = await loadTahunFromFirebase();

  selectTahun.innerHTML = "";
  selectBulan.innerHTML = "";

  tahunList.forEach(tahun => {
    const opt = document.createElement("option");
    opt.value = tahun;
    opt.textContent = tahun;
    selectTahun.appendChild(opt);
  });

  if (tahunList.length === 0) return;

  selectTahun.value = tahunList[0];

  const bulanList = await loadBulanFromFirebase(selectTahun.value);
  bulanList.forEach(bulan => {
    const opt = document.createElement("option");
    opt.value = bulan;
    opt.textContent = namaBulan(bulan);
    selectBulan.appendChild(opt);
  });

  if (bulanList.length > 0) selectBulan.value = bulanList[0];
}

// Reset grafik dan summary
function resetCharts() {
  [chartArus, chartTegangan, chartDaya, chartEnergi].forEach(chart => {
    chart.data.labels = [];
    chart.data.datasets[0].data = [];
    chart.update();
  });
  totalEnergyElem.textContent = "0";
  totalCostElem.textContent = "0";
}

let historyRef = null;

// Load data realtime sesuai tahun dan bulan
function loadDataHistoryRealtime(tahun, bulan) {
  if (historyRef) historyRef.off();

  resetCharts();

  historyRef = db.ref(`history/${tahun}/${bulan}`);
  historyRef.on("value", snapshot => {
    const data = snapshot.val();
    if (!data) {
      resetCharts();
      return;
    }

    const tanggalKeys = Object.keys(data).sort((a,b) => Number(a) - Number(b));

    const labels = [];
    const arusData = [];
    const teganganData = [];
    const dayaData = [];
    const energiData = [];

    let totalEnergy = 0;

    tanggalKeys.forEach(tgl => {
      const d = data[tgl];
      labels.push(tgl);
      arusData.push(d.current ? parseFloat(d.current) : 0);
      teganganData.push(d.voltage ? parseFloat(d.voltage) : 0);
      dayaData.push(d.watt ? parseFloat(d.watt) : 0);
      energiData.push(d.kwh ? parseFloat(d.kwh) : 0);
      totalEnergy += d.kwh ? parseFloat(d.kwh) : 0;
    });

    chartArus.data.labels = labels;
    chartArus.data.datasets[0].data = arusData;
    chartArus.update();

    chartTegangan.data.labels = labels;
    chartTegangan.data.datasets[0].data = teganganData;
    chartTegangan.update();

    chartDaya.data.labels = labels;
    chartDaya.data.datasets[0].data = dayaData;
    chartDaya.update();

    chartEnergi.data.labels = labels;
    chartEnergi.data.datasets[0].data = energiData;
    chartEnergi.update();

    totalEnergyElem.textContent = totalEnergy.toFixed(4);
    totalCostElem.textContent = (totalEnergy * tarifPerKwh).toFixed(2);
  });
}

// Event dropdown tahun berubah
selectTahun.addEventListener("change", async () => {
  const bulanList = await loadBulanFromFirebase(selectTahun.value);

  selectBulan.innerHTML = "";
  bulanList.forEach(bulan => {
    const opt = document.createElement("option");
    opt.value = bulan;
    opt.textContent = namaBulan(bulan);
    selectBulan.appendChild(opt);
  });

  if (bulanList.length > 0) {
    selectBulan.value = bulanList[0];
    loadDataHistoryRealtime(selectTahun.value, selectBulan.value);
  } else {
    resetCharts();
  }
});

// Event dropdown bulan berubah
selectBulan.addEventListener("change", () => {
  loadDataHistoryRealtime(selectTahun.value, selectBulan.value);
});

// Init
(async function init() {
  await populateDropdowns();
  if (selectTahun.value && selectBulan.value) {
    loadDataHistoryRealtime(selectTahun.value, selectBulan.value);
  }
})();
