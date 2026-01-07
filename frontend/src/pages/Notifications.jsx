import {useEffect, useState, useCallback, useContext} from "react";
import UserContext from "../context/UserContext";


function Notifications() {
    const URL_NOTI = "http://localhost/computer-store/backend/notifications/notification_api_endpoint.php";
    const LIMIT = 10;
    const { currentUser } = useContext(UserContext); 

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const userId = currentUser?.id;

    // LƯU NOTIFICATION_ID 
    const [selectedNotificationId, setSelectedNotificationId] = useState(null);

    // FETCH NOTIFICATIONS BY USER
    const fetchNofiticationsData = useCallback(async (page = 1) => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try{
            const res = await fetch(`${URL_NOTI}?action=get&user_id=${userId}&limit=${LIMIT}&page=${page}`);
            if(!res.ok) {
                throw new Error(`HTTP Error: ${res.status}`);
            }

            const data = await res.json();
            
            if(data.success) {
                setNotifications(data.data || []);
                setTotalPages(data.total_pages || 1);
                setCurrentPage(page);
            } else {
                throw new Error(data.message || "Failed to fetch notifications");
            }
        } catch(error){
            setError(error.message);
            console.error("Error fetching notifications", error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // DELETE NOTIFICATION BY ID
    const [deletePopup, setDeletePopup] = useState(false);

    const onDeleteNotification = (notification_id) => {
        setDeletePopup(true);
        setSelectedNotificationId(notification_id);
    }
    const onCancelDeleteNotification = () => {
        setDeletePopup(false);
    }

    const handleDeleteNotification = async () => {
        try{

            if(!selectedNotificationId) {
                console.log("Không tim thấy notication id");
                return;
            }

            const res = await fetch(`${URL_NOTI}?action=delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({ notification_id: selectedNotificationId })
            });

            const data = await res.json();
            if(data.success) {
                setDeletePopup(false);
                setSelectedNotificationId(null);
                fetchNofiticationsData(currentPage); // Reload lại danh sách thông báo.
            } else {
                alert(data.message || "Lỗi khi xóa thông báo");
            }

        } catch(error) {
            console.error("Error deleting notification", error);
        }
    };

    useEffect(() => {
        fetchNofiticationsData(1);
    },[userId, fetchNofiticationsData]); 


    if(loading) {
      return (
      <div>
        <p>Loading...</p>
      </div>
      )
    }


    if(error) {
      return (
        <div className=""><p>something went wrong: {error}</p></div>
      )
    }

    return (
      <>
        <div className="">
          {notifications.map((n) => (
            <>
              <div className="" key={n.notification_id}>
                <div className="">
                  <span>{n.notification_date}</span>
                <p>Mã đơn hàng: #{n.order_id}</p>
                <p>{n.content}</p>
              </div>
              <div className="">
                <p onClick={() => onDeleteNotification(n.notification_id)}>Xóa</p>
              </div>
              </div>
            </>
          ))}
        </div>

        {deletePopup && (
            <>
                <div className="w-full h-full flex justify-center items-center fixed z-100 top-0">
                    <div className="bg-white p-4 rounded-2xl">
                        <p>Xác nhận xóa thông báo này?</p>
                        <button className="border border-gray-200 py-1 px-3 rounded-sm cursor-pointer hover:opacity-70" onClick={onCancelDeleteNotification}>Hủy</button>
                        <button className="bg-red-500 text-white py-1 px-3 rounded-sm cursor-pointer hover:opacity-70" onClick={handleDeleteNotification}>Xóa</button>
                    </div>
                </div>
            </>
        )}

        {/* Pagination Controls */}
        <div className="pagination-container">
          <button
            className="pagination-btn"
            onClick={() => fetchNofiticationsData(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Trang trước
          </button>

          <div className="pagination-info">
            <span>
              Trang {currentPage} / {totalPages}
            </span>
          </div>

          <button
            className="pagination-btn"
            onClick={() => fetchNofiticationsData(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Trang sau
          </button>
        </div>
      </>
    );
}

export default Notifications;