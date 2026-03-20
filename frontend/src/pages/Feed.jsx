import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import { motion } from 'framer-motion';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState(null);

    const fetchPosts = useCallback(async (pageNum = 1) => {
        setLoading(true);
        try {
            const res = await api.get(`/posts?page=${pageNum}&limit=10`);

            if (pageNum === 1) {
                setPosts(res.data.posts || []);
            } else {
                setPosts(prev => [...prev, ...(res.data.posts || [])]);
            }
            setTotalPages(res.data.pages || 1);
            setPage(pageNum);
            setError(null);
        } catch (err) {
            setError('Failed to load feed');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts(1);
    }, [fetchPosts]);

    const handleLoadMore = () => {
        if (page < totalPages) {
            fetchPosts(page + 1);
        }
    };

    const handlePostCreated = (newPost) => {
        setPosts(prev => [newPost, ...prev]);
    };

    const handlePostUpdated = (postId, updates) => {
        if (updates.newPost) {
            // It's a share, add to top
            setPosts(prev => [updates.newPost, ...prev]);
        } else {
            // It's an update to an existing post (e.g., comments)
            setPosts(prev => prev.map(p => p._id === postId ? { ...p, ...updates } : p));
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 transition-colors">Networking Feed</h1>

            <CreatePost onPostCreated={handlePostCreated} />

            {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 border border-red-200 dark:border-red-800 transition-colors">{error}</div>}

            <div className="space-y-6">
                {posts.map((post) => (
                    <PostCard
                        key={post._id}
                        post={post}
                        onPostUpdated={handlePostUpdated}
                    />
                ))}

                {posts.length === 0 && !loading && !error && (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors">
                        <p className="text-gray-500 dark:text-gray-400">No posts yet. Be the first to share something!</p>
                    </div>
                )}
            </div>

            {loading && (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
                </div>
            )}

            {page < totalPages && !loading && (
                <div className="text-center mt-8">
                    <button
                        onClick={handleLoadMore}
                        className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
                    >
                        Load More Posts
                    </button>
                </div>
            )}
        </div>
    );
};

export default Feed;
