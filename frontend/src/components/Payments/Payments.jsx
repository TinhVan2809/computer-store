import { useContext, useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import UserContext from '../../context/UserContext';

const API_ADDRESSES = "http://localhost/computer-store/backend/addresses/address_api_endpoint.php";
const LIMIT = 5;

function Payments() {
    const location = useLocation();
    const navigate = useNavigate();

    const {currentUser} = useContext(UserContext);
    const userId = currentUser?.id;

    const [addresses, setAddresses] = useState([]);
    
    const [currentPage, setCurrentPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

     // Nhận dữ liệu được truyền từ trang giỏ hàng
    const { items, totalPrice } = location.state || {};

    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    
    
    const fetchAddressesData = useCallback(async (page = 0) => {
       try{
        if (!userId) {
            return;
        }

        const response = await fetch(`${API_ADDRESSES}?action=get&page=${page + 1}&limit=${LIMIT}&user_id=${userId}`)
        const data = await response.json();
        if(data.success) {
            setAddresses(data.data);
            setTotalCount(data.total_items);
            setCurrentPage(page)
        }

       } catch(err) {
        console.error("error fetching Addresses", err);
       }
    }, [userId]);

    useEffect(() => {
        fetchAddressesData();
    }, [fetchAddressesData])
    
    

    // Nếu không có sản phẩm nào được truyền qua, điều hướng về trang chủ
    if (!items || items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-xl">Không có sản phẩm nào để thanh toán.</p>
                <button 
                    onClick={() => navigate('/')} 
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Quay về trang chủ
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Thanh toán</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Phần thông tin sản phẩm */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Sản phẩm đã chọn</h2>
                    <div className="space-y-4">
                        {items.map(item => (
                            <div key={item.cart_id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center">
                                    <img src={`http://localhost/computer-store/backend/uploads/products_img/${item.image_main}`} alt={item.product_name} className="w-16 h-16 object-cover rounded mr-4" />
                                    <div>
                                        <p className="font-semibold">{item.product_name}</p>
                                        <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="font-semibold">{formatter.format(item.product_price * (1 - item.product_sale / 100) * item.quantity)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 text-right">
                        <p className="text-2xl font-bold">Tổng cộng: {formatter.format(totalPrice)}</p>
                    </div>
                </div>

                {/* Phần thông tin thanh toán (Placeholder) */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Thông tin giao hàng và thanh toán</h2>
                    <p className="text-gray-500">Đây là nơi để form nhập địa chỉ, thông tin thẻ tín dụng, v.v.</p>
                </div>
            </div>
        </div>
    );
}

export default Payments;
