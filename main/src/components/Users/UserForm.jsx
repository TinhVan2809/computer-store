import { useState } from "react";

function UserForm({ onSuccess, editingUser = null }) {
    const API_USERS = 'http://localhost/computer-store/backend/users/user_api_endpoint.php';

    const [formData, setFormData] = useState({
        username: editingUser?.username || '',
        email: editingUser?.email || '',
        password: '',
        role: editingUser?.role || 'user',
        phone: editingUser?.phone || '',
        address: editingUser?.address || '',
        gender: editingUser?.gender || '',
    });

    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(
        editingUser?.avata 
            ? `http://localhost/computer-store/backend/uploads/users/${editingUser.avata}` 
            : null
    );
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            // Show preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const data = new FormData();
            
            if (editingUser) {
                data.append('user_id', editingUser.user_id);
                // Only add fields that changed or are being updated
                if (formData.username) data.append('username', formData.username);
                if (formData.email) data.append('email', formData.email);
                if (formData.password) data.append('password', formData.password);
                if (formData.role) data.append('role', formData.role);
                if (formData.phone) data.append('phone', formData.phone);
                if (formData.address) data.append('address', formData.address);
                if (formData.gender) data.append('gender', formData.gender);
                if (avatar) data.append('avata', avatar);
            } else {
                // For new user, all fields required
                data.append('username', formData.username);
                data.append('email', formData.email);
                data.append('password', formData.password);
                data.append('role', formData.role);
                if (formData.phone) data.append('phone', formData.phone);
                if (formData.address) data.append('address', formData.address);
                if (formData.gender) data.append('gender', formData.gender);
                if (avatar) data.append('avata', avatar);
            }

            const action = editingUser ? 'updateUser' : 'addUser';
            const response = await fetch(`${API_USERS}?action=${action}`, {
                method: 'POST',
                body: data
            });

            const result = await response.json();

            if (result.success) {
                setMessage(editingUser ? 'User updated successfully!' : 'User created successfully!');
                if (!editingUser) {
                    // Reset form for new user
                    setFormData({
                        username: '',
                        email: '',
                        password: '',
                        role: 'user',
                        phone: '',
                        address: '',
                        gender: '',
                    });
                    setAvatar(null);
                    setAvatarPreview(null);
                }
                // Call parent callback to refresh list
                if (onSuccess) onSuccess();
            } else {
                setError(result.message || 'Failed to save user');
            }
        } catch (err) {
            setError(err.message || 'Error saving user');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="user-form bg-white p-6 rounded-lg shadow-md max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">
                {editingUser ? 'Edit User' : 'Add New User'}
            </h2>

            {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{message}</div>}
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Avatar Upload */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium">Avatar</label>
                    {avatarPreview && (
                        <img 
                            src={avatarPreview} 
                            alt="Avatar preview" 
                            className="w-24 h-24 rounded object-cover"
                        />
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                    <p className="text-xs text-gray-500">Max 5MB. Formats: JPEG, PNG, WebP, GIF</p>
                </div>

                {/* Username */}
                <div>
                    <label className="block text-sm font-medium mb-1">Username *</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        placeholder="Min 3 characters"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="user@example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Password {!editingUser && '*'}
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required={!editingUser}
                        placeholder={editingUser ? "Leave blank to keep current" : "Min 6 characters"}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Role */}
                <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="0123456789"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Address */}
                <div>
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="User address"
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Gender */}
                <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <input
                        type="text"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        placeholder="Male, Female, Other, etc."
                        maxLength="20"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                        {loading ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default UserForm;
