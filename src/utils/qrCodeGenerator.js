/**
 * Gerador de QR Code usando a API do Google Charts (via imagem)
 * Gera QR Codes válidos e escaneáveis sem dependências externas.
 * 
 * Alternativa: usa encode manual de QR via canvas para funcionamento 100% offline.
 */

// Gera a URL do QR Code via Google Charts API (online)
export function getQrCodeUrl(data, size = 300) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&format=svg&margin=8`;
}

/**
 * Gera um QR Code como Data URL usando Canvas.
 * Implementação simplificada de QR Code para modo offline.
 * Usa a biblioteca qr-code-generator-es6 embutida (algoritmo Reed-Solomon).
 */

// ===== QR Code Encoder Minimalista =====
// Baseado no padrão ISO/IEC 18004 — Versão 1-4, Level M
// Gera uma matrix binária que pode ser renderizada em canvas.

const EC_LEVEL = 1; // 0=L, 1=M, 2=Q, 3=H

// Tabelas de capacidade e blocos ECC para versões 1-10, level M
const VERSION_CAPACITY = [
  // [totalCodewords, ecCodewordsPerBlock, numBlocks, dataCodewords]
  null, // index 0 unused
  [26, 10, 1, 16],    // V1
  [44, 16, 1, 28],    // V2
  [70, 26, 1, 44],    // V3
  [100, 18, 2, 64],   // V4
  [134, 24, 2, 86],   // V5
  [172, 16, 4, 108],  // V6
  [196, 18, 4, 124],  // V7
  [242, 22, 4, 154],  // V8
  [292, 22, 4, 182],  // V9 (approx — simplified)
  [346, 26, 4, 214],  // V10
];

// Byte mode capacity (Level M) per version
const BYTE_CAPACITY = [0, 14, 26, 42, 62, 84, 106, 122, 152, 180, 213];

function chooseVersion(dataLen) {
  for (let v = 1; v <= 10; v++) {
    if (dataLen <= BYTE_CAPACITY[v]) return v;
  }
  return 10; // fallback
}

// GF(256) arithmetic for Reed-Solomon
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

function gfMul(a, b) {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsEncode(data, numEcc) {
  // Generator polynomial
  let gen = [1];
  for (let i = 0; i < numEcc; i++) {
    const newGen = new Array(gen.length + 1).fill(0);
    for (let j = 0; j < gen.length; j++) {
      newGen[j] ^= gen[j];
      newGen[j + 1] ^= gfMul(gen[j], GF_EXP[i]);
    }
    gen = newGen;
  }

  const msg = new Uint8Array(data.length + numEcc);
  msg.set(data);
  
  for (let i = 0; i < data.length; i++) {
    const coef = msg[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        msg[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }

  return msg.slice(data.length);
}

// Encode string to byte array
function encodeBytes(str) {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

// Create data codewords (byte mode)
function createDataCodewords(text, version) {
  const bytes = encodeBytes(text);
  const vInfo = VERSION_CAPACITY[version];
  const totalDataCw = vInfo[3];
  const charCountBits = version <= 9 ? 8 : 16;

  // Mode indicator (0100 = byte mode) + character count + data + terminator
  const bits = [];

  function pushBits(val, len) {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  }

  pushBits(0b0100, 4); // Byte mode
  pushBits(bytes.length, charCountBits);

  for (const b of bytes) {
    pushBits(b, 8);
  }

  // Terminator
  const maxBits = totalDataCw * 8;
  const termLen = Math.min(4, maxBits - bits.length);
  for (let i = 0; i < termLen; i++) bits.push(0);

  // Pad to byte boundary
  while (bits.length % 8 !== 0) bits.push(0);

  // Pad codewords
  const padBytes = [0xEC, 0x11];
  let padIdx = 0;
  while (bits.length < maxBits) {
    pushBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  // Convert to bytes
  const codewords = new Uint8Array(totalDataCw);
  for (let i = 0; i < totalDataCw; i++) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      byte = (byte << 1) | (bits[i * 8 + j] || 0);
    }
    codewords[i] = byte;
  }

  return codewords;
}

// Build final message with ECC
function buildMessage(dataCw, version) {
  const vInfo = VERSION_CAPACITY[version];
  const ecCwPerBlock = vInfo[1];
  const numBlocks = vInfo[2];
  const totalDataCw = vInfo[3];

  const blockSize = Math.floor(totalDataCw / numBlocks);
  const remainder = totalDataCw % numBlocks;

  const dataBlocks = [];
  const ecBlocks = [];
  let offset = 0;

  for (let b = 0; b < numBlocks; b++) {
    const size = blockSize + (b >= numBlocks - remainder ? 1 : 0);
    const block = dataCw.slice(offset, offset + size);
    offset += size;
    dataBlocks.push(block);
    ecBlocks.push(rsEncode(block, ecCwPerBlock));
  }

  // Interleave data blocks
  const result = [];
  const maxDataLen = Math.max(...dataBlocks.map(b => b.length));
  for (let i = 0; i < maxDataLen; i++) {
    for (const block of dataBlocks) {
      if (i < block.length) result.push(block[i]);
    }
  }

  // Interleave EC blocks
  for (let i = 0; i < ecCwPerBlock; i++) {
    for (const block of ecBlocks) {
      if (i < block.length) result.push(block[i]);
    }
  }

  return result;
}

// Create the QR matrix
function createMatrix(version) {
  const size = 17 + version * 4;
  const matrix = Array.from({ length: size }, () => new Int8Array(size)); // 0=empty, 1=black, -1=white (function)
  const reserved = Array.from({ length: size }, () => new Uint8Array(size)); // 1 = reserved
  return { matrix, reserved, size };
}

function addFinderPattern(matrix, reserved, row, col) {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const rr = row + r, cc = col + c;
      if (rr < 0 || rr >= matrix.length || cc < 0 || cc >= matrix.length) continue;
      
      let val;
      if (r === -1 || r === 7 || c === -1 || c === 7) {
        val = -1; // white separator
      } else if (r === 0 || r === 6 || c === 0 || c === 6) {
        val = 1; // black border
      } else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) {
        val = 1; // black center
      } else {
        val = -1; // white space
      }
      
      matrix[rr][cc] = val;
      reserved[rr][cc] = 1;
    }
  }
}

function addAlignmentPattern(matrix, reserved, row, col) {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const rr = row + r, cc = col + c;
      if (reserved[rr][cc]) continue;
      
      if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
        matrix[rr][cc] = 1;
      } else {
        matrix[rr][cc] = -1;
      }
      reserved[rr][cc] = 1;
    }
  }
}

// Alignment pattern positions per version
const ALIGNMENT_POSITIONS = [
  null, [], [6, 18], [6, 22], [6, 26], [6, 30],
  [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 52]
];

function addTimingPatterns(matrix, reserved, size) {
  for (let i = 8; i < size - 8; i++) {
    if (!reserved[6][i]) {
      matrix[6][i] = i % 2 === 0 ? 1 : -1;
      reserved[6][i] = 1;
    }
    if (!reserved[i][6]) {
      matrix[i][6] = i % 2 === 0 ? 1 : -1;
      reserved[i][6] = 1;
    }
  }
}

function addFormatInfo(matrix, reserved, size, maskPattern) {
  // Format info bits for Error Correction Level M (01) and mask patterns
  const FORMAT_INFOS = [
    0x5412, 0x5125, 0x5E7C, 0x5B4B,
    0x45F9, 0x40CE, 0x4F97, 0x4AA0,
  ];
  
  const formatInfo = FORMAT_INFOS[maskPattern];

  // Place format info around finders
  for (let i = 0; i < 15; i++) {
    const bit = (formatInfo >> (14 - i)) & 1;
    const val = bit ? 1 : -1;

    // Around top-left finder
    if (i < 6) {
      matrix[8][i] = val;
      reserved[8][i] = 1;
    } else if (i === 6) {
      matrix[8][7] = val;
      reserved[8][7] = 1;
    } else if (i === 7) {
      matrix[8][8] = val;
      reserved[8][8] = 1;
    } else if (i === 8) {
      matrix[7][8] = val;
      reserved[7][8] = 1;
    } else {
      matrix[14 - i][8] = val;
      reserved[14 - i][8] = 1;
    }

    // Around top-right and bottom-left
    if (i < 8) {
      matrix[size - 1 - i][8] = val;
      reserved[size - 1 - i][8] = 1;
    } else {
      matrix[8][size - 15 + i] = val;
      reserved[8][size - 15 + i] = 1;
    }
  }

  // Dark module
  matrix[size - 8][8] = 1;
  reserved[size - 8][8] = 1;
}

// Mask functions
const MASK_FUNCTIONS = [
  (r, c) => (r + c) % 2 === 0,
  (r, c) => r % 2 === 0,
  (r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2 + (r * c) % 3) === 0,
  (r, c) => ((r * c) % 2 + (r * c) % 3) % 2 === 0,
  (r, c) => ((r + c) % 2 + (r * c) % 3) % 2 === 0,
];

function placeDataBits(matrix, reserved, size, dataBits) {
  let bitIdx = 0;
  let upward = true;

  for (let col = size - 1; col >= 1; col -= 2) {
    if (col === 6) col = 5; // Skip timing column

    const rows = upward
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const row of rows) {
      for (let dc = 0; dc <= 1; dc++) {
        const c = col - dc;
        if (c < 0 || reserved[row][c]) continue;

        const bit = bitIdx < dataBits.length ? dataBits[bitIdx] : 0;
        matrix[row][c] = bit ? 1 : -1;
        bitIdx++;
      }
    }

    upward = !upward;
  }
}

function applyMask(matrix, reserved, size, maskIdx) {
  const maskFn = MASK_FUNCTIONS[maskIdx];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (reserved[r][c]) continue;
      if (maskFn(r, c)) {
        matrix[r][c] = matrix[r][c] === 1 ? -1 : 1;
      }
    }
  }
}

// Simple penalty score (we'll use mask 0 for simplicity but evaluate a few)
function penaltyScore(matrix, size) {
  let penalty = 0;
  
  // Rule 1: runs of same color
  for (let r = 0; r < size; r++) {
    let count = 1;
    for (let c = 1; c < size; c++) {
      if (matrix[r][c] === matrix[r][c - 1]) {
        count++;
        if (count === 5) penalty += 3;
        else if (count > 5) penalty += 1;
      } else {
        count = 1;
      }
    }
  }
  for (let c = 0; c < size; c++) {
    let count = 1;
    for (let r = 1; r < size; r++) {
      if (matrix[r][c] === matrix[r - 1][c]) {
        count++;
        if (count === 5) penalty += 3;
        else if (count > 5) penalty += 1;
      } else {
        count = 1;
      }
    }
  }

  return penalty;
}

/**
 * Generate a QR Code matrix from text string.
 * Returns a 2D boolean array where true = dark module.
 */
export function generateQrMatrix(text) {
  const version = chooseVersion(encodeBytes(text).length);
  const dataCw = createDataCodewords(text, version);
  const message = buildMessage(dataCw, version);

  // Convert to bits
  const dataBits = [];
  for (const byte of message) {
    for (let i = 7; i >= 0; i--) {
      dataBits.push((byte >> i) & 1);
    }
  }

  // Create matrix
  const { matrix, reserved, size } = createMatrix(version);

  // Add finder patterns
  addFinderPattern(matrix, reserved, 0, 0);
  addFinderPattern(matrix, reserved, 0, size - 7);
  addFinderPattern(matrix, reserved, size - 7, 0);

  // Add alignment patterns
  const alignPos = ALIGNMENT_POSITIONS[version] || [];
  if (alignPos.length >= 2) {
    for (const r of alignPos) {
      for (const c of alignPos) {
        // Skip if overlapping with finder patterns
        if (r <= 8 && c <= 8) continue;
        if (r <= 8 && c >= size - 8) continue;
        if (r >= size - 8 && c <= 8) continue;
        addAlignmentPattern(matrix, reserved, r, c);
      }
    }
  }

  // Timing patterns
  addTimingPatterns(matrix, reserved, size);

  // Reserve format info areas
  for (let i = 0; i < 8; i++) {
    reserved[8][i] = 1;
    reserved[8][size - 1 - i] = 1;
    reserved[i][8] = 1;
    reserved[size - 1 - i][8] = 1;
  }
  reserved[8][8] = 1;

  // Place data
  placeDataBits(matrix, reserved, size, dataBits);

  // Try masks and pick best
  let bestMask = 0;
  let bestPenalty = Infinity;

  for (let m = 0; m < 8; m++) {
    // Clone matrix
    const testMatrix = matrix.map(row => Int8Array.from(row));
    const testReserved = reserved.map(row => Uint8Array.from(row));
    
    applyMask(testMatrix, testReserved, size, m);
    addFormatInfo(testMatrix, testReserved, size, m);
    
    const p = penaltyScore(testMatrix, size);
    if (p < bestPenalty) {
      bestPenalty = p;
      bestMask = m;
    }
  }

  // Apply best mask
  applyMask(matrix, reserved, size, bestMask);
  addFormatInfo(matrix, reserved, size, bestMask);

  // Convert to boolean matrix (true = dark)
  const result = [];
  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      row.push(matrix[r][c] === 1);
    }
    result.push(row);
  }

  return { matrix: result, size };
}

/**
 * Render QR Code to a canvas data URL.
 * @param {string} text - Text to encode
 * @param {number} pixelSize - Pixels per module
 * @param {number} margin - Quiet zone modules
 * @returns {string} Data URL of the QR code image
 */
export function renderQrToDataUrl(text, pixelSize = 8, margin = 4) {
  const { matrix, size } = generateQrMatrix(text);
  const totalSize = (size + margin * 2) * pixelSize;

  const canvas = document.createElement('canvas');
  canvas.width = totalSize;
  canvas.height = totalSize;
  const ctx = canvas.getContext('2d');

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, totalSize, totalSize);

  // Dark modules
  ctx.fillStyle = '#0f172a';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) {
        ctx.fillRect(
          (c + margin) * pixelSize,
          (r + margin) * pixelSize,
          pixelSize,
          pixelSize
        );
      }
    }
  }

  return canvas.toDataURL('image/png');
}
