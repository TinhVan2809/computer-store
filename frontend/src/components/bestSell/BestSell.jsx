import { useState, useEffect, useCallback } from "react";


function BestSell({period}) {
    const API_BASE ="http://localhost/computer-store/backend/orders/order_api_endpoint.php";
    const [items, setItems] = useState([]);

    const img = 'http://localhost/backend/uploads/products_image';

    // [GET] lấy danh sách sản phẩm bán chạy nhất trong tháng trc.

    const fetchBestSell = useCallback(async () => {
        try{
            const res = await fetch(`${API_BASE}?action=${period}`);

            if(!res.ok) {
                throw new Error("ERROR HTTP: ", res.status);
            }

            const data = await res.json();
            if(data.success) {
                setItems(data.data);
            }
        } catch(error) {
            console.error('Error fetching Take the best-selling product ', error);
        }
    },[period]); 

    useEffect(() => {
        fetchBestSell();
    },[fetchBestSell]);

    return (
        <>
            
        </>
    );
}

export default BestSell;