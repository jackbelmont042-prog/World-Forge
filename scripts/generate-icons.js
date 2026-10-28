import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height, r, g, b, a = 255) {
  // Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  
  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // RGBA color type
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw bitmap with filter byte 0 per line
  const lineLength = 1 + width * 4;
  const rawData = Buffer.alloc(lineLength * height);

  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) / 2;

  for (let y = 0; y < height; y++) {
    const lineOffset = y * lineLength;
    rawData[lineOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pxOffset = lineOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Gold compass star pattern & dark backdrop
      if (dist < maxR * 0.95) {
        // Star rays or disc
        const angle = Math.atan2(dy, dx);
        const ray = Math.abs(Math.sin(angle * 4));
        const inStar = dist < (maxR * 0.35 + ray * maxR * 0.45);
        if (inStar) {
          rawData[pxOffset] = 212;     // R (gold)
          rawData[pxOffset + 1] = 175; // G
          rawData[pxOffset + 2] = 55;  // B
          rawData[pxOffset + 3] = 255; // A
        } else if (dist > maxR * 0.85 && dist < maxR * 0.92) {
          rawData[pxOffset] = 212;
          rawData[pxOffset + 1] = 175;
          rawData[pxOffset + 2] = 55;
          rawData[pxOffset + 3] = 200;
        } else {
          rawData[pxOffset] = 18;     // Dark navy #121417
          rawData[pxOffset + 1] = 20;
          rawData[pxOffset + 2] = 23;
          rawData[pxOffset + 3] = 255;
        }
      } else {
        rawData[pxOffset] = 15;
        rawData[pxOffset + 1] = 17;
        rawData[pxOffset + 2] = 21;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

fs.writeFileSync('./public/pwa-192x192.png', createPng(192, 192, 212, 175, 55));
fs.writeFileSync('./public/pwa-512x512.png', createPng(512, 512, 212, 175, 55));
fs.writeFileSync('./public/pwa-maskable-512x512.png', createPng(512, 512, 212, 175, 55));
fs.writeFileSync('./public/apple-touch-icon.png', createPng(180, 180, 212, 175, 55));
console.log('PWA PNG icons generated successfully!');
