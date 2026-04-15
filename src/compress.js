import gifsicle from 'gifsicle-wasm-browser'

export const COMPRESSION_LEVELS = [25, 50, 75, 100]

const LOSSY_MAP = {
  25: 30,
  50: 80,
  75: 130,
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

/**
 * Compresses a GIF using gifsicle-wasm-browser.
 * @param {Uint8Array} inputBytes - original GIF bytes
 * @param {25|50|75|100} level - compression level
 * @returns {Promise<Uint8Array>} compressed GIF bytes
 */
export async function compressGif(inputBytes, level) {
  const lossy = getLossyValue(level)
  const files = await gifsicle.run({
    input: [{
      file: inputBytes.buffer,
      name: '1.gif',
    }],
    command: [`-O1 --lossy=${lossy} 1.gif -o /out/out.gif`],
  })
  const arrayBuffer = await files[0].arrayBuffer()
  return new Uint8Array(arrayBuffer)
}
