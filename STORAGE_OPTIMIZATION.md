# Firestore Storage Optimization

## Automatic Compression System

This project automatically compresses all images and content to optimize Firestore storage usage.

### Image Compression
- **Target Size**: ~11KB per image
- **Format**: JPEG (optimized)
- **Storage**: Images stored as base64 data URLs in Firestore
- **Location**: `property_images` collection

### Content Compression
- **Descriptions**: Auto-minified (whitespace removed)
- **JSON Data**: Stored in minified format

### Storage Capacity
With 1GB free Firestore storage:
- **~8,500 - 17,000 properties** (with 5-10 images each)
- **Automatic compression** ensures efficient usage
- **No external storage needed**

### How It Works
1. **Frontend**: Images compressed in browser before upload
2. **Backend**: Additional compression for URLs/images
3. **Storage**: All data stored directly in Firestore collections

See [STORAGE_OPTIMIZATION.md](./STORAGE_OPTIMIZATION.md) for detailed information.
