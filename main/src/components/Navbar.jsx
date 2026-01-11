import { NavLink, Link } from "react-router-dom";
import UserContext from "../context/AdminContext";
import { useContext } from "react";
import '../styles/navbar.css'
function Navbar() {
   
    const { logout, currentUser } = useContext(UserContext);
    return (
        <>
            <header className="navbar-container">
                <nav>
                    <ul>
                        <li><NavLink to='/'>Home</NavLink></li>
                        <li><NavLink to='/manufacturers'>Manufacturers</NavLink></li>
                        <li><NavLink to='/products'>Products</NavLink></li>
                        <li><NavLink to='/users'>Users</NavLink></li>
                        <li><NavLink to='/categories'>Categories</NavLink></li>
                        <li><NavLink to='/vouchers'>Vouchers</NavLink></li>
                        <li><NavLink to='/orders'>Orders</NavLink></li>
                        <li><NavLink to='/banners'>Banners</NavLink></li>
                    </ul>
                </nav>
                <div className="user-logout">
                    <Link><i className="ri-user-line"></i></Link>
                    <button onClick={logout}>Logout</button>
                </div>
            </header>
        </>
    );
}

export default Navbar;