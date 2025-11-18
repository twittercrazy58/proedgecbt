const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  addQuestions,
  getQuestions,
  updateQuestion,
  deleteQuestion
} = require("../controllers/questionController");

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/questions/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname))
});

const upload = multer({ storage });

// Developer-only auth
const devAuth = (req, res, next) => {
  const devKey = req.headers["x-dev-key"];
  if (devKey !== process.env.DEV_KEY) return res.status(403).json({ error: "Unauthorized" });
  next();
};

// Existing routes
router.get("/", getQuestions);
router.post("/add", devAuth, upload.array("images"), addQuestions);

// New Edit route (single image)
router.put("/update/:id", devAuth, upload.single("image"), updateQuestion);

// New Delete route
router.delete("/delete/:id", devAuth, deleteQuestion);

module.exports = router;
