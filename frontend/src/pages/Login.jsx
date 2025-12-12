import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useContext } from 'react';
import API from '../api/api';
import UserContext from '../context/UserContext';
import '../styles/login.css';

function Login() {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [message, setMessage] = useState("");
   const [passwordVisible, setPasswordVisible] = useState(false);
    
   const { setCurrentUser } = useContext(UserContext);
   const navigate = useNavigate();

   const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    async function handleLogin(e) {
        e.preventDefault();
        try{
            await API.post("/login", {email, password});
            
            const userDataRes = await API.get("/userData");
            setCurrentUser(userDataRes.data.user);

            setMessage("Login successfully!");
            navigate('/'); // Redirect to homepage
        } catch(err) {
            setMessage("Wrong username or password!");
            console.error(err);
        }
    }



    return (

        <>
            <div className="w-full mt-10">
                <form onSubmit={handleLogin} className="flex w-[80%] bg-gray-100 m-auto py-10 px-20 rounded-[15px] gap-15">
                    <div className="flex flex-col w-[400px] gap-3">
                        <div className="">
                            <h1 className='text-[30px] font-bold'>Welcome Back</h1>
                            <span className='text-gray-800 text-[14px]'>Experience the ultimate platform for managing your products.</span>
                        </div>
                        <div className="w-full mt-4 flex flex-col gap-1.5 ">
                            <label className='text-gray-800 text-[15px]' htmlFor="">Email</label>
                            <div className="relative w-full bg-white flex justify-start items-center px-3 gap-2 rounded-[20px] shadow-xl">
                                <i className="ri-mail-fill text-stone-700"></i>
                                <input className='w-full py-2.5 outline-0' type="text" placeholder='Email' name='email' value={email} onChange={(e) => setEmail(e.target.value)} required/>
                            </div>
                        </div>
                        <div className="w-full mt-4 flex flex-col gap-1.5 ">
                            <label className='text-gray-800 text-[15px]' htmlFor="">Password</label>
                            <div className="relative w-full bg-white flex justify-start items-center px-3 gap-2 rounded-[20px] shadow-xl">
                                <i className="ri-lock-fill text-stone-700"></i>
                                <input className='w-full py-2.5 outline-0' type={passwordVisible ? "text" : "password"} placeholder='Password' id='password' name='password' value={password} onChange={(e) => setPassword(e.target.value)} required/>
                                <i className={passwordVisible ? "cursoer-pointer ri-eye-fill" : "cursor-pointer ri-eye-off-fill"} id='showPassword' onClick={togglePasswordVisibility}></i>
                            </div>
                        </div>
                        <div className="flex w-[400px] justify-between mt-2">
                            <div className="flex justify-center items-center gap-1">
                                <input className='cursor-pointer checkbox' type="checkbox" />
                                <label className='text-[16px]' htmlFor="">Remember Me</label>
                            </div>
                            <NavLink className="text-[16px] transition duration-300 hover:underline">Forgot Password?</NavLink>
                        </div>
                        <div className="w-full flex flex-col justify-center items-center mt-5 gap-5">
                            <button type='submit' className='btn bg-black w-full text-white p-2 rounded-[20px] cursor-pointer transition duration-500 hover:opacity-70'> Login <i className="arrow transition duration-200 ri-arrow-right-line"></i></button>
                            <NavLink to={'/register'}>Don't have an account? Sign up</NavLink>
                        </div>
                    </div>
                    <div className="w-full relative border-l border-gray-500 px-4">
                        <div className="flex flex-col w-full gap-2">
                            <div className="mb-1">
                                <h1 className='text-blue-black text-[30px] font-bold'>New Here?</h1>
                                <p className='text-stone-700 text-[14px]'>Join our community today to unlock exclusive features, resources, and premium support. It only takes a minute!</p>
                            </div>
                            <div className="flex gap-3">
                                <button className='btn-visit px-8 py-1 bg-black rounded-2xl text-white cursor-pointer'>Sign Up</button>
                                <button className='px-6 py-1 border border-gray-300 rounded-2xl cursor-pointer'>Learn More</button>
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
                        <div className="form-bottom flex w-full mt-5 justify-between items-center">
                            <p className='text-[14px] text-gray-600'>Privacy Policy</p>
                            <p className='text-[14px] text-gray-600'><sup>&copy;</sup>Copyright @Hasekimagru 2025</p>
                        </div>
                    </div>
                    
                </form> 
            </div>
        </>
    );
}

export default Login;