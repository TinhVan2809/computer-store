import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../context/UserContext';
import '../../styles/Products.css'

function ProductList({ products }) {

    const API_URL = 'http://localhost/computer-store/backend/carts/cart_api_endpoint.php';
    const navigate = useNavigate();
    const { currentUser, refreshCartCount } = useContext(UserContext);

    const [toastSuccessAddToCart, setToastSuccessAddToCart] = useState(false);

    const HandleToggleCart = async (e, product_id) => {
        e.stopPropagation();

        if (!currentUser) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_URL}?action=add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    product_id: product_id,
                }),
            });

            const result = await response.json();
            setToastSuccessAddToCart(true);
            setTimeout(() => {
              setToastSuccessAddToCart(false);
            }, 2000);
            if (result.success) {
                refreshCartCount(); // Cập nhật số lượng trên Navbar
            }
        } catch (error) {
            console.error('Failed to add product to cart:', error);
            alert('Đã có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.');
        }
    };

    return (
      <>
        <div id="product_list" className="product-container w-full p-5">
          <div className="products w-full flex flex-wrap justify-start items-centers gap-10">
            {products.map((p) => {
              const price = Number(p.product_price) || 0;
              const sale = Number(p.product_sale) || 0;
              const saleClamped = Math.max(0, Math.min(100, sale));
              const discounted = Math.max(0, price * (1 - saleClamped / 100));
              const formatter = new Intl.NumberFormat("en-EN", {
                style: "currency",
                currency: "USD",
              });

              return (
                <div
                  className="card relative w-[200px] h-[310px] border-gray-100 border flex flex-col justify-between items-center text-center cursor-pointer transition duration-300 ease-in-out hover:-translate-y-1"
                  key={p.product_id}
                  onClick={() => navigate(`/detail/${p.product_id}`)}
                >
                  <img
                    className="w-full h-[200px] min-h-[200px] max-h-[200px] object-contain"
                    src={`http://localhost/computer-store/backend/uploads/products_img/${p.image_main}`}
                    alt={p.product_name}
                    title={p.product_name}
                  />
                  <div className="flex flex-col w-full justify-center items-center text-center mt-2">
                    <div className={`${saleClamped <= 0 ? 'sale-none' : 'absolute top-0 right-0 bg-red-600 px-2 rounded-bl-md'}`}>
                      <span className="text-[12px] text-white">
                        {saleClamped} <sup>%</sup>
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate w-[150px]">{p.product_name}</p>
                    </div>
                    <div className="product_price w-full flex items-end justify-between mt-[5px] px-2">
                        <div className="product_manufacturer_name flex w-full justify-start items-center gap-1">
                            <img className='w-[15px] h-[15px] object-cover rounded-[50%]' src={`http://localhost/computer-store/backend/uploads/manufacturers_img/${p.manufacturer_logo_image}`} alt={p.manufacturer_name} />
                            <span className='text-[10px] text-gray-500 bg-[#e7f3ff] rounded-[3px] px-1'>{p.manufacturer_name}</span>
                        </div>
                      {saleClamped > 0 ? (
                        <>
                          <div className="flex justify-center items-end gap-1">
                            <span className="line-through text-gray-400 text-[12px]">
                                {formatter.format(price)}
                            </span>
                            <span className='text-[15px] font-bold'>{formatter.format(discounted)}</span>
                          </div>
                        </>
                      ) : (
                        <span>{formatter.format(price)}</span>
                      )}
                    
                    </div>
                    
                    <div className="flex w-full h-[30px] mt-3 justify-center items-center">
                        <button onClick={(e) => HandleToggleCart(e, p.product_id)} className='bg-gray-200 w-full h-full flex justify-center items-center text-center cursor-pointer transition duration-500 hover:bg-black hover:text-white' href="#"><i className="fa-solid fa-cart-plus"></i></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TOAST THÔNG BÁO ĐÃ THÊM SẢN PHẨM VÀO GIỎ HÀNG */}
        {toastSuccessAddToCart && (
          <div className="add_to_cart fixed z-100 flex justify-center items-center w-65 h-30 rounded-xl top-[40%] right-[43%]">
            <div className="">
              <i className="ri-check-line text-white text-[60px] p-3 rounded-[50%] bg-stone-700"></i>
            </div>
          </div>
        )}
      </>
    );
}

export default ProductList;