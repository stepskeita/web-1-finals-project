import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('\n' + '='.repeat(80));
      console.error('🔴 MONGODB CONNECTION ERROR');
      console.error('='.repeat(80));
      console.error(err);
      console.error('='.repeat(80) + '\n');
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('\n⚠️  MongoDB disconnected. Attempting to reconnect...\n');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('\n✅ MongoDB reconnected successfully\n');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('\n' + '='.repeat(80));
    console.error('🔴 FATAL: Failed to connect to MongoDB');
    console.error('='.repeat(80));
    console.error(error);
    console.error(`MongoDB URI: ${process.env.MONGODB_URI ? '[SET]' : '[NOT SET]'}`);
    if (process.env.NODE_ENV === 'development' && error.stack) {
      console.error(`Stack Trace:\n${error.stack}`);
    }
    console.error('='.repeat(80) + '\n');
    console.error('💡 Troubleshooting tips:');
    console.error('   1. Check if MONGODB_URI is set in .env file');
    console.error('   2. Verify MongoDB connection string is correct');
    console.error('   3. Ensure MongoDB service is running');
    console.error('   4. Check network connectivity\n');
    process.exit(1);
  }
};

export default connectDB;
