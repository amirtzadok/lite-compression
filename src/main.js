import { compressGif } from './compress.js'
import { renderGifPreview, renderSize, setLoading, showError } from './ui.js'

// --- State ---
const state = {
  originalBytes: null,   // Uint8Array
  compressedBytes: null, // Uint8Array
  level: 50,             // active compression level
  filename: 'compressed.gif', // original filename
}

// --- DOM refs ---
const dropZone     = document.getElementById('drop-zone')
const fileInput    = document.getElementById('file-input')
const errorMsg     = document.getElementById('error-msg')
const controls     = document.getElementById('controls')
const levelBtns    = document.querySelectorAll('.level-btn')
const origPreview  = document.getElementById('original-preview')
const compPreview  = document.getElementById('compressed-preview')
const origSize     = document.getElementById('original-size')
const compSize     = document.getElementById('compressed-size')
const loadingOvl   = document.getElementById('loading-overlay')
const downloadBtn  = document.getElementById('download-btn')

// --- File validation ---
function validateFile(file) {
  if (!file) return 'No file selected.'
  if (file.type !== 'image/gif' && !file.name.endsWith('.gif')) {
    return 'Only GIF files are supported.'
  }
  if (file.size > 50 * 1024 * 1024) {
    return 'File is too large. Max size is 50 MB.'
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
  const base = file.name.replace(/\.gif$/i, '')
  state.filename = `${base}_s.gif`

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
    state.compressedBytes = await compressGif(state.originalBytes, state.level)
    renderGifPreview(compPreview, state.compressedBytes)
    renderSize(compSize, state.compressedBytes.length, state.originalBytes.length)
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
  const blob = new Blob([state.compressedBytes], { type: 'image/gif' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = state.filename
  a.click()
  URL.revokeObjectURL(url)
}

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

// --- Events: compression level buttons ---
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
