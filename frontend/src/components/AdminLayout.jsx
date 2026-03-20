import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            {/* Admin Sidebar */}
            <aside className="w-full md:w-64 bg-gray-900 text-white flex flex-col shadow-xl">
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-2xl font-bold text-white tracking-widest uppercase">Admin<span className="text-purple-500">Portal</span></h2>
                    <p className="text-xs text-gray-400 mt-1">Management Utilities</p>
                </div>
                
                <nav className="flex-1 py-4 flex flex-col gap-2 px-4">
                    <Link 
                        to="/admin" 
                        className={`px-4 py-3 rounded-lg transition-colors font-medium flex items-center gap-3 ${location.pathname === '/admin' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        Users Database
                    </Link>
                    {/* Add more admin links here sequentially */}
                </nav>
                
                <div className="p-4 border-t border-gray-800">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm"
                    >
                        Secure Logout
                    </button>
                    <Link to="/" className="w-full mt-2 flex items-center justify-center text-xs text-gray-400 hover:text-white transition-colors">
                        Return to Main App
                    </Link>
                </div>
            </aside>
            
            {/* Main Admin Content Area */}
            <main className="flex-1 bg-gray-50 min-h-screen overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
