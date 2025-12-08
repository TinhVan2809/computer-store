function ProductList( {products}) {

    return (
        <>
        <div className="w-full">
            <div className="w-full flex justify-center, items-centers gap-5">
                             {products.map((p) => {
                                const price = Number(p.product_price) || 0;
                                const sale = Number(p.product_sale) || 0;
                                const saleClamped = Math.max(0, Math.min(100, sale));
                                const discounted = Math.max(0, price * (1 - saleClamped / 100));
                                const formatter = new Intl.NumberFormat('en-EN', { style: 'currency', currency: 'USD' });

                                return (
                                    <div className="relative p-2 w-[200px] h-[280px] border-gray-200 border rounded-[5px] flex flex-col justify-between items-center text-center cursor-pointer transition duration-300 ease-in-out hover:-translate-y-1" key={p.product_id}>
                                        <img className="w-full h[250px] object-cover" src={`http://localhost/computer-store/backend/uploads/products_img/${p.image_main}`} alt={p.product_name} title={p.product_name} />
                                        <div className="min-w-0">
                                                <p className="truncate w-[150px]">{p.product_name}</p>
                                        </div>
                                        <div className="flex items-end justify-center gap-2">
                                            {saleClamped > 0 ? (
                                                <>
                                                    <span className="line-through text-gray-500 text-[14px]">
                                                        {formatter.format(price)}
                                                    </span>
                                                    <span>{formatter.format(discounted)}</span>
                                                </>
                                            ) : (
                                                <span>{formatter.format(price)}</span>
                                            )}
                                        </div>
                                        <div className="absolute top-0 right-0 bg-red-600 px-2 rounded-bl-md">
                                                <span className="text-[12px] text-white">{saleClamped} <sup>%</sup></span>
                                        </div>
                                    </div>
                                )
                             })}
            </div>
        </div>
        </>
    );
}

export default ProductList;