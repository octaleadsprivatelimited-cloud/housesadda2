import imageCompression from 'browser-image-compression';

/**
 * Compress image in browser to approximately 11KB
 * @param {File} file - Image file from input
 * @param {number} targetSizeKB - Target size in KB (default: 11)
 * @returns {Promise<string>} - Base64 data URL
 */
export async function compressImageInBrowser(file: File, targetSizeKB: number = 11): Promise<string> {
  try {
    const options = {
      maxSizeMB: targetSizeKB / 1024, // Convert KB to MB
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: 'image/jpeg',
      initialQuality: 0.8,
    };

    // Compress the image
    const compressedFile = await imageCompression(file, options);
    
    // Check if we need more compression
    let finalFile = compressedFile;
    let currentSizeKB = compressedFile.size / 1024;
    
    if (currentSizeKB > targetSizeKB) {
      // Try more aggressive compression
      const aggressiveOptions = {
        ...options,
        maxSizeMB: targetSizeKB / 1024,
        maxWidthOrHeight: 800,
        initialQuality: 0.6,
      };
      
      finalFile = await imageCompression(file, aggressiveOptions);
      currentSizeKB = finalFile.size / 1024;
      
      // If still too large, resize more
      if (currentSizeKB > targetSizeKB) {
        const resizeRatio = Math.sqrt(targetSizeKB / currentSizeKB);
        const newMaxSize = Math.max(400, Math.round(800 * resizeRatio));
        
        const finalOptions = {
          ...options,
          maxSizeMB: targetSizeKB / 1024,
          maxWidthOrHeight: newMaxSize,
          initialQuality: 0.5,
        };
        
        finalFile = await imageCompression(file, finalOptions);
      }
    }

    // Convert to base64 data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        console.log(`📦 Image compressed: ${(file.size / 1024).toFixed(2)}KB → ${(finalFile.size / 1024).toFixed(2)}KB`);
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(finalFile);
    });
  } catch (error) {
    console.error('Image compression error:', error);
    // Fallback: convert original file to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Compress multiple images
 * @param {File[]} files - Array of image files
 * @param {number} targetSizeKB - Target size in KB (default: 11)
 * @returns {Promise<string[]>} - Array of base64 data URLs
 */
export async function compressMultipleImages(files: File[], targetSizeKB: number = 11): Promise<string[]> {
  const compressedImages = await Promise.all(
    files.map(file => compressImageInBrowser(file, targetSizeKB))
  );
  return compressedImages;
}

/**
 * Compress text content (remove extra whitespace)
 * @param {string} content - Text content
 * @returns {string} - Compressed content
 */
export function compressContent(content: string): string {
  if (!content || typeof content !== 'string') {
    return content;
  }

  // Remove extra whitespace and newlines
  return content
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

export default {
  compressImageInBrowser,
  compressMultipleImages,
  compressContent,
};
