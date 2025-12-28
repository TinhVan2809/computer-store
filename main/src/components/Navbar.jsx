import { NavLink, Link } from "react-router-dom";
import '../styles/navbar.css'
function Navbar() {
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
                    </ul>
                </nav>
                <div className="user-logout">
                    <Link><i class="ri-user-line"></i></Link>
                    <button>Logout</button>
                </div>
            </header>
        </>
    );
}

export default Navbar;