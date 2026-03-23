import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // If the user clicks on their own ID, redirect to /profile
    useEffect(() => {
        if (currentUser && (currentUser.id === id || currentUser._id === id)) {
            navigate('/profile', { replace: true });
        }
    }, [id, currentUser, navigate]);

    const fetchProfileData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch profile
            const profileRes = await api.get(`/profiles/user/${id}`);
            const fetchedProfile = profileRes.data;
            setProfile(fetchedProfile);

            // Fetch user's posts
            if (fetchedProfile && fetchedProfile._id) {
                const postsRes = await api.get(`/posts/profile/${fetchedProfile._id}`);
                setPosts(postsRes.data || []);
            }
            
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load user profile');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const handlePostUpdated = (postId, updates) => {
        if (updates.newPost) {
            setPosts(prev => [updates.newPost, ...prev]);
        } else {
            setPosts(prev => prev.map(p => p._id === postId ? { ...p, ...updates } : p));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-500">
                <span className="text-6xl block mb-4">🤷‍♂️</span>
                <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">User Not Found</h2>
                <p>The profile you are looking for does not exist or has been removed.</p>
                <button onClick={() => navigate(-1)} className="mt-6 text-primary-600 font-medium hover:underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            {/* Profile Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
                <div className="bg-primary-600 dark:bg-primary-800 px-6 py-8 text-white relative">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {profile.profilePicture ? (
                            <img src={`https://alumni-platform-rwbo.onrender.com${profile.profilePicture}`} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 bg-white" />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-200 text-primary-600 dark:text-primary-800 flex items-center justify-center font-bold text-4xl border-4 border-white dark:border-gray-800">
                                {profile.firstName?.[0]}{profile.lastName?.[0]}
                            </div>
                        )}
                        <div className="text-center sm:text-left flex-1 mt-2 sm:mt-0">
                            <h1 className="text-3xl font-bold">{profile.firstName} {profile.lastName}</h1>
                            <p className="text-primary-100 font-medium mt-1">{profile.degree} • Class of {profile.graduationYear}</p>
                            {profile.currentCompany && (
                                <p className="text-primary-100 mt-1">{profile.role ? `${profile.role} at ` : ''}{profile.currentCompany}</p>
                            )}
                            {profile.location && (
                                <p className="text-primary-100 mt-1 flex items-center justify-center sm:justify-start gap-1">
                                    <span>📍</span> {profile.location}
                                </p>
                            )}
                        </div>
                        {currentUser && currentUser.id !== (profile.user?._id || profile.user) && (
                            <div className="mt-4 sm:mt-0">
                                <button
                                    onClick={() => navigate('/messages', {
                                        state: {
                                            startChatWith: {
                                                _id: profile.user?._id || profile.user,
                                                username: profile.user?.username || `${profile.firstName} ${profile.lastName}`,
                                                profilePicture: profile.profilePicture
                                            }
                                        }
                                    })}
                                    className="bg-white text-primary-700 px-6 py-2 rounded-full font-bold shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                                >
                                    <span>💬</span> Message
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="p-6 sm:p-8">
                    {profile.bio && (
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">About</h3>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{profile.bio}</p>
                        </div>
                    )}
                    
                    {profile.skills && profile.skills.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill, index) => (
                                    <span key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {profile.linkedInUrl && (
                        <div>
                            <a href={profile.linkedInUrl.startsWith('http') ? profile.linkedInUrl : `https://${profile.linkedInUrl}`} target="_blank" rel="noreferrer" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2">
                                <span>🔗</span> LinkedIn Profile
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* User's Posts Feed */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 transition-colors">Activity Feed</h2>
            <div className="space-y-6">
                {posts.map((post) => (
                    <PostCard
                        key={post._id}
                        post={post}
                        onPostUpdated={handlePostUpdated}
                    />
                ))}

                {posts.length === 0 && (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">This user hasn't posted or shared anything yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
