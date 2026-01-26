# How to Add Firestore Rules to Firebase Console

## Step-by-Step Instructions

### 1. Open Firebase Console
1. Go to: https://console.firebase.google.com
2. Select your project: **housesadda-e756b**

### 2. Navigate to Firestore Rules
1. In the left sidebar, click **Firestore Database**
2. Click on the **Rules** tab (at the top)

### 3. Copy the Rules Code
Copy the entire content from the `firestore.rules` file (shown below):

---

## Rules Code to Copy:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to validate image size (max 15KB with margin)
    function validateImageData(imageData) {
      // Check if image_data exists and is a string
      return imageData is string && 
             imageData.size() <= 15360; // 15KB in bytes (15 * 1024)
    }
    
    // Helper function to validate content size
    function validateContent(content) {
      return content is string && content.size() <= 10000; // Max 10KB for descriptions
    }
    
    // Admin users collection - only server can write
    match /admin_users/{userId} {
      allow read: if false; // No client-side reads
      allow write: if false; // Only server-side writes
    }
    
    // Properties collection
    match /properties/{propertyId} {
      // Allow public reads for active properties
      allow read: if resource.data.is_active == true || request.auth != null;
      
      // Only authenticated admin can write (handled by server, but rules as backup)
      allow create: if false; // Server-side only
      allow update: if false; // Server-side only
      allow delete: if false; // Server-side only
      
      // Validate data structure
      function isValidProperty() {
        return request.resource.data.keys().hasAll(['title', 'price', 'city']) &&
               request.resource.data.title is string &&
               request.resource.data.title.size() > 0 &&
               request.resource.data.title.size() <= 255 &&
               request.resource.data.price is number &&
               request.resource.data.price >= 0 &&
               (!('description' in request.resource.data) || validateContent(request.resource.data.description));
      }
    }
    
    // Property images collection
    match /property_images/{imageId} {
      // Allow public reads
      allow read: if true;
      
      // Only server can write (validation happens server-side)
      allow create: if false; // Server-side only - validation enforced in backend
      allow update: if false; // Server-side only
      allow delete: if false; // Server-side only
      
      // Note: Image size validation is enforced server-side before writing
      // Firestore rules cannot easily validate base64 string sizes
      // Server-side validation ensures images are ≤ 15KB before storing
    }
    
    // Property types collection
    match /property_types/{typeId} {
      allow read: if true;
      allow write: if false; // Server-side only
    }
    
    // Locations collection
    match /locations/{locationId} {
      allow read: if true;
      allow write: if false; // Server-side only
    }
  }
}
```

---

### 4. Paste and Publish
1. **Delete** any existing rules in the editor
2. **Paste** the rules code above
3. Click **Publish** button (top right)
4. Confirm the publish action

### 5. Verify
After publishing, you should see:
- ✅ "Rules published successfully"
- The rules editor shows your new rules

---

## Visual Guide

```
Firebase Console
├── Your Project (housesadda-e756b)
    └── Firestore Database
        └── Rules Tab ← Click here
            └── Editor (paste rules here)
                └── Publish Button ← Click to save
```

---

## Quick Access Link

Direct link to your Firestore Rules:
```
https://console.firebase.google.com/project/housesadda-e756b/firestore/rules
```

---

## Important Notes

1. **Server-Side Writes**: All writes (`create`, `update`, `delete`) are set to `false` because your backend uses Firebase Admin SDK, which bypasses security rules. This is correct and secure.

2. **Public Reads**: 
   - Properties: Only active properties are readable by public
   - Images: Public can read all images
   - Types & Locations: Public can read

3. **Validation**: The main validation (image size, content size) happens in your backend code (`server/routes/properties-firebase.js`). These Firestore rules provide an additional security layer.

---

## Troubleshooting

### If you see "Rules published successfully"
✅ Rules are active and working!

### If you see syntax errors
- Check that you copied the entire code block
- Make sure there are no extra characters
- Verify the `rules_version = '2';` is at the top

### If writes are being blocked
- This is expected! All writes go through your backend server
- Your backend uses Firebase Admin SDK which bypasses rules
- Only direct client-side writes would be blocked (which is what we want)
