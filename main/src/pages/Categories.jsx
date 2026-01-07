import { useState, useEffect } from "react";

function Categories() {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    const API_CATE = 'http://localhost/computer-store/backend/categories/category_api_endpoint.php';
    const LIMIT = 10;


    const fetchCategoriesData = async (page = 0) => {
        setLoading(true);
        setError('');
        try{
            // Backend expects page (1-based) and limit
            const response = await fetch(`${API_CATE}?action=get&page=${page + 1}&limit=${LIMIT}`);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setCategories(Array.isArray(data.data) ? data.data : []);
                setTotalCount(Number(data.total_items) || 0);
                setCurrentPage(page);
            } else {
                setError(data.message || 'Failed to fetch categories');
            }

        } catch (err) {
            setError('Error connecting to server: ' + (err.message || err));
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {

        fetchCategoriesData(0);
    }, []); 

    if(loading) return <div>loading</div>
    if(error) return <div>Something went wrong</div>
    if(!categories) return <div>Categories empty</div>

    const totalPages = Math.ceil(totalCount / LIMIT);

    return (

        <>
    
        <div className="">
            <div className="">
                {categories.map((c) => (
                    <div className="" key={c.category_id}>
                        <p>{c.category_name}</p>
                    </div>
                ))}
            </div>
             {totalPages >= 1 && (
            <div className="pagination">
              <button
                disabled={currentPage === 0}
                onClick={() => fetchCategoriesData(currentPage - 1)}
              >
                Trang Trước
              </button>

              <span>
                Trang {currentPage + 1} / {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => fetchCategoriesData(currentPage + 1)}
              >
                Trang Sau
              </button>
            </div>
          )}
        </div>

        
        
        </>
    );
}

export default Categories;