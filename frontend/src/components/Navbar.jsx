import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { useContext } from 'react';
import UserContext from '../context/UserContext';

function Navbar() {
    const navigate = useNavigate();
    const { currentUser } = useContext(UserContext);
    const location = useLocation();

    if (location && location.pathname && location.pathname.startsWith('/cart')) {
        return;
    }

    const li = "text-stone-900 text-sm md:text-base cursor-pointer flex justify-center items-center rounded-[20px] px-2 py-1 transition duration-400 ease-in-out hover:bg-gray-800 hover:text-white";
    
    return (
      <>
        <header className="navbar-container w-full md:w-[80%] lg:w-[60%] m-auto sticky z-100 top-3 mt-10 transition bg-white shadow-2xl rounded-[40px] px-4 md:px-10">
          <div className="flex justify-between md:justify-center items-center w-full py-4 md:py-5 gap-4 md:gap-10">
            {/* Logo */}
            <div className="shrink-0">
              <img
                className="w-8 h-8 md:w-10 md:h-10 object-cover rounded-[50%]"
                src="/images/logo.png"
                alt="logo"
              />
            </div>

            {/* Menu */}
            <div className="hidden md:flex justify-start items-center">
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
                <div className="flex justify-between items-center gap-6 cursor-pointe p-1 px-2 bg-gray-100 rounded-[20px] transition duration-500 shrink-0">
                  <i
                    className="ri-user-line text-[20px] cursor-pointer transition duration-200 bg-white px-1.5 rounded-[50%]"
                    onClick={() => navigate("/profile")}
                  ></i>

                  <i className="fa-regular fa-bell text-[20px] cursor-pointer transition duration-200"></i>

                  <i
                    className="ri-shopping-cart-2-line text-[20px] cursor-pointer transition duration-200"
                    onClick={() => navigate(`/cart/${currentUser.id}`)}
                  ></i>
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