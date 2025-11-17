/**
 * Update User Role Script
 * Script untuk mengubah role user dari 'pembeli' ke 'penjual'
 *
 * Usage: node update-user-role.js [EMAIL] [ROLE]
 * Example: node update-user-role.js user@gmail.com penjual
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function updateUserRole(email, newRole) {
    try {
        // Connect to MongoDB
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');

        // Import User model
        const User = require('./models/User');

        // Find user by email
        console.log(`🔍 Finding user with email: ${email}`);
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`❌ User with email ${email} not found`);
            process.exit(1);
        }

        console.log(`✅ User found: ${user.nama} (${user.email})`);
        console.log(`📝 Current role: ${user.role}`);

        // Update role
        user.role = newRole;
        await user.save();

        console.log(`✅ Role updated to: ${newRole}`);
        console.log('');
        console.log('User can now access seller features!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Get arguments
const email = process.argv[2];
const role = process.argv[3] || 'penjual';

if (!email) {
    console.log('❌ Email is required!');
    console.log('');
    console.log('Usage: node update-user-role.js [EMAIL] [ROLE]');
    console.log('');
    console.log('Examples:');
    console.log('  node update-user-role.js user@gmail.com penjual');
    console.log('  node update-user-role.js seller@gmail.com penjual');
    console.log('  node update-user-role.js customer@gmail.com pembeli');
    console.log('');
    console.log('Valid roles: pembeli, penjual');
    process.exit(1);
}

if (!['pembeli', 'penjual'].includes(role)) {
    console.log(`❌ Invalid role: ${role}`);
    console.log('Valid roles: pembeli, penjual');
    process.exit(1);
}

updateUserRole(email, role);
