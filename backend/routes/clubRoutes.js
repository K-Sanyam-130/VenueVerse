const express = require("express");
const router = express.Router();
const { clubLogin } = require("../controllers/clubController");

router.post("/login", clubLogin);

module.exports = router;
