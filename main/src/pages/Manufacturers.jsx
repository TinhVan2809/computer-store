import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import ManufacturerList from '../components/Manufacturers/ManufacturerList';
import ManufacturerForm from '../components/Manufacturers/ManufacturerForm';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/manufacturers.css';

function Manufacturers() {
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const API_BASE = 'http://localhost/computer-store/backend/manufacturers/manufacturer_api_endpoint.php';
  const LIMIT = 10;

  // Fetch manufacturers
  const fetchManufacturers = async (page = 0) => {
    setLoading(true);
    setError('');
    try {
      const offset = page * LIMIT;
      const response = await fetch(
        `${API_BASE}?action=get_all&limit=${LIMIT}&offset=${offset}`
      );
      const data = await response.json();

      if (data.success) {
        setManufacturers(data.data);
        setTotalCount(data.total);
        setCurrentPage(page);
      } else {
        setError(data.message || 'Failed to fetch manufacturers');
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManufacturers(0);
  }, []);

  // Handle add/update
  const handleSave = async (formData) => {
    try {
      const url = editingId
        ? `${API_BASE}?action=update`
        : `${API_BASE}?action=add`;

      if (editingId) {
        formData.append('id', editingId);
      }

      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setShowForm(false);
        setEditingId(null);
        fetchManufacturers(currentPage);
        alert(data.message);
      } else {
        setError(data.message || 'Error saving manufacturer');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this manufacturer?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}?action=delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ id })
      });

      const data = await response.json();

      if (data.success) {
        alert('Manufacturer deleted successfully');
        fetchManufacturers(currentPage);
      } else {
        setError(data.message || 'Error deleting manufacturer');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  // Handle edit
  const handleEdit = (manufacturer) => {
    setEditingId(manufacturer.manufacturer_id);
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

    <div className="manufacturers-container">
      <div className="manufacturers-header">
        <h1>Quản lý Nhà Sản Xuất</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Hủy' : '+ Thêm Nhà Sản Xuất'}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {showForm && (
        <ManufacturerForm
          onSave={handleSave}
          onCancel={handleCancel}
          editingId={editingId}
        />
      )}

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <>
              <ErrorBoundary>
                <ManufacturerList
                  manufacturers={manufacturers}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </ErrorBoundary>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={currentPage === 0}
                onClick={() => fetchManufacturers(currentPage - 1)}
              >
                Trang Trước
              </button>

              <span>
                Trang {currentPage + 1} / {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => fetchManufacturers(currentPage + 1)}
              >
                Trang Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
    </>
  );
}

export default Manufacturers;
