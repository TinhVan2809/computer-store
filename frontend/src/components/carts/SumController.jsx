function SumController( { totalPrice, selectedCount, onSelectAll, allItemsSelected, onCheckout } ) {
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

    return (
        <>
            <div id="controller" className="flex fixed z-10 py-5 px-25 justify-between items-center bottom-0 w-full bg-white shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            className="item-checkbox"
                            onChange={onSelectAll}
                            checked={allItemsSelected}
                        />
                        <label onClick={onSelectAll} className="cursor-pointer">Chọn tất cả</label>
                    </div>
                    <p>Total selected products: <span>({selectedCount})</span></p>
                </div>
                    <div id="sum" className="flex gap-10 justify-between items-center">
                        <p className="text-xl">Total Amount: <span className="text-xl text-red-500 font-bold">{formatter.format(totalPrice)}</span></p>
                        <button onClick={onCheckout} className="text-xl bg-red-600 text-white font-bold px-4 py-1 cursor-pointer rounded-2xl hover:opacity-70">Payment</button>
                    </div>
            </div>
        </>
    );
}

export default SumController;