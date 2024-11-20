const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth-middleware");

const main_controller=require("../controllers/main-controller")
const product_controller=require("../controllers/product-controller")

router.post("/create-main",verifyToken,main_controller.create_main)


router.post("/create",verifyToken,product_controller.create_product)
router.put("/update",verifyToken,product_controller.update_product)
router.delete("/delete",verifyToken,product_controller.delete_product)

module.exports=router;