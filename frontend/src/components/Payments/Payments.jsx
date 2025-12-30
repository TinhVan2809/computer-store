import { useContext, useEffect, useState, useCallback } from "react";
import { data, useLocation, useNavigate } from "react-router-dom";
import UserContext from "../../context/UserContext";

import "../../styles/payment.css";

const API_ADDRESSES =
  "http://localhost/computer-store/backend/addresses/address_api_endpoint.php";
const LIMIT = 5;
const API = "http://localhost:3000";

function Payments() {
  const location = useLocation();
  const navigate = useNavigate();

  const { currentUser } = useContext(UserContext);
  const userId = currentUser?.id;

  const [addresses, setAddresses] = useState([]);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Biến show form thêm địa chỉ
  const [showFormAddress, setShowAddressForm] = useState(false);
  // Biến show danh sách các địa chỉ có trong danh sách của người dùng
  const [addressList, setAddressList] = useState(false);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  

  // Hàm show danh sách địa chỉ
  const onAddressList = () => {
    setAddressList(true);
    setShowAddressForm(false);
  }
  // Hàm đóng danh sách địa chỉ
  const onCloseAddressList = () => {
    setAddressList(false);
  }


  // show form thêm địa chỉ mới
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

  // Nhận dữ liệu được truyền từ trang giỏ hàng
  const { items, totalPrice } = location.state || {};

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const fetchAddressesData = useCallback(
    async (page = 0) => {
      try {
        if (!userId) {
          return;
        }

        const response = await fetch(
          `${API_ADDRESSES}?action=get&page=${
            page + 1
          }&limit=${LIMIT}&user_id=${userId}`
        );
        const data = await response.json();
        if (data.success) {
          setAddresses(data.data);
          setTotalCount(data.total_items);
          setCurrentPage(page);
        }
      } catch (err) {
        console.error("error fetching Addresses", err);
      }
    },
    [userId]
  );

  useEffect(() => {
    fetchAddressesData();
  }, [fetchAddressesData]);

  // Nếu không có sản phẩm nào được truyền qua, điều hướng về trang chủ
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-xl">Không có sản phẩm nào để thanh toán.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Quay về trang chủ
        </button>
      </div>
    );
  }

  // Hàm đóng mở form thêm địa chỉ mới
  const onAddressForm = async () => {
    onCloseAddressList(false);
    setShowAddressForm(true);
    try {
      const response = await fetch(`${API}/api/provinces`);
      const data = await response.json();
      setProvinces(data);
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const onCancelAddressForm = async () => {
    setShowAddressForm(false);
  };
  //----------------------------------


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleProvinceChange = async (e) => {
    const provinceCode = e.target.value;
    const provinceName = e.target.options[e.target.selectedIndex].text;
    setSelectedProvince(provinceCode);
    setNewAddress((prev) => ({
      ...prev,
      province_id: provinceCode,
      province_name: provinceName,
      district_id: "",
      district_name: "",
      ward_id: "",
      ward_name: "",
    }));
    setDistricts([]);
    setWards([]);
    if (provinceCode) {
      try {
        const response = await fetch(
          `${API}/api/districts/${provinceCode}`
        );
        const data = await response.json();
        setDistricts(data);
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    }
  };

  const handleDistrictChange = async (e) => {
    const districtCode = e.target.value;
    const districtName = e.target.options[e.target.selectedIndex].text;
    setSelectedDistrict(districtCode);
    setNewAddress((prev) => ({
      ...prev,
      district_id: districtCode,
      district_name: districtName,
      ward_id: "",
      ward_name: "",
    }));
    setWards([]);
    if (districtCode) {
      try {
        const response = await fetch(
          `${API}/api/wards/${districtCode}`
        );
        const data = await response.json();
        setWards(data);
      } catch (error) {
        console.error("Error fetching wards:", error);
      }
    }
  };

  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    const wardName = e.target.options[e.target.selectedIndex].text;
    setNewAddress((prev) => ({
      ...prev,
      ward_id: wardCode,
      ward_name: wardName,
    }));
  };

  const handleLabelChange = (label) => {
    setNewAddress((prev) => ({ ...prev, label: label }));
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const url = `${API_ADDRESSES}?action=add&user_id=${userId}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAddress),
      });

      const data = await response.json();

      if (data.success) {
        alert("Thêm địa chỉ mới thành công!");
        setShowAddressForm(false);
        fetchAddressesData(currentPage); // Refresh the address list
        setNewAddress({ // Reset form
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
         onAddressList(true); // quay lại danh sách địa chỉ khi thêm thành công.
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (error) {
      console.error("Lỗi khi thêm địa chỉ mới. ", error);
      alert("Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  };
 
  return (
    <>
      <div className="container p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Phần thông tin sản phẩm */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Sản phẩm đã chọn</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.cart_id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center">
                    <img
                      src={`http://localhost/computer-store/backend/uploads/products_img/${item.image_main}`}
                      alt={item.product_name}
                      className="w-16 h-16 object-cover rounded mr-4"
                    />
                    <div>
                      <p className="font-semibold">{item.product_name}</p>
                      <p className="text-sm text-gray-600">
                        Số lượng: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">
                    {formatter.format(
                      item.product_price *
                        (1 - item.product_sale / 100) *
                        item.quantity
                    )}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 text-right">
              <p className="text-2xl font-bold">
                Tổng cộng: {formatter.format(totalPrice)}
              </p>
            </div>
          </div>

          {/* Phần thông tin thanh toán (Placeholder) */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              Thông tin giao hàng và thanh toán
            </h2>
            <div className="">
              {addresses.length > 0 ? (
                addresses.map((a) => (
                  <div key={a.user_address_id} className="w-full">
                    {a.is_default == 1 && (
                      <div className="w-full flex gap-5 border border-gray-300 p-2 flex-col">
                        <div className="flex gap-4 justify-start items-end">
                          <h2>Địa chỉ nhận hàng</h2>
                          <a
                            href="javaScript:void(0)"
                            className="text-sm underline "
                            onClick={onAddressList}
                          >
                            Chọn địa chỉ
                          </a>
                        </div>
                        <div className="flex w-full gap-5">
                          <p>{a.recipient_name}</p>
                          <p>{a.phone}</p>
                          <p>{a.province_name}</p>
                          <p>{a.district_name}</p>
                          <p>{a.ward_name}</p>
                          <p>{a.specific_address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <button
                  className="bg-black text-white p-2 text-sm rounded-sm cursor-pointer hover:opacity-80"
                  onClick={onAddressForm}
                >
                  <i className="ri-add-large-line"></i> Thêm địa chỉ
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form thêm địa chỉ mới */}
      {showFormAddress && (
        <div className="addressForm fixed z-200 w-full top-0 h-full flex justify-center items-center">
          <form
            onSubmit={handleAddAddress}
            className="flex flex-col bg-white p-4 gap-5"
          >
            <div className="flex gap-5">
              <input
                className="w-70 border border-gray-200 px-4 py-2"
                type="text"
                required
                name="recipient_name"
                placeholder="Tên người nhận"
                value={newAddress.recipient_name}
                onChange={handleInputChange}
              />

              <input
                className="w-70 border border-gray-200 px-4 py-2"
                type="text"
                required
                name="phone"
                placeholder="Số điện thoại"
                value={newAddress.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex gap-5">
              <select
                className="w-70 border border-gray-200 px-4 py-2"
                required
                onChange={handleProvinceChange}
                value={newAddress.province_id}
              >
                <option value="">Chọn Tỉnh/Thành phố</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>

              <select
                className="w-70 border border-gray-200 px-4 py-2"
                required
                onChange={handleDistrictChange}
                value={newAddress.district_id}
                disabled={!districts.length}
              >
                <option value="">Chọn Quận/Huyện</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-5">
              <select
                className="w-70 border border-gray-200 px-4 py-2"
                required
                onChange={handleWardChange}
                value={newAddress.ward_id}
                disabled={!wards.length}
              >
                <option value="">Chọn Phường/Xã</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name}
                  </option>
                ))}
              </select>

              <input
                className="w-full border border-gray-200 px-4 py-2"
                type="text"
                required
                name="specific_address"
                placeholder="Số đường, số nhà, kdc,..."
                value={newAddress.specific_address}
                onChange={handleInputChange}
              />
            </div>

            <div
              className="UIG4fr"
              role="radiogroup"
              aria-label="Loại địa chỉ:"
            >
              <div
                className={`uSUvOh ${
                  newAddress.label === "Nhà riêng" ? "PdLW1O" : ""
                }`}
                role="radio"
                aria-checked={newAddress.label === "Nhà riêng"}
                onClick={() => handleLabelChange("Nhà riêng")}
              >
                <span className="Xge0vM">Nhà Riêng</span>
              </div>
              <div
                className={`uSUvOh ${
                  newAddress.label === "Công ty" ? "PdLW1O" : ""
                }`}
                role="radio"
                aria-checked={newAddress.label === "Công ty"}
                onClick={() => handleLabelChange("Công ty")}
              >
                <span className="Xge0vM">Công ty</span>
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_default"
                name="is_default"
                checked={newAddress.is_default === 1}
                onChange={(e) =>
                  setNewAddress((prev) => ({
                    ...prev,
                    is_default: e.target.checked ? 1 : 0,
                  }))
                }
              />
              <label htmlFor="is_default" className="ml-2">
                Đặt làm địa chỉ mặc định
              </label>
            </div>

            <div className="flex justify-end items-center gap-5">
              <button
                type="button"
                className="px-3 py-1 border border-gray-200 cursor-pointer hover:opacity-70"
                onClick={onCancelAddressForm}
              >
                Hủy
              </button>
              <button className="px-3 py-1 border border-gray-200 cursor-pointer hover:opacity-70" onClick={onAddressList}>
                Đã có
              </button>
              <button
                type="submit"
                className="px-3 py-1 border border-gray-200 cursor-pointer hover:opacity-70 bg-stone-800 text-white"
              >
                Thêm
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách các địa chỉ hiện có */}
      {addressList && (
        <div className="addressForm fixed z-200 w-full top-0 h-full flex justify-center items-center">
          <div className="bg-white p-7 flex flex-col justify-center gap-5 relative w-fit h-fit overflow-auto">
            <button
              className="bg-black text-white p-2 text-sm right-5 bottom-5 cursor-pointer absolute hover:opacity-80"
              onClick={onAddressForm}
            >
              <i className="ri-add-large-line"></i> Thêm mới
            </button>
            {addresses.map((a) => (
              <>
                <div className="bg-gray-100 w-150 p-2 rounded-sm flex flex-col duration-200 cursor-pointer hover:bg-gray-300" key={a.user_address_id}>
                  <p>
                    <span className="text-gray-500">Tên người nhận: </span>
                    {a.recipient_name}
                  </p>
                  <p>
                    <span className="text-gray-500">Số điện thoại: </span>
                    {a.phone}
                  </p>
                  <p>
                    <span className="text-gray-500">Tỉnh/Thành phố: </span>
                    {a.province_name}
                  </p>
                  <p>
                    <span className="text-gray-500">Quận/Huyện: </span>
                    {a.district_name}
                  </p>
                  <p>
                    <span className="text-gray-500">Phường/Xã: </span>
                    {a.ward_name}
                  </p>
                  <p>
                    <span className="text-gray-500">
                      Số đường, kdc, số nhà:{" "}
                    </span>
                    {a.specific_address}
                  </p>
                </div>
              </>
            ))}
            <div
              className="absolute -top-2 right-1 text-4xl cursor-pointer hover:opacity-70"
              onClick={onCloseAddressList}
            >
              &times;
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Payments;
