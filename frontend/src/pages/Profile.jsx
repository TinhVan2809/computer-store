import { useContext, useState } from "react";
import { NavLink, Route, Routes} from "react-router-dom";
import UserContext from "../context/UserContext";
import '../styles/profile.css';

// ORDERS COMPONENTS
import Waiting from "../components/orders/Waiting";
import Delivering from "../components/orders/Delivering";

function Profile() {
    const BASE_PRO = "http://localhost/computer-store/backend/cart_api_endpoint.php";
    const AVATA_BASE = "http://localhost/computer-store/backend/uploads/users";
    const { currentUser, logout } = useContext(UserContext); 
    const [confirm, setConfirm] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const [products, setProducts] = useState([]); //eslint-disable-line
    const [error, setError] = useState(''); //eslint-disable-line
    const [loading, setLoading] = useState(false); //eslint-disable-line

    const showConfirmLogout = () => {
        setIsClosing(false);
        setConfirm(true);
    }
    const closeConrimLogout = () => {
        setIsClosing(true);
        setTimeout(() => {
            setConfirm(false);
        }, 300); // Phải khớp với thời gian của animation
    }

    if (!currentUser) {
        return <div>Loading profile...</div>;
    }

   
    return (
      <>
        {confirm && (
          <>
            <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
              <div
                className={`popup flex flex-col justify-between items-center bg-white px-4 py-7 w-[350px] h-[300px] rounded-xl gap-2 ${
                  isClosing ? "animate-scale-out" : "animate-scale-in"
                }`}
              >
                <h2 className="text-xl">Confirm Logout?</h2>
                <div className="w-full flex justify-center">
                  <i class="fa-solid fa-arrow-right-from-bracket text-8xl"></i>
                </div>
                <div className="w-full flex justify-around items-center">
                  <button
                    className="shadow-xl border border-gray-200 text-black px-10 py-1 rounded-2xl cursor-pointer hover:opacity-70"
                    onClick={closeConrimLogout}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-black px-10 py-1 rounded-2xl text-white cursor-pointer hover:opacity-70"
                    onClick={logout}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        <section className="w-full p-20 flex gap-20">
          <div className="w-500px">
            <div className="flex justify-start items-start gap-20">
              <div className="flex flex-col justify-center items-center gap-2">
                <div className="relative px-3 flex flex-col justify-center items-center gap-1">
                  <img
                    className="w-[60px] h-[60px] object-cover rounded-[100%] shadow-stone-400 shadow-2xl"
                    src={
                      currentUser.avata ? `${AVATA_BASE}/${currentUser.avata}` : currentUser.gender == "Male" ? "/public/images/women.jpg" : "/public/images/man.png" 
                    }
                  />
                  <div className="upload bg-white px-4 rounded-2xl cursor-pointer text-[14px] py-1">
                    <a className="">
                      Upload <i className="ri-camera-fill"></i>
                    </a>
                  </div>
                </div>
                <div className="flex flex-col gap-2 justify-center items-center">
                  <div className="flex flex-col justify-center items-center min-w-0">
                    <p className="text-2xl text-stone-700">
                      {currentUser.username}
                    </p>
                    <p className="flex justify-center text-[14px] text-gray-500 truncate w-[200px]">
                      {currentUser.email}
                    </p>
                  </div>
                  <button className="bg-black text-white py-1 w-30 rounded-2xl text-md cursor-pointer hover:opacity-70">
                    Edit Profile
                  </button>
                  <button
                    onClick={showConfirmLogout}
                    className="border border-stone-800 text-black py-1 w-30 rounded-2xl text-md cursor-pointer hover:opacity-70"
                  >
                    Logout
                  </button>
                </div>
              </div>
              <div className="">
                <ul className="flex flex-col gap-2">
                  <li className="cursor-pointer transition duration-300 hover:opacity-60">
                    Delivery address <i className="fa-regular fa-truck"></i>
                  </li>
                  <li className="cursor-pointer transition duration-300 hover:opacity-60">
                    Notification <i className="fa-regular fa-bell"></i>
                  </li>
                  <li className="cursor-pointer transition duration-300 hover:opacity-60">
                    My Shopping Cart{" "}
                    <i className="fa-solid fa-cart-arrow-down"></i>
                  </li>
                  <li className="cursor-pointer transition duration-300 hover:opacity-60">
                    Banks <i className="fa-solid fa-building-columns"></i>
                  </li>
                  <li className="cursor-pointer transition duration-300 hover:opacity-60">
                    Private <i className="fa-solid fa-key"></i>
                  </li>
                  <li className="cursor-pointer transition duration-300 hover:opacity-60">
                    piggy-banks <i className="fa-solid fa-piggy-bank"></i>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-white shadow-sm rounded-2xl ">
            <div className="flex w-full p-3">
              <div className="flex w-full flex-col gap-4">
                <ul className="w-full flex gap-20">
                  <li>
                    <NavLink to="/profile/waiting">Waiting</NavLink>
                  </li>
                  <li>
                    <NavLink to="/profile/delivering">Delivering</NavLink>
                  </li>
                  <li>
                    <NavLink to="/profile/received">Received</NavLink>
                  </li>
                  <li>
                    <NavLink to="/profile/abort">Abort</NavLink>
                  </li>
                  <li>
                    <NavLink to="/profile/refund">Refund</NavLink>
                  </li>
                </ul>
                <div className="w-full relative z-30">
                  <Routes>
                    <Route path="waiting" element={<Waiting />} />
                    <Route path="delivering" element={<Delivering />} />
                    <Route path="received" element={<Waiting />} />
                    <Route path="abort" element={<Waiting />} />
                    <Route path="refund" element={<Waiting />} />
                  </Routes>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
}

export default Profile;