import { useState, useEffect, useCallback } from "react";
import {useParams} from "react-router-dom";
import API from "../../../frontend/src/api/api";
function OrderDetail() {
    const API_BASE = 'http://localhost/computer-store/backend/orders/order_api_endpoint.php';
    const {order_id} = useParams();
    const [order, setOrder] = useState([]);
    const [items, setItems] = useState([]);
    const [payment, setPayment] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

   
 const fetchOrderDetail = useCallback(async () => {
  setLoading(true);
  try {
    const response = await API.get(`/orders/${order_id}`);

    const orderData = response.data.order || {};
    if (response.data.voucher) {
      orderData.voucher = response.data.voucher;
    }

    setOrder(orderData);
    setItems(response.data.items || []);
    setPayment(response.data.payment);
  } catch (error) {
    console.error("Error fetching order detail:", error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
}, [order_id]);


  useEffect(() => {
    if (order_id) {
      fetchOrderDetail();
    }
  }, [order_id, fetchOrderDetail]);

   
    return (
        <>
        </>
    );
}

export default OrderDetail;