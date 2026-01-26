# API Documentation

Complete API documentation for the Houses Adda website. All admin-created data (properties, locations, property types) automatically appears on the public website through these APIs.

## Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: `/api` (relative URL, same domain)

## Public APIs (No Authentication Required)

### 1. Properties API

#### Get All Properties
```
GET /api/properties
```

**Query Parameters:**
- `active` (boolean): Filter by active status (default: all)
- `featured` (boolean): Filter featured properties
- `type` (string): Filter by property type name
- `city` (string): Filter by city
- `area` (string): Filter by area/location name
- `transactionType` (string): Filter by transaction type (Sale, Rent, Lease, PG)
- `search` (string): Search in title and description

**Example:**
```javascript
// Get all active properties
GET /api/properties?active=true

// Get featured properties
GET /api/properties?featured=true&active=true

// Get properties by type and location
GET /api/properties?type=Apartment&area=Gachibowli&active=true

// Get properties for sale
GET /api/properties?transactionType=Sale&active=true
```

**Response:**
```json
[
  {
    "id": "property-id",
    "title": "3 BHK Apartment",
    "type": "Apartment",
    "city": "Hyderabad",
    "area": "Gachibowli",
    "price": 5000000,
    "bedrooms": 3,
    "bathrooms": 2,
    "sqft": 1500,
    "description": "Beautiful apartment...",
    "transactionType": "Sale",
    "image": "base64-image-data",
    "images": ["image1", "image2"],
    "isFeatured": true,
    "isActive": true,
    "amenities": ["Swimming Pool", "Gym"],
    "highlights": ["Near Metro"],
    "brochureUrl": "",
    "mapUrl": "",
    "videoUrl": "",
    "createdAt": "2026-01-26T00:00:00.000Z"
  }
]
```

#### Get Single Property
```
GET /api/properties/:id
```

**Response:** Single property object (same structure as above)

---

### 2. Locations API

#### Get All Locations
```
GET /api/locations
```

**Query Parameters:**
- `city` (string): Filter by city name

**Example:**
```javascript
// Get all locations
GET /api/locations

// Get locations in a specific city
GET /api/locations?city=Hyderabad
```

**Response:**
```json
[
  {
    "id": "location-id",
    "name": "Gachibowli",
    "city": "Hyderabad",
    "created_at": "2026-01-26T00:00:00.000Z"
  }
]
```

---

### 3. Property Types API

#### Get All Property Types
```
GET /api/types
```

**Example:**
```javascript
GET /api/types
```

**Response:**
```json
[
  {
    "id": "type-id",
    "name": "Apartment",
    "created_at": "2026-01-26T00:00:00.000Z"
  }
]
```

---

## Protected APIs (Authentication Required)

These endpoints require admin authentication via Bearer token.

### Properties (Admin)

- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `PATCH /api/properties/:id/featured` - Toggle featured status
- `PATCH /api/properties/:id/active` - Toggle active status

### Locations (Admin)

- `POST /api/locations` - Create location
- `PUT /api/locations/:id` - Update location
- `DELETE /api/locations/:id` - Delete location

### Property Types (Admin)

- `POST /api/types` - Create property type
- `PUT /api/types/:id` - Update property type
- `DELETE /api/types/:id` - Delete property type

---

## Data Flow: Admin Panel → Public Website

### How It Works

1. **Admin Adds Data:**
   - Admin logs into `/admin`
   - Adds properties, locations, or types via admin panel
   - Data is saved to Firebase Firestore

2. **Public Website Fetches Data:**
   - Homepage components call public APIs
   - APIs fetch data from Firestore
   - Data is displayed on the website

### Components Using APIs

#### Homepage (`src/pages/Index.tsx`)
- **FeaturedPropertiesTabs**: `GET /api/properties?active=true`
- **CategoryCards**: `GET /api/properties?active=true`
- **FeaturedProperties**: `GET /api/properties?featured=true&active=true`
- **BrowseByLocality**: `GET /api/locations` + `GET /api/properties?active=true`
- **BrowseByType**: `GET /api/types` + `GET /api/properties?active=true`
- **LatestProperties**: `GET /api/properties?active=true`

#### Properties Page (`src/pages/Properties.tsx`)
- **Properties List**: `GET /api/properties` with filters
- **Filters**: Uses locations and types APIs for dropdown options

---

## API Usage Examples

### Frontend (React/TypeScript)

```typescript
import { propertiesAPI, locationsAPI, typesAPI } from '@/lib/api';

// Get all active properties
const properties = await propertiesAPI.getAll({ active: true });

// Get featured properties
const featured = await propertiesAPI.getAll({ 
  featured: true, 
  active: true 
});

// Get properties by location
const locationProperties = await propertiesAPI.getAll({ 
  area: 'Gachibowli',
  active: true 
});

// Get all locations
const locations = await locationsAPI.getAll();

// Get locations in a city
const cityLocations = await locationsAPI.getAll('Hyderabad');

// Get all property types
const types = await typesAPI.getAll();
```

---

## Error Handling

All APIs return standard error responses:

```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `404` - Not Found
- `500` - Internal Server Error

---

## Notes

1. **Properties Filtering**: When filtering by `active=true`, the API filters in memory to avoid Firestore composite index requirements.

2. **Image Storage**: Property images are stored as compressed base64 data URLs in Firestore `property_images` collection.

3. **Real-time Updates**: Data added in admin panel appears on public website immediately (no caching).

4. **CORS**: APIs allow all origins in development. Configure `CORS_ORIGIN` in production.

---

## Testing APIs

### Using curl

```bash
# Get all properties
curl http://localhost:3001/api/properties?active=true

# Get all locations
curl http://localhost:3001/api/locations

# Get all types
curl http://localhost:3001/api/types

# Get single property
curl http://localhost:3001/api/properties/{property-id}
```

### Using PowerShell

```powershell
# Get all properties
Invoke-WebRequest -Uri "http://localhost:3001/api/properties?active=true" | ConvertFrom-Json

# Get all locations
Invoke-WebRequest -Uri "http://localhost:3001/api/locations" | ConvertFrom-Json

# Get all types
Invoke-WebRequest -Uri "http://localhost:3001/api/types" | ConvertFrom-Json
```

---

## Summary

✅ **All APIs are working and accessible**
✅ **Public endpoints don't require authentication**
✅ **Admin-created data automatically appears on public website**
✅ **Properties, locations, and types are all connected**

The website automatically displays all data added through the admin panel!
