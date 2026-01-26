# Property ID System

## Overview

Properties now use sequential IDs in the format: **HOAD0001**, **HOAD0002**, **HOAD0003**, etc.

## How It Works

### Automatic ID Generation

When a new property is created:
1. System checks for a counter in Firestore (`counters/property_id`)
2. If counter doesn't exist, it initializes based on existing properties
3. Counter is atomically incremented using Firestore transactions
4. New property ID is generated: `HOAD` + padded number (e.g., `HOAD0001`)

### ID Format

- **Prefix**: `HOAD` (Houses Adda)
- **Number**: 4-digit padded number starting from 0001
- **Examples**: 
  - First property: `HOAD0001`
  - Second property: `HOAD0002`
  - 100th property: `HOAD0100`
  - 9999th property: `HOAD9999`

## Counter Storage

The counter is stored in Firestore:
- **Collection**: `counters`
- **Document**: `property_id`
- **Fields**:
  - `count`: Current counter value (number)
  - `updated_at`: Last update timestamp

## Initialization

### Automatic Initialization

The system automatically initializes the counter:
- On first property creation
- Checks existing properties for highest HOAD number
- Sets counter to continue from there

### Manual Initialization (Optional)

If you need to manually initialize or reset the counter:

```bash
node server/scripts/initialize-property-counter.js
```

This script will:
1. Check if counter exists
2. Scan all existing properties
3. Find the highest HOAD number
4. Set counter to continue from there

## Usage

### Creating a Property

When you create a property through the admin panel:
- The system automatically generates the next sequential ID
- No manual input required
- ID is guaranteed to be unique

### Example Flow

```
1. Admin creates property "Luxury Apartment"
   → System generates: HOAD0001
   
2. Admin creates property "Modern Villa"
   → System generates: HOAD0002
   
3. Admin creates property "Spacious Plot"
   → System generates: HOAD0003
```

## Benefits

✅ **Sequential IDs**: Easy to track property count
✅ **Professional Format**: HOAD prefix identifies Houses Adda properties
✅ **Unique**: Guaranteed uniqueness through atomic transactions
✅ **Automatic**: No manual ID management needed
✅ **Backward Compatible**: Existing properties keep their IDs

## Technical Details

### Atomic Counter Increment

Uses Firestore transactions to ensure:
- No duplicate IDs
- Thread-safe counter increment
- Consistent state

### Counter Initialization Logic

1. Check if counter document exists
2. If not, scan all properties:
   - Find properties with HOAD format
   - Get highest number
   - Set counter to that number
3. Next property will be highest + 1

## Troubleshooting

### Counter Not Incrementing

If counter doesn't increment:
1. Check Firestore permissions
2. Verify `counters` collection exists
3. Check server logs for errors

### Reset Counter

To reset counter to start from HOAD0001:

```javascript
// In Firebase Console or via script
db.collection('counters').doc('property_id').set({
  count: 0,
  updated_at: admin.firestore.FieldValue.serverTimestamp()
});
```

**Warning**: Only reset if you're sure no properties exist or you want to start fresh!

## Migration Notes

### Existing Properties

- Existing properties keep their current IDs
- New properties will use HOAD format
- Counter initializes based on highest existing HOAD number

### No Data Loss

- All existing properties remain unchanged
- Only new properties get HOAD IDs
- System is backward compatible

---

**Status**: ✅ Property ID system is active and working!
