function ProductList({ products, onEdit, onDelete }) {
  return (
    <div className="product-list">
      {products.length === 0 ? (
        <div className="empty-state">
          <p>Không có sản phẩm nào. Hãy thêm một sản phẩm mới!</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ảnh</th>
              <th>Tên Sản Phẩm</th>
              <th>Giá</th>
              <th>Số Lượng</th>
              <th>Nhà Sản Xuất</th>
              <th>Rating</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.product_id}>
                <td>#{product.product_id}</td>
                <td>
                  {product.image_main ? (
                    <img
                      src={`http://localhost/computer-store/backend/uploads/products_img/${product.image_main}`}
                      alt={product.product_name}
                      className="product-thumbnail"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/50?text=No+Image';
                      }}
                    />
                  ) : (
                    <span className="no-image">Không có ảnh</span>
                  )}
                </td>
                <td>
                  <strong>{product.product_name}</strong>
                </td>
                <td>
                  <span className="price">
                    ${parseFloat(product.product_price).toLocaleString('en-EN')}
                  </span>
                </td>
                <td>
                  <span className={product.product_quantity === '0' ? 'stock-warning' : ''}>
                    {product.product_quantity}
                  </span>
                </td>
                <td>
                  {product.manufacturer_name ? (
                    <span className="badge">{product.manufacturer_name}</span>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td>
                  <div className="rating">
                    {product.rating > 0 ? (
                      <>
                        <span className="stars">{'⭐'.repeat(Math.round(product.rating))}</span>
                        <span className="rating-value">{parseFloat(product.rating).toFixed(1)}</span>
                      </>
                    ) : (
                      <span className="text-muted">Chưa có</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => onEdit(product)}
                      title="Chỉnh sửa"
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => onDelete(product.product_id)}
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

export default ProductList;
