import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { io } from 'socket.io-client';

const Messages = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [conversations, setConversations] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [onlineUsers, setOnlineUsers] = useState([]);
    
    // Search states
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const socket = useRef();
    const scrollRef = useRef();

    // Check for an incoming direct message intent
    useEffect(() => {
        if (location.state?.startChatWith) {
            const partner = location.state.startChatWith;
            const existing = conversations.find(c => c.partner?._id === partner._id);

            if (existing) {
                setCurrentChat(existing);
            } else {
                const tempChat = {
                    _id: 'temp-' + Date.now(),
                    partner: partner,
                    lastMessage: null
                };
                setConversations(prev => [tempChat, ...prev]);
                setCurrentChat(tempChat);
            }

            // Clear router state to prevent loop on refresh
            navigate('/messages', { replace: true });
        }
    }, [location.state, conversations, navigate]);

    // Handle user search
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }
        const timeoutId = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await api.get(`/profiles?search=${searchTerm}&limit=10`);
                setSearchResults(res.data.profiles || []);
            } catch (err) {
                console.error(err);
            } finally {
                setIsSearching(false);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleStartChat = (profile) => {
        const partner = {
            _id: profile.user._id || profile.user,
            username: profile.user?.username || `${profile.firstName} ${profile.lastName}`,
            profilePicture: profile.profilePicture
        };
        const existing = conversations.find(c => c.partner?._id === partner._id);

        if (existing) {
            setCurrentChat(existing);
        } else {
            const tempChat = {
                _id: 'temp-' + Date.now(),
                partner: partner,
                lastMessage: null
            };
            setConversations(prev => [tempChat, ...prev]);
            setCurrentChat(tempChat);
        }
        setSearchTerm('');
        setSearchResults([]);
    };

    // No changes needed right now. Actually, if we just let the Global listener trigger toasts
    // when *not* on the /messages route, we don't need to lift the entire socket state to context.
    // It's technically 2 websocket connections, but socket.io is extremely lightweight. It works perfectly.
    // Initialize Socket
    useEffect(() => {
        if (user) {
            socket.current = io(import.meta.env.VITE_API_URL || 'https://alumni-platform-rwbo.onrender.com', {
                query: { userId: user.id },
            });

            socket.current.on('getOnlineUsers', (users) => {
                setOnlineUsers(users);
            });

            socket.current.on('newMessage', (message) => {
                // If the message belongs to the currently open chat, append it visually
                setMessages((prev) => [...prev, message]);

                // Update conversation list with the new message preview
                setConversations(prev => prev.map(c =>
                    c.partner._id === message.sender ? { ...c, lastMessage: message } : c
                ));
            });
        }
        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [user]);

    // Fetch initial conversations
    useEffect(() => {
        const getConversations = async () => {
            try {
                const res = await api.get('/messages/conversations');
                setConversations(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        getConversations();
    }, []);

    // Fetch messages when a chat is clicked
    useEffect(() => {
        const getMessages = async () => {
            if (!currentChat) return;
            try {
                const res = await api.get(`/messages/${currentChat.partner._id}`);
                setMessages(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        getMessages();
    }, [currentChat]);

    // Auto-scroll to latest message
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentChat) return;

        try {
            const res = await api.post(`/messages/${currentChat.partner._id}`, {
                text: newMessage,
            });

            // Optimistically update UI
            setMessages([...messages, res.data]);
            setNewMessage('');

            // Update conversation list preview
            setConversations(prev => prev.map(c =>
                c.partner._id === currentChat.partner._id ? { ...c, lastMessage: res.data } : c
            ));

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="flex bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 h-[calc(100vh-8rem)] overflow-hidden">
            {/* Left Sidebar - Conversations */}
            <div className="w-1/3 border-r border-gray-100 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800 relative">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Messages</h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto relative flex flex-col">
                    {/* Search Results Overlay */}
                    {searchTerm.trim() && (
                        <div className="absolute inset-0 bg-white dark:bg-gray-800 z-10 overflow-y-auto">
                            {isSearching ? (
                                <p className="text-center text-gray-500 text-sm mt-4">Searching...</p>
                            ) : searchResults.length > 0 ? (
                                searchResults.map(profile => (
                                    <div
                                        key={profile._id}
                                        onClick={() => handleStartChat(profile)}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer border-b border-gray-50 dark:border-gray-700/50"
                                    >
                                        {profile.profilePicture ? (
                                            <img src={`https://alumni-platform-rwbo.onrender.com${profile.profilePicture}`} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex justify-center items-center font-bold text-sm">
                                                {profile.firstName?.[0] || 'U'}{profile.lastName?.[0] || 'S'}
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{profile.user?.username || `${profile.firstName} ${profile.lastName}`}</h4>
                                            <p className="text-xs text-gray-500">{profile.role || 'Alumni'}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 text-sm mt-4">No users found.</p>
                            )}
                        </div>
                    )}

                    {/* Active Now Section */}
                    {!searchTerm.trim() && (
                        <div className="p-3 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/20">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Active Now</h3>
                            <div className="flex gap-4 overflow-x-auto pb-2 px-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                {conversations.filter(c => onlineUsers.includes(c.partner._id)).length > 0 ? (
                                    conversations.filter(c => onlineUsers.includes(c.partner._id)).map(c => (
                                        <div 
                                            key={`active-${c.partner._id}`} 
                                            onClick={() => setCurrentChat(c)}
                                            className="flex flex-col items-center gap-1 min-w-[3.5rem] max-w-[4rem] cursor-pointer snap-start"
                                        >
                                            <div className="relative">
                                                {c.partner.profilePicture ? (
                                                    <img src={`https://alumni-platform-rwbo.onrender.com${c.partner.profilePicture}`} className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-800" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex justify-center items-center font-bold border-2 border-white dark:border-gray-800">
                                                        {c.partner.username[0].toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                                            </div>
                                            <span className="text-xs text-gray-600 dark:text-gray-300 truncate w-full text-center">{c.partner.username.split(' ')[0]}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 px-2 italic">0 active</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-2">
                    {conversations.length === 0 ? (
                        <p className="text-center text-gray-500 text-sm mt-4">No conversations yet. Search above to start chatting!</p>
                    ) : (
                        conversations.map((c) => (
                            <div
                                key={c._id}
                                onClick={() => setCurrentChat(c)}
                                className={`flex items-center gap-3 p-3 mb-2 rounded-lg cursor-pointer transition-colors ${currentChat?._id === c._id ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                                    }`}
                            >
                                <div className="relative">
                                    {c.partner.profilePicture ? (
                                        <img src={`https://alumni-platform-rwbo.onrender.com${c.partner.profilePicture}`} alt="" className="w-12 h-12 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex justify-center items-center font-bold">
                                            {c.partner.username[0].toUpperCase()}
                                        </div>
                                    )}
                                    {onlineUsers.includes(c.partner._id) && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">{c.partner.username}</h4>
                                    <p className="text-sm text-gray-500 truncate">{c.lastMessage?.text || "Started a conversation"}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                </div>
            </div>

            {/* Right Side - Chat Box */}
            <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900/50">
                {currentChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-3">
                            {currentChat.partner.profilePicture ? (
                                <img src={`https://alumni-platform-rwbo.onrender.com${currentChat.partner.profilePicture}`} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex justify-center items-center font-bold">
                                    {currentChat.partner.username[0].toUpperCase()}
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">{currentChat.partner.username}</h3>
                                <p className="text-xs text-green-500">
                                    {onlineUsers.includes(currentChat.partner._id) ? "Online" : "Offline"}
                                </p>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {messages.map((m) => {
                                const isMe = m.sender === (user._id || user.id);
                                const senderName = isMe ? (user.username || "You") : currentChat.partner.username;

                                return (
                                    <div key={m._id} ref={scrollRef} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <span className="text-xs text-gray-500 mb-1 mx-1.5">{senderName}</span>
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none shadow-sm'
                                            }`}>
                                            <p className="break-words">{m.text}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-primary-600 hover:bg-primary-700 text-white rounded-full px-6 py-2 font-medium transition-colors disabled:opacity-50"
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <span className="text-6xl mb-4">💬</span>
                        <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">Your Messages</h3>
                        <p>Select a conversation or start a new one.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
