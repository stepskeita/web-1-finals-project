import mongoose from 'mongoose';

const priceSubmissionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    market: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Market',
      required: [true, 'Market reference is required'],
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
      enum: {
        values: ['kg', 'lb', 'oz', 'g', 'piece', 'dozen', 'liter', 'gallon', 'bunch', 'bag', 'box', 'other'],
        message: 'Please select a valid unit',
      },
      default: 'piece',
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: 'Status must be pending, approved, or rejected',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
priceSubmissionSchema.index({ product: 1, market: 1 });
priceSubmissionSchema.index({ market: 1, date: -1 });
priceSubmissionSchema.index({ product: 1, date: -1 });
priceSubmissionSchema.index({ submittedBy: 1 });
priceSubmissionSchema.index({ status: 1 });
priceSubmissionSchema.index({ date: -1 });

// Compound index for efficient price history queries
priceSubmissionSchema.index({ product: 1, market: 1, date: -1 });

// Virtual for price per unit display
priceSubmissionSchema.virtual('priceDisplay').get(function () {
  return `$${this.price.toFixed(2)} per ${this.unit}`;
});

// Ensure virtuals are included in JSON
priceSubmissionSchema.set('toJSON', { virtuals: true });
priceSubmissionSchema.set('toObject', { virtuals: true });

// Static method to find submissions by product
priceSubmissionSchema.statics.findByProduct = function (productId) {
  return this.find({ product: productId, status: 'approved' }).sort('-date');
};

// Static method to find submissions by market
priceSubmissionSchema.statics.findByMarket = function (marketId) {
  return this.find({ market: marketId, status: 'approved' }).sort('-date');
};

// Static method to find recent submissions
priceSubmissionSchema.statics.findRecent = function (days = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return this.find({ date: { $gte: date }, status: 'approved' }).sort('-date');
};

// Static method to get price history for a product at a market
priceSubmissionSchema.statics.getPriceHistory = function (productId, marketId) {
  return this.find({
    product: productId,
    market: marketId,
    status: 'approved'
  }).sort('-date');
};

// Static method to get average price for a product
priceSubmissionSchema.statics.getAveragePrice = async function (productId, days = 30) {
  const date = new Date();
  date.setDate(date.getDate() - days);

  const result = await this.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        date: { $gte: date },
        status: 'approved',
      },
    },
    {
      $group: {
        _id: null,
        averagePrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        count: { $sum: 1 },
      },
    },
  ]);

  return result.length > 0 ? result[0] : null;
};

// Instance method to verify submission
priceSubmissionSchema.methods.verify = function (userId) {
  this.isVerified = true;
  this.verifiedBy = userId;
  this.verifiedAt = new Date();
  this.status = 'approved';
  return this.save();
};

// Instance method to reject submission
priceSubmissionSchema.methods.reject = function () {
  this.status = 'rejected';
  return this.save();
};

const PriceSubmission = mongoose.model('PriceSubmission', priceSubmissionSchema);

export default PriceSubmission;
