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

// Generate property ID based on transaction type: R#001 for Rent, B#001 for Buy/Sale
async function getNextPropertyId(transactionType, db) {
  try {
    const isRent = transactionType === 'Rent' || transactionType === 'PG';
    const prefix = isRent ? 'R' : 'B';
    const counterDocId = isRent ? 'property_id_rent' : 'property_id_buy';
    
    console.log(`🔢 Generating property ID for transaction type: ${transactionType} (prefix: ${prefix}, counter: ${counterDocId})`);
    
    const counterRef = db.collection('counters').doc(counterDocId);
    
    const newId = await db.runTransaction(async (transaction) => {
      try {
        const counterDoc = await transaction.get(counterRef);
        let currentCount = 0;
        
        if (counterDoc.exists) {
          currentCount = counterDoc.data().count || 0;
          console.log(`   Current count: ${currentCount}`);
        } else {
          console.log(`   Counter document doesn't exist, starting from 0`);
        }
        
        currentCount++;
        transaction.set(counterRef, {
          count: currentCount,
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        // Generate ID in format R#001, R#002, B#001, B#002, etc.
        const formattedId = `${prefix}#${String(currentCount).padStart(3, '0')}`;
        console.log(`   Generated ID: ${formattedId}`);
        return formattedId;
      } catch (transactionError) {
        console.error('❌ Transaction error:', transactionError);
        throw transactionError;
      }
    });
    
    console.log(`✅ Generated property ID: ${newId}`);
    return newId;
  } catch (error) {
    console.error('❌ getNextPropertyId error:', error);
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    throw error;
  }
}

// Optimized format property for list view (no images)
function formatPropertyList(prop, locationMap, typeMap) {
  const location = locationMap[prop.location_id];
  const type = typeMap[prop.type_id];
  
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
    image: null, // No image for list view (loaded separately)
    images: [],
    isFeatured: prop.is_featured === true,
    isActive: prop.is_active !== false,
    amenities: Array.isArray(prop.amenities) ? prop.amenities : [],
    highlights: Array.isArray(prop.highlights) ? prop.highlights : [],
    brochureUrl: prop.brochure_url || '',
    mapUrl: prop.map_url || '',
    videoUrl: prop.video_url || '',
    createdAt: prop.created_at?.toDate?.() || prop.created_at
  };
}

// Format property with related data (full version with images)
async function formatProperty(prop, db, skipImages = false) {
  try {
    // Get location and type in parallel
    const [locationDoc, typeDoc] = await Promise.all([
      prop.location_id ? db.collection('locations').doc(prop.location_id).get() : Promise.resolve(null),
      prop.type_id ? db.collection('property_types').doc(prop.type_id).get() : Promise.resolve(null)
    ]);

    const location = locationDoc?.exists ? locationDoc.data() : null;
    const type = typeDoc?.exists ? typeDoc.data() : null;

    // Get images only if not skipped
    let images = [];
    if (!skipImages) {
      try {
        const imagesSnapshot = await db.collection('property_images')
          .where('property_id', '==', prop.id)
          .orderBy('display_order', 'asc')
          .get();
        
        images = imagesSnapshot.docs
          .map(doc => {
            const data = doc.data();
            return data.image_data || data.image_url || '';
          })
          .filter(img => img && img.trim() !== '');
      } catch (error) {
        // If orderBy fails, fetch without orderBy
        try {
          const imagesSnapshot = await db.collection('property_images')
            .where('property_id', '==', prop.id)
            .get();
          
          images = imagesSnapshot.docs
            .map(doc => {
              const data = doc.data();
              return data.image_data || data.image_url || '';
            })
            .filter(img => img && img.trim() !== '')
            .sort((a, b) => {
              const orderA = imagesSnapshot.docs.find(d => (d.data().image_data || d.data().image_url) === a)?.data().display_order || 999;
              const orderB = imagesSnapshot.docs.find(d => (d.data().image_data || d.data().image_url) === b)?.data().display_order || 999;
              return orderA - orderB;
            });
        } catch (err) {
          console.warn(`Could not fetch images for property ${prop.id}`);
        }
      }
    }

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

// Get all properties (OPTIMIZED for fast loading) - Magicbricks style filtering
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const { search, type, city, area, featured, active, transactionType, limit = 20, offset = 0, skipImages, budget } = req.query;

    const shouldSkipImages = skipImages === 'true' || skipImages === true;
    const limitNum = Math.min(parseInt(limit) || 20, 100); // Max 100 per request
    const offsetNum = parseInt(offset) || 0;

    console.log('🔍 Properties API Request:', {
      transactionType,
      type,
      area,
      city,
      featured,
      active,
      search,
      budget,
      limit: limitNum,
      offset: offsetNum
    });

    let query = db.collection('properties');

    // ALWAYS filter by active=true for public queries (unless explicitly set to false)
    const activeValue = active === 'false' ? false : true;
    query = query.where('is_active', '==', activeValue);

    // Get location_id and type_id if filters provided
    let queryLocationId = null;
    let queryTypeId = null;

    // Location lookup with case-insensitive fallback
    if (area || city) {
      let locationQuery = db.collection('locations');
      if (area) {
        locationQuery = locationQuery.where('name', '==', area);
        if (city) {
          locationQuery = locationQuery.where('city', '==', city);
        }
        const locationSnapshot = await locationQuery.limit(1).get();
        if (!locationSnapshot.empty) {
          queryLocationId = locationSnapshot.docs[0].id;
        } else if (area && !city) {
          // Case-insensitive fallback
          const allLocations = await db.collection('locations').get();
          const matched = allLocations.docs.find(doc => {
            const locData = doc.data();
            return locData.name && locData.name.toLowerCase() === area.toLowerCase();
          });
          if (matched) queryLocationId = matched.id;
        }
      } else if (city) {
        locationQuery = locationQuery.where('city', '==', city);
        const locationSnapshot = await locationQuery.limit(1).get();
        if (!locationSnapshot.empty) queryLocationId = locationSnapshot.docs[0].id;
      }
    }

    // Type lookup with case-insensitive fallback
    if (type) {
      const typeSnapshot = await db.collection('property_types')
        .where('name', '==', type)
        .limit(1)
        .get();
      if (!typeSnapshot.empty) {
        queryTypeId = typeSnapshot.docs[0].id;
      } else {
        // Case-insensitive fallback
        const allTypes = await db.collection('property_types').get();
        const matched = allTypes.docs.find(doc => {
          const typeData = doc.data();
          return typeData.name && typeData.name.toLowerCase() === type.toLowerCase();
        });
        if (matched) queryTypeId = matched.id;
      }
    }

    // Apply Firestore filters (order matters for compound queries)
    // Apply transaction_type FIRST (most important filter)
    if (transactionType) {
      query = query.where('transaction_type', '==', transactionType);
    }
    if (queryTypeId) {
      query = query.where('type_id', '==', queryTypeId);
    }
    if (queryLocationId) {
      query = query.where('location_id', '==', queryLocationId);
    }
    if (featured !== undefined) {
      query = query.where('is_featured', '==', featured === 'true');
    }

    // Order and limit at Firestore level
    query = query.orderBy('created_at', 'desc');
    // Fetch more than needed for filtering (budget/search filters are in-memory)
    const fetchLimit = Math.min(limitNum + offsetNum + 100, 500); // Extra buffer for post-filtering
    query = query.limit(fetchLimit);

    const snapshot = await query.get();
    let properties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log(`📊 Found ${properties.length} properties after Firestore query`);

    // Apply search filter (in memory)
    if (search) {
      const searchLower = search.toLowerCase();
      properties = properties.filter(prop =>
        (prop.title || '').toLowerCase().includes(searchLower) ||
        (prop.description || '').toLowerCase().includes(searchLower) ||
        (prop.id || '').toLowerCase().includes(searchLower)
      );
      console.log(`🔎 After search filter: ${properties.length} properties`);
    }

    // Apply budget filter (price range) - parse budget string if provided
    let minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
    let maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;

    if (budget && !minPrice && !maxPrice) {
      // Parse budget string format: "min-max" or "min-" or "-max"
      const budgetParts = String(budget).split('-');
      if (budgetParts.length === 2) {
        minPrice = budgetParts[0] ? parseFloat(budgetParts[0]) : 0;
        maxPrice = budgetParts[1] ? parseFloat(budgetParts[1]) : Infinity;
      } else if (String(budget).startsWith('-')) {
        maxPrice = parseFloat(String(budget).substring(1));
        minPrice = 0;
      } else if (String(budget).endsWith('-')) {
        minPrice = parseFloat(String(budget).replace('-', ''));
        maxPrice = Infinity;
      }
    }

    if (minPrice !== null || maxPrice !== null) {
      properties = properties.filter(prop => {
        const price = parseFloat(prop.price) || 0;
        if (minPrice !== null && maxPrice !== null) {
          return price >= minPrice && price <= maxPrice;
        } else if (minPrice !== null) {
          return price >= minPrice;
        } else if (maxPrice !== null) {
          return price <= maxPrice;
        }
        return true;
      });
      console.log(`💰 After budget filter: ${properties.length} properties`);
    }

    // Apply pagination
    const paginatedProperties = properties.slice(offsetNum, offsetNum + limitNum);
    console.log(`📄 Returning ${paginatedProperties.length} properties (offset: ${offsetNum}, limit: ${limitNum})`);

    // OPTIMIZATION: Batch fetch all locations and types upfront
    const locationIds = [...new Set(paginatedProperties.map(p => p.location_id).filter(Boolean))];
    const typeIds = [...new Set(paginatedProperties.map(p => p.type_id).filter(Boolean))];

    const [locationDocs, typeDocs] = await Promise.all([
      locationIds.length > 0 
        ? Promise.all(locationIds.map(id => db.collection('locations').doc(id).get()))
        : Promise.resolve([]),
      typeIds.length > 0
        ? Promise.all(typeIds.map(id => db.collection('property_types').doc(id).get()))
        : Promise.resolve([])
    ]);

    const locationMap = {};
    locationDocs.forEach(doc => {
      if (doc.exists) locationMap[doc.id] = doc.data();
    });

    const typeMap = {};
    typeDocs.forEach(doc => {
      if (doc.exists) typeMap[doc.id] = doc.data();
    });

    // OPTIMIZATION: Batch fetch first image for each property (only if not skipping)
    const imagesMap = {};
    if (!shouldSkipImages && paginatedProperties.length > 0) {
      const propertyIds = paginatedProperties.map(p => p.id);
      
      // Fetch in batches of 10 (Firestore 'in' query limit)
      for (let i = 0; i < propertyIds.length; i += 10) {
        const batch = propertyIds.slice(i, i + 10);
        try {
          const imagesSnapshot = await db.collection('property_images')
            .where('property_id', 'in', batch)
            .get();
          
          imagesSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const propId = data.property_id;
            if (!imagesMap[propId]) {
              imagesMap[propId] = [];
            }
            // Only add first image for list view
            if (imagesMap[propId].length === 0) {
              const imageData = data.image_data || data.image_url || '';
              if (imageData && imageData.trim() !== '') {
                imagesMap[propId].push(imageData);
              }
            }
          });
        } catch (error) {
          console.warn(`Error fetching images for batch:`, error.message);
        }
      }
    }

    // Format properties using cached data (FAST!)
    const formattedProperties = paginatedProperties.map(prop => {
      const formatted = formatPropertyList(prop, locationMap, typeMap);
      // Add first image if available
      if (imagesMap[prop.id] && imagesMap[prop.id].length > 0) {
        formatted.image = imagesMap[prop.id][0];
        formatted.images = imagesMap[prop.id];
      }
      return formatted;
    });

    res.json({
      success: true,
      properties: formattedProperties,
      pagination: {
        total: properties.length,
        limit: limitNum,
        offset: offsetNum,
        hasMore: (offsetNum + limitNum) < properties.length
      },
      filters: {
        transactionType: transactionType || null,
        type: type || null,
        area: area || null,
        city: city || null,
        budget: budget || null
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

// Search API endpoint - optimized for home page search filters
// MUST be before /:id route to avoid route conflicts
router.get('/search', async (req, res) => {
  try {
    const db = getDatabase();
    const { 
      transactionType, 
      area, 
      type, 
      city,
      budget, // Format: "min-max" or "min-" or "-max"
      minPrice,
      maxPrice,
      limit = 20,
      offset = 0,
      skipImages = false
    } = req.query;

    const shouldSkipImages = skipImages === 'true' || skipImages === true;
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const offsetNum = parseInt(offset) || 0;

    let query = db.collection('properties');

    // Get location_id and type_id if filters provided
    let searchLocationId = null;
    let searchTypeId = null;

    // Location lookup
    if (area || city) {
      let locationQuery = db.collection('locations');
      if (area) {
        locationQuery = locationQuery.where('name', '==', area);
        if (city) {
          locationQuery = locationQuery.where('city', '==', city);
        }
        const locationSnapshot = await locationQuery.limit(1).get();
        if (!locationSnapshot.empty) {
          searchLocationId = locationSnapshot.docs[0].id;
        } else if (area && !city) {
          // Case-insensitive fallback
          const allLocations = await db.collection('locations').get();
          const matched = allLocations.docs.find(doc => {
            const locData = doc.data();
            return locData.name && locData.name.toLowerCase() === area.toLowerCase();
          });
          if (matched) searchLocationId = matched.id;
        }
      } else if (city) {
        locationQuery = locationQuery.where('city', '==', city);
        const locationSnapshot = await locationQuery.limit(1).get();
        if (!locationSnapshot.empty) searchLocationId = locationSnapshot.docs[0].id;
      }
    }

    // Type lookup
    if (type) {
      const typeSnapshot = await db.collection('property_types')
        .where('name', '==', type)
        .limit(1)
        .get();
      if (!typeSnapshot.empty) {
        searchTypeId = typeSnapshot.docs[0].id;
      } else {
        // Case-insensitive fallback
        const allTypes = await db.collection('property_types').get();
        const matched = allTypes.docs.find(doc => {
          const typeData = doc.data();
          return typeData.name && typeData.name.toLowerCase() === type.toLowerCase();
        });
        if (matched) searchTypeId = matched.id;
      }
    }

    // Apply Firestore filters
    if (searchTypeId) query = query.where('type_id', '==', searchTypeId);
    if (searchLocationId) query = query.where('location_id', '==', searchLocationId);
    if (transactionType) query = query.where('transaction_type', '==', transactionType);
    
    // Only show active properties for public search
    query = query.where('is_active', '==', true);

    // Order and limit
    query = query.orderBy('created_at', 'desc');
    query = query.limit(limitNum + offsetNum);

    const snapshot = await query.get();
    let properties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Parse budget range if provided
    let parsedMinPrice = minPrice ? parseFloat(minPrice) : null;
    let parsedMaxPrice = maxPrice ? parseFloat(maxPrice) : null;

    if (budget && !parsedMinPrice && !parsedMaxPrice) {
      // Parse budget string format: "min-max" or "min-" or "-max"
      const budgetParts = budget.split('-');
      if (budgetParts.length === 2) {
        parsedMinPrice = budgetParts[0] ? parseFloat(budgetParts[0]) : 0;
        parsedMaxPrice = budgetParts[1] ? parseFloat(budgetParts[1]) : Infinity;
      } else if (budget.startsWith('-')) {
        parsedMaxPrice = parseFloat(budget.substring(1));
        parsedMinPrice = 0;
      } else if (budget.endsWith('-')) {
        parsedMinPrice = parseFloat(budget.replace('-', ''));
        parsedMaxPrice = Infinity;
      }
    }

    // Apply budget/price filter
    if (parsedMinPrice !== null || parsedMaxPrice !== null) {
      properties = properties.filter(prop => {
        const price = parseFloat(prop.price) || 0;
        if (parsedMinPrice !== null && parsedMaxPrice !== null) {
          return price >= parsedMinPrice && price <= parsedMaxPrice;
        } else if (parsedMinPrice !== null) {
          return price >= parsedMinPrice;
        } else if (parsedMaxPrice !== null) {
          return price <= parsedMaxPrice;
        }
        return true;
      });
    }

    // Apply pagination
    const hasMore = properties.length > limitNum;
    const paginatedProperties = properties.slice(offsetNum, offsetNum + limitNum);

    // Batch fetch locations and types
    const locationIds = [...new Set(paginatedProperties.map(p => p.location_id).filter(Boolean))];
    const typeIds = [...new Set(paginatedProperties.map(p => p.type_id).filter(Boolean))];

    const [locationDocs, typeDocs] = await Promise.all([
      locationIds.length > 0 
        ? Promise.all(locationIds.map(id => db.collection('locations').doc(id).get()))
        : Promise.resolve([]),
      typeIds.length > 0
        ? Promise.all(typeIds.map(id => db.collection('property_types').doc(id).get()))
        : Promise.resolve([])
    ]);

    const locationMap = {};
    locationDocs.forEach(doc => {
      if (doc.exists) locationMap[doc.id] = doc.data();
    });

    const typeMap = {};
    typeDocs.forEach(doc => {
      if (doc.exists) typeMap[doc.id] = doc.data();
    });

    // Format properties
    const formattedProperties = [];
    for (const prop of paginatedProperties) {
      try {
        const formatted = shouldSkipImages 
          ? formatPropertyList(prop, locationMap, typeMap)
          : await formatProperty(prop, db, shouldSkipImages);
        formattedProperties.push(formatted);
      } catch (error) {
        console.error(`Error formatting property ${prop.id}:`, error);
      }
    }

    res.json({
      success: true,
      properties: formattedProperties,
      pagination: {
        total: properties.length,
        limit: limitNum,
        offset: offsetNum,
        hasMore: hasMore
      },
      filters: {
        transactionType: transactionType || null,
        area: area || null,
        type: type || null,
        city: city || null,
        budget: budget || null,
        minPrice: parsedMinPrice,
        maxPrice: parsedMaxPrice === Infinity ? null : parsedMaxPrice
      }
    });
  } catch (error) {
    console.error('Search API error:', error);
    if (error.message.includes('not initialized')) {
      return res.status(503).json({
        success: false,
        error: 'Database not available',
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get single property (with all images)
router.get('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const doc = await db.collection('properties').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = await formatProperty({ id: doc.id, ...doc.data() }, db, false);
    res.json(property);
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create property (protected) - with new ID format
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

    console.log('📝 Creating property with data:', {
      title,
      type,
      city: city || 'Hyderabad',
      area,
      transactionType: transactionType || 'Sale'
    });

    // Get location_id and type_id with better error handling
    let foundLocationId = null;
    let foundTypeId = null;

    // Location lookup with case-insensitive fallback
    if (area) {
      let locationQuery = db.collection('locations')
        .where('name', '==', area);
      if (city) {
        locationQuery = locationQuery.where('city', '==', city || 'Hyderabad');
      }
      const locationSnapshot = await locationQuery.limit(1).get();
      
      if (!locationSnapshot.empty) {
        foundLocationId = locationSnapshot.docs[0].id;
      } else {
        // Case-insensitive fallback
        const allLocations = await db.collection('locations').get();
        const matched = allLocations.docs.find(doc => {
          const locData = doc.data();
          const nameMatch = locData.name && locData.name.toLowerCase() === area.toLowerCase();
          const cityMatch = !city || locData.city === (city || 'Hyderabad');
          return nameMatch && cityMatch;
        });
        if (matched) {
          foundLocationId = matched.id;
        } else {
          console.error(`❌ Location not found: ${area}, ${city || 'Hyderabad'}`);
          return res.status(400).json({ 
            error: 'Invalid location', 
            message: `Location "${area}" not found. Please create this location first in the Locations section.`,
            details: { area, city: city || 'Hyderabad' }
          });
        }
      }
    } else {
      return res.status(400).json({ error: 'Area is required' });
    }
    
    // Type lookup with case-insensitive fallback
    if (type) {
      const typeSnapshot = await db.collection('property_types')
        .where('name', '==', type)
        .limit(1)
        .get();
      
      if (!typeSnapshot.empty) {
        foundTypeId = typeSnapshot.docs[0].id;
      } else {
        // Case-insensitive fallback
        const allTypes = await db.collection('property_types').get();
        const matched = allTypes.docs.find(doc => {
          const typeData = doc.data();
          return typeData.name && typeData.name.toLowerCase() === type.toLowerCase();
        });
        if (matched) {
          foundTypeId = matched.id;
        } else {
          console.error(`❌ Property type not found: ${type}`);
          return res.status(400).json({ 
            error: 'Invalid property type', 
            message: `Property type "${type}" not found. Please create this type first in the Types section.`,
            details: { type }
          });
        }
      }
    } else {
      return res.status(400).json({ error: 'Property type is required' });
    }

    console.log(`✅ Found location_id: ${foundLocationId}, type_id: ${foundTypeId}`);

    const finalTransactionType = transactionType || 'Sale';

    // Generate property ID: R#001 for Rent, B#001 for Buy/Sale
    let propertyId;
    try {
      propertyId = await getNextPropertyId(finalTransactionType, db);
      console.log(`✅ Generated property ID: ${propertyId}`);
    } catch (idError) {
      console.error('❌ Error generating property ID:', idError);
      console.error('   Message:', idError.message);
      console.error('   Stack:', idError.stack);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to generate property ID', 
        message: idError.message || 'Database transaction failed. Please try again.',
        details: process.env.NODE_ENV === 'development' ? {
          stack: idError.stack,
          name: idError.name
        } : undefined
      });
    }

    // Create property with custom ID
    try {
      const propertyData = {
        title: String(title).trim(),
        location_id: foundLocationId,
        type_id: foundTypeId,
        city: city || 'Hyderabad',
        price: parseFloat(price) || 0,
        bedrooms: parseInt(bedrooms) || 0,
        bathrooms: parseInt(bathrooms) || 0,
        sqft: parseInt(sqft) || 0,
        description: String(description || '').trim(),
        transaction_type: finalTransactionType,
        is_featured: isFeatured === true,
        is_active: isActive !== false,
        amenities: Array.isArray(amenities) ? amenities : [],
        highlights: Array.isArray(highlights) ? highlights : [],
        brochure_url: String(brochureUrl || '').trim(),
        map_url: String(mapUrl || '').trim(),
        video_url: String(videoUrl || '').trim(),
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('properties').doc(propertyId).set(propertyData);
      console.log(`✅ Property created: ${propertyId}`);
    } catch (createError) {
      console.error('❌ Error creating property document:', createError);
      console.error('   Stack:', createError.stack);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to create property', 
        message: createError.message || 'Database write failed. Please try again.'
      });
    }

    // Save images (non-blocking - property is already created)
    let imagesSaved = 0;
    let imagesError = null;
    
    if (images && Array.isArray(images) && images.length > 0) {
      try {
        const batch = db.batch();
        const validImages = images.filter(img => img && typeof img === 'string' && img.trim() !== '');
        
        // Limit images to prevent batch size issues (Firestore batch limit is 500 operations)
        const imagesToSave = validImages.slice(0, 10); // Limit to 10 images per property
        
        if (imagesToSave.length > 0) {
          imagesToSave.forEach((imageData, index) => {
            try {
              // Validate image data size before adding to batch
              const imageDataStr = String(imageData);
              if (imageDataStr.length > 10485760) {
                console.warn(`⚠️  Image ${index} is too large (${imageDataStr.length} bytes), truncating to 10MB`);
              }
              
              const imageRef = db.collection('property_images').doc();
              batch.set(imageRef, {
                property_id: propertyId,
                image_data: imageDataStr.substring(0, 10485760), // Limit to 10MB per image (Firestore limit)
                display_order: index,
                created_at: admin.firestore.FieldValue.serverTimestamp()
              });
            } catch (imgError) {
              console.error(`❌ Error processing image ${index}:`, imgError.message);
              // Continue with other images
            }
          });
          
          if (imagesToSave.length > 0) {
            await batch.commit();
            imagesSaved = imagesToSave.length;
            console.log(`✅ Saved ${imagesSaved} images for property ${propertyId}`);
          }
        }
      } catch (imageError) {
        console.error('❌ Error saving images:', imageError);
        console.error('   Message:', imageError.message);
        console.error('   Stack:', imageError.stack);
        imagesError = imageError.message;
        // Don't fail the whole request - property is already created successfully
        console.warn('⚠️  Property created but images failed to save');
      }
    }

    // Send success response - property was created successfully
    // Include image save status in response
    return res.json({ 
      success: true, 
      id: propertyId,
      message: 'Property created successfully',
      images: {
        saved: imagesSaved,
        total: images && Array.isArray(images) ? images.length : 0,
        error: imagesError || null
      }
    });
  } catch (error) {
    console.error('❌ Create property error:', error);
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    console.error('   Request body keys:', Object.keys(req.body || {}));
    
    // Check if response was already sent
    if (res.headersSent) {
      console.error('⚠️  Response already sent, cannot send error response');
      return;
    }
    
    // Return detailed error for debugging
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error', 
      message: error.message || 'An unexpected error occurred while creating the property',
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        name: error.name
      } : undefined
    });
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
    let updateLocationId = null;
    let updateTypeId = null;

    if (area || city) {
      const locationSnapshot = await db.collection('locations')
        .where('name', '==', area)
        .where('city', '==', city || 'Hyderabad')
        .limit(1)
        .get();
      if (!locationSnapshot.empty) updateLocationId = locationSnapshot.docs[0].id;
    }

    if (type) {
      const typeSnapshot = await db.collection('property_types')
        .where('name', '==', type)
        .limit(1)
        .get();
      if (!typeSnapshot.empty) updateTypeId = typeSnapshot.docs[0].id;
    }

    const updateData = {
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };

    if (title) updateData.title = title;
    if (updateLocationId) updateData.location_id = updateLocationId;
    if (updateTypeId) updateData.type_id = updateTypeId;
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
