import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

async function checkPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');
    
    const userDoc = await User.findOne({ email: 'raj.kumar@iitm.student.ac.in' });
    
    if (!userDoc) {
      console.log('User not found');
      return;
    }
    
    console.log('User found:', userDoc.email);
    console.log('Password field exists:', !!userDoc.password);
    console.log('Password value:', userDoc.password);
    console.log('Password starts with $2:', userDoc.password?.startsWith('$2'));
    console.log('Password length:', userDoc.password?.length);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPassword();
