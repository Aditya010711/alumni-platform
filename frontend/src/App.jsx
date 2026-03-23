import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster, toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Directory from './pages/Directory';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Feed from './pages/Feed';
import Messages from './pages/Messages';
import Jobs from './pages/Jobs';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminLayout from './components/AdminLayout';

// Separate component for the global socket listener so it can use hooks safely inside AuthProvider
const GlobalSocketListener = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let socket;
    if (user) {
      socket = io(import.meta.env.VITE_API_URL || 'https://alumni-platform-rwbo.onrender.com', {
        query: { userId: user.id },
      });

      socket.on('newMessage', (message) => {
        // Check if user is already on the messages page
        const isMessagesPage = location.pathname === '/messages';

        // If they aren't on messages, OR if they are but not looking at this specific person
        if (!isMessagesPage) {
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      New Message Received!
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {message.text.substring(0, 30)}{message.text.length > 30 ? '...' : ''}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    navigate('/messages', {
                      state: {
                        startChatWith: {
                          _id: message.sender,
                          // We don't have username directly on message object easily without lookup, 
                          // but Messages.jsx will handle fetching the conversation layout.
                          username: "New Message",
                        }
                      }
                    });
                  }}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary-600 hover:text-primary-500 focus:outline-none"
                >
                  Reply
                </button>
              </div>
            </div>
          ), { duration: 5000 });
        }
      });
    }
    return () => {
      if (socket) socket.disconnect();
    };
  }, [user, location.pathname, navigate]);

  return null;
};

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
      <GlobalSocketListener />
      <Toaster position="top-right" />
      <Routes>
        {/* Admin Routes without Navbar */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<AdminDashboard />} />
        </Route>

        {/* Main App Routes with Navbar */}
        <Route path="/*" element={
          <>
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/directory"
            element={
              <ProtectedRoute>
                <Directory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <Jobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
              </Routes>
            </main>
          </>
        } />
      </Routes>
    </div>
  );
}

export default App;
