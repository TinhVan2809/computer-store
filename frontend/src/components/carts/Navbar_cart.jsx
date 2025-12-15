import { useNavigate } from 'react-router-dom';
import '../../styles/carts.css';
function NavbarCart() {
    const navigate = useNavigate();
    return (
        <>
            <header id='navbar_cart' className="w-full bg-white shadow-sm py-8.5 px-40 flex justify-between items-center"> 
                <div className="flex justify-between items-center gap-2">
                    <img className='h-10 w-10 rounded-[50%]' src="/public/images/logo.png" />
                    <span className='text-2xl text-stone-600'>Hasekimagru</span>
                </div>
                <div id="navbar_link" className="flex gap-10 justify-center items-center">
                    <div id="links" className="flex mr-10">
                        <ul className='flex gap-5'>
                            <li onClick={() => navigate('/')} className='cursor-pointer px-4 py-1 rounded-2xl hover:bg-black hover:text-white'>HOME</li>
                            <li className='cursor-pointer px-4 py-1 rounded-2xl hover:bg-black hover:text-white'>CONTACT</li>
                        </ul>
                    </div>
                    <div className="">
                        <i className="ri-user-line text-2xl cursor-pointer"></i>
                    </div>
                </div>
            </header>
        </>
    );
}

export default NavbarCart;