export default function ProductError( {error} ) {

    const refresh = () => {
        document.location.reload();
    }
    return (
        <>
            <div className="w-100 m-auto mt-10 flex flex-col gap-2">
                <img className="w-20 h-auto" src="/public/images/error.png" />
                <p>Something went wrong <a className="text-red-500 underline" href="#">{error}</a></p>
                <span>Check your Internet or reload your page</span>
                <span className="text-sm text-gray-400">Note developer: Get started with node server.js and start Apache</span>
                <button onClick={refresh} className="w-20 bg-blue-500 text-white py-1 px-3 rounded-2xl cursor-pointer hover:opacity-70">Refresh</button>
            </div>
        </>
    );
} 
