import Products from "./Products";
import Banners from "../components/Banners";
import '../styles/home.css';
function Home() {

    return (

        <>
            <Banners /> 
            <div id="home" className="w-full px-10">
                <Products />
            </div>
            
        </>
    );
}

export default Home;