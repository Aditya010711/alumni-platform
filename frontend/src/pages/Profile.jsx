import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [profilePicture, setProfilePicture] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        graduationYear: '',
        degree: '',
        currentCompany: '',
        role: '',
        linkedInUrl: '',
        location: '',
        bio: '',
        skills: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/profiles/me');
                if (res.data) {
                    const profile = res.data;
                    setProfilePicture(profile.profilePicture || '');
                    setFormData({
                        firstName: profile.firstName || '',
                        lastName: profile.lastName || '',
                        graduationYear: profile.graduationYear || '',
                        degree: profile.degree || '',
                        currentCompany: profile.currentCompany || '',
                        role: profile.role || '',
                        linkedInUrl: profile.linkedInUrl || '',
                        location: profile.location || '',
                        bio: profile.bio || '',
                        skills: profile.skills ? profile.skills.join(', ') : '',
                    });
                }
            } catch (err) {
                // If 404, the user just doesn't have a profile yet, which is fine
                if (err.response?.status !== 404) {
                    toast.error('Failed to fetch profile data');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Convert skills string to array before sending
            const payload = { ...formData };
            if (payload.skills) {
                payload.skills = payload.skills.split(',').map(s => s.trim()).filter(s => s);
            }

            await api.post('/profiles', payload);
            toast.success('Profile updated successfully!');
            window.scrollTo(0, 0);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
            window.scrollTo(0, 0);
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('profilePicture', file);

        setUploading(true);

        try {
            const res = await api.post('/profiles/picture', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setProfilePicture(res.data.profilePicture);
            toast.success('Profile picture updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-500 dark:text-gray-400 text-xl transition-colors">Loading profile...</div>;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
                <div className="bg-primary-600 dark:bg-primary-800 px-6 py-8 text-white text-center relative transition-colors">
                    <div className="relative w-24 h-24 mx-auto mb-4 group cursor-pointer">
                        {profilePicture ? (
                            <img
                                src={`https://alumni-platform-rwbo.onrender.com${profilePicture}`}
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover shadow-md border-4 border-white dark:border-gray-800 transition-colors"
                            />
                        ) : (
                            <div className="w-full h-full bg-white dark:bg-gray-200 text-primary-600 dark:text-primary-800 rounded-full flex items-center justify-center font-bold text-4xl shadow-md border-4 border-white dark:border-gray-800 transition-colors">
                                {formData.firstName ? formData.firstName[0] : user?.username[0]?.toUpperCase()}
                                {formData.lastName ? formData.lastName[0] : ''}
                            </div>
                        )}
                        <label className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                            <span className="text-xs font-semibold">{uploading ? 'Uploading...' : 'Upload'}</span>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={handleImageUpload}
                                disabled={uploading}
                            />
                        </label>
                    </div>
                    <h1 className="text-3xl font-bold">{user?.username}'s Profile</h1>
                    <p className="text-primary-100 mt-1">{user?.email}</p>
                </div>

                <div className="p-4 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Graduation Year *</label>
                                <input
                                    type="number"
                                    name="graduationYear"
                                    value={formData.graduationYear}
                                    onChange={handleChange}
                                    required
                                    min="1900"
                                    max="2099"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Degree *</label>
                                <input
                                    type="text"
                                    name="degree"
                                    value={formData.degree}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. B.S. Computer Science"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Company</label>
                                <input
                                    type="text"
                                    name="currentCompany"
                                    value={formData.currentCompany}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Role</label>
                                <input
                                    type="text"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="City, Country"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LinkedIn URL</label>
                                <input
                                    type="text"
                                    name="linkedInUrl"
                                    value={formData.linkedInUrl}
                                    onChange={handleChange}
                                    placeholder="https://linkedin.com/in/username"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Short Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows="4"
                                maxLength="500"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none transition-colors"
                                placeholder="Tell the community a bit about yourself..."
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills (comma separated)</label>
                            <input
                                type="text"
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                placeholder="eg. React, Node.js, Python"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors mb-6"
                            />
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700 transition-colors">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-70 flex items-center"
                            >
                                {saving ? 'Saving...' : 'Save Profile Dashboard'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
