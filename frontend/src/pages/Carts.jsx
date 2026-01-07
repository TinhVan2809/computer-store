
import { useContext, useEffect, useState, useCallback, useMemo, } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from '../context/UserContext';
import '../styles/carts.css';
import NavbarCart from "../components/carts/Navbar_cart";
import SumController from "../components/carts/SumController";


function Carts() {
    const API_CART = "http://localhost/computer-store/backend/carts/cart_api_endpoint.php";
    const { currentUser, refreshCartCount } = useContext(UserContext);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [selectedItems, setSelectedItems] = useState([]);
    const [showNoItemsToast, setShowNoItemsToast] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [confirmDeleteItem, setConfirmDeleteitem] = useState(false);
    const [pagination, setPagination] = useState({
        total_items: 0,
        total_pages: 1,
        current_page: 1,
        limit: 10
    });

     const userId = currentUser?.id;

    const fetchCartData = useCallback(async (page = 1) => {
        if (!userId) {
            setError("Bạn cần đăng nhập để xem giỏ hàng.");
            setCart([]);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await fetch(
                `${API_CART}?action=get&user_id=${userId}&page=${page}&limit=${pagination.limit}`
            );
            const data = await response.json();

            if (data.success) {
                setCart(data.data);
                setPagination({
                    total_items: data.total_items,
                    total_pages: data.total_pages,
                    current_page: data.current_page,
                    limit: data.limit
                });
            } else {
                setError(data.message || 'Không thể tải dữ liệu giỏ hàng');
            }
        } catch (err) {
            setError('Lỗi kết nối đến máy chủ: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [userId, pagination.limit]);

    useEffect(() => {
        fetchCartData(pagination.current_page);
     }, [fetchCartData, pagination.current_page]);

    const handleQuantityChange = async (cart_id, newQuantity) => {
        // Cập nhật giao diện ngay lập tức để tạo cảm giác mượt mà
        const updatedCart = cart.map(item =>
            item.cart_id === cart_id ? { ...item, quantity: newQuantity } : item
        ).filter(item => item.quantity > 0); // Lọc bỏ sản phẩm nếu số lượng <= 0

        setCart(updatedCart);

        try {
            const response = await fetch(`${API_CART}?action=update_quantity`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart_id, quantity: newQuantity })
            });
            const result = await response.json();

            if (!result.success) {
                // Nếu API thất bại, khôi phục lại trạng thái cũ
                alert('Cập nhật thất bại, vui lòng thử lại.');
                fetchCartData(pagination.current_page);
            } else {
                // Cập nhật lại tổng số lượng trên Navbar
                refreshCartCount();
            }
        } catch (err) {
            setError(err.message)
            alert('Lỗi kết nối, không thể cập nhật giỏ hàng.', error);
            fetchCartData(pagination.current_page);
        }
    };

    const onDeleteItem = (cart_id, product_name) => {
        setItemToDelete({ id: cart_id, name: product_name });
        setConfirmDeleteitem(true);
    }
    const cancelDeleteItem = () => {
        setItemToDelete(null);
        setConfirmDeleteitem(false);
    }

    const handleDeleteItem = async () => {
        // Cập nhật giao diện trước (Optimistic Update)
        if (!itemToDelete) return;
        const cart_id = itemToDelete.id;
        const originalCart = [...cart];
        const newCart = cart.filter(item => item.cart_id !== cart_id);
        setCart(newCart);

        try {
            const response = await fetch(`${API_CART}?action=delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart_id: cart_id })
            });

            const result = await response.json();

            if (!result.success) {
                alert('Lỗi: Không thể xóa sản phẩm. Vui lòng thử lại.');
                setCart(originalCart); // Hoàn tác lại nếu có lỗi
            } else {
                refreshCartCount(); // Cập nhật lại tổng số lượng
                // Đóng modal sau khi xóa thành công
                cancelDeleteItem();
            }
        } catch (err) {
            setError(err.message)
            alert('Lỗi kết nối. Không thể xóa sản phẩm.', err);
            setCart(originalCart); // Hoàn tác lại nếu có lỗi
        }
    };

    const handleSelectItem = (cartId) => {
        setSelectedItems(prevSelected => {
            if (prevSelected.includes(cartId)) {
                // Nếu đã chọn, bỏ chọn
                return prevSelected.filter(id => id !== cartId);
            } else {
                // Nếu chưa chọn, thêm vào danh sách
                return [...prevSelected, cartId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedItems.length === cart.length) {
            // Nếu tất cả đã được chọn, hãy bỏ chọn tất cả
            setSelectedItems([]);
        } else {
            // Ngược lại, chọn tất cả
            const allItemIds = cart.map(item => item.cart_id);
            setSelectedItems(allItemIds);
        }
    };

    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            setShowNoItemsToast(true);
            // Tự động ẩn thông báo sau 3 giây
            setTimeout(() => {
                setShowNoItemsToast(false);
            }, 3000);
            return;
        }

        // Lọc ra thông tin chi tiết của các sản phẩm đã chọn
        const itemsToCheckout = cart.filter(item => selectedItems.includes(item.cart_id));

        // Điều hướng đến trang thanh toán và truyền dữ liệu qua state
        navigate('/payments', { state: { items: itemsToCheckout, totalPrice: totalSelectedPrice } });
    };


    const totalSelectedPrice = useMemo(() => {
        return cart
            .filter(item => selectedItems.includes(item.cart_id))
            .reduce((total, item) => {
                const price = parseFloat(item.product_price);
                const sale = parseFloat(item.product_sale);
                const quantity = parseInt(item.quantity, 10);

                const discountedPrice = price * (1 - sale / 100);
                return total + (discountedPrice * quantity);
            }, 0);
    }, [cart, selectedItems]);

    const allItemsSelected = cart.length > 0 && selectedItems.length === cart.length;

    if(loading) {
        return (
            <>
                {/* HTML/CSS loading UI here */}
            </>
        )
    }

    if(error) {
        return (
            <>
                {/* HTML/CSS error UI here */}
            </>
        )
    }

    
    return (
      <>
        <NavbarCart />
      <div className="flex mb-15">
        
        {cart.length > 0 ? <div className="cart-items flex flex-col w-full py-10 px-30 gap-10">
          {cart.map((item) => {
            const price = Number(item.product_price) || 0;
            const sale = Number(item.product_sale) || 0;
            const saleClamped = Math.max(0, Math.min(100, sale));
            const discounted = price * (1 - saleClamped / 100);
            const formatter = new Intl.NumberFormat("en-EN", {
                  style: "currency",
                  currency: "USD",
            });
            
           return (
             <div
              key={item.cart_id}
              className={`cart-item ${
                selectedItems.includes(item.cart_id) ? "selected" : ""
              }`}
            >
              <div className="flex justify-start items-center gap-5">
                <input
                type="checkbox"
                className="item-checkbox"
                checked={selectedItems.includes(item.cart_id)}
                onChange={() => handleSelectItem(item.cart_id)}
              />
              <img
                src={`http://localhost/computer-store/backend/uploads/products_img/${item.image_main}`}
                alt={item.product_name}
                className="item-image w-20 object-contain"
              />
              <div className="item-details">
                <p className="cursor-pointer" onClick={() => navigate(`/detail/${item.product_id}`)}>{item.product_name}</p>
                <p className="text-red-500">{formatter.format(discounted)}</p>
              </div>
              </div>

              <div className="flex gap-9">
                <div className="quantity-control flex gap-3 justify-center items-center">
                <button
                  onClick={() =>
                    handleQuantityChange(
                      item.cart_id,
                      parseInt(item.quantity) - 1
                    )
                  }
                  className="bg-stone-800 w-7 text-white cursor-pointer hover:opacity-80"
                >
                  -
                </button>
                <input
                  type="text"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(
                      item.cart_id,
                      parseInt(e.target.value) || 1
                    )
                  }
                  min="1"
                  className="w-10 text-[17px] text-center"
                />
                <button
                  onClick={() =>
                    handleQuantityChange(
                      item.cart_id,
                      parseInt(item.quantity) + 1
                    )
                  }
                  className="bg-stone-800 w-7 text-white cursor-pointer hover:opacity-80"
                >
                  +
                </button>
              </div>
              <div className="item-actions">
                <button
                  className="delete-btn text-red-800 cursor-pointer hover:underline"
                  onClick={() => onDeleteItem(item.cart_id, item.product_name)}
                >
                  Remove
                </button>
              </div>
              </div>
              
            </div>
           );
          })}
        </div> : (
            <div className="">Ở đây trống trãi quá.</div>
           )
        }
      </div>

        <SumController
          totalPrice={totalSelectedPrice}
          selectedCount={selectedItems.length}
          onSelectAll={handleSelectAll}
          allItemsSelected={allItemsSelected}
          onCheckout={handleCheckout}
        />

        {/* Toast Notification */}
        {showNoItemsToast && (
          <div className="fixed top-20 right-5 bg-yellow-500 text-white py-2 px-4 rounded-lg shadow-lg animate-bounce">
            <div className="flex items-center gap-2">
              <i className="ri-error-warning-line"></i>
              <span>Vui lòng chọn sản phẩm!</span>
            </div>
          </div>
        )}

        {/* Popup show modal comfim delete item */}
        {confirmDeleteItem && (
          <>
            <div id="modal_comfirm_delete" className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
              <div className="flex flex-col justify-between p-5 w-96 bg-white shadow-2xl rounded-2xl border border-stone-200 gap-4">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold">Xác nhận xóa</h2>
                  <p className="text-gray-700">Bạn có chắc chắn muốn xóa sản phẩm <strong className="text-black">{itemToDelete?.name}</strong> khỏi giỏ hàng?</p>
                </div>
                <div className="w-full flex justify-end items-center gap-3">
                  <button onClick={cancelDeleteItem} className="px-4 py-2 rounded-2xl border border-gray-300 cursor-pointer hover:bg-gray-100">Hủy</button>
                  <button
                    onClick={handleDeleteItem}
                    className="bg-[#e02e2a] text-white px-4 py-2 rounded-2xl cursor-pointer hover:opacity-80"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </>
    );
}


export default Carts;