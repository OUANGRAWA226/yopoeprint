// Lecture des dimensions d'une image JPG/PNG directement dans l'en-tête du fichier (sans dépendance)

export interface ImageSize {
  width:  number
  height: number
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

function pngSize(buf: Buffer): ImageSize | null {
  // Signature (8 octets) puis le bloc IHDR : longueur (4), type "IHDR" (4), largeur (4), hauteur (4)
  if (buf.length < 24 || !PNG_SIGNATURE.every((b, i) => buf[i] === b)) return null
  if (buf.subarray(12, 16).toString('latin1') !== 'IHDR') return null
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

// Marqueurs SOF (Start Of Frame) qui portent les dimensions ; C4, C8 et CC sont d'autres segments
const SOF_MARKERS = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf])

function jpegSize(buf: Buffer): ImageSize | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null
  let offset = 2
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) return null
    const marker = buf[offset + 1]
    if (marker === 0xff) { offset++; continue } // octet de remplissage
    if (marker === 0xd9 || marker === 0xda) return null // fin d'image ou début des données avant tout SOF
    const length = buf.readUInt16BE(offset + 2)
    if (SOF_MARKERS.has(marker)) {
      return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) }
    }
    offset += 2 + length
  }
  return null
}

/** Dimensions en pixels d'un JPG ou d'un PNG, `null` si l'en-tête est illisible. */
export function readImageSize(buf: Buffer): ImageSize | null {
  return pngSize(buf) ?? jpegSize(buf)
}
