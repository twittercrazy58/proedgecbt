const express = require("express");
const { createChild, getChildren } = require("../controllers/childController");
const router = express.Router();

router.post("/create-child", createChild);
router.get("/children/:parentId", getChildren);

module.exports = router;
