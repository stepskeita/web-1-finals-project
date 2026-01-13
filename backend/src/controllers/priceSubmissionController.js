import PriceSubmission from '../models/priceSubmissionModel.js';

// Get all price submissions with optional filtering and pagination
export const getAllPriceSubmissions = async (req, res) => {
  try {
    const {
      product,
      market,
      submittedBy,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sort = '-date',
    } = req.query;

    // Build query
    const query = {};

    if (product) {
      query.product = product;
    }

    if (market) {
      query.market = market;
    }

    if (submittedBy) {
      query.submittedBy = submittedBy;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const submissions = await PriceSubmission.find(query)
      .populate('product', 'name category image')
      .populate('market', 'name address.city address.state')
      .populate('submittedBy', 'name email')
      .populate('verifiedBy', 'name email')
      .sort(sort)
      .limit(limitNum)
      .skip(skip);

    const total = await PriceSubmission.countDocuments(query);

    res.json({
      success: true,
      count: submissions.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: submissions,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single price submission by ID
export const getPriceSubmissionById = async (req, res) => {
  try {
    const submission = await PriceSubmission.findById(req.params.id)
      .populate('product', 'name category price image')
      .populate('market', 'name address contact')
      .populate('submittedBy', 'name email role')
      .populate('verifiedBy', 'name email');

    if (!submission) {
      return res.status(404).json({ success: false, error: 'Price submission not found' });
    }

    res.json({ success: true, data: submission });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Price submission not found' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new price submission
export const createPriceSubmission = async (req, res) => {
  try {
    const { product, market, price, unit, date, notes } = req.body;

    // Create submission
    const submission = await PriceSubmission.create({
      product,
      market,
      price,
      unit,
      date: date || Date.now(),
      notes,
      submittedBy: req.user.id,
    });

    // Populate references
    await submission.populate([
      { path: 'product', select: 'name category' },
      { path: 'market', select: 'name address.city' },
      { path: 'submittedBy', select: 'name email' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Price submission created successfully',
      data: submission,
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

// Update price submission (Admin only)
export const updatePriceSubmission = async (req, res) => {
  try {
    let submission = await PriceSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ success: false, error: 'Price submission not found' });
    }

    // Authorization already handled by authorize('admin') middleware

    submission = await PriceSubmission.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('product', 'name category')
      .populate('market', 'name address.city')
      .populate('submittedBy', 'name email');

    res.json({
      success: true,
      message: 'Price submission updated successfully',
      data: submission,
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

// Delete price submission (Admin only)
export const deletePriceSubmission = async (req, res) => {
  try {
    const submission = await PriceSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ success: false, error: 'Price submission not found' });
    }

    // Authorization already handled by authorize('admin') middleware

    await PriceSubmission.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Price submission deleted successfully',
      data: {},
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Price submission not found' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get price submissions by product
export const getPriceSubmissionsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const submissions = await PriceSubmission.findByProduct(productId)
      .populate('market', 'name address.city address.state')
      .populate('submittedBy', 'name');

    res.json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get price submissions by market
export const getPriceSubmissionsByMarket = async (req, res) => {
  try {
    const { marketId } = req.params;
    const submissions = await PriceSubmission.findByMarket(marketId)
      .populate('product', 'name category image')
      .populate('submittedBy', 'name');

    res.json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get price history for a product at a market
export const getPriceHistory = async (req, res) => {
  try {
    const { productId, marketId } = req.params;
    const submissions = await PriceSubmission.getPriceHistory(productId, marketId)
      .populate('submittedBy', 'name');

    res.json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get average price for a product
export const getAveragePrice = async (req, res) => {
  try {
    const { productId } = req.params;
    const { days = 30 } = req.query;

    const stats = await PriceSubmission.getAveragePrice(productId, parseInt(days, 10));

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'No price data found for this product',
      });
    }

    res.json({
      success: true,
      data: {
        productId,
        period: `${days} days`,
        ...stats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Verify price submission (admin only)
export const verifyPriceSubmission = async (req, res) => {
  try {
    const submission = await PriceSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ success: false, error: 'Price submission not found' });
    }

    await submission.verify(req.user.id);
    await submission.populate([
      { path: 'product', select: 'name category' },
      { path: 'market', select: 'name address.city' },
      { path: 'verifiedBy', select: 'name email' },
    ]);

    res.json({
      success: true,
      message: 'Price submission verified successfully',
      data: submission,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Reject price submission (admin only)
export const rejectPriceSubmission = async (req, res) => {
  try {
    const submission = await PriceSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ success: false, error: 'Price submission not found' });
    }

    await submission.reject();
    await submission.populate([
      { path: 'product', select: 'name category' },
      { path: 'market', select: 'name address.city' },
    ]);

    res.json({
      success: true,
      message: 'Price submission rejected',
      data: submission,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
