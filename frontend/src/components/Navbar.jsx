import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import UserContext from "../context/UserContext";

function Navbar() {
  const BASE_CART =
    "http://localhost/computer-store/backend/carts/cart_api_endpoint.php";
  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);
  const location = useLocation();

  const [cart, setCart] = useState({ total_items: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCartUserData = async () => {
    // Nếu không có người dùng, không làm gì cả
    if (!currentUser) {
      setCart({ total_items: 0 }); // Reset giỏ hàng khi không có user
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_CART}?action=get&user_id=${currentUser.id}`
      );

      if (!response.ok) {
        throw new Error("Error HTTP: ", response.status);
      }

      const data = await response.json();

      if (data.success) {
        setCart(data);
      } else {
        throw new Error(data.message || "Can't get count products in cart");
      }
    } catch (error) {
      setError(error.message);
      console.error("Error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Chỉ fetch dữ liệu giỏ hàng khi có thông tin người dùng
    fetchCartUserData();
    // Dependency array đã có currentUser, nên hook sẽ chạy lại khi currentUser thay đổi (login/logout)
  }, [currentUser]);

  if (location && location.pathname && location.pathname.startsWith("/cart")) {
    return;
  }

  const li =
    "text-stone-900 text-sm md:text-base cursor-pointer flex justify-center items-center rounded-[20px] px-2 py-1 transition duration-400 ease-in-out hover:bg-gray-800 hover:text-white";

  return (
    <>
      <header className="navbar-container w-full md:w-[80%] lg:w-[60%] m-auto sticky z-100 top-3 mt-10 transition bg-white shadow-2xl rounded-[40px] px-4 md:px-10">
        <div id="nav-content" className="flex justify-between md:justify-center items-center w-full py-4 md:py-5 gap-4 md:gap-10">
          {/* Logo */}
          <div className="shrink-0">
            <img
              className="w-8 h-8 md:w-10 md:h-10 object-cover rounded-[50%]"
              src="/images/logo.png"
              alt="logo"
            />
          </div>

          {/* Menu */}
          <div id="navbar_menu" className="hidden md:flex justify-start items-center">
            <ul className="flex justify-center items-center gap-4 md:gap-10">
              <li className={li} onClick={() => navigate("/")}>
                Home
              </li>
              <li className={li}>
                Product <i className="ri-arrow-drop-down-line"></i>
              </li>
              <li className={li}>
                Resources <i className="ri-arrow-drop-down-line"></i>
              </li>
              <li className={li}>Contact</li>
              <li className={li}>
                Blog <i className="ri-arrow-drop-down-line"></i>
              </li>
            </ul>
          </div>

          {/* User Info */}
          {currentUser ? (
            <>
              <div className="flex justify-between items-center gap-6 cursor-pointe p-1.5 px-2.5 bg-gray-100 rounded-3xl transition duration-500 shrink-0">
                {/*Profile*/}
                <i
                  className="ri-user-line text-[24px] cursor-pointer transition duration-200 bg-white px-1.5 rounded-[50%]"
                  onClick={() => navigate("/profile")}
                ></i>

                {/*Notification*/}
                <i onClick={() => navigate(`/notifications/${currentUser.id}`)} className="fa-regular fa-bell text-[24px] cursor-pointer transition duration-200"></i>

              {/*Shopping carts*/}
                <div className="relative">
                  <i
                    className="ri-shopping-cart-2-line text-[24px] cursor-pointer transition duration-200 "
                    onClick={() => navigate(`/cart/${currentUser.id}`)}
                  ></i>
                  {loading && (<p className="bg-red-600 text-[10px] text-white px-1 rounded-2xl absolute top-0 left-3">...</p>)}
                  {error == true ? (
                    <p className="bg-red-600 text-[12px] text-white px-1.5 rounded-2xl absolute top-0 left-3">?</p>
                  ) : (
                    <p className="bg-red-600 text-[12px] text-white px-1.5 rounded-2xl absolute top-0 left-3">
                      {cart.total_items > 0 ? cart.total_items : ""}
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <NavLink
              to="/login"
              className="bg-black text-white p-1 px-2 rounded-2xl hover:opacity-70"
            >
              Đăng nhập
            </NavLink>
          )}
        </div>
      </header>
    </>
  );
}

export default Navbar;
