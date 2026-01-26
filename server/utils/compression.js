import sharp from 'sharp';
import { readFileSync } from 'fs';

/**
 * Compress image to approximately 11KB
 * @param {Buffer|string} input - Image buffer or file path
 * @param {number} targetSizeKB - Target size in KB (default: 11)
 * @returns {Promise<Buffer>} - Compressed image buffer
 */
export async function compressImage(input, targetSizeKB = 11) {
  try {
    let imageBuffer;
    
    // Convert input to buffer if it's a path
    if (typeof input === 'string') {
      imageBuffer = await sharp(input).toBuffer();
    } else {
      imageBuffer = input;
    }

    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    const originalSizeKB = imageBuffer.length / 1024;

    // If already smaller than target, return as is
    if (originalSizeKB <= targetSizeKB) {
      return imageBuffer;
    }

    // Calculate target quality (start with 80% and adjust)
    let quality = 80;
    let compressed = imageBuffer;
    let currentSizeKB = originalSizeKB;
    let attempts = 0;
    const maxAttempts = 10;

    // Progressive compression to reach target size
    while (currentSizeKB > targetSizeKB && attempts < maxAttempts) {
      // Calculate new quality based on size ratio
      const sizeRatio = targetSizeKB / currentSizeKB;
      quality = Math.max(20, Math.min(90, quality * sizeRatio));

      // Compress image
      compressed = await sharp(imageBuffer)
        .resize({
          width: metadata.width ? Math.min(metadata.width, 1200) : 1200,
          height: metadata.height ? Math.min(metadata.height, 1200) : 1200,
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ 
          quality: Math.round(quality),
          progressive: true,
          mozjpeg: true
        })
        .toBuffer();

      currentSizeKB = compressed.length / 1024;
      attempts++;

      // If we're close enough (within 2KB), break
      if (currentSizeKB <= targetSizeKB + 2) {
        break;
      }
    }

    // Final check - if still too large, resize more aggressively
    if (currentSizeKB > targetSizeKB) {
      const resizeRatio = Math.sqrt(targetSizeKB / currentSizeKB);
      const newWidth = Math.max(400, Math.round((metadata.width || 1200) * resizeRatio));
      const newHeight = Math.max(400, Math.round((metadata.height || 1200) * resizeRatio));

      compressed = await sharp(imageBuffer)
        .resize(newWidth, newHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ 
          quality: 60,
          progressive: true,
          mozjpeg: true
        })
        .toBuffer();
    }

    const finalSizeKB = compressed.length / 1024;
    console.log(`📦 Image compressed: ${originalSizeKB.toFixed(2)}KB → ${finalSizeKB.toFixed(2)}KB`);

    return compressed;
  } catch (error) {
    console.error('Image compression error:', error);
    // Return original if compression fails
    return typeof input === 'string' ? await sharp(input).toBuffer() : input;
  }
}

/**
 * Convert image buffer to base64 data URL
 * @param {Buffer} buffer - Image buffer
 * @param {string} mimeType - MIME type (default: 'image/jpeg')
 * @returns {string} - Base64 data URL
 */
export function bufferToDataURL(buffer, mimeType = 'image/jpeg') {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Convert base64 data URL to buffer
 * @param {string} dataURL - Base64 data URL
 * @returns {Buffer} - Image buffer
 */
export function dataURLToBuffer(dataURL) {
  const base64Data = dataURL.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

/**
 * Compress and convert image to base64 data URL
 * @param {Buffer|string} input - Image buffer or file path
 * @param {number} targetSizeKB - Target size in KB (default: 11)
 * @returns {Promise<string>} - Base64 data URL
 */
export async function compressImageToDataURL(input, targetSizeKB = 11) {
  const compressed = await compressImage(input, targetSizeKB);
  return bufferToDataURL(compressed);
}

/**
 * Compress text content (remove extra whitespace, minify)
 * @param {string} content - Text content
 * @returns {string} - Compressed content
 */
export function compressContent(content) {
  if (!content || typeof content !== 'string') {
    return content;
  }

  // Remove extra whitespace and newlines
  return content
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

/**
 * Compress JSON data
 * @param {object} data - JSON object
 * @returns {string} - Minified JSON string
 */
export function compressJSON(data) {
  return JSON.stringify(data);
}

export default {
  compressImage,
  compressImageToDataURL,
  bufferToDataURL,
  dataURLToBuffer,
  compressContent,
  compressJSON,
};
