import gifsicle from 'gifsicle-wasm-browser'

export const COMPRESSION_LEVELS = [25, 50, 75, 100]

const LOSSY_MAP = {
  25: 60,
  50: 100,
  75: 160,
  100: 200,
}

/**
 * Returns the gifsicle --lossy value for a given compression level percentage.
 * @param {25|50|75|100} level
 * @returns {number}
 */
export function getLossyValue(level) {
  if (!(level in LOSSY_MAP)) throw new Error(`Unknown compression level: ${level}`)
  return LOSSY_MAP[level]
}

const PNG_QUALITY_MAP = {
  25: 0.85,
  50: 0.65,
  75: 0.45,
  100: 0.25,
}

/**
 * Returns the canvas quality value for a given compression level.
 * @param {25|50|75|100} level
 * @returns {number} 0–1
 */
export function getPngQuality(level) {
  if (!(level in PNG_QUALITY_MAP)) throw new Error(`Unknown compression level: ${level}`)
  return PNG_QUALITY_MAP[level]
}

/**
 * Compresses a PNG using browser-image-compression.
 * @param {File} file - original PNG File object
 * @param {25|50|75|100} level
 * @returns {Promise<Uint8Array>} compressed PNG bytes
 */
export async function compressPng(file, level) {
  const imageCompression = (await import('browser-image-compression')).default
  const compressed = await imageCompression(file, {
    initialQuality: getPngQuality(level),
    maxSizeMB: 100,
    useWebWorker: true,
  })
  const buf = await compressed.arrayBuffer()
  return new Uint8Array(buf)
}

/**
 * Compresses a GIF using gifsicle-wasm-browser.
 * @param {Uint8Array} inputBytes - original GIF bytes
 * @param {25|50|75|100} level - compression level
 * @returns {Promise<Uint8Array>} compressed GIF bytes
 */
export async function compressGif(inputBytes, level) {
  const lossy = getLossyValue(level)
  // Use Blob so the buffer isn't transferred/detached on repeated calls
  const blob = new Blob([inputBytes], { type: 'image/gif' })
  const files = await gifsicle.run({
    input: [{ file: blob, name: '1.gif' }],
    command: [`-O2 --lossy=${lossy} 1.gif -o /out/out.gif`],
  })
  const arrayBuffer = await files[0].arrayBuffer()
  return new Uint8Array(arrayBuffer)
}
