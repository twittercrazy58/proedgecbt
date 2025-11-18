require('dotenv').config(); // <-- add this at the very top

const fs = require("fs");
const path = require("path");
const usersPath = path.join(__dirname, "../data/users.json");

const login = (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) return res.status(401).json({ message: "Invalid username or password" });

  res.json({ message: "Login successful", user });
};

const logout = (req, res) => {
  const { username } = req.body;
  const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));

  const user = users.find(u => u.username === username);
  if (user && user.role === "child") {
    user.loggedIn = false;
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  }

  res.json({ message: "Logout successful" });
};

module.exports = { login, logout };
