import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: false,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
      enum: {
        values: ['Vegetables', 'Fruits', 'Grains', 'Meat', 'Dairy', 'Seafood', 'Spices', 'Other'],
        message: 'Please select a valid category',
      },
    },
    stock: {
      type: Number,
      required: [true, 'Product stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    image: {
      type: String,
      default: 'https://via.placeholder.com/400x300?text=No+Image',
    },
    images: [
      {
        type: String,
      },
    ],
    brand: {
      type: String,
      trim: true,
      maxlength: [50, 'Brand name cannot exceed 50 characters'],
    },
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
    isAvailable: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdBy: 1 });
productSchema.index({ isAvailable: 1 });

// Virtual for stock status
productSchema.virtual('stockStatus').get(function () {
  if (this.stock === 0) return 'Out of Stock';
  if (this.stock < 10) return 'Low Stock';
  return 'In Stock';
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Static method to find products by category
productSchema.statics.findByCategory = function (category) {
  return this.find({ category, isAvailable: true });
};

// Static method to find available products
productSchema.statics.findAvailable = function () {
  return this.find({ isAvailable: true, stock: { $gt: 0 } });
};

// Instance method to check if product is in stock
productSchema.methods.isInStock = function () {
  return this.stock > 0;
};

// Instance method to update stock
productSchema.methods.updateStock = function (quantity) {
  this.stock += quantity;
  if (this.stock < 0) this.stock = 0;
  return this.save();
};

const Product = mongoose.model('Product', productSchema);

export default Product;
