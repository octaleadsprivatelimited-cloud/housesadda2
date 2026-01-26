import { dataURLToBuffer } from './compression.js';

/**
 * Validate that an image data URL is compressed to approximately 11KB
 * @param {string} imageDataURL - Base64 data URL
 * @param {number} maxSizeKB - Maximum allowed size in KB (default: 15KB to allow some margin)
 * @returns {object} - { valid: boolean, sizeKB: number, error?: string }
 */
export function validateImageSize(imageDataURL, maxSizeKB = 15) {
  try {
    if (!imageDataURL || typeof imageDataURL !== 'string') {
      return { valid: false, sizeKB: 0, error: 'Invalid image data' };
    }

    // Check if it's a data URL
    if (!imageDataURL.startsWith('data:image')) {
      return { valid: false, sizeKB: 0, error: 'Image must be a base64 data URL' };
    }

    // Calculate size
    const buffer = dataURLToBuffer(imageDataURL);
    const sizeKB = buffer.length / 1024;

    if (sizeKB > maxSizeKB) {
      return {
        valid: false,
        sizeKB: parseFloat(sizeKB.toFixed(2)),
        error: `Image size (${sizeKB.toFixed(2)}KB) exceeds maximum allowed size (${maxSizeKB}KB). Please compress the image.`
      };
    }

    return {
      valid: true,
      sizeKB: parseFloat(sizeKB.toFixed(2))
    };
  } catch (error) {
    return {
      valid: false,
      sizeKB: 0,
      error: `Validation error: ${error.message}`
    };
  }
}

/**
 * Validate multiple images
 * @param {string[]} imageDataURLs - Array of base64 data URLs
 * @param {number} maxSizeKB - Maximum allowed size per image in KB
 * @returns {object} - { valid: boolean, errors: string[], sizes: number[] }
 */
export function validateImages(imageDataURLs, maxSizeKB = 15) {
  const errors = [];
  const sizes = [];
  let allValid = true;

  if (!Array.isArray(imageDataURLs)) {
    return {
      valid: false,
      errors: ['Images must be an array'],
      sizes: []
    };
  }

  // Limit number of images per property
  const MAX_IMAGES = 10;
  if (imageDataURLs.length > MAX_IMAGES) {
    errors.push(`Maximum ${MAX_IMAGES} images allowed per property. You provided ${imageDataURLs.length}.`);
    allValid = false;
  }

  imageDataURLs.forEach((imageDataURL, index) => {
    const validation = validateImageSize(imageDataURL, maxSizeKB);
    sizes.push(validation.sizeKB);

    if (!validation.valid) {
      allValid = false;
      errors.push(`Image ${index + 1}: ${validation.error}`);
    }
  });

  return {
    valid: allValid,
    errors,
    sizes
  };
}

/**
 * Validate content size
 * @param {string} content - Text content
 * @param {number} maxLength - Maximum length in characters (default: 10000)
 * @returns {object} - { valid: boolean, length: number, error?: string }
 */
export function validateContentSize(content, maxLength = 10000) {
  if (!content || typeof content !== 'string') {
    return { valid: true, length: 0 }; // Empty content is valid
  }

  const length = content.length;

  if (length > maxLength) {
    return {
      valid: false,
      length,
      error: `Content length (${length} characters) exceeds maximum allowed (${maxLength} characters). Please shorten the content.`
    };
  }

  return {
    valid: true,
    length
  };
}

/**
 * Calculate estimated storage size for a property
 * @param {object} propertyData - Property data object
 * @returns {number} - Estimated size in KB
 */
export function calculatePropertyStorageSize(propertyData) {
  let sizeKB = 0;

  // Base property data (estimate ~5KB)
  sizeKB += 5;

  // Description size
  if (propertyData.description) {
    sizeKB += propertyData.description.length / 1024;
  }

  // Images size
  if (propertyData.images && Array.isArray(propertyData.images)) {
    propertyData.images.forEach(imageDataURL => {
      try {
        const buffer = dataURLToBuffer(imageDataURL);
        sizeKB += buffer.length / 1024;
      } catch (e) {
        // Ignore errors, estimate 11KB per image
        sizeKB += 11;
      }
    });
  }

  // Amenities and highlights (estimate)
  if (propertyData.amenities) {
    sizeKB += JSON.stringify(propertyData.amenities).length / 1024;
  }
  if (propertyData.highlights) {
    sizeKB += JSON.stringify(propertyData.highlights).length / 1024;
  }

  return parseFloat(sizeKB.toFixed(2));
}

export default {
  validateImageSize,
  validateImages,
  validateContentSize,
  calculatePropertyStorageSize,
};
