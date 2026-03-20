import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Jobs = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecommendedJobs = async () => {
            try {
                const res = await api.get('/posts/jobs/recommended?limit=20');
                setJobs(res.data);
                setError(null);
            } catch (err) {
                setError('Failed to load recommended jobs. Please complete your profile to see recommendations.');
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendedJobs();
    }, []);

    const handlePostUpdated = (postId, updates) => {
        setJobs(prev => prev.map(p => p._id === postId ? { ...p, ...updates } : p));
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">Recommended Jobs</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 transition-colors">
                AI powered recommendations based on your profile skills.
            </p>

            {error && (
                <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 p-4 rounded-lg mb-6 border border-amber-200 dark:border-amber-800 transition-colors">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    {jobs.map((job, index) => (
                        <motion.div
                            key={job._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                        >
                            {/* Match Score Badge */}
                            {job.matchScore !== undefined && (
                                <div className="absolute -top-3 -right-3 z-10">
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold border-2 shadow-sm ${job.matchScore >= 80 ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-800' :
                                            job.matchScore >= 50 ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-400 dark:border-amber-800' :
                                                'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                        }`}>
                                        {Math.round(job.matchScore)}% Match
                                    </div>
                                </div>
                            )}
                            <PostCard post={job} onPostUpdated={handlePostUpdated} />
                        </motion.div>
                    ))}

                    {jobs.length === 0 && !error && (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors">
                            <p className="text-gray-500 dark:text-gray-400">No recommended jobs found. Make sure you've added your skills to your profile!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Jobs;
