// Simple login
const loginForm = document.getElementById('login-form');
const configSection = document.getElementById('config-section');
const visitSection = document.getElementById('visit-section');
const catalogSection = document.getElementById('catalog-section');
const mapSection = document.getElementById('map-section');
const historySection = document.getElementById('history-section');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;
  if (user === '@Sandes' && pass === 'Sandes@123') {
    loginForm.parentElement.classList.add('hidden');
    configSection.classList.remove('hidden');
    visitSection.classList.remove('hidden');
    catalogSection.classList.remove('hidden');
    mapSection.classList.remove('hidden');
    historySection.classList.remove('hidden');
    initMap();
  } else {
    alert('Credenciais inválidas');
  }
});

// PDF
if (typeof jsPDF !== 'undefined') {
  document.getElementById('pdf-btn').addEventListener('click', () => {
    const doc = new jsPDF();
    doc.text('Orçamento SanOptics', 10, 10);
    doc.text(`Total: ${document.getElementById('total-price').innerText}`, 10, 20);
    doc.save('orcamento.pdf');
  });
}

// Geolocation + Leaflet
function initMap() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    const map = L.map('map').setView([latitude, longitude], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);
    L.marker([latitude, longitude]).addTo(map);
  });
}

// Service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js');
  });
}
