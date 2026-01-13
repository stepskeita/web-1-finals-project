import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Add indexes for better query performance
exampleSchema.index({ email: 1 });

// Add a pre-save hook (example)
exampleSchema.pre('save', function (next) {
  console.log(`Saving document with email: ${this.email}`);
  next();
});

// Add a static method
exampleSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

// Add an instance method
exampleSchema.methods.getInfo = function () {
  return `${this.name} (${this.email})`;
};

const Example = mongoose.model('Example', exampleSchema);

export default Example;
