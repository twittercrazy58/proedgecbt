const fs = require("fs");
const path = require("path");

const questionsFile = path.join(__dirname, "../data/questions.json");

// ----------------------------------------------
// Helpers
// ----------------------------------------------
function readData() {
  return JSON.parse(fs.readFileSync(questionsFile, "utf8"));
}

function writeData(data) {
  fs.writeFileSync(questionsFile, JSON.stringify(data, null, 2));
}

// ----------------------------------------------
// ADD QUESTIONS (multiple + optional images)
// ----------------------------------------------
exports.addQuestions = (req, res) => {
  try {
    const existing = readData();

    // incoming questions come as JSON string in req.body.data
    const incoming = JSON.parse(req.body.data);
    const newQuestions = Array.isArray(incoming) ? incoming : [incoming];

    let nextId = existing.length > 0 ? existing[existing.length - 1].id + 1 : 1;

    const processed = newQuestions.map((q, idx) => ({
      id: nextId + idx,
      ...q,
      image:
        req.files && req.files[idx]
          ? `/uploads/questions/${req.files[idx].filename}`
          : null,
    }));

    const updated = [...existing, ...processed];
    writeData(updated);

    res.json({ message: "Questions added successfully", added: processed });
  } catch (err) {
    console.error("Add question error:", err);
    res.status(500).json({ error: "Error saving questions" });
  }
};

// ----------------------------------------------
// UPDATE QUESTION
// ----------------------------------------------
exports.updateQuestion = (req, res) => {
  try {
    const { id } = req.params;

    let data = readData();
    const index = data.findIndex((q) => q.id == id);
    if (index === -1)
      return res.status(404).json({ error: "Question not found" });

    let updatedFields = {};

    if (req.body.data) {
      updatedFields = JSON.parse(req.body.data);
    }

    // New image uploaded?
    if (req.file) {
      updatedFields.image = `/uploads/questions/${req.file.filename}`;
    }

    // Merge updates
    data[index] = { ...data[index], ...updatedFields };

    writeData(data);

    res.json({ message: "Question updated", updated: data[index] });
  } catch (err) {
    console.error("Update question error:", err);
    res.status(500).json({ error: "Error updating question" });
  }
};

// ----------------------------------------------
// DELETE QUESTION
// ----------------------------------------------
exports.deleteQuestion = (req, res) => {
  try {
    const { id } = req.params;

    let data = readData();
    const index = data.findIndex((q) => q.id == id);

    if (index === -1)
      return res.status(404).json({ error: "Question not found" });

    const removed = data.splice(index, 1);
    writeData(data);

    res.json({ message: "Question deleted", removed });
  } catch (err) {
    console.error("Delete question error:", err);
    res.status(500).json({ error: "Error deleting question" });
  }
};

// ----------------------------------------------
// GET QUESTIONS BY exam + subject
// ----------------------------------------------
exports.getQuestions = (req, res) => {
  try {
    const { exam, subject } = req.query;
    const questions = readData();

    const filtered = questions.filter(
      (q) => q.exam === exam && q.subject === subject
    );

    res.json(filtered);
  } catch (err) {
    console.error("Get questions error:", err);
    res.status(500).json({ error: "Could not load questions" });
  }
};
