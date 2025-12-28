const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./model/Admin");

mongoose.connect("mongodb://127.0.0.1:27017/venueverse")
  .then(() => console.log("DB connected"))
  .catch(err => console.error(err));

const createAdmin = async () => {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await Admin.create({
    email: "MECHdept@bmsce.ac.in",
    password: "MECH@bmsce",
  });

  console.log("Admin created");
  process.exit();
};

createAdmin();
