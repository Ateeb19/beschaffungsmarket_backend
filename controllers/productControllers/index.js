const Product = require("../../models/Product");

const { uploadFile } = require("../../utils/uploadFile");

const validateProductInput = require("../../validation/product");

const getMyProducts = async (req, res) => {
  try {
    const totalDataCount = await Product.countDocuments({ user: req.user.id });

    const myProductsData = await Product.find({ user: req.user.id })
      .sort({
        created_time: -1,
      })
      .limit(req.body.itemsPerPage)
      .skip((req.body.currentPage - 1) * req.body.itemsPerPage);

    return res
      .status(200)
      .json({ results: myProductsData, totalDataCount: totalDataCount });
  } catch (error) {
    console.log(error);
  }
};

const addProduct = async (req, res) => {
  try {
    const { errors, isValid } = validateProductInput(req.body, req.file);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const userInfo = await User.findById(req.user.id);

    const totalDataCount = await Product.countDocuments({ user: req.user.id });

    if (userInfo.is_premium === 0) {
      return res.status(400).json({
        status: false,
        msg: "Please upgrade your membership to upload product",
      });
    }

    if (userInfo.is_premium === 1 && totalDataCount > 4) {
      return res.status(400).json({
        status: false,
        msg: "You have reached your limit of 5 uploads. Please upgrade your membership for additional uploads",
      });
    }

    if (userInfo.is_premium === 2 && totalDataCount > 19) {
      return res.status(400).json({
        status: false,
        msg: "You have reached the maximum limit of 20 uploads",
      });
    }

    let newProduct = {
      user: req.user.id,
      title: req.body.title,
    };

    const imageName = await uploadFile(req.file);

    newProduct.image = imageName;

    await Product.create(newProduct).then(() =>
      res.json({
        status: true,
        msg: "You have successfully created a new product!",
      })
    );
  } catch (error) {
    console.log(error);
  }
};

const editProduct = async (req, res) => {
  try {
    const { errors, isValid } = validateProductInput(req.body, req.file);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    let productData = {
      user: req.user.id,
      title: req.body.title,
      description: req.body.description,
    };

    const imageName = await uploadFile(req.file);

    productData.image = imageName;

    await Product.findOneAndUpdate(
      { _id: req.body.productId },
      { $set: productData },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      msg: "Product Data is updated successfully.",
    });
  } catch (error) {
    console.log(error);
  }
};

const deleteProduct = async (req, res) => {
  try {
    await Product.findOneAndRemove({ _id: req.body.productId })
      .then(() => {
        res.json({
          status: true,
          msg: "Product data deleted successfully.",
        });
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getMyProducts,
  addProduct,
  editProduct,
  deleteProduct,
};
