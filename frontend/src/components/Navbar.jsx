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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 transition-colors duration-200 relative z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Brand */}
                    <div className="flex items-center">
                        <Link to="/" className="text-xl font-bold text-primary-600 dark:text-primary-400 tracking-tight">
                            Alumni<span className="text-gray-900 dark:text-gray-100">Connect</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
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
                                            src={`https://alumni-platform-rwbo.onrender.com${profilePic}`}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 bg-primary-100 text-primary-600 dark:bg-gray-700 dark:text-primary-400 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                                            {user.username[0]}
                                        </div>
                                    )}
                                    <span className="text-sm font-medium">
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

                    {/* Mobile Menu Toggle Button */}
                    <div className="flex md:hidden items-center space-x-2">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 focus:outline-none"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-700 flex flex-col space-y-4">
                        {user ? (
                            <>
                                <Link onClick={() => setIsMobileMenuOpen(false)} to="/profile" className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
                                    {profilePic ? (
                                        <img src={`https://alumni-platform-rwbo.onrender.com${profilePic}`} className="w-10 h-10 rounded-full object-cover" alt="Profile" />
                                    ) : (
                                        <div className="w-10 h-10 bg-primary-100 text-primary-600 dark:bg-gray-700 dark:text-primary-400 rounded-full flex justify-center items-center font-bold uppercase">{user.username[0]}</div>
                                    )}
                                    <span className="font-semibold">{user.username}</span>
                                </Link>
                                <Link onClick={() => setIsMobileMenuOpen(false)} to="/feed" className="text-gray-600 dark:text-gray-300 font-medium">Feed</Link>
                                <Link onClick={() => setIsMobileMenuOpen(false)} to="/jobs" className="text-gray-600 dark:text-gray-300 font-medium">Jobs</Link>
                                <Link onClick={() => setIsMobileMenuOpen(false)} to="/directory" className="text-gray-600 dark:text-gray-300 font-medium">Directory</Link>
                                <Link onClick={() => setIsMobileMenuOpen(false)} to="/messages" className="text-gray-600 dark:text-gray-300 font-medium">Messages</Link>
                                <button
                                    onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                                    className="text-left text-red-500 font-medium mt-2"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link onClick={() => setIsMobileMenuOpen(false)} to="/login" className="text-gray-600 dark:text-gray-300 font-medium">Login</Link>
                                <Link onClick={() => setIsMobileMenuOpen(false)} to="/register" className="text-primary-600 dark:text-primary-400 font-medium">Sign Up</Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
