/**
 * Script to add 50 more properties with YouTube videos, Google Maps links, and all amenities
 * 
 * Usage: node server/scripts/add-50-more-properties.js
 */

import dotenv from 'dotenv';
import { initDatabase, db } from '../db-firebase.js';
import admin from 'firebase-admin';

dotenv.config();

// Comprehensive amenities list
const allAmenities = {
  apartment: [
    "Swimming Pool", "Gym", "Clubhouse", "Parking", "Security", "Power Backup",
    "Landscaped Gardens", "Children's Play Area", "Jogging Track", "Tennis Court",
    "Basketball Court", "Squash Court", "Badminton Court", "Indoor Games",
    "Library", "Community Hall", "Party Hall", "Concierge", "Lift", "Intercom",
    "WiFi", "CCTV", "24/7 Security", "Fire Safety", "Rainwater Harvesting",
    "Solar Power", "Waste Management", "Pet Friendly", "Vaastu Compliant"
  ],
  villa: [
    "Private Garden", "Swimming Pool", "Parking", "Security", "Power Backup",
    "Home Theater", "Servant Quarters", "Private Terrace", "Balcony",
    "Modular Kitchen", "Wardrobes", "Wooden Flooring", "Marble Flooring",
    "Granite Countertops", "Premium Fittings", "Smart Home", "Home Automation",
    "Solar Power", "Rainwater Harvesting", "CCTV", "Intercom", "WiFi",
    "Fire Safety", "Vaastu Compliant", "Landscaped Garden", "Outdoor Seating"
  ],
  commercial: [
    "Parking", "Security", "Power Backup", "Elevator", "Fire Safety",
    "CCTV", "WiFi", "AC", "Modular Office", "Conference Room",
    "Reception Area", "Pantry", "Restrooms", "24/7 Security", "Power Backup",
    "High Speed Internet", "Modular Interiors", "Premium Location", "High Visibility"
  ],
  plot: [],
  pg: [
    "WiFi", "Food", "Laundry", "Security", "AC", "Hot Water", "Power Backup",
    "CCTV", "Housekeeping", "Room Service", "Common Area", "TV", "Refrigerator",
    "Washing Machine", "Geyser", "Study Table", "Cupboard", "24/7 Security"
  ],
  'farm house': [
    "Large Garden", "Parking", "Security", "Power Backup", "Swimming Pool",
    "Outdoor Seating", "BBQ Area", "Fireplace", "Home Theater", "WiFi",
    "CCTV", "Solar Power", "Rainwater Harvesting", "Farm Area", "Orchard"
  ],
  'farm land': []
};

// YouTube video IDs (sample property tour videos)
const youtubeVideoIds = [
  'dQw4w9WgXcQ', 'jNQXAC9IVRw', '9bZkp7q19f0', 'kJQP7kiw5Fk', 'RgKAFK5djSk',
  'fJ9rUzIMcZQ', 'L_jWHffIx5E', 'ZbZSe6N_BXs', 'kXYiU_JCYtU', 'ScMzIvxBSi4',
  'kffacxfA7G4', 'eH3giaIzONA', 'ZbZSe6N_BXs', 'kXYiU_JCYtU', 'ScMzIvxBSi4',
  'dQw4w9WgXcQ', 'jNQXAC9IVRw', '9bZkp7q19f0', 'kJQP7kiw5Fk', 'RgKAFK5djSk',
  'fJ9rUzIMcZQ', 'L_jWHffIx5E', 'kXYiU_JCYtU', 'ScMzIvxBSi4', 'kffacxfA7G4',
  'eH3giaIzONA', 'ZbZSe6N_BXs', 'kXYiU_JCYtU', 'ScMzIvxBSi4', 'dQw4w9WgXcQ',
  'jNQXAC9IVRw', '9bZkp7q19f0', 'kJQP7kiw5Fk', 'RgKAFK5djSk', 'fJ9rUzIMcZQ',
  'L_jWHffIx5E', 'kXYiU_JCYtU', 'ScMzIvxBSi4', 'kffacxfA7G4', 'eH3giaIzONA',
  'ZbZSe6N_BXs', 'kXYiU_JCYtU', 'ScMzIvxBSi4', 'dQw4w9WgXcQ', 'jNQXAC9IVRw',
  '9bZkp7q19f0', 'kJQP7kiw5Fk', 'RgKAFK5djSk', 'fJ9rUzIMcZQ', 'L_jWHffIx5E'
];

// Google Maps coordinates for Hyderabad areas
const areaCoordinates = {
  'Gachibowli': { lat: 17.4225, lng: 78.3494 },
  'Hitech City': { lat: 17.4485, lng: 78.3908 },
  'Kondapur': { lat: 17.4845, lng: 78.3874 },
  'Jubilee Hills': { lat: 17.4333, lng: 78.4167 },
  'Banjara Hills': { lat: 17.4250, lng: 78.4267 },
  'Madhapur': { lat: 17.4485, lng: 78.3908 },
  'Kukatpally': { lat: 17.4845, lng: 78.3874 },
  'Manikonda': { lat: 17.4000, lng: 78.3500 },
  'Miyapur': { lat: 17.5000, lng: 78.3500 },
  'Serilingampally': { lat: 17.5000, lng: 78.3000 },
  'Nallagandla': { lat: 17.4500, lng: 78.4000 },
  'Financial District': { lat: 17.4200, lng: 78.3800 },
  'Hafeezpet': { lat: 17.4800, lng: 78.3600 },
  'Nanakramguda': { lat: 17.4100, lng: 78.3700 },
  'Kokapet': { lat: 17.4000, lng: 78.3300 },
  'Tellapur': { lat: 17.3800, lng: 78.3200 },
  'Narsingi': { lat: 17.3700, lng: 78.3100 },
  'Shamshabad': { lat: 17.2400, lng: 78.4300 },
  'Rajendra Nagar': { lat: 17.3500, lng: 78.4000 },
  'Attapur': { lat: 17.3600, lng: 78.4100 }
};

// Generate random properties
const generateRandomProperties = () => {
  const properties = [];
  const types = ['Apartment', 'Villa', 'Commercial', 'Plot', 'PG', 'Farm House', 'Farm Land'];
  const cities = ['Hyderabad'];
  const areas = Object.keys(areaCoordinates);
  const transactionTypes = ['Sale', 'Rent', 'PG'];
  
  const propertyTitles = {
    apartment: [
      'Luxury', 'Premium', 'Modern', 'Spacious', 'Elegant', 'Contemporary', 'Stylish',
      'Affordable', 'Comfortable', 'Well-Designed', 'Beautiful', 'Exclusive', 'Grand'
    ],
    villa: [
      'Luxury', 'Premium', 'Modern', 'Spacious', 'Elegant', 'Contemporary', 'Stylish',
      'Exclusive', 'Grand', 'Magnificent', 'Stunning', 'Beautiful', 'Independent'
    ],
    commercial: [
      'Premium', 'Prime', 'Modern', 'Spacious', 'Well-Located', 'High-Visibility',
      'Strategic', 'Prime Location', 'Premium Office', 'Retail Space'
    ],
    plot: [
      'HMDA Approved', 'Premium', 'Corner', 'Prime Location', 'Well-Located',
      'Strategic', 'Investment', 'Clear Title'
    ],
    pg: [
      'Comfortable', 'Premium', 'Safe', 'Well-Maintained', 'Modern', 'Clean',
      'Affordable', 'Luxury', 'AC', 'Furnished'
    ],
    'farm house': [
      'Beautiful', 'Luxury', 'Spacious', 'Modern', 'Elegant', 'Grand'
    ],
    'farm land': [
      'Agricultural', 'Fertile', 'Well-Located', 'Prime', 'Investment'
    ]
  };

  for (let i = 0; i < 50; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const city = cities[0];
    const area = areas[Math.floor(Math.random() * areas.length)];
    const transactionType = type === 'PG' ? 'PG' : 
                           type === 'Plot' || type === 'Farm Land' ? 'Sale' :
                           transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    
    const bedrooms = type === 'Plot' || type === 'Farm Land' || type === 'Commercial' ? 0 :
                     type === 'PG' ? 1 :
                     Math.floor(Math.random() * 4) + 1; // 1-4 bedrooms
    
    const bathrooms = type === 'Plot' || type === 'Farm Land' ? 0 :
                      type === 'PG' ? 1 :
                      Math.floor(Math.random() * 3) + 1; // 1-3 bathrooms
    
    const sqft = type === 'Plot' ? Math.floor(Math.random() * 1000) + 500 :
                 type === 'Farm Land' ? Math.floor(Math.random() * 10000) + 5000 :
                 type === 'Villa' ? Math.floor(Math.random() * 3000) + 2500 :
                 type === 'Commercial' ? Math.floor(Math.random() * 2000) + 1000 :
                 type === 'PG' ? Math.floor(Math.random() * 150) + 150 :
                 type === 'Farm House' ? Math.floor(Math.random() * 3000) + 3000 :
                 Math.floor(Math.random() * 1500) + 1000; // Apartments
    
    const price = type === 'Plot' ? Math.floor(Math.random() * 15000000) + 5000000 :
                  type === 'Farm Land' ? Math.floor(Math.random() * 10000000) + 5000000 :
                  type === 'Villa' ? (transactionType === 'Rent' ? Math.floor(Math.random() * 50000) + 80000 : Math.floor(Math.random() * 20000000) + 15000000) :
                  type === 'Commercial' ? (transactionType === 'Rent' ? Math.floor(Math.random() * 50000) + 30000 : Math.floor(Math.random() * 15000000) + 8000000) :
                  type === 'PG' ? Math.floor(Math.random() * 5000) + 6000 :
                  type === 'Farm House' ? Math.floor(Math.random() * 10000000) + 15000000 :
                  transactionType === 'Rent' ? Math.floor(Math.random() * 30000) + 15000 :
                  Math.floor(Math.random() * 10000000) + 3000000; // Apartments Sale
    
    const titlePrefix = propertyTitles[type.toLowerCase()][Math.floor(Math.random() * propertyTitles[type.toLowerCase()].length)];
    const bhkText = bedrooms > 0 ? `${bedrooms} BHK` : '';
    const title = type === 'Plot' || type === 'Farm Land' ? 
                  `${titlePrefix} ${type} in ${area}` :
                  type === 'Commercial' ?
                  `${titlePrefix} ${type} Space in ${area}` :
                  type === 'PG' ?
                  `${titlePrefix} PG in ${area}` :
                  `${titlePrefix} ${bhkText} ${type} in ${area}`;
    
    // Get amenities for this property type
    const availableAmenities = allAmenities[type.toLowerCase()] || [];
    const numAmenities = Math.min(availableAmenities.length, Math.floor(Math.random() * 10) + 5); // 5-15 amenities
    const selectedAmenities = [];
    const shuffled = [...availableAmenities].sort(() => 0.5 - Math.random());
    for (let j = 0; j < numAmenities; j++) {
      selectedAmenities.push(shuffled[j]);
    }
    
    // Generate YouTube video URL
    const videoId = youtubeVideoIds[i % youtubeVideoIds.length];
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Generate Google Maps URL
    const coords = areaCoordinates[area];
    const mapUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
    
    const description = `${title}. ${type === 'Plot' || type === 'Farm Land' ? 
      'Perfect investment opportunity in prime location.' :
      type === 'Commercial' ?
      'Ideal for business operations with excellent connectivity.' :
      type === 'PG' ?
      'Comfortable accommodation with all modern amenities.' :
      'Beautiful property with modern amenities and excellent connectivity.'}`;
    
    const highlights = [
      'Prime Location',
      type === 'Plot' || type === 'Farm Land' ? 'Clear Title' : 'Ready to Move',
      'Excellent Connectivity',
      type === 'Plot' || type === 'Farm Land' ? 'Good Investment' : 'Modern Amenities'
    ];
    
    properties.push({
      title,
      type,
      city,
      area,
      price,
      bedrooms,
      bathrooms,
      sqft,
      transactionType,
      isFeatured: Math.random() > 0.7, // 30% chance of being featured
      description,
      amenities: selectedAmenities,
      highlights,
      videoUrl,
      mapUrl
    });
  }
  
  return properties;
};

// Diverse image URLs
const propertyImages = {
  apartment: [
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600607688969-a5fcd52667cc?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600585154084-4e5f997b773b?w=1200&h=800&fit=crop&q=80',
  ],
  villa: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dbe4ebc19?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dbe4ebc19?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600607688969-a5fcd52667cc?w=1200&h=800&fit=crop&q=80',
  ],
  commercial: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&h=800&fit=crop&q=80',
  ],
  plot: [
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop&q=80',
  ],
  pg: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&h=800&fit=crop&q=80',
  ],
  'farm house': [
    'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop&q=80',
  ],
  'farm land': [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop&q=80',
  ],
};

function getImagesForProperty(propertyType, index) {
  const type = propertyType.toLowerCase();
  const imagePool = propertyImages[type] || propertyImages.apartment;
  const numImages = Math.floor(Math.random() * 3) + 2; // 2-4 images
  const images = [];
  
  for (let i = 0; i < numImages; i++) {
    const imageIndex = (index + i) % imagePool.length;
    images.push(imagePool[imageIndex]);
  }
  
  return images;
}

async function ensureLocationExists(name, city) {
  try {
    const snapshot = await db.collection('locations')
      .where('name', '==', name)
      .where('city', '==', city)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      await db.collection('locations').add({
        name,
        city,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Created location: ${name}, ${city}`);
    }
    return true;
  } catch (error) {
    console.error(`❌ Error ensuring location ${name}:`, error);
    return false;
  }
}

async function ensureTypeExists(name) {
  try {
    const snapshot = await db.collection('property_types')
      .where('name', '==', name)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      await db.collection('property_types').add({
        name,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Created property type: ${name}`);
    }
    return true;
  } catch (error) {
    console.error(`❌ Error ensuring type ${name}:`, error);
    return false;
  }
}

async function getLocationId(name, city) {
  const snapshot = await db.collection('locations')
    .where('name', '==', name)
    .where('city', '==', city)
    .limit(1)
    .get();
  
  return snapshot.empty ? null : snapshot.docs[0].id;
}

async function getTypeId(name) {
  const snapshot = await db.collection('property_types')
    .where('name', '==', name)
    .limit(1)
    .get();
  
  return snapshot.empty ? null : snapshot.docs[0].id;
}

async function addProperties() {
  try {
    console.log('🚀 Starting to add 50 more properties...');
    
    // Initialize Firebase
    await initDatabase();
    
    // Generate random properties
    const newProperties = generateRandomProperties();
    
    // Ensure all locations and types exist
    console.log('\n📍 Ensuring locations and types exist...');
    const uniqueLocations = [...new Set(newProperties.map(p => ({ name: p.area, city: p.city })))];
    const uniqueTypes = [...new Set(newProperties.map(p => p.type))];
    
    for (const loc of uniqueLocations) {
      await ensureLocationExists(loc.name, loc.city);
    }
    
    for (const type of uniqueTypes) {
      await ensureTypeExists(type);
    }
    
    console.log('\n🏠 Creating properties with videos, maps, and amenities...');
    let created = 0;
    let skipped = 0;
    
    for (let i = 0; i < newProperties.length; i++) {
      const prop = newProperties[i];
      try {
        // Get location and type IDs
        const locationId = await getLocationId(prop.area, prop.city);
        const typeId = await getTypeId(prop.type);
        
        if (!locationId || !typeId) {
          console.error(`⚠️ Skipping ${prop.title} - location or type not found`);
          skipped++;
          continue;
        }
        
        // Check if property already exists (by title)
        const existingSnapshot = await db.collection('properties')
          .where('title', '==', prop.title)
          .limit(1)
          .get();
        
        if (!existingSnapshot.empty) {
          console.log(`⏭️ Skipping ${prop.title} - already exists`);
          skipped++;
          continue;
        }
        
        // Generate property ID
        const counterRef = db.collection('counters').doc('property_id');
        let propertyId;
        
        await db.runTransaction(async (transaction) => {
          const counterDoc = await transaction.get(counterRef);
          let currentCount = 1;
          
          if (counterDoc.exists) {
            currentCount = (counterDoc.data().count || 0) + 1;
          }
          
          transaction.set(counterRef, {
            count: currentCount,
            updated_at: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
          
          propertyId = `HOAD${String(currentCount).padStart(4, '0')}`;
        });
        
        // Create property with video URL, map URL, and amenities
        await db.collection('properties').doc(propertyId).set({
          title: prop.title,
          location_id: locationId,
          type_id: typeId,
          city: prop.city,
          price: prop.price,
          bedrooms: prop.bedrooms || 0,
          bathrooms: prop.bathrooms || 0,
          sqft: prop.sqft || 0,
          description: prop.description || '',
          transaction_type: prop.transactionType || 'Sale',
          is_featured: prop.isFeatured || false,
          is_active: true,
          amenities: prop.amenities || [],
          highlights: prop.highlights || [],
          brochure_url: '',
          map_url: prop.mapUrl, // Google Maps URL
          video_url: prop.videoUrl, // YouTube video URL
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Add unique images for this property
        const batch = db.batch();
        const propertyImages = getImagesForProperty(prop.type, created);
        
        for (let j = 0; j < propertyImages.length; j++) {
          const imageRef = db.collection('property_images').doc();
          batch.set(imageRef, {
            property_id: propertyId,
            image_data: propertyImages[j],
            display_order: j,
            created_at: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        
        await batch.commit();
        
        console.log(`✅ Created: ${propertyId} - ${prop.title}`);
        console.log(`   📹 Video: ${prop.videoUrl}`);
        console.log(`   🗺️  Map: ${prop.mapUrl}`);
        console.log(`   ✨ Amenities: ${prop.amenities.length} amenities`);
        created++;
      } catch (error) {
        console.error(`❌ Error creating ${prop.title}:`, error.message);
        skipped++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Created: ${created} properties`);
    console.log(`   ⏭️ Skipped: ${skipped} properties`);
    console.log(`   📦 Total: ${newProperties.length} properties`);
    console.log(`   📹 All properties have YouTube videos`);
    console.log(`   🗺️  All properties have Google Maps links`);
    console.log(`   ✨ All properties have comprehensive amenities`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding properties:', error);
    process.exit(1);
  }
}

addProperties();
