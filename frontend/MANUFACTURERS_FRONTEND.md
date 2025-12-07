# Frontend Manufacturers Management - Hướng dẫn Sử Dụng

## 📁 Cấu trúc File

```
frontend/
├── src/
│   ├── pages/
│   │   └── Manufacturers.jsx          # Page chính quản lý nhà sản xuất
│   ├── components/
│   │   └── Manufacturers/
│   │       ├── ManufacturerForm.jsx   # Component form với validation
│   │       └── ManufacturerList.jsx   # Component danh sách
│   ├── styles/
│   │   └── manufacturers.css          # CSS styling
│   └── App.jsx                         # Router cập nhật
```

## 🚀 Chức Năng

### 1. **Danh sách nhà sản xuất (Paginated)**
- Hiển thị tối đa 10 nhà sản xuất trên mỗi trang
- Pagination: Trang Trước / Trang Sau
- Hiển thị logo, tên, website
- Nút Sửa / Xóa cho mỗi item

### 2. **Form Thêm/Sửa**
- **Fields:**
  - Tên nhà sản xuất (bắt buộc)
  - Website/URL (optional)
  - Mô tả (optional)
  - Logo ảnh (optional, upload)

### 3. **Validation (Frontend)**
- ✅ Tên: bắt buộc, 2-255 ký tự
- ✅ URL: format hợp lệ (ví dụ: https://example.com)
- ✅ Mô tả: tối đa 1000 ký tự
- ✅ Logo: JPEG/PNG/WebP/GIF, max 5MB
- ✅ Character counter cho name & description
- ✅ Real-time error clearing

### 4. **Tính Năng**
- Preview ảnh trước khi upload
- Edit nhà sản xuất (load dữ liệu cũ)
- Delete với confirm dialog
- Loading states
- Error messages
- Success notifications

## 🎨 Styling Features

### Responsive Design
- ✅ Desktop (> 768px)
- ✅ Tablet (481px - 768px)
- ✅ Mobile (< 480px)

### Animations
- Slide-in alerts
- Slide-down form
- Hover effects trên buttons & rows

### Color Scheme
- Primary: #007bff (Blue)
- Success: #28a745 (Green)
- Danger: #dc3545 (Red)
- Info: #17a2b8 (Cyan)
- Secondary: #6c757d (Gray)

## 🔗 API Integration

**Base URL:**
```
http://localhost/computer-store/backend/manufacturers/manufacturer_api_endpoint.php
```

**Actions:**
- `action=get_all` - Lấy danh sách
- `action=get_by_id` - Lấy chi tiết (dùng khi edit)
- `action=add` - Thêm mới
- `action=update` - Cập nhật
- `action=delete` - Xóa

## 📝 Component Details

### ManufacturerForm.jsx

**Props:**
- `onSave(formData)` - Callback khi submit form
- `onCancel()` - Callback khi hủy
- `editingId` - ID nhà sản xuất đang edit (null khi thêm mới)

**State:**
- `formData` - Object chứa name, url, description, logo
- `errors` - Object chứa validation errors
- `loading` - Boolean loading state
- `previewImage` - URL preview ảnh

**Methods:**
- `validateForm()` - Validate tất cả fields
- `handleInputChange()` - Handle text input changes
- `handleFileChange()` - Handle file upload & preview
- `handleSubmit()` - Submit form

### ManufacturerList.jsx

**Props:**
- `manufacturers` - Array danh sách nhà sản xuất
- `onEdit(manufacturer)` - Callback edit
- `onDelete(id)` - Callback delete

**Features:**
- Hiển thị logo thumbnail
- Link website (target="_blank")
- Error fallback cho ảnh không load

### Manufacturers.jsx (Page)

**Features:**
- Manage page state (loading, error, pagination)
- Fetch data từ API
- Handle CRUD operations
- Pagination logic

## 🔒 Security Features

- ✅ XSS prevention qua React (auto escape)
- ✅ CORS enabled (frontend origin whitelist)
- ✅ Input validation (frontend + backend)
- ✅ File type validation (MIME type)
- ✅ File size limit (5MB)

## 📱 Usage Example

### Access trang quản lý:
```
http://localhost:5173/manufacturers
```

### Thêm nhà sản xuất:
1. Click "Thêm Nhà Sản Xuất"
2. Nhập tên (bắt buộc)
3. (Optional) Nhập URL & mô tả
4. (Optional) Chọn logo
5. Click "Thêm Mới"

### Sửa nhà sản xuất:
1. Click "Sửa" ở row
2. Form tự load dữ liệu cũ
3. Thay đổi thông tin
4. (Optional) Chọn logo mới
5. Click "Cập Nhật"

### Xóa nhà sản xuất:
1. Click "Xóa" ở row
2. Confirm dialog
3. Nhà sản xuất & ảnh bị xóa

## ⚙️ Configuration

### Thay đổi số item per page:
Edit trong `Manufacturers.jsx`:
```jsx
const LIMIT = 10; // Thay đổi thành số khác
```

### Thay đổi API base URL:
Tìm tất cả chỗ có:
```jsx
const API_BASE = 'http://localhost/computer-store/backend/manufacturers/manufacturer_api_endpoint.php';
```

### Thêm validation rules:
Edit method `validateForm()` trong `ManufacturerForm.jsx`

## 🐛 Common Issues

**Issue:** Logo không hiển thị
- **Solution:** Check xem file có tồn tại trong `backend/uploads/manufacturers_img/`

**Issue:** API 404 errors
- **Solution:** Đảm bảo backend file path đúng

**Issue:** CORS errors
- **Solution:** Kiểm tra CORS config trong `manufacturer_api_endpoint.php`

## 🎯 Validation Rules Summary

| Field | Required | Min | Max | Type |
|-------|----------|-----|-----|------|
| Name | ✅ | 2 | 255 | Text |
| URL | ❌ | - | - | URL |
| Description | ❌ | - | 1000 | Text |
| Logo | ❌ | - | 5MB | Image |

## 📊 Response Handling

**Success Response:**
```json
{
  "success": true,
  "message": "Action completed successfully",
  "data": {...}
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

## 🚀 Performance Tips

1. Images được cache bởi browser
2. Pagination giảm load DB
3. Form validation trước khi submit (giảm server requests)
4. Lazy loading ảnh có thể implement thêm

## 📦 Dependencies

- React (useState, useEffect)
- React Router (routing)
- CSS3 (animations, responsive)

## 🔄 State Management Flow

```
Manufacturers.jsx (Page State)
  ├── manufacturers (list data)
  ├── loading, error (states)
  ├── currentPage, totalCount (pagination)
  └── editingId (form state)
      ├── ManufacturerForm (local validation)
      └── ManufacturerList (display)
```

## 📞 Support

Để thêm feature hoặc fix bug, kiểm tra:
1. Browser console (F12)
2. Network tab - check API responses
3. Server logs - PHP error_log
