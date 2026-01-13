import Market from '../models/marketModel.js';

// Get all markets with optional filtering and pagination
export const getAllMarkets = async (req, res) => {
  try {
    const {
      city,
      state,
      type,
      isActive,
      search,
      page = 1,
      limit = 10,
      sort = '-createdAt',
    } = req.query;

    // Build query
    const query = {};

    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }

    if (state) {
      query['address.state'] = new RegExp(state, 'i');
    }

    if (type) {
      query.type = type;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const markets = await Market.find(query)
      .populate('manager', 'name email role')
      .populate('products', 'name price category')
      .sort(sort)
      .limit(limitNum)
      .skip(skip);

    const total = await Market.countDocuments(query);

    res.json({
      success: true,
      count: markets.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: markets,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single market by ID
export const getMarketById = async (req, res) => {
  try {
    const market = await Market.findById(req.params.id)
      .populate('manager', 'name email role')
      .populate('products', 'name price category stock isAvailable');

    if (!market) {
      return res.status(404).json({ success: false, error: 'Market not found' });
    }

    res.json({ success: true, data: market });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Market not found' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new market
export const createMarket = async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      contact,
      operatingHours,
      image,
      images,
      type,
      products,
    } = req.body;

    // Add manager from authenticated user
    const market = await Market.create({
      name,
      description,
      address,
      contact,
      operatingHours,
      image,
      images,
      type,
      products,
      manager: req.user.id,
    });

    // Populate manager field
    await market.populate('manager', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Market created successfully',
      data: market,
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

// Update market
export const updateMarket = async (req, res) => {
  try {
    let market = await Market.findById(req.params.id);

    if (!market) {
      return res.status(404).json({ success: false, error: 'Market not found' });
    }

    // Check if user is the manager or admin
    if (market.manager.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to update this market',
      });
    }

    market = await Market.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('manager', 'name email role')
      .populate('products', 'name price category');

    res.json({
      success: true,
      message: 'Market updated successfully',
      data: market,
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

// Delete market
export const deleteMarket = async (req, res) => {
  try {
    const market = await Market.findById(req.params.id);

    if (!market) {
      return res.status(404).json({ success: false, error: 'Market not found' });
    }

    // Check if user is the manager or admin
    if (market.manager.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to delete this market',
      });
    }

    await Market.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Market deleted successfully',
      data: {},
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Market not found' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get markets by city
export const getMarketsByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const markets = await Market.findByCity(city)
      .populate('manager', 'name email')
      .populate('products', 'name price category');

    res.json({
      success: true,
      count: markets.length,
      data: markets,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get markets by type
export const getMarketsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const markets = await Market.findByType(type)
      .populate('manager', 'name email')
      .populate('products', 'name price category');

    res.json({
      success: true,
      count: markets.length,
      data: markets,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add product to market
export const addProductToMarket = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide product ID',
      });
    }

    const market = await Market.findById(req.params.id);

    if (!market) {
      return res.status(404).json({ success: false, error: 'Market not found' });
    }

    // Check if user is the manager or admin
    if (market.manager.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to modify this market',
      });
    }

    await market.addProduct(productId);
    await market.populate('products', 'name price category');

    res.json({
      success: true,
      message: 'Product added to market successfully',
      data: market,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Remove product from market
export const removeProductFromMarket = async (req, res) => {
  try {
    const { productId } = req.params;

    const market = await Market.findById(req.params.id);

    if (!market) {
      return res.status(404).json({ success: false, error: 'Market not found' });
    }

    // Check if user is the manager or admin
    if (market.manager.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to modify this market',
      });
    }

    await market.removeProduct(productId);
    await market.populate('products', 'name price category');

    res.json({
      success: true,
      message: 'Product removed from market successfully',
      data: market,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
