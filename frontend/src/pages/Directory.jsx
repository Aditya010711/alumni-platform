import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';

const Directory = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [graduationYear, setGraduationYear] = useState('');
    const [industry, setIndustry] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState(null);

    const fetchProfiles = useCallback(async (pageNum = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pageNum,
                limit: 9,
            });
            if (searchTerm) params.append('search', searchTerm);
            if (graduationYear) params.append('graduationYear', graduationYear);
            if (industry) params.append('industry', industry);

            const res = await api.get(`/profiles?${params.toString()}`);

            if (pageNum === 1) {
                setProfiles(res.data.profiles || []);
            } else {
                setProfiles(prev => [...prev, ...(res.data.profiles || [])]);
            }
            setTotalPages(res.data.pages || 1);
            setPage(pageNum);
        } catch (err) {
            setError('Failed to fetch alumni profiles');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, graduationYear, industry]);

    useEffect(() => {
        // Debounce search and filters
        const timeoutId = setTimeout(() => {
            fetchProfiles(1);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, graduationYear, industry, fetchProfiles]);

    const handleLoadMore = () => {
        if (page < totalPages) {
            fetchProfiles(page + 1);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 transition-colors">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Alumni Directory</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Connect with graduates from your institution.</p>
                </div>

                {/* Filters Section */}
                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        className="w-full sm:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                    >
                        <option value="">All Years</option>
                        {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Industry/Company..."
                        className="w-full sm:w-48 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                    />
                </div>
            </div>

            {error && <div className="text-center py-4 mb-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 transition-colors">{error}</div>}

            {profiles.length === 0 && !loading ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No alumni profiles found matching your criteria.</p>
                </div>
            ) : (
                <>
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                        }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {profiles.map((profile) => {
                            // Extract user ID correctly whether populated or not
                            const targetUserId = profile.user?._id || profile.user;

                            return (
                                <motion.div
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                    key={profile._id}
                                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all flex flex-col h-full"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                                {profile.firstName} {profile.lastName}
                                            </h3>
                                            <p className="text-primary-600 dark:text-primary-400 font-medium text-sm mt-1">Class of {profile.graduationYear}</p>
                                        </div>
                                        {profile.profilePicture ? (
                                            <img src={`https://alumni-platform-rwbo.onrender.com${profile.profilePicture}`} alt="Avatar" className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-100 dark:border-gray-700" />
                                        ) : (
                                            <div className="w-12 h-12 bg-primary-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-bold text-xl uppercase">
                                                {profile.firstName[0]}{profile.lastName[0]}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 space-y-2 flex-grow">
                                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                                            <span className="font-semibold text-gray-800 dark:text-gray-200">Degree:</span> {profile.degree}
                                        </p>
                                        {profile.currentCompany && (
                                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                <span className="font-semibold text-gray-800 dark:text-gray-200">Company:</span> {profile.role ? `${profile.role} at ` : ''}{profile.currentCompany}
                                            </p>
                                        )}
                                        {profile.location && (
                                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                <span className="font-semibold text-gray-800 dark:text-gray-200">Location:</span> {profile.location}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mt-auto transition-colors">
                                        <div className="flex flex-wrap gap-3 items-center">
                                            {profile.linkedInUrl ? (
                                                <a
                                                    href={profile.linkedInUrl.startsWith('http') ? profile.linkedInUrl : `https://${profile.linkedInUrl}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                                >
                                                    LinkedIn
                                                </a>
                                            ) : null}

                                            {user && targetUserId && user.id !== targetUserId && (
                                                <button
                                                    onClick={() => navigate('/messages', {
                                                        state: {
                                                            startChatWith: {
                                                                _id: targetUserId,
                                                                username: `${profile.firstName} ${profile.lastName}`,
                                                                profilePicture: profile.profilePicture
                                                            }
                                                        }
                                                    })}
                                                    className="text-sm font-medium bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50 px-3 py-1.5 rounded-md transition-colors"
                                                >
                                                    Message
                                                </button>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            Joined {new Date(profile.user?.createdAt || Date.now()).toLocaleDateString()}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                                    <div className="flex justify-between">
                                        <div className="space-y-3 flex-1">
                                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                                        </div>
                                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                    </div>
                                    <div className="mt-6 space-y-3">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                                    </div>
                                    <div className="mt-8 flex justify-between">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {page < totalPages && !loading && (
                        <div className="text-center mt-10">
                            <button
                                onClick={handleLoadMore}
                                className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors shadow-sm"
                            >
                                Load More Profiles
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Directory;
