# Products API Documentation

## Base URL
```
http://localhost/computer-store/backend/products/product_api_endpoint.php
```

## Endpoints

### 1. Lấy danh sách sản phẩm (Paginated)
**Endpoint:** `GET /product_api_endpoint.php?action=getProducts`

**Parameters:**
- `page` (optional, default: 1) - Trang số bao nhiêu
- `limit` (optional, default: 50) - Số lượng sản phẩm trên mỗi trang

**Example cURL:**
```bash
curl "http://localhost/computer-store/backend/products/product_api_endpoint.php?action=getProducts&page=1&limit=10"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "product_id": 1,
      "product_name": "Intel Core i9",
      "product_price": "15999000",
      "product_quantity": "50",
      "product_description": "High-performance processor",
      "product_created_at": "2025-12-07 10:30:00",
      "image_main": "product_1733566800_123abc.jpg",
      "rating": 4.5,
      "manufacturer_name": "Intel"
    }
  ],
  "total_items": 150,
  "total_pages": 15,
  "current_page": 1,
  "limit": 10
}
```

---

### 2. Lấy chi tiết sản phẩm
**Endpoint:** `GET /product_api_endpoint.php?action=getProductById&id=1`

**Parameters:**
- `id` (required) - ID sản phẩm

**Example cURL:**
```bash
curl "http://localhost/computer-store/backend/products/product_api_endpoint.php?action=getProductById&id=1"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "product_id": 1,
    "product_name": "Intel Core i9",
    "product_price": "15999000",
    "product_quantity": "50",
    "product_description": "High-performance processor",
    "product_created_at": "2025-12-07 10:30:00",
    "product_update_at": null,
    "image_main": "product_1733566800_123abc.jpg",
    "manufacturer_id": 1,
    "rating": 4.5,
    "manufacturer_name": "Intel"
  }
}
```

---

### 3. Thêm sản phẩm mới
**Endpoint:** `POST /product_api_endpoint.php?action=addProduct`

**Parameters (Form Data):**
- `name` (required) - Tên sản phẩm
- `price` (required) - Giá sản phẩm (số)
- `quantity` (optional) - Số lượng (mặc định: 0)
- `description` (optional) - Mô tả
- `manufacturer_id` (optional) - ID nhà sản xuất
- `image_main` (optional) - Tên file ảnh chính

**Example cURL:**
```bash
curl -X POST "http://localhost/computer-store/backend/products/product_api_endpoint.php?action=addProduct" \
  -d "name=AMD Ryzen 9" \
  -d "price=14999000" \
  -d "quantity=30" \
  -d "description=High-end gaming processor" \
  -d "manufacturer_id=2" \
  -d "image_main=amd_ryzen_9.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "Product added successfully",
  "product_id": 5
}
```

---

### 4. Cập nhật sản phẩm
**Endpoint:** `POST /product_api_endpoint.php?action=updateProduct`

**Parameters (Form Data):**
- `id` (required) - ID sản phẩm
- `name` (required) - Tên sản phẩm
- `price` (required) - Giá sản phẩm
- `quantity` (optional) - Số lượng
- `description` (optional) - Mô tả
- `manufacturer_id` (optional) - ID nhà sản xuất
- `image_main` (optional) - Tên file ảnh chính

**Example cURL:**
```bash
curl -X POST "http://localhost/computer-store/backend/products/product_api_endpoint.php?action=updateProduct" \
  -d "id=1" \
  -d "name=Intel Core i9 Updated" \
  -d "price=16999000" \
  -d "quantity=40" \
  -d "image_main=intel_i9_updated.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully"
}
```

---

### 5. Xóa sản phẩm
**Endpoint:** `POST /product_api_endpoint.php?action=deleteProduct`

**Parameters (Form Data):**
- `id` (required) - ID sản phẩm

**Example cURL:**
```bash
curl -X POST "http://localhost/computer-store/backend/products/product_api_endpoint.php?action=deleteProduct" \
  -d "id=1"
```

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## Class Methods

### `Products_class`

#### `getProducts(int $limit, int $offset): array`
- Lấy danh sách sản phẩm với pagination
- LEFT JOIN votes để lấy rating trung bình
- LEFT JOIN manufacturers để lấy tên hãng

#### `getCountProducts(): int`
- Lấy tổng số sản phẩm

#### `getProductById(int $product_id): object|false`
- Lấy chi tiết sản phẩm theo ID
- Kèm rating & manufacturer_name

#### `addProduct(string $name, float $price, string $quantity, string $description, int $manufacturer_id, string $image_main): int|false`
- Thêm sản phẩm mới
- Returns: product_id nếu thành công, false nếu lỗi

#### `updateProduct(int $id, string $name, float $price, string $quantity, string $description, int $manufacturer_id, string $image_main): bool`
- Cập nhật thông tin sản phẩm
- Chỉ cập nhật image_main nếu được provide

#### `deleteProduct(int $product_id): bool`
- Xóa sản phẩm theo ID

---

## Error Handling

**Status Codes:**
- `200` - Success
- `201` - Created (thêm thành công)
- `400` - Bad Request (validation error)
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Server Error

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Validation Rules

| Field | Required | Type | Min | Max | Note |
|-------|----------|------|-----|-----|------|
| name | ✅ | string | 1 | 255 | Không được để trống |
| price | ✅ | float | 0 | ∞ | Phải >= 0 |
| quantity | ❌ | string | - | - | Default: "0" |
| description | ❌ | string | - | 1000 | Tối đa 1000 ký tự |
| manufacturer_id | ❌ | int | 1 | - | Foreign key |
| image_main | ❌ | string | - | 255 | Tên file |

---

## JavaScript/Fetch Examples

### Lấy danh sách sản phẩm:
```javascript
fetch('http://localhost/computer-store/backend/products/product_api_endpoint.php?action=getProducts&page=1&limit=10')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Lấy chi tiết sản phẩm:
```javascript
fetch('http://localhost/computer-store/backend/products/product_api_endpoint.php?action=getProductById&id=1')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Thêm sản phẩm:
```javascript
fetch('http://localhost/computer-store/backend/products/product_api_endpoint.php?action=addProduct', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    name: 'Intel Core i9',
    price: 15999000,
    quantity: 50,
    description: 'High-performance processor',
    manufacturer_id: 1,
    image_main: 'intel_i9.jpg'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

### Cập nhật sản phẩm:
```javascript
fetch('http://localhost/computer-store/backend/products/product_api_endpoint.php?action=updateProduct', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    id: 1,
    name: 'Intel Core i9 Updated',
    price: 16999000,
    quantity: 40
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

### Xóa sản phẩm:
```javascript
fetch('http://localhost/computer-store/backend/products/product_api_endpoint.php?action=deleteProduct', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ id: 1 })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## Notes

1. **Prices:** Lưu trữ theo format string (varchar), convert to float khi cần
2. **Quantities:** Lưu trữ theo format string để hỗ trợ các unit khác nhau
3. **Images:** Chỉ lưu tên file, folder ảnh nằm ở `backend/uploads/products_img/`
4. **Ratings:** Tính toán từ bảng `votes` với LEFT JOIN
5. **Timestamps:** 
   - `product_created_at` - Auto set khi insert
   - `product_update_at` - Auto update khi UPDATE

---

## CORS Configuration

API hỗ trợ CORS cho các origin:
- `http://localhost:3000`
- `http://localhost:5173`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`

Thêm domain production vào `$allowedOrigins` nếu cần.
