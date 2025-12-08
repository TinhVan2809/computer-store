import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = 'http://localhost/computer-store/backend/products/product_api_endpoint.php';
function Detail() {
    const { product_id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!product_id) return;
        const controller = new AbortController();
        const fetchProduct = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}?action=getProductById&id=${encodeURIComponent(product_id)}`, {
            signal: controller.signal
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (json.success) {
            setProduct(json.data);
            } else {
            throw new Error(json.message || 'Không tìm thấy sản phẩm');
            }
        } catch (err) {
            if (err.name !== 'AbortError') setError(err.message);
        } finally {
            setLoading(false);
        }
        };

        fetchProduct();
        return () => controller.abort();
    }, [product_id]);

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div className="error">Lỗi: {error}</div>;
    if (!product) return <div>Không có dữ liệu sản phẩm</div>;
    
    
    return (

        <>
        <div className="">
            <div className="">
                <div className="">
                    <img src={`http://localhost/computer-store/backend/uploads/products_img/${product.image_main}`} alt={product.product_name} title={product.product_name} />
                </div>
            </div>    
        </div> 
        </>
    );
}

export default Detail;