const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth-middleware");

const sub_controller=require("../controllers/sub-controller")

router.post("/create",verifyToken,sub_controller.create_sub)
router.post("/request",verifyToken,sub_controller.request_product)

module.exports=router;
