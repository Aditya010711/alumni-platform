const Post = require('../models/Post');
const Profile = require('../models/Profile');

// Helper to calculate score between two sets of skills
const calculateSkillMatchScore = (userSkills, jobSkills) => {
    if (!userSkills || userSkills.length === 0 || !jobSkills || jobSkills.length === 0) return 0;

    // Convert to lowercase and trim for better matching
    const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());
    const normalizedJobSkills = jobSkills.map(s => s.toLowerCase().trim());

    let matchCount = 0;
    for (const jobSkill of normalizedJobSkills) {
        if (normalizedUserSkills.includes(jobSkill)) {
            matchCount++;
        }
    }

    // We could return matchCount, or a percentage: matchCount / jobSkills.length * 100
    // Returning percentage helps compare different jobs fairly
    return (matchCount / normalizedJobSkills.length) * 100;
};

// @desc    Get recommended jobs based on user skills
// @route   GET /api/posts/jobs/recommended
// @access  Private
exports.getRecommendedJobs = async (req, res, next) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found. Create a profile to see recommendations.' });
        }

        const userSkills = profile.skills || [];

        // Fetch all jobs
        const limitNum = parseInt(req.query.limit, 10) || 20;

        const jobs = await Post.find({ type: 'job' })
            .populate('author', ['firstName', 'lastName', 'profilePicture', 'degree', 'currentCompany', 'role'])
            .populate('comments.author', ['firstName', 'lastName', 'profilePicture']);

        // Calculate scores and attach to objects
        let scoredJobs = jobs.map(job => {
            const jobSkills = job.jobDetails?.skills || [];
            const score = calculateSkillMatchScore(userSkills, jobSkills);
            return {
                ...job.toObject(),
                matchScore: score
            };
        });

        // Filter out 0 scores if user has skills, but realistically we might show some 0 score ones at the bottom anyway.
        // Let's sort descending by score.
        scoredJobs.sort((a, b) => {
            if (b.matchScore !== a.matchScore) {
                return b.matchScore - a.matchScore; // Highest score first
            }
            // Tie-breaker: newest post first
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // Apply limit after sorting
        scoredJobs = scoredJobs.slice(0, limitNum);

        res.status(200).json(scoredJobs);
    } catch (err) {
        next(err);
    }
};
