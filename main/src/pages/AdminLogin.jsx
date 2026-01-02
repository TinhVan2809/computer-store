import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../frontend/src/api/api";
import "../styles/AdminLogin.css";

function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await API.post("/login", { email, password }, { withCredentials: true });
            
            // Check if login was successful
            if (res.data.message === "Login success") {
                // Fetch user data to verify admin role
                const userData = await API.get("/userData", { withCredentials: true });
                
                if (userData.data.user && userData.data.user.role === 'admin') {
                    navigate('/');
                } else {
                    setError("You don't have admin access");
                    await API.post("/logout", {}, { withCredentials: true });
                }
            }
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <h1>Admin Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;
