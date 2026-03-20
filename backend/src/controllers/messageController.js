const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// @desc    Send a message
// @route   POST /api/messages/:id
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user.id; // from auth middleware

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }

        const newMessage = new Message({
            sender: senderId,
            text,
            conversationId: conversation._id,
        });

        await newMessage.save();

        conversation.lastMessage = {
            text,
            sender: senderId,
            read: false
        };
        await conversation.save();

        // Socket.io emission
        const io = req.app.get('io');
        const userSocketMap = req.app.get('userSocketMap');
        const receiverSocketId = userSocketMap[receiverId];

        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage controller: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// @desc    Get messages between users
// @route   GET /api/messages/:id
// @access  Private
exports.getMessages = async (req, res) => {
    try {
        const userToChatId = req.params.id;
        const senderId = req.user.id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },
        });

        if (!conversation) return res.status(200).json([]);

        const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessages controller: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// @desc    Get all conversations for a user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        const conversations = await Conversation.find({ participants: userId })
            .populate('participants', 'username profilePicture currentCompany')
            .sort({ updatedAt: -1 });

        // Format to easily grab the "other" participant stats for sidebar list
        const formattedConversations = conversations.map(convo => {
            const partner = convo.participants.find(p => p._id.toString() !== userId);
            return {
                _id: convo._id,
                partner,
                lastMessage: convo.lastMessage,
                updatedAt: convo.updatedAt
            };
        }).filter(c => c.partner); // remove broken convos where partner was deleted

        res.status(200).json(formattedConversations);
    } catch (error) {
        console.error("Error in getConversations controller: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
