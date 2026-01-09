import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../context/UserContext";
import API from "../api/api";
import "../styles/orders.css";

function Orders() {
  const IMAGES =
    "http://localhost/computer-store/backend/uploads/products_img/";
  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const statusLabels = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    in_progress: "Đang xử lý",
    shipped: "Đã gửi hàng",
    in_transit: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
  };

  const statusColors = {
    pending: "#ffa500",
    confirmed: "#4169e1",
    in_progress: "#9370db",
    shipped: "#20b2aa",
    in_transit: "#3cb371",
    delivered: "#228b22",
    cancelled: "#dc143c",
  };

  const fetchOrders = async (page = 1) => {
    if (!currentUser?.id) return;

    setLoading(true);
    try {
      const response = await API.get("/orders", {
        params: {
          page,
          limit: 10,
        },
      });

      let filteredOrders = response.data.orders || [];
      if (statusFilter !== "all") {
        filteredOrders = filteredOrders.filter(
          (order) => order.status === statusFilter
        );
      }

      setOrders(filteredOrders);
      setTotalPages(response.data.pagination.pages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Lỗi khi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchOrders(1);
    }
  }, [currentUser?.id, statusFilter]);

  const handleViewDetail = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Bạn chắc chắn muốn hủy đơn hàng này?")) {
      try {
        await API.put(`/orders/${orderId}`, { status: "cancelled" });
        alert("Hủy đơn hàng thành công");
        fetchOrders(currentPage);
      } catch (error) {
        console.error("Error cancelling order:", error);
        alert("Lỗi khi hủy đơn hàng");
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="orders-empty">
        <p>Vui lòng đăng nhập để xem đơn hàng</p>
        <button onClick={() => navigate("/login")}>Đăng nhập</button>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <h1>Đơn hàng của tôi</h1>

        {/* ========== FILTER ========== */}
        <div className="orders-filter">
          <button
            className={`filter-btn ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            Tất cả
          </button>
          <button
            className={`filter-btn ${
              statusFilter === "pending" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("pending")}
          >
            Chờ xác nhận
          </button>
          <button
            className={`filter-btn ${
              statusFilter === "confirmed" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("confirmed")}
          >
            Đã xác nhận
          </button>
          <button
            className={`filter-btn ${
              statusFilter === "In transit" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("In transit")}
          >
            Đang giao
          </button>
          <button
            className={`filter-btn ${
              statusFilter === "delivered" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("delivered")}
          >
            Đã giao
          </button>
          <button
            className={`filter-btn ${
              statusFilter === "cancelled" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("cancelled")}
          >
            Đã hủy
          </button>
        </div>

        {/* ========== DANH SÁCH ĐƠN HÀNG ========== */}
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <p>Chưa có đơn hàng nào</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.order_id} className="order-card">
                <div className="order-header">
                  <div className="order-id">
                    <p className="label">Mã đơn hàng</p>
                    <p className="value">#{order.order_id}</p>
                  </div>
                  <div className="order-status">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: statusColors[order.status] }}
                    >
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <div className="order-date">
                    <p className="label">Ngày đặt</p>
                    <p className="value">
                      {new Date(order.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>

                <div className="order-address">
                  <p>
                    <strong>{order.recipient_name}</strong> |{" "}
                    {order.recipient_phone}
                  </p>
                  <p>
                    {order.specific_address}, {order.ward_name},{" "}
                    {order.district_name}, {order.province_name}
                  </p>
                </div>

                <div className="order_product_items border-t border-gray-200">
                  {order.items.map((item) => (
                    <>
                      <div
                        className="product-item flex gap-3 items-center cursor-pointer"
                        key={item.order_item_id}
                        onClick={() => navigate(`/detail/${item.product_id}`)}
                      >
                        <div className="product-image">
                          <img
                            src={`${IMAGES}/${item.image_main}`}
                            alt={item.product_name}
                            className="w-20 h-auto"
                          />
                        </div>
                        <div className="product-details">
                          <p className="product-name text-sm">
                            {item.product_name}
                          </p>
                          <div className="flex justify-start items-end gap-1">
                            <p className="product-quantity text-[13px] text-gray-500">
                              x{item.quantity}
                            </p>
                            <p className="font-bold text-red-500 text-sm">
                              {formatter.format(item.price)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  ))}
                </div>

                <div className="order-total">
                    <span className="label">Tổng cộng:</span>
                    <span className="line-through text-gray-400 text-sm">
                      {formatter.format(order.total_amount)}
                    </span>
                    <span className="amount">
                      {formatter.format(order.amount)}
                    </span>
                </div>


                <div className="order-actions">
                  <button
                    className="action-btn view-btn"
                    onClick={() => handleViewDetail(order.order_id)}
                  >
                    Xem chi tiết
                  </button>
                  {order.status === "pending" ||
                  order.status === "confirmed" ? (
                    <button
                      className="action-btn cancel-btn"
                      onClick={() => handleCancelOrder(order.order_id)}
                    >
                      Hủy đơn
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========== PAGINATION ========== */}
        {!loading && orders.length > 0 && totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => fetchOrders(currentPage - 1)}
            >
              Trước
            </button>
            <span>
              Trang {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => fetchOrders(currentPage + 1)}
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
