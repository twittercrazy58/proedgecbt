const fs = require("fs");
const path = require("path");

const resultsPath = path.join(__dirname, "../data/results.json");

// Utility: safely read JSON file
function readResults() {
  try {
    const data = fs.readFileSync(resultsPath, "utf8") || "[]";
    const parsed = JSON.parse(data);
    // filter out empty {} entries from your file
    return parsed.filter(r => r && Object.keys(r).length > 0);
  } catch (err) {
    console.error("Error reading results.json:", err);
    return [];
  }
}

// Utility: write results safely
function writeResults(results) {
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
}


// ----------------------------------------------
// SUBMIT FULL TEST RESULTS
// ----------------------------------------------
const submitTest = (req, res) => {
  const payload = Array.isArray(req.body) ? req.body : [req.body];

  // Read existing results (child-grouped schema)
  const results = readResults(); // [{ childId, childName, tests: [...] }, ...]

  payload.forEach((r) => {
    // Check if child already exists
    let childObj = results.find((c) => c.childId === r.childId);

    if (!childObj) {
      // Create new child object
      childObj = {
        id: Date.now() + Math.random(), // unique id for child object
        childId: r.childId,
        childName: r.childName,
        tests: []
      };
      results.push(childObj);
    }

    // Prepare test object
    const testObj = {
      id: Date.now() + Math.random(), // unique test id
      exam: r.exam,
      subjects: r.subjects, // expects array [{ subject, questionsCount, correct, total, percent, topicBreakdown }]
      overallScore: r.overallScore,
      date: r.date || new Date().toISOString()
    };

    // Append new test to child's tests
    childObj.tests.push(testObj);
  });

  // Persist updated results
  writeResults(results);

  res.json({
    message: "Test submitted successfully",
    results
  });
};




// ----------------------------------------------
// GET ALL TEST RESULTS FOR A SPECIFIC CHILD
// ----------------------------------------------
const getResults = (req, res) => {
  const childId = parseInt(req.params.childId);

  const results = readResults();
  const filtered = results.filter(r => r.childId === childId);
  res.json({ results: filtered });
};


module.exports = { submitTest, getResults };

