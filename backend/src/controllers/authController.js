import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Generate JWT token
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign({ id: userId }, secret, { expiresIn });
};

// Register new user
export const register = async (req, res, next) => {
  try {
    console.log('📝 Register attempt:', { name: req.body.name, email: req.body.email, role: req.body.role });

    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, and password',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered',
      });
    }

    // Create user (password will be hashed automatically by pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'collector', // Default to collector if not specified
    });

    console.log('✅ User registered successfully:', user.email);

    // Generate JWT token
    const token = generateToken(user._id);

    // Send response (password excluded by toJSON method)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error('❌ Error in register controller:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', '),
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered',
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Server error during registration',
    });
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    console.log('🔐 Login attempt:', req.body.email);

    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }

    // Find user with password field (select: false by default)
    const user = await User.findByEmail(email);

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Check password using bcrypt comparison
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    console.log('✅ Login successful:', email);

    // Generate JWT token
    const token = generateToken(user._id);

    // Send response
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error('❌ Error in login controller:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Server error during login',
    });
  }
};

// Get current user (protected route example)
export const getCurrentUser = async (req, res, next) => {
  try {
    // req.user is set by auth middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('❌ Error in getCurrentUser controller:', error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
