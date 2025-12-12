import { useState } from 'react';
import API from '../api/api';
import '../styles/register.css';
function Register() {
    const inputStyle = "border boder-stone-900";

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [gender, setGender] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleRegister(e) {
        e.preventDefault();
        setLoading(true);
        setMessage("");


        try{
            const res = await API.post("/register", {
                username, 
                email,
                password,
                phone,
                address
            });

            setMessage("Register successfully!");
            setLoading(false);

        } catch(err) {
            setLoading(false);
            if(err.response?.data?.error?.code === "ER_DUP_ENTRY") {
                setMessage("Username existed!");
            } else {
                setMessage("Register Error!");
            }
        }
    }


    return (
        <>
         <form onSubmit={handleRegister} className="flex flex-col p-2 gap-2 w-[400px]">
            <label htmlFor="username">Username</label>
            <input className={inputStyle} type="text" placeholder="username" name="username" value={username} onChange={(e) =>setUsername(e.target.value)}/>

            <label htmlFor="email">Email</label>
            <input className={inputStyle} type="text" placeholder="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />

            <label htmlFor="password">password</label>
            <input className={inputStyle} type="password" placeholder="Password" name="password" value={password} onChange={(e) => setPassword(e.target.value)}/>

            <label htmlFor="phone">phone</label>
            <input className={inputStyle} type="number" placeholder="Phone Number" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)}/>

            <label htmlFor="address">address</label>
            <input className={inputStyle} type="text" placeholder="Address" name="address" value={address} onChange={(e) => setAddress(e.target.value)}/>

            <label htmlFor="gender">gender</label>
            <select name="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="male">Male</option>
                <option value="female">female</option>
                <option value="noreveal">Không muốn nói</option>
            </select>

            <button type='submit'>Sign Up</button>
         </form>
        
        </>
    );
}

export default Register;

