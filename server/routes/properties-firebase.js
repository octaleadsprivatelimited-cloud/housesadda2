import express from 'express';
import { getDb } from '../db-firebase.js';
import admin from 'firebase-admin';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper to get database with error handling
function getDatabase() {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin SDK not initialized. Please restart the server.');
  }
  return getDb();
}

// Format property with related data
async function formatProperty(prop, db) {
  try {
    // Get location and type in parallel
    const [locationDoc, typeDoc] = await Promise.all([
      prop.location_id ? db.collection('locations').doc(prop.location_id).get() : Promise.resolve(null),
      prop.type_id ? db.collection('property_types').doc(prop.type_id).get() : Promise.resolve(null)
    ]);

    const location = locationDoc?.exists ? locationDoc.data() : null;
    const type = typeDoc?.exists ? typeDoc.data() : null;

    // Get images (try with orderBy, fallback without)
    let imagesSnapshot;
    try {
      imagesSnapshot = await db.collection('property_images')
        .where('property_id', '==', prop.id)
        .orderBy('display_order', 'asc')
        .get();
    } catch (error) {
      // If orderBy fails (missing index), fetch without orderBy
      imagesSnapshot = await db.collection('property_images')
        .where('property_id', '==', prop.id)
        .get();
    }
    
    const images = imagesSnapshot.docs
      .map(doc => {
        const data = doc.data();
        return data.image_data || data.image_url || '';
      })
      .filter(img => img && img.trim() !== '');

    return {
      id: prop.id,
      title: prop.title || '',
      type: type?.name || '',
      area: location?.name || '',
      city: location?.city || prop.city || 'Hyderabad',
      price: prop.price || 0,
      bedrooms: prop.bedrooms || 0,
      bathrooms: prop.bathrooms || 0,
      sqft: prop.sqft || 0,
      description: prop.description || '',
      transactionType: prop.transaction_type || 'Sale',
      image: images[0] || null,
      images: images,
      isFeatured: prop.is_featured === true,
      isActive: prop.is_active !== false,
      amenities: Array.isArray(prop.amenities) ? prop.amenities : [],
      highlights: Array.isArray(prop.highlights) ? prop.highlights : [],
      brochureUrl: prop.brochure_url || '',
      mapUrl: prop.map_url || '',
      videoUrl: prop.video_url || '',
      createdAt: prop.created_at?.toDate?.() || prop.created_at
    };
  } catch (error) {
    console.error('Error formatting property:', error);
    // Return basic property data if formatting fails
    return {
      id: prop.id,
      title: prop.title || '',
      type: '',
      area: '',
      city: prop.city || 'Hyderabad',
      price: prop.price || 0,
      bedrooms: prop.bedrooms || 0,
      bathrooms: prop.bathrooms || 0,
      sqft: prop.sqft || 0,
      description: prop.description || '',
      transactionType: prop.transaction_type || 'Sale',
      image: null,
      images: [],
      isFeatured: false,
      isActive: prop.is_active !== false,
      amenities: [],
      highlights: [],
      brochureUrl: '',
      mapUrl: '',
      videoUrl: '',
      createdAt: prop.created_at?.toDate?.() || prop.created_at
    };
  }
}

// Get all properties
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const { search, type, city, area, featured, active, transactionType, limit = 50, offset = 0, skipImages } = req.query;

    let query = db.collection('properties');

    // Get location_id and type_id if filters provided
    let locationId = null;
    let typeId = null;

    if (area || city) {
      let locationQuery = db.collection('locations');
      if (area) locationQuery = locationQuery.where('name', '==', area);
      if (city) locationQuery = locationQuery.where('city', '==', city);
      const locationSnapshot = await locationQuery.limit(1).get();
      if (!locationSnapshot.empty) locationId = locationSnapshot.docs[0].id;
    }

    if (type) {
      const typeSnapshot = await db.collection('property_types')
        .where('name', '==', type)
        .limit(1)
        .get();
      if (!typeSnapshot.empty) typeId = typeSnapshot.docs[0].id;
    }

    // Apply filters
    if (typeId) query = query.where('type_id', '==', typeId);
    if (locationId) query = query.where('location_id', '==', locationId);
    if (featured !== undefined) query = query.where('is_featured', '==', featured === 'true');
    if (transactionType) query = query.where('transaction_type', '==', transactionType);

    // Order and limit
    query = query.orderBy('created_at', 'desc');
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    query = query.limit(limitNum + offsetNum);

    const snapshot = await query.get();
    let properties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Apply active filter in memory if needed
    if (active !== undefined) {
      const activeValue = active === 'true';
      properties = properties.filter(prop => {
        const propActive = prop.is_active === true || prop.is_active === 'true';
        return propActive === activeValue;
      });
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      properties = properties.filter(prop =>
        (prop.title || '').toLowerCase().includes(searchLower) ||
        (prop.description || '').toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const paginatedProperties = properties.slice(offsetNum, offsetNum + limitNum);

    // Format properties (with error handling)
    const formattedProperties = [];
    for (const prop of paginatedProperties) {
      try {
        const formatted = await formatProperty(prop, db);
        formattedProperties.push(formatted);
      } catch (error) {
        console.error(`Error formatting property ${prop.id}:`, error);
        // Skip this property if formatting fails
      }
    }

    res.json({
      properties: formattedProperties,
      pagination: {
        total: properties.length,
        limit: limitNum,
        offset: offsetNum,
        hasMore: (offsetNum + limitNum) < properties.length
      }
    });
  } catch (error) {
    console.error('Get properties error:', error);
    if (error.message.includes('not initialized')) {
      return res.status(503).json({
        error: 'Database not available',
        message: error.message
      });
    }
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get single property
router.get('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const doc = await db.collection('properties').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = await formatProperty({ id: doc.id, ...doc.data() }, db);
    res.json(property);
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create property (protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();
    const {
      title, type, city, area, price, bedrooms, bathrooms, sqft,
      description, images, isFeatured, isActive, amenities, highlights,
      brochureUrl, mapUrl, videoUrl, transactionType
    } = req.body;

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

    if (locationSnapshot.empty || typeSnapshot.empty) {
      return res.status(400).json({ error: 'Invalid location or type' });
    }

    const locationId = locationSnapshot.docs[0].id;
    const typeId = typeSnapshot.docs[0].id;

    // Create property
    const propertyRef = await db.collection('properties').add({
      title,
      location_id: locationId,
      type_id: typeId,
      city: city || 'Hyderabad',
      price: parseFloat(price),
      bedrooms: parseInt(bedrooms) || 0,
      bathrooms: parseInt(bathrooms) || 0,
      sqft: parseInt(sqft) || 0,
      description: description || '',
      transaction_type: transactionType || 'Sale',
      is_featured: isFeatured === true,
      is_active: isActive !== false,
      amenities: amenities || [],
      highlights: highlights || [],
      brochure_url: brochureUrl || '',
      map_url: mapUrl || '',
      video_url: videoUrl || '',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    // Save images
    if (images && images.length > 0) {
      const batch = db.batch();
      images.forEach((imageData, index) => {
        const imageRef = db.collection('property_images').doc();
        batch.set(imageRef, {
          property_id: propertyRef.id,
          image_data: imageData,
          display_order: index,
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      await batch.commit();
    }

    res.json({ success: true, id: propertyRef.id });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Update property (protected)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const {
      title, type, city, area, price, bedrooms, bathrooms, sqft,
      description, images, isFeatured, isActive, amenities, highlights,
      brochureUrl, mapUrl, videoUrl, transactionType
    } = req.body;

    // Get location_id and type_id
    let locationId = null;
    let typeId = null;

    if (area || city) {
      const locationSnapshot = await db.collection('locations')
        .where('name', '==', area)
        .where('city', '==', city || 'Hyderabad')
        .limit(1)
        .get();
      if (!locationSnapshot.empty) locationId = locationSnapshot.docs[0].id;
    }

    if (type) {
      const typeSnapshot = await db.collection('property_types')
        .where('name', '==', type)
        .limit(1)
        .get();
      if (!typeSnapshot.empty) typeId = typeSnapshot.docs[0].id;
    }

    const updateData = {
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };

    if (title) updateData.title = title;
    if (locationId) updateData.location_id = locationId;
    if (typeId) updateData.type_id = typeId;
    if (city) updateData.city = city;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (bedrooms !== undefined) updateData.bedrooms = parseInt(bedrooms);
    if (bathrooms !== undefined) updateData.bathrooms = parseInt(bathrooms);
    if (sqft !== undefined) updateData.sqft = parseInt(sqft);
    if (description !== undefined) updateData.description = description;
    if (transactionType) updateData.transaction_type = transactionType;
    if (isFeatured !== undefined) updateData.is_featured = isFeatured === true;
    if (isActive !== undefined) updateData.is_active = isActive !== false;
    if (amenities !== undefined) updateData.amenities = amenities;
    if (highlights !== undefined) updateData.highlights = highlights;
    if (brochureUrl !== undefined) updateData.brochure_url = brochureUrl;
    if (mapUrl !== undefined) updateData.map_url = mapUrl;
    if (videoUrl !== undefined) updateData.video_url = videoUrl;

    await db.collection('properties').doc(id).update(updateData);

    // Update images if provided
    if (images !== undefined) {
      // Delete existing images
      const imagesSnapshot = await db.collection('property_images')
        .where('property_id', '==', id)
        .get();
      
      const batch = db.batch();
      imagesSnapshot.docs.forEach(doc => batch.delete(doc.ref));

      // Add new images
      images.forEach((imageData, index) => {
        const imageRef = db.collection('property_images').doc();
        batch.set(imageRef, {
          property_id: id,
          image_data: imageData,
          display_order: index,
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });
      });

      await batch.commit();
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Delete property (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    // Delete images
    const imagesSnapshot = await db.collection('property_images')
      .where('property_id', '==', id)
      .get();
    
    const batch = db.batch();
    imagesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
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
    const db = getDatabase();
    const { id } = req.params;
    const { isFeatured } = req.body;

    await db.collection('properties').doc(id).update({
      is_featured: isFeatured === true,
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
    const db = getDatabase();
    const { id } = req.params;
    const { isActive } = req.body;

    await db.collection('properties').doc(id).update({
      is_active: isActive === true,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Toggle active error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
