import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { ENV } from '../config/env';

const BLUR_SIGMAS = [32, 24, 18, 12, 8, 5, 2.5, 0.3];

export interface IBlurGenerationResult {
  playerId: string;
  urls: string[];
}

export async function generatePlayerBlurLevels(
  playerId: string,
  sourceImagePathOrBuffer: string | Buffer
): Promise<IBlurGenerationResult> {
  const outputDir = path.resolve(ENV.BLUR_STORAGE_PATH, playerId);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const urls: string[] = [];

  for (let i = 0; i < BLUR_SIGMAS.length; i++) {
    const level = i + 1;
    const sigma = BLUR_SIGMAS[i];
    const fileName = `level_${level}.webp`;
    const outputPath = path.join(outputDir, fileName);

    let transformer = sharp(sourceImagePathOrBuffer)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 80 });

    if (sigma > 0.5) {
      transformer = transformer.blur(sigma);
    }

    await transformer.toFile(outputPath);

    const relativeUrl = `/static/blurred/${playerId}/${fileName}`;
    urls.push(relativeUrl);
  }

  return {
    playerId,
    urls,
  };
}

if (require.main === module) {
  console.log('🖼️ Blur Generator Service initialized. Ready for batch or on-demand processing.');
}
