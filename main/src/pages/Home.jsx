import { useContext } from "react";
import UserContext from "../context/AdminContext";
import "../styles/Home.css";

function Home() {
    const { currentUser, logout, loading } = useContext(UserContext);

    if (loading) {
        return <div className="container"><p>Loading...</p></div>;
    }

    return (
        <div className="container">
            <div className="admin-card">
                <h1>Admin Dashboard</h1>
                {currentUser ? (
                    <div className="admin-info">
                        <div className="info-item">
                            <label>Username:</label>
                            <p>{currentUser.username}</p>
                        </div>
                        <div className="info-item">
                            <label>Email:</label>
                            <p>{currentUser.email}</p>
                        </div>
                        <div className="info-item">
                            <label>Phone:</label>
                            <p>{currentUser.phone || "N/A"}</p>
                        </div>
                        <div className="info-item">
                            <label>Role:</label>
                            <p>{currentUser.role}</p>
                        </div>
                        <div className="info-item">
                            <label>Address:</label>
                            <p>{currentUser.address || "N/A"}</p>
                        </div>
                        <button className="logout-btn" onClick={logout}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <p>No user data available</p>
                )}
            </div>
        </div>
    );
}

export default Home;