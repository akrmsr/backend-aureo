// scripts/createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const { USER_ROLES } = require('../src/config/constants');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@musicplayer.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Username:', existingAdmin.username);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      username: process.env.ADMIN_USERNAME || 'admin',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: USER_ROLES.ADMIN
    });

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Username:', admin.username);
    console.log('Email:', admin.email);
    console.log('Password:', process.env.ADMIN_PASSWORD || 'Admin@123456');
    console.log('Role:', admin.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Change the admin password after first login!');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

createAdmin();