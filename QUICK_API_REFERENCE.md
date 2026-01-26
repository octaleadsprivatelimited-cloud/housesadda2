# Quick API Reference

Quick reference for all APIs connecting admin panel to public website.

## 🚀 Public APIs (No Auth Required)

### Properties
```javascript
// Get all active properties
GET /api/properties?active=true

// Get featured properties
GET /api/properties?featured=true&active=true

// Filter by type
GET /api/properties?type=Apartment&active=true

// Filter by location
GET /api/properties?area=Gachibowli&active=true

// Filter by transaction type
GET /api/properties?transactionType=Sale&active=true

// Get single property
GET /api/properties/{id}
```

### Locations
```javascript
// Get all locations
GET /api/locations

// Filter by city
GET /api/locations?city=Hyderabad
```

### Property Types
```javascript
// Get all types
GET /api/types
```

## 📍 Where Data Appears on Website

| Admin Panel Data | Public Website Location |
|-----------------|------------------------|
| **Properties** | • Homepage: Featured Properties<br>• Homepage: Latest Properties<br>• Homepage: Browse by Type sections<br>• Properties Page: Full listing |
| **Locations** | • Homepage: Browse by Locality section<br>• Properties Page: Location filter dropdown |
| **Property Types** | • Homepage: Browse by Type section<br>• Properties Page: Type filter dropdown |

## ✅ Verification Checklist

- [x] Properties API working (`/api/properties`)
- [x] Locations API working (`/api/locations`)
- [x] Types API working (`/api/types`)
- [x] All components fetching from APIs
- [x] Data flows from admin to public site
- [x] No authentication required for public APIs

## 🔗 Frontend Usage

```typescript
import { propertiesAPI, locationsAPI, typesAPI } from '@/lib/api';

// Get properties
const props = await propertiesAPI.getAll({ active: true });

// Get locations
const locs = await locationsAPI.getAll();

// Get types
const types = await typesAPI.getAll();
```

---

**Status**: ✅ All APIs created and working!
