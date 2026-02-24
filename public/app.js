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
const shopifyBtn = document.getElementById('shopifyBtn');
const resizeWidth = document.getElementById('resizeWidth');
const resizeHeight = document.getElementById('resizeHeight');
const lockAspect = document.getElementById('lockAspect');
const formatSelect = document.getElementById('formatSelect');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const processBtn = document.getElementById('processBtn');
const convertBtn = document.getElementById('convertBtn');
const upscaleBtn = document.getElementById('upscaleBtn');
const vectorizeBtn = document.getElementById('vectorizeBtn');
const applyCropBtn = document.getElementById('applyCropBtn');
const resetCropBtn = document.getElementById('resetCropBtn');
const smartCropBtn = document.getElementById('smartCropBtn');
const loading = document.getElementById('loading');
const loadingMessage = document.getElementById('loadingMessage');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const cropContainer = document.getElementById('cropContainer');
const cropOverlay = document.getElementById('cropOverlay');
const cropRect = document.getElementById('cropRect');
const cropDimensions = document.getElementById('cropDimensions');
const toastContainer = document.getElementById('toastContainer');
const sizeComparison = document.getElementById('sizeComparison');
const presetSelect = document.getElementById('presetSelect');
const savePresetBtn = document.getElementById('savePresetBtn');
const deletePresetBtn = document.getElementById('deletePresetBtn');
const fitMode = document.getElementById('fitMode');
const fitBgGroup = document.getElementById('fitBgGroup');
const fitBgColor = document.getElementById('fitBgColor');
const themeToggle = document.getElementById('themeToggle');
const shortcutsBtn = document.getElementById('shortcutsBtn');
const shortcutsModal = document.getElementById('shortcutsModal');
const shortcutsClose = document.getElementById('shortcutsClose');
const restoreBanner = document.getElementById('restoreBanner');
const restoreBtn = document.getElementById('restoreBtn');
const dismissRestore = document.getElementById('dismissRestore');
const metadataContent = document.getElementById('metadataContent');
const stripMetadata = document.getElementById('stripMetadata');
const filenameTemplate = document.getElementById('filenameTemplate');

// Lightbox elements
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
const lightboxViewport = document.getElementById('lightboxViewport');
const lightboxLayer = document.getElementById('lightboxLayer');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const fitBtn = document.getElementById('fitBtn');
const zoomLabel = document.getElementById('zoomLabel');

// Queue & Upload elements
const uploadBar = document.getElementById('uploadBar');
const addImagesBtn = document.getElementById('addImagesBtn');
const pendingCountEl = document.getElementById('pendingCount');
const workspaceContainer = document.getElementById('workspaceContainer');
const queueSidebar = document.getElementById('queueSidebar');
const queueCountEl = document.getElementById('queueCount');
const queueList = document.getElementById('queueList');
const clearQueueBtn = document.getElementById('clearQueueBtn');
const processQueueBtn = document.getElementById('processQueueBtn');
const downloadZipBtn = document.getElementById('downloadZipBtn');
const queueProgress = document.getElementById('queueProgress');
const queueProgressFill = document.getElementById('queueProgressFill');
const queueProgressText = document.getElementById('queueProgressText');

// Empty state & pending bar elements
const emptyState = document.getElementById('emptyState');
const pendingBar = document.getElementById('pendingBar');
const pendingBarCount = document.getElementById('pendingBarCount');
const pendingList = document.getElementById('pendingList');
const clearPendingBtn = document.getElementById('clearPendingBtn');

// Export panel elements
const exportPanel = document.getElementById('exportPanel');
const modeCustomBtn = document.getElementById('modeCustomBtn');
const modeShopifyBtn = document.getElementById('modeShopifyBtn');
const customSettings = document.getElementById('customSettings');
const shopifySettings = document.getElementById('shopifySettings');
const exportWidth = document.getElementById('exportWidth');
const exportHeight = document.getElementById('exportHeight');
const exportFormat = document.getElementById('exportFormat');
const exportQuality = document.getElementById('exportQuality');
const exportQualityValue = document.getElementById('exportQualityValue');
const addToQueueBtn = document.getElementById('addToQueueBtn');
const updateQueueItemBtn = document.getElementById('updateQueueItemBtn');
const shopifyPresetSquare = document.getElementById('shopifyPresetSquare');
const shopifyPresetWide = document.getElementById('shopifyPresetWide');
const shopifyAutoUpscale = document.getElementById('shopifyAutoUpscale');
const shopifySquareAllBtn = document.getElementById('shopifySquareAllBtn');
const shopifyWideAllBtn = document.getElementById('shopifyWideAllBtn');

// Background elements
const bgColor = document.getElementById('bgColor');
const bgWhiteBtn = document.getElementById('bgWhiteBtn');
const bgBlackBtn = document.getElementById('bgBlackBtn');
const applyBgBtn = document.getElementById('applyBgBtn');

// Watermark elements
const wmText = document.getElementById('wmText');
const wmFontSize = document.getElementById('wmFontSize');
const wmColor = document.getElementById('wmColor');
const wmOpacity = document.getElementById('wmOpacity');
const wmOpacityValue = document.getElementById('wmOpacityValue');
const wmPosition = document.getElementById('wmPosition');
const applyWmBtn = document.getElementById('applyWmBtn');
const wmImageUpload = document.getElementById('wmImageUpload');
const wmImageInput = document.getElementById('wmImageInput');
const wmImageName = document.getElementById('wmImageName');
const wmTextControls = document.getElementById('wmTextControls');
const wmImageControls = document.getElementById('wmImageControls');

// State
let originalWidth = 0;
let originalHeight = 0;
let currentFormat = 'png';
let originalFileName = 'image';
let initialFileSize = 0;

// History stack
let history = [];
let historyIndex = -1;

// Crop state
let cropRatio = null;
let crop = { x: 0, y: 0, w: 0, h: 0 };
let dragging = null;
let dragStart = { mx: 0, my: 0, x: 0, y: 0, w: 0, h: 0 };

// Lightbox zoom/pan state
let zoom = 1, panX = 0, panY = 0;
let isPanning = false, panStart = { x: 0, y: 0, panX: 0, panY: 0 };
const MIN_ZOOM = 0.05, MAX_ZOOM = 10, ZOOM_STEP = 1.15;
let lastPinchDist = 0, lastPinchMid = { x: 0, y: 0 };

// Queue state
// QueueItem: { id, dataUrl, filename, width, height, settings, status, result, error }
// settings: { mode: 'custom'|'shopify', width?, height?, format, quality }
let queue = [];
let pendingFiles = []; // { file: File, url: string (objectURL), name: string }[]
let activeQueueId = null; // Currently reviewing a queue item? (null = fresh image, not yet queued)

// Watermark image state
let wmImageData = null;

// Active abort controller
let activeAbortController = null;

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;

// --- Toast System ---

function showToast(message, type = 'info') {
  const icons = {
    success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
    error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 5000);
}

function showError(msg) { showToast(msg, 'error'); }

// --- Display scale helpers ---

function getDisplayScale() {
  if (!preview.naturalWidth || !preview.clientWidth) return { sx: 1, sy: 1 };
  return {
    sx: preview.clientWidth / preview.naturalWidth,
    sy: preview.clientHeight / preview.naturalHeight
  };
}

// --- Lightbox zoom/pan ---

function applyTransform() {
  lightboxLayer.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
  zoomLabel.textContent = Math.round(zoom * 100) + '%';
}

function fitToViewport() {
  const vw = lightboxViewport.clientWidth;
  const vh = lightboxViewport.clientHeight;
  const iw = lightboxImage.naturalWidth;
  const ih = lightboxImage.naturalHeight;
  if (!iw || !ih || !vw || !vh) return;
  const padding = 20;
  zoom = Math.min((vw - padding * 2) / iw, (vh - padding * 2) / ih, 1);
  panX = (vw - iw * zoom) / 2;
  panY = (vh - ih * zoom) / 2;
  applyTransform();
}

function zoomAtCenter(factor) {
  const vw = lightboxViewport.clientWidth;
  const vh = lightboxViewport.clientHeight;
  zoomAtPoint(factor, vw / 2, vh / 2);
}

function zoomAtPoint(factor, cx, cy) {
  const imgX = (cx - panX) / zoom;
  const imgY = (cy - panY) / zoom;
  zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * factor));
  panX = cx - imgX * zoom;
  panY = cy - imgY * zoom;
  applyTransform();
}

// --- History ---

function pushState(entry) {
  history = history.slice(0, historyIndex + 1);
  history.push(entry);
  historyIndex = history.length - 1;
  applyCurrentState();
  saveSession();
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
  updateSizeComparison(state.size);

  preview.onload = () => {
    if (isCropTab()) initCrop();
  };

  if (isLightboxOpen()) {
    lightboxImage.src = state.dataUrl;
    lightboxImage.onload = () => fitToViewport();
  }
}

function updateHistoryButtons() {
  undoBtn.disabled = historyIndex <= 0;
  redoBtn.disabled = historyIndex >= history.length - 1;
}

function updateSizeComparison(currentSize) {
  if (!initialFileSize || historyIndex <= 0) {
    sizeComparison.classList.add('hidden');
    return;
  }
  const pct = Math.round((1 - currentSize / initialFileSize) * 100);
  const direction = pct >= 0 ? 'smaller' : 'larger';
  sizeComparison.textContent = `Original: ${formatBytes(initialFileSize)} → Current: ${formatBytes(currentSize)} (${Math.abs(pct)}% ${direction})`;
  sizeComparison.classList.remove('hidden');
}

undoBtn.addEventListener('click', () => { if (historyIndex > 0) { historyIndex--; applyCurrentState(); } });
redoBtn.addEventListener('click', () => { if (historyIndex < history.length - 1) { historyIndex++; applyCurrentState(); } });

async function getCurrentBlob() {
  const state = history[historyIndex];
  if (!state) return null;
  const res = await fetch(state.dataUrl);
  return await res.blob();
}

const MAX_DIRECT_SIZE = 4 * 1024 * 1024;

async function uploadToBlob(file) {
  const pathname = file.name || 'image.png';
  const tokenRes = await fetch('/api/blob-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'blob.generate-client-token',
      payload: { pathname, callbackUrl: `${window.location.origin}/api/blob-upload` }
    })
  });
  if (!tokenRes.ok) {
    const err = await tokenRes.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to get upload token');
  }
  const { clientToken } = await tokenRes.json();
  const uploadRes = await fetch(`https://blob.vercel-storage.com/${pathname}`, {
    method: 'PUT',
    headers: {
      'authorization': `Bearer ${clientToken}`,
      'x-api-version': '7',
      'content-type': file.type || 'image/png',
    },
    body: file
  });
  if (!uploadRes.ok) throw new Error('Blob upload failed');
  const blob = await uploadRes.json();
  return blob.url;
}

async function apiRequest(url, formData, retryCount = 1) {
  const imageBlob = formData.get('image');
  if (imageBlob && imageBlob.size > MAX_DIRECT_SIZE) {
    const blobUrl = await uploadToBlob(imageBlob);
    formData.delete('image');
    formData.append('blobUrl', blobUrl);
  }

  activeAbortController = new AbortController();
  const signal = activeAbortController.signal;

  let lastError;
  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      const res = await fetch(url, { method: 'POST', body: formData, signal });
      if (!res.ok) {
        let msg;
        try { const d = await res.json(); msg = d.error; } catch (e) { msg = await res.text().catch(() => ''); }
        throw new Error(msg || `Server error (${res.status})`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      activeAbortController = null;
      return data;
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      lastError = err;
      if (attempt < retryCount) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }
  activeAbortController = null;
  throw lastError;
}

// --- Input Validation ---

function validateResizeInput(width, height) {
  if (width && (width < 1 || width > 16384)) {
    showToast('Width must be between 1 and 16384', 'error');
    return false;
  }
  if (height && (height < 1 || height > 16384)) {
    showToast('Height must be between 1 and 16384', 'error');
    return false;
  }
  return true;
}

function validateQuality(val) {
  const q = parseInt(val);
  if (isNaN(q) || q < 1 || q > 100) {
    showToast('Quality must be between 1 and 100', 'error');
    return false;
  }
  return true;
}

// --- Tabs ---
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');

    if (tab.dataset.tab === 'crop') {
      initCrop();
    } else {
      cropOverlay.classList.add('hidden');
    }
  });
});

// --- Drag & drop ---
dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } });
dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
  const files = Array.from(e.dataTransfer.files).filter(f => {
    if (!f.type.startsWith('image/')) { showToast(`Skipped non-image: ${f.name}`, 'error'); return false; }
    if (f.size > MAX_UPLOAD_SIZE) { showToast(`File too large: ${f.name}`, 'error'); return false; }
    return true;
  });
  if (files.length >= 1) {
    handleNewFiles(files);
  }
});

fileInput.addEventListener('change', () => {
  const files = Array.from(fileInput.files);
  if (files.length >= 1) {
    handleNewFiles(files);
  }
  fileInput.value = '';
});

changeImageBtn.addEventListener('click', () => {
  clearAll();
  fileInput.click();
});

// Add Images button in upload bar
addImagesBtn.addEventListener('click', () => fileInput.click());

// --- Load from URL ---

const dropzoneUrlForm = document.getElementById('dropzoneUrlForm');
const dropzoneUrlInput = document.getElementById('dropzoneUrlInput');
const uploadBarUrlForm = document.getElementById('uploadBarUrlForm');
const uploadBarUrlInput = document.getElementById('uploadBarUrlInput');
const pasteUrlBtn = document.getElementById('pasteUrlBtn');

async function loadFromUrl(url) {
  url = url.trim();
  if (!url) return;
  try {
    new URL(url);
  } catch {
    showToast('Invalid URL format', 'error');
    return;
  }
  showLoading(true, 'Fetching image from URL...');
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      throw new Error('URL does not point to an image');
    }
    const blob = await res.blob();
    if (blob.size > MAX_UPLOAD_SIZE) {
      throw new Error('Image exceeds 50MB limit');
    }
    // Extract filename from URL path
    const pathname = new URL(url).pathname;
    const urlFilename = pathname.split('/').pop() || 'image';
    // Determine extension from content-type
    const extMap = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/avif': 'avif', 'image/gif': 'gif' };
    const ext = extMap[contentType.split(';')[0]] || 'png';
    const filename = urlFilename.includes('.') ? urlFilename : `${urlFilename}.${ext}`;
    const file = new File([blob], filename, { type: blob.type || `image/${ext}` });
    handleNewFiles([file]);
    showToast('Image loaded from URL', 'success');
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      showToast('Could not fetch URL (CORS or network error)', 'error');
    } else {
      showToast(err.message, 'error');
    }
  } finally {
    showLoading(false);
  }
}

dropzoneUrlForm.addEventListener('submit', (e) => {
  e.preventDefault();
  loadFromUrl(dropzoneUrlInput.value);
  dropzoneUrlInput.value = '';
});

uploadBarUrlForm.addEventListener('submit', (e) => {
  e.preventDefault();
  loadFromUrl(uploadBarUrlInput.value);
  uploadBarUrlInput.value = '';
  uploadBarUrlForm.classList.add('hidden');
  pasteUrlBtn.classList.remove('hidden');
});

pasteUrlBtn.addEventListener('click', () => {
  pasteUrlBtn.classList.add('hidden');
  uploadBarUrlForm.classList.remove('hidden');
  uploadBarUrlInput.focus();
});

// Hide inline URL input when clicking outside
document.addEventListener('click', (e) => {
  if (!uploadBarUrlForm.classList.contains('hidden') &&
      !uploadBarUrlForm.contains(e.target) &&
      e.target !== pasteUrlBtn) {
    uploadBarUrlForm.classList.add('hidden');
    pasteUrlBtn.classList.remove('hidden');
  }
});

// Allow dropping images onto workspace/upload bar area
workspaceContainer.addEventListener('dragover', (e) => { e.preventDefault(); });
workspaceContainer.addEventListener('drop', (e) => {
  e.preventDefault();
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/') && f.size <= MAX_UPLOAD_SIZE);
  if (files.length) handleNewFiles(files);
});

uploadBar.addEventListener('dragover', (e) => { e.preventDefault(); });
uploadBar.addEventListener('drop', (e) => {
  e.preventDefault();
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/') && f.size <= MAX_UPLOAD_SIZE);
  if (files.length) handleNewFiles(files);
});

function loadFile(file, showWorkspace = true) {
  if (!file.type.startsWith('image/')) {
    showToast('Only image files are supported', 'error');
    return;
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    showToast('File exceeds 50MB limit', 'error');
    return;
  }
  originalFileName = file.name.replace(/\.[^.]+$/, '') || 'image';
  initialFileSize = file.size;
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    const img = new Image();
    img.onload = () => {
      const ext = file.name.split('.').pop().toLowerCase();
      const format = ({ jpg: 'jpg', jpeg: 'jpg', png: 'png', webp: 'webp', avif: 'avif' })[ext] || 'png';
      history = [];
      historyIndex = -1;
      activeQueueId = null; // Fresh image, not from queue
      hideWorkspaceEmptyState();
      pushState({ dataUrl, width: img.naturalWidth, height: img.naturalHeight, size: file.size, format });
      if (file.size > MAX_FILE_SIZE) {
        imageInfo.classList.add('size-warning');
        imageInfo.textContent += ' (exceeds 4MB cloud limit)';
      } else {
        imageInfo.classList.remove('size-warning');
      }
      resizeWidth.value = '';
      resizeHeight.value = '';
      if (showWorkspace) {
        showWorkspaceUI();
      }
      loadMetadata(dataUrl);
      updatePendingCount();
      updateQueueButtons();
    };
    img.src = dataUrl;
  };
  reader.readAsDataURL(file);
}

// --- New File Handling ---

function makePendingEntry(file) {
  return { file, url: URL.createObjectURL(file), name: file.name.replace(/\.[^.]+$/, '') || 'image' };
}

function handleNewFiles(files) {
  if (files.length === 1 && historyIndex < 0 && pendingFiles.length === 0) {
    // First single image - load directly
    loadFile(files[0]);
  } else if (historyIndex < 0 && pendingFiles.length === 0) {
    // Multiple images dropped initially - load first, queue rest as pending
    pendingFiles = files.slice(1).map(makePendingEntry);
    loadFile(files[0]);
  } else {
    // Already working - add all to pending queue
    pendingFiles.push(...files.map(makePendingEntry));
    updatePendingCount();
    showToast(`Added ${files.length} image${files.length > 1 ? 's' : ''} to waiting list`, 'success');
  }
}

function showWorkspaceUI() {
  dropzone.classList.add('hidden');
  uploadBar.classList.remove('hidden');
  workspaceContainer.classList.remove('hidden');
  updateQueueSidebarVisibility();
}

function updatePendingCount() {
  if (pendingFiles.length > 0) {
    pendingCountEl.textContent = `${pendingFiles.length} more waiting`;
    pendingCountEl.classList.remove('hidden');
  } else {
    pendingCountEl.classList.add('hidden');
  }
  renderPendingBar();
}

function loadNextPendingFile() {
  if (pendingFiles.length > 0) {
    const next = pendingFiles.shift();
    URL.revokeObjectURL(next.url);
    loadFile(next.file, false);
    updatePendingCount();
  } else {
    // No more pending - show prompt or clear workspace
    showWorkspaceEmptyState();
  }
}

function showWorkspaceEmptyState() {
  // Clear current image state but keep queue visible
  if (queue.length > 0) {
    history = [];
    historyIndex = -1;
    activeQueueId = null;
    preview.src = '';
    // Show empty state, hide preview elements
    emptyState.classList.remove('hidden');
    cropContainer.classList.add('hidden');
    document.querySelector('.preview-info').classList.add('hidden');
    sizeComparison.classList.add('hidden');
  }
}

function hideWorkspaceEmptyState() {
  emptyState.classList.add('hidden');
  cropContainer.classList.remove('hidden');
  document.querySelector('.preview-info').classList.remove('hidden');
}

// --- Pending Bar ---

function renderPendingBar() {
  if (pendingFiles.length === 0) {
    pendingBar.classList.add('hidden');
    document.body.classList.remove('has-pending');
    return;
  }
  pendingBar.classList.remove('hidden');
  document.body.classList.add('has-pending');
  pendingBarCount.textContent = pendingFiles.length;

  pendingList.innerHTML = pendingFiles.map((entry, idx) => {
    return `<div class="queue-item" data-pending-idx="${idx}">
      <img src="${entry.url}" alt="${entry.name}" class="queue-item-thumb">
      <div class="queue-item-info">
        <div class="queue-item-name">${entry.name}</div>
      </div>
      <button class="queue-item-remove" data-pending-remove="${idx}" title="Remove">&times;</button>
    </div>`;
  }).join('');
}

function clearPendingFiles() {
  pendingFiles.forEach(entry => URL.revokeObjectURL(entry.url));
  pendingFiles = [];
  updatePendingCount();
}

// Pending bar click handlers
pendingList.addEventListener('click', (e) => {
  const removeBtn = e.target.closest('[data-pending-remove]');
  if (removeBtn) {
    e.stopPropagation();
    const idx = parseInt(removeBtn.dataset.pendingRemove);
    if (idx >= 0 && idx < pendingFiles.length) {
      URL.revokeObjectURL(pendingFiles[idx].url);
      pendingFiles.splice(idx, 1);
      updatePendingCount();
    }
  }
});

clearPendingBtn.addEventListener('click', clearPendingFiles);

// --- EXIF Metadata ---

function loadMetadata(dataUrl) {
  const img = new Image();
  img.onload = () => {
    const info = [];
    info.push({ label: 'Dimensions', value: `${img.naturalWidth} x ${img.naturalHeight}` });
    info.push({ label: 'Aspect Ratio', value: getAspectRatioLabel(img.naturalWidth, img.naturalHeight) });

    const canvas = document.createElement('canvas');
    canvas.width = 1; canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, 1, 1);
    const pixel = ctx.getImageData(0, 0, 1, 1).data;
    info.push({ label: 'Has Alpha', value: pixel[3] < 255 ? 'Yes' : 'Likely No' });

    let html = '<div class="metadata-grid">';
    info.forEach(i => {
      html += `<span class="meta-label">${i.label}</span><span class="meta-value">${i.value}</span>`;
    });
    html += '</div>';
    metadataContent.innerHTML = html;
  };
  img.src = dataUrl;
}

function getAspectRatioLabel(w, h) {
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  const d = gcd(w, h);
  return `${w / d}:${h / d}`;
}

// --- Aspect ratio lock ---
resizeWidth.addEventListener('input', () => {
  if (lockAspect.checked && resizeWidth.value && originalWidth)
    resizeHeight.value = Math.round((resizeWidth.value / originalWidth) * originalHeight);
});
resizeHeight.addEventListener('input', () => {
  if (lockAspect.checked && resizeHeight.value && originalHeight)
    resizeWidth.value = Math.round((resizeHeight.value / originalHeight) * originalWidth);
});
qualitySlider.addEventListener('input', () => { qualityValue.textContent = qualitySlider.value; });

// --- Fit mode toggle ---
fitMode.addEventListener('change', () => {
  fitBgGroup.style.display = fitMode.value === 'contain' ? '' : 'none';
});

// --- Crop system ---

function isCropTab() {
  const activeTab = document.querySelector('.tab.active');
  return activeTab && activeTab.dataset.tab === 'crop';
}

function initCrop() {
  const w = preview.naturalWidth;
  const h = preview.naturalHeight;
  if (!w || !h) return;
  const margin = 0.1;
  crop = { x: w * margin, y: h * margin, w: w * (1 - 2 * margin), h: h * (1 - 2 * margin) };
  if (cropRatio) applyRatioToCrop();
  cropOverlay.classList.remove('hidden');
  renderCrop();
}

function applyRatioToCrop() {
  if (!cropRatio) return;
  const imgW = preview.naturalWidth, imgH = preview.naturalHeight;
  const centerX = crop.x + crop.w / 2;
  const centerY = crop.y + crop.h / 2;
  let newW = crop.w, newH = newW / cropRatio;
  if (newH > imgH * 0.9) { newH = imgH * 0.9; newW = newH * cropRatio; }
  if (newW > imgW * 0.9) { newW = imgW * 0.9; newH = newW / cropRatio; }
  crop.w = newW; crop.h = newH;
  crop.x = Math.max(0, Math.min(centerX - newW / 2, imgW - newW));
  crop.y = Math.max(0, Math.min(centerY - newH / 2, imgH - newH));
}

function clampCrop() {
  const imgW = preview.naturalWidth, imgH = preview.naturalHeight;
  crop.w = Math.max(10, Math.min(crop.w, imgW));
  crop.h = Math.max(10, Math.min(crop.h, imgH));
  crop.x = Math.max(0, Math.min(crop.x, imgW - crop.w));
  crop.y = Math.max(0, Math.min(crop.y, imgH - crop.h));
}

function renderCrop() {
  clampCrop();
  const { sx, sy } = getDisplayScale();
  const imgW = preview.clientWidth, imgH = preview.clientHeight;

  const dx = crop.x * sx, dy = crop.y * sy;
  const dw = crop.w * sx, dh = crop.h * sy;

  cropRect.style.left = dx + 'px';
  cropRect.style.top = dy + 'px';
  cropRect.style.width = dw + 'px';
  cropRect.style.height = dh + 'px';

  const shades = cropOverlay.querySelectorAll('.crop-shade');
  shades[0].style.height = dy + 'px';
  shades[1].style.top = dy + 'px';
  shades[1].style.width = dx + 'px';
  shades[1].style.height = dh + 'px';
  shades[2].style.top = dy + 'px';
  shades[2].style.width = (imgW - dx - dw) + 'px';
  shades[2].style.height = dh + 'px';
  shades[3].style.height = (imgH - dy - dh) + 'px';

  cropDimensions.textContent = Math.round(crop.w) + ' x ' + Math.round(crop.h);
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

// --- Crop pointer handling ---

function getCropPointerPos(e) {
  const rect = preview.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const { sx, sy } = getDisplayScale();
  const mx = (clientX - rect.left) / sx;
  const my = (clientY - rect.top) / sy;
  return { mx, my };
}

function isOnHandle(e) {
  return e.target.dataset && e.target.dataset.handle;
}

function isInsideCropRect(mx, my) {
  return mx >= crop.x && mx <= crop.x + crop.w && my >= crop.y && my <= crop.y + crop.h;
}

cropContainer.addEventListener('mousedown', onCropPointerDown);
cropContainer.addEventListener('touchstart', onCropPointerDown, { passive: false });

function onCropPointerDown(e) {
  if (!isCropTab()) return;
  const { mx, my } = getCropPointerPos(e);

  const handle = isOnHandle(e);
  if (handle) {
    e.preventDefault();
    dragging = handle;
    dragStart = { mx, my, x: crop.x, y: crop.y, w: crop.w, h: crop.h };
    document.addEventListener('mousemove', onCropPointerMove);
    document.addEventListener('mouseup', onCropPointerUp);
    document.addEventListener('touchmove', onCropPointerMove, { passive: false });
    document.addEventListener('touchend', onCropPointerUp);
    return;
  }

  if (isInsideCropRect(mx, my)) {
    e.preventDefault();
    dragging = 'move';
    dragStart = { mx, my, x: crop.x, y: crop.y, w: crop.w, h: crop.h };
    document.addEventListener('mousemove', onCropPointerMove);
    document.addEventListener('mouseup', onCropPointerUp);
    document.addEventListener('touchmove', onCropPointerMove, { passive: false });
    document.addEventListener('touchend', onCropPointerUp);
  }
}

function onCropPointerMove(e) {
  if (!dragging) return;
  e.preventDefault();
  const { mx, my } = getCropPointerPos(e);
  const dx = mx - dragStart.mx;
  const dy = my - dragStart.my;
  const imgW = preview.naturalWidth, imgH = preview.naturalHeight;

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
      if (dragging === 'n' || dragging === 's') { newW = newH * cropRatio; newX = dragStart.x + (dragStart.w - newW) / 2; }
      else if (dragging === 'w' || dragging === 'e') { newH = newW / cropRatio; newY = dragStart.y + (dragStart.h - newH) / 2; }
      else {
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

function onCropPointerUp() {
  dragging = null;
  document.removeEventListener('mousemove', onCropPointerMove);
  document.removeEventListener('mouseup', onCropPointerUp);
  document.removeEventListener('touchmove', onCropPointerMove);
  document.removeEventListener('touchend', onCropPointerUp);
}

window.addEventListener('resize', () => {
  if (isCropTab() && !cropOverlay.classList.contains('hidden')) renderCrop();
  if (isLightboxOpen()) fitToViewport();
});

// --- Lightbox ---

function isLightboxOpen() {
  return !lightbox.classList.contains('hidden');
}

function openLightbox() {
  lightboxImage.src = preview.src;
  lightbox.classList.remove('hidden');
  if (lightboxImage.complete && lightboxImage.naturalWidth) {
    fitToViewport();
  } else {
    lightboxImage.onload = () => fitToViewport();
  }
  trapFocus(lightbox);
}

function closeLightbox() {
  lightbox.classList.add('hidden');
  releaseFocus();
}

preview.addEventListener('click', (e) => {
  if (isCropTab() && !cropOverlay.classList.contains('hidden')) return;
  openLightbox();
});

lightboxCloseBtn.addEventListener('click', closeLightbox);
lightbox.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);

// --- Lightbox pointer handling ---

lightboxViewport.addEventListener('mousedown', onLightboxPointerDown);
lightboxViewport.addEventListener('touchstart', onLightboxPointerDown, { passive: false });

function onLightboxPointerDown(e) {
  if (e.target.closest('.zoom-controls')) return;
  e.preventDefault();
  isPanning = true;
  lightboxViewport.classList.add('panning');
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  panStart = { x: clientX, y: clientY, panX, panY };
  document.addEventListener('mousemove', onLightboxPanMove);
  document.addEventListener('mouseup', onLightboxPanEnd);
  document.addEventListener('touchmove', onLightboxPanMove, { passive: false });
  document.addEventListener('touchend', onLightboxPanEnd);
}

function onLightboxPanMove(e) {
  if (!isPanning) return;
  e.preventDefault();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  panX = panStart.panX + (clientX - panStart.x);
  panY = panStart.panY + (clientY - panStart.y);
  applyTransform();
}

function onLightboxPanEnd() {
  isPanning = false;
  lightboxViewport.classList.remove('panning');
  document.removeEventListener('mousemove', onLightboxPanMove);
  document.removeEventListener('mouseup', onLightboxPanEnd);
  document.removeEventListener('touchmove', onLightboxPanMove);
  document.removeEventListener('touchend', onLightboxPanEnd);
}

lightboxViewport.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect = lightboxViewport.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
  zoomAtPoint(factor, cx, cy);
}, { passive: false });

lightboxViewport.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    e.preventDefault();
    isPanning = false;
    const t0 = e.touches[0], t1 = e.touches[1];
    lastPinchDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
    lastPinchMid = { x: (t0.clientX + t1.clientX) / 2, y: (t0.clientY + t1.clientY) / 2 };
  }
}, { passive: false });

lightboxViewport.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const t0 = e.touches[0], t1 = e.touches[1];
    const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
    const mid = { x: (t0.clientX + t1.clientX) / 2, y: (t0.clientY + t1.clientY) / 2 };
    const rect = lightboxViewport.getBoundingClientRect();
    zoomAtPoint(dist / lastPinchDist, mid.x - rect.left, mid.y - rect.top);
    panX += mid.x - lastPinchMid.x;
    panY += mid.y - lastPinchMid.y;
    applyTransform();
    lastPinchDist = dist;
    lastPinchMid = mid;
  }
}, { passive: false });

zoomInBtn.addEventListener('click', () => zoomAtCenter(ZOOM_STEP));
zoomOutBtn.addEventListener('click', () => zoomAtCenter(1 / ZOOM_STEP));
fitBtn.addEventListener('click', () => fitToViewport());
document.getElementById('actualSizeBtn').addEventListener('click', () => {
  const vw = lightboxViewport.clientWidth;
  const vh = lightboxViewport.clientHeight;
  const iw = lightboxImage.naturalWidth;
  const ih = lightboxImage.naturalHeight;
  if (!iw || !ih) return;
  zoom = 1;
  panX = (vw - iw) / 2;
  panY = (vh - ih) / 2;
  applyTransform();
});

// --- Apply crop ---
applyCropBtn.addEventListener('click', async () => {
  if (historyIndex < 0) return;
  showLoading(true, 'Applying crop...');
  const cropData = {
    left: Math.max(0, Math.round(crop.x)),
    top: Math.max(0, Math.round(crop.y)),
    width: Math.round(crop.w),
    height: Math.round(crop.h)
  };
  cropData.width = Math.min(cropData.width, originalWidth - cropData.left);
  cropData.height = Math.min(cropData.height, originalHeight - cropData.top);
  const blob = await getCurrentBlob();
  const formData = new FormData();
  formData.append('image', blob, 'image.' + currentFormat);
  formData.append('crop', JSON.stringify(cropData));
  formData.append('format', currentFormat);
  formData.append('quality', qualitySlider.value);
  if (stripMetadata.checked) formData.append('stripMetadata', 'true');
  try {
    const data = await apiRequest('/api/process', formData);
    pushState({ dataUrl: data.data, width: data.width, height: data.height, size: data.size, format: currentFormat });
    showToast('Crop applied', 'success');
  } catch (err) { showError(err.message); }
  finally { showLoading(false); }
});

// Smart crop
smartCropBtn.addEventListener('click', async () => {
  if (historyIndex < 0) return;
  showLoading(true, 'Analyzing image...');
  const blob = await getCurrentBlob();
  const formData = new FormData();
  formData.append('image', blob, 'image.' + currentFormat);
  formData.append('smartCrop', 'true');
  formData.append('format', currentFormat);
  formData.append('quality', qualitySlider.value);
  try {
    const data = await apiRequest('/api/shopify-export', formData);
    pushState({ dataUrl: data.data, width: data.width, height: data.height, size: data.size, format: 'jpg' });
    showToast('Smart crop applied (entropy-based)', 'success');
  } catch (err) { showError(err.message); }
  finally { showLoading(false); }
});

resetCropBtn.addEventListener('click', () => {
  cropRatio = null;
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('[data-ratio="free"]').classList.add('active');
  initCrop();
});

// --- Resize ---
processBtn.addEventListener('click', async () => {
  if (historyIndex < 0) return;
  const w = resizeWidth.value ? parseInt(resizeWidth.value) : null;
  const h = resizeHeight.value ? parseInt(resizeHeight.value) : null;
  if (!validateResizeInput(w, h)) return;
  if (!validateQuality(qualitySlider.value)) return;
  showLoading(true, `Resizing to ${w || 'auto'}x${h || 'auto'}...`);
  const blob = await getCurrentBlob();
  const formData = new FormData();
  formData.append('image', blob, 'image.' + currentFormat);
  if (w) formData.append('width', w);
  if (h) formData.append('height', h);
  formData.append('format', formatSelect.value);
  formData.append('quality', qualitySlider.value);
  if (fitMode.value !== 'fill') formData.append('fit', fitMode.value);
  if (fitMode.value === 'contain') formData.append('background', fitBgColor.value);
  if (stripMetadata.checked) formData.append('stripMetadata', 'true');
  try {
    const data = await apiRequest('/api/process', formData);
    pushState({ dataUrl: data.data, width: data.width, height: data.height, size: data.size, format: formatSelect.value });
    showToast('Resize complete', 'success');
  } catch (err) { showError(err.message); }
  finally { showLoading(false); }
});

// --- Convert ---
convertBtn.addEventListener('click', async () => {
  if (historyIndex < 0) return;
  if (!validateQuality(qualitySlider.value)) return;
  showLoading(true, `Converting to ${formatSelect.value.toUpperCase()}...`);
  const blob = await getCurrentBlob();
  const formData = new FormData();
  formData.append('image', blob, 'image.' + currentFormat);
  formData.append('format', formatSelect.value);
  formData.append('quality', qualitySlider.value);
  if (stripMetadata.checked) formData.append('stripMetadata', 'true');
  try {
    const data = await apiRequest('/api/process', formData);
    pushState({ dataUrl: data.data, width: data.width, height: data.height, size: data.size, format: formatSelect.value });
    showToast('Conversion complete', 'success');
  } catch (err) { showError(err.message); }
  finally { showLoading(false); }
});

// --- Upscale ---
upscaleBtn.addEventListener('click', async () => {
  if (historyIndex < 0) return;
  showLoading(true, 'Upscaling with AI...');
  const type = document.querySelector('input[name="upscaleType"]:checked').value;
  const blob = await getCurrentBlob();
  const formData = new FormData();
  formData.append('image', blob, 'image.' + currentFormat);
  formData.append('type', type);
  try {
    const data = await apiRequest('/api/upscale', formData);
    const url = data.image && data.image.url;
    if (!url) throw new Error('Unexpected API response');
    const imgRes = await fetch(url);
    const imgBlob = await imgRes.blob();
    const reader = new FileReader();
    const dataUrl = await new Promise((resolve) => { reader.onload = () => resolve(reader.result); reader.readAsDataURL(imgBlob); });
    const img = new Image();
    const dims = await new Promise((resolve) => { img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight }); img.src = dataUrl; });
    pushState({ dataUrl, width: dims.width, height: dims.height, size: imgBlob.size, format: 'png' });
    showToast('Upscale complete', 'success');
  } catch (err) { showError(err.message); }
  finally { showLoading(false); }
});

// --- Vectorize ---
vectorizeBtn.addEventListener('click', async () => {
  if (historyIndex < 0) return;
  showLoading(true, 'Vectorizing with AI...');
  const blob = await getCurrentBlob();
  const formData = new FormData();
  formData.append('image', blob, 'image.' + currentFormat);
  try {
    const data = await apiRequest('/api/vectorize', formData);
    pushState({ dataUrl: data.data, width: data.width, height: data.height, size: data.size, format: 'svg' });
    showToast('Vectorize complete', 'success');
  } catch (err) { showError(err.message); }
  finally { showLoading(false); }
});

// --- Background ---
bgWhiteBtn.addEventListener('click', () => { bgColor.value = '#ffffff'; });
bgBlackBtn.addEventListener('click', () => { bgColor.value = '#000000'; });
applyBgBtn.addEventListener('click', async () => {
  if (historyIndex < 0) return;
  showLoading(true, 'Flattening background...');
  const blob = await getCurrentBlob();
  const formData = new FormData();
  formData.append('image', blob, 'image.' + currentFormat);
  formData.append('color', bgColor.value);
  formData.append('format', currentFormat);
  formData.append('quality', qualitySlider.value);
  try {
    const data = await apiRequest('/api/background', formData);
    pushState({ dataUrl: data.data, width: data.width, height: data.height, size: data.size, format: currentFormat });
    showToast('Background flattened', 'success');
  } catch (err) { showError(err.message); }
  finally { showLoading(false); }
});

// --- Watermark ---
wmOpacity.addEventListener('input', () => { wmOpacityValue.textContent = wmOpacity.value; });

document.querySelectorAll('input[name="wmType"]').forEach(radio => {
  radio.addEventListener('change', () => {
    wmTextControls.classList.toggle('hidden', radio.value !== 'text');
    wmImageControls.classList.toggle('hidden', radio.value !== 'image');
  });
});

wmImageUpload.addEventListener('click', () => wmImageInput.click());
wmImageInput.addEventListener('change', () => {
  const file = wmImageInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    wmImageData = reader.result;
    wmImageName.textContent = file.name;
  };
  reader.readAsDataURL(file);
});

applyWmBtn.addEventListener('click', async () => {
  if (historyIndex < 0) return;
  const wmType = document.querySelector('input[name="wmType"]:checked').value;
  const watermark = {
    type: wmType,
    opacity: parseInt(wmOpacity.value) / 100,
    position: wmPosition.value
  };
  if (wmType === 'text') {
    if (!wmText.value.trim()) { showToast('Enter watermark text', 'error'); return; }
    watermark.text = wmText.value.trim();
    watermark.fontSize = parseInt(wmFontSize.value) || 24;
    watermark.color = wmColor.value;
  } else {
    if (!wmImageData) { showToast('Upload a watermark image', 'error'); return; }
    watermark.imageData = wmImageData;
    watermark.scale = 0.2;
  }
  showLoading(true, 'Applying watermark...');
  const blob = await getCurrentBlob();
  const formData = new FormData();
  formData.append('image', blob, 'image.' + currentFormat);
  formData.append('watermark', JSON.stringify(watermark));
  formData.append('format', currentFormat);
  formData.append('quality', qualitySlider.value);
  try {
    const data = await apiRequest('/api/process', formData);
    pushState({ dataUrl: data.data, width: data.width, height: data.height, size: data.size, format: currentFormat });
    showToast('Watermark applied', 'success');
    // Save settings to localStorage
    localStorage.setItem('ip_watermark', JSON.stringify({ text: wmText.value, fontSize: wmFontSize.value, color: wmColor.value, opacity: wmOpacity.value, position: wmPosition.value }));
  } catch (err) { showError(err.message); }
  finally { showLoading(false); }
});

// Load saved watermark settings
const savedWm = localStorage.getItem('ip_watermark');
if (savedWm) {
  try {
    const wm = JSON.parse(savedWm);
    if (wm.text) wmText.value = wm.text;
    if (wm.fontSize) wmFontSize.value = wm.fontSize;
    if (wm.color) wmColor.value = wm.color;
    if (wm.opacity) { wmOpacity.value = wm.opacity; wmOpacityValue.textContent = wm.opacity; }
    if (wm.position) wmPosition.value = wm.position;
  } catch (e) {}
}

// --- Shopify Auto-Prep ---
const shopifyModal = document.getElementById('shopifyModal');
const shopifyModalClose = document.getElementById('shopifyModalClose');
const shopifyPreviewImg = document.getElementById('shopifyPreviewImg');
const shopifyAdjustments = document.getElementById('shopifyAdjustments');
const shopifyInfoEl = document.getElementById('shopifyInfo');
const shopifyDownloadBtn = document.getElementById('shopifyDownloadBtn');
const shopifyApplyBtn = document.getElementById('shopifyApplyBtn');
let shopifyResult = null;

function showShopifyModal(data, adjustments) {
  shopifyResult = data;
  shopifyPreviewImg.src = data.data;
  shopifyAdjustments.innerHTML = adjustments
    .map(a => `<div class="shopify-adjust-item"><span class="check">&#10003;</span><span>${a}</span></div>`)
    .join('');
  shopifyInfoEl.innerHTML = `
    <div class="shopify-info-item"><span class="label">Dimensions</span><span class="value">${data.width} &times; ${data.height}px</span></div>
    <div class="shopify-info-item"><span class="label">Format</span><span class="value">Progressive JPEG</span></div>
    <div class="shopify-info-item"><span class="label">Quality</span><span class="value">82</span></div>
    <div class="shopify-info-item"><span class="label">File Size</span><span class="value">${formatBytes(data.size)}</span></div>
  `;
  shopifyModal.classList.remove('hidden');
  trapFocus(shopifyModal);
}

function closeShopifyModal() {
  shopifyModal.classList.add('hidden');
  shopifyResult = null;
  releaseFocus();
}

shopifyModalClose.addEventListener('click', closeShopifyModal);
shopifyModal.querySelector('.shopify-modal-backdrop').addEventListener('click', closeShopifyModal);

shopifyDownloadBtn.addEventListener('click', () => {
  if (!shopifyResult) return;
  const a = document.createElement('a');
  a.href = shopifyResult.data;
  a.download = 'shopify-product.jpg';
  a.click();
});

shopifyApplyBtn.addEventListener('click', () => {
  if (!shopifyResult) return;
  pushState({ dataUrl: shopifyResult.data, width: shopifyResult.width, height: shopifyResult.height, size: shopifyResult.size, format: 'jpg' });
  closeShopifyModal();
});

shopifyBtn.addEventListener('click', async () => {
  if (historyIndex < 0) return;
  showLoading(true, 'Optimizing for Shopify...');

  try {
    const blob = await getCurrentBlob();
    const formData = new FormData();
    formData.append('image', blob, 'image.' + currentFormat);
    formData.append('autoUpscale', 'true');
    const data = await apiRequest('/api/shopify-export', formData);

    const adjustments = [
      'Resized to 2048 &times; 2048px',
      'Converted to progressive JPEG (quality 82)',
      'Color space: sRGB',
      'White background padding applied'
    ];
    if (data.upscaled) {
      adjustments.unshift('AI upscaled (source was smaller than target)');
    }

    showShopifyModal(data, adjustments);
  } catch (err) {
    showError(err.message);
  } finally {
    showLoading(false);
  }
});

// --- Download ---
downloadBtn.addEventListener('click', downloadCurrent);

function downloadCurrent() {
  if (historyIndex < 0) return;
  const state = history[historyIndex];
  const a = document.createElement('a');
  a.href = state.dataUrl;
  a.download = buildFilename(state);
  a.click();
}

function buildFilename(state) {
  let template = filenameTemplate.value || 'image-prepped-{n}.{format}';
  localStorage.setItem('ip_filename_template', template);
  const format = state.format === 'jpg' ? 'jpg' : state.format;
  return template
    .replace('{n}', originalFileName)
    .replace('{w}', state.width)
    .replace('{h}', state.height)
    .replace('{format}', format)
    .replace('{date}', new Date().toISOString().split('T')[0]);
}

// Load saved filename template
const savedTemplate = localStorage.getItem('ip_filename_template');
if (savedTemplate) filenameTemplate.value = savedTemplate;

// --- Dimension Presets ---

function loadCustomPresets() {
  const saved = JSON.parse(localStorage.getItem('ip_custom_presets') || '[]');
  // Remove old custom options
  presetSelect.querySelectorAll('[data-custom]').forEach(o => o.remove());
  saved.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.value;
    opt.textContent = p.label;
    opt.dataset.custom = 'true';
    presetSelect.appendChild(opt);
  });
}

loadCustomPresets();

presetSelect.addEventListener('change', () => {
  const val = presetSelect.value;
  if (!val) {
    deletePresetBtn.classList.add('hidden');
    return;
  }
  const [w, h] = val.split('x').map(Number);
  resizeWidth.value = w;
  resizeHeight.value = h;
  const isCustom = presetSelect.selectedOptions[0]?.dataset.custom;
  deletePresetBtn.classList.toggle('hidden', !isCustom);
});

savePresetBtn.addEventListener('click', () => {
  const w = resizeWidth.value;
  const h = resizeHeight.value;
  if (!w || !h) { showToast('Enter width and height first', 'error'); return; }
  const label = prompt('Preset name:', `Custom (${w}x${h})`);
  if (!label) return;
  const saved = JSON.parse(localStorage.getItem('ip_custom_presets') || '[]');
  saved.push({ value: `${w}x${h}`, label });
  localStorage.setItem('ip_custom_presets', JSON.stringify(saved));
  loadCustomPresets();
  showToast('Preset saved', 'success');
});

deletePresetBtn.addEventListener('click', () => {
  const val = presetSelect.value;
  const saved = JSON.parse(localStorage.getItem('ip_custom_presets') || '[]');
  const filtered = saved.filter(p => p.value !== val);
  localStorage.setItem('ip_custom_presets', JSON.stringify(filtered));
  loadCustomPresets();
  presetSelect.value = '';
  deletePresetBtn.classList.add('hidden');
  showToast('Preset deleted', 'success');
});

// --- Theme Toggle ---

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('ip_theme', theme);
  document.getElementById('themeIconDark').classList.toggle('hidden', theme === 'dark');
  document.getElementById('themeIconLight').classList.toggle('hidden', theme === 'light');
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  setTheme(current === 'dark' ? 'light' : 'dark');
});

// Initialize theme
const savedTheme = localStorage.getItem('ip_theme') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
setTheme(savedTheme);

// --- Keyboard Shortcuts ---

shortcutsBtn.addEventListener('click', () => {
  shortcutsModal.classList.remove('hidden');
  trapFocus(shortcutsModal);
});
shortcutsClose.addEventListener('click', () => { shortcutsModal.classList.add('hidden'); releaseFocus(); });
shortcutsModal.querySelector('.shortcuts-backdrop').addEventListener('click', () => { shortcutsModal.classList.add('hidden'); releaseFocus(); });

document.addEventListener('keydown', (e) => {
  // Skip if user is typing in an input
  const tag = document.activeElement.tagName.toLowerCase();
  const isInput = tag === 'input' || tag === 'textarea' || tag === 'select';

  // Escape always closes modals
  if (e.key === 'Escape') {
    if (!shortcutsModal.classList.contains('hidden')) { shortcutsModal.classList.add('hidden'); releaseFocus(); return; }
    if (!shopifyModal.classList.contains('hidden')) { closeShopifyModal(); return; }
    if (isLightboxOpen()) { closeLightbox(); return; }
  }

  if (isInput) return;

  const mod = e.metaKey || e.ctrlKey;

  // Ctrl/Cmd+Z: Undo
  if (mod && !e.shiftKey && e.key === 'z') {
    e.preventDefault();
    if (historyIndex > 0) { historyIndex--; applyCurrentState(); }
    return;
  }
  // Ctrl/Cmd+Shift+Z: Redo
  if (mod && e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
    e.preventDefault();
    if (historyIndex < history.length - 1) { historyIndex++; applyCurrentState(); }
    return;
  }
  // Ctrl/Cmd+S: Download
  if (mod && e.key === 's') {
    e.preventDefault();
    downloadCurrent();
    return;
  }
  // Ctrl/Cmd+Enter: Apply current operation
  if (mod && e.key === 'Enter') {
    e.preventDefault();
    const activeTab = document.querySelector('.tab.active');
    if (!activeTab) return;
    switch (activeTab.dataset.tab) {
      case 'crop': applyCropBtn.click(); break;
      case 'resize': processBtn.click(); break;
      case 'format': convertBtn.click(); break;
      case 'upscale': upscaleBtn.click(); break;
      case 'vectorize': vectorizeBtn.click(); break;
    }
    return;
  }

  // Number keys: switch tabs
  if (e.key >= '1' && e.key <= '5' && !mod) {
    const tabs = ['crop', 'resize', 'format', 'upscale', 'vectorize'];
    const idx = parseInt(e.key) - 1;
    const tabBtn = document.querySelector(`[data-tab="${tabs[idx]}"]`);
    if (tabBtn) tabBtn.click();
    return;
  }

  // ?: Show shortcuts
  if (e.key === '?' || (e.shiftKey && e.key === '/')) {
    shortcutsModal.classList.toggle('hidden');
  }
});

// --- Focus Trap ---

let focusTrapElement = null;
let previousFocus = null;

function trapFocus(el) {
  previousFocus = document.activeElement;
  focusTrapElement = el;
  const focusable = el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable.length) focusable[0].focus();
  document.addEventListener('keydown', handleFocusTrap);
}

function releaseFocus() {
  document.removeEventListener('keydown', handleFocusTrap);
  focusTrapElement = null;
  if (previousFocus) previousFocus.focus();
}

function handleFocusTrap(e) {
  if (!focusTrapElement || e.key !== 'Tab') return;
  const focusable = focusTrapElement.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
  } else {
    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
}

// --- Session Persistence ---

function saveSession() {
  if (historyIndex < 0) return;
  const state = history[historyIndex];
  const meta = {
    historyIndex,
    width: state.width,
    height: state.height,
    format: state.format,
    size: state.size,
    timestamp: Date.now(),
    originalFileName,
    initialFileSize
  };
  localStorage.setItem('ip_session_meta', JSON.stringify(meta));

  // Store image data (only current state for simplicity)
  if (state.dataUrl.length < 2 * 1024 * 1024) {
    localStorage.setItem('ip_session_image', state.dataUrl);
    deleteFromIDB();
  } else {
    localStorage.removeItem('ip_session_image');
    saveToIDB(state.dataUrl);
  }
}

function checkSessionRestore() {
  const meta = localStorage.getItem('ip_session_meta');
  if (!meta) return;
  try {
    const parsed = JSON.parse(meta);
    // Expire after 24 hours
    if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
      clearSession();
      return;
    }
    restoreBanner.classList.remove('hidden');
  } catch (e) { clearSession(); }
}

async function restoreSession() {
  const meta = JSON.parse(localStorage.getItem('ip_session_meta'));
  let dataUrl = localStorage.getItem('ip_session_image');
  if (!dataUrl) {
    dataUrl = await loadFromIDB();
  }
  if (!dataUrl || !meta) {
    showToast('Could not restore session', 'error');
    clearSession();
    return;
  }
  originalFileName = meta.originalFileName || 'image';
  initialFileSize = meta.initialFileSize || 0;
  history = [];
  historyIndex = -1;
  pushState({ dataUrl, width: meta.width, height: meta.height, size: meta.size, format: meta.format });
  dropzone.classList.add('hidden');
  workspace.classList.remove('hidden');
  restoreBanner.classList.add('hidden');
  showToast('Session restored', 'success');
}

function clearSession() {
  localStorage.removeItem('ip_session_meta');
  localStorage.removeItem('ip_session_image');
  deleteFromIDB();
  restoreBanner.classList.add('hidden');
}

// IndexedDB helpers
function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('ImagePrepper', 1);
    req.onupgradeneeded = () => { req.result.createObjectStore('images'); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveToIDB(dataUrl) {
  try {
    const db = await openIDB();
    const tx = db.transaction('images', 'readwrite');
    tx.objectStore('images').put(dataUrl, 'current');
  } catch (e) {}
}

async function loadFromIDB() {
  try {
    const db = await openIDB();
    return await new Promise((resolve) => {
      const tx = db.transaction('images', 'readonly');
      const req = tx.objectStore('images').get('current');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
  } catch (e) { return null; }
}

async function deleteFromIDB() {
  try {
    const db = await openIDB();
    const tx = db.transaction('images', 'readwrite');
    tx.objectStore('images').delete('current');
  } catch (e) {}
}

restoreBtn.addEventListener('click', restoreSession);
dismissRestore.addEventListener('click', clearSession);

// Check for session on load
checkSessionRestore();

// --- Queue System ---

let queueIdCounter = 0;

function generateQueueId() {
  return `q_${++queueIdCounter}_${Date.now()}`;
}

function captureExportSettings() {
  const mode = modeShopifyBtn.classList.contains('active') ? 'shopify' : 'custom';
  if (mode === 'shopify') {
    const preset = shopifyPresetWide.classList.contains('active') ? '3:2' : 'square';
    return { mode: 'shopify', preset, autoUpscale: shopifyAutoUpscale.checked };
  }
  return {
    mode: 'custom',
    width: exportWidth.value ? parseInt(exportWidth.value) : null,
    height: exportHeight.value ? parseInt(exportHeight.value) : null,
    format: exportFormat.value,
    quality: parseInt(exportQuality.value)
  };
}

function getShopifyDimensions(preset) {
  if (preset === '3:2') return { targetWidth: 1500, targetHeight: 1000 };
  return { targetWidth: 2048, targetHeight: 2048 };
}

function addToQueue() {
  if (historyIndex < 0) {
    showToast('No image to add', 'error');
    return;
  }

  const state = history[historyIndex];
  const settings = captureExportSettings();

  // Validate custom settings
  if (settings.mode === 'custom') {
    if (settings.width && !validateResizeInput(settings.width, null)) return;
    if (settings.height && !validateResizeInput(null, settings.height)) return;
  }

  const item = {
    id: generateQueueId(),
    dataUrl: state.dataUrl,
    filename: originalFileName,
    width: state.width,
    height: state.height,
    settings,
    status: 'pending',
    result: null,
    error: null
  };

  queue.push(item);
  renderQueueSidebar();
  updateQueueSidebarVisibility();
  showToast(`Added "${originalFileName}" to queue`, 'success');

  // Load next pending file or clear workspace
  loadNextPendingFile();
}

function updateQueueItem(id, newSettings) {
  const item = queue.find(q => q.id === id);
  if (!item) return;
  item.settings = newSettings;
  renderQueueSidebar();
  showToast('Settings updated', 'success');
}

function removeQueueItem(id) {
  const idx = queue.findIndex(q => q.id === id);
  if (idx === -1) return;
  queue.splice(idx, 1);
  renderQueueSidebar();
  updateQueueSidebarVisibility();
  if (activeQueueId === id) {
    activeQueueId = null;
    loadNextPendingFile();
  }
}

function loadQueueItemForReview(id) {
  const item = queue.find(q => q.id === id);
  if (!item) return;

  activeQueueId = id;
  originalFileName = item.filename;

  // Load the image into preview
  const img = new Image();
  img.onload = () => {
    hideWorkspaceEmptyState();
    history = [];
    historyIndex = -1;
    pushState({
      dataUrl: item.dataUrl,
      width: item.width,
      height: item.height,
      size: item.dataUrl.length,
      format: item.settings.mode === 'shopify' ? 'jpg' : (item.settings.format || 'png')
    });

    // Apply the item's settings to the export panel
    if (item.settings.mode === 'shopify') {
      setExportMode('shopify');
      // Restore preset selection
      if (item.settings.preset === '3:2') {
        shopifyPresetWide.classList.add('active');
        shopifyPresetSquare.classList.remove('active');
      } else {
        shopifyPresetSquare.classList.add('active');
        shopifyPresetWide.classList.remove('active');
      }
      shopifyAutoUpscale.checked = item.settings.autoUpscale !== false;
    } else {
      setExportMode('custom');
      exportWidth.value = item.settings.width || '';
      exportHeight.value = item.settings.height || '';
      exportFormat.value = item.settings.format || 'jpg';
      exportQuality.value = item.settings.quality || 80;
      exportQualityValue.textContent = item.settings.quality || 80;
    }

    // Show update button instead of add button
    addToQueueBtn.classList.add('hidden');
    updateQueueItemBtn.classList.remove('hidden');
  };
  img.src = item.dataUrl;

  renderQueueSidebar();
}

function renderQueueSidebar() {
  queueCountEl.textContent = queue.length;

  const doneCount = queue.filter(q => q.status === 'done').length;
  downloadZipBtn.classList.toggle('hidden', doneCount === 0);
  processQueueBtn.disabled = queue.length === 0 || queue.every(q => q.status === 'done');

  queueList.innerHTML = queue.map(item => {
    const statusText = item.status === 'done' ? '✓ Done'
      : item.status === 'error' ? '✕ Error'
      : item.status === 'processing' ? '⏳ Processing'
      : '○ Pending';

    const settingsText = item.settings.mode === 'shopify'
      ? `Shopify ${item.settings.preset === '3:2' ? '1500×1000' : '2048×2048'}${item.settings.autoUpscale !== false ? ' ↑' : ''}`
      : `Custom ${item.settings.width || 'auto'}×${item.settings.height || 'auto'}`;

    return `<div class="queue-item ${item.status}${item.id === activeQueueId ? ' active' : ''}" data-id="${item.id}">
      <img src="${item.dataUrl}" alt="${item.filename}" class="queue-item-thumb">
      <div class="queue-item-info">
        <div class="queue-item-name">${item.filename}</div>
        <div class="queue-item-settings">${settingsText}</div>
        <div class="queue-item-status">${statusText}</div>
      </div>
      <button class="queue-item-remove" data-remove="${item.id}" title="Remove">&times;</button>
    </div>`;
  }).join('');
}

function updateQueueSidebarVisibility() {
  if (queue.length > 0) {
    queueSidebar.classList.remove('hidden');
    document.body.classList.add('has-queue');
  } else {
    queueSidebar.classList.add('hidden');
    document.body.classList.remove('has-queue');
  }
}

function updateQueueButtons() {
  // Toggle between Add to Queue and Update Settings buttons
  if (activeQueueId) {
    addToQueueBtn.classList.add('hidden');
    updateQueueItemBtn.classList.remove('hidden');
  } else {
    addToQueueBtn.classList.remove('hidden');
    updateQueueItemBtn.classList.add('hidden');
  }
}

// Queue sidebar click handlers
queueList.addEventListener('click', (e) => {
  const removeBtn = e.target.closest('[data-remove]');
  if (removeBtn) {
    e.stopPropagation();
    removeQueueItem(removeBtn.dataset.remove);
    return;
  }
  const item = e.target.closest('.queue-item');
  if (item) {
    loadQueueItemForReview(item.dataset.id);
  }
});

clearQueueBtn.addEventListener('click', () => {
  queue = [];
  renderQueueSidebar();
  updateQueueSidebarVisibility();
  activeQueueId = null;
  updateQueueButtons();
});

// Export panel mode toggle
modeCustomBtn.addEventListener('click', () => setExportMode('custom'));
modeShopifyBtn.addEventListener('click', () => setExportMode('shopify'));

function setExportMode(mode) {
  if (mode === 'shopify') {
    modeShopifyBtn.classList.add('active');
    modeCustomBtn.classList.remove('active');
    customSettings.classList.add('hidden');
    shopifySettings.classList.remove('hidden');
  } else {
    modeCustomBtn.classList.add('active');
    modeShopifyBtn.classList.remove('active');
    customSettings.classList.remove('hidden');
    shopifySettings.classList.add('hidden');
  }
}

// Shopify preset toggle
shopifyPresetSquare.addEventListener('click', () => {
  shopifyPresetSquare.classList.add('active');
  shopifyPresetWide.classList.remove('active');
});
shopifyPresetWide.addEventListener('click', () => {
  shopifyPresetWide.classList.add('active');
  shopifyPresetSquare.classList.remove('active');
});

// Shopify quick-action buttons
shopifySquareAllBtn.addEventListener('click', () => applyShopifyPresetToAll('square'));
shopifyWideAllBtn.addEventListener('click', () => applyShopifyPresetToAll('3:2'));

function applyShopifyPresetToAll(preset) {
  const pendingItems = queue.filter(q => q.status === 'pending');
  if (!pendingItems.length) {
    showToast('No pending items in queue', 'info');
    return;
  }
  pendingItems.forEach(item => {
    item.settings = { mode: 'shopify', preset, autoUpscale: true };
  });
  renderQueueSidebar();
  showToast(`Applied Shopify ${preset === '3:2' ? '1500×1000' : '2048×2048'} to ${pendingItems.length} items`, 'success');
  processQueue();
}

// Export quality slider
exportQuality.addEventListener('input', () => {
  exportQualityValue.textContent = exportQuality.value;
});

// Add to Queue button
addToQueueBtn.addEventListener('click', addToQueue);

// Update Queue Item button
updateQueueItemBtn.addEventListener('click', () => {
  if (!activeQueueId) return;
  const settings = captureExportSettings();
  updateQueueItem(activeQueueId, settings);
  activeQueueId = null;
  updateQueueButtons();
  loadNextPendingFile();
});

// Process Queue button
processQueueBtn.addEventListener('click', processQueue);

async function processQueue() {
  const pendingItems = queue.filter(q => q.status === 'pending');
  if (!pendingItems.length) {
    showToast('No pending items to process', 'info');
    return;
  }

  showLoading(true, 'Processing queue...');
  queueProgress.classList.remove('hidden');
  let successCount = 0;
  let totalToProcess = pendingItems.length;

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    if (item.status !== 'pending') continue;

    item.status = 'processing';
    renderQueueSidebar();

    const processedSoFar = queue.filter(q => q.status === 'done' || q.status === 'error').length;
    queueProgressFill.style.width = `${(processedSoFar / queue.length) * 100}%`;
    queueProgressText.textContent = `${processedSoFar} / ${queue.length}`;
    updateProgress(processedSoFar + 1, queue.length, `Processing ${processedSoFar + 1}/${queue.length}...`);

    try {
      const result = await processQueueItem(item);
      item.status = 'done';
      item.result = result;
      successCount++;
    } catch (err) {
      item.status = 'error';
      item.error = err.message;
      showToast(`Failed: ${item.filename} - ${err.message}`, 'error');
    }
    renderQueueSidebar();
  }

  queueProgressFill.style.width = '100%';
  queueProgressText.textContent = `${queue.length} / ${queue.length}`;

  showLoading(false);
  showToast(`Queue complete: ${successCount}/${totalToProcess} processed`, successCount > 0 ? 'success' : 'error');
}

async function processQueueItem(item) {
  const res = await fetch(item.dataUrl);
  const blob = await res.blob();
  const formData = new FormData();
  formData.append('image', blob, item.filename + '.png');

  if (item.settings.mode === 'shopify') {
    const dims = getShopifyDimensions(item.settings.preset || 'square');
    formData.append('targetWidth', dims.targetWidth);
    formData.append('targetHeight', dims.targetHeight);
    if (item.settings.autoUpscale !== false) formData.append('autoUpscale', 'true');
    return await apiRequest('/api/shopify-export', formData, 1);
  } else {
    // Use regular process endpoint with custom settings
    if (item.settings.width) formData.append('width', item.settings.width);
    if (item.settings.height) formData.append('height', item.settings.height);
    formData.append('format', item.settings.format || 'jpg');
    formData.append('quality', item.settings.quality || 80);
    return await apiRequest('/api/process', formData, 1);
  }
}

// Download ZIP button
downloadZipBtn.addEventListener('click', async () => {
  const results = queue.filter(q => q.result);
  if (!results.length) return;
  showLoading(true, 'Creating ZIP...');
  try {
    if (!window.JSZip) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    const zip = new JSZip();
    const usedNames = {};
    for (const item of results) {
      const ext = item.result.format === 'jpeg' ? 'jpg' : (item.result.format || 'jpg');
      let baseName = item.filename;
      let name = baseName + '.' + ext;
      if (usedNames[name]) {
        usedNames[name]++;
        name = baseName + '-' + usedNames[name] + '.' + ext;
      } else {
        usedNames[name] = 1;
      }
      const base64 = item.result.data.split(',')[1];
      zip.file(name, base64, { base64: true });
    }
    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = 'image-prepper-queue.zip';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('ZIP downloaded', 'success');
  } catch (err) {
    showError('ZIP creation failed: ' + err.message);
  } finally {
    showLoading(false);
  }
});

function clearAll() {
  queue = [];
  // Revoke all pending object URLs before clearing
  pendingFiles.forEach(entry => { if (entry.url) URL.revokeObjectURL(entry.url); });
  pendingFiles = [];
  activeQueueId = null;
  history = [];
  historyIndex = -1;
  uploadBar.classList.add('hidden');
  workspaceContainer.classList.add('hidden');
  queueSidebar.classList.add('hidden');
  document.body.classList.remove('has-queue');
  document.body.classList.remove('has-pending');
  pendingBar.classList.add('hidden');
  dropzone.classList.remove('hidden');
  hideWorkspaceEmptyState();
  updatePendingCount();
  renderQueueSidebar();
}

// --- Helpers ---
function showLoading(show, message) {
  loading.classList.toggle('hidden', !show);
  if (show) {
    loadingMessage.textContent = message || 'Processing...';
    progressBar.classList.add('hidden');
    progressFill.style.width = '0%';
    if (showLoading._timeout) clearTimeout(showLoading._timeout);
    showLoading._timeout = setTimeout(() => {
      if (!loading.classList.contains('hidden')) {
        loadingMessage.textContent += ' (taking longer than expected)';
      }
    }, 30000);
  } else {
    if (showLoading._timeout) clearTimeout(showLoading._timeout);
  }
}

function updateProgress(step, total, msg) {
  progressBar.classList.remove('hidden');
  progressFill.style.width = `${(step / total) * 100}%`;
  if (msg) loadingMessage.textContent = msg;
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
