import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const AdminRegister = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        adminSecret: ''
    });
    const { adminRegister } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const { username, email, password, confirmPassword, adminSecret } = formData;

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
        }

        setIsLoading(true);
        try {
            await adminRegister({ username, email, password, adminSecret });
            toast.success('Admin authorization established!');
            navigate('/admin');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
                <div>
                    <h2 className="mt-2 text-center text-3xl font-extrabold text-white">
                        Create Admin Node
                    </h2>
                    <p className="mt-2 text-center text-sm text-purple-400 font-medium">
                        Requires verified platform secret key.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                            <input
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={onChange}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Email address</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={onChange}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                minLength="6"
                                value={password}
                                onChange={onChange}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                minLength="6"
                                value={confirmPassword}
                                onChange={onChange}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-colors"
                            />
                        </div>
                        <div className="pt-2">
                            <label className="block text-sm font-bold text-purple-400 mb-1 border-t border-gray-700 pt-4">Admin Secret Code</label>
                            <input
                                name="adminSecret"
                                type="password"
                                required
                                placeholder="Enter platform secret..."
                                value={adminSecret}
                                onChange={onChange}
                                className="appearance-none relative block w-full px-3 py-2 border border-purple-500/50 bg-purple-900/20 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-900 transition-colors disabled:opacity-70"
                        >
                            {isLoading ? 'Processing...' : 'Provision Admin Account'}
                        </button>
                    </div>
                    
                    <div className="text-center mt-4">
                        <Link to="/admin/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                            Already have an admin node? Sign in here.
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminRegister;
