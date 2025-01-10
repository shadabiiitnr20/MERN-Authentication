import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connectionObj = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected : ${connectionObj.connection.host}`);
  } catch (error) {
    console.log('Something went wrong while connecting to DB', error.message);
    process.exit(1); //Status code 1 for failure, 0 is for success
  }
};
