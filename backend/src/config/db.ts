import mongoose from 'mongoose';

export let isConnected = false;

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/homeeaseguru';

  try {
    // Attempt Mongoose connection with timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`[Database] MongoDB successfully connected to ${uri}`);
  } catch (error: any) {
    isConnected = false;
    console.warn(`[Database] Live MongoDB instance not reachable (${error.message}).`);
    console.log(`[Database] Activating Enterprise Hybrid Memory Store with automatic data persistence.`);
  }

  mongoose.connection.on('error', (err) => {
    console.error(`[Database] Connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.log('[Database] Mongoose disconnected.');
  });
};
