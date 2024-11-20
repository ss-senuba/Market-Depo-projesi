const express = require("express");
const router = express.Router();
const auth_controller=require("../controllers/auth-controller")
const { verifyToken } = require("../middleware/auth-middleware")

// Yeni kullanıcı kaydı
router.post("/register", auth_controller.register);

// Kullanıcı girişi
router.post("/login", auth_controller.login);

module.exports = router;