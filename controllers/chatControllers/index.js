const Chat = require("../../models/Chat");
const Message = require("../../models/Message");

const validateChatInput = require("../../validation/chat");

const getAllChats = async (req, res) => {
  try {
    let premiumUser = false;
    let allChatData = [];
    let modifiedChatData = [];

    if (req.user.id) {
      const userInfo = await User.findById(req.user.id).select("is_premium");

      if (userInfo.is_premium !== 0) {
        premiumUser = true;
      }
    }

    const userChats = await Chat.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }],
    }).select("_id");

    const chatIds = userChats.map((chat) => chat._id);

    const limitMessageCount = await Message.countDocuments({
      chat_id: { $in: chatIds },
    });

    if (premiumUser || (!premiumUser && limitMessageCount < 3)) {
      allChatData = await Chat.find({
        $or: [{ sender: req.user.id }, { receiver: req.user.id }],
      })
        .populate("sender", [
          "company_name",
          "contact_first_name",
          "contact_last_name",
          "contact_email",
          "contact_img",
        ])
        .populate("receiver", [
          "company_name",
          "contact_first_name",
          "contact_last_name",
          "contact_email",
          "contact_img",
        ])
        .sort({
          created_time: -1,
        });
    } else {
      allChatData = await Chat.find({
        $or: [{ sender: req.user.id }, { receiver: req.user.id }],
      }).select("_id");
    }

    for (let chatData of allChatData) {
      let chatDataCopy = chatData.toObject();

      const unreadMsg = await Message.countDocuments({
        chat_id: chatDataCopy._id,
        sender: { $ne: req.user.id },
        read: false,
      });

      chatDataCopy.unreadMsg = unreadMsg;

      modifiedChatData.push(chatDataCopy);
    }

    return res
      .status(200)
      .json({ allChatData: modifiedChatData, premiumUser, limitMessageCount });
  } catch (error) {
    return res.status(400).json({ status: false, msg: error.message });
  }
};

const createChat = async (req, res) => {
  try {
    const { errors, isValid } = validateChatInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const userData = await User.findById(req.user.id);

    if (!userData) {
      return res.status(400).json({
        status: false,
        msg: "User is not existed",
      });
    }

    if (userData.is_premium === 0) {
      return res.status(400).json({
        status: false,
        msg: "You are not enable to chat. Please upgrade your account",
      });
    }

    const newChat = {
      sender: req.user.id,
      receiver: req.body.receiverId,
      title: req.body.title,
    };

    const chatData = await Chat.create(newChat);

    const newMessage = {
      chat_id: chatData._id,
      sender: req.user.id,
      message: req.body.message,
    };

    await Message.create(newMessage);

    return res.status(200).json({
      status: true,
      msg: "You have successfully sent message!",
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getAllChats,
  createChat,
};
