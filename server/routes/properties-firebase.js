import express from 'express';
import { db } from '../db-firebase.js';
import admin from 'firebase-admin';
import { authenticateToken } from '../middleware/auth.js';
import { compressImageToDataURL, compressContent, dataURLToBuffer } from '../utils/compression.js';
import { validateImages, validateContentSize, calculatePropertyStorageSize, validateImageSize } from '../utils/validation.js';

const router = express.Router();

// Helper to initialize counter from existing properties (if needed)
async function initializePropertyCounter() {
  const counterRef = db.collection('counters').doc('property_id');
  const counterDoc = await counterRef.get();
  
  // If counter doesn't exist, initialize it
  if (!counterDoc.exists) {
    try {
      // Get all existing properties to find the highest HOAD number
      const propertiesSnapshot = await db.collection('properties').get();
      let maxNumber = 0;
      
      propertiesSnapshot.docs.forEach(doc => {
        const id = doc.id;
        // Check if ID matches HOAD format
        if (id.startsWith('HOAD') && id.length === 8) {
          const numberPart = parseInt(id.substring(4));
          if (!isNaN(numberPart) && numberPart > maxNumber) {
            maxNumber = numberPart;
          }
        }
      });
      
      // Set counter to max number found (next will be maxNumber + 1)
      await counterRef.set({
        count: maxNumber,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`✅ Initialized property counter at ${maxNumber}`);
    } catch (error) {
      console.error('❌ Error initializing counter:', error);
      // Set to 0 if initialization fails
      await counterRef.set({
        count: 0,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }
}

// Helper to generate next sequential property ID (HOAD0001, HOAD0002, etc.)
async function getNextPropertyId() {
  const counterRef = db.collection('counters').doc('property_id');
  
  try {
    // Initialize counter if needed
    await initializePropertyCounter();
    
    // Use transaction to atomically increment counter
    const newId = await db.runTransaction(async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      let currentCount = 1;
      if (counterDoc.exists) {
        currentCount = (counterDoc.data().count || 0) + 1;
      }
      
      // Update counter
      transaction.set(counterRef, {
        count: currentCount,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      // Generate ID in format HOAD0001, HOAD0002, etc.
      const formattedId = `HOAD${String(currentCount).padStart(4, '0')}`;
      return formattedId;
    });
    
    console.log(`✅ Generated property ID: ${newId}`);
    return newId;
  } catch (error) {
    console.error('❌ Error generating property ID:', error);
    throw new Error('Failed to generate property ID');
  }
}

// Helper to get images for a property (now stored as base64 in Firestore)
async function getPropertyImages(propertyId) {
  try {
    console.log(`📸 Fetching images for property: ${propertyId}`);
    
    // Try with orderBy first
    let snapshot;
    try {
      snapshot = await db.collection('property_images')
        .where('property_id', '==', propertyId)
        .orderBy('display_order', 'asc')
        .get();
    } catch (orderByError) {
      // If orderBy fails (missing index), fetch without orderBy and sort in memory
      console.log('⚠️ OrderBy failed, fetching without orderBy:', orderByError.message);
      snapshot = await db.collection('property_images')
        .where('property_id', '==', propertyId)
        .get();
      
      // Sort by display_order in memory
      const docs = snapshot.docs.sort((a, b) => {
        const orderA = a.data().display_order || 0;
        const orderB = b.data().display_order || 0;
        return orderA - orderB;
      });
      snapshot = { docs };
    }

    // Return base64 data URLs directly from Firestore
    const images = snapshot.docs.map(doc => {
      const data = doc.data();
      // Support both old URL format and new base64 format
      const imageData = data.image_data || data.image_url || '';
      return imageData;
    }).filter(img => img && img.trim() !== ''); // Filter out empty images

    console.log(`✅ Found ${images.length} images for property ${propertyId}`);
    return images;
  } catch (error) {
    console.error('❌ Error fetching images:', error);
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    return [];
  }
}

// Helper to compress and process image URLs
async function processImageUrl(imageUrl) {
  try {
    let compressedDataURL;
    
    // If it's already a data URL, validate and compress if needed
    if (imageUrl.startsWith('data:image')) {
      // Check if it's already compressed (small enough)
      const buffer = dataURLToBuffer(imageUrl);
      const sizeKB = buffer.length / 1024;
      
      if (sizeKB <= 11) {
        // Validate it's within limits
        const validation = validateImages([imageUrl], 15);
        if (validation.valid) {
          return imageUrl; // Already compressed and valid
        }
      }
      
      // Re-compress if needed
      compressedDataURL = await compressImageToDataURL(buffer, 11);
    }
    // If it's a URL, fetch and compress
    else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      compressedDataURL = await compressImageToDataURL(buffer, 11);
    }
    // If it's a base64 string without data URL prefix, add it and compress
    else if (imageUrl.length > 100 && !imageUrl.includes('://')) {
      const buffer = Buffer.from(imageUrl, 'base64');
      compressedDataURL = await compressImageToDataURL(buffer, 11);
    }
    else {
      throw new Error('Invalid image format');
    }
    
    // Final validation - ensure compressed image is within limits
    const validation = validateImages([compressedDataURL], 15);
    if (!validation.valid) {
      throw new Error(`Image compression failed: ${validation.errors[0]}`);
    }
    
    console.log(`✅ Image processed and validated: ${validation.sizes[0]}KB`);
    return compressedDataURL;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error; // Don't return invalid images
  }
}

// Helper to format property with related data
async function formatProperty(propDoc) {
  const prop = { id: propDoc.id, ...propDoc.data() };
  const images = await getPropertyImages(prop.id);
  
  // Get location and type data
  let locationName = '';
  let city = prop.city || 'Hyderabad';
  let typeName = '';
  
  if (prop.location_id) {
    const locationDoc = await db.collection('locations').doc(prop.location_id).get();
    if (locationDoc.exists) {
      const location = locationDoc.data();
      locationName = location.name || '';
      city = location.city || city;
    }
  }
  
  if (prop.type_id) {
    const typeDoc = await db.collection('property_types').doc(prop.type_id).get();
    if (typeDoc.exists) {
      typeName = typeDoc.data().name || '';
    }
  }
  
  // Ensure images array is always returned, even if empty
  const imageArray = Array.isArray(images) && images.length > 0 
    ? images.filter(img => img && typeof img === 'string' && img.trim() !== '')
    : [];
  
  console.log(`📦 Formatting property ${prop.id}:`, {
    title: prop.title,
    imagesCount: imageArray.length,
    hasFirstImage: imageArray.length > 0
  });

  return {
    id: prop.id,
    title: prop.title,
    type: typeName,
    area: locationName,
    city: city,
    price: prop.price,
    bedrooms: prop.bedrooms,
    bathrooms: prop.bathrooms,
    sqft: prop.sqft,
    description: prop.description || '',
    transactionType: prop.transaction_type || 'Sale',
    image: imageArray[0] || null,
    images: imageArray, // Always return array, even if empty
    isFeatured: prop.is_featured === true,
    isActive: prop.is_active !== false,
    amenities: Array.isArray(prop.amenities) ? prop.amenities : (prop.amenities ? JSON.parse(prop.amenities) : []),
    highlights: Array.isArray(prop.highlights) ? prop.highlights : (prop.highlights ? JSON.parse(prop.highlights) : []),
    brochureUrl: prop.brochure_url || '',
    mapUrl: prop.map_url || '',
    videoUrl: prop.video_url || '',
    createdAt: prop.created_at?.toDate?.() || prop.created_at
  };
}

// Get all properties
router.get('/', async (req, res) => {
  try {
    const { search, type, city, area, featured, active, transactionType } = req.query;
    
    console.log('📥 GET /properties - Raw query:', req.query);

    let query = db.collection('properties');
    
    // Get location_id and type_id if filters are provided
    let locationId = null;
    let typeId = null;

    if (area || city) {
      let locationQuery = db.collection('locations');
      if (area) locationQuery = locationQuery.where('name', '==', area);
      if (city) locationQuery = locationQuery.where('city', '==', city);
      const locationSnapshot = await locationQuery.limit(1).get();
      if (!locationSnapshot.empty) {
        locationId = locationSnapshot.docs[0].id;
      }
    }

    if (type) {
      const typeSnapshot = await db.collection('property_types')
        .where('name', '==', type)
        .limit(1)
        .get();
      if (!typeSnapshot.empty) {
        typeId = typeSnapshot.docs[0].id;
      }
    }

    // Apply filters
    if (typeId) {
      query = query.where('type_id', '==', typeId);
    }
    
    if (locationId) {
      query = query.where('location_id', '==', locationId);
    }
    
    // Note: Firestore requires a composite index when filtering by is_active AND ordering by created_at
    // To avoid this, we'll fetch all properties and filter/sort in memory when active filter is used
    const needsActiveFilter = active !== undefined;
    
    // Apply filters that don't conflict with orderBy
    if (featured !== undefined && !needsActiveFilter) {
      query = query.where('is_featured', '==', featured === 'true');
    }
    
    if (transactionType && String(transactionType).trim() !== '' && String(transactionType).trim() !== 'undefined' && !needsActiveFilter) {
      query = query.where('transaction_type', '==', String(transactionType).trim());
    }

    // Order by created_at descending (only if we're not filtering by active to avoid index requirement)
    if (!needsActiveFilter) {
      query = query.orderBy('created_at', 'desc');
    }

    const snapshot = await query.get();
    let properties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Apply active filter in memory if needed (to avoid Firestore composite index requirement)
    if (needsActiveFilter) {
      const activeValue = active === 'true';
      properties = properties.filter(prop => {
        // Handle both boolean and string values
        const propActive = prop.is_active === true || prop.is_active === 'true' || prop.is_active === 1;
        return propActive === activeValue;
      });
      
      // Also apply other filters in memory if active filter was used
      if (featured !== undefined) {
        const featuredValue = featured === 'true';
        properties = properties.filter(prop => {
          const propFeatured = prop.is_featured === true || prop.is_featured === 'true' || prop.is_featured === 1;
          return propFeatured === featuredValue;
        });
      }
      
      if (transactionType && String(transactionType).trim() !== '' && String(transactionType).trim() !== 'undefined') {
        const transactionValue = String(transactionType).trim();
        properties = properties.filter(prop => {
          return String(prop.transaction_type || '').trim() === transactionValue;
        });
      }
      
      // Sort by created_at descending in memory
      properties.sort((a, b) => {
        const dateA = a.created_at?.toDate?.() || a.created_at || new Date(0);
        const dateB = b.created_at?.toDate?.() || b.created_at || new Date(0);
        return dateB.getTime ? dateB.getTime() - dateA.getTime() : new Date(dateB) - new Date(dateA);
      });
    }

    // Apply search filter (Firestore doesn't support full-text search, so we filter in memory)
    if (search) {
      const searchLower = search.toLowerCase();
      properties = properties.filter(prop => 
        (prop.title || '').toLowerCase().includes(searchLower) ||
        (prop.description || '').toLowerCase().includes(searchLower)
      );
    }

    console.log(`📦 Found ${properties.length} properties from database`);

    // Format properties
    const formattedProperties = await Promise.all(properties.map(async (prop) => {
      return await formatProperty({ id: prop.id, data: () => prop });
    }));

    res.json(formattedProperties);
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get single property
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection('properties').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = await formatProperty(doc);

    res.json(property);
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create property (protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title, type, city, area, price, bedrooms, bathrooms, sqft,
      description, images, isFeatured, isActive, amenities, highlights,
      brochureUrl, mapUrl, videoUrl, transactionType
    } = req.body;

    console.log('Creating property with data:', { 
      title, type, city, area, price, transactionType,
      bedrooms, bathrooms, sqft 
    });

    // Validate required fields
    if (!title || !type || !area || !price) {
      return res.status(400).json({ error: 'Title, type, area, and price are required' });
    }

    // Get location_id and type_id
    const locationSnapshot = await db.collection('locations')
      .where('name', '==', area)
      .where('city', '==', city || 'Hyderabad')
      .limit(1)
      .get();
    
    const typeSnapshot = await db.collection('property_types')
      .where('name', '==', type)
      .limit(1)
      .get();

    if (locationSnapshot.empty) {
      return res.status(400).json({ error: `Location "${area}" not found. Please add it first.` });
    }
    
    if (typeSnapshot.empty) {
      return res.status(400).json({ error: `Property type "${type}" not found. Please add it first.` });
    }

    const locationId = locationSnapshot.docs[0].id;
    const typeId = typeSnapshot.docs[0].id;

    // Validate and compress images
    if (images && images.length > 0) {
      const imageValidation = validateImages(images, 15); // Allow up to 15KB per image (with margin)
      
      if (!imageValidation.valid) {
        return res.status(400).json({ 
          error: 'Image validation failed',
          details: imageValidation.errors,
          sizes: imageValidation.sizes
        });
      }

      console.log(`✅ Images validated: ${imageValidation.sizes.map(s => `${s}KB`).join(', ')}`);
    }

    // Validate content size
    const contentValidation = validateContentSize(description || '', 10000);
    if (!contentValidation.valid) {
      return res.status(400).json({ 
        error: contentValidation.error 
      });
    }

    // Compress description/content
    const compressedDescription = compressContent(description || '');

    // Calculate estimated storage size
    const estimatedSize = calculatePropertyStorageSize({
      description: compressedDescription,
      images: images || [],
      amenities,
      highlights
    });
    console.log(`📊 Estimated storage: ${estimatedSize}KB`);

    // Generate sequential property ID (HOAD0001, HOAD0002, etc.)
    const propertyId = await getNextPropertyId();
    
    // Insert property with custom ID
    const propertyRef = db.collection('properties').doc(propertyId);
    await propertyRef.set({
      title,
      location_id: locationId,
      type_id: typeId,
      city: city || 'Hyderabad',
      price: parseFloat(price) || 0,
      bedrooms: parseInt(bedrooms) || 0,
      bathrooms: parseInt(bathrooms) || 0,
      sqft: parseInt(sqft) || 0,
      description: compressedDescription,
      transaction_type: transactionType || 'Sale',
      is_featured: isFeatured ? true : false,
      is_active: isActive !== false,
      amenities: amenities || [],
      highlights: highlights || [],
      brochure_url: brochureUrl || '',
      map_url: mapUrl || '',
      video_url: videoUrl || '',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Property created with ID:', propertyId);

    // Process and store images as compressed base64 in Firestore
    if (images && images.length > 0) {
      const batch = db.batch();
      
      for (let index = 0; index < images.length; index++) {
        const imageUrl = images[index];
        
        try {
          // Compress image to ~11KB and convert to base64
          const compressedImageData = await processImageUrl(imageUrl);
          
          // Final validation before storing
          const imageValidation = validateImageSize(compressedImageData, 15);
          if (!imageValidation.valid) {
            throw new Error(`Image ${index + 1} validation failed: ${imageValidation.error}`);
          }
          
          const imageRef = db.collection('property_images').doc();
          batch.set(imageRef, {
            property_id: propertyId,
            image_data: compressedImageData, // Store as base64 data URL
            display_order: index,
            created_at: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`✅ Image ${index + 1} compressed and validated: ${imageValidation.sizeKB}KB`);
        } catch (error) {
          console.error(`❌ Error processing image ${index + 1}:`, error);
          // Don't continue - fail the entire operation if image validation fails
          return res.status(400).json({ 
            error: `Image ${index + 1} processing failed`,
            details: error.message
          });
        }
      }
      
      await batch.commit();
      console.log(`✅ ${images.length} images compressed and stored in Firestore`);
    }

    res.json({ success: true, id: propertyId });
  } catch (error) {
    console.error('Create property error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update property (protected)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, type, city, area, price, bedrooms, bathrooms, sqft,
      description, images, isFeatured, isActive, amenities, highlights,
      brochureUrl, mapUrl, videoUrl, transactionType
    } = req.body;

    // Get location_id and type_id
    const locationSnapshot = await db.collection('locations')
      .where('name', '==', area)
      .where('city', '==', city || 'Hyderabad')
      .limit(1)
      .get();
    
    const typeSnapshot = await db.collection('property_types')
      .where('name', '==', type)
      .limit(1)
      .get();

    if (locationSnapshot.empty || typeSnapshot.empty) {
      return res.status(400).json({ error: 'Invalid location or type' });
    }

    const locationId = locationSnapshot.docs[0].id;
    const typeId = typeSnapshot.docs[0].id;

    // Validate and compress images if provided
    if (images !== undefined && images.length > 0) {
      const imageValidation = validateImages(images, 15); // Allow up to 15KB per image
      
      if (!imageValidation.valid) {
        return res.status(400).json({ 
          error: 'Image validation failed',
          details: imageValidation.errors,
          sizes: imageValidation.sizes
        });
      }

      console.log(`✅ Images validated: ${imageValidation.sizes.map(s => `${s}KB`).join(', ')}`);
    }

    // Validate content size
    const contentValidation = validateContentSize(description || '', 10000);
    if (!contentValidation.valid) {
      return res.status(400).json({ 
        error: contentValidation.error 
      });
    }

    // Compress description/content
    const compressedDescription = compressContent(description || '');

    // Calculate estimated storage size
    const estimatedSize = calculatePropertyStorageSize({
      description: compressedDescription,
      images: images || [],
      amenities,
      highlights
    });
    console.log(`📊 Estimated storage: ${estimatedSize}KB`);

    // Update property
    await db.collection('properties').doc(id).update({
      title,
      location_id: locationId,
      type_id: typeId,
      city: city || 'Hyderabad',
      price: parseFloat(price) || 0,
      bedrooms: parseInt(bedrooms) || 0,
      bathrooms: parseInt(bathrooms) || 0,
      sqft: parseInt(sqft) || 0,
      description: compressedDescription,
      transaction_type: transactionType || 'Sale',
      is_featured: isFeatured ? true : false,
      is_active: isActive ? true : false,
      amenities: amenities || [],
      highlights: highlights || [],
      brochure_url: brochureUrl || '',
      map_url: mapUrl || '',
      video_url: videoUrl || '',
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update images
    if (images !== undefined) {
      // Delete existing images
      const imagesSnapshot = await db.collection('property_images')
        .where('property_id', '==', id)
        .get();
      
      const batch = db.batch();
      imagesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Process and insert new compressed images
      if (images.length > 0) {
        for (let index = 0; index < images.length; index++) {
          const imageUrl = images[index];
          
          try {
            // Compress image to ~11KB and convert to base64
            const compressedImageData = await processImageUrl(imageUrl);
            
            // Final validation before storing
            const imageValidation = validateImageSize(compressedImageData, 15);
            if (!imageValidation.valid) {
              throw new Error(`Image ${index + 1} validation failed: ${imageValidation.error}`);
            }
            
            const imageRef = db.collection('property_images').doc();
            batch.set(imageRef, {
              property_id: id,
              image_data: compressedImageData, // Store as base64 data URL
              display_order: index,
              created_at: admin.firestore.FieldValue.serverTimestamp()
            });
            
            console.log(`✅ Image ${index + 1} compressed and validated: ${imageValidation.sizeKB}KB`);
          } catch (error) {
            console.error(`❌ Error processing image ${index + 1}:`, error);
            // Don't continue - fail the entire operation if image validation fails
            return res.status(400).json({ 
              error: `Image ${index + 1} processing failed`,
              details: error.message
            });
          }
        }
      }
      
      await batch.commit();
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete property (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete images first
    const imagesSnapshot = await db.collection('property_images')
      .where('property_id', '==', id)
      .get();
    
    const batch = db.batch();
    imagesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete property
    batch.delete(db.collection('properties').doc(id));
    
    await batch.commit();

    res.json({ success: true });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle featured (protected)
router.patch('/:id/featured', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;
    
    await db.collection('properties').doc(id).update({
      is_featured: isFeatured ? true : false,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle active (protected)
router.patch('/:id/active', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    await db.collection('properties').doc(id).update({
      is_active: isActive ? true : false,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Toggle active error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
