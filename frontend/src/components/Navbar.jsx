import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(
        localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
    const [profilePic, setProfilePic] = useState(null);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    useEffect(() => {
        if (user) {
            const fetchProfile = async () => {
                try {
                    const res = await api.get('/profiles/me');
                    if (res.data && res.data.profilePicture) {
                        setProfilePic(res.data.profilePicture);
                    }
                } catch (error) {
                    console.log('No profile picture set yet');
                }
            };
            fetchProfile();
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 transition-colors duration-200">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-xl font-bold text-primary-600 dark:text-primary-400 tracking-tight">
                            Alumni<span className="text-gray-900 dark:text-gray-100">Connect</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-full transition-colors"
                            aria-label="Toggle Dark Mode"
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>

                        {user ? (
                            <>
                                <Link to="/feed" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
                                    Feed
                                </Link>
                                <Link to="/jobs" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                    Jobs
                                </Link>
                                <Link to="/directory" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                    Directory
                                </Link>
                                <Link to="/messages" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                    Messages
                                </Link>
                                <div className="h-6 w-px bg-gray-200 dark:bg-gray-600 mx-1"></div>
                                <Link to="/profile" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">
                                    {profilePic ? (
                                        <img
                                            src={`http://localhost:5000${profilePic}`}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 bg-primary-100 text-primary-600 dark:bg-gray-700 dark:text-primary-400 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                                            {user.username[0]}
                                        </div>
                                    )}
                                    <span className="text-sm font-medium hidden sm:block">
                                        {user.username}
                                    </span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="ml-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors shadow-sm"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors shadow-sm"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
