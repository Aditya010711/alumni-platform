import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Home = () => {
    const { user } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-3xl px-4"
            >
                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-6 transition-colors">
                    Connect with Your <span className="text-primary-600 dark:text-primary-500 transition-colors">Alumni Network</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed transition-colors">
                    The centralized platform to discover, connect, and collaborate with graduates from your institution.
                    Grow your professional network today.
                </p>

                {user ? (
                    <div className="flex flex-col flex-wrap sm:flex-row gap-4 justify-center">
                        <Link
                            to="/feed"
                            className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-colors text-lg"
                        >
                            Networking Feed
                        </Link>
                        <Link
                            to="/jobs"
                            className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-lg"
                        >
                            Job Matches
                        </Link>
                        <Link
                            to="/directory"
                            className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-lg"
                        >
                            Browse Directory
                        </Link>
                        <Link
                            to="/profile"
                            className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-lg"
                        >
                            Update Profile
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/register"
                            className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 transition-colors text-lg"
                        >
                            Join the Network
                        </Link>
                        <Link
                            to="/login"
                            className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-lg"
                        >
                            Sign In
                        </Link>
                    </div>
                )}
            </motion.div>


        </div>
    );
};

export default Home;
