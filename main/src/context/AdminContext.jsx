import { createContext, useState, useEffect } from "react";
import API from "../../../frontend/src/api/api";
import { useNavigate } from "react-router-dom";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    useEffect(() => {
        let mounted = true;
        const fetchInitialData = async () => {
            try {
                // Ensure cookies are sent when calling backend
                const res = await API.get("/userData", { withCredentials: true });
                const user = res.data.user;

                if (!mounted) return;

                // If not logged in or not admin, redirect to admin login
                if (!user || user.role !== 'admin') {
                    setCurrentUser(null);
                    navigate('/admin-login');
                    return;
                }

                setCurrentUser(user); // update user
            } catch (err) {
                console.log("Not logged in or failed to fetch userData", err);
                setCurrentUser(null);
                setError(err?.response?.data?.message || err.message || 'Failed to fetch user data');
                navigate('/admin-login');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchInitialData();

        return () => { mounted = false; };
    }, [navigate]); // Re-run if navigate changes


    const logout = async () => {
        try {
            await API.post("/logout", {}, { withCredentials: true });
            setCurrentUser(null);
            navigate('/admin-login'); // navigate to admin login route
        } catch (err) {
            console.error("Logout failed", err);
            setError(err?.response?.data?.message || err.message || 'Logout failed');
        }
    };

    return (
        <UserContext.Provider value={{ currentUser, setCurrentUser, logout, loading, error }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
