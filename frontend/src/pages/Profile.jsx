import { useContext } from "react";
import UserContext from "../context/UserContext";

function Profile() {
    const { currentUser, logout } = useContext(UserContext);

    if (!currentUser) {
        return (
            <div>
                <h1>Please log in to see your profile.</h1>
            </div>
        );
    }

    return (
        <>
        <div>
            <h1>Profile</h1>
            <p><strong>Username:</strong> {currentUser.username}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Phone:</strong> {currentUser.phone}</p>
            <p><strong>Address:</strong> {currentUser.address}</p>
            <p><strong>Role:</strong> {currentUser.role}</p>
            {currentUser.avata && (
                <div>
                    <strong>Avatar:</strong>
                    <img src={currentUser.avata} alt="User avatar" style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
                </div>
            )}
        </div>

        <button onClick={logout}>Logout</button>
    </>
    );
}

export default Profile;