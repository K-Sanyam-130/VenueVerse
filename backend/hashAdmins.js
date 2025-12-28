const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./model/Admin");

mongoose.connect("mongodb://127.0.0.1:27017/venueverse");

async function fixAdmins() {
  const admins = await Admin.find();

  for (let admin of admins) {
    if (!admin.password.startsWith("$2")) {
      admin.password = await bcrypt.hash(admin.password, 10);
      await admin.save();
    }
  }

  console.log("Admin passwords hashed");
  process.exit();
}

fixAdmins();
