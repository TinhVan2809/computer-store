import Products from "./Products";
import Banners from "../components/Banners";
import '../styles/home.css';
import Footer from "../components/Footer";
function Home() {

    return (

        <>
            <Banners /> 

            <div id="home" className="w-full px-10">
                <Products />
            </div>

            <Footer />
            
        </>
    );
}

export default Home;