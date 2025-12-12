
import { useContext, useEffect, useState } from "react";
import UserContext from '../context/UserContext';
import '../styles/carts.css';

function Carts() {
    const API_CART = "http://localhost/computer-store/backend/carts/cart_api_endpoint.php";
    const LIMIT = 10;
    const { currentUser } = useContext(UserContext);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        const fetchCartData = async (page = 0) => {
            if (!currentUser) {
                setError("You must be logged in to see your cart.");
                setCart([]);
                setTotalCount(0);
                return;
            }
            setLoading(true);
            setError('');
            try {
                const offset = page * LIMIT;
                const response = await fetch(
                    `${API_CART}?action=get&user_id=${currentUser.id}&limit=${LIMIT}&offset=${offset}`
                );
                const data = await response.json();

                if (data.success) {
                    setCart(data.data);
                    setTotalCount(data.total_items);
                    setCurrentPage(page);
                } else {
                    setError(data.message || 'Failed to fetch cart data');
                }
            } catch (err) {
                setError('Error connecting to server: ' + err.message);
            }
            finally {
                setLoading(false);
            }
        };

        fetchCartData();
    }, [currentUser, currentPage]);

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
              {cart.length > 0 ? (
                        <div>
                            <ul>
                                {cart.map((item) => (
                                    <li key={item.cart_id}>
                                        <p>Product: {item.product_name}</p>
                                        <p>Quantity: {item.product_quantity}</p>
                                        <p>Price: ${item.product_price}</p>
                                        <p>Sale: {item.product_sale}</p>
                                    </li>
                                ))}
                            </ul>
                            <div className="pagination">
                                <p>Page {currentPage + 1}</p>
                                <p>Total items: {totalCount}</p>
                                {/* Add buttons for pagination later */}
                            </div>
                        </div>
                    ) : (
                        <p>Your cart is empty.</p>
                    )}
               
            
        </>
    );
}

export default Carts;