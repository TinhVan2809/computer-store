import { useState, useEffect } from 'react';
import ProductList from '../components/Products/ProductList';
import ProductForm from '../components/Products/ProductForm';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/products.css';
import { NavLink } from 'react-router-dom';

function Products() {
  const [products, setProducts] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const PRODUCTS_API = 'http://localhost/computer-store/backend/products/product_api_endpoint.php';
  const MANUFACTURERS_API = 'http://localhost/computer-store/backend/manufacturers/manufacturer_api_endpoint.php';
  const LIMIT = 10;

  // Fetch manufacturers for dropdown
  useEffect(() => {
    fetchManufacturers();
    fetchProducts(0);
  }, []);

  const fetchManufacturers = async () => {
    try {
      const response = await fetch(`${MANUFACTURERS_API}?action=get_all&limit=100`);
      const data = await response.json();
      if (data.success) {
        setManufacturers(data.data);
      }
    } catch (err) {
      console.error('Error fetching manufacturers:', err);
    }
  };

  // Fetch products
  const fetchProducts = async (page = 0) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${PRODUCTS_API}?action=getProducts&page=${page + 1}&limit=${LIMIT}`
      );
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
        setTotalCount(data.total_items);
        setCurrentPage(page);
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle add/update
  const handleSave = async (formData) => {
    try {
      const url = editingId
        ? `${PRODUCTS_API}?action=updateProduct`
        : `${PRODUCTS_API}?action=addProduct`;

      // Extract secondary images before sending main form
      const secondaryImages = [];
      const entries = formData.entries();
      let productId = editingId;

      for (let entry of entries) {
        if (entry[0] === 'secondary_images') {
          secondaryImages.push(entry[1]);
        }
      }

      // Remove secondary_images from formData (will be handled separately)
      const cleanFormData = new FormData();
      for (let [key, value] of formData) {
        if (key !== 'secondary_images') {
          cleanFormData.append(key, value);
        }
      }

      if (editingId) {
        cleanFormData.append('id', editingId);
      }

      const response = await fetch(url, {
        method: 'POST',
        body: cleanFormData
      });

      const data = await response.json();

      if (data.success) {
        // If adding new product, get the product_id from response
        if (!editingId) {
          productId = data.product_id;
        }

        // Upload secondary images if any
        if (secondaryImages.length > 0) {
          const imageFormData = new FormData();
          imageFormData.append('action', 'addSecondaryImages');
          imageFormData.append('product_id', productId);
          
          secondaryImages.forEach((image) => {
            // Use images[] as the field name to ensure PHP treats this as an array of files
            imageFormData.append('images[]', image);
          });

          try {
            const imageResponse = await fetch(PRODUCTS_API, {
              method: 'POST',
              body: imageFormData
            });

            const imageData = await imageResponse.json();
            if (!imageData.success) {
              console.warn('Warning: Secondary images upload failed', imageData.message);
            }
          } catch (imageErr) {
            console.warn('Warning: Error uploading secondary images:', imageErr);
          }
        }

        setShowForm(false);
        setEditingId(null);
        fetchProducts(currentPage);
        alert(data.message);
      } else {
        setError(data.message || 'Error saving product');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      return;
    }

    try {
      const response = await fetch(`${PRODUCTS_API}?action=deleteProduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ id })
      });

      const data = await response.json();

      if (data.success) {
        alert('Sản phẩm đã được xóa thành công');
        fetchProducts(currentPage);
      } else {
        setError(data.message || 'Error deleting product');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  // Handle edit
  const handleEdit = (product) => {
    setEditingId(product.product_id);
    setShowForm(true);
  };

  // Handle cancel
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const totalPages = Math.ceil(totalCount / LIMIT);

  return (
    <>
    <NavLink to='/'>Home</NavLink>
    
    <div className="products-container">
      <div className="products-header">
        <h1>Quản lý Sản Phẩm</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Hủy' : '+ Thêm Sản Phẩm'}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {showForm && (
        <ProductForm
          onSave={handleSave}
          onCancel={handleCancel}
          editingId={editingId}
          manufacturers={manufacturers}
        />
      )}

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <>
          <ErrorBoundary>
            <ProductList
              products={products}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </ErrorBoundary>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={currentPage === 0}
                onClick={() => fetchProducts(currentPage - 1)}
              >
                ← Trang Trước
              </button>

              <span>
                Trang {currentPage + 1} / {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => fetchProducts(currentPage + 1)}
              >
                Trang Sau →
              </button>
            </div>
          )}
        </>
      )}
    </div>
    </>
  );
}

export default Products;
