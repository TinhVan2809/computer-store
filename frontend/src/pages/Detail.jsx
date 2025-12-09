import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = 'http://localhost/computer-store/backend/products/product_api_endpoint.php';
function Detail() {
    const { product_id } = useParams();
    const [product, setProduct] = useState(null);
    const [existingSecondaryImages, setExistingSecondaryImages] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!product_id) return;
        const controller = new AbortController();

        const fetchDetailProduct = async () => {
            setLoading(true);
            setError('');
            try {
                const prodUrl = `${API_BASE}?action=getProductById&id=${encodeURIComponent(product_id)}`;
                const imgsUrl = `${API_BASE}?action=getSecondaryImages&product_id=${encodeURIComponent(product_id)}`;

                // Run both requests in parallel
                const [prodRes, imgsRes] = await Promise.all([
                    fetch(prodUrl, { signal: controller.signal }),
                    fetch(imgsUrl, { signal: controller.signal })
                ]);

                if (!prodRes.ok) throw new Error(`Product HTTP ${prodRes.status}`);
                if (!imgsRes.ok) throw new Error(`Images HTTP ${imgsRes.status}`);

                const [prodJson, imgsJson] = await Promise.all([prodRes.json(), imgsRes.json()]);

                if (prodJson.success) setProduct(prodJson.data);
                else throw new Error(prodJson.message || 'No product');

                if (imgsJson.success) setExistingSecondaryImages(imgsJson.data);
                else setExistingSecondaryImages([]); // optional fallback

            } catch (err) {
                if (err.name !== 'AbortError') setError(err.message || 'Fetch error');
            } finally {
                setLoading(false);
            }
        };

        fetchDetailProduct();
        return () => controller.abort();
    }, [product_id]);

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div className="error">Lỗi: {error}</div>;
    if (!product) return <div>Không có dữ liệu sản phẩm</div>;
    
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
        <div className="w-full py-10">
          <div className="w-[1250px] flex gap-10 m-auto">
            <div className="flex bg-gray-100 w-[50%] border-gray-50 border p-5 rounded-[10px]  ">
              <div className="">
                <img
                  src={`http://localhost/computer-store/backend/uploads/products_img/${product.image_main}`}
                  alt={product.product_name}
                  title={product.product_name}
                  className='w-[500px] h-[500px] object-center'
                />
              </div>
              <div className="flex flex-col gap-1 h-full overflow-y-auto">
                {existingSecondaryImages.map((img) => (
                    
                  <img
                    src={`http://localhost/computer-store/backend/uploads/products_img/${img.image}`}
                    alt={img.product_name}
                    title={img.product_name}
                    className='w-[100px] h-[100px] object-cover cursor-pointer transition duration-200 rounded-sm'
                  ></img>
                ))}
              </div>
            </div>
            <div className="">
                <div className="flex flex-col gap-2">
                    <div className='flex flex-col gap-1 justify-start items-start'>
                        <p className='text-[2rem]'>{product.product_name}</p>
                        <div className="flex justify-start items-center gap-1">
                            <div className="">
                                <i class="ri-star-s-fill"></i>
                                <i class="ri-star-s-fill"></i>
                                <i class="ri-star-s-fill"></i>
                                <i class="ri-star-s-fill"></i>
                                <i class="ri-star-s-fill"></i>
                            </div>
                           <div className="">
                             <span className='text-stone-950 text-[14px]'>200 reviews</span>
                           </div>
                        </div>
                    </div>
                    <div className="w-full flex justify-start">
                        {saleClamped > 0 ? (
                            <>
                            <div className="flex flex-col gap-2 items-end justify-start">
                                <div className="flex justify-center items-center text-center gap-2 w-full">
                                    <span className="line-through text-gray-400 text-[14px]"> {formatter.format(price)} </span>
                                    <span className='bg-red-500 rounded-[7px] text-white px-1 text-[12px]'>{product.product_sale} <sup>%</sup></span> 
                                </div> 

                                <div className="w-full">
                                    <span className='text-[24px] font-medium'>{formatter.format(discounted)}</span>
                                </div>
                            </div>
                            </>
                        ) : (
                            <span>{formatter.format(price)}</span>
                        )}
                    </div>
                    {/* <div className=""></div> */}
                </div>
            </div>
          </div>
        </div>
      </>
    );
}

export default Detail;