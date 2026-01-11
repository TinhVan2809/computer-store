import { useEffect, useState } from "react";

export default function Banners() {
  const API_BANNER =
    "http://localhost/computer-store/backend/banners/banner_api_endpoint.php";
  const IMG_BANNER = "http://localhost/computer-store/backend/uploads/banners";
  const [file, setFile] = useState(null);

  const [image, setImage] = useState([]);

  const [deleteComfirm, setDeleteComfirm] = useState(false);

  const [selectedBannerId, setSelectedBannerId] = useState(null);

  // [ADD] Thêm hình ảnh vào banner
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Vui lòng chọn ảnh!");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${API_BANNER}?action=add`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setFile(null);
        fetchBannersData();
        // Reset input file value
        e.target.reset();
      }
    } catch (error) {
      console.error("Error toggle image ", error);
    }
  };

  // [GET] lấy tất cả hình ảnh có trong banners

  const fetchBannersData = async () => {
    try {
      const res = await fetch(`${API_BANNER}?action=get`);

      if (!res.ok) {
        throw new Error("ERROR HTTP: ", res.status);
      }

      const data = await res.json();
      if (data.success) {
        setImage(data.data);
      }
    } catch (error) {
      console.error("Error fetting image in banner ", error);
    }
  };

  useEffect(() => {
    fetchBannersData();
  }, []);

  // [DELETE] hàm xóa ảnh trong banner
  const onDelete = (banner_id) => {
    setDeleteComfirm(true);
    setSelectedBannerId(banner_id);
  };

  const onCancel = () => {
    setDeleteComfirm(false);
    setDeleteComfirm(null);
  };

  const handleDeleteImage = async() => {
    if(!selectedBannerId){
        console.log("Banner ID undefine");
    }
    try{
        const res = await fetch(`${API_BANNER}?action=delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({ banner_id: selectedBannerId })
            });
        if(!res.ok) {
            throw new Error('ERROR HTTP', res.status);
        } 

        const data = await res.json();
        if(data.success) {
            setDeleteComfirm(false);
            fetchBannersData(); // Chạy lại image list sau khi xóa
            setSelectedBannerId(null); 
        }
    } catch(error) {
        console.error("Error deleting image", error);
    }
  }

  return (
    <>
      <div className="">
        <form onSubmit={handleSubmit}>
          <label htmlFor="">Chọn ảnh: </label>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
          >
            Upload
          </button>
        </form>
      </div>

      <div className="p-10">
        <div className="flex gap-5">
          {image.map((i) => (
            <div className="" key={i.banner_id}>
              <img className="w-50 h-auto" src={`${IMG_BANNER}/${i.image}`} />
              <button onClick={() => onDelete(i.banner_id)}>Xóa</button>
            </div>
          ))}
        </div>
      </div>

      {deleteComfirm && (
        <div className="fixed z-100 top-0 w-full h-full flex justify-center items-center">
          <div className="bg-white rounded-sm shadow-md px-4 py-3 flex flex-col gap-4">
            <span>Xác nhận xóa ảnh này?</span>
            <div className="w-full flex justify-end items-center gap-3">
              <button className="px-2.5 py-1 rounded-sm shadow-sm text-sm cursor-pointer" onClick={onCancel}>Đóng</button>
              <button className="px-2.5 py-1 rounded-sm shadow-sm text-sm cursor-pointer bg-red-500 text-white hover:bg-red-700" onClick={handleDeleteImage}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
