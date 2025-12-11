import { NavLink } from "react-router-dom";

function Home() {
    

    return (
        <>

        <ul>
            <li><NavLink to='/'>Home</NavLink></li>
            <li><NavLink to='/manufacturers'>Manufacturers</NavLink></li>
            <li><NavLink to='/products'>Products</NavLink></li>
            <li><NavLink to='/users'>Users</NavLink></li>
            <li><NavLink to='/categories'>Categories</NavLink></li>
        </ul>

        
        </>
    );
}

export default Home;