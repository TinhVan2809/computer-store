import {  useState, useEffect } from "react";
import '../styles/vouchers.css';

function Voucher() {

    const URL_VOU = "http://localhost/computer-store/backend/vouchers/voucher_api_endpoint.php";
    const LIMIT = 10;

    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // XEM CHI TIẾT 
    const [detail, setDetail] = useState([]);
    const handleGetDetailVoucher = async (voucher_id) => {
        try{
            const res = await fetch (`${URL_VOU}?action=detail`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({ voucher_id: voucher_id })
            })

            const data = await res.json();

            if(data.success) {
                setDetail(data.data);
            } else {
                console.log('Lỗi khi xem chi tiết voucher');
            }


        } catch(error) {
            console.error("Error geting voucher by id", error);
        }   
    }

    // EDIT
    const [editPopup, setEditPopup] = useState(false);
    const [editFormData, setEditFormData] = useState({
        voucher_id: null,
        voucher_name: '',
        sale: '',
        min_total_amount: '',
        start_at: '',
        end_at: ''
    });

    const onEdit = async (voucher_id) => {
        try {
            const res = await fetch(`${URL_VOU}?action=detail`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({ voucher_id: voucher_id })
            });

            const data = await res.json();
            if (data.success) {
                setEditFormData({
                    voucher_id: data.data.voucher_id,
                    voucher_name: data.data.voucher_name,
                    sale: data.data.sale,
                    min_total_amount: data.data.min_total_amount,
                    start_at: data.data.start_at,
                    end_at: data.data.end_at
                });
                setEditPopup(true);
            }
        } catch (error) {
            console.error("Error fetching voucher detail: ", error);
        }
    };

    const onEditCancel = () => {
        setEditPopup(false);
        setEditFormData({
            voucher_id: null,
            voucher_name: '',
            sale: '',
            min_total_amount: '',
            start_at: '',
            end_at: ''
        });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdateVoucher = async () => {
        if (!editFormData.voucher_id || !editFormData.voucher_name || !editFormData.sale || !editFormData.min_total_amount || !editFormData.start_at || !editFormData.end_at) {
            alert("Vui lòng điền đầy đủ tất cả các trường");
            return;
        }

        try {
            const res = await fetch(`${URL_VOU}?action=update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(editFormData)
            });

            const data = await res.json();
            if (data.success) {
                alert("Cập nhật voucher thành công");
                setEditPopup(false);
                fetchVoucherData(currentPage);
            } else {
                alert(data.message || "Lỗi khi cập nhật voucher");
            }
        } catch (error) {
            console.error("Error updating voucher: ", error);
            alert("Lỗi khi cập nhật voucher");
        }
    };

    // DELETE 
    const [deletePopup, setDeletePopup] = useState(false);
    const [selectedVoucherId, setSelectedVoucherId] = useState(null); // State lưu voucher_id
    
    const onDelete = (voucher_id) => {
        setSelectedVoucherId(voucher_id);
        setDeletePopup(true);
    }
    const onCancel = () => {
        setDeletePopup(false);
        setSelectedVoucherId(null);
    }

    const handleDeleteVoucher = async () => {
        if (!selectedVoucherId) return;
        
        try{
            const res = await fetch(`${URL_VOU}?action=delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({ voucher_id: selectedVoucherId })
            });
            
            const data = await res.json();
            if(data.success) {
                alert("Xóa voucher thành công.");
                setDeletePopup(false);
                setSelectedVoucherId(null);
                fetchVoucherData(); // Reload lại danh sách voucher
            } else {
                alert(data.message || "Lỗi khi xóa voucher");
            }
        } catch(error) {
            console.error("Error deleting voucher: ", error);
            alert("Lỗi khi xóa voucher");
        }
    }

    

    // FETCH VOUCHER DATA
    const fetchVoucherData = async (page = 1) => {
        setLoading(true);
        try{
            const response = await fetch(`${URL_VOU}?action=get&limit=${LIMIT}&page=${page}`);
            
            if(!response.ok) {
                throw new Error("Error HTTP: ", response.status);
            }

            const data = await response.json();
            if(data.success) { // backend php trả về success và data ['success' => true, 'data' => $data];
                setLoading(false);
                setVouchers(data.data);
                setTotalPages(data.total_pages);
                setCurrentPage(page);
            }

        } catch(error) {
            setError(error);
            console.error("Error fetching voucher ", error)
        }
    }

    useEffect(() => {
        fetchVoucherData();
    }, []);


    return (
        <>

        <div className="voucher-container">
            <table className="w-300 border-collapse">
                <thead className="">
                    <tr className="bg-gray-200">
                        <th className="text-stone-800 text-center">Voucher_code</th>
                        <th className="text-stone-800 text-center">Sale</th>
                        <th className="text-stone-800 text-center">đơn hàng tối thiểu</th>
                        <th className="text-stone-800 text-center">Start at</th>
                        <th className="text-stone-800 text-center">End at</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody className="">
                    {vouchers.map((v) => (
                        <tr className="border-b border-gray-300" key={v.voucher_id}>
                            <td className="text-stone-700 text-center">{v.voucher_name}</td>
                            <td className="text-stone-700 text-center">{v.sale}</td>
                            <td className="text-stone-700 text-center">{v.min_total_amount}</td>
                            <td className="text-stone-700 text-center">{v.start_at}</td>
                            <td className="text-stone-700 text-center">{v.end_at}</td>
                            <td className="flex gap-2 justify-center items-center">
                                <button className="py-1 px-2 bg-red-500 rounded-sm text-white cursor-pointer hover:opacity-70" onClick={() => onDelete(v.voucher_id)}>Xóa</button>
                                <button className="py-1 px-2 bg-yellow-500 rounded-sm text-white cursor-pointer hover:opacity-70" onClick={() => onEdit(v.voucher_id)}>Sửa</button>
                                <button className="py-1 px-2 bg-blue-500 rounded-sm text-white cursor-pointer hover:opacity-70" onClick={() => handleGetDetailVoucher(v.voucher_id)}>Chi tiết</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="pagination-container">
                <button 
                    className="pagination-btn" 
                    onClick={() => fetchVoucherData(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Trang trước
                </button>

                <div className="pagination-info">
                    <span>Trang {currentPage} / {totalPages}</span>
                </div>

                <button 
                    className="pagination-btn" 
                    onClick={() => fetchVoucherData(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Trang sau
                </button>
            </div>
        </div>

        {deletePopup && (
            <div className="popup-overlay">
                <div className="popup-content">
                    <p>Xác nhận xóa voucher này?</p>
                    <div className="popup-actions">
                        <button className="px-4 py-2 rounded-sm bg-gray-300 text-black hover:opacity-70" onClick={onCancel}>Hủy</button>
                        <button className="px-4 py-2 rounded-sm bg-red-500 text-white hover:opacity-70" onClick={handleDeleteVoucher}>Xóa</button>
                    </div>
                </div>
            </div>
        )}

        {editPopup && (
            <div className="popup-overlay">
                <div className="popup-content edit-popup">
                    <h3>Sửa Voucher</h3>
                    <form className="edit-form">
                        <div className="form-group">
                            <label>Tên Voucher:</label>
                            <input 
                                type="text" 
                                name="voucher_name" 
                                value={editFormData.voucher_name}
                                onChange={handleEditInputChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Giảm giá (%):</label>
                            <input 
                                type="text" 
                                name="sale" 
                                value={editFormData.sale}
                                onChange={handleEditInputChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Đơn hàng tối thiểu:</label>
                            <input 
                                type="number" 
                                name="min_total_amount" 
                                value={editFormData.min_total_amount}
                                onChange={handleEditInputChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Ngày bắt đầu:</label>
                            <input 
                                type="datetime-local" 
                                name="start_at" 
                                value={editFormData.start_at}
                                onChange={handleEditInputChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Ngày kết thúc:</label>
                            <input 
                                type="datetime-local" 
                                name="end_at" 
                                value={editFormData.end_at}
                                onChange={handleEditInputChange}
                                className="form-input"
                            />
                        </div>

                        <div className="popup-actions">
                            <button type="button" className="px-4 py-2 rounded-sm bg-gray-300 text-black hover:opacity-70" onClick={onEditCancel}>Hủy</button>
                            <button type="button" className="px-4 py-2 rounded-sm bg-green-500 text-white hover:opacity-70" onClick={handleUpdateVoucher}>Cập nhật</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        
        </>
    );
}

export default Voucher;