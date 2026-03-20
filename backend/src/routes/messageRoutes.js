const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getConversations } = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/conversations', getConversations);
router.get('/:id', getMessages);
router.post('/:id', sendMessage);

module.exports = router;
