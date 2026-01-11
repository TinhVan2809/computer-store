import Products from "./Products";
import Banners from "../components/Banners";
import '../styles/home.css';
import Footer from "../components/Footer";
import BestSell from "../components/bestSell/BestSell";

function Home() {

    return (

        <>
            <Banners /> 

            <div id="home" className="w-full px-10">
                <Products />

                <BestSell period="this_month" />
               
            </div>

            <Footer />
            
        </>
    );
}

export default Home;