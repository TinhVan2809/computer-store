import { useState, useEffect } from 'react';

function ManufacturerForm({ onSave, onCancel, editingId }) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    logo: null
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const API_BASE = 'http://localhost/computer-store/backend/manufacturers/manufacturer_api_endpoint.php';

  // Load existing data if editing
  useEffect(() => {
    if (editingId) {
      fetchManufacturerData(editingId);
    }
  }, [editingId]);

  const fetchManufacturerData = async (id) => {
    try {
      const response = await fetch(`${API_BASE}?action=get_by_id&id=${id}`);
      const data = await response.json();

      if (data.success) {
        const manufacturer = data.data;
        setFormData({
          name: manufacturer.manufacturer_name || '',
          url: manufacturer.manufacturer_url || '',
          description: manufacturer.description || '',
          logo: null
        });
        if (manufacturer.manufacturer_logo_image) {
          setPreviewImage(
            `http://localhost/computer-store/backend/uploads/manufacturers_img/${manufacturer.manufacturer_logo_image}`
          );
        }
      }
    } catch (err) {
      console.error('Error fetching manufacturer:', err);
    }
  };

  // Validation rules
  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Tên nhà sản xuất không được để trống';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Tên phải có ít nhất 2 ký tự';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Tên không được vượt quá 255 ký tự';
    }

    // Validate URL
    if (formData.url && formData.url.trim() !== '') {
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/; //eslint-disable-line
      if (!urlPattern.test(formData.url)) {
        newErrors.url = 'URL không hợp lệ (ví dụ: https://example.com)';
      }
    }

    // Validate description
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Mô tả không được vượt quá 1000 ký tự';
    }

    // Validate logo file
    if (formData.logo) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (formData.logo.size > maxSize) {
        newErrors.logo = 'Kích thước ảnh không được vượt quá 5MB';
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(formData.logo.type)) {
        newErrors.logo = 'Chỉ chấp nhận các định dạng: JPEG, PNG, WebP, GIF';
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

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        logo: file
      }));

      // Show preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target.result);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.logo) {
        setErrors(prev => ({
          ...prev,
          logo: ''
        }));
      }
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
      submitFormData.append('url', formData.url);
      submitFormData.append('description', formData.description);

      if (formData.logo) {
        submitFormData.append('logo', formData.logo);
      }

      onSave(submitFormData);
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="manufacturer-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Tên Nhà Sản Xuất *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Nhập tên nhà sản xuất"
          maxLength="255"
          className={errors.name ? 'input-error' : ''}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
        <span className="char-count">{formData.name.length}/255</span>
      </div>

      <div className="form-group">
        <label htmlFor="url">Website (URL)</label>
        <input
          type="text"
          id="url"
          name="url"
          value={formData.url}
          onChange={handleInputChange}
          placeholder="https://example.com"
          className={errors.url ? 'input-error' : ''}
        />
        {errors.url && <span className="error-message">{errors.url}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Mô Tả</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Nhập mô tả nhà sản xuất"
          maxLength="1000"
          rows="4"
          className={errors.description ? 'input-error' : ''}
        />
        {errors.description && <span className="error-message">{errors.description}</span>}
        <span className="char-count">{formData.description.length}/1000</span>
      </div>

      <div className="form-group">
        <label htmlFor="logo">Logo Ảnh</label>
        <div className="file-upload">
          <input
            type="file"
            id="logo"
            name="logo"
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,image/gif"
            className={errors.logo ? 'input-error' : ''}
          />
          <span className="file-info">
            Định dạng: JPEG, PNG, WebP, GIF | Tối đa: 5MB
          </span>
          {errors.logo && <span className="error-message">{errors.logo}</span>}
        </div>

        {previewImage && (
          <div className="image-preview">
            <img src={previewImage} alt="Preview" />
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

export default ManufacturerForm;
