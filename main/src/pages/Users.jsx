import { useState, useEffect } from "react";
import UserForm from "../components/Users/UserForm";
import '../styles/users.css';

function Users() {
    const API_USERS = 'http://localhost/computer-store/backend/users/user_api_endpoint.php';
    const LIMIT = 10;

    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Fetch users (exposed so pagination buttons can call it)
    const fetchUsersData = async (page = 0) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_USERS}?action=getAll&page=${page + 1}&limit=${LIMIT}`);
            if(!response.ok) {
                throw new Error(`Error HTTP! status: ${response.status}`);
            }

            const data = await response.json();

            if(data.success) {
                setUsers(data.data);
                setTotalCount(data.total_items || 0);
                setCurrentPage(page);
            } else {
                throw new Error(data.message || "Can't get users list");
            }

        } catch(error) {
            setError(error.message);
            console.log('Error getting Users.', error);
        } finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        // initial fetch
        fetchUsersData(0);
    }, []);

    const handleAddClick = () => {
        setEditingUser(null);
        setShowForm(true);
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setShowForm(true);
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingUser(null);
        fetchUsersData(currentPage);
    };

    const handleDeleteClick = (user) => {
        setDeleteConfirm(user);
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirm) return;
        
        try {
            const response = await fetch(`${API_USERS}?action=deleteUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `user_id=${deleteConfirm.user_id}`
            });

            const result = await response.json();
            if (result.success) {
                setDeleteConfirm(null);
                fetchUsersData(currentPage);
            } else {
                alert('Error deleting user: ' + (result.message || 'Unknown error'));
            }
        } catch (err) {
            alert('Error deleting user: ' + err.message);
            console.error('Error:', err);
        }
    };

    const totalPages = Math.max(1, Math.ceil(totalCount / LIMIT));

    return (
        <>
        <div className="users-page p-4 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Users Management</h1>
                <button
                    onClick={handleAddClick}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    + Add User
                </button>
            </div>

            {showForm && (
                <div className="mb-6">
                    <button
                        onClick={() => {
                            setShowForm(false);
                            setEditingUser(null);
                        }}
                        className="text-sm text-blue-500 hover:underline mb-3"
                    >
                        ← Back to list
                    </button>
                    <UserForm 
                        onSuccess={handleFormSuccess}
                        editingUser={editingUser}
                    />
                </div>
            )}

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-sm">
                        <p className="mb-4 font-semibold">Delete user "{deleteConfirm.username}"?</p>
                        <p className="text-sm text-gray-600 mb-6">This action cannot be undone.</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!showForm && (
                <>
                    {loading && <div className="text-center py-4">Loading users...</div>}
                    {error && <div className="p-4 bg-red-100 text-red-700 rounded">Error: {error}</div>}

                    {!loading && !error && users.length > 0 && (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-3 text-left">Avatar</th>
                                            <th className="p-3 text-left">Username</th>
                                            <th className="p-3 text-left">Email</th>
                                            <th className="p-3 text-left">Phone</th>
                                            <th className="p-3 text-left">Role</th>
                                            <th className="p-3 text-left">Gender</th>
                                            <th className="p-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u.user_id} className="border-b hover:bg-gray-50">
                                                <td className="p-3">
                                                    {u.avata == null ? (
                                                        u.role === 'admin' ? 
                                                            <i className="ri-user-2-fill"></i> : 
                                                            <i className="ri-user-fill"></i>
                                                    ) : (
                                                        <img  
                                                            src={`http://localhost/computer-store/backend/uploads/users/${u.avata}`} 
                                                            alt={u.username} 
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    )}
                                                </td>
                                                <td className="p-3">{u.username}</td>
                                                <td className="p-3 text-sm text-gray-600">{u.email}</td>
                                                <td className="p-3 text-sm">{u.phone || '-'}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                                                        u.role === 'admin' 
                                                            ? 'bg-purple-100 text-purple-700' 
                                                            : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-sm">{u.gender || '-'}</td>
                                                <td className="p-3 text-center">
                                                    <button
                                                        onClick={() => handleEditClick(u)}
                                                        className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 mr-2"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(u)}
                                                        className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination controls */}
                            <div className="flex items-center justify-center gap-3 mt-6">
                                <button 
                                    className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50" 
                                    disabled={currentPage === 0} 
                                    onClick={() => fetchUsersData(currentPage - 1)}
                                >
                                    Prev
                                </button>
                                <span>Page {currentPage + 1} / {totalPages} (Total: {totalCount})</span>
                                <button 
                                    className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50" 
                                    disabled={currentPage >= totalPages - 1} 
                                    onClick={() => fetchUsersData(currentPage + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}

                    {!loading && !error && users.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No users found. <button onClick={handleAddClick} className="text-blue-500 hover:underline">Create one</button>
                        </div>
                    )}
                </>
            )}
        </div>
        </>
    );
}

export default Users;