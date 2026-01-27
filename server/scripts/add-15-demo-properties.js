/**
 * Script to add 15 demo properties for Houses Adda
 * Creates diverse properties covering different types and locations
 * 
 * Usage: node server/scripts/add-15-demo-properties.js
 */

import dotenv from 'dotenv';
import { initializeFirebase, getDb, initDatabase } from '../db-firebase.js';
import admin from 'firebase-admin';

dotenv.config();

// 15 diverse demo properties
const demoProperties = [
  // Apartments - Sale
  {
    title: "Luxury 3 BHK Apartment in Gachibowli",
    type: "Apartment",
    city: "Hyderabad",
    area: "Gachibowli",
    price: 8500000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1850,
    transactionType: "Sale",
    isFeatured: true,
    isActive: true,
    description: "Spacious 3 BHK apartment with modern amenities, located in prime Gachibowli area. Close to IT hubs, schools, and shopping malls. Ready to move in.",
    amenities: ["Swimming Pool", "Gym", "Clubhouse", "Parking", "Security", "Power Backup"],
    highlights: ["Near Metro", "Ready to Move", "Premium Location"]
  },
  {
    title: "Premium 2 BHK Flat in Hitech City",
    type: "Apartment",
    city: "Hyderabad",
    area: "Hitech City",
    price: 6500000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1350,
    transactionType: "Sale",
    isFeatured: true,
    isActive: true,
    description: "Beautiful 2 BHK apartment in the heart of Hitech City. Well-connected location with excellent infrastructure.",
    amenities: ["Swimming Pool", "Gym", "Parking", "Security"],
    highlights: ["Near IT Companies", "Good Connectivity"]
  },
  {
    title: "Modern 4 BHK Apartment in Kondapur",
    type: "Apartment",
    city: "Hyderabad",
    area: "Kondapur",
    price: 12000000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2400,
    transactionType: "Sale",
    isActive: true,
    description: "Luxurious 4 BHK apartment with premium finishes. Perfect for large families.",
    amenities: ["Swimming Pool", "Gym", "Clubhouse", "Parking", "Security", "Power Backup", "Landscaped Gardens"],
    highlights: ["Premium Location", "Spacious"]
  },
  
  // Apartments - Rent
  {
    title: "Furnished 2 BHK for Rent in Gachibowli",
    type: "Apartment",
    city: "Hyderabad",
    area: "Gachibowli",
    price: 35000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1350,
    transactionType: "Rent",
    isActive: true,
    description: "Fully furnished 2 BHK apartment available for rent. All modern amenities included.",
    amenities: ["Furnished", "Parking", "Security", "Power Backup"],
    highlights: ["Fully Furnished", "Ready to Move"]
  },
  {
    title: "3 BHK Apartment for Rent in Hitech City",
    type: "Apartment",
    city: "Hyderabad",
    area: "Hitech City",
    price: 45000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1750,
    transactionType: "Rent",
    isActive: true,
    description: "Spacious 3 BHK apartment for rent. Close to IT companies and shopping areas.",
    amenities: ["Parking", "Security", "Power Backup"],
    highlights: ["Near IT Hub", "Spacious"]
  },
  
  // Villas - Sale
  {
    title: "Luxury 4 BHK Villa in Gachibowli",
    type: "Villa",
    city: "Hyderabad",
    area: "Gachibowli",
    price: 25000000,
    bedrooms: 4,
    bathrooms: 4,
    sqft: 4500,
    transactionType: "Sale",
    isFeatured: true,
    isActive: true,
    description: "Stunning 4 BHK independent villa with private garden and modern architecture. Premium location with all amenities.",
    amenities: ["Private Garden", "Swimming Pool", "Parking", "Security", "Power Backup", "Home Theater"],
    highlights: ["Independent Villa", "Premium Location", "Luxury Living"]
  },
  {
    title: "Modern 3 BHK Villa in Hitech City",
    type: "Villa",
    city: "Hyderabad",
    area: "Hitech City",
    price: 18000000,
    bedrooms: 3,
    bathrooms: 3,
    sqft: 3200,
    transactionType: "Sale",
    isActive: true,
    description: "Contemporary 3 BHK villa with modern design and premium finishes.",
    amenities: ["Private Garden", "Parking", "Security", "Power Backup"],
    highlights: ["Modern Design", "Premium Location"]
  },
  
  // Plots - Sale
  {
    title: "HMDA Approved Plot in Gachibowli",
    type: "Plot",
    city: "Hyderabad",
    area: "Gachibowli",
    price: 12000000,
    bedrooms: 0,
    bathrooms: 0,
    sqft: 1200,
    transactionType: "Sale",
    isFeatured: true,
    isActive: true,
    description: "HMDA approved plot in prime Gachibowli location. Perfect for building your dream home.",
    amenities: [],
    highlights: ["HMDA Approved", "Prime Location", "Clear Title"]
  },
  {
    title: "Corner Plot in Hitech City",
    type: "Plot",
    city: "Hyderabad",
    area: "Hitech City",
    price: 8500000,
    bedrooms: 0,
    bathrooms: 0,
    sqft: 900,
    transactionType: "Sale",
    isActive: true,
    description: "Premium corner plot in Hitech City. Excellent connectivity and infrastructure.",
    amenities: [],
    highlights: ["Corner Plot", "Good Connectivity"]
  },
  
  // Commercial - Sale
  {
    title: "Office Space in Gachibowli",
    type: "Commercial",
    city: "Hyderabad",
    area: "Gachibowli",
    price: 15000000,
    bedrooms: 0,
    bathrooms: 2,
    sqft: 2500,
    transactionType: "Sale",
    isActive: true,
    description: "Premium office space in Gachibowli. Perfect for IT companies and businesses.",
    amenities: ["Parking", "Security", "Power Backup", "Elevator"],
    highlights: ["Prime Location", "IT Hub"]
  },
  {
    title: "Retail Shop in Hitech City",
    type: "Commercial",
    city: "Hyderabad",
    area: "Hitech City",
    price: 8500000,
    bedrooms: 0,
    bathrooms: 1,
    sqft: 1200,
    transactionType: "Sale",
    isActive: true,
    description: "Prime retail shop space in Hitech City. High footfall area.",
    amenities: ["Parking", "Security"],
    highlights: ["High Footfall", "Prime Location"]
  },
  
  // Commercial - Rent
  {
    title: "Office Space for Rent in Gachibowli",
    type: "Commercial",
    city: "Hyderabad",
    area: "Gachibowli",
    price: 75000,
    bedrooms: 0,
    bathrooms: 2,
    sqft: 2500,
    transactionType: "Rent",
    isActive: true,
    description: "Premium office space available for rent. Fully furnished and ready to move in.",
    amenities: ["Furnished", "Parking", "Security", "Power Backup"],
    highlights: ["Fully Furnished", "Ready to Move"]
  },
  
  // PG Accommodation
  {
    title: "PG for Men in Gachibowli",
    type: "PG",
    city: "Hyderabad",
    area: "Gachibowli",
    price: 8000,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 200,
    transactionType: "PG",
    isActive: true,
    description: "Comfortable PG accommodation for men. Clean rooms with all basic amenities.",
    amenities: ["WiFi", "Food", "Laundry", "Security"],
    highlights: ["Near IT Companies", "Food Included"]
  },
  {
    title: "PG for Women in Hitech City",
    type: "PG",
    city: "Hyderabad",
    area: "Hitech City",
    price: 8500,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 200,
    transactionType: "PG",
    isActive: true,
    description: "Safe and secure PG accommodation for women. Well-maintained facility.",
    amenities: ["WiFi", "Food", "Laundry", "Security"],
    highlights: ["Safe for Women", "Food Included"]
  },
  
  // Additional Apartment
  {
    title: "Spacious 3 BHK in Jubilee Hills",
    type: "Apartment",
    city: "Hyderabad",
    area: "Jubilee Hills",
    price: 9500000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1950,
    transactionType: "Sale",
    isFeatured: true,
    isActive: true,
    description: "Elegant 3 BHK apartment in prestigious Jubilee Hills. High-end finishes and premium amenities.",
    amenities: ["Swimming Pool", "Gym", "Clubhouse", "Parking", "Security", "Power Backup", "Concierge"],
    highlights: ["Premium Area", "Luxury Living"]
  }
];

// Sample image (placeholder base64 - in production, use actual images)
const sampleImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9wZXJ0eSBJbWFnZTwvdGV4dD48L3N2Zz4=";

async function addDemoProperties() {
  try {
    console.log('🔧 Initializing Firebase...');
    initializeFirebase();
    
    if (!admin.apps.length) {
      throw new Error('Firebase Admin SDK not initialized. Check your .env file.');
    }

    console.log('📦 Initializing database...');
    await initDatabase();
    
    const db = getDb();
    console.log('✅ Database connected');

    // Get all locations and types to map names to IDs
    const locationsSnapshot = await db.collection('locations').get();
    const typesSnapshot = await db.collection('property_types').get();

    const locationMap = {};
    locationsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const key = `${data.name}_${data.city}`;
      locationMap[key] = doc.id;
    });

    const typeMap = {};
    typesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      typeMap[data.name] = doc.id;
    });

    console.log(`\n📝 Adding ${demoProperties.length} demo properties...\n`);

    let added = 0;
    let skipped = 0;

    for (const prop of demoProperties) {
      try {
        // Check if property already exists (by title)
        const existingSnapshot = await db.collection('properties')
          .where('title', '==', prop.title)
          .limit(1)
          .get();

        if (!existingSnapshot.empty) {
          console.log(`⏭️  Skipped: ${prop.title} (already exists)`);
          skipped++;
          continue;
        }

        // Get location_id and type_id
        const locationKey = `${prop.area}_${prop.city}`;
        const locationId = locationMap[locationKey];
        const typeId = typeMap[prop.type];

        if (!locationId) {
          console.log(`⚠️  Location not found: ${prop.area}, ${prop.city} - Skipping`);
          skipped++;
          continue;
        }

        if (!typeId) {
          console.log(`⚠️  Type not found: ${prop.type} - Skipping`);
          skipped++;
          continue;
        }

        // Create property
        const propertyRef = await db.collection('properties').add({
          title: prop.title,
          location_id: locationId,
          type_id: typeId,
          city: prop.city,
          price: prop.price,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          sqft: prop.sqft,
          description: prop.description || '',
          transaction_type: prop.transactionType || 'Sale',
          is_featured: prop.isFeatured === true,
          is_active: prop.isActive !== false,
          amenities: prop.amenities || [],
          highlights: prop.highlights || [],
          brochure_url: '',
          map_url: '',
          video_url: '',
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });

        // Add sample image
        await db.collection('property_images').add({
          property_id: propertyRef.id,
          image_data: sampleImage,
          display_order: 0,
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ Added: ${prop.title} (ID: ${propertyRef.id})`);
        added++;

      } catch (error) {
        console.error(`❌ Error adding property "${prop.title}":`, error.message);
        skipped++;
      }
    }

    console.log(`\n✅ Complete!`);
    console.log(`   Added: ${added} properties`);
    console.log(`   Skipped: ${skipped} properties`);
    console.log(`\n🎉 Demo properties are now visible in the admin panel!`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addDemoProperties();
