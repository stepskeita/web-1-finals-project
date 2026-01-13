import Product from '../models/productModel.js';

// Get all products with optional filtering and pagination
export const getAllProducts = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      isAvailable,
      search,
      page = 1,
      limit = 10,
      sort = '-createdAt',
    } = req.query;

    // Build query
    const query = {};

    if (category) {
      query.category = category;
    }

    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const products = await Product.find(query)
      .populate('createdBy', 'name email')
      .sort(sort)
      .limit(limitNum)
      .skip(skip);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('createdBy', 'name email role');

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new product
export const createProduct = async (req, res) => {
  try {
    console.log('📦 Request body:', req.body);
    console.log('📦 Request headers:', req.headers);

    const {
      name,
      description,
      price,
      category,
      stock,
      image,
      images,
      brand,
      rating,
      numReviews,
      isAvailable,
    } = req.body;

    // Add createdBy from authenticated user
    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      image,
      images,
      brand,
      rating,
      numReviews,
      isAvailable,
      createdBy: req.user.id,
    });

    // Populate createdBy field
    await product.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {

    console.log(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', '),
      });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Check if user is the creator or admin
    if (product.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to update this product',
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', '),
      });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Check if user is the creator or admin
    if (product.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to delete this product',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: {},
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.findByCategory(category).populate('createdBy', 'name email');

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update product stock
export const updateProductStock = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Please provide quantity to update',
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    await product.updateStock(Number(quantity));

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: product,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
