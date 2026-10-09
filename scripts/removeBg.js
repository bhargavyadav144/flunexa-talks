import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function processImage(inputPath, outputPath, isLogo = false) {
  const image = sharp(inputPath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Create RGBA buffer (4 channels)
  const rgbaData = Buffer.alloc(width * height * 4);
  const visited = new Uint8Array(width * height);

  function isCheckerboard(r, g, b) {
    const diff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    // Neutral gray checkerboard tiles have very low color variance
    if (diff > 16) return false;
    
    // Light squares ~190-215, dark squares ~120-150
    const isLightSquare = (r >= 175 && r <= 225 && g >= 175 && g <= 225 && b >= 175 && b <= 225);
    const isDarkSquare = (r >= 110 && r <= 158 && g >= 110 && g <= 158 && b >= 110 && b <= 158);

    return isLightSquare || isDarkSquare;
  }

  // Copy RGB to RGBA with alpha = 255 by default
  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * channels;
    const dstIdx = i * 4;
    rgbaData[dstIdx] = data[srcIdx];
    rgbaData[dstIdx + 1] = data[srcIdx + 1];
    rgbaData[dstIdx + 2] = data[srcIdx + 2];
    rgbaData[dstIdx + 3] = 255;
  }

  // Breadth-First Flood fill from all outer borders
  const queue = new Int32Array(width * height * 2);
  let head = 0;
  let tail = 0;

  function push(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    visited[idx] = 1;

    const srcIdx = idx * channels;
    const r = data[srcIdx];
    const g = data[srcIdx + 1];
    const b = data[srcIdx + 2];

    if (isCheckerboard(r, g, b)) {
      queue[tail++] = x;
      queue[tail++] = y;
    }
  }

  // Seed borders
  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  // BFS
  while (head < tail) {
    const x = queue[head++];
    const y = queue[head++];
    const idx = y * width + x;

    // Set pixel to fully transparent
    rgbaData[idx * 4 + 3] = 0;

    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  // Feather/smooth edges: if an opaque pixel borders a transparent pixel and is near-checkerboard, soften alpha
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (rgbaData[idx * 4 + 3] === 255) {
        const hasTransparentNeighbor =
          rgbaData[(idx - 1) * 4 + 3] === 0 ||
          rgbaData[(idx + 1) * 4 + 3] === 0 ||
          rgbaData[(idx - width) * 4 + 3] === 0 ||
          rgbaData[(idx + width) * 4 + 3] === 0;

        if (hasTransparentNeighbor) {
          const r = rgbaData[idx * 4];
          const g = rgbaData[idx * 4 + 1];
          const b = rgbaData[idx * 4 + 2];
          const diff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
          if (diff <= 20 && ((r > 165 && r < 235) || (r > 105 && r < 165))) {
            rgbaData[idx * 4 + 3] = 0;
          }
        }
      }
    }
  }

  // Save as PNG with alpha
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await sharp(rgbaData, {
    raw: { width, height, channels: 4 }
  }).png().toFile(outputPath);

  console.log(`Successfully processed and saved: ${outputPath}`);
}

async function main() {
  const mascotIn = 'C:/Users/gandu/Downloads/Cheerful Neon Robot Mascot.png';
  const emblemIn = 'C:/Users/gandu/Downloads/Flunexa Talk Robot Emblem.png';
  
  const mascotOut = path.resolve('public/assets/flunexa-mascot.png');
  const logoOut = path.resolve('public/assets/flunexa-logo.png');

  await processImage(mascotIn, mascotOut, false);
  await processImage(emblemIn, logoOut, true);
}

main().catch(console.error);
