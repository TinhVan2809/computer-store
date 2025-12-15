import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import "../styles/Detail.css";

const API_BASE =
  "http://localhost/computer-store/backend/products/product_api_endpoint.php";
function Detail() {
  const { product_id } = useParams();
  const [product, setProduct] = useState(null);
  const [existingSecondaryImages, setExistingSecondaryImages] = useState("");
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

  return (
    <>
      <section id="product_detail_container" className="w-full py-10">
        <div className="product_detail_container_content w-[1250px] max-w-[1250px] flex gap-10 m-auto">
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
                    className="w-auto h-3 object-cover"
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
              <div className="flex justify-start items-center bottom-0 py-2 gap-3 w-full">
                <button className="p-3 border border-gray-300 w-[210px] rounded-[25px] cursor-pointer transition duration-500">
                  <i class="fa-solid fa-cart-plus"></i>Add To Cart
                </button>
                <button className="p-3 border bg-stone-950 text-white w-[210px] rounded-[25px] cursor-pointer transition duration-300 hover:opacity-80">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Detail;
