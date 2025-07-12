// Firebase config (ganti dengan punyamu)
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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const yearSelect = document.getElementById('yearSelect');
const monthSelect = document.getElementById('monthSelect');
const filterButton = document.getElementById('filterButton');

// Konversi nama bulan ke huruf besar
function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Ambil tahun-tahun dari Firebase
function loadYears() {
  db.ref('history').once('value').then(snapshot => {
    const years = Object.keys(snapshot.val() || {});
    yearSelect.innerHTML = '';
    if (years.length === 0) {
      yearSelect.innerHTML = '<option>Tidak ada data</option>';
    } else {
      years.sort().forEach(y => {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        yearSelect.appendChild(opt);
      });
      yearSelect.value = years[years.length - 1];
      loadMonths(years[years.length - 1]); // default load bulan
    }
  });
}

// Ambil bulan-bulan dari Firebase untuk tahun tertentu
function loadMonths(selectedYear) {
  db.ref(`history/${selectedYear}`).once('value').then(snapshot => {
    const months = Object.keys(snapshot.val() || {});
    monthSelect.innerHTML = '';
    months.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = capitalize(m);
      monthSelect.appendChild(opt);
    });
    if (months.length > 0) monthSelect.value = months[months.length - 1];
  });
}

// Jika tahun diganti, isi bulan ulang
yearSelect.addEventListener('change', () => {
  const selectedYear = yearSelect.value;
  if (selectedYear) loadMonths(selectedYear);
});

// Inisialisasi Chart kosong
const ctx = document.getElementById('usageChart').getContext('2d');
const usageChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Konsumsi kWh',
        data: [],
        backgroundColor: 'rgba(33, 150, 243, 0.6)',
        borderColor: 'rgba(33, 150, 243, 1)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        label: 'Biaya (Rp)',
        data: [],
        type: 'line',
        backgroundColor: 'rgba(255, 87, 34, 0.6)',
        borderColor: 'rgba(255, 87, 34, 1)',
        borderWidth: 2,
        yAxisID: 'y1',
      }
    ]
  },
  options: {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: 'Konsumsi Energi dan Biaya'
      }
    },
    scales: {
      y: {
        type: 'linear',
        position: 'left',
        title: { display: true, text: 'kWh' }
      },
      y1: {
        type: 'linear',
        position: 'right',
        title: { display: true, text: 'Biaya (Rp)' },
        grid: { drawOnChartArea: false }
      }
    }
  }
});

// Tampilkan grafik berdasarkan pilihan
filterButton.addEventListener('click', () => {
  const year = yearSelect.value;
  const month = monthSelect.value;
  const path = `history/${year}/${month}`;

  db.ref(path).once('value').then(snapshot => {
    const data = snapshot.val() || {};
    const labels = [], kWh = [], cost = [];

    for (let i = 1; i <= 30; i++) {
      const dayKey = i < 10 ? `day_0${i}` : `day_${i}`;
      const value = data[dayKey];
      labels.push(`Hari ${i}`);
      kWh.push(typeof value === 'number' ? value : 0);
      cost.push(typeof value === 'number' ? (value * 1350).toFixed(0) : 0);
    }

    usageChart.data.labels = labels;
    usageChart.data.datasets[0].data = kWh;
    usageChart.data.datasets[1].data = cost;
    usageChart.options.plugins.title.text = `Konsumsi Energi - ${capitalize(month)} ${year}`;
    usageChart.update();
  });
});

// Saat halaman pertama kali dimuat
window.addEventListener('DOMContentLoaded', loadYears);
