import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../frontend/src/api/api";

function Orders() {

  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

//   const formatter = new Intl.NumberFormat("en-US", {
//     style: "currency",
//     currency: "USD",
//   });

    
  const fetchOrders = useCallback(async (page = 1) => {


    setLoading(true);
    try {
      const response = await API.get("/all_orders", {
        params: {
          page,
          limit: 10,
        },
      });

      let filteredOrders = response.data.orders || [];
      if (statusFilter !== "all") {
        filteredOrders = filteredOrders.filter(
          (order) => order.status === statusFilter
        );
      }

      setOrders(filteredOrders);
      setTotalPages(response.data.pagination.pages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Lỗi khi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  },[statusFilter]);

  useEffect(() => {
   
      fetchOrders(1);
  }, [fetchOrders, statusFilter]); 

    return (
        <>
            <section>
                <div className="">
                    {orders.map((o) => (
                        <div className="" key={o.order_id}>
                            <p>{o.order_id}</p>
                            <button onClick={() => navigate(`/order-detail/${o.order_id}`)}>Chi tiết</button>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}

export default Orders;