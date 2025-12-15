function SumController() {
    return (
        <>
        {/* Tạm thời để dữ liệu tĩnh để demo UI */}
            <div id="controller" className="flex fixed z-10 py-5 px-25 justify-between items-center bottom-0 w-full bg-white shadow-2xl">
                <div className="">
                    <p>Total selected products: <span>2</span></p>
                </div>
                    <div id="sum" className="flex gap-10 justify-between items-center">
                        <p className="text-xl">Total Amount: <span className="text-xl text-red-500 font-bold">$100</span></p>
                        <button className="text-xl bg-red-600 text-white font-bold px-4 py-1 cursor-pointer rounded-2xl hover:opacity-70">Payment</button>
                    </div>
            </div>
        </>
    );
}

export default SumController;