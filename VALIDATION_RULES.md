# Firestore Validation Rules Documentation

## Overview

This document describes the validation rules implemented to ensure:
1. **Images are compressed to ~11KB** (with 15KB max validation margin)
2. **Content is compressed and within limits**
3. **Storage usage is optimized**
4. **No storage errors in the future**

## Validation Rules

### 1. Image Size Validation

**Location**: `server/utils/validation.js`

- **Maximum size per image**: 15KB (allows margin for compression variance)
- **Target size**: 11KB (compression target)
- **Maximum images per property**: 10 images
- **Validation**: Checks base64 data URL size before storing

**Implementation**:
```javascript
validateImages(images, 15) // Max 15KB per image
```

### 2. Content Size Validation

**Location**: `server/utils/validation.js`

- **Maximum description length**: 10,000 characters
- **Auto-compression**: Descriptions are minified (whitespace removed)
- **Validation**: Checks content length before storing

**Implementation**:
```javascript
validateContentSize(description, 10000) // Max 10KB
```

### 3. Storage Size Calculation

**Location**: `server/utils/validation.js`

- **Estimates storage size** for each property
- **Logs storage usage** for monitoring
- **Helps track** total storage consumption

### 4. Firestore Security Rules

**Location**: `firestore.rules`

- **Image size limit**: 15KB (15,360 bytes) enforced at Firestore level
- **Content size limit**: 10KB (10,000 characters) for descriptions
- **Property validation**: Ensures required fields and data types
- **Read/Write restrictions**: Server-side only writes, public reads for active properties

## Validation Flow

### Image Upload Flow:
1. **Frontend**: Compresses image to ~11KB
2. **Backend receives**: Validates image size (must be ≤ 15KB)
3. **If too large**: Returns error, image must be re-compressed
4. **If valid**: Stores in Firestore
5. **Firestore rules**: Double-checks size (rejects if > 15KB)

### Content Upload Flow:
1. **Frontend**: User enters description
2. **Backend receives**: Validates length (must be ≤ 10,000 chars)
3. **If too long**: Returns error
4. **If valid**: Compresses (minifies) and stores

## Error Handling

### Image Validation Errors:
```json
{
  "error": "Image validation failed",
  "details": [
    "Image 1: Image size (25.50KB) exceeds maximum allowed size (15KB). Please compress the image."
  ],
  "sizes": [25.50, 12.30, 8.90]
}
```

### Content Validation Errors:
```json
{
  "error": "Content length (15000 characters) exceeds maximum allowed (10000 characters). Please shorten the content."
}
```

## Storage Limits

### Per Property:
- **Images**: 10 images × 11KB = ~110KB
- **Data**: ~5-10KB
- **Description**: ~1-5KB (compressed)
- **Total**: ~120KB per property

### Total Capacity:
- **1GB free tier** = 1,024,000 KB
- **Properties capacity**: ~8,500 properties
- **Safety margin**: Validation ensures we stay well within limits

## Monitoring

### Server Logs:
- Image validation results
- Storage size calculations
- Compression statistics

### Example Logs:
```
✅ Images validated: 11.2KB, 10.8KB, 9.5KB
📊 Estimated storage: 125.5KB
📦 Image compressed: 250.5KB → 11.2KB
```

## Firestore Rules Deployment

To deploy Firestore security rules:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database** > **Rules** tab
4. Copy contents of `firestore.rules` file
5. Paste into the rules editor
6. Click **Publish**

## Testing Validation

### Test Image Size:
```javascript
import { validateImageSize } from './server/utils/validation.js';

const result = validateImageSize(imageDataURL, 15);
console.log(result); // { valid: true/false, sizeKB: 11.2, error?: "..." }
```

### Test Multiple Images:
```javascript
import { validateImages } from './server/utils/validation.js';

const result = validateImages(imageArray, 15);
console.log(result); // { valid: true/false, errors: [...], sizes: [...] }
```

## Best Practices

1. **Always validate before storing** - Validation happens automatically in routes
2. **Monitor storage usage** - Check Firebase Console regularly
3. **Compress on frontend** - Reduces server load
4. **Validate on backend** - Ensures compliance
5. **Firestore rules** - Final safety net

## Future-Proofing

The validation system ensures:
- ✅ Images never exceed 15KB (target: 11KB)
- ✅ Content never exceeds limits
- ✅ Storage stays within 1GB free tier
- ✅ No unexpected storage errors
- ✅ Automatic compression enforcement
