const News = require("../../models/News");

const getAllNews = async (req, res) => {
  try {
    const userInfo = await User.findById(req.user.id);

    if (!userInfo.news_notification) {
      return res.status(200).json([]);
    }

    const newsSelectFields =
      userInfo.is_premium > 0 ? "-user" : "title_en content_en created_time";

    const newsData = await News.find({
      user: { $nin: [req.user.id] },
      created_time: { $gt: userInfo.created_time }, // Ensure news is newer than user creation date
    })
      .select(newsSelectFields)
      .sort({
        created_time: -1,
      });

    return res.status(200).json(newsData);
  } catch (error) {
    console.log(error);
  }
};

const closeNews = async (req, res) => {
  try {
    await News.findOneAndUpdate(
      { _id: req.body.newsId },
      { $push: { user: req.user.id } },
      { new: true }
    );

    return res
      .status(200)
      .json({ status: true, message: "News closed successfully." });
  } catch (error) {
    console.log(error);
  }
};

const getAllNotifications = async (req, res) => {
  try {
    const userInfo = await User.findById(req.user.id);

    const totalDataCount = await News.countDocuments({
      created_time: { $gt: userInfo.created_time },
    });

    const newsSelectFields =
      userInfo.is_premium > 0 ? "-user" : "title_en content_en created_time";

    const newsData = await News.find({
      created_time: { $gt: userInfo.created_time }, // Ensure news is newer than user creation date
    })
      .select(newsSelectFields)
      .sort({
        created_time: -1,
      })
      .limit(req.body.itemsPerPage)
      .skip((req.body.currentPage - 1) * req.body.itemsPerPage);

    return res
      .status(200)
      .json({ results: newsData, totalDataCount: totalDataCount });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getAllNews,
  closeNews,
  getAllNotifications,
};
