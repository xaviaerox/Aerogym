const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const inputPath = 'C:/Users/Xaviaerox/.gemini/antigravity/brain/121fb026-5643-43cc-807c-251f561a5f9c/.user_uploaded/media__1785430298691.png';
const outputPathPublic = 'public/images/body_map_2d.png';
const outputPathSrc = 'src/assets/images/body_map_2d.png';

const buffer = fs.readFileSync(inputPath);

// Extract chunks
let offset = 8;
const chunks = [];
let width = 0;
let height = 0;

while (offset < buffer.length) {
  const length = buffer.readUInt32BE(offset);
  const type = buffer.toString('ascii', offset + 4, offset + 8);
  const chunkData = buffer.slice(offset + 8, offset + 8 + length);
  const crc = buffer.slice(offset + 8 + length, offset + 12 + length);

  if (type === 'IHDR') {
    width = chunkData.readUInt32BE(0);
    height = chunkData.readUInt32BE(4);
  }
  chunks.push({ type, length, chunkData, crc });
  offset += 12 + length;
}

console.log(`Original Ref Dimensions: ${width}x${height}`);

// Concatenate all IDAT chunks
const idatBuffers = chunks.filter(c => c.type === 'IDAT').map(c => c.chunkData);
const compressedData = Buffer.concat(idatBuffers);
const decompressed = zlib.inflateSync(compressedData);

// Process scanlines (RGBA: 4 bytes per pixel + 1 filter byte per row)
const bytesPerPixel = 4;
const rowSize = 1 + width * bytesPerPixel;
const rawRgba = Buffer.alloc(width * height * 4);

function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

for (let y = 0; y < height; y++) {
  const filterType = decompressed[y * rowSize];
  const rowStart = y * rowSize + 1;
  const prevRowStart = (y - 1) * width * 4;
  const currRowStart = y * width * 4;

  for (let x = 0; x < width * 4; x++) {
    const rawVal = decompressed[rowStart + x];
    let left = x >= 4 ? rawRgba[currRowStart + x - 4] : 0;
    let up = y > 0 ? rawRgba[prevRowStart + x] : 0;
    let upperLeft = (y > 0 && x >= 4) ? rawRgba[prevRowStart + x - 4] : 0;

    let val = rawVal;
    if (filterType === 1) val = (rawVal + left) & 0xff;
    else if (filterType === 2) val = (rawVal + up) & 0xff;
    else if (filterType === 3) val = (rawVal + Math.floor((left + up) / 2)) & 0xff;
    else if (filterType === 4) val = (rawVal + paethPredictor(left, up, upperLeft)) & 0xff;

    rawRgba[currRowStart + x] = val;
  }
}

// Convert light background to 100% transparent and keep dark line art crisp charcoal/black (#1e293b)
const processed = Buffer.alloc(decompressed.length);

for (let y = 0; y < height; y++) {
  const rowStart = y * rowSize;
  processed[rowStart] = 0; // Filter Type 0 = NONE!

  for (let x = 0; x < width; x++) {
    const pixelIndex = (y * width + x) * 4;
    const outPixelIndex = rowStart + 1 + x * 4;

    let r = rawRgba[pixelIndex];
    let g = rawRgba[pixelIndex + 1];
    let b = rawRgba[pixelIndex + 2];
    let a = rawRgba[pixelIndex + 3];

    const isWhiteBg = (r > 210 && g > 210 && b > 210);

    if (isWhiteBg) {
      // Light background -> 100% TRANSPARENT
      r = 0;
      g = 0;
      b = 0;
      a = 0;
    } else {
      // Dark line art lines -> Convert to crisp dark slate/charcoal (#1e293b)
      r = 30;
      g = 41;
      b = 59;
      a = 255;
    }

    processed[outPixelIndex] = r;
    processed[outPixelIndex + 1] = g;
    processed[outPixelIndex + 2] = b;
    processed[outPixelIndex + 3] = a;
  }
}

// Re-compress IDAT
const newIdatData = zlib.deflateSync(processed);

// Calculate CRC32
function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

// Write output PNG
const outChunks = [];
outChunks.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

chunks.forEach(chunk => {
  if (chunk.type === 'IDAT') return;
  if (chunk.type === 'IEND') {
    const typeBuf = Buffer.from('IDAT', 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(newIdatData.length, 0);

    const crcBuf = Buffer.alloc(4);
    const crcVal = crc32(Buffer.concat([typeBuf, newIdatData]));
    crcBuf.writeUInt32BE(crcVal, 0);

    outChunks.push(lenBuf);
    outChunks.push(typeBuf);
    outChunks.push(newIdatData);
    outChunks.push(crcBuf);
  }

  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(chunk.length, 0);
  const typeBuf = Buffer.from(chunk.type, 'ascii');

  outChunks.push(lenBuf);
  outChunks.push(typeBuf);
  outChunks.push(chunk.chunkData);
  outChunks.push(chunk.crc);
});

const finalPng = Buffer.concat(outChunks);
fs.writeFileSync(outputPathPublic, finalPng);
fs.writeFileSync(outputPathSrc, finalPng);
console.log('Successfully generated pristine transparent vector artwork template from reference!');
