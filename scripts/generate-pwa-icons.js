import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputSvg = 'public/favicon.svg';
const outputDir = 'public';

const sizes = [192, 512];

async function generateIcons() {
  if (!fs.existsSync(inputSvg)) {
    console.error(`Input SVG not found: ${inputSvg}`);
    process.exit(1);
  }

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `pwa-${size}x${size}.png`);
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated: ${outputPath}`);
  }
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
