// DOM elements
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const workspace = document.getElementById('workspace');
const preview = document.getElementById('preview');
const imageInfo = document.getElementById('imageInfo');
const changeImageBtn = document.getElementById('changeImageBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resizeWidth = document.getElementById('resizeWidth');
const resizeHeight = document.getElementById('resizeHeight');
const lockAspect = document.getElementById('lockAspect');
const formatSelect = document.getElementById('formatSelect');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const processBtn = document.getElementById('processBtn');
const convertBtn = document.getElementById('convertBtn');
const upscaleBtn = document.getElementById('upscaleBtn');
const applyCropBtn = document.getElementById('applyCropBtn');
const resetCropBtn = document.getElementById('resetCropBtn');
const loading = document.getElementById('loading');
const cropContainer = document.getElementById('cropContainer');
const cropOverlay = document.getElementById('cropOverlay');
const cropRect = document.getElementById('cropRect');
const cropDimensions = document.getElementById('cropDimensions');

// State
let originalWidth = 0;
let originalHeight = 0;
let currentFormat = 'png';

// History stack: each entry is { dataUrl, width, height, size, format }
let history = [];
let historyIndex = -1;

// Crop state
let cropRatio = null;
let crop = { x: 0, y: 0, w: 0, h: 0 };
let dragging = null;
let dragStart = { mx: 0, my: 0, x: 0, y: 0, w: 0, h: 0 };

const MAX_FILE_SIZE = 4 * 1024 * 1024;

// --- History ---

function pushState(entry) {
  // Discard any redo states
  history = history.slice(0, historyIndex + 1);
  history.push(entry);
  historyIndex = history.length - 1;
  applyCurrentState();
}

function applyCurrentState() {
  const state = history[historyIndex];
  if (!state) return;

  preview.src = state.dataUrl;
  originalWidth = state.width;
  originalHeight = state.height;
  currentFormat = state.format || 'png';

  imageInfo.textContent = `${state.width} x ${state.height} | ${state.format.toUpperCase()} | ${formatBytes(state.size)}`;

  updateHistoryButtons();

  // Re-init crop after image loads with new dimensions
  preview.onload = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        originalWidth = preview.naturalWidth;
        originalHeight = preview.naturalHeight;
        if (!cropOverlay.classList.contains('hidden')) {
          initCrop();
        }
      });
    });
  };
}

function updateHistoryButtons() {
  undoBtn.disabled = historyIndex <= 0;
  redoBtn.disabled = historyIndex >= history.length - 1;
}

undoBtn.addEventListener('click', () => {
  if (historyIndex > 0) {
    historyIndex--;
    applyCurrentState();
  }
});

redoBtn.addEventListener('click', () => {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    applyCurrentState();
  }
});

// Get current image as a Blob for sending to the API
async function getCurrentBlob() {
  const state = history[historyIndex];
  if (!state) return null;
  const res = await fetch(state.dataUrl);
  return await res.blob();
}

// --- Tabs ---
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');

    if (tab.dataset.tab === 'crop') {
      cropOverlay.classList.remove('hidden');
      initCrop();
    } else {
      cropOverlay.classList.add('hidden');
    }
  });
});

// --- Drag & drop ---
dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('dragover');
});
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
  if (e.dataTransfer.files.length) loadFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', () => {
  if (fileInput.files.length) loadFile(fileInput.files[0]);
});

changeImageBtn.addEventListener('click', () => {
  fileInput.value = '';
  fileInput.click();
});

function loadFile(file) {
  if (!file.type.startsWith('image/')) return;

  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    const img = new Image();
    img.onload = () => {
      const ext = file.name.split('.').pop().toLowerCase();
      const format = ({ jpg: 'jpg', jpeg: 'jpg', png: 'png', webp: 'webp', avif: 'avif' })[ext] || 'png';

      // Reset history for new file
      history = [];
      historyIndex = -1;

      pushState({
        dataUrl,
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file.size,
        format
      });

      if (file.size > MAX_FILE_SIZE) {
        imageInfo.classList.add('size-warning');
        imageInfo.textContent += ' (exceeds 4MB cloud limit)';
      } else {
        imageInfo.classList.remove('size-warning');
      }

      resizeWidth.value = '';
      resizeHeight.value = '';
      dropzone.classList.add('hidden');
      workspace.classList.remove('hidden');

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          initCrop();
        });
      });
    };
    img.src = dataUrl;
  };
  reader.readAsDataURL(file);
}

// --- Aspect ratio lock ---
resizeWidth.addEventListener('input', () => {
  if (lockAspect.checked && resizeWidth.value && originalWidth) {
    resizeHeight.value = Math.round((resizeWidth.value / originalWidth) * originalHeight);
  }
});
resizeHeight.addEventListener('input', () => {
  if (lockAspect.checked && resizeHeight.value && originalHeight) {
    resizeWidth.value = Math.round((resizeHeight.value / originalHeight) * originalWidth);
  }
});

qualitySlider.addEventListener('input', () => {
  qualityValue.textContent = qualitySlider.value;
});

// --- Crop system ---

function getImageDisplaySize() {
  return { w: preview.clientWidth, h: preview.clientHeight };
}

function getScale() {
  const display = getImageDisplaySize();
  return { sx: originalWidth / display.w, sy: originalHeight / display.h };
}

function initCrop() {
  const { w, h } = getImageDisplaySize();
  if (w === 0 || h === 0) return;
  const margin = 0.1;
  crop = { x: w * margin, y: h * margin, w: w * (1 - 2 * margin), h: h * (1 - 2 * margin) };
  if (cropRatio) applyRatioToCrop();
  cropOverlay.classList.remove('hidden');
  renderCrop();
}

function applyRatioToCrop() {
  if (!cropRatio) return;
  const { w: imgW, h: imgH } = getImageDisplaySize();
  const centerX = crop.x + crop.w / 2;
  const centerY = crop.y + crop.h / 2;

  let newW = crop.w;
  let newH = newW / cropRatio;
  if (newH > imgH * 0.9) { newH = imgH * 0.9; newW = newH * cropRatio; }
  if (newW > imgW * 0.9) { newW = imgW * 0.9; newH = newW / cropRatio; }

  crop.w = newW;
  crop.h = newH;
  crop.x = Math.max(0, Math.min(centerX - newW / 2, imgW - newW));
  crop.y = Math.max(0, Math.min(centerY - newH / 2, imgH - newH));
}

function clampCrop() {
  const { w: imgW, h: imgH } = getImageDisplaySize();
  crop.w = Math.max(10, Math.min(crop.w, imgW));
  crop.h = Math.max(10, Math.min(crop.h, imgH));
  crop.x = Math.max(0, Math.min(crop.x, imgW - crop.w));
  crop.y = Math.max(0, Math.min(crop.y, imgH - crop.h));
}

function renderCrop() {
  clampCrop();
  const { w: imgW, h: imgH } = getImageDisplaySize();

  cropRect.style.left = crop.x + 'px';
  cropRect.style.top = crop.y + 'px';
  cropRect.style.width = crop.w + 'px';
  cropRect.style.height = crop.h + 'px';

  const shades = cropOverlay.querySelectorAll('.crop-shade');
  shades[0].style.height = crop.y + 'px';
  shades[1].style.top = crop.y + 'px';
  shades[1].style.width = crop.x + 'px';
  shades[1].style.height = crop.h + 'px';
  shades[2].style.top = crop.y + 'px';
  shades[2].style.width = (imgW - crop.x - crop.w) + 'px';
  shades[2].style.height = crop.h + 'px';
  shades[3].style.height = (imgH - crop.y - crop.h) + 'px';

  const scale = getScale();
  cropDimensions.textContent = `${Math.round(crop.w * scale.sx)} x ${Math.round(crop.h * scale.sy)}`;
}

// Preset buttons
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const ratio = btn.dataset.ratio;
    cropRatio = ratio === 'free' ? null : (() => { const [w, h] = ratio.split(':').map(Number); return w / h; })();
    if (cropRatio) applyRatioToCrop();
    renderCrop();
  });
});

// Mouse / touch crop interaction
cropOverlay.addEventListener('mousedown', onPointerDown);
cropOverlay.addEventListener('touchstart', onPointerDown, { passive: false });

function getPointerPos(e) {
  const rect = cropContainer.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return { mx: clientX - rect.left, my: clientY - rect.top };
}

function onPointerDown(e) {
  e.preventDefault();
  const { mx, my } = getPointerPos(e);
  const handle = e.target.dataset && e.target.dataset.handle;

  if (handle) {
    dragging = handle;
  } else if (mx >= crop.x && mx <= crop.x + crop.w && my >= crop.y && my <= crop.y + crop.h) {
    dragging = 'move';
  } else {
    return;
  }

  dragStart = { mx, my, x: crop.x, y: crop.y, w: crop.w, h: crop.h };
  document.addEventListener('mousemove', onPointerMove);
  document.addEventListener('mouseup', onPointerUp);
  document.addEventListener('touchmove', onPointerMove, { passive: false });
  document.addEventListener('touchend', onPointerUp);
}

function onPointerMove(e) {
  if (!dragging) return;
  e.preventDefault();
  const { mx, my } = getPointerPos(e);
  const dx = mx - dragStart.mx;
  const dy = my - dragStart.my;
  const { w: imgW, h: imgH } = getImageDisplaySize();

  if (dragging === 'move') {
    crop.x = dragStart.x + dx;
    crop.y = dragStart.y + dy;
  } else {
    let newX = dragStart.x, newY = dragStart.y, newW = dragStart.w, newH = dragStart.h;

    if (dragging.includes('w')) { newW = dragStart.w - dx; newX = dragStart.x + dx; }
    else if (dragging.includes('e')) { newW = dragStart.w + dx; }

    if (dragging.includes('n')) { newH = dragStart.h - dy; newY = dragStart.y + dy; }
    else if (dragging.includes('s')) { newH = dragStart.h + dy; }

    if (newW < 20) { newW = 20; if (dragging.includes('w')) newX = dragStart.x + dragStart.w - 20; }
    if (newH < 20) { newH = 20; if (dragging.includes('n')) newY = dragStart.y + dragStart.h - 20; }

    if (cropRatio) {
      if (dragging === 'n' || dragging === 's') {
        newW = newH * cropRatio; newX = dragStart.x + (dragStart.w - newW) / 2;
      } else if (dragging === 'w' || dragging === 'e') {
        newH = newW / cropRatio; newY = dragStart.y + (dragStart.h - newH) / 2;
      } else {
        const ratioH = newW / cropRatio;
        if (ratioH > newH) { newH = ratioH; if (dragging.includes('n')) newY = dragStart.y + dragStart.h - newH; }
        else { newW = newH * cropRatio; if (dragging.includes('w')) newX = dragStart.x + dragStart.w - newW; }
      }
    }

    if (newX < 0) { newX = 0; if (!cropRatio) newW = dragStart.w + dragStart.x; }
    if (newY < 0) { newY = 0; if (!cropRatio) newH = dragStart.h + dragStart.y; }
    if (newX + newW > imgW) { newW = imgW - newX; if (cropRatio) newH = newW / cropRatio; }
    if (newY + newH > imgH) { newH = imgH - newY; if (cropRatio) newW = newH * cropRatio; }

    crop.x = newX; crop.y = newY; crop.w = newW; crop.h = newH;
  }
  renderCrop();
}

function onPointerUp() {
  dragging = null;
  document.removeEventListener('mousemove', onPointerMove);
  document.removeEventListener('mouseup', onPointerUp);
  document.removeEventListener('touchmove', onPointerMove);
  document.removeEventListener('touchend', onPointerUp);
}

// --- Apply crop ---
applyCropBtn.addEventListener('click', async () => {
  if (historyIndex < 0) return;
  showLoading(true);

  const scale = getScale();
  const cropData = {
    left: Math.max(0, Math.round(crop.x * scale.sx)),
    top: Math.max(0, Math.round(crop.y * scale.sy)),
    width: Math.round(crop.w * scale.sx),
    height: Math.round(crop.h * scale.sy)
  };
  cropData.width = Math.min(cropData.width, originalWidth - cropData.left);
  cropData.height = Math.min(cropData.height, originalHeight - cropData.top);

  const blob = await getCurrentBlob();
  const formData = new FormData();
  formData.append('image', blob, 'image.' + currentFormat);
  formData.append('crop', JSON.stringify(cropData));
  formData.append('format', formatSelect.value);
  formData.append('quality', qualitySlider.value);

  try {
    const res = await fetch('/api/process', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    pushState({ dataUrl: data.data, width: data.width, height: data.height, size: data.size, format: formatSelect.value });
  } catch (err) {
    showError(err.message);
  } finally {
    showLoading(false);
  }
});

resetCropBtn.addEventListener('click', () => {
  cropRatio = null;
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('[data-ratio="free"]').classList.add('active');
  initCrop();
});

// Re-render crop on window resize
window.addEventListener('resize', () => {
  if (!cropOverlay.classList.contains('hidden')) {
    const { w: imgW, h: imgH } = getImageDisplaySize();
    if (imgW && imgH) {
      requestAnimationFrame(() => {
        const { w: newW, h: newH } = getImageDisplaySize();
        if (newW && newH) {
          const rx = newW / (imgW || 1);
          const ry = newH / (imgH || 1);
          crop.x *= rx; crop.y *= ry; crop.w *= rx; crop.h *= ry;
          renderCrop();
        }
      });
    }
  }
});

// --- Resize ---
processBtn.addEventListener('click', async () => {
  if (historyIndex < 0) return;
  showLoading(true);

  const blob = await getCurrentBlob();
  const formData = new FormData();
  formData.append('image', blob, 'image.' + currentFormat);
  if (resizeWidth.value) formData.append('width', resizeWidth.value);
  if (resizeHeight.value) formData.append('height', resizeHeight.value);
  formData.append('format', formatSelect.value);
  formData.append('quality', qualitySlider.value);

  try {
    const res = await fetch('/api/process', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    pushState({ dataUrl: data.data, width: data.width, height: data.height, size: data.size, format: formatSelect.value });
  } catch (err) {
    showError(err.message);
  } finally {
    showLoading(false);
  }
});

// --- Convert ---
convertBtn.addEventListener('click', async () => {
  if (historyIndex < 0) return;
  showLoading(true);

  const blob = await getCurrentBlob();
  const formData = new FormData();
  formData.append('image', blob, 'image.' + currentFormat);
  formData.append('format', formatSelect.value);
  formData.append('quality', qualitySlider.value);

  try {
    const res = await fetch('/api/process', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    pushState({ dataUrl: data.data, width: data.width, height: data.height, size: data.size, format: formatSelect.value });
  } catch (err) {
    showError(err.message);
  } finally {
    showLoading(false);
  }
});

// --- Upscale ---
upscaleBtn.addEventListener('click', async () => {
  if (historyIndex < 0) return;
  showLoading(true);

  const type = document.querySelector('input[name="upscaleType"]:checked').value;
  const blob = await getCurrentBlob();
  const formData = new FormData();
  formData.append('image', blob, 'image.' + currentFormat);
  formData.append('type', type);

  try {
    const res = await fetch('/api/upscale', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const url = data.image && data.image.url;
    if (!url) throw new Error('Unexpected API response');

    // Fetch the upscaled image to get its data URL and dimensions
    const imgRes = await fetch(url);
    const imgBlob = await imgRes.blob();
    const reader = new FileReader();
    const dataUrl = await new Promise((resolve) => {
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(imgBlob);
    });

    const img = new Image();
    const dims = await new Promise((resolve) => {
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.src = dataUrl;
    });

    pushState({ dataUrl, width: dims.width, height: dims.height, size: imgBlob.size, format: 'png' });
  } catch (err) {
    showError(err.message);
  } finally {
    showLoading(false);
  }
});

// --- Download ---
downloadBtn.addEventListener('click', () => {
  if (historyIndex < 0) return;
  const state = history[historyIndex];
  const a = document.createElement('a');
  a.href = state.dataUrl;
  a.download = `image-prepped.${state.format === 'jpg' ? 'jpg' : state.format}`;
  a.click();
});

// --- Helpers ---
function showError(msg) {
  alert('Error: ' + msg);
}

function showLoading(show) {
  loading.classList.toggle('hidden', !show);
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
