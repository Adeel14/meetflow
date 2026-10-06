import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Standard CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function generatePNG(width, height, isMaskable = false) {
  // Raw scanlines buffer
  const raw = Buffer.alloc((1 + width * 4) * height);
  const cx = width / 2;
  const cy = height / 2;
  const safeRadius = isMaskable ? width * 0.40 : width * 0.48;

  let pos = 0;
  for (let y = 0; y < height; y++) {
    raw[pos++] = 0; // Filter: 0 (None)
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background gradient
      const ny = y / height;
      const nx = x / width;
      let r = Math.round(79 + (49 - 79) * ny);
      let g = Math.round(70 + (46 - 70) * ny);
      let b = Math.round(229 + (129 - 229) * ny);
      let a = 255;

      // Inside icon boundary (squircle or circular mask for non-maskable)
      if (!isMaskable) {
        // Squircle corner check
        const cornerR = width * 0.22;
        const qx = Math.abs(x - cx);
        const qy = Math.abs(y - cy);
        const half = width * 0.46;
        if (qx > half || qy > half) {
          a = 0;
        } else if (qx > half - cornerR && qy > half - cornerR) {
          const cdx = qx - (half - cornerR);
          const cdy = qy - (half - cornerR);
          if (cdx * cdx + cdy * cdy > cornerR * cornerR) {
            a = 0;
          }
        }
      }

      if (a > 0) {
        // Draw Camera Icon in center
        const scale = (isMaskable ? 0.65 : 0.8) * (width / 512);
        const camX = cx - 40 * scale;
        const camY = cy;
        const camW = 160 * scale;
        const camH = 150 * scale;

        // Main body box
        const inBody =
          x >= camX - camW / 2 &&
          x <= camX + camW / 2 &&
          y >= camY - camH / 2 &&
          y <= camY + camH / 2;

        // Trapezoid lens
        const lensLeft = camX + camW / 2 + 8 * scale;
        const lensRight = lensLeft + 80 * scale;
        const inLens =
          x >= lensLeft &&
          x <= lensRight &&
          y >= camY - ((x - lensLeft) / (lensRight - lensLeft) * 35 + 40) * scale &&
          y <= camY + ((x - lensLeft) / (lensRight - lensLeft) * 35 + 40) * scale;

        if (inBody || inLens) {
          r = 255;
          g = 255;
          b = 255;

          // Camera inner lens circle
          const ldx = x - camX;
          const ldy = y - camY;
          const lDist = Math.sqrt(ldx * ldx + ldy * ldy);
          if (lDist < 35 * scale) {
            r = 67;
            g = 56;
            b = 202;
          }
          if (lDist < 16 * scale) {
            r = 255;
            g = 255;
            b = 255;
          }
        }

        // Green live indicator
        const dotX = camX - camW / 2 + 25 * scale;
        const dotY = camY - camH / 2 + 25 * scale;
        const ddx = x - dotX;
        const ddy = y - dotY;
        if (ddx * ddx + ddy * ddy <= 90 * scale * scale) {
          r = 16;
          g = 185;
          b = 129;
        }
      }

      raw[pos++] = r;
      raw[pos++] = g;
      raw[pos++] = b;
      raw[pos++] = a;
    }
  }

  const deflated = zlib.deflateSync(raw, { level: 9 });

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', deflated);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), generatePNG(192, 192, false));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), generatePNG(512, 512, false));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), generatePNG(512, 512, true));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), generatePNG(180, 180, false));
fs.writeFileSync(path.join(outDir, 'favicon.ico'), generatePNG(64, 64, false));

console.log('Successfully generated all PWA icons in /public: 192x192, 512x512, maskable 512x512, apple-touch-icon.png, favicon.ico');
