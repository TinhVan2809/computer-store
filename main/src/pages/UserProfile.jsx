import { useState, useEffect, useCallback } from "react";
 import { useParams } from "react-router-dom";
function UserProfile() {
    const {user_id} = useParams(); // id của người dùng này 
    console.log('User ID received in Profile:', user_id);

    const URL_BASE_ORDER = 'http://localhost/computer-store/backend/orders/order_api_endpoint.php'; // ORDER
    const URL_BASE_USER = 'http://localhost/computer-store/backend/users/user_api_endpoint.php';
    const LIMIT = 10;

    const [orders, setOrders] = useState();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    // State lưu thông tin dữ liệu người dùng này 
    const [user, setUser] = useState([]);


    // [ORDERS] Lấy danh sách order của người dùng này
    const fetchOrderUserData = useCallback( async (page = 1) => {
        setLoading(true);
        try{
            const responve = await fetch (`${URL_BASE_ORDER}?action=get&user_id=${user_id}&limit=${LIMIT}&offset=${page}`);
            
            if(!responve.ok) {
                throw new Error('ERROR HTTP: ', responve.status);
            }
            
            const data = await responve.json();
            if(data.success) {
                setLoading(false);
                setOrders(data.data);
                setTotalCount(Number(data.total_items) || 0);
                setCurrentPage(page);
            }
        } catch(error) {
            setError(error.message);
            console.error("Error getting order data of this user ", error);
        }
    }, [user_id]);

    // [USER]
    const fetchUserData = useCallback(async () => {
        setLoading(true);
        try{
            const response = await fetch(`${URL_BASE_USER}?action=getId&user_id=${user_id}`);

            if (!response.ok) {
                throw new Error('Error HTTP: ', response.status);
            }

            const data = await response.json();
            if(data.success) 
            {
                setUser(data.data);
                setLoading(false);
            }
        } catch(error) {
            console.error("Error geting user data ", error);
        }
    }, [user_id]);

// CÓ thể fetch nhiều thứ ở đây
    useEffect(() => {
        fetchOrderUserData();
        fetchUserData();
    }, [user_id, fetchOrderUserData, fetchUserData]);

    return (
        <>
          
        </>
    );
}

export default UserProfile;