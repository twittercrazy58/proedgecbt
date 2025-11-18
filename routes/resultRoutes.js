const express = require("express");
const { submitTest, getResults } = require("../controllers/resultController");
const router = express.Router();

router.post("/submit", submitTest);
router.get("/results/:childId", getResults);

module.exports = router;
