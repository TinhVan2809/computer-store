import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserContext from "../context/UserContext";
import "../styles/Detail.css";

const API_BASE =
  "http://localhost/computer-store/backend/products/product_api_endpoint.php";

const API_URL = 'http://localhost/computer-store/backend/carts/cart_api_endpoint.php';

function Detail() {
  const { product_id } = useParams();
  const [product, setProduct] = useState(null);
  const [existingSecondaryImages, setExistingSecondaryImages] = useState("");

  const navigate = useNavigate();
  const { currentUser, refreshCartCount } = useContext(UserContext);

  // toast thông báo thêm sản phẩm vào giỏ thành công
  const [toastSuccessAddToCart, setToastSuccessAddToCart] = useState(false);

  // toast thông báo yêu cầu đăng nhập để thêm giỏ hàng hoặc mua ngay
  const [toastLoginReuired, setToastLoginReuired] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!product_id) return;
    const controller = new AbortController();

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

        // Run both requests in parallel
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
        else setExistingSecondaryImages([]); // optional fallback
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message || "Fetch error");
      } finally {
        setLoading(false);
      }
    };

    fetchDetailProduct();
    return () => controller.abort();
  }, [product_id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">Something went wrong: {error}</div>;
  if (!product) return <div>No data.</div>;

  

  const price = Number(product.product_price) || 0;
  const sale = Number(product.product_sale) || 0;
  const saleClamped = Math.max(0, Math.min(100, sale));
  const discounted = Math.max(0, price * (1 - saleClamped / 100));
  const formatter = new Intl.NumberFormat("en-EN", {
    style: "currency",
    currency: "USD",
  });


  // Hàm thêm sản phẩm vào giỏ
    const HandleToggleCart = async (e, product_id) => {
      e.stopPropagation();
        if (!currentUser) {
            setToastLoginReuired(true);
            return;
        }

        try {
            const response = await fetch(`${API_URL}?action=add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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
        } catch (error) {
            console.error('Failed to add product to cart:', error);
            alert('Đã có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.');
        }
    };

  return (
    <>
      <section id="product_detail_container" className="w-full pt-10">
        <div className="product_detail_container_content w-[1250px] max-w-[1250px] flex gap-10 m-auto" key={product.product_id}>
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
                    className={product.manufacturer_logo_image ? "w-auto h-3 object-cover" : "hidden"}
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
                <button className="border border-gray-300 w-9 py-1 cursor-pointer">-</button>
                <input className="w-11 text-stone-800 py-1 flex text-center" type="text" role="spinbutton" aria-live="assertive" aria-valuenow="1" defaultValue="1" />
                <button className="border border-gray-300 w-9 py-1 cursor-pointer">+</button>
              </div>
          </div>

              <div className="flex justify-start items-center bottom-0 py-2 gap-3 w-full">
                <button className="p-3 border border-gray-300 w-[210px] rounded-[25px] cursor-pointer transition duration-500" onClick={(e) => HandleToggleCart(e, product.product_id)}>
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
              <p className="text-lg">Bạn cần đăng nhập để thêm sản phẩm vào giỏ.</p>
              <i className="ri-shopping-basket-2-line text-7xl"></i>
            </div>
            <div className="w-full flex justify-end items-center gap-3">
              <button className=" hover:opacity-70 py-1 px-4 rounded-[15px] cursor-pointer border border-gray-200" onClick={() => setToastLoginReuired(false)}>
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
      
    </>
  );
}

export default Detail;
