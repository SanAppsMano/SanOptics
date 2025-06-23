// Script principal para registrar visitas
document.addEventListener('DOMContentLoaded', () => {
  const visitSection = document.getElementById('visit-section');
  const visitForm = document.getElementById('visit-form');
  const catalogSection = document.getElementById('catalog-section');
  const catalogUpload = document.getElementById('catalog-upload');
  const catalogDiv = document.getElementById('catalog');
  const catalogFilename = document.getElementById('catalog-filename');
  const recipeUpload = document.getElementById('recipe-upload');
  const recipePreview = document.getElementById('recipe-preview');
  const recipeFilename = document.getElementById('recipe-filename');
  const historySection = document.getElementById('history-section');
  const historyList = document.getElementById('history-list');
  const importBtn = document.getElementById('import-json');
  const importFile = document.getElementById('import-file');
  const clearBtn = document.getElementById('clear-data');
  const exportJsonBtn = document.getElementById('export-json');
  const exportPdfBtn = document.getElementById('export-pdf');

  const { jsPDF } = window.jspdf || {};

  function resetFileNames() {
    recipeFilename.textContent = 'Nenhum';
    dpFilename.textContent = 'Nenhum';
    catalogFilename.textContent = 'Nenhum';
  }

  const signatureCanvas = document.getElementById('signature-canvas');
  const signatureCtx = signatureCanvas.getContext('2d');
  const openSignBtn = document.getElementById('open-signature');
  const clearSignBtn = document.getElementById('clear-signature');
  const closeSignBtn = document.getElementById('close-signature');
  let signatureOpen = false;
  let drawing = false;

  function openSignature() {
    signatureCanvas.classList.remove('hidden');
    openSignBtn.style.display = 'none';
    clearSignBtn.style.display = 'inline-block';
    closeSignBtn.style.display = 'inline-block';
    signatureOpen = true;
  }

  function closeSignature() {
    signatureCanvas.classList.add('hidden');
    openSignBtn.style.display = 'inline-block';
    clearSignBtn.style.display = 'none';
    closeSignBtn.style.display = 'none';
    signatureOpen = false;
    drawing = false;
  }

  function startDraw(x, y) {
    if (!signatureOpen) return;
    drawing = true;
    signatureCtx.beginPath();
    signatureCtx.moveTo(x, y);
  }

  function draw(x, y) {
    if (!drawing || !signatureOpen) return;
    signatureCtx.lineTo(x, y);
    signatureCtx.stroke();
  }

  function stopDraw() {
    drawing = false;
  }

  signatureCanvas.addEventListener('mousedown', e => startDraw(e.offsetX, e.offsetY));
  signatureCanvas.addEventListener('mousemove', e => draw(e.offsetX, e.offsetY));
  signatureCanvas.addEventListener('mouseup', stopDraw);
  signatureCanvas.addEventListener('mouseleave', stopDraw);
  signatureCanvas.addEventListener('touchstart', e => {
    const rect = signatureCanvas.getBoundingClientRect();
    const t = e.touches[0];
    startDraw(t.clientX - rect.left, t.clientY - rect.top);
    e.preventDefault();
  });
  signatureCanvas.addEventListener('touchmove', e => {
    const rect = signatureCanvas.getBoundingClientRect();
    const t = e.touches[0];
    draw(t.clientX - rect.left, t.clientY - rect.top);
    e.preventDefault();
  });
  signatureCanvas.addEventListener('touchend', stopDraw);

  openSignBtn.addEventListener('click', openSignature);
  closeSignBtn.addEventListener('click', closeSignature);
  clearSignBtn.addEventListener('click', () => {
    signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
  });

  closeSignature();

  const dpCanvas = document.getElementById('dp-canvas');
  const dpCtx = dpCanvas.getContext('2d');
  const dpUpload = document.getElementById('dp-upload');
  const dpFilename = document.getElementById('dp-filename');
  const dpResult = document.getElementById('dp-result');
  let dpPoints = [];
  let dpImage = null;
  let dpPhotoSrc = null;

  recipeUpload.addEventListener('change', () => {
    const file = recipeUpload.files[0];
    recipeFilename.textContent = file ? file.name : 'Nenhum';
    if (!file) {
      recipePreview.src = '';
      recipePreview.style.display = 'none';
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      recipePreview.src = e.target.result;
      recipePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  });

  recipePreview.addEventListener('click', () => {
    if (recipePreview.style.display === 'none') return;
    recipePreview.classList.toggle('zoomed');
  });

  function reduceDpCanvas() {
    dpCanvas.style.width = '100%';
    dpCanvas.style.height = 'auto';
    dpCanvas.classList.add('reduced');
  }

  function restoreDpCanvas() {
    if (dpCanvas.dataset.originalWidth) {
      dpCanvas.style.width = dpCanvas.dataset.originalWidth + 'px';
      dpCanvas.style.height = dpCanvas.dataset.originalHeight + 'px';
    }
    dpCanvas.classList.remove('reduced');
  }

  dpUpload.addEventListener('change', () => {
    const file = dpUpload.files[0];
    dpFilename.textContent = file ? file.name : 'Nenhum';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      dpImage = new Image();
      dpImage.onload = () => {
        dpCanvas.width = dpImage.width;
        dpCanvas.height = dpImage.height;
        dpCanvas.dataset.originalWidth = dpImage.width;
        dpCanvas.dataset.originalHeight = dpImage.height;
        restoreDpCanvas();
        dpCtx.drawImage(dpImage, 0, 0);
        dpPoints = [];
        dpResult.textContent = '0';
      };
      dpImage.src = e.target.result;
      dpPhotoSrc = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  dpCanvas.addEventListener('click', e => {
    if (dpCanvas.classList.contains('reduced')) {
      restoreDpCanvas();
      return;
    }
    if (!dpImage) return;
    const rect = dpCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (dpPoints.length >= 2) {
      dpCtx.drawImage(dpImage, 0, 0);
      dpPoints = [];
    }
    dpCtx.fillStyle = 'red';
    dpCtx.beginPath();
    dpCtx.arc(x, y, 4, 0, Math.PI * 2);
    dpCtx.fill();
    dpPoints.push({ x, y });
    if (dpPoints.length === 2) {
      const dx = dpPoints[1].x - dpPoints[0].x;
      const dy = dpPoints[1].y - dpPoints[0].y;
      const distPx = Math.hypot(dx, dy);
      const distMm = (distPx * 0.264583).toFixed(1);
      dpResult.textContent = distMm;
      reduceDpCanvas();
    }
  });


  function addVisitToHistory(visit, index) {
    const li = document.createElement('li');
    li.dataset.index = index;
    const time = document.createElement('strong');
    time.textContent = visit.timestamp;
    li.appendChild(time);
    const name = document.createElement('span');
    name.textContent = ` - ${visit.clientName}`;
    li.appendChild(name);
    if (visit.recipeImage) {
      const img = document.createElement('img');
      img.src = visit.recipeImage;
      img.style.maxWidth = '50px';
      img.style.marginLeft = '0.5rem';
      li.appendChild(img);
    }
    if (visit.dpPhoto) {
      const dpi = document.createElement('img');
      dpi.src = visit.dpPhoto;
      dpi.style.maxWidth = '50px';
      dpi.style.marginLeft = '0.5rem';
      li.appendChild(dpi);
    }
    li.style.cursor = 'pointer';
    historyList.appendChild(li);
  }

  function saveVisit(visit) {
    const visits = JSON.parse(localStorage.getItem('visits') || '[]');
    visits.push(visit);
    localStorage.setItem('visits', JSON.stringify(visits));
    addVisitToHistory(visit, visits.length - 1);
    updateButtons();
    visitForm.reset();
    recipePreview.src = '';
    recipePreview.style.display = 'none';
    resetFileNames();
    dpCtx.clearRect(0, 0, dpCanvas.width, dpCanvas.height);
    dpImage = null;
    dpPhotoSrc = null;
    dpPoints = [];
    dpResult.textContent = '0';
  }

  function loadHistory() {
    historyList.innerHTML = '';
    const visits = JSON.parse(localStorage.getItem('visits') || '[]');
    visits.forEach((v, i) => {
      addVisitToHistory(v, i);
    });
  }

  function download(filename, text) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    link.download = filename;
    link.click();
  }

  function updateButtons() {
    const visits = JSON.parse(localStorage.getItem('visits') || '[]');
    const hasData = visits.length > 0;
    exportJsonBtn.disabled = !hasData;
    exportPdfBtn.disabled = !hasData;
    clearBtn.disabled = !hasData;
  }

  visitSection.classList.remove('hidden');
  catalogSection.classList.remove('hidden');
  historySection.classList.remove('hidden');
  loadHistory();
  updateButtons();
  resetFileNames();

  historyList.addEventListener('click', e => {
    const li = e.target.closest('li');
    if (!li) return;
    const visits = JSON.parse(localStorage.getItem('visits') || '[]');
    const idx = parseInt(li.dataset.index, 10);
    const v = visits[idx];
    if (!v) return;
    document.getElementById('client-name').value = v.clientName || '';
    document.getElementById('client-phone').value = v.clientPhone || '';
    document.getElementById('client-email').value = v.clientEmail || '';
    document.getElementById('client-address').value = v.clientAddress || '';
    document.getElementById('diopters').value = v.diopters || '';
    if (v.recipeImage) {
      recipePreview.src = v.recipeImage;
      recipePreview.style.display = 'block';
      recipeFilename.textContent = 'carregado';
    } else {
      recipePreview.src = '';
      recipePreview.style.display = 'none';
      recipeFilename.textContent = 'Nenhum';
    }
    if (v.dpPhoto) {
      dpImage = new Image();
      dpImage.onload = () => {
        dpCanvas.width = dpImage.width;
        dpCanvas.height = dpImage.height;
        dpCanvas.dataset.originalWidth = dpImage.width;
        dpCanvas.dataset.originalHeight = dpImage.height;
        dpCtx.drawImage(dpImage, 0, 0);
        reduceDpCanvas();
      };
      dpImage.src = v.dpPhoto;
      dpPhotoSrc = v.dpPhoto;
      dpFilename.textContent = 'carregado';
    } else {
      dpCtx.clearRect(0, 0, dpCanvas.width, dpCanvas.height);
      dpImage = null;
      dpPhotoSrc = null;
      dpFilename.textContent = 'Nenhum';
    }
    dpResult.textContent = v.pupilDistance ? v.pupilDistance : '0';
    if (v.signature) {
      const img = new Image();
      img.onload = () => {
        signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
        signatureCtx.drawImage(img, 0, 0);
      };
      img.src = v.signature;
      openSignature();
    } else {
      signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
      closeSignature();
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
      recipeImage: null,
      signature: signatureCanvas.toDataURL(),
      pupilDistance: parseFloat(dpResult.textContent) || null,
      dpPhoto: dpPhotoSrc
    };

    const file = document.getElementById('recipe-upload').files[0];

    const finalize = () => {
      const done = () => {
        saveVisit(visit);
        updateButtons();
        signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
        closeSignature();
        if (dpImage) {
          dpCtx.drawImage(dpImage, 0, 0);
        } else {
          dpCtx.clearRect(0, 0, dpCanvas.width, dpCanvas.height);
        }
        dpPoints = [];
        dpResult.textContent = '0';
      };
      navigator.geolocation.getCurrentPosition(pos => {
        visit.latitude = pos.coords.latitude;
        visit.longitude = pos.coords.longitude;
        done();
      }, done);
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


  importBtn.addEventListener('click', () => importFile.click());

  importFile.addEventListener('change', () => {
    const file = importFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) {
          localStorage.setItem('visits', JSON.stringify(data));
          loadHistory();
          updateButtons();
        } else {
          alert('Arquivo inválido');
        }
      } catch (err) {
        alert('Arquivo inválido');
      }
    };
    reader.readAsText(file);
  });

  clearBtn.addEventListener('click', () => {
    if (confirm('Deseja remover todos os dados?')) {
      localStorage.clear();
      historyList.innerHTML = '';
      recipePreview.src = '';
      recipePreview.style.display = 'none';
      catalogDiv.innerHTML = '';
      resetFileNames();
      dpCtx.clearRect(0, 0, dpCanvas.width, dpCanvas.height);
      signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
      closeSignature();
      dpImage = null;
      dpPhotoSrc = null;
      dpPoints = [];
      dpResult.textContent = '0';
      updateButtons();
    }
  });

  if (jsPDF) {
    document.getElementById('export-pdf').addEventListener('click', () => {
      const visits = JSON.parse(localStorage.getItem('visits') || '[]');
      const doc = new jsPDF();
      const generated = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      visits.forEach((v, idx) => {
        doc.setFontSize(18);
        doc.text('Relatório de Visita', 105, 15, { align: 'center' });
        doc.setFontSize(12);
        let y = 30;
        doc.text(`Nome: ${v.clientName}`, 10, y); y += 7;
        doc.text(`Endereço: ${v.clientAddress}`, 10, y); y += 7;
        doc.text(`Telefone: ${v.clientPhone}`, 10, y); y += 7;
        doc.text(`Email: ${v.clientEmail}`, 10, y); y += 7;
        doc.text(`Data/Hora: ${v.timestamp}`, 10, y); y += 7;
        if (v.latitude && v.longitude) {
          doc.text(`Localização: ${v.latitude.toFixed(5)}, ${v.longitude.toFixed(5)}`, 10, y); y += 7;
        }
        doc.text(`Dioptria: ${v.diopters}`, 10, y); y += 7;
        if (v.pupilDistance) {
          doc.text(`Distância Pupilar: ${v.pupilDistance} mm`, 10, y); y += 7;
        }
        if (v.recipeImage) {
          doc.text('Receita:', 10, y); y += 5;
          doc.addImage(v.recipeImage, 'JPEG', 10, y, 70, 70);
          y += 75;
        }
        if (v.dpPhoto) {
          doc.text('Foto DP:', 110, 30);
          doc.addImage(v.dpPhoto, 'JPEG', 110, 35, 60, 45);
        }
        if (v.signature) {
          doc.text('Assinatura:', 10, y); y += 5;
          doc.addImage(v.signature, 'PNG', 10, y, 60, 30); y += 35;
        }
        doc.setFontSize(10);
        doc.text(`Gerado por SanOptics em ${generated}`, 105, 285, { align: 'center' });
        if (idx < visits.length - 1) doc.addPage();
      });
      doc.save('visitas.pdf');
    });

    const budgetBtn = document.getElementById('pdf-btn');
    if (budgetBtn) {
      budgetBtn.addEventListener('click', () => {
        const doc = new jsPDF();
        doc.text('Orçamento SanOptics', 10, 10);
        doc.text(`Total: ${document.getElementById('total-price').textContent}`, 10, 20);
        doc.save('orcamento.pdf');
      });
    }
  }

  catalogUpload.addEventListener('change', () => {
    const files = Array.from(catalogUpload.files);
    catalogFilename.textContent = files.length ? `${files.length} arquivo(s)` : 'Nenhum';
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
