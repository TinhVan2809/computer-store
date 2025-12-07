# Manufacturers API Documentation

## Tổng Quan
API để quản lý nhà sản xuất (thêm, sửa, xóa, lấy thông tin) với xử lý upload ảnh tối ưu.

## Base URL
```
http://localhost/computer-store/backend/manufacturers/manufacturer_api_endpoint.php
```

## Endpoints

### 1. Lấy tất cả nhà sản xuất (Paginated)
**Endpoint:** `GET /manufacturer_api_endpoint.php?action=get_all`

**Parameters:**
- `limit` (optional, default: 10) - Số lượng bản ghi trên mỗi trang
- `offset` (optional, default: 0) - Vị trí bắt đầu

**Example cURL:**
```bash
curl "http://localhost/computer-store/backend/manufacturers/manufacturer_api_endpoint.php?action=get_all&limit=10&offset=0"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "manufacturer_id": 1,
      "manufacturer_name": "Intel",
      "manufacturer_logo_image": "manufacturer_1733566800_123abc.jpg",
      "manufacturer_url": "https://intel.com"
    }
  ],
  "total": 15,
  "limit": 10,
  "offset": 0
}
```

---

### 2. Lấy chi tiết nhà sản xuất
**Endpoint:** `GET /manufacturer_api_endpoint.php?action=get_by_id&id=1`

**Parameters:**
- `id` (required) - ID của nhà sản xuất

**Example cURL:**
```bash
curl "http://localhost/computer-store/backend/manufacturers/manufacturer_api_endpoint.php?action=get_by_id&id=1"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "manufacturer_id": 1,
    "manufacturer_name": "Intel",
    "manufacturer_logo_image": "manufacturer_1733566800_123abc.jpg",
    "manufacturer_url": "https://intel.com",
    "description": "Global leader in semiconductors",
    "manufacturer_created_at": "2025-12-07 10:30:00"
  }
}
```

---

### 3. Thêm nhà sản xuất mới
**Endpoint:** `POST /manufacturer_api_endpoint.php?action=add`

**Parameters (Form Data):**
- `name` (required) - Tên nhà sản xuất
- `url` (optional) - Website của nhà sản xuất
- `description` (optional) - Mô tả
- `logo` (optional) - File ảnh logo (JPEG, PNG, WebP, GIF, max 5MB)

**Example cURL:**
```bash
curl -X POST http://localhost/computer-store/backend/manufacturers/manufacturer_api_endpoint.php?action=add \
  -F "name=AMD" \
  -F "url=https://amd.com" \
  -F "description=Advanced Micro Devices" \
  -F "logo=@/path/to/logo.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "Manufacturer added successfully",
  "manufacturer_id": 5
}
```

---

### 4. Cập nhật nhà sản xuất
**Endpoint:** `POST /manufacturer_api_endpoint.php?action=update`

**Parameters (Form Data):**
- `id` (required) - ID nhà sản xuất
- `name` (required) - Tên nhà sản xuất
- `url` (optional) - Website
- `description` (optional) - Mô tả
- `logo` (optional) - File ảnh logo mới (sẽ thay thế ảnh cũ)

**Example cURL:**
```bash
curl -X POST http://localhost/computer-store/backend/manufacturers/manufacturer_api_endpoint.php?action=update \
  -F "id=1" \
  -F "name=Intel Corporation" \
  -F "url=https://intel.com" \
  -F "description=Updated description" \
  -F "logo=@/path/to/new_logo.png"
```

**Response:**
```json
{
  "success": true,
  "message": "Manufacturer updated successfully"
}
```

---

### 5. Xóa nhà sản xuất
**Endpoint:** `POST /manufacturer_api_endpoint.php?action=delete`

**Parameters (Form Data):**
- `id` (required) - ID nhà sản xuất

**Example cURL:**
```bash
curl -X POST http://localhost/computer-store/backend/manufacturers/manufacturer_api_endpoint.php?action=delete \
  -d "id=1"
```

**Response:**
```json
{
  "success": true,
  "message": "Manufacturer deleted successfully"
}
```

---

## Xử Lý Upload Ảnh

### Tính năng:
- ✅ Validate MIME type (JPEG, PNG, WebP, GIF)
- ✅ Giới hạn kích thước file (max 5MB)
- ✅ Tạo thư mục `uploads/manufacturers_img/` tự động nếu không tồn tại
- ✅ Rename file theo format: `manufacturer_[timestamp]_[uniqid].[ext]`
- ✅ Xóa ảnh cũ khi update (nếu có ảnh mới)
- ✅ Xóa ảnh khi xóa nhà sản xuất

### Cấu trúc Folder:
```
backend/
├── manufacturers/
│   ├── manufacturers_class.php
│   ├── manufacturer_api_endpoint.php
│   └── ../uploads/
│       └── manufacturers_img/
│           ├── manufacturer_1733566800_123abc.jpg
│           ├── manufacturer_1733566801_456def.png
│           └── ...
```

---

## Error Handling

### Lỗi Validation:
- **400 Bad Request** - Thiếu field bắt buộc hoặc file không hợp lệ
- **404 Not Found** - Nhà sản xuất không tồn tại
- **405 Method Not Allowed** - HTTP method không hợp lệ

### Response Lỗi:
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## JavaScript/Fetch Examples

### Thêm nhà sản xuất với ảnh:
```javascript
const formData = new FormData();
formData.append('name', 'NVIDIA');
formData.append('url', 'https://nvidia.com');
formData.append('description', 'GPU manufacturer');
formData.append('logo', document.getElementById('logoInput').files[0]);

fetch('http://localhost/computer-store/backend/manufacturers/manufacturer_api_endpoint.php?action=add', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => console.log(data));
```

### Lấy danh sách nhà sản xuất:
```javascript
fetch('http://localhost/computer-store/backend/manufacturers/manufacturer_api_endpoint.php?action=get_all&limit=10&offset=0')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Cập nhật nhà sản xuất:
```javascript
const formData = new FormData();
formData.append('id', 1);
formData.append('name', 'Intel Updated');
formData.append('logo', document.getElementById('logoInput').files[0]);

fetch('http://localhost/computer-store/backend/manufacturers/manufacturer_api_endpoint.php?action=update', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => console.log(data));
```

### Xóa nhà sản xuất:
```javascript
fetch('http://localhost/computer-store/backend/manufacturers/manufacturer_api_endpoint.php?action=delete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ id: 1 })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## CORS Configuration

API hỗ trợ CORS cho các origin:
- `http://localhost:3000`
- `http://localhost:5173`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`

Thêm domain production vào danh sách `$allowedOrigins` trong `manufacturer_api_endpoint.php` nếu cần.

---

## Lưu Ý

1. **Folder permissions:** Đảm bảo folder `uploads/manufacturers_img/` có quyền write (chmod 755 trở lên)
2. **File size:** Mặc định max 5MB, có thể thay đổi trong `handleImageUpload()` method
3. **Allowed MIME types:** JPEG, PNG, WebP, GIF - có thể thêm loại khác vào `$allowedMimes`
4. **Database:** Đảm bảo columns `manufacturer_logo_image`, `manufacturer_url`, `description` tồn tại trong bảng `manufacturers`
