import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const PostCard = ({ post, onPostUpdated }) => {
    const { user } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check if the current user profile ID is in the likes array.
    // If user's profile ID isn't directly easily available, we check lengths, 
    // or typically we'd return an isLiked boolean from the backend. 
    // Assuming backend returns post.likes as array of profile IDs.
    const hasLiked = post.likes.some(id => id.toString() === user?.profileId?.toString()
        || (typeof id === 'object' && id._id?.toString() === user?.profileId?.toString()));

    // As a fallback since we might not have `profileId` on the `user` context immediately,
    // let's just use optimistic UI and let the backend handle the toggle.
    const [liked, setLiked] = useState(false); // Can improve this initialization based on proper context
    const [likesCount, setLikesCount] = useState(post.likes.length);

    const handleLike = async () => {
        try {
            const res = await api.put(`/posts/${post._id}/like`);
            setLikesCount(res.data.length);
            setLiked(!liked);
        } catch (err) {
            toast.error('Failed to like post');
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await api.post(`/posts/${post._id}/comment`, { content: commentText });
            toast.success('Comment added');
            setCommentText('');
            if (onPostUpdated) {
                // Return updated comments array
                onPostUpdated(post._id, { comments: res.data });
            }
        } catch (err) {
            toast.error('Failed to add comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShare = async () => {
        try {
            const res = await api.post(`/posts/${post._id}/share`, {});
            toast.success('Post shared successfully');
            if (onPostUpdated && res.data) {
                // Pass new post object (res.data) to feed to append at top
                onPostUpdated(null, { newPost: res.data });
            }
        } catch (err) {
            console.error("Share error:", err.response || err);
            toast.error(err.response?.data?.message || 'Failed to share post');
        }
    };

    const renderPostContent = (p, isShared = false) => (
        <div className={isShared ? "border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-3 bg-gray-50 dark:bg-gray-700/50" : "mt-3"}>
            {isShared && (
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                    {p.author?.profilePicture ? (
                        <img src={`https://alumni-platform-rwbo.onrender.com${p.author.profilePicture}`} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                        <div className="w-8 h-8 bg-primary-100 dark:bg-gray-600 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                            {p.author?.firstName?.[0]}{p.author?.lastName?.[0]}
                        </div>
                    )}
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">{p.author?.firstName} {p.author?.lastName}</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">{p.author?.currentCompany ? `${p.author.role} at ${p.author.currentCompany}` : p.author?.degree}</p>
                    </div>
                </div>
            )}

            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{p.content}</p>

            {p.image && (
                <div className="mt-4 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                    <img src={`https://alumni-platform-rwbo.onrender.com${p.image}`} alt="Post content" className="w-full h-auto object-cover max-h-96" />
                </div>
            )}

            {p.type === 'job' && p.jobDetails && (
                <div className="mt-4 bg-primary-50 dark:bg-gray-700/50 border border-primary-100 dark:border-gray-600 p-4 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <div className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">💼 Job Opportunity</div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{p.jobDetails.title}</h4>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">{p.jobDetails.company} • {p.jobDetails.location}</p>
                    </div>
                    {p.jobDetails.link && (
                        <a
                            href={p.jobDetails.link.startsWith('http') ? p.jobDetails.link : `https://${p.jobDetails.link}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-primary-600 text-white px-5 py-2 rounded-full font-medium hover:bg-primary-700 transition shadow-sm text-center text-sm"
                        >
                            Apply Now
                        </a>
                    )}
                </div>
            )}

            {p.sharedPost && renderPostContent(p.sharedPost, true)}
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 sm:p-6 mb-6 transition-colors"
        >
            {/* Header */}
            <div className="flex flex-wrap justify-between items-start gap-2">
                <div className="flex items-center gap-3">
                    {post.author?.profilePicture ? (
                        <img src={`https://alumni-platform-rwbo.onrender.com${post.author.profilePicture}`} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-gray-100 dark:border-gray-700" />
                    ) : (
                        <div className="w-12 h-12 bg-primary-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-bold text-lg uppercase">
                            {post.author?.firstName?.[0]}{post.author?.lastName?.[0]}
                        </div>
                    )}
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">{post.author?.firstName} {post.author?.lastName}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-1">{post.author?.currentCompany ? `${post.author.role} at ${post.author.currentCompany}` : post.author?.degree}</p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
                    </div>
                </div>
                {post.type === 'job' && (
                    <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        Hiring
                    </span>
                )}
            </div>

            {/* Content */}
            {renderPostContent(post)}

            {/* Metrics */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                <span>{likesCount} Likes</span>
                <span>{post.comments?.length || 0} Comments</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
                <button
                    onClick={handleLike}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors font-medium text-sm
                        ${liked ? 'bg-primary-50 dark:bg-gray-700 text-primary-600 dark:text-primary-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                >
                    <span className="text-lg">{liked ? '👍' : '🤍'}</span> Like
                </button>
                <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 font-medium text-sm"
                >
                    <span className="text-lg">💬</span> Comment
                </button>
                <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 font-medium text-sm"
                >
                    <span className="text-lg">🔁</span> Share
                </button>
            </div>

            {/* Comments Section */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
                    >
                        <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-6">
                            <div className="flex-grow flex gap-2">
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-grow bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !commentText.trim()}
                                    className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition"
                                >
                                    Post
                                </button>
                            </div>
                        </form>

                        <div className="space-y-4">
                            {post.comments?.map((comment, index) => (
                                <div key={comment._id || index} className="flex gap-3">
                                    {comment.author?.profilePicture ? (
                                        <img src={`https://alumni-platform-rwbo.onrender.com${comment.author.profilePicture}`} alt="Avatar" className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1" />
                                    ) : (
                                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 mt-1">
                                            {comment.author?.firstName?.[0]}{comment.author?.lastName?.[0]}
                                        </div>
                                    )}
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl rounded-tl-none p-3 flex-grow">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                                {comment.author?.firstName} {comment.author?.lastName}
                                            </span>
                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default PostCard;
