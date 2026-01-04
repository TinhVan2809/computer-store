import { useContext, useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserContext from "../../context/UserContext";
import API from "../../api/api";
import "../../styles/payment.css";

const API_VOUCHERS = "http://localhost/computer-store/backend/vouchers/voucher_api_endpoint.php";
const LIMIT = 10;

function Payments() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);
  const userId = currentUser?.id;

  // State quản lý địa chỉ
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showFormAddress, setShowFormAddress] = useState(false);
  const [addressList, setAddressList] = useState(false);
  const [addressCurrentPage, setAddressCurrentPage] = useState(0);

  // State quản lý form địa chỉ mới
  const [newAddress, setNewAddress] = useState({
    recipient_name: "",
    phone: "",
    province_id: "",
    province_name: "",
    district_id: "",
    district_name: "",
    ward_id: "",
    ward_name: "",
    specific_address: "",
    label: "Nhà riêng",
    is_default: 0,
  });

  // State quản lý địa điểm (tỉnh, huyện, phường)
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  // State quản lý voucher
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherCurrentPage, setVoucherCurrentPage] = useState(1);

  // State quản lý shipping voucher
  const [shippingVouchers, setShippingVouchers] = useState([]);
  const [selectedShippingVoucher, setSelectedShippingVoucher] = useState(null);

  // State quản lý thanh toán
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isProcessing, setIsProcessing] = useState(false);

  // Lấy dữ liệu từ trang giỏ hàng
  const { items, totalPrice } = location.state || {};

  // Format tiền tệ
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  // ============ QUẢN LÝ ĐỊA CHỈ ============

  const fetchAddressesData = useCallback(
    async (page = 0) => {
      if (!userId) return;
      try {
        const response = await API.get("/addresses", {
          params: {
            page: page + 1,
            limit: LIMIT,
          },
        });
        const addressList = response.data.data || [];
        setAddresses(addressList);
        // Tự động chọn địa chỉ mặc định hoặc đầu tiên
        const defaultAddr = addressList.find((addr) => addr.is_default === 1);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
        } else if (addressList.length > 0) {
          setSelectedAddress(addressList[0]);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    },
    [userId]
  );

  useEffect(() => {
    if (userId) {
      fetchAddressesData(addressCurrentPage);
      fetchVouchersData(voucherCurrentPage);
      fetchProvinces();
    }
  }, [userId, fetchAddressesData, addressCurrentPage, voucherCurrentPage]);

  // Kiểm tra nếu không có sản phẩm
  if (!items || items.length === 0) {
    return (
      <div className="payment-empty">
        <h2>Giỏ hàng trống</h2>
        <button onClick={() => navigate("/products")}>Quay lại mua sắm</button>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress({
      ...newAddress,
      [name]: value,
    });
  };

  const fetchProvinces = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/provinces");
      const data = await response.json();
      setProvinces(data.results || data);
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const handleProvinceChange = async (e) => {
    const provinceCode = e.target.value;
    const province = provinces.find((p) => p.code === Number(provinceCode));

    setSelectedProvince(province);
    setNewAddress({
      ...newAddress,
      province_id: provinceCode,
      province_name: province?.name || "",
      district_id: "",
      district_name: "",
      ward_id: "",
      ward_name: "",
    });
    setDistricts([]);
    setWards([]);

    if (province) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/districts/${province.code}`
        );
        const data = await response.json();
        setDistricts(data || []);
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    }
  };

  const handleDistrictChange = async (e) => {
    const districtCode = e.target.value;
    const district = districts.find((d) => d.code === Number(districtCode));

    setSelectedDistrict(district);
    setNewAddress({
      ...newAddress,
      district_id: districtCode,
      district_name: district?.name || "",
      ward_id: "",
      ward_name: "",
    });
    setWards([]);

    if (district) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/wards/${district.code}`
        );
        const data = await response.json();
        setWards(data || []);
      } catch (error) {
        console.error("Error fetching wards:", error);
      }
    }
  };

  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    const ward = wards.find((w) => w.code === Number(wardCode));

    setNewAddress({
      ...newAddress,
      ward_id: wardCode,
      ward_name: ward?.name || "",
    });
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();

    if (
      !newAddress.recipient_name ||
      !newAddress.phone ||
      !newAddress.province_id ||
      !newAddress.district_id ||
      !newAddress.ward_id ||
      !newAddress.specific_address
    ) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const addressPayload = {
        recipient_name: newAddress.recipient_name,
        phone: newAddress.phone,
        province_id: Number(newAddress.province_id),
        province_name: newAddress.province_name,
        district_id: Number(newAddress.district_id),
        district_name: newAddress.district_name,
        ward_id: newAddress.ward_id,
        ward_name: newAddress.ward_name,
        specific_address: newAddress.specific_address,
        label: newAddress.label,
        is_default: Number(newAddress.is_default) || 0,
      };
      
      const response = await API.post("/addresses", addressPayload);

      const data = response.data;
      if (data.success) {
        alert("Thêm địa chỉ thành công");
        setShowFormAddress(false);
        setNewAddress({
          recipient_name: "",
          phone: "",
          province_id: "",
          province_name: "",
          district_id: "",
          district_name: "",
          ward_id: "",
          ward_name: "",
          specific_address: "",
          label: "Nhà riêng",
          is_default: 0,
        });
        fetchAddressesData(0);
      } else {
        alert(data.message || "Lỗi khi thêm địa chỉ");
      }
    } catch (error) {
      console.error("Error adding address:", error);
      alert("Lỗi khi thêm địa chỉ: " + (error.response?.data?.message || error.message));
    }
  };

  // ============ QUẢN LÝ VOUCHER ============

  const fetchVouchersData = async (page = 1) => {
    try {
      const response = await fetch(
        `${API_VOUCHERS}?action=get&page=${page}&limit=10`
      );
      const data = await response.json();
      const productVouchers = (data.vouchers || data.data || []).filter(
        (v) => !v.shipping_name
      );
      setVouchers(productVouchers);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
    }
  };

  // ============ XỬ LÝ THANH TOÁN ============

  const calculateTotal = () => {
   
    // Tổng giá đã giảm giá sản phẩm (giá sau product_sale * quantity đã chọn)
    const subtotal = items.reduce(
      (sum, item) => {
        const price = Number(item.product_price) || 0;
        const sale = Number(item.product_sale) || 0;
        const quantity = Number(item.quantity) || 0;
        const saleClamped = Math.max(0, Math.min(100, sale));
        return sum + (price * (1 - saleClamped / 100) * quantity);
      },
      0
    );
    let shippingFee = 5; // Phí vận chuyển cố định
    let discount = 0; // Chỉ tính giảm thêm từ voucher
    let shippingDiscount = 0;

    // Áp dụng discount từ voucher sản phẩm (trên giá đã giảm)
    if (selectedVoucher) {
      const sale = Number(selectedVoucher.sale ?? 0);
      if (!isNaN(sale) && sale > 0) {
        discount = (subtotal * sale) / 100;
      }
    }

    // Áp dụng discount từ shipping voucher
    if (selectedShippingVoucher) {
      shippingDiscount = (shippingFee * selectedShippingVoucher.sale) / 100;
      shippingFee = shippingFee - shippingDiscount;
    }

    return {
      subtotal: Number(subtotal).toFixed(2),
      shippingFee: Number(shippingFee).toFixed(2),
      discount: Number(discount).toFixed(2),
      shippingDiscount: Number(shippingDiscount).toFixed(2),
      total: (Number(subtotal) + Number(shippingFee) - Number(discount)).toFixed(2),
    };
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    setIsProcessing(true);

    try {
      const { total, shippingFee } = calculateTotal();

      // Chuẩn bị dữ liệu đơn hàng
      const orderData = {
        items: items.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          product_price: item.product_price,
          // product_quantity: item.product_quantity,
          product_sale: item.product_sale,
          image_main: item.image_main,
          category_id: item.category_id,
          manufacturer_id: item.manufacturer_id,
          quantity: item.quantity, // Số lượng đã chọn trong Cart.jsx
          price: Number(item.product_price) * (1 - Number(item.product_sale || 0) / 100), // giá đã giảm
        })),
        totalAmount: total,
        shippingFee: shippingFee,
        voucherId: selectedVoucher?.voucher_id || null,
        recipientName: selectedAddress.recipient_name,
        recipientPhone: selectedAddress.phone,
        provinceName: selectedAddress.province_name,
        districtName: selectedAddress.district_name,
        wardName: selectedAddress.ward_name,
        specificAddress: selectedAddress.specific_address,
        userAddressId: selectedAddress.address_id,
      };

      // Tạo đơn hàng
      const orderResponse = await API.post("/orders", orderData);
      const orderId = orderResponse.data.order_id;

      // Xử lý thanh toán
      if (paymentMethod === "cod") {
        // Thanh toán khi nhận hàng
        await API.post("/payments", {
          order_id: orderId,
          amount: total,
          provider: "cod",
          transaction_code: "COD_" + orderId,
          status: "pending",
        });

        alert("Đặt hàng thành công! Vui lòng chờ xác nhận từ cửa hàng.");
        navigate(`/orders/${orderId}`);
      } else if (paymentMethod === "momo") {
        handleMomoPayment(orderId, total);
      } else if (paymentMethod === "vnpay") {
        handleVNPayPayment(orderId, total);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert(
        "Lỗi khi đặt hàng: " + (error.response?.data?.error || error.message)
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMomoPayment = (orderId, amount) => {
    alert("Thanh toán Momo sẽ được tích hợp trong phiên bản tiếp theo");
  };

  const handleVNPayPayment = (orderId, amount) => {
    alert("Thanh toán VNPay sẽ được tích hợp trong phiên bản tiếp theo");
  };

  const { subtotal, shippingFee, discount, total } = calculateTotal();

  return (
    <div className="payment-page">
      <div className="payment-container">
        {/* ========== PHẦN TRÁI: THÔNG TIN GIAO HÀNG ========== */}
        <div className="payment-left">
          <div className="section-box">
            <h3 className="section-title">📍 Địa chỉ giao hàng</h3>

            {selectedAddress && (
              <div className="selected-address-box">
                <p>
                  <strong>{selectedAddress.recipient_name}</strong> |{" "}
                  {selectedAddress.phone}
                </p>
                <p>
                  {selectedAddress.specific_address},{" "}
                  {selectedAddress.ward_name}, {selectedAddress.district_name},{" "}
                  {selectedAddress.province_name}
                </p>
                <button
                  className="change-btn"
                  onClick={() => setAddressList(!addressList)}
                >
                  {addressList ? "Ẩn danh sách" : "Thay đổi"}
                </button>
              </div>
            )}

            {addressList && (
              <div className="address-list">
                {addresses.length > 0 ? (
                  addresses.map((addr) => (
                    <div
                      key={addr.address_id}
                      className={`address-item ${
                        selectedAddress?.address_id === addr.address_id
                          ? "active"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedAddress(addr);
                        setAddressList(false);
                      }}
                    >
                      <p>
                        <strong>{addr.recipient_name}</strong> | {addr.phone}
                      </p>
                      <p>
                        {addr.specific_address}, {addr.ward_name},{" "}
                        {addr.district_name}, {addr.province_name}
                      </p>
                      <span className="label">{addr.label}</span>
                    </div>
                  ))
                ) : (
                  <p className="empty-text">Chưa có địa chỉ</p>
                )}
              </div>
            )}

            <button
              className="add-address-btn"
              onClick={() => setShowFormAddress(!showFormAddress)}
            >
              {showFormAddress ? "Ẩn form" : "+ Thêm địa chỉ mới"}
            </button>

            {showFormAddress && (
              <form className="address-form" onSubmit={handleAddAddress}>
                <div className="form-group">
                  <label>Tên người nhận</label>
                  <input
                    type="text"
                    name="recipient_name"
                    value={newAddress.recipient_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={newAddress.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tỉnh/Thành phố</label>
                  <select
                    value={selectedProvince?.code || ""}
                    onChange={handleProvinceChange}
                    required
                  >
                    <option value="">Chọn tỉnh/thành phố</option>
                    {provinces.map((prov) => (
                      <option key={prov.code} value={prov.code}>
                        {prov.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Quận/Huyện</label>
                  <select
                    value={selectedDistrict?.code || ""}
                    onChange={handleDistrictChange}
                    required
                  >
                    <option value="">Chọn quận/huyện</option>
                    {districts.map((dist) => (
                      <option key={dist.code} value={dist.code}>
                        {dist.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Phường/Xã</label>
                  <select
                    value={newAddress.ward_id}
                    onChange={handleWardChange}
                    required
                  >
                    <option value="">Chọn phường/xã</option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Địa chỉ cụ thể</label>
                  <textarea
                    name="specific_address"
                    value={newAddress.specific_address}
                    onChange={handleInputChange}
                    placeholder="Số nhà, tên đường..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Loại địa chỉ</label>
                  <select
                    name="label"
                    value={newAddress.label}
                    onChange={handleInputChange}
                  >
                    <option value="Nhà riêng">Nhà riêng</option>
                    <option value="Văn phòng">Văn phòng</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <button type="submit" className="submit-btn">
                  Thêm địa chỉ
                </button>
              </form>
            )}
          </div>

          {/* ========== PHƯƠNG THỨC THANH TOÁN ========== */}
          <div className="section-box">
            <h3 className="section-title">💳 Phương thức thanh toán</h3>
            <div className="payment-methods">
              <label>
                <input
                  type="radio"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>💵 Thanh toán khi nhận hàng (COD)</span>
              </label>
              <label>
                <input
                  type="radio"
                  value="momo"
                  checked={paymentMethod === "momo"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>📱 Momo</span>
              </label>
              <label>
                <input
                  type="radio"
                  value="vnpay"
                  checked={paymentMethod === "vnpay"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>🏦 VNPay</span>
              </label>
            </div>
          </div>
        </div>

        {/* ========== PHẦN PHẢI: ĐƠN HÀNG & TỔNG TIỀN ========== */}
        <div className="payment-right">
          {/* SẢN PHẨM */}
          <div className="section-box">
            <h3 className="section-title">📦 Sản phẩm</h3>
            <div className="order-items">
              {items.map((item) => {
                const price = Number(item.product_price) || 0;
                const sale = Number(item.product_sale) || 0;
                const quantity = Number(item.quantity) || 0;
                const saleClamped = Math.max(0, Math.min(100, sale));
                const discounted = (price * quantity) * (1 - saleClamped / 100);
                const formatter = new Intl.NumberFormat("en-EN", {
                  style: "currency",
                  currency: "USD",
                });
                return (
                  <div key={item.product_id} className="order-item">
                    <div className="item-info">
                      <p className="product-name">{item.product_name}</p>
                      <p className="quantity">x{item.quantity}</p>
                    </div>
                    <p className="item-price">{formatter.format(discounted)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* VOUCHER */}
          <div className="section-box">
            <h3 className="section-title">🎁 Voucher</h3>
            {selectedVoucher ? (
              <div className="selected-voucher">
                <p>
                  <strong>{selectedVoucher.voucher_name}</strong> - {" "}
                  {selectedVoucher.sale}%
                </p>
                <button
                  className="remove-voucher-btn"
                  onClick={() => setSelectedVoucher(null)}
                >
                  Xóa
                </button>
              </div>
            ) : (
              <div className="voucher-list">
                {vouchers.map((voucher) => (
                  <div
                    key={voucher.voucher_id}
                    className="voucher-item"
                    onClick={e => {
                      e.preventDefault();
                      setSelectedVoucher(voucher);
                    }}
                  >
                    <p className="voucher-code">{voucher.voucher_name}</p>
                    <p className="voucher-discount">
                      -{voucher.sale} %
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TỔNG TIỀN */}
          <div className="section-box summary-box">
            <h3 className="section-title">💰 Tóm tắt</h3>
            <div className="summary-item">
              <span>Tạm tính:</span>
              <span>{formatter.format(subtotal)}</span>
            </div>
            <div className="summary-item">
              <span>Phí vận chuyển:</span>
              <span>+{formatter.format(shippingFee)}</span>
            </div>
            {selectedVoucher && (
              <>
                <div className="summary-item discount">
                <span>Voucher:</span>
                <span>-{formatter.format(discount)}</span>
              </div>
              <div className="summary-item">
                <span>Tạm tính sau giảm giá:</span>
                <span>{formatter.format(subtotal - discount)}</span>
              </div>
              </>
            )}
            <div className="summary-item total">
              <span>Tổng cộng:</span>
              <span>{formatter.format(total)}</span>
            </div>

            <button
              className="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={!selectedAddress || isProcessing}
            >
              {isProcessing ? "Đang xử lý..." : "Đặt hàng"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payments;
