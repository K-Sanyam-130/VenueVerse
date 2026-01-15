require('dotenv').config();
const mongoose = require('mongoose');

// Define Admin schema inline to avoid import issues
const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    department: { type: String, default: "" },
    venues: { type: [String], default: [] }
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

// Connect and create admins
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB\n');

        // Password hashes generated with bcrypt
        const admins = [
            {
                name: "ECE",
                department: "Electronics department",
                email: "ECEdept@bmsce.ac.in",
                password: "$2a$10$FZzf9YLn4QT9Z3fBLaNkC66NbrnyAg6fwEJHLk0WXo3", // ECE@bmsce
                venues: []
            },
            {
                name: "Principal's Office, Ground Floor",
                department: "Administration",
                email: "PRINCIPAL@bmsce.ac.in",
                password: "$2a$10$lrwNZK5NvXMh3YmCc5H38eNEb9S.pTvMJrPZ3c5kC7iJ8aT6Hu6Dm", // PRINCIPAL@bmsce
                venues: []
            }
        ];

        for (const adminData of admins) {
            const existing = await Admin.findOne({ email: adminData.email });

            if (existing) {
                console.log(`⏭️  Admin already exists: ${adminData.email}`);
                continue;
            }

            const admin = new Admin(adminData);
            await admin.save();

            console.log(`✅ Created: ${admin.name}`);
            console.log(`   Email: ${admin.email}`);
            console.log(`   Department: ${admin.department}\n`);
        }

        console.log('✅ Admin creation complete!\n');
        console.log('📝 Login Credentials:');
        console.log('═══════════════════════════════════');
        console.log('ECE Department:');
        console.log('  Email: ECEdept@bmsce.ac.in');
        console.log('  Password: ECE@bmsce');
        console.log('═══════════════════════════════════');
        console.log('Principal\'s Office:');
        console.log('  Email: PRINCIPAL@bmsce.ac.in');
        console.log('  Password: PRINCIPAL@bmsce');
        console.log('═══════════════════════════════════\n');

        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
