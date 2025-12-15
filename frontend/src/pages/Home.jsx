import Products from "./Products";
import Banners from "../components/Banners";
function Home() {

    return (

        <>

            <Banners />

            <div id="home" className="w-full py-2 px-10">
                <Products />
            </div>
            
        </>
    );
}

export default Home;