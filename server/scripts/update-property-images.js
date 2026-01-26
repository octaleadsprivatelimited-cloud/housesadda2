/**
 * Script to update images for existing properties
 * Assigns different images to each property based on type
 * 
 * Usage: node server/scripts/update-property-images.js
 */

import dotenv from 'dotenv';
import { initDatabase, db } from '../db-firebase.js';
import admin from 'firebase-admin';

dotenv.config();

// Diverse image URLs - different images for each property type
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
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600607688969-a5fcd52667cc?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600585154084-4e5f997b773b?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=800&fit=crop&q=80',
  ],
  villa: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dbe4ebc19?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600607688969-a5fcd52667cc?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600585154084-4e5f997b773b?w=1200&h=800&fit=crop&q=80',
  ],
  plot: [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop&q=80',
  ],
  commercial: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&h=800&fit=crop&q=80',
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

// Function to get unique images for a property
function getImagesForProperty(propertyType, index) {
  const type = propertyType.toLowerCase();
  const imagePool = propertyImages[type] || propertyImages.apartment;
  
  // Use index to cycle through images and ensure variety
  const numImages = Math.floor(Math.random() * 3) + 2; // 2-4 images
  const images = [];
  
  // Use index to get different starting point for each property
  const startIndex = index % imagePool.length;
  
  for (let i = 0; i < numImages; i++) {
    const imageIndex = (startIndex + i) % imagePool.length;
    images.push(imagePool[imageIndex]);
  }
  
  return images;
}

async function getPropertyType(propertyId) {
  try {
    const propDoc = await db.collection('properties').doc(propertyId).get();
    if (!propDoc.exists) return null;
    
    const prop = propDoc.data();
    
    // Get type name from type_id
    if (prop.type_id) {
      const typeDoc = await db.collection('property_types').doc(prop.type_id).get();
      if (typeDoc.exists) {
        return typeDoc.data().name || null;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting type for ${propertyId}:`, error);
    return null;
  }
}

async function updatePropertyImages() {
  try {
    console.log('🔄 Starting image update for existing properties...');
    
    // Initialize Firebase
    await initDatabase();
    
    // Get all properties
    const propertiesSnapshot = await db.collection('properties').get();
    console.log(`📦 Found ${propertiesSnapshot.size} properties to update\n`);
    
    let updated = 0;
    let skipped = 0;
    let index = 0;
    
    for (const doc of propertiesSnapshot.docs) {
      const propertyId = doc.id;
      const prop = doc.data();
      
      try {
        // Get property type
        let propertyType = null;
        if (prop.type_id) {
          const typeDoc = await db.collection('property_types').doc(prop.type_id).get();
          if (typeDoc.exists) {
            propertyType = typeDoc.data().name;
          }
        }
        
        if (!propertyType) {
          console.log(`⚠️ Skipping ${propertyId} - type not found`);
          skipped++;
          continue;
        }
        
        // Delete existing images
        const existingImagesSnapshot = await db.collection('property_images')
          .where('property_id', '==', propertyId)
          .get();
        
        const batch = db.batch();
        
        // Delete old images
        existingImagesSnapshot.docs.forEach(imgDoc => {
          batch.delete(imgDoc.ref);
        });
        
        // Get new images for this property
        const newImages = getImagesForProperty(propertyType, index);
        
        // Add new images
        for (let i = 0; i < newImages.length; i++) {
          const imageRef = db.collection('property_images').doc();
          batch.set(imageRef, {
            property_id: propertyId,
            image_data: newImages[i],
            display_order: i,
            created_at: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        
        await batch.commit();
        
        console.log(`✅ Updated: ${propertyId} (${propertyType}) - ${newImages.length} images`);
        updated++;
        index++;
      } catch (error) {
        console.error(`❌ Error updating ${propertyId}:`, error.message);
        skipped++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Updated: ${updated} properties`);
    console.log(`   ⏭️ Skipped: ${skipped} properties`);
    console.log(`   📦 Total: ${propertiesSnapshot.size} properties`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating property images:', error);
    process.exit(1);
  }
}

updatePropertyImages();
