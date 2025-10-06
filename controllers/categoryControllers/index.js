const MainCategory = require("../../models/Main_Category");
const SubCategory = require("../../models/Sub_Category");

const getAllMainSubCategories = async (req, res) => {
  try {
    const mainCategoryData = await MainCategory.find();

    const subCategoryData = await SubCategory.find();

    return res
      .status(200)
      .json({ mainCategory: mainCategoryData, subCategory: subCategoryData });
  } catch (error) {
    console.log(error);
  }
};

const getAllMainCategories = async (req, res) => {
  try {
    const mainCategoryData = await MainCategory.find();

    // const randomMainCategory = mainCategoryData
    //   .sort(() => 0.5 - Math.random())
    //   .slice(0, 5);

    return res.status(200).json(mainCategoryData);
  } catch (error) {
    return res.status(400).json({ status: false, msg: error.message });
  }
};

const getRandomCategories = async (req, res) => {
  try {
    const mainCategoryData = await MainCategory.find();

    const randomMainCategory = mainCategoryData
      .sort(() => 0.5 - Math.random())
      .slice(0, 6);

    return res.status(200).json(randomMainCategory);
  } catch (error) {
    return res.status(400).json({ status: false, msg: error.message });
  }
};

module.exports = {
  getAllMainSubCategories,
  getAllMainCategories,
  getRandomCategories,
};
