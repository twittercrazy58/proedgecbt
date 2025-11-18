const fs = require("fs");
const path = require("path");
const usersPath = path.join(__dirname, "../data/users.json");

const createChild = (req, res) => {
  const { name, username, password, examType, parentId } = req.body;

  if (!name || !username || !password || !examType || !parentId)
    return res.status(400).json({ message: "All fields are required" });

  const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));

  if (users.find(u => u.username === username))
    return res.status(400).json({ message: "Username already exists" });

  const newChild = {
    id: Date.now(),   // Unique ID, avoid duplicates
    parentId,
    name,
    username,
    password,
    examType,
    userType: "child",
  };

  // Add child to users
  users.push(newChild);

  // Update parent's childrenIds
  const parent = users.find(u => u.id === parentId && u.userType === "parent");

  if (parent) {
    if (!parent.childrenIds) parent.childrenIds = [];
    parent.childrenIds.push(newChild.id);
  }

  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

  res.json({ message: "Child created successfully", child: newChild });
};

const getChildren = (req, res) => {
  const parentId = parseInt(req.params.parentId);
  const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));

  // Find parent
  const parent = users.find(u => u.id === parentId && u.userType === "parent");

  if (!parent)
    return res.status(404).json({ message: "Parent not found" });

  if (!parent.childrenIds || parent.childrenIds.length === 0)
    return res.json([]); // No children yet

  // Fetch only the children listed in childrenIds
  const children = users.filter(u => parent.childrenIds.includes(u.id));

  res.json(children);
};

module.exports = { createChild, getChildren };
