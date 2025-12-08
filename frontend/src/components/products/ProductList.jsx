function ProductList( {products}) {

    return (
        <>
        <div className="">
            <div className="">
               {products.map((p) => (
                <div className="" key={p.product_id}>
                    <img src={`http://localhost/computer-store/backend/uploads/products_img/${p.image_main}`} alt={p.product_name} title={p.product_name} />
                    <div className="">
                        <p>{p.product_name}</p>
                    </div>
                    <div className="">
                         {new Intl.NumberFormat('en-EN', { style: 'currency', currency: 'USD' }).format(p.product_price)}
                    </div>
                </div>
               ))}
            </div>
        </div>
        </>
    );
}

export default ProductList;