const fs = require('fs');
const zlib = require('zlib');

const inputPath = 'C:/Users/Xaviaerox/.gemini/antigravity/brain/121fb026-5643-43cc-807c-251f561a5f9c/.user_uploaded/media__1785430298691.png';
const buffer = fs.readFileSync(inputPath);

let offset = 8;
let width = 0;
let height = 0;

while (offset < buffer.length) {
  const length = buffer.readUInt32BE(offset);
  const type = buffer.toString('ascii', offset + 4, offset + 8);
  const chunkData = buffer.slice(offset + 8, offset + 8 + length);
  if (type === 'IHDR') {
    width = chunkData.readUInt32BE(0);
    height = chunkData.readUInt32BE(4);
  }
  offset += 12 + length;
}

console.log(`Reference Image Dimensions: ${width}x${height}`);
