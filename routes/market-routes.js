const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth-middleware");

const market_controller=require("../controllers/market-controller")

router.post("/create",verifyToken,market_controller.create_market)
router.post("/request",verifyToken,market_controller.request_product)

module.exports=router;