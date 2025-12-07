function ManufacturerList({ manufacturers, onEdit, onDelete }) {
  return (
    <div className="manufacturer-list">
      {manufacturers.length === 0 ? (
        <div className="empty-state">
          <p>Không có nhà sản xuất nào. Hãy thêm một nhà sản xuất mới!</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Logo</th>
              <th>Tên Nhà Sản Xuất</th>
              <th>Website</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {manufacturers.map(manufacturer => (
              <tr key={manufacturer.manufacturer_id}>
                <td>{manufacturer.manufacturer_id}</td>
                <td>
                  {manufacturer.manufacturer_logo_image ? (
                    <img
                      src={`http://localhost/computer-store/backend/uploads/manufacturers_img/${manufacturer.manufacturer_logo_image}`}
                      alt={manufacturer.manufacturer_name}
                      className="logo-thumbnail"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/50?text=No+Image';
                      }}
                    />
                  ) : (
                    <span className="no-image">Không có ảnh</span>
                  )}
                </td>
                <td>
                  <strong>{manufacturer.manufacturer_name}</strong>
                </td>
                <td>
                  {manufacturer.manufacturer_url ? (
                    <a href={manufacturer.manufacturer_url} target="_blank" rel="noopener noreferrer">
                      {manufacturer.manufacturer_url}
                    </a>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => onEdit(manufacturer)}
                      title="Chỉnh sửa"
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => onDelete(manufacturer.manufacturer_id)}
                      title="Xóa"
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ManufacturerList;
