const fs = require('fs');
const zlib = require('zlib');

const inputPath = 'C:/Users/Xaviaerox/.gemini/antigravity/brain/121fb026-5643-43cc-807c-251f561a5f9c/.user_uploaded/media__1785429208347.png';
const buffer = fs.readFileSync(inputPath);

let offset = 8;
let width = 0;
let height = 0;
const idatBuffers = [];

while (offset < buffer.length) {
  const length = buffer.readUInt32BE(offset);
  const type = buffer.toString('ascii', offset + 4, offset + 8);
  const chunkData = buffer.slice(offset + 8, offset + 8 + length);
  if (type === 'IHDR') {
    width = chunkData.readUInt32BE(0);
    height = chunkData.readUInt32BE(4);
  } else if (type === 'IDAT') {
    idatBuffers.push(chunkData);
  }
  offset += 12 + length;
}

const decompressed = zlib.inflateSync(Buffer.concat(idatBuffers));
const rowSize = 1 + width * 4;
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

// Find bounding boxes of pink quads, yellow lower back, orange glutes
let pinkMinX = 999, pinkMaxX = 0, pinkMinY = 999, pinkMaxY = 0;
let yellowMinX = 999, yellowMaxX = 0, yellowMinY = 999, yellowMaxY = 0;
let orangeMinX = 999, orangeMaxX = 0, orangeMinY = 999, orangeMaxY = 0;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const r = rawRgba[idx];
    const g = rawRgba[idx + 1];
    const b = rawRgba[idx + 2];

    // Pink (Quads)
    if (r > 200 && g < 120 && b > 100) {
      if (x < pinkMinX) pinkMinX = x;
      if (x > pinkMaxX) pinkMaxX = x;
      if (y < pinkMinY) pinkMinY = y;
      if (y > pinkMaxY) pinkMaxY = y;
    }
    // Yellow (Lower Back)
    if (r > 220 && g > 200 && b < 120) {
      if (x < yellowMinX) yellowMinX = x;
      if (x > yellowMaxX) yellowMaxX = x;
      if (y < yellowMinY) yellowMinY = y;
      if (y > yellowMaxY) yellowMaxY = y;
    }
    // Orange (Glutes)
    if (r > 220 && g > 120 && g < 180 && b < 120) {
      if (x < orangeMinX) orangeMinX = x;
      if (x > orangeMaxX) orangeMaxX = x;
      if (y < orangeMinY) orangeMinY = y;
      if (y > orangeMaxY) orangeMaxY = y;
    }
  }
}

console.log(`Pink (Quads) BBox: X[${pinkMinX}..${pinkMaxX}], Y[${pinkMinY}..${pinkMaxY}]`);
console.log(`Yellow (Lower Back) BBox: X[${yellowMinX}..${yellowMaxX}], Y[${yellowMinY}..${yellowMaxY}]`);
console.log(`Orange (Glutes) BBox: X[${orangeMinX}..${orangeMaxX}], Y[${orangeMinY}..${orangeMaxY}]`);
