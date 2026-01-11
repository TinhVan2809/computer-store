import { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserContext from "../context/UserContext";
import "../styles/Detail.css";

const API_BASE =
  "http://localhost/computer-store/backend/products/product_api_endpoint.php"; // products

const API_URL =
  "http://localhost/computer-store/backend/carts/cart_api_endpoint.php"; // cart

const API_REVIEWS =
  "http://localhost/computer-store/backend/reviews/review_api_endpoint.php"; // reviews

const URL_IMAGE = "http://localhost/computer-store/backend/uploads/users"; // url avata

const formatDate = (datetime) => {
  const d = new Date(datetime);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const LIMIT = 10;

function Detail() {
  const { product_id } = useParams();
  const [product, setProduct] = useState(null);
  const [existingSecondaryImages, setExistingSecondaryImages] = useState("");

  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const navigate = useNavigate();
  const { currentUser, refreshCartCount } = useContext(UserContext);

  // toast thông báo thêm sản phẩm vào giỏ thành công
  const [toastSuccessAddToCart, setToastSuccessAddToCart] = useState(false);

  // toast thông báo yêu cầu đăng nhập để thêm giỏ hàng hoặc mua ngay
  const [toastLoginReuired, setToastLoginReuired] = useState(false);

  // {ADMIN} State lưu trạng thái modal xác nhận xóa review
  const [deleteReviewCofirm, setDeleteReviewCofirm] = useState(false);

  // State lưu vote_id
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReviews = useCallback(async () => {
    if (!product_id) return;
    try {
      const offset = (currentPage - 1) * LIMIT;
      const response = await fetch(
        `${API_REVIEWS}?action=get&product_id=${product_id}&limit=${LIMIT}&offset=${offset}`
      );

      if (!response.ok) {
        throw new Error("ERROR HTTP " + response.status);
      }

      const data = await response.json();

      if (data.success) {
        setReviews(data.data);
        setTotalPages(data.total_pages || 1);
      }
    } catch (error) {
      console.error("Error getting Reviews ", error);
    }
  }, [product_id, currentPage]);

  useEffect(() => {
    if (!product_id) return;

    const controller = new AbortController(); // Ngăn chạy lại khi đã chạy rồi

    const fetchDetailProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const prodUrl = `${API_BASE}?action=getProductById&id=${encodeURIComponent(
          product_id
        )}`;
        const imgsUrl = `${API_BASE}?action=getSecondaryImages&product_id=${encodeURIComponent(
          product_id
        )}`;

        const [prodRes, imgsRes] = await Promise.all([
          fetch(prodUrl, { signal: controller.signal }),
          fetch(imgsUrl, { signal: controller.signal }),
        ]);

        if (!prodRes.ok) throw new Error(`Product HTTP ${prodRes.status}`);
        if (!imgsRes.ok) throw new Error(`Images HTTP ${imgsRes.status}`);

        const [prodJson, imgsJson] = await Promise.all([
          prodRes.json(),
          imgsRes.json(),
        ]);

        if (prodJson.success) setProduct(prodJson.data);
        else throw new Error(prodJson.message || "No product");

        if (imgsJson.success) setExistingSecondaryImages(imgsJson.data);
        else setExistingSecondaryImages([]);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message || "Fetch error");
      } finally {
        setLoading(false);
      }
    };

    if (currentPage === 1) {
      fetchDetailProduct();
    }
    fetchReviews();

    return () => {
      controller.abort();
    };
  }, [product_id, currentPage, fetchReviews]);

  if (loading && currentPage === 1) return <div>Loading...</div>;
  if (error) return <div className="error">Something went wrong: {error}</div>;
  if (!product) return <div>No data.</div>;

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const price = Number(product.product_price) || 0;
  const sale = Number(product.product_sale) || 0;
  const saleClamped = Math.max(0, Math.min(100, sale));
  const discounted = Math.max(0, price * (1 - saleClamped / 100));
  const formatter = new Intl.NumberFormat("en-EN", {
    style: "currency",
    currency: "USD",
  });

  const StarRating = ({ rating }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<i key={i} className="ri-star-s-fill text-yellow-500"></i>);
      } else {
        stars.push(<i key={i} className="ri-star-line text-gray-400"></i>);
      }
    }
    return <div className="flex items-center">{stars}</div>;
  };

  // Hàm thêm sản phẩm vào giỏ
  const HandleToggleCart = async (e, product_id) => {
    e.stopPropagation();
    if (!currentUser) {
      setToastLoginReuired(true);
      return;
    }

    try {
      const response = await fetch(`${API_URL}?action=add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          product_id: product_id,
        }),
      });

      const result = await response.json();
      setToastSuccessAddToCart(true);
      setTimeout(() => {
        setToastSuccessAddToCart(false);
      }, 2000);
      if (result.success) {
        refreshCartCount(); // Cập nhật số lượng trên Navbar
      }
    } catch (error) {      console.error("Failed to add product to cart:", error);
    }
  };

  // hàm xóa review

  const onDeleteReview = (vote_id) => {
    setDeleteReviewCofirm(true);
    setSelectedReviewId(vote_id);
  };

  const onCancel = () => {
    setDeleteReviewCofirm(false);
  };

  const handleDeleteReview = async () => {
    try {
      const res = await fetch(`${API_REVIEWS}?action=delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ vote_id: selectedReviewId }),
      });

      const data = await res.json();
      if (data.success) {
        setDeleteReviewCofirm(false);
        setSelectedReviewId(null);

        fetchReviews();
      }
    } catch (error) {
      console.error("Error deleting review ", error);
    }
  };

  return (
    <>
      <section id="product_detail_container" className="w-full pt-10">
        <div
          className="product_detail_container_content w-[1250px] max-w-[1250px] flex gap-10 m-auto"
          key={product.product_id}
        >
          <div className="right flex w-[50%] flex-col p-5  ">
            <div className="size-fit">
              <img
                src={`http://localhost/computer-store/backend/uploads/products_img/${product.image_main}`}
                alt={product.product_name}
                title={product.product_name}
                id="thumbnail"
                className="w-[500px] h-[500px] object-contain"
              />
            </div>
            <div className="flex flex-wrap gap-1 h-full overflow-y-auto">
              {existingSecondaryImages.map((img) => (
                <img
                  src={`http://localhost/computer-store/backend/uploads/products_img/${img.image}`}
                  alt={img.product_name}
                  title={img.product_name}
                  className="w-[100px] h-[100px] object-cover cursor-pointer transition duration-200 rounded-sm"
                ></img>
              ))}
            </div>
          </div>
          <div className="left w-[50%] relative">
            <div className="left_contents flex w-full flex-col gap-2">
              <div className="flex w-full flex-col gap-1 justify-start items-start">
                <div className="flex flex-col gap-0 w-full justify-start items-start text-start">
                  <img
                    className={
                      product.manufacturer_logo_image
                        ? "w-auto h-3 object-cover"
                        : "hidden"
                    }
                    src={`http://localhost/computer-store/backend/uploads/manufacturers_img/${product.manufacturer_logo_image}`}
                    alt={product.manufacturer_name}
                  />
                  <p className="text-[2rem]">{product.product_name}</p>
                </div>
                <div className="flex justify-start items-center gap-1">
                  <div className="">
                    <i className="ri-star-s-fill"></i>
                    <i className="ri-star-s-fill"></i>
                    <i className="ri-star-s-fill"></i>
                    <i className="ri-star-s-fill"></i>
                    <i className="ri-star-s-fill"></i>
                  </div>
                  <div className="">
                    <span className="text-stone-950 text-[14px]">
                      200 reviews
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full flex justify-start">
                {saleClamped > 0 ? (
                  <>
                    <div className="flex flex-col gap-2 items-end justify-start ">
                      <div className="flex justify-center items-center text-center gap-2 w-full">
                        <span className="line-through text-gray-400 text-[14px]">
                          {" "}
                          {formatter.format(price)}{" "}
                        </span>
                        <span
                          id={`${product.manufacturer_name}`}
                          className="rounded-[7px] text-black px-1 text-[12px]"
                        >
                          {product.product_sale} <sup>%</sup> Sale
                        </span>
                      </div>

                      <div className="w-full">
                        <span className="text-[24px] font-medium">
                          {formatter.format(discounted)}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <span className="text-[24px] font-medium">
                    {formatter.format(price)}
                  </span>
                )}
              </div>
              {product.product_description ? (
                <div className="product_description">
                  <p className="text-gray-700">{product.product_description}</p>
                </div>
              ) : (
                ""
              )}

              <div className="w-full justify-start flex">
                <div className="flex justify-center items-center">
                  <button className="border border-gray-300 w-9 py-1 cursor-pointer">
                    -
                  </button>
                  <input
                    className="w-11 text-stone-800 py-1 flex text-center"
                    type="text"
                    role="spinbutton"
                    aria-live="assertive"
                    aria-valuenow="1"
                    defaultValue="1"
                  />
                  <button className="border border-gray-300 w-9 py-1 cursor-pointer">
                    +
                  </button>
                </div>
              </div>

              <div className="flex justify-start items-center bottom-0 py-2 gap-3 w-full">
                <button
                  className="p-3 border border-gray-300 w-[210px] rounded-[25px] cursor-pointer transition duration-500"
                  onClick={(e) => HandleToggleCart(e, product.product_id)}
                >
                  <i className="fa-solid fa-cart-plus"></i>Add To Cart
                </button>
                <button className="p-3 border bg-stone-950 text-white w-[210px] rounded-[25px] cursor-pointer transition duration-300 hover:opacity-80">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <div className="w-full flex mt-10">
        <div className="w-full flex flex-col gap-4 p-20 ">
          {reviews.length > 0 ? (
            <>
              {reviews.map((r) => (
                <div
                  key={r.vote_id}
                  className="w-full flex flex-col gap-5 border-b-gray-200 border-b pb-4 mb-4"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-3 justify-start items-center">
                      <img
                        className="w-10 h-10 rounded-full object-cover"
                        src={`${URL_IMAGE}/${r.avata}`}
                        alt={r.username}
                      />
                      <div>
                        <p className="text-md font-semibold text-stone-800">
                          {r.username}
                        </p>
                        <span className="text-sm text-gray-500">
                          {formatDate(r.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="pl-12">
                    <StarRating rating={r.rating} />
                    <p className="mt-2 text-stone-700">{r.comment}</p>
                    <div className="mt-2 flex gap-3 justify-start">
                      {/* KHÔNG THỂ TỰ ĐÁNH GIÁ BÌNH LUẬN CỦA MÌNH */}
                      {r.user_id !== currentUser?.id && (
                        <>
                          <button className="text-sm text-gray-500 cursor-pointer hover:text-black">
                            <i className="ri-thumb-up-line"></i> Hữu ích
                          </button>
                          <button className="text-sm text-red-600 hover:underline cursor-pointer">
                            Báo cáo
                          </button>
                        </>
                      )}

                      {/* CHỈ CÓ BÌNH LUẬN CỦA NGƯỜI ĐANG ĐĂNG NHẬP MỚI ĐƯỢC GỠ */}
                      {r.user_id == currentUser?.id && (
                        <button className="text-sm text-red-600 hover:underline cursor-pointer" onClick={() => onDeleteReview(r.vote_id)}>
                          Xóa
                        </button>
                      )}

                      {/* ADMIN CÓ QUYỀN GỠ VÀ TRẢ BÌNH LUẬN CỦA MỌI NGƯỜI */}
                      {currentUser?.role == "admin" && (
                        <>
                          <button className="text-sm text-blue-600 hover:underline cursor-pointer">
                            Trả lời
                          </button>
                          <button
                            className="text-sm text-red-600 hover:underline cursor-pointer"
                            onClick={() => onDeleteReview(r.vote_id)}
                          >
                            Gỡ
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <p>Chưa có bình luận, hãy đánh giá đầu tiên.</p>
          )}
        </div>
      </div>

      {/* TOAST THÔNG BÁO ĐÃ THÊM SẢN PHẨM VÀO GIỎ HÀNG */}
      {toastSuccessAddToCart && (
        <div className="add_to_cart fixed z-100 flex justify-center items-center w-65 h-30 rounded-xl top-[40%] right-[43%]">
          <div className="">
            <i className="ri-check-line text-white text-[60px] p-3 rounded-[50%] bg-stone-700"></i>
          </div>
        </div>
      )}

      {/* TOAST THÔNG BÁO YÊU CẦU ĐĂNG NHẬP */}
      {toastLoginReuired && (
        <div className="fixed top-0 z-300 flex justify-center items-center w-full h-full bg-[#0000004f]">
          <div className="bg-white flex flex-col p-6 shadow-2xl gap-10">
            <div className="flex flex-1 flex-col justify-center items-center gap-5">
              <p className="text-lg">
                Bạn cần đăng nhập để thêm sản phẩm vào giỏ.
              </p>
              <i className="ri-shopping-basket-2-line text-7xl text-stone-200"></i>
            </div>
            <div className="w-full flex justify-end items-center gap-3">
              <button
                className=" hover:opacity-70 py-1 px-4 rounded-[15px] cursor-pointer border border-gray-200"
                onClick={() => setToastLoginReuired(false)}
              >
                Hủy
              </button>
              <button
                className=" hover:opacity-70 py-1 px-4 rounded-[15px] cursor-pointer bg-black text-white"
                onClick={() => navigate("/login")}
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      )}

      {/* XÓA NHẬN MUỐN XÓA BÌNH LUẬN NÀY */}
      {deleteReviewCofirm && (
        <>
          <div className="deleteReviewCofirm w-full h-full flex justify-center items-center fixed top-0">
            <div className="py-5 px-10 bg-white flex flex-col gap-10">
              <span>Bạn muốn gỡ bình luận này?</span>
              <div className="flex gap-3 w-full justify-end items-center">
                <button
                  className="py-1 px-3.5 rounded-sm cursor-pointer border border-gray-200"
                  onClick={onCancel}
                >
                  Hủy
                </button>
                <button
                  className="py-1 px-3.5 rounded-sm cursor-pointer bg-red-500 text-white hover:bg-red-800"
                  onClick={handleDeleteReview}
                >
                  Gỡ
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Detail;
