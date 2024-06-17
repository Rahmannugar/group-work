import Message from "../models/Message.js";

export const getMessages = async (req, res) => {
  const { userId, friendId } = req.params;
  // const room = [userId, friendId].sort().join("-");

  try {
    const messages = await Message.find({
      $or: [
        { userId, friendId },
        { userId: friendId, friendId: userId },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve messages", error });
  }
};
