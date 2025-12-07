# Secondary Product Images API Documentation

## Overview
This API provides endpoints to manage secondary (auxiliary) product images. Each product can have multiple secondary images in addition to its main image.

## Database Schema

### `product_images` Table
```sql
CREATE TABLE product_images (
  image_id INT(11) PRIMARY KEY AUTO_INCREMENT,
  product_id INT(11) NOT NULL,
  image VARCHAR(255) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);
```

## API Endpoints

### 1. Get Secondary Images
**Retrieve all secondary images for a product**

- **URL:** `/product_api_endpoint.php`
- **Method:** `GET`
- **Query Parameters:**
  - `action` = `getSecondaryImages` (required)
  - `product_id` = Product ID (required)

**Example Request:**
```
GET http://localhost/computer-store/backend/products/product_api_endpoint.php?action=getSecondaryImages&product_id=1
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "image_id": 1,
      "product_id": 1,
      "image": "product_1701234567_abc123def.jpg"
    },
    {
      "image_id": 2,
      "product_id": 1,
      "image": "product_1701234568_xyz789uvw.jpg"
    }
  ],
  "count": 2
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Product ID required"
}
```

---

### 2. Add Secondary Images
**Upload multiple secondary images for a product**

- **URL:** `/product_api_endpoint.php`
- **Method:** `POST`
- **Form Data:**
  - `action` = `addSecondaryImages` (required)
  - `product_id` = Product ID (required)
  - `images` = File array (required) - Multiple files

**Validation Rules:**
- File size: Maximum 5MB per image
- Allowed formats: JPEG, PNG, WebP, GIF
- MIME type validation using `finfo`

**Example JavaScript Request:**
```javascript
const formData = new FormData();
formData.append('action', 'addSecondaryImages');
formData.append('product_id', 1);

// Add multiple files
const fileInput = document.getElementById('images');
Array.from(fileInput.files).forEach((file) => {
  formData.append('images', file);
});

fetch('http://localhost/computer-store/backend/products/product_api_endpoint.php', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => console.log(data));
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Secondary images added successfully",
  "image_ids": [3, 4, 5],
  "count": 3
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "No images provided"
}
```

---

### 3. Delete Secondary Image
**Remove a single secondary image**

- **URL:** `/product_api_endpoint.php`
- **Method:** `POST` or `DELETE`
- **Parameters:**
  - `action` = `deleteSecondaryImage` (required)
  - `image_id` = Image ID (required)

**Example Request:**
```javascript
fetch('http://localhost/computer-store/backend/products/product_api_endpoint.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    action: 'deleteSecondaryImage',
    image_id: 3
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Secondary image deleted successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Valid image ID required"
}
```

---

## File Management

### Upload Directory
All secondary product images are stored in:
```
/backend/uploads/products_img/
```

### Filename Format
Secondary images follow the naming convention:
```
product_[timestamp]_[uniqid].[extension]
```

Example: `product_1701234567_abc123def.jpg`

This ensures:
- Unique filenames (timestamp + uniqid)
- Prevention of file collisions
- Easy identification of product images

### File Deletion
When a secondary image is deleted:
1. Image is removed from `product_images` table
2. Image file is deleted from filesystem
3. If file deletion fails, database record is still removed

---

## Integration with ProductForm

### Frontend: Upload Multiple Images

```jsx
// In ProductForm.jsx
const handleSecondaryImagesChange = (e) => {
  const files = Array.from(e.target.files);
  setSecondaryImages(files);
  // Generate previews for each file
};

// During form submission
const submitFormData = new FormData();
// ... add other fields ...

// Add secondary images
secondaryImages.forEach((image) => {
  submitFormData.append('secondary_images', image);
});

onSave(submitFormData);
```

### Backend: Handle in Products Page

```jsx
// In Products.jsx handleSave()
if (secondaryImages.length > 0) {
  const imageFormData = new FormData();
  imageFormData.append('action', 'addSecondaryImages');
  imageFormData.append('product_id', productId);
  
  secondaryImages.forEach((image) => {
    imageFormData.append('images', image);
  });

  // Upload after main product is created
  const imageResponse = await fetch(PRODUCTS_API, {
    method: 'POST',
    body: imageFormData
  });
}
```

---

## Deletion Cascade

When a product is deleted:
1. Main product image is deleted from filesystem
2. All secondary images are retrieved from database
3. All secondary images are deleted from filesystem
4. Product record is deleted from database (CASCADE deletes product_images records)

---

## Error Handling

### Validation Errors
- Invalid product ID
- No images provided
- Invalid image format/size

### Database Errors
- Connection failures
- Insert/Update/Delete failures
- Record not found

All errors are logged to PHP error_log for debugging.

---

## CORS Configuration

Secondary images API respects CORS settings configured in `product_api_endpoint.php`:

**Allowed Origins:**
- `http://localhost:3000`
- `http://localhost:5173`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`
- `http://localhost:80`

**Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS, PATCH

---

## Usage Examples

### Complete Product Creation with Secondary Images

```javascript
// 1. Create main product
const productFormData = new FormData();
productFormData.append('action', 'addProduct');
productFormData.append('name', 'Laptop Dell XPS');
productFormData.append('price', 25000000);
productFormData.append('quantity', 10);
productFormData.append('manufacturer_id', 1);
productFormData.append('image_main', mainImageFile);

const productResponse = await fetch(API_BASE, {
  method: 'POST',
  body: productFormData
});
const productData = await productResponse.json();
const productId = productData.product_id;

// 2. Add secondary images
const secondaryFormData = new FormData();
secondaryFormData.append('action', 'addSecondaryImages');
secondaryFormData.append('product_id', productId);
Array.from(secondaryImageFiles).forEach(file => {
  secondaryFormData.append('images', file);
});

const imageResponse = await fetch(API_BASE, {
  method: 'POST',
  body: secondaryFormData
});
const imageData = await imageResponse.json();
console.log(`Added ${imageData.count} secondary images`);
```

---

## Performance Considerations

1. **Image Optimization:**
   - Validate MIME type using `finfo` (not just extension)
   - Enforce 5MB file size limit per image
   - Support modern formats (WebP for better compression)

2. **Database Queries:**
   - Use proper indexes on `product_id` foreign key
   - Batch operations for multiple image uploads

3. **File System:**
   - Use unique filenames to prevent overwrites
   - Regular cleanup of orphaned image files (if deletes fail)

---

## Security

1. **File Validation:**
   - MIME type validation (not just extension)
   - File size limit enforcement
   - Safe filename generation

2. **Access Control:**
   - All endpoints require proper CORS origin
   - Product ID validation
   - Image ID validation

3. **Error Handling:**
   - Errors logged to PHP error_log
   - No sensitive information exposed in API responses
   - Proper HTTP status codes returned

