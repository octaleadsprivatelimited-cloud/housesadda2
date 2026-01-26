/**
 * Script to populate demo properties for Houses Adda
 * Creates 40+ properties covering all sectors (Apartments, Villas, Plots, Commercial, etc.)
 * 
 * Usage: node server/scripts/populate-demo-properties.js
 */

import dotenv from 'dotenv';
import { initDatabase, db } from '../db-firebase.js';
import admin from 'firebase-admin';

dotenv.config();

// Demo property data covering all sectors
const demoProperties = [
  // APARTMENTS - Sale
  { title: "Luxury 3 BHK Apartment in Gachibowli", type: "Apartment", city: "Hyderabad", area: "Gachibowli", price: 8500000, bedrooms: 3, bathrooms: 2, sqft: 1850, transactionType: "Sale", isFeatured: true, description: "Spacious 3 BHK apartment with modern amenities, located in prime Gachibowli area. Close to IT hubs, schools, and shopping malls. Ready to move in.", amenities: ["Swimming Pool", "Gym", "Clubhouse", "Parking", "Security", "Power Backup"], highlights: ["Near Metro", "Ready to Move", "Premium Location"] },
  { title: "Premium 2 BHK Flat in Hitech City", type: "Apartment", city: "Hyderabad", area: "Hitech City", price: 6500000, bedrooms: 2, bathrooms: 2, sqft: 1350, transactionType: "Sale", isFeatured: true, description: "Beautiful 2 BHK apartment in the heart of Hitech City. Well-connected location with excellent infrastructure.", amenities: ["Swimming Pool", "Gym", "Parking", "Security"], highlights: ["Near IT Companies", "Good Connectivity"] },
  { title: "Modern 4 BHK Apartment in Kondapur", type: "Apartment", city: "Hyderabad", area: "Kondapur", price: 12000000, bedrooms: 4, bathrooms: 3, sqft: 2400, transactionType: "Sale", description: "Luxurious 4 BHK apartment with premium finishes. Perfect for large families.", amenities: ["Swimming Pool", "Gym", "Clubhouse", "Parking", "Security", "Power Backup", "Landscaped Gardens"], highlights: ["Premium Location", "Spacious"] },
  { title: "Affordable 1 BHK Apartment in Miyapur", type: "Apartment", city: "Hyderabad", area: "Miyapur", price: 3500000, bedrooms: 1, bathrooms: 1, sqft: 650, transactionType: "Sale", description: "Compact 1 BHK apartment perfect for singles or couples. Budget-friendly option in growing area.", amenities: ["Parking", "Security"], highlights: ["Budget Friendly", "Good Location"] },
  { title: "Spacious 3 BHK in Jubilee Hills", type: "Apartment", city: "Hyderabad", area: "Jubilee Hills", price: 9500000, bedrooms: 3, bathrooms: 2, sqft: 1950, transactionType: "Sale", isFeatured: true, description: "Elegant 3 BHK apartment in prestigious Jubilee Hills. High-end finishes and premium amenities.", amenities: ["Swimming Pool", "Gym", "Clubhouse", "Parking", "Security", "Power Backup", "Concierge"], highlights: ["Premium Area", "Luxury Living"] },
  
  // APARTMENTS - Rent
  { title: "Furnished 2 BHK for Rent in Gachibowli", type: "Apartment", city: "Hyderabad", area: "Gachibowli", price: 35000, bedrooms: 2, bathrooms: 2, sqft: 1350, transactionType: "Rent", description: "Fully furnished 2 BHK apartment available for rent. All modern amenities included.", amenities: ["Furnished", "Parking", "Security", "Power Backup"], highlights: ["Fully Furnished", "Ready to Move"] },
  { title: "3 BHK Apartment for Rent in Hitech City", type: "Apartment", city: "Hyderabad", area: "Hitech City", price: 45000, bedrooms: 3, bathrooms: 2, sqft: 1750, transactionType: "Rent", description: "Spacious 3 BHK apartment for rent. Close to IT companies and shopping areas.", amenities: ["Parking", "Security", "Power Backup"], highlights: ["Near IT Hub", "Spacious"] },
  { title: "1 BHK Flat for Rent in Kondapur", type: "Apartment", city: "Hyderabad", area: "Kondapur", price: 18000, bedrooms: 1, bathrooms: 1, sqft: 650, transactionType: "Rent", description: "Compact 1 BHK flat available for rent. Perfect for working professionals.", amenities: ["Parking", "Security"], highlights: ["Budget Friendly"] },
  
  // VILLAS - Sale
  { title: "Luxury 4 BHK Villa in Gachibowli", type: "Villa", city: "Hyderabad", area: "Gachibowli", price: 25000000, bedrooms: 4, bathrooms: 4, sqft: 4500, transactionType: "Sale", isFeatured: true, description: "Stunning 4 BHK independent villa with private garden and modern architecture. Premium location with all amenities.", amenities: ["Private Garden", "Swimming Pool", "Parking", "Security", "Power Backup", "Home Theater"], highlights: ["Independent Villa", "Premium Location", "Luxury Living"] },
  { title: "Modern 3 BHK Villa in Hitech City", type: "Villa", city: "Hyderabad", area: "Hitech City", price: 18000000, bedrooms: 3, bathrooms: 3, sqft: 3200, transactionType: "Sale", description: "Contemporary 3 BHK villa with modern design and premium finishes.", amenities: ["Private Garden", "Parking", "Security", "Power Backup"], highlights: ["Modern Design", "Premium Location"] },
  { title: "Spacious 5 BHK Villa in Jubilee Hills", type: "Villa", city: "Hyderabad", area: "Jubilee Hills", price: 35000000, bedrooms: 5, bathrooms: 5, sqft: 5500, transactionType: "Sale", isFeatured: true, description: "Magnificent 5 BHK villa in upscale Jubilee Hills. Perfect for large families seeking luxury living.", amenities: ["Private Garden", "Swimming Pool", "Parking", "Security", "Power Backup", "Home Theater", "Servant Quarters"], highlights: ["Premium Area", "Luxury Villa", "Spacious"] },
  { title: "Elegant 4 BHK Villa in Kondapur", type: "Villa", city: "Hyderabad", area: "Kondapur", price: 22000000, bedrooms: 4, bathrooms: 4, sqft: 4000, transactionType: "Sale", description: "Beautiful 4 BHK independent villa with landscaped gardens and modern amenities.", amenities: ["Private Garden", "Parking", "Security", "Power Backup"], highlights: ["Independent Villa", "Garden"] },
  
  // VILLAS - Rent
  { title: "Luxury 4 BHK Villa for Rent in Gachibowli", type: "Villa", city: "Hyderabad", area: "Gachibowli", price: 120000, bedrooms: 4, bathrooms: 4, sqft: 4500, transactionType: "Rent", description: "Premium 4 BHK villa available for rent. Fully furnished with all modern amenities.", amenities: ["Furnished", "Private Garden", "Parking", "Security", "Power Backup"], highlights: ["Fully Furnished", "Luxury Villa"] },
  
  // PLOTS - Sale
  { title: "HMDA Approved Plot in Gachibowli", type: "Plot", city: "Hyderabad", area: "Gachibowli", price: 12000000, bedrooms: 0, bathrooms: 0, sqft: 1200, transactionType: "Sale", description: "HMDA approved plot in prime Gachibowli location. Perfect for building your dream home.", amenities: [], highlights: ["HMDA Approved", "Prime Location", "Clear Title"] },
  { title: "Corner Plot in Hitech City", type: "Plot", city: "Hyderabad", area: "Hitech City", price: 8500000, bedrooms: 0, bathrooms: 0, sqft: 900, transactionType: "Sale", description: "Premium corner plot in Hitech City. Excellent connectivity and infrastructure.", amenities: [], highlights: ["Corner Plot", "Good Connectivity"] },
  { title: "HMDA Plot in Kondapur", type: "Plot", city: "Hyderabad", area: "Kondapur", price: 6500000, bedrooms: 0, bathrooms: 0, sqft: 750, transactionType: "Sale", description: "HMDA approved plot in Kondapur. Growing area with good appreciation potential.", amenities: [], highlights: ["HMDA Approved", "Good Investment"] },
  { title: "Premium Plot in Jubilee Hills", type: "Plot", city: "Hyderabad", area: "Jubilee Hills", price: 20000000, bedrooms: 0, bathrooms: 0, sqft: 1500, transactionType: "Sale", isFeatured: true, description: "Premium plot in prestigious Jubilee Hills. Excellent location for luxury construction.", amenities: [], highlights: ["Premium Location", "Luxury Area"] },
  { title: "HMDA Plot in Miyapur", type: "Plot", city: "Hyderabad", area: "Miyapur", price: 4500000, bedrooms: 0, bathrooms: 0, sqft: 600, transactionType: "Sale", description: "HMDA approved plot in Miyapur. Budget-friendly option with good growth potential.", amenities: [], highlights: ["HMDA Approved", "Budget Friendly"] },
  
  // COMMERCIAL - Sale
  { title: "Office Space in Gachibowli", type: "Commercial", city: "Hyderabad", area: "Gachibowli", price: 15000000, bedrooms: 0, bathrooms: 2, sqft: 2500, transactionType: "Sale", description: "Premium office space in Gachibowli. Perfect for IT companies and businesses.", amenities: ["Parking", "Security", "Power Backup", "Elevator"], highlights: ["Prime Location", "IT Hub"] },
  { title: "Retail Shop in Hitech City", type: "Commercial", city: "Hyderabad", area: "Hitech City", price: 8500000, bedrooms: 0, bathrooms: 1, sqft: 1200, transactionType: "Sale", description: "Prime retail shop space in Hitech City. High footfall area.", amenities: ["Parking", "Security"], highlights: ["High Footfall", "Prime Location"] },
  { title: "Commercial Space in Kondapur", type: "Commercial", city: "Hyderabad", area: "Kondapur", price: 12000000, bedrooms: 0, bathrooms: 2, sqft: 2000, transactionType: "Sale", description: "Spacious commercial space in Kondapur. Suitable for offices or retail.", amenities: ["Parking", "Security", "Power Backup"], highlights: ["Spacious", "Good Location"] },
  
  // COMMERCIAL - Rent
  { title: "Office Space for Rent in Gachibowli", type: "Commercial", city: "Hyderabad", area: "Gachibowli", price: 75000, bedrooms: 0, bathrooms: 2, sqft: 2500, transactionType: "Rent", description: "Premium office space available for rent. Fully furnished and ready to move in.", amenities: ["Furnished", "Parking", "Security", "Power Backup"], highlights: ["Fully Furnished", "Ready to Move"] },
  { title: "Retail Shop for Rent in Hitech City", type: "Commercial", city: "Hyderabad", area: "Hitech City", price: 45000, bedrooms: 0, bathrooms: 1, sqft: 1200, transactionType: "Rent", description: "Prime retail shop space for rent. High visibility location.", amenities: ["Parking", "Security"], highlights: ["High Visibility", "Prime Location"] },
  
  // PG ACCOMMODATION
  { title: "PG for Men in Gachibowli", type: "PG", city: "Hyderabad", area: "Gachibowli", price: 8000, bedrooms: 1, bathrooms: 1, sqft: 200, transactionType: "PG", description: "Comfortable PG accommodation for men. Clean rooms with all basic amenities.", amenities: ["WiFi", "Food", "Laundry", "Security"], highlights: ["Near IT Companies", "Food Included"] },
  { title: "PG for Women in Hitech City", type: "PG", city: "Hyderabad", area: "Hitech City", price: 8500, bedrooms: 1, bathrooms: 1, sqft: 200, transactionType: "PG", description: "Safe and secure PG accommodation for women. Well-maintained facility.", amenities: ["WiFi", "Food", "Laundry", "Security"], highlights: ["Safe for Women", "Food Included"] },
  { title: "Premium PG in Kondapur", type: "PG", city: "Hyderabad", area: "Kondapur", price: 10000, bedrooms: 1, bathrooms: 1, sqft: 250, transactionType: "PG", description: "Premium PG accommodation with modern amenities. AC rooms available.", amenities: ["AC", "WiFi", "Food", "Laundry", "Security"], highlights: ["AC Rooms", "Premium"] },
  
  // FARM HOUSE
  { title: "Farm House in Gachibowli", type: "Farm House", city: "Hyderabad", area: "Gachibowli", price: 18000000, bedrooms: 4, bathrooms: 3, sqft: 5000, transactionType: "Sale", description: "Beautiful farm house with large garden area. Perfect for weekend getaways.", amenities: ["Large Garden", "Parking", "Security", "Power Backup"], highlights: ["Farm House", "Large Garden"] },
  
  // FARM LAND
  { title: "Agricultural Land in Gachibowli", type: "Farm Land", city: "Hyderabad", area: "Gachibowli", price: 8000000, bedrooms: 0, bathrooms: 0, sqft: 10000, transactionType: "Sale", description: "Agricultural land suitable for farming. Good water source available.", amenities: [], highlights: ["Agricultural Land", "Water Source"] },
  
  // More Apartments - Sale
  { title: "2 BHK Apartment in Banjara Hills", type: "Apartment", city: "Hyderabad", area: "Banjara Hills", price: 7500000, bedrooms: 2, bathrooms: 2, sqft: 1450, transactionType: "Sale", isFeatured: true, description: "Elegant 2 BHK apartment in upscale Banjara Hills. Premium location with excellent connectivity.", amenities: ["Swimming Pool", "Gym", "Parking", "Security", "Power Backup"], highlights: ["Premium Location", "Upscale Area"] },
  { title: "3 BHK Flat in Madhapur", type: "Apartment", city: "Hyderabad", area: "Madhapur", price: 7200000, bedrooms: 3, bathrooms: 2, sqft: 1700, transactionType: "Sale", description: "Spacious 3 BHK flat in Madhapur. Close to IT companies and shopping malls.", amenities: ["Swimming Pool", "Gym", "Parking", "Security"], highlights: ["Near IT Hub", "Spacious"] },
  { title: "2 BHK Apartment in Kukatpally", type: "Apartment", city: "Hyderabad", area: "Kukatpally", price: 4800000, bedrooms: 2, bathrooms: 2, sqft: 1250, transactionType: "Sale", description: "Affordable 2 BHK apartment in Kukatpally. Well-connected area with good infrastructure.", amenities: ["Parking", "Security"], highlights: ["Affordable", "Good Connectivity"] },
  { title: "4 BHK Apartment in Manikonda", type: "Apartment", city: "Hyderabad", area: "Manikonda", price: 11000000, bedrooms: 4, bathrooms: 3, sqft: 2200, transactionType: "Sale", description: "Luxurious 4 BHK apartment in Manikonda. Premium finishes and modern amenities.", amenities: ["Swimming Pool", "Gym", "Clubhouse", "Parking", "Security", "Power Backup"], highlights: ["Premium Location", "Luxury Living"] },
  
  // More Apartments - Rent
  { title: "2 BHK Flat for Rent in Banjara Hills", type: "Apartment", city: "Hyderabad", area: "Banjara Hills", price: 40000, bedrooms: 2, bathrooms: 2, sqft: 1450, transactionType: "Rent", description: "Elegant 2 BHK flat available for rent in Banjara Hills. Fully furnished.", amenities: ["Furnished", "Parking", "Security"], highlights: ["Fully Furnished", "Premium Location"] },
  { title: "3 BHK Apartment for Rent in Madhapur", type: "Apartment", city: "Hyderabad", area: "Madhapur", price: 42000, bedrooms: 3, bathrooms: 2, sqft: 1700, transactionType: "Rent", description: "Spacious 3 BHK apartment for rent. Close to IT companies.", amenities: ["Parking", "Security", "Power Backup"], highlights: ["Near IT Hub", "Spacious"] },
  
  // More Villas - Sale
  { title: "3 BHK Villa in Banjara Hills", type: "Villa", city: "Hyderabad", area: "Banjara Hills", price: 28000000, bedrooms: 3, bathrooms: 3, sqft: 3800, transactionType: "Sale", isFeatured: true, description: "Stunning 3 BHK villa in prestigious Banjara Hills. Luxury living at its finest.", amenities: ["Private Garden", "Swimming Pool", "Parking", "Security", "Power Backup"], highlights: ["Premium Area", "Luxury Villa"] },
  { title: "4 BHK Villa in Manikonda", type: "Villa", city: "Hyderabad", area: "Manikonda", price: 24000000, bedrooms: 4, bathrooms: 4, sqft: 4200, transactionType: "Sale", description: "Beautiful 4 BHK independent villa in Manikonda. Modern architecture and premium amenities.", amenities: ["Private Garden", "Parking", "Security", "Power Backup"], highlights: ["Independent Villa", "Modern Design"] },
  
  // More Plots
  { title: "HMDA Plot in Banjara Hills", type: "Plot", city: "Hyderabad", area: "Banjara Hills", price: 18000000, bedrooms: 0, bathrooms: 0, sqft: 1200, transactionType: "Sale", isFeatured: true, description: "Premium HMDA approved plot in Banjara Hills. Excellent location for luxury construction.", amenities: [], highlights: ["Premium Location", "HMDA Approved"] },
  { title: "Corner Plot in Manikonda", type: "Plot", city: "Hyderabad", area: "Manikonda", price: 7500000, bedrooms: 0, bathrooms: 0, sqft: 800, transactionType: "Sale", description: "Corner plot in Manikonda. Good connectivity and growth potential.", amenities: [], highlights: ["Corner Plot", "Good Investment"] },
  { title: "HMDA Plot in Kukatpally", type: "Plot", city: "Hyderabad", area: "Kukatpally", price: 5500000, bedrooms: 0, bathrooms: 0, sqft: 700, transactionType: "Sale", description: "HMDA approved plot in Kukatpally. Budget-friendly option.", amenities: [], highlights: ["HMDA Approved", "Budget Friendly"] },
  
  // More Commercial
  { title: "Office Space in Banjara Hills", type: "Commercial", city: "Hyderabad", area: "Banjara Hills", price: 20000000, bedrooms: 0, bathrooms: 2, sqft: 3000, transactionType: "Sale", description: "Premium office space in Banjara Hills. Perfect for corporate offices.", amenities: ["Parking", "Security", "Power Backup", "Elevator"], highlights: ["Premium Location", "Corporate Area"] },
  { title: "Retail Space for Rent in Kondapur", type: "Commercial", city: "Hyderabad", area: "Kondapur", price: 40000, bedrooms: 0, bathrooms: 1, sqft: 1500, transactionType: "Rent", description: "Retail space available for rent. High visibility location.", amenities: ["Parking", "Security"], highlights: ["High Visibility", "Good Location"] },
  
  // More PG
  { title: "PG Accommodation in Madhapur", type: "PG", city: "Hyderabad", area: "Madhapur", price: 7500, bedrooms: 1, bathrooms: 1, sqft: 200, transactionType: "PG", description: "Comfortable PG accommodation in Madhapur. Near IT companies.", amenities: ["WiFi", "Food", "Laundry", "Security"], highlights: ["Near IT Hub", "Food Included"] },
  { title: "Premium PG in Banjara Hills", type: "PG", city: "Hyderabad", area: "Banjara Hills", price: 12000, bedrooms: 1, bathrooms: 1, sqft: 300, transactionType: "PG", description: "Premium PG accommodation with AC rooms. All modern amenities.", amenities: ["AC", "WiFi", "Food", "Laundry", "Security"], highlights: ["AC Rooms", "Premium"] },
  
  // Additional properties to reach 40+
  { title: "1 BHK Apartment in Serilingampally", type: "Apartment", city: "Hyderabad", area: "Serilingampally", price: 3200000, bedrooms: 1, bathrooms: 1, sqft: 600, transactionType: "Sale", description: "Affordable 1 BHK apartment in Serilingampally. Good connectivity.", amenities: ["Parking", "Security"], highlights: ["Budget Friendly"] },
  { title: "2 BHK Flat in Nallagandla", type: "Apartment", city: "Hyderabad", area: "Nallagandla", price: 5200000, bedrooms: 2, bathrooms: 2, sqft: 1300, transactionType: "Sale", description: "Spacious 2 BHK flat in Nallagandla. Growing area with good infrastructure.", amenities: ["Parking", "Security"], highlights: ["Growing Area", "Good Investment"] },
  { title: "3 BHK Apartment in Financial District", type: "Apartment", city: "Hyderabad", area: "Financial District", price: 8800000, bedrooms: 3, bathrooms: 2, sqft: 1800, transactionType: "Sale", isFeatured: true, description: "Premium 3 BHK apartment in Financial District. Close to business hubs.", amenities: ["Swimming Pool", "Gym", "Parking", "Security", "Power Backup"], highlights: ["Financial District", "Premium Location"] },
  { title: "HMDA Plot in Serilingampally", type: "Plot", city: "Hyderabad", area: "Serilingampally", price: 5000000, bedrooms: 0, bathrooms: 0, sqft: 650, transactionType: "Sale", description: "HMDA approved plot in Serilingampally. Good growth potential.", amenities: [], highlights: ["HMDA Approved", "Good Investment"] },
];

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
  plot: [
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop&q=80',
  ],
  commercial: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&h=800&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&h=800&fit=crop&q=80',
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

async function populateDemoProperties() {
  try {
    console.log('🚀 Starting demo properties population...');
    
    // Initialize Firebase
    await initDatabase();
    
    // Ensure all locations and types exist
    console.log('\n📍 Ensuring locations and types exist...');
    const uniqueLocations = [...new Set(demoProperties.map(p => ({ name: p.area, city: p.city })))];
    const uniqueTypes = [...new Set(demoProperties.map(p => p.type))];
    
    for (const loc of uniqueLocations) {
      await ensureLocationExists(loc.name, loc.city);
    }
    
    for (const type of uniqueTypes) {
      await ensureTypeExists(type);
    }
    
    console.log('\n🏠 Creating demo properties...');
    let created = 0;
    let skipped = 0;
    
    for (const prop of demoProperties) {
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
        
        // Create property
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
          map_url: '',
          video_url: '',
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Add unique images for this property
        const batch = db.batch();
        const propertyImages = getImagesForProperty(prop.type, created); // Use created count for variety
        
        for (let i = 0; i < propertyImages.length; i++) {
          const imageRef = db.collection('property_images').doc();
          batch.set(imageRef, {
            property_id: propertyId,
            image_data: propertyImages[i], // Use different images for each property
            display_order: i,
            created_at: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        
        await batch.commit();
        
        console.log(`✅ Created: ${propertyId} - ${prop.title}`);
        created++;
      } catch (error) {
        console.error(`❌ Error creating ${prop.title}:`, error.message);
        skipped++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Created: ${created} properties`);
    console.log(`   ⏭️ Skipped: ${skipped} properties`);
    console.log(`   📦 Total: ${demoProperties.length} properties`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating demo properties:', error);
    process.exit(1);
  }
}

populateDemoProperties();
