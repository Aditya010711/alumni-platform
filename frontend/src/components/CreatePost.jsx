import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const CreatePost = ({ onPostCreated }) => {
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isJobOffer, setIsJobOffer] = useState(false);
    const [jobDetails, setJobDetails] = useState({
        title: '',
        company: '',
        location: '',
        link: '',
        skills: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleJobDetailChange = (e) => {
        setJobDetails({ ...jobDetails, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('content', content);
            formData.append('type', isJobOffer ? 'job' : 'post');

            if (isJobOffer) {
                // Stringify or append individually based on backend expectation
                // In our controller we destructure req.body.jobDetails.
                // Since this is formData, we'll send it as JSON string and adjust backend if needed,
                // BUT wait, our backend controller expects req.body.jobDetails as an object.
                // FormData sends strings. Let's send them individually.
                // Actually, let's just send the whole thing as a JSON if no image, or append individual fields and reconstruct in backend.
                // Since `upload.single` works with multipart data, we need to send strings.
                // Let's modify the backend or just append them and let backend parse if needed.
                // For simplicity, we can stringify and parse on backend if it's multipart, but express body parser handles it if it's JSON.
                // Let's send them as individual props.
                formData.append('jobDetails[title]', jobDetails.title);
                formData.append('jobDetails[company]', jobDetails.company);
                formData.append('jobDetails[location]', jobDetails.location);
                formData.append('jobDetails[link]', jobDetails.link);
                formData.append('jobDetails[skills]', jobDetails.skills);
            }

            if (image) {
                formData.append('image', image);
            }

            const res = await api.post('/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success(isJobOffer ? 'Job offer posted!' : 'Post created!');
            setContent('');
            setImage(null);
            setImagePreview('');
            setIsJobOffer(false);
            setJobDetails({ title: '', company: '', location: '', link: '', skills: '' });

            if (onPostCreated) {
                onPostCreated(res.data);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create post');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6 transition-colors">
            <form onSubmit={handleSubmit}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What do you want to talk about?"
                    className="w-full resize-none outline-none text-gray-800 dark:text-gray-100 bg-transparent text-lg placeholder-gray-400 dark:placeholder-gray-500 min-h-[100px]"
                    required
                />

                {imagePreview && (
                    <div className="relative mb-4 inline-block">
                        <img src={imagePreview} alt="Preview" className="max-h-64 rounded-lg object-cover" />
                        <button
                            type="button"
                            onClick={() => { setImage(null); setImagePreview(''); }}
                            className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full p-1 hover:bg-opacity-100 transition"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <AnimatePresence>
                    {isJobOffer && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4 space-y-3 border border-gray-200 dark:border-gray-600 transition-colors"
                        >
                            <h4 className="font-semibold text-gray-700 dark:text-gray-200 text-sm">Job Offer Details</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Job Title"
                                    value={jobDetails.title}
                                    onChange={handleJobDetailChange}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded focus:ring-1 focus:ring-primary-500 outline-none text-sm transition-colors"
                                    required={isJobOffer}
                                />
                                <input
                                    type="text"
                                    name="company"
                                    placeholder="Company Name"
                                    value={jobDetails.company}
                                    onChange={handleJobDetailChange}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded focus:ring-1 focus:ring-primary-500 outline-none text-sm transition-colors"
                                    required={isJobOffer}
                                />
                                <input
                                    type="text"
                                    name="location"
                                    placeholder="Location"
                                    value={jobDetails.location}
                                    onChange={handleJobDetailChange}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded focus:ring-1 focus:ring-primary-500 outline-none text-sm transition-colors"
                                    required={isJobOffer}
                                />
                                <input
                                    type="url"
                                    name="link"
                                    placeholder="Application Link"
                                    value={jobDetails.link}
                                    onChange={handleJobDetailChange}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded focus:ring-1 focus:ring-primary-500 outline-none text-sm transition-colors"
                                />
                                <input
                                    type="text"
                                    name="skills"
                                    placeholder="Required Skills (comma separated)"
                                    value={jobDetails.skills}
                                    onChange={handleJobDetailChange}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded focus:ring-1 focus:ring-primary-500 outline-none text-sm transition-colors sm:col-span-2"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-4 mt-2 transition-colors">
                    <div className="flex gap-4">
                        <label className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer font-medium text-sm flex items-center gap-1 transition-colors">
                            <span className="text-lg">📷</span> Photo
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </label>
                        <button
                            type="button"
                            onClick={() => setIsJobOffer(!isJobOffer)}
                            className={`font-medium text-sm flex items-center gap-1 transition-colors ${isJobOffer ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'}`}
                        >
                            <span className="text-lg">💼</span> Job Offer
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={!content.trim() || submitting}
                        className="px-5 py-2 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {submitting ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;
