import mongoose from 'mongoose';
import { ENV } from './env';

export const connectDatabase = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      maxPoolSize: 50,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    if (ENV.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected. Attempting reconnection...');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB runtime error:', err);
});
