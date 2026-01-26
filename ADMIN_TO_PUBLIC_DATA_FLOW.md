# Admin Panel → Public Website Data Flow

Complete guide on how data flows from the admin panel to the public website.

## ✅ All APIs Are Created and Working

### Public APIs (No Authentication Required)

1. **Properties API** - `GET /api/properties`
2. **Locations API** - `GET /api/locations`
3. **Property Types API** - `GET /api/types`

All admin-created data automatically appears on the public website!

---

## Data Flow Diagram

```
┌─────────────────┐
│   Admin Panel   │
│  (Firebase UI)  │
└────────┬────────┘
         │
         │ Creates/Updates/Deletes
         ▼
┌─────────────────┐
│ Firebase        │
│ Firestore       │
│ Database        │
└────────┬────────┘
         │
         │ Stores Data
         │
         │ • properties collection
         │ • locations collection
         │ • property_types collection
         │
         ▼
┌─────────────────┐
│  Backend API    │
│  (Express.js)   │
│                 │
│  GET /api/      │
│  • properties   │
│  • locations    │
│  • types        │
└────────┬────────┘
         │
         │ Fetches & Formats
         │
         ▼
┌─────────────────┐
│  Public Website │
│  (React/Vite)   │
│                 │
│  Components:    │
│  • Featured     │
│  • Latest       │
│  • BrowseBy...  │
└─────────────────┘
```

---

## Complete API Endpoints

### 1. Properties API

#### Public Endpoints

| Method | Endpoint | Description | Used By |
|--------|----------|-------------|---------|
| GET | `/api/properties` | Get all properties (with filters) | All property components |
| GET | `/api/properties?active=true` | Get active properties | Homepage, Properties page |
| GET | `/api/properties?featured=true&active=true` | Get featured properties | FeaturedProperties component |
| GET | `/api/properties?type=Apartment&active=true` | Filter by type | BrowseByType, Properties page |
| GET | `/api/properties?area=Gachibowli&active=true` | Filter by location | BrowseByLocality, Properties page |
| GET | `/api/properties/:id` | Get single property | PropertyDetail page |

#### Admin Endpoints (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/properties` | Create property |
| PUT | `/api/properties/:id` | Update property |
| DELETE | `/api/properties/:id` | Delete property |
| PATCH | `/api/properties/:id/featured` | Toggle featured |
| PATCH | `/api/properties/:id/active` | Toggle active |

---

### 2. Locations API

#### Public Endpoints

| Method | Endpoint | Description | Used By |
|--------|----------|-------------|---------|
| GET | `/api/locations` | Get all locations | BrowseByLocality, Properties filters |
| GET | `/api/locations?city=Hyderabad` | Filter by city | Properties filters |

#### Admin Endpoints (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/locations` | Create location |
| PUT | `/api/locations/:id` | Update location |
| DELETE | `/api/locations/:id` | Delete location |

---

### 3. Property Types API

#### Public Endpoints

| Method | Endpoint | Description | Used By |
|--------|----------|-------------|---------|
| GET | `/api/types` | Get all property types | BrowseByType, Properties filters |

#### Admin Endpoints (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/types` | Create property type |
| PUT | `/api/types/:id` | Update property type |
| DELETE | `/api/types/:id` | Delete property type |

---

## Website Components Using APIs

### Homepage (`src/pages/Index.tsx`)

#### 1. FeaturedPropertiesTabs
- **API Call**: `propertiesAPI.getAll({ active: true })`
- **Shows**: Properties grouped by type (Apartment, Villa, Plot, etc.)
- **Location**: Homepage - Top section

#### 2. CategoryCards
- **API Call**: `propertiesAPI.getAll({ active: true })`
- **Shows**: Property counts by category (All, Sale, Rent, Featured)
- **Location**: Homepage - Below FeaturedPropertiesTabs

#### 3. FeaturedProperties
- **API Call**: `propertiesAPI.getAll({ featured: true, active: true })`
- **Shows**: Featured properties carousel
- **Location**: Homepage - Below CategoryCards

#### 4. BrowseByLocality
- **API Calls**: 
  - `locationsAPI.getAll()` - Get all locations
  - `propertiesAPI.getAll({ active: true })` - Count properties per location
- **Shows**: Top locations with property counts
- **Location**: Homepage - Below FeaturedProperties

#### 5. BrowseByType
- **API Calls**:
  - `typesAPI.getAll()` - Get all property types
  - `propertiesAPI.getAll({ active: true })` - Count properties per type
- **Shows**: Property types with counts
- **Location**: Homepage - Below BrowseByLocality

#### 6. LatestProperties
- **API Call**: `propertiesAPI.getAll({ active: true })`
- **Shows**: Latest 6 properties sorted by date
- **Location**: Homepage - Bottom section

---

### Properties Page (`src/pages/Properties.tsx`)

- **API Calls**:
  - `propertiesAPI.getAll({ active: true, ...filters })` - Get filtered properties
  - `locationsAPI.getAll()` - Populate location filter dropdown
  - `typesAPI.getAll()` - Populate type filter dropdown
- **Shows**: All properties with filtering options
- **Filters**: Type, Location, Budget, Transaction Type

---

### Property Detail Page (`src/pages/PropertyDetail.tsx`)

- **API Call**: `propertiesAPI.getById(id)`
- **Shows**: Full property details with images

---

## How to Verify Everything Works

### Step 1: Add Data in Admin Panel

1. Go to `http://localhost:8080/admin`
2. Login with admin credentials
3. Add:
   - **Location**: Admin → Locations → Add Location
   - **Property Type**: Admin → Types → Add Type
   - **Property**: Admin → Properties → Add Property

### Step 2: Check Public Website

1. Go to `http://localhost:8080`
2. Verify:
   - ✅ Location appears in "Browse By Locality" section
   - ✅ Property Type appears in "Browse By Type" section
   - ✅ Property appears in:
     - Featured Properties (if marked as featured)
     - Latest Properties
     - Properties page
     - Category sections

### Step 3: Test APIs Directly

```bash
# Test Properties API
curl http://localhost:3001/api/properties?active=true

# Test Locations API
curl http://localhost:3001/api/locations

# Test Types API
curl http://localhost:3001/api/types
```

---

## Key Features

### ✅ Automatic Updates
- Data added in admin panel appears on website **immediately**
- No manual refresh needed
- No caching delays

### ✅ Real-time Sync
- All components fetch fresh data on page load
- Changes in admin panel reflect on public site instantly

### ✅ Filtering & Search
- Properties can be filtered by:
  - Type (Apartment, Villa, Plot, etc.)
  - Location (Area/City)
  - Transaction Type (Sale, Rent, Lease, PG)
  - Featured status
  - Active status

### ✅ Data Relationships
- Properties link to Locations via `location_id`
- Properties link to Types via `type_id`
- API resolves IDs to names automatically

---

## API Response Format

### Properties Response
```json
{
  "id": "property-id",
  "title": "3 BHK Apartment",
  "type": "Apartment",           // Resolved from type_id
  "area": "Gachibowli",           // Resolved from location_id
  "city": "Hyderabad",
  "price": 5000000,
  "bedrooms": 3,
  "bathrooms": 2,
  "sqft": 1500,
  "isFeatured": true,
  "isActive": true,
  "images": ["base64-image-1", "base64-image-2"]
}
```

### Locations Response
```json
{
  "id": "location-id",
  "name": "Gachibowli",
  "city": "Hyderabad"
}
```

### Types Response
```json
{
  "id": "type-id",
  "name": "Apartment"
}
```

---

## Troubleshooting

### Properties Not Showing?

1. **Check if property is active:**
   - Admin → Properties → Toggle "Active" switch ON

2. **Check API response:**
   ```bash
   curl http://localhost:3001/api/properties?active=true
   ```

3. **Check browser console:**
   - Open DevTools → Console
   - Look for API errors

### Locations Not Showing?

1. **Verify location exists:**
   ```bash
   curl http://localhost:3001/api/locations
   ```

2. **Check if properties use the location:**
   - Properties must have `area` field matching location `name`

### Types Not Showing?

1. **Verify type exists:**
   ```bash
   curl http://localhost:3001/api/types
   ```

2. **Check if properties use the type:**
   - Properties must have `type` field matching type `name`

---

## Summary

✅ **All Required APIs Created**
- Properties API ✅
- Locations API ✅
- Property Types API ✅

✅ **All Public Endpoints Working**
- No authentication required
- Properly formatted responses
- Filtering and search supported

✅ **All Components Connected**
- Homepage components fetch from APIs
- Properties page uses APIs
- Admin panel saves to same database

✅ **Data Flow Complete**
- Admin Panel → Firebase → API → Public Website

**Everything is set up and working!** 🎉
