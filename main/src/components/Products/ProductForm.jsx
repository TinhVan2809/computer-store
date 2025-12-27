import { useState, useEffect } from 'react';

function ProductForm({ onSave, onCancel, editingId, manufacturers, categories }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '0',
    description: '',
    sale: '0',
    manufacturer_id: '',
    image_main: null,
    category_id: ''
  });

  const [secondaryImages, setSecondaryImages] = useState([]); // Files selected for upload
  const [existingSecondaryImages, setExistingSecondaryImages] = useState([]); // Images from DB
  const [secondaryImagePreviews, setSecondaryImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const API_BASE = 'http://localhost/computer-store/backend/products/product_api_endpoint.php';

  // Load existing data if editing
  useEffect(() => {
    if (editingId) {
      fetchProductData(editingId);
      fetchSecondaryImages(editingId);
    }
  }, [editingId]);

  const fetchProductData = async (id) => {
    try {
      const response = await fetch(`${API_BASE}?action=getProductById&id=${id}`);
      const data = await response.json();

      if (data.success) {
        const product = data.data;
        setFormData({
          name: product.product_name || '',
          price: product.product_price || '',
          quantity: product.product_quantity || '0',
          description: product.product_description || '',
          sale: product.product_sale || '0',
          manufacturer_id: product.manufacturer_id || '',
          image_main: null,
          category_id: product.category_id || ''
        });
        if (product.image_main) {
          setPreviewImage(
            `http://localhost/computer-store/backend/uploads/products_img/${product.image_main}`
          );
        }
      }
    } catch (err) {
      console.error('Error fetching product:', err);
    }
  };

  const fetchSecondaryImages = async (productId) => {
    try {
      const response = await fetch(`${API_BASE}?action=getSecondaryImages&product_id=${productId}`);
      const data = await response.json();

      if (data.success && data.data) {
        setExistingSecondaryImages(data.data);
      }
    } catch (err) {
      console.error('Error fetching secondary images:', err);
    }
  };

  // Validation rules
  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Tên sản phẩm không được để trống';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Tên phải có ít nhất 2 ký tự';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Tên không được vượt quá 255 ký tự';
    }

    // Validate price
    if (!formData.price || formData.price.trim() === '') {
      newErrors.price = 'Giá không được để trống';
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Giá phải là một số dương';
    }

    // Validate quantity
    if (formData.quantity && formData.quantity.trim() !== '') {
      if (!/^\d+$/.test(formData.quantity.trim())) {
        newErrors.quantity = 'Số lượng phải là số nguyên dương';
      }
    }

    // Validate description
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Mô tả không được vượt quá 1000 ký tự';
    }

    // Validate image file
    if (formData.image_main) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (formData.image_main.size > maxSize) {
        newErrors.image_main = 'Kích thước ảnh không được vượt quá 5MB';
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
      if (!allowedTypes.includes(formData.image_main.type)) {
        newErrors.image_main = 'Chỉ chấp nhận các định dạng: JPEG, PNG, WebP, GIF';
      }
    }

    // Validate secondary images
    if (secondaryImages.length > 0) {
      const maxSize = 5 * 1024 * 1024;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
      
      for (let i = 0; i < secondaryImages.length; i++) {
        const file = secondaryImages[i];
        if (file.size > maxSize) {
          newErrors[`secondary_image_${i}`] = `Ảnh ${i + 1}: vượt quá 5MB`;
        }
        if (!allowedTypes.includes(file.type)) {
          newErrors[`secondary_image_${i}`] = `Ảnh ${i + 1}: định dạng không hỗ trợ`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle main file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image_main: file
      }));

      // Show preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target.result);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.image_main) {
        setErrors(prev => ({
          ...prev,
          image_main: ''
        }));
      }
    }
  };

  // Handle secondary images change
  const handleSecondaryImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setSecondaryImages(files);

    // Generate previews
    const previews = [];
    let loadedCount = 0;

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        previews[index] = {
          file: file,
          src: event.target.result
        };
        loadedCount++;
        
        if (loadedCount === files.length) {
          setSecondaryImagePreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });

    // Clear errors for secondary images
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith('secondary_image_')) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  // Remove secondary image preview
  const removeSecondaryImagePreview = (index) => {
    setSecondaryImagePreviews(prev => prev.filter((_, i) => i !== index));
    setSecondaryImages(prev => prev.filter((_, i) => i !== index));
  };

  // Delete existing secondary image
  const handleDeleteExistingImage = async (imageId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa ảnh này?')) {
      return;
    }

    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          action: 'deleteSecondaryImage',
          image_id: imageId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setExistingSecondaryImages(prev => prev.filter(img => img.image_id !== imageId));
        alert('Ảnh đã được xóa thành công');
      } else {
        alert('Lỗi: ' + data.message);
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      alert('Lỗi khi xóa ảnh');
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      submitFormData.append('price', formData.price);
      submitFormData.append('quantity', formData.quantity);
      submitFormData.append('description', formData.description);
      submitFormData.append('product_sale', formData.sale);
      submitFormData.append('manufacturer_id', formData.manufacturer_id);
      submitFormData.append('category_id', formData.category_id);

      if (formData.image_main) {
        submitFormData.append('image_main', formData.image_main);
      }

      // Append secondary images using `images[]` so PHP receives an array
      secondaryImages.forEach((image) => {
        submitFormData.append('images[]', image);
      });

      onSave(submitFormData);
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Tên Sản Phẩm *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Nhập tên sản phẩm"
          maxLength="255"
          className={errors.name ? 'input-error' : ''}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
        <span className="char-count">{formData.name.length}/255</span>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="price">Giá *</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="0"
            step="0.01"
            min="0"
            className={errors.price ? 'input-error' : ''}
          />
          {errors.price && <span className="error-message">{errors.price}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="quantity">Số Lượng</label>
          <input
            type="text"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            placeholder="0"
            className={errors.quantity ? 'input-error' : ''}
          />
          {errors.quantity && <span className="error-message">{errors.quantity}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="sale">Sale</label>
         <div className="sale-input">
           <input
            type="text"
            id="sale"
            name="sale"
            value={formData.sale}
            onChange={handleInputChange}
            placeholder="0"
            className={errors.sale ? 'input-error' : ''}
          />
          <span>%</span>
         </div>
          
          {errors.sale && <span className="error-message">{errors.sale}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="manufacturer_id">Nhà Sản Xuất</label>
          <select
            id="manufacturer_id"
            name="manufacturer_id"
            value={formData.manufacturer_id}
            onChange={handleInputChange}
          >
            <option value="">-- Chọn Nhà Sản Xuất --</option>
            {manufacturers.map(m => (
              <option key={m.manufacturer_id} value={m.manufacturer_id}>
                {m.manufacturer_name}
              </option>
            ))}
          </select>
        </div>

         <div className="form-group">
          <label htmlFor="category_id"> Loại sản phẩm</label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
          >
            <option value="">-- Chọn Loại sản phẩm --</option>
            {categories.map(c => (
              <option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>

      </div>

      <div className="form-group">
        <label htmlFor="description">Mô Tả</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Nhập mô tả sản phẩm"
          maxLength="1000"
          rows="4"
          className={errors.description ? 'input-error' : ''}
        />
        {errors.description && <span className="error-message">{errors.description}</span>}
        <span className="char-count">{formData.description.length}/1000</span>
      </div>

      <div className="form-group">
        <label htmlFor="image_main">Ảnh Chính</label>
        <div className="file-upload">
          <input
            type="file"
            id="image_main"
            name="image_main"
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,image/gif"
            className={errors.image_main ? 'input-error' : ''}
          />
          <span className="file-info">
            Định dạng: JPEG, PNG, WebP, GIF | Tối đa: 5MB
          </span>
          {errors.image_main && <span className="error-message">{errors.image_main}</span>}
        </div>

        {previewImage && (
          <div className="image-preview">
            <img src={previewImage} alt="Preview" />
          </div>
        )}
      </div>

      {/* Secondary Images Section */}
      <div className="form-group">
        <label htmlFor="secondary_images">Ảnh Phụ</label>
        <div className="file-upload">
          <input
            type="file"
            id="secondary_images"
            name="secondary_images"
            onChange={handleSecondaryImagesChange}
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
          />
          <span className="file-info">
            Chọn nhiều ảnh | Định dạng: JPEG, PNG, WebP, GIF | Tối đa: 5MB/ảnh
          </span>
        </div>

        {/* Preview New Secondary Images */}
        {secondaryImagePreviews.length > 0 && (
          <div className="secondary-images-preview">
            <h4>Ảnh sắp thêm ({secondaryImagePreviews.length})</h4>
            <div className="images-grid">
              {secondaryImagePreviews.map((preview, index) => (
                <div key={index} className="image-item">
                  <img src={preview.src} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeSecondaryImagePreview(index)}
                    title="Xóa ảnh"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing Secondary Images */}
        {existingSecondaryImages.length > 0 && (
          <div className="existing-secondary-images">
            <h4>Ảnh hiện có ({existingSecondaryImages.length})</h4>
            <div className="images-grid">
              {existingSecondaryImages.map((image) => (
                <div key={image.image_id} className="image-item">
                  <img 
                    src={`http://localhost/computer-store/backend/uploads/products_img/${image.image}`}
                    alt="Product"
                    onError={(e) => e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E'}
                  />
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => handleDeleteExistingImage(image.image_id)}
                    title="Xóa ảnh"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-success"
          disabled={loading}
        >
          {loading ? 'Đang lưu...' : (editingId ? 'Cập Nhật' : 'Thêm Mới')}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Hủy
        </button>
      </div>
    </form>
  );
}

export default ProductForm;