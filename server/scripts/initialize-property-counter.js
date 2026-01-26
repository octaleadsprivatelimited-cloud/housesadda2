/**
 * Script to initialize property ID counter
 * Run this once to set up the counter based on existing properties
 * 
 * Usage: node server/scripts/initialize-property-counter.js
 */

import dotenv from 'dotenv';
import { initDatabase, db } from '../db-firebase.js';
import admin from 'firebase-admin';

dotenv.config();

async function initializeCounter() {
  try {
    console.log('🔄 Initializing property ID counter...');
    
    // Initialize Firebase
    await initDatabase();
    
    const counterRef = db.collection('counters').doc('property_id');
    const counterDoc = await counterRef.get();
    
    if (counterDoc.exists) {
      const currentCount = counterDoc.data().count || 0;
      console.log(`✅ Counter already exists with count: ${currentCount}`);
      console.log(`   Next property ID will be: HOAD${String(currentCount + 1).padStart(4, '0')}`);
      return;
    }
    
    // Get all existing properties
    const propertiesSnapshot = await db.collection('properties').get();
    let maxNumber = 0;
    let hoadCount = 0;
    
    propertiesSnapshot.docs.forEach(doc => {
      const id = doc.id;
      // Check if ID matches HOAD format
      if (id.startsWith('HOAD') && id.length === 8) {
        const numberPart = parseInt(id.substring(4));
        if (!isNaN(numberPart) && numberPart > maxNumber) {
          maxNumber = numberPart;
        }
        hoadCount++;
      }
    });
    
    // Set counter to max number found
    await counterRef.set({
      count: maxNumber,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Counter initialized!`);
    console.log(`   Found ${propertiesSnapshot.size} total properties`);
    console.log(`   Found ${hoadCount} properties with HOAD format`);
    console.log(`   Max HOAD number: ${maxNumber}`);
    console.log(`   Next property ID will be: HOAD${String(maxNumber + 1).padStart(4, '0')}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing counter:', error);
    process.exit(1);
  }
}

initializeCounter();
