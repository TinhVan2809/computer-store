import { createContext, useState, useEffect } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await API.get("/userData");
                setCurrentUser(res.data.user);
            } catch (error) {
                console.log("Not logged in", error); // This is expected if the user doesn't have a session cookie
                setCurrentUser(null);
            }
        };
        fetchUser();
    }, []);

    const logout = async () => {
        try {
            await API.post("/logout");
            setCurrentUser(null);
            navigate('/login'); // Navigate to home or login page after logout
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <UserContext.Provider value={{ currentUser, setCurrentUser, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
