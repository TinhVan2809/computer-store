import { useState, useEffect } from "react";
import ProductList from '../components/products/ProductList';


function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    // pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12; // adjust as needed

   useEffect(() => {
    setLoading(true);

    const fetchProductsData = async () => {
        try{
            const response = await fetch('http://localhost/computer-store/backend/products/product_api_endpoint.php?action=getProducts');
            if(!response.ok) {
                throw new Error(`Error HTTP! status: ${response.status}`);
            }
            const data = await response.json();

            if(data.success) {
                setProducts(data.data);
            } else {
                throw new Error(data.message || "Can't get products list")
            }

        } catch(err) {
            setError(err.message);
            console.log('Error getting products.', err);

        } finally {
            setLoading(false);
        }
    }

    fetchProductsData();
   
   }, []);

   if(loading) {
    return <div>loading...</div>
   }

   if(error) {
    return <div>something went wrong: {error}</div>
   }

  // pagination calculations
  const totalItems = products.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if(page < 1) page = 1;
    if(page > totalPages) page = totalPages;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

    return (
        <>

            <ProductList 
                products={paginatedProducts}
            />

            {/* Pagination controls */}
            <div className="pagination flex justify-center gap-4 mt-5">
                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>Prev</button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
                  .map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      style={{ fontWeight: page === currentPage ? 'bold' : 'normal' }}
                    >
                      {page}
                    </button>
                  ))
                }

                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
            </div>
           
        </>
    );
}

export default Products;