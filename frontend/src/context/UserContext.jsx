import { createContext, useState, useEffect, useCallback } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

const BASE_CART_API = "http://localhost/computer-store/backend/carts/cart_api_endpoint.php";
const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();
    const [cartItemCount, setCartItemCount] = useState(0);

    const refreshCartCount = useCallback(async () => {
        if (!currentUser) {
            setCartItemCount(0);
            return;
        }
        try {
            const response = await fetch(`${BASE_CART_API}?action=get&user_id=${currentUser.id}`);
            const data = await response.json();
            if (data.success) {
                setCartItemCount(data.total_items || 0);
            } else {
                setCartItemCount(0);
            }
        } catch (error) {
            console.error("Lỗi khi làm mới số lượng giỏ hàng:", error);
            setCartItemCount(0);
        }
    }, [currentUser]);

    // Hợp nhất logic fetch user và cart count vào một useEffect
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const res = await API.get("/userData");
                const user = res.data.user;
                setCurrentUser(user); // Cập nhật user

                // Nếu có user, fetch luôn cart count
                if (user) {
                    const cartResponse = await fetch(`${BASE_CART_API}?action=get&user_id=${user.id}`);
                    const cartData = await cartResponse.json();
                    if (cartData.success) {
                        setCartItemCount(cartData.total_items || 0);
                    }
                }
            } catch (error) {
                console.log("Not logged in", error);
                setCurrentUser(null);
                setCartItemCount(0);
            }
        };
        fetchInitialData();
    }, []); // Chỉ chạy một lần khi component được mount

    // Effect này sẽ chạy mỗi khi currentUser thay đổi (ví dụ: sau khi đăng nhập hoặc đăng xuất)
    // để cập nhật số lượng giỏ hàng.
    useEffect(() => {
        refreshCartCount(); //eslint-disable-line
    }, [currentUser, refreshCartCount]);

    const logout = async () => {
        try {
            await API.post("/logout");
            setCurrentUser(null);
            navigate('/login'); // Navigate to home or login page after logout
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <UserContext.Provider value={{ currentUser, setCurrentUser, logout, cartItemCount, refreshCartCount }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
