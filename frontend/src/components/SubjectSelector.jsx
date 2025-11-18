// src/components/SubjectSelector.jsx
import React from "react";

const SubjectSelector = ({ allowedSubjects = [], selectedSubjects, onChange }) => {
  
  const toggleSubject = (subject) => {
    if (selectedSubjects.includes(subject)) {
      onChange(selectedSubjects.filter((s) => s !== subject));
    } else if (selectedSubjects.length < 4) {
      onChange([...selectedSubjects, subject]);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Select Subjects (Max 4)</h2>
      <div className="flex flex-wrap gap-3">
        {allowedSubjects.map((subj) => (
          <button
            key={subj}
            onClick={() => toggleSubject(subj)}
            className={`px-4 py-2 rounded-lg border font-medium ${
              selectedSubjects.includes(subj)
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700 border-gray-300"
            }`}
          >
            {subj}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubjectSelector;
