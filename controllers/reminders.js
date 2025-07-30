const { ObjectId } = require('mongodb');
const Bundle = require('../models/Reminder');
const Product = require('../models/Product');
const {getDiscountedPrice} =  require('./discount');

// Create a new bundle (at least 2 products required)
exports.createBundle = async (req, res) => {
  try {
    const { name, productIds } = req.body;

    if (!productIds || productIds.length < 2) {
      return res.status(400).json({ message: 'Bundle must contain at least 2 products' });
    }

    // Optional: validate product IDs exist
    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length < 2) {
      return res.status(400).json({ message: 'Invalid or missing products' });
    }

    const bundle = new Bundle({
      name,
      products: productIds,
      sellerId: req.userId 
    });

    await bundle.save();
    res.status(201).json(bundle);
  } catch (err) {
    console.error('Error creating bundle:', err);
    res.status(500).json({ message: err.message });
  }
};

// Retrieve all bundles with full product info (pagination supported)
exports.getBundles = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const skip = (parsedPage - 1) * parsedLimit;

    const query = req.role === 'seller'
      ? { sellerId: new ObjectId(req.userId) }
      : {};

    const totalCount = await Bundle.countDocuments(query);

    const bundles = await Bundle.find(query)
      .populate('products')
      .skip(skip)
      .limit(parsedLimit)
      .lean();

    const resBundles = bundles.map((item) => {
      const discountedPrice = getDiscountedPrice(item.products);

      return {
        ...item,
       discountedPrice
      };
    });

    res.json({
      totalCount,
      totalPages: Math.ceil(totalCount / parsedLimit),
      currentPage: parsedPage,
      bundles: resBundles,
    });
  } catch (err) {
    console.error('Error fetching bundles:', err);
    res.status(500).json({ message: err.message });
  }
};

// Update a bundle (name and/or product list)
exports.updateBundle = async (req, res) => {
  try {
    const bundle = await Bundle.findById(req.params.id);
    if (!bundle) return res.status(404).json({ message: 'Bundle not found' });

    if (bundle.sellerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { name, productIds } = req.body;

    if (name) bundle.name = name;
    if (productIds && productIds.length >= 2) {
      const products = await Product.find({ _id: { $in: productIds } });
      if (products.length < 2) {
        return res.status(400).json({ message: 'Invalid or insufficient products' });
      }
      bundle.products = productIds;
    }

    await bundle.save();
    res.json(bundle);
  } catch (err) {
    console.error('Error updating bundle:', err);
    res.status(500).json({ message: err.message });
  }
};

// Delete a bundle (only if seller owns it)
exports.deleteBundle = async (req, res) => {
  try {
    const bundle = await Bundle.findById(req.params.id);
    if (!bundle) return res.status(404).json({ message: 'Bundle not found' });

    if (bundle.sellerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await bundle.deleteOne();
    res.json({ message: 'Bundle deleted successfully' });
  } catch (err) {
    console.error('Error deleting bundle:', err);
    res.status(500).json({ message: err.message });
  }
};
