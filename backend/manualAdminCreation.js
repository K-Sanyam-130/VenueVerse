// Run this in MongoDB Compass or mongosh to create admin accounts

// First, get bcrypt hashes for the passwords:
// ECE@bmsce -> Use bcrypt to hash this
// PRINCIPAL@bmsce -> Use bcrypt to hash this

// Use this Node.js snippet to generate hashes:
const bcrypt = require('bcryptjs');

async function generateHashes() {
    const hash1 = await bcrypt.hash('ECE@bmsce', 10);
    const hash2 = await bcrypt.hash('PRINCIPAL@bmsce', 10);

    console.log('ECE Password Hash:', hash1);
    console.log('Principal Password Hash:', hash2);
}

generateHashes();

// Then run these MongoDB commands:

/*
db.admins.insertMany([
  {
    name: "ECE",
    department: "Electronics department",
    email: "ECEdept@bmsce.ac.in",
    password: "$2a$10$PASTE_HASH_HERE",
    venues: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Principal's Office, Ground Floor",
    department: "Administration",
    email: "PRINCIPAL@bmsce.ac.in",
    password: "$2a$10$PASTE_HASH_HERE",
    venues: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
])
*/
