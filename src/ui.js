/**
 * Formats a byte count into a human-readable string.
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Calculates the % size reduction between original and compressed.
 * @param {number} original
 * @param {number} compressed
 * @returns {number} integer percentage (0-100)
 */
export function calcReduction(original, compressed) {
  return Math.round(((original - compressed) / original) * 100)
}

/**
 * Renders a Uint8Array GIF as an <img> src via a Blob URL.
 * Revokes any previous Blob URL to avoid memory leaks.
 * @param {HTMLImageElement} imgEl
 * @param {Uint8Array} bytes
 */
export function renderGifPreview(imgEl, bytes) {
  if (imgEl.src && imgEl.src.startsWith('blob:')) {
    URL.revokeObjectURL(imgEl.src)
  }
  const blob = new Blob([bytes], { type: 'image/gif' })
  imgEl.src = URL.createObjectURL(blob)
}

/**
 * Updates a size display element.
 * @param {HTMLElement} el
 * @param {number} bytes
 * @param {number|null} originalBytes - if provided, shows reduction %
 */
export function renderSize(el, bytes, originalBytes = null) {
  let html = formatBytes(bytes)
  if (originalBytes !== null && originalBytes > bytes) {
    const pct = calcReduction(originalBytes, bytes)
    html += ` <span class="reduction">−${pct}%</span>`
  }
  el.innerHTML = html
}

/**
 * Shows or hides the loading overlay.
 * @param {HTMLElement} overlayEl
 * @param {boolean} visible
 */
export function setLoading(overlayEl, visible) {
  overlayEl.hidden = !visible
}

/**
 * Shows an error message. Pass null to hide.
 * @param {HTMLElement} el
 * @param {string|null} message
 */
export function showError(el, message) {
  if (message) {
    el.textContent = message
    el.hidden = false
  } else {
    el.hidden = true
    el.textContent = ''
  }
}
