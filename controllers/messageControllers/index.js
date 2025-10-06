const Message = require("../../models/Message");
const { Types } = require("mongoose");

const getAllMessagesByChatId = async (req, res) => {
  try {
    if (!Types.ObjectId.isValid(req.body.chatId)) {
      return res.status(400).json({ status: false, msg: "Something is wrong" });
    }

    await Message.updateMany(
      { chat_id: req.body.chatId, sender: { $ne: req.user.id }, read: false },
      { read: true }
    );

    let query = { chat_id: req.body.chatId };

    if (req.body.page > 1 && req.body.lastMessageCreatedTime) {
      query.created_time = { $lt: req.body.lastMessageCreatedTime };
    }

    const messageData = await Message.find(query)
      .sort({ created_time: -1 })
      .limit(req.body.itemsPerPage);

    return res.status(200).json(messageData);
  } catch (error) {
    return res.status(400).json({ status: false, msg: error.message });
  }
};

module.exports = {
  getAllMessagesByChatId,
};
