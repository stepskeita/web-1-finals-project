import mongoose from 'mongoose';

const marketSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Market name is required'],
      trim: true,
      maxlength: [100, 'Market name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: false,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    address: {
      street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      state: {
        type: String,
        required: [true, 'Region is required'],
        trim: true,
      },
      zipCode: {
        type: String,
        required: false,
        trim: true,
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
        default: 'The Gambia',
      },
    },
    contact: {
      phone: {
        type: String,
        required: [true, 'Contact phone is required'],
        match: [/^[\d\s\-\+\(\)]+$/, 'Please provide a valid phone number'],
      },
      email: {
        type: String,
        required: [true, 'Contact email is required'],
        lowercase: true,
        trim: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please provide a valid email address',
        ],
      },
    },
    operatingHours: {
      monday: { type: String, default: 'Closed' },
      tuesday: { type: String, default: 'Closed' },
      wednesday: { type: String, default: 'Closed' },
      thursday: { type: String, default: 'Closed' },
      friday: { type: String, default: 'Closed' },
      saturday: { type: String, default: 'Closed' },
      sunday: { type: String, default: 'Closed' },
    },
    image: {
      type: String,
      default: 'https://via.placeholder.com/600x400?text=Market+Image',
    },
    images: [
      {
        type: String,
      },
    ],
    rating: {
      type: Number,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
      min: [0, 'Number of reviews cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      enum: {
        values: ['farmers-market', 'supermarket', 'convenience-store', 'specialty-store', 'wholesale', 'other'],
        message: 'Please select a valid market type',
      },
      default: 'other',
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Market manager is required'],
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
marketSchema.index({ name: 1 });
marketSchema.index({ 'address.city': 1 });
marketSchema.index({ 'address.state': 1 });
marketSchema.index({ type: 1 });
marketSchema.index({ isActive: 1 });
marketSchema.index({ manager: 1 });

// Virtual for full address
marketSchema.virtual('fullAddress').get(function () {
  const parts = [this.address.street, this.address.city, this.address.state];
  if (this.address.zipCode) parts.push(this.address.zipCode);
  parts.push(this.address.country);
  return parts.join(', ');
});

// Ensure virtuals are included in JSON
marketSchema.set('toJSON', { virtuals: true });
marketSchema.set('toObject', { virtuals: true });

// Static method to find active markets
marketSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

// Static method to find markets by city
marketSchema.statics.findByCity = function (city) {
  return this.find({ 'address.city': new RegExp(city, 'i'), isActive: true });
};

// Static method to find markets by type
marketSchema.statics.findByType = function (type) {
  return this.find({ type, isActive: true });
};

// Instance method to add product to market
marketSchema.methods.addProduct = function (productId) {
  if (!this.products.includes(productId)) {
    this.products.push(productId);
    return this.save();
  }
  return this;
};

// Instance method to remove product from market
marketSchema.methods.removeProduct = function (productId) {
  this.products = this.products.filter((id) => id.toString() !== productId.toString());
  return this.save();
};

const Market = mongoose.model('Market', marketSchema);

export default Market;
