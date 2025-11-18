const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const childRoutes = require("./routes/childRoutes");
const questionRoutes = require("./routes/questionRoutes");
const resultRoutes = require("./routes/resultRoutes");

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/auth", authRoutes);
app.use("/parent", childRoutes);
app.use("/questions", questionRoutes);
app.use("/test", resultRoutes);

// Serve React frontend
const frontendPath = path.join(__dirname, "../frontend/dist");

app.use(express.static(frontendPath));

app.get(/^\/.*$/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});



// Start server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
