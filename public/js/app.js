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
  const sharePdfBtn = document.getElementById('share-pdf');
  const savingOverlay = document.getElementById('saving-overlay');
  const visitCount = document.getElementById('visit-count');

  let catalogImages = [];

  // Guarantee that the overlay is hidden until saving begins
  if (savingOverlay) {
    savingOverlay.classList.add('hidden');
  }

  const { jsPDF } = window.jspdf || {};

  function getBrTimestamp() {
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const date = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    return `${date}_${time}`;
  }

  function compressImage(file, maxWidth = 800, quality = 0.8) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(maxWidth / img.width, 1);
          const canvas = document.createElement('canvas');
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function storeVisits(visits) {
    try {
      localStorage.setItem('visits', JSON.stringify(visits));
      return true;
    } catch (e) {
      alert('Espa\u00e7o de armazenamento insuficiente. Exporte ou limpe visitas antigas.');
      return false;
    }
  }

  function resetFileNames() {
    recipeFilename.textContent = 'Nenhum';
    dpFilename.textContent = 'Nenhum';
    catalogFilename.textContent = 'Nenhum';
  }

  function calculateScale(referenceWidthPx) {
    const knownWidthMm = 12; // largura média de uma íris
    return knownWidthMm / referenceWidthPx;
  }

  const signatureCanvas = document.getElementById('signature-canvas');
  const signatureCtx = signatureCanvas.getContext('2d');
  const openSignBtn = document.getElementById('open-signature');
  const clearSignBtn = document.getElementById('clear-signature');
  const closeSignBtn = document.getElementById('close-signature');
  let signatureOpen = false;
  let drawing = false;

  function openSignature() {
    signatureOpen = true;
  }

  function closeSignature() {
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
  const dpHelpBtn = document.getElementById('dp-help-btn');
  const dpHelpModal = document.getElementById('dp-help-modal');
  const dpHelpClose = document.getElementById('dp-help-close');
  let dpPoints = [];
  let dpImage = null;
  let dpPhotoSrc = null;
  let dpScale = 0.264583;

  if (dpHelpModal) dpHelpModal.classList.add('hidden');

  if (dpHelpBtn && dpHelpModal && dpHelpClose) {
    dpHelpBtn.addEventListener('click', () => dpHelpModal.classList.remove('hidden'));
    dpHelpClose.addEventListener('click', () => dpHelpModal.classList.add('hidden'));
    dpHelpModal.addEventListener('click', e => {
      if (e.target === dpHelpModal) dpHelpModal.classList.add('hidden');
    });
  }

  recipeUpload.addEventListener('change', () => {
    const file = recipeUpload.files[0];
    recipeFilename.textContent = file ? file.name : 'Nenhum';
    if (!file) {
      recipePreview.src = '';
      recipePreview.style.display = 'none';
      return;
    }
    compressImage(file).then(dataUrl => {
      recipePreview.src = dataUrl;
      recipePreview.style.display = 'block';
    });
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
    compressImage(file).then(dataUrl => {
      dpImage = new Image();
      dpImage.onload = () => {
        dpCanvas.width = dpImage.width;
        dpCanvas.height = dpImage.height;
        dpCanvas.dataset.originalWidth = dpImage.width;
        dpCanvas.dataset.originalHeight = dpImage.height;
        restoreDpCanvas();
        dpCtx.drawImage(dpImage, 0, 0);
        dpPoints = [];
        dpScale = 0.264583;
        dpResult.textContent = '0';
      };
      dpImage.src = dataUrl;
      dpPhotoSrc = dataUrl;
    });
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
    if (dpPoints.length >= 4) {
      dpCtx.drawImage(dpImage, 0, 0);
      dpPoints = [];
      dpScale = 0.264583;
    }
    dpCtx.fillStyle = 'red';
    dpCtx.beginPath();
    dpCtx.arc(x, y, 4, 0, Math.PI * 2);
    dpCtx.fill();
    dpPoints.push({ x, y });
    if (dpPoints.length === 2) {
      const dx = dpPoints[1].x - dpPoints[0].x;
      const dy = dpPoints[1].y - dpPoints[0].y;
      const refPx = Math.hypot(dx, dy);
      dpScale = calculateScale(refPx);
    } else if (dpPoints.length === 4) {
      const dx = dpPoints[3].x - dpPoints[2].x;
      const dy = dpPoints[3].y - dpPoints[2].y;
      const distPx = Math.hypot(dx, dy);
      const distMm = (distPx * dpScale).toFixed(1);
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
    li.style.cursor = 'pointer';
    historyList.appendChild(li);
  }

  function saveVisit(visit) {
    const visits = JSON.parse(localStorage.getItem('visits') || '[]');
    visits.push(visit);
    if (!storeVisits(visits)) return;
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
    dpScale = 0.264583;
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

  function downloadBlob(filename, blob) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }

  async function shareFile(filename, blob) {
    const file = new File([blob], filename, { type: blob.type });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: filename });
        return;
      } catch (err) {
        console.error('Erro ao compartilhar', err);
      }
    }
    downloadBlob(filename, blob);
  }

  function updateVisitCount() {
    const visits = JSON.parse(localStorage.getItem('visits') || '[]');
    if (visitCount) {
      visitCount.textContent = visits.length;
    }
  }

  function updateButtons() {
    const visits = JSON.parse(localStorage.getItem('visits') || '[]');
    const hasData = visits.length > 0;
    exportJsonBtn.disabled = !hasData;
    sharePdfBtn.disabled = !hasData;
    clearBtn.disabled = !hasData;
    updateVisitCount();
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

    if (Array.isArray(v.catalogImages) && v.catalogImages.length) {
      catalogDiv.innerHTML = '';
      v.catalogImages.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.style.maxWidth = '100px';
        img.style.margin = '0.25rem';
        catalogDiv.appendChild(img);
      });
      catalogImages = v.catalogImages.slice();
      catalogFilename.textContent = `${v.catalogImages.length} arquivo(s)`;
    } else {
      catalogDiv.innerHTML = '';
      catalogImages = [];
      catalogFilename.textContent = 'Nenhum';
    }
    dpCtx.clearRect(0, 0, dpCanvas.width, dpCanvas.height);
    dpImage = null;
    dpPhotoSrc = null;
    dpFilename.textContent = 'Nenhum';
    dpResult.textContent = v.pupilDistance ? v.pupilDistance : '0';
    if (v.signature) {
      const img = new Image();
      img.onload = () => {
        signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
        signatureCtx.drawImage(img, 0, 0);
      };
      img.src = v.signature;
    } else {
      signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    }
    closeSignature();
  });

  visitForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!confirm('Deseja salvar esta visita?')) {
      return;
    }
    savingOverlay.classList.remove('hidden');
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
      pupilDistance: parseFloat(dpResult.textContent) || null
    };

    const file = document.getElementById('recipe-upload').files[0];

    const finalize = () => {
      const done = () => {
        visit.catalogImages = catalogImages.slice();
        saveVisit(visit);
        savingOverlay.classList.add('hidden');
        updateButtons();
        signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
        closeSignature();
        if (dpImage) {
          dpCtx.drawImage(dpImage, 0, 0);
        } else {
          dpCtx.clearRect(0, 0, dpCanvas.width, dpCanvas.height);
        }
        dpPoints = [];
        dpScale = 0.264583;
        dpResult.textContent = '0';
        catalogDiv.innerHTML = '';
        catalogImages = [];
      };
      navigator.geolocation.getCurrentPosition(pos => {
        visit.latitude = pos.coords.latitude;
        visit.longitude = pos.coords.longitude;
        done();
      }, done);
    };

    if (file) {
      compressImage(file).then(dataUrl => {
        visit.recipeImage = dataUrl;
        finalize();
      });
    } else {
      finalize();
    }
  });

  document.getElementById('export-json').addEventListener('click', () => {
    const visits = localStorage.getItem('visits') || '[]';
    const ts = getBrTimestamp();
    download(`Exportado_${ts}.json`, visits);
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
      dpScale = 0.264583;
      dpResult.textContent = '0';
      updateButtons();
    }
  });

  if (jsPDF) {
    if (sharePdfBtn) {
      sharePdfBtn.addEventListener('click', () => {
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
          if (Array.isArray(v.catalogImages) && v.catalogImages.length) {
            doc.text('Catálogo:', 10, y); y += 5;
            v.catalogImages.forEach(imgUrl => {
              doc.addImage(imgUrl, 'JPEG', 10, y, 60, 60);
              y += 65;
            });
          }
          if (v.signature) {
            doc.text('Assinatura:', 10, y); y += 5;
            doc.addImage(v.signature, 'PNG', 10, y, 60, 30); y += 35;
          }
          doc.setFontSize(10);
          doc.text(`Gerado por SanOptics em ${generated}`, 105, 285, { align: 'center' });
          if (idx < visits.length - 1) doc.addPage();
        });
        const ts = getBrTimestamp();
        const pdfBlob = doc.output('blob');
        shareFile(`Visitas_${ts}.pdf`, pdfBlob);
      });
    }

  }

  catalogUpload.addEventListener('change', () => {
    const files = Array.from(catalogUpload.files);
    catalogImages = [];
    catalogDiv.innerHTML = '';
    catalogFilename.textContent = files.length ? `${files.length} arquivo(s)` : 'Nenhum';
    Promise.all(files.map(f => compressImage(f))).then(images => {
      images.forEach(dataUrl => {
        const img = document.createElement('img');
        img.src = dataUrl;
        img.style.maxWidth = '100px';
        img.style.margin = '0.25rem';
        catalogDiv.appendChild(img);
      });
      catalogImages = images;
    });
  });
});
