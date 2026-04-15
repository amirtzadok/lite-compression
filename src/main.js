import { compressGif, compressPng } from './compress.js'
import { renderGifPreview, renderSize, formatBytes, setLoading, showError } from './ui.js'

// --- State ---
const state = {
  originalBytes: null,   // Uint8Array
  originalFile: null,    // File (needed for PNG re-compression)
  compressedBytes: null, // Uint8Array
  level: 50,
  fileType: 'gif',       // 'gif' | 'png'
  filename: 'compressed.gif',
}

// --- DOM refs ---
const tabBtns       = document.querySelectorAll('.tab-btn')
const dropZone      = document.getElementById('drop-zone')
const fileInput     = document.getElementById('file-input')
const dropTypeLabel = document.getElementById('drop-type-label')
const dropHint      = document.getElementById('drop-hint')
const errorMsg      = document.getElementById('error-msg')
const controls      = document.getElementById('controls')
const levelBtns     = document.querySelectorAll('.level-btn')
const origPreview   = document.getElementById('original-preview')
const compPreview   = document.getElementById('compressed-preview')
const origSize      = document.getElementById('original-size')
const compSize      = document.getElementById('compressed-size')
const loadingOvl    = document.getElementById('loading-overlay')
const downloadBtn   = document.getElementById('download-btn')
const titleEl       = document.querySelector('h1')
const taglineEl     = document.querySelector('.tagline')

// --- Tab switching ---
function switchTab(tab) {
  state.fileType = tab
  // Reset file state
  state.originalBytes = null
  state.originalFile = null
  state.compressedBytes = null
  controls.hidden = true
  showError(errorMsg, null)

  tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tab))

  if (tab === 'gif') {
    titleEl.textContent = 'Lite GIF by AmirTzadok'
    taglineEl.textContent = 'Compress animated GIFs. Colors stay intact.'
    dropTypeLabel.textContent = 'GIF'
    dropHint.textContent = 'Animated GIF · up to 50 MB'
    fileInput.accept = '.gif,image/gif'
  } else {
    titleEl.textContent = 'Lite PNG by AmirTzadok'
    taglineEl.textContent = 'Compress still PNG images. Colors stay intact.'
    dropTypeLabel.textContent = 'PNG'
    dropHint.textContent = 'PNG image · up to 50 MB'
    fileInput.accept = '.png,image/png'
  }
}

// --- File validation ---
function validateFile(file) {
  if (!file) return 'No file selected.'
  if (file.size > 50 * 1024 * 1024) return 'File is too large. Max size is 50 MB.'
  if (state.fileType === 'gif' && file.type !== 'image/gif' && !file.name.endsWith('.gif')) {
    return 'Only GIF files are supported in this tab.'
  }
  if (state.fileType === 'png' && file.type !== 'image/png' && !file.name.endsWith('.png')) {
    return 'Only PNG files are supported in this tab.'
  }
  return null
}

// --- Load file ---
async function loadFile(file) {
  showError(errorMsg, null)
  const err = validateFile(file)
  if (err) { showError(errorMsg, err); return }

  const arrayBuffer = await file.arrayBuffer()
  state.originalBytes = new Uint8Array(arrayBuffer)
  state.originalFile = file

  const ext = state.fileType === 'gif' ? '.gif' : '.png'
  const base = file.name.replace(/\.(gif|png)$/i, '')
  state.filename = `${base}_s${ext}`

  renderGifPreview(origPreview, state.originalBytes)
  renderSize(origSize, state.originalBytes.length)

  controls.hidden = false
  await runCompression()
}

// --- Run compression ---
async function runCompression() {
  if (!state.originalBytes) return

  downloadBtn.hidden = true
  setLoading(loadingOvl, true)
  showError(errorMsg, null)

  try {
    const result = state.fileType === 'gif'
      ? await compressGif(state.originalBytes, state.level)
      : await compressPng(state.originalFile, state.level)

    if (result.length >= state.originalBytes.length) {
      state.compressedBytes = state.originalBytes
      renderGifPreview(compPreview, state.compressedBytes)
      compSize.innerHTML = `${formatBytes(state.originalBytes.length)} <span style="color:#888;font-size:11px">— already optimized, try a stronger level</span>`
    } else {
      state.compressedBytes = result
      renderGifPreview(compPreview, state.compressedBytes)
      renderSize(compSize, state.compressedBytes.length, state.originalBytes.length)
    }
    downloadBtn.hidden = false
  } catch (e) {
    showError(errorMsg, `Compression failed: ${e.message}`)
  } finally {
    setLoading(loadingOvl, false)
  }
}

// --- Download ---
function downloadCompressed() {
  if (!state.compressedBytes) return
  const mime = state.fileType === 'gif' ? 'image/gif' : 'image/png'
  const blob = new Blob([state.compressedBytes], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = state.filename
  a.click()
  URL.revokeObjectURL(url)
}

// --- Events: tabs ---
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab))
})

// --- Events: drop zone ---
dropZone.addEventListener('click', () => fileInput.click())
dropZone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') fileInput.click()
})

// --- Events: file input ---
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0]
  if (file) loadFile(file)
  fileInput.value = ''
})

// --- Events: drag and drop ---
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault()
  dropZone.classList.add('drag-over')
})
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'))
dropZone.addEventListener('drop', (e) => {
  e.preventDefault()
  dropZone.classList.remove('drag-over')
  const file = e.dataTransfer.files[0]
  if (file) loadFile(file)
})

// --- Events: compression level ---
levelBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const newLevel = parseInt(btn.dataset.level, 10)
    if (newLevel === state.level) return
    state.level = newLevel
    levelBtns.forEach((b) => b.classList.toggle('active', b === btn))
    runCompression()
  })
})

// --- Events: download ---
downloadBtn.addEventListener('click', downloadCompressed)
