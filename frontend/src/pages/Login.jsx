import { NavLink } from 'react-router-dom';
import '../styles/login.css';
function Login() {
    return (

        <>
            <div className="w-full mt-10">
                <form className="flex w-[80%] bg-gray-100 m-auto py-10 px-20 rounded-[15px] gap-15">
                    <div className="flex flex-col w-[400px] gap-3">
                        <div className="">
                            <h1 className='text-[30px] font-bold'>Welcome Back</h1>
                            <span className='text-gray-800'>Lorem ipsum dolor sit amet consectetur adipisicing elit.</span>
                        </div>
                        <div className="w-full mt-4 flex flex-col gap-1.5 ">
                            <label className='text-gray-800 text-[15px]' htmlFor="">Email</label>
                            <div className="relative w-full bg-white flex justify-start items-center px-3 gap-2 rounded-[20px]"><i className="ri-mail-fill text-stone-700"></i> <input className='w-full py-2.5 outline-0' type="text" placeholder='Email' required/></div>
                        </div>
                        <div className="w-full mt-4 flex flex-col gap-1.5 ">
                            <label className='text-gray-800 text-[15px]' htmlFor="">Password</label>
                            <div className="relative w-full bg-white flex justify-start items-center px-3 gap-2 rounded-[20px]"><i className="ri-lock-fill text-stone-700"></i><input className='w-full py-2.5 outline-0' type="password" placeholder='Password' required/><i class="cursor-pointer ri-eye-off-fill"></i></div>
                        </div>
                        <div className="flex w-[400px] justify-between mt-2">
                            <div className="flex justify-center items-center gap-1">
                                <input className='cursor-pointer checkbox' type="checkbox" />
                                <label className='text-[16px]' htmlFor="">Remenber Me</label>
                            </div>
                            <NavLink className="text-[16px] transition duration-300 hover:underline">Forgot Password?</NavLink>
                        </div>
                        <div className="w-full flex flex-col justify-center items-center mt-5 gap-5">
                            <button className='btn bg-black w-full text-white p-2 rounded-[20px] cursor-pointer transition duration-500 hover:opacity-70'> Login <i className="arrow transition duration-200 ri-arrow-right-line"></i></button>
                            <NavLink>Don't have an account?</NavLink>
                        </div>
                    </div>
                    <div className="w-full relative border-l border-gray-500 px-4">
                        <div className="flex flex-col w-full gap-2">
                            <div className="mb-1">
                                <h1 className='text-blue-black text-[30px] font-bold'>Lorem ipsum</h1>
                                <p className='text-stone-700'>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Laudantium, dignissimos.</p>
                            </div>
                            <div className="flex gap-3">
                                <button className='btn-visit px-10 py-1 bg-black rounded-2xl text-white cursor-pointer'>Visit</button>
                                <button className='px-10 py-1 border border-gray-300 rounded-2xl cursor-pointer'>Contact</button>
                            </div>
                        </div>
                        <div className="flex mt-5 items-center gap-2 w-full justify-center">
                            <p className='w-[100px] h-0.5 bg-gray-300'></p>
                            <span className='text-stone-600'>Or sign with</span>
                            <p className='w-[100px] h-0.5 bg-gray-300'></p>
                        </div>
                        <div className="flex w-full justify-center items-center flex-col gap-4 mt-4">
                            <button className='w-[400px] py-2 px-5.5 gap-2 bg-white rounded-[25px] shadow-md text-[16px] flex items-center cursor-pointer duration-300 transition hover:opacity-55'><i className="text-[24.5px] ri-google-fill"></i> Sign in with Google</button>
                            <button className='w-[400px] py-2 px-5.5 gap-2 bg-white rounded-[25px] shadow-md text-[16px] flex items-center cursor-pointer duration-300 transition hover:opacity-55'><i className="text-[24.5px] ri-facebook-circle-fill"></i> Sign in with Facebook</button>
                            <button className='w-[400px] py-2 px-5.5 gap-2 bg-white rounded-[25px] shadow-md text-[16px] flex items-center cursor-pointer duration-300 transition hover:opacity-55'><i className="text-[24.5px] ri-apple-fill"></i> Sign in Apple Secure ID</button>
                        </div>
                        <div className="flex w-full absolute bottom-0 justify-between items-center">
                            <p className='text-[14px] text-gray-600'>Privacy Pilocy</p>
                            <p className='text-[14px] text-gray-600'><sup>&copy;</sup>Copyright @Hasekimagru 2025</p>
                        </div>
                    </div>

                </form> 
            </div>
        </>
    );
}

export default Login;