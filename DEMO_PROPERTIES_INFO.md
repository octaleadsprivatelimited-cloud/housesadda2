# Demo Properties Information

## Overview

47 demo properties have been successfully created covering all sectors and property types!

## Property Distribution

### By Property Type

- **Apartments**: Multiple properties (1 BHK, 2 BHK, 3 BHK, 4 BHK)
- **Villas**: Luxury independent villas (3 BHK, 4 BHK, 5 BHK)
- **Plots**: HMDA approved plots in various locations
- **Commercial**: Office spaces and retail shops
- **PG**: Paying Guest accommodations
- **Farm House**: Luxury farm houses
- **Farm Land**: Agricultural land

### By Transaction Type

- **Sale**: Properties available for purchase
- **Rent**: Properties available for rent
- **PG**: Paying Guest accommodations
- **Lease**: Commercial lease properties

### By Location

Properties are distributed across major Hyderabad areas:
- Gachibowli
- Hitech City
- Kondapur
- Jubilee Hills
- Banjara Hills
- Madhapur
- Kukatpally
- Manikonda
- Miyapur
- Serilingampally
- Nallagandla
- Financial District

## Property IDs

All properties use sequential IDs:
- HOAD0001 to HOAD0047
- Format: HOAD + 4-digit number

## Featured Properties

Several properties are marked as featured and will appear prominently on the homepage.

## How to View

1. **Homepage**: Visit `http://localhost:8080`
   - Featured Properties section
   - Latest Properties section
   - Browse by Type sections
   - Browse by Locality section

2. **Properties Page**: Visit `http://localhost:8080/properties`
   - All 47 properties listed
   - Filter by type, location, transaction type
   - Search functionality

3. **Property Detail**: Click any property to see full details

## Property Details Included

Each property includes:
- ✅ Title and description
- ✅ Property type
- ✅ Location (area and city)
- ✅ Price
- ✅ Bedrooms, bathrooms, sqft
- ✅ Transaction type (Sale/Rent/PG)
- ✅ Amenities list
- ✅ Key highlights
- ✅ Sample images
- ✅ Active status (all visible on website)

## Running the Script Again

If you need to add more properties or reset:

```bash
npm run populate-demo
```

**Note**: The script skips properties that already exist (by title), so it's safe to run multiple times.

## Customization

To modify demo properties:
1. Edit `server/scripts/populate-demo-properties.js`
2. Modify the `demoProperties` array
3. Run the script again

---

**Status**: ✅ 47 demo properties created and live on website!
