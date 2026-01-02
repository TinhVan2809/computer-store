import { NavLink } from 'react-router-dom';
import '../styles/users.css';

function Login() {
    return (
        <div className="w-full mt-10 px-6">
            <div className="max-w-xl mx-auto bg-white p-8 rounded shadow">
                <h1 className="text-2xl font-bold mb-4">Please log in</h1>
                <p className="text-gray-700 mb-6">You must be an admin to access this panel. If you already have credentials, sign in from the main site.</p>
                <div className="flex gap-3">
                    {/* Vite client env variables use import.meta.env */}
                    <a className="px-4 py-2 bg-blue-600 text-white rounded" href={import.meta.env.VITE_ADMIN_LOGIN || '/login'}>Admin Login</a>
                    <NavLink to="/" className="px-4 py-2 border rounded">Back to Home</NavLink>
                </div>
            </div>
        </div>
    );
}

export default Login;