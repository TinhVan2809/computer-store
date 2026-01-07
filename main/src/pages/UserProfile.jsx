import { useState, useEffect, useCallback } from "react";
 import { useParams } from "react-router-dom";
function UserProfile() {
    const {user_id} = useParams();
    console.log('User ID received in Profile:', user_id);

    const URL_BASE_ORDER = 'http://localhost/computer-store/backend/orders/order_api_endpoint.php';
    const LIMIT = 10;

    const [orders, setOrders] = useState();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    // Lấy danh sách order của người dùng này
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


// CÓ thể fetch nhiều thứ ở đây
    useEffect(() => {
        fetchOrderUserData();
    }, [user_id, fetchOrderUserData]);

    return (
        <>
           <div className="">
            {orders.map((o) => (
                <div className="" key={o.order_id}>
                    <p>{o.order_id}</p>
                </div>
            ))}
           </div>
        </>
    );
}

export default UserProfile;