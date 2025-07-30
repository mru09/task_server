const Product = require('../models/Product');
const { ObjectId } = require('mongodb');

// GET /products - return all products
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = req.role === 'seller'
      ? { sellerId: new ObjectId(req.userId) }
      : {};

    const totalCount = await Product.countDocuments(query);

    const products = await Product.find(query)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
      products,
    });  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
