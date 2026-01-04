import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserContext from "../context/UserContext";
import API from "../api/api";
import '../styles/order-detail.css'

function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const statusSteps = [
    { status: "pending", label: "Chờ xác nhận" },
    { status: "confirmed", label: "Đã xác nhận" },
    { status: "in_progress", label: "Đang xử lý" },
    { status: "shipped", label: "Đã gửi hàng" },
    { status: "delivered", label: "Đã giao" },
  ];

  const statusColors = {
    pending: "#ffa500",
    confirmed: "#4169e1",
    in_progress: "#9370db",
    shipped: "#20b2aa",
    in_transit: "#3cb371",
    delivered: "#228b22",
    cancelled: "#dc143c",
  };

  useEffect(() => {
    if (orderId && currentUser?.id) {
      fetchOrderDetail();
    }
  }, [orderId, currentUser?.id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/orders/${orderId}`);
      // Merge voucher into order if present
      const orderData = response.data.order || {};
      if (response.data.voucher) {
        orderData.voucher = response.data.voucher;
      }
      setOrder(orderData);
      setItems(response.data.items || []);
      setPayment(response.data.payment);
    } catch (error) {
      console.error("Error fetching order detail:", error);
      alert("Lỗi khi tải chi tiết đơn hàng");
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (window.confirm("Bạn chắc chắn muốn hủy đơn hàng này?")) {
      try {
        await API.put(`/orders/${orderId}`, { status: "cancelled" });
        alert("Hủy đơn hàng thành công");
        fetchOrderDetail();
      } catch (error) {
        console.error("Error cancelling order:", error);
        alert("Lỗi khi hủy đơn hàng");
      }
    }
  };

  const handleReturnOrder = () => {
    alert("Tính năng hoàn trả sẽ được tích hợp trong phiên bản tiếp theo");
  };

  if (!currentUser) {
    return (
      <div className="order-detail-empty">
        <p>Vui lòng đăng nhập</p>
        <button onClick={() => navigate("/login")}>Đăng nhập</button>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (!order) {
    return (
      <div className="order-detail-empty">
        <p>Không tìm thấy đơn hàng</p>
        <button onClick={() => navigate("/orders")}>Quay lại</button>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <div className="order-detail-container">
        {/* ========== HEADER ========== */}
        <div className="detail-header">
          <div>
            <h1>Chi tiết đơn hàng</h1>
            <p className="order-id">Mã đơn: #{order.order_id}</p>
          </div>
          <button
            className="back-btn"
            onClick={() => navigate("/orders")}
          >
            ← Quay lại
          </button>
        </div>

        {/* ========== TIMELINE TRẠNG THÁI ========== */}
        <div className="status-timeline">
          {statusSteps.map((step, index) => (
            <div key={step.status} className="timeline-item">
              <div
                className={`timeline-dot ${
                  order.status === step.status
                    ? "active"
                    : statusSteps.findIndex((s) => s.status === order.status) >
                      index
                    ? "completed"
                    : ""
                }`}
                style={{
                  backgroundColor:
                    statusSteps.findIndex((s) => s.status === order.status) >=
                    index
                      ? statusColors[order.status]
                      : "#ccc",
                }}
              ></div>
              <p
                className={`timeline-label ${
                  order.status === step.status ? "active" : ""
                }`}
              >
                {step.label}
              </p>
              {index < statusSteps.length - 1 && (
                <div className="timeline-line"></div>
              )}
            </div>
          ))}
        </div>

        <div className="detail-content">
          {/* ========== PHẦN TRÁI: THÔNG TIN ĐƠN HÀNG ========== */}
          <div className="detail-left">
            {/* Thông tin giao hàng */}
            <div className="detail-box">
              <h3>📦 Thông tin giao hàng</h3>
              <div className="info-item">
                <span className="label">Người nhận:</span>
                <span className="value">{order.recipient_name}</span>
              </div>
              <div className="info-item">
                <span className="label">Số điện thoại:</span>
                <span className="value">{order.recipient_phone}</span>
              </div>
              <div className="info-item">
                <span className="label">Địa chỉ:</span>
                <span className="value">
                  {order.specific_address}, {order.ward_name},
                  {order.district_name}, {order.province_name}
                </span>
              </div>
            </div>

            {/* Sản phẩm */}
            <div className="detail-box">
              <h3>📋 Sản phẩm</h3>
              <div className="items-list">
                {items.map((item) => (
                  <div key={item.order_item_id} className="item-row">
                    <div className="item-name">
                      <p>{item.product_name}</p>
                      <small>x{item.quantity}</small>
                    </div>
                    <div className="item-price">
                      {formatter.format(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Thanh toán */}
            {payment && (
              <div className="detail-box">
                <h3>💳 Thông tin thanh toán</h3>
                <div className="info-item">
                  <span className="label">Phương thức:</span>
                  <span className="value">
                    {payment.provider === "cod"
                      ? "Thanh toán khi nhận hàng"
                      : payment.provider.toUpperCase()}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Mã giao dịch:</span>
                  <span className="value">{payment.transaction_code}</span>
                </div>
                <div className="info-item">
                  <span className="label">Trạng thái:</span>
                  <span
                    className={`status-badge ${payment.status}`}
                    style={{
                      backgroundColor:
                        payment.status === "success"
                          ? "#228b22"
                          : payment.status === "pending"
                          ? "#ffa500"
                          : "#dc143c",
                    }}
                  >
                    {payment.status === "success"
                      ? "Đã thanh toán"
                      : payment.status === "pending"
                      ? "Chờ thanh toán"
                      : "Thanh toán thất bại"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ========== PHẦN PHẢI: TỔNG TIỀN & HÀNH ĐỘNG ========== */}
          <div className="detail-right">
            <div className="detail-box summary">
              <h3>💰 Tóm tắt</h3>
              <div className="summary-row">
                <span>Tiền hàng:</span>
                <span>
                  {formatter.format(
                    order.total_amount - order.shipping_fee
                  )}
                </span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển:</span>
                <span>+{formatter.format(order.shipping_fee)}</span>
              </div>
              {order.voucher && (
                <div className="summary-row">
                  <span>Voucher: </span>
                  <span>giảm: {order.voucher.sale} %</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Tổng cộng:</span>
                <span>{formatter.format(payment.amount)}</span>
              </div>
            </div>

            {/* Hành động */}
            <div className="detail-box actions">
              <h3>Hành động</h3>
              {order.status === "pending" || order.status === "confirmed" ? (
                <button
                  className="action-btn cancel-btn"
                  onClick={handleCancelOrder}
                >
                  Hủy đơn hàng
                </button>
              ) : null}
              {order.status === "delivered" ? (
                <>
                  <button
                    className="action-btn return-btn"
                    onClick={handleReturnOrder}
                  >
                    Yêu cầu hoàn trả
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => {
                      alert("Tính năng viết đánh giá sẽ được tích hợp");
                    }}
                  >
                    Viết đánh giá
                  </button>
                </>
              ) : null}
            </div>

            {/* Thông tin đơn hàng */}
            <div className="detail-box">
              <h3>ℹ️ Thông tin</h3>
              <div className="info-item">
                <span className="label">Ngày đặt:</span>
                <span className="value">
                  {new Date(order.created_at).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Trạng thái:</span>
                <span
                  className="status-badge"
                  style={{ backgroundColor: statusColors[order.status] }}
                >
                  {order.status === "pending"
                    ? "Chờ xác nhận"
                    : order.status === "confirmed"
                    ? "Đã xác nhận"
                    : order.status === "in_progress"
                    ? "Đang xử lý"
                    : order.status === "shipped"
                    ? "Đã gửi hàng"
                    : order.status === "delivered"
                    ? "Đã giao"
                    : "Đã hủy"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
