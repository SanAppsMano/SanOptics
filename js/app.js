// Cadastro e login simples

document.addEventListener('DOMContentLoaded', () => {
  const registerSection = document.getElementById('register-section');
  const registerForm = document.getElementById('register-form');
  const loginSection = document.getElementById('login-section');
  const loginForm = document.getElementById('login-form');
  const configSection = document.getElementById('config-section');
  const configForm = document.getElementById('config-form');
  const visitSection = document.getElementById('visit-section');
  const visitForm = document.getElementById('visit-form');
  const catalogSection = document.getElementById('catalog-section');
  const catalogUpload = document.getElementById('catalog-upload');
  const catalogDiv = document.getElementById('catalog');
  const mapSection = document.getElementById('map-section');
  const historySection = document.getElementById('history-section');
  const historyList = document.getElementById('history-list');

  let map;
  const markers = [];

  function initMap() {
    map = L.map('map').setView([-14.2350, -51.9253], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);
  }

  function addMarker(v) {
    if (map && v.latitude && v.longitude) {
      const marker = L.marker([v.latitude, v.longitude]).addTo(map);
      let content = `<strong>${v.clientName}</strong><br>${v.clientAddress}<br>${v.timestamp}`;
      if (v.recipeImage) {
        content += `<br><img src="${v.recipeImage}" style="max-width:100px">`;
      }
      marker.bindPopup(content);
      markers.push({ marker, visit: v });
    }
  }

  function addVisitToHistory(visit) {
    const li = document.createElement('li');
    const info = document.createElement('span');
    info.textContent = `${visit.timestamp} - ${visit.clientName}`;
    li.appendChild(info);
    if (visit.recipeImage) {
      const img = document.createElement('img');
      img.src = visit.recipeImage;
      img.style.maxWidth = '50px';
      img.style.marginLeft = '0.5rem';
      li.appendChild(img);
    }
    li.style.cursor = 'pointer';
    li.addEventListener('click', () => {
      const m = markers.find(m => m.visit === visit);
      if (m) {
        map.setView([visit.latitude, visit.longitude], 15);
        m.marker.openPopup();
      }
    });
    historyList.appendChild(li);
  }

  function saveVisit(visit) {
    const visits = JSON.parse(localStorage.getItem('visits') || '[]');
    visits.push(visit);
    localStorage.setItem('visits', JSON.stringify(visits));
    addVisitToHistory(visit);
    addMarker(visit);
    visitForm.reset();
  }

  function loadHistory() {
    const visits = JSON.parse(localStorage.getItem('visits') || '[]');
    visits.forEach(v => {
      addVisitToHistory(v);
      addMarker(v);
    });
  }

  function download(filename, text) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    link.download = filename;
    link.click();
  }

  const storedUser = localStorage.getItem('username');
  const storedPass = localStorage.getItem('password');
  const storedName = localStorage.getItem('opticName');
  const storedEmail = localStorage.getItem('adminEmail');

  if (!storedUser || !storedPass) {
    registerSection.classList.remove('hidden');
  } else if (!storedName || !storedEmail) {
    configSection.classList.remove('hidden');
  } else {
    loginSection.classList.remove('hidden');
  }

  registerForm.addEventListener('submit', e => {
    e.preventDefault();
    localStorage.setItem('username', document.getElementById('reg-username').value);
    localStorage.setItem('password', document.getElementById('reg-password').value);
    localStorage.setItem('opticName', document.getElementById('reg-optic').value);
    localStorage.setItem('adminEmail', document.getElementById('reg-email').value);
    registerSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    alert('Cadastro realizado. Faça login para continuar.');
  });

  configForm.addEventListener('submit', e => {
    e.preventDefault();
    const nameInput = document.getElementById('optic-name');
    const emailInput = document.getElementById('admin-email');
    if (!nameInput || !emailInput) return;
    localStorage.setItem('opticName', nameInput.value);
    localStorage.setItem('adminEmail', emailInput.value);
    configSection.classList.add('hidden');
    visitSection.classList.remove('hidden');
    catalogSection.classList.remove('hidden');
    mapSection.classList.remove('hidden');
    historySection.classList.remove('hidden');
    initMap();
    loadHistory();
  });

  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const user = document.getElementById('login-username').value;
    const pass = document.getElementById('login-password').value;
    if (user === localStorage.getItem('username') && pass === localStorage.getItem('password')) {
      loginSection.classList.add('hidden');
      if (!localStorage.getItem('opticName') || !localStorage.getItem('adminEmail')) {
        configSection.classList.remove('hidden');
      } else {
        visitSection.classList.remove('hidden');
        catalogSection.classList.remove('hidden');
        mapSection.classList.remove('hidden');
        historySection.classList.remove('hidden');
        initMap();
        loadHistory();
      }
    } else {
      alert('Usuário ou senha inválidos');
    }
  });

  visitForm.addEventListener('submit', e => {
    e.preventDefault();
    const visit = {
      clientName: document.getElementById('client-name').value,
      clientPhone: document.getElementById('client-phone').value,
      clientEmail: document.getElementById('client-email').value,
      clientAddress: document.getElementById('client-address').value,
      diopters: document.getElementById('diopters').value,
      timestamp: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      latitude: null,
      longitude: null,
      recipeImage: null
    };

    const file = document.getElementById('recipe-upload').files[0];

    const finalize = () => {
      navigator.geolocation.getCurrentPosition(pos => {
        visit.latitude = pos.coords.latitude;
        visit.longitude = pos.coords.longitude;
        saveVisit(visit);
      }, () => saveVisit(visit));
    };

    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        visit.recipeImage = ev.target.result;
        finalize();
      };
      reader.readAsDataURL(file);
    } else {
      finalize();
    }
  });

  document.getElementById('export-json').addEventListener('click', () => {
    const visits = localStorage.getItem('visits') || '[]';
    download('visitas.json', visits);
  });

  document.getElementById('export-csv').addEventListener('click', () => {
    const visits = JSON.parse(localStorage.getItem('visits') || '[]');
    const csv = visits.map(v => `${v.timestamp};${v.clientName};${v.clientAddress}`).join('\n');
    download('visitas.csv', csv);
  });

  if (typeof jsPDF !== 'undefined') {
    document.getElementById('export-pdf').addEventListener('click', () => {
      const visits = JSON.parse(localStorage.getItem('visits') || '[]');
      const doc = new jsPDF();
      visits.forEach((v, idx) => {
        doc.text(`Visita ${idx + 1}`, 10, 10);
        doc.text(`Nome: ${v.clientName}`, 10, 20);
        doc.text(`Endereço: ${v.clientAddress}`, 10, 30);
        doc.text(`Data/Hora: ${v.timestamp}`, 10, 40);
        if (idx < visits.length - 1) doc.addPage();
      });
      doc.save('visitas.pdf');
    });
  }

  catalogUpload.addEventListener('change', () => {
    const files = Array.from(catalogUpload.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.maxWidth = '100px';
        img.style.margin = '0.25rem';
        catalogDiv.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  });
});
