import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://your-backend.onrender.com");

const QuestionsUploadPage = () => {

  const navigate = useNavigate();
  const [questions, setQuestions] = useState([
  {
    subject: "",
    topic: "",
    examType: "",      // <-- new field
    question: "",
    options: ["", "", "", ""],
    answer: "",
    image: null,
    imagePreview: ""
  }
]);


  const handleChange = (i, field, value) => {
    const copy = [...questions];
    copy[i][field] = value;
    setQuestions(copy);
  };

  const handleOptionChange = (qi, oi, value) => {
    const copy = [...questions];
    copy[qi].options[oi] = value;
    setQuestions(copy);
  };

  const handleImageChange = (index, file) => {
    const copy = [...questions];
    copy[index].image = file;
    copy[index].imagePreview = URL.createObjectURL(file);
    setQuestions(copy);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { subject: "", topic: "", question: "", options: ["", "", "", ""], answer: "", image: null, imagePreview: "" }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const submitQuestions = async () => {
  // Validate all questions
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.examType) {
      alert(`Please select an Exam Type for Question ${i + 1}`);
      return; // stop submission
    }
  }

  const formData = new FormData();
  questions.forEach((q) => {
    if (q.image) formData.append("images", q.image);
  });
  formData.append("data", JSON.stringify(questions));

  try {
    const res = await fetch(`${BASE_URL}/questions/add`, {
      method: "POST",
      headers: {
        "x-dev-key": import.meta.env.VITE_DEV_KEY
      },
      body: formData
    });

    if (!res.ok) {
      const errorData = await res.json();
      alert(errorData.error || "Failed to submit questions");
      return;
    }

    const data = await res.json();
    console.log(data);
    alert("Questions submitted successfully!");
    // Optional: clear form after submission
    setQuestions([
      {
        subject: "",
        topic: "",
        examType: "",
        question: "",
        options: ["", "", "", ""],
        answer: "",
        image: null,
        imagePreview: ""
      }
    ]);
  } catch (err) {
    console.error(err);
    alert("An error occurred while submitting questions.");
  }
};


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
        Questions Upload Center
      </h1>

      <div className="space-y-6">
        {questions.map((q, i) => (
          <div
            key={i}
            className="bg-white shadow-lg rounded-xl p-6 border relative"
          >
            {/* Remove Button */}
            <button
              onClick={() => removeQuestion(i)}
              className="absolute top-3 right-3 text-red-600 hover:text-red-800 text-sm font-semibold"
            >
              Remove
            </button>

            <p className="font-semibold text-gray-700 mb-4">
              Question {i + 1}
            </p>

            {/* Subject + Topic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                  <label className="text-sm font-medium text-gray-600">
                    Subject
                  </label>

                  <select
                    className="w-full border p-3 rounded-lg mt-1 bg-white"
                    onChange={(e) => handleChange(i, "subject", e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select Subject
                    </option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="English">English</option>
                    <option value="Biology">Biology</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Physics">Physics</option>
                    <option value="Economics">Economics</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Accounting">Accounting</option>
                    <option value="Government">Government</option>
                    <option value="LIT-in-English">Literature in English</option>
                  </select>
                </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Topic
                </label>
                <input
                  className="w-full border p-3 rounded-lg mt-1"
                  placeholder="e.g. Algebra"
                  onChange={(e) => handleChange(i, "topic", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Exam Type
              </label>
              <select
                className="w-full border p-3 rounded-lg mt-1 bg-white"
                onChange={(e) => handleChange(i, "examType", e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>Select Exam Type</option>
                <option value="Practice">Practice</option>
                <option value="Midterm">Midterm</option>
                <option value="WAEC">WAEC</option>
                <option value="NECO">NECO</option>
                <option value="JAMB">JAMB</option>
                <option value="BECE">BECE</option>
              </select>
            </div>


            {/* Question Input */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600">
                Question
              </label>
              <textarea
                className="w-full border p-3 rounded-lg mt-1"
                rows={3}
                placeholder="Type the question here..."
                onChange={(e) => handleChange(i, "question", e.target.value)}
              />
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {q.options.map((opt, oi) => (
                <div key={oi}>
                  <label className="text-sm font-medium text-gray-600">
                    Option {oi + 1}
                  </label>
                  <input
                    className="w-full border p-3 rounded-lg mt-1"
                    placeholder={`Option ${oi + 1}`}
                    onChange={(e) =>
                      handleOptionChange(i, oi, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>

            {/* Correct Answer */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600">
                Correct Answer
              </label>
              <input
                className="w-full border p-3 rounded-lg mt-1"
                placeholder="Enter the correct option text"
                onChange={(e) => handleChange(i, "answer", e.target.value)}
              />
            </div>

            {/* Image Upload */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600">
                Question Image (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                className="mt-1"
                onChange={(e) => handleImageChange(i, e.target.files[0])}
              />

              {q.imagePreview && (
                <img
                  src={q.imagePreview}
                  className="mt-3 w-32 h-32 object-cover rounded-lg border"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={addQuestion}
          className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-semibold"
        >
          + Add Another Question
        </button>

        <button
          onClick={submitQuestions}
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold"
        >
          Submit All Questions
        </button>
        <button
        onClick={() => navigate("/admin-login")}
        className="bg-red-400 text-white hover:bg-gray-400 hover:text-black py-3 px-6 rounded-xl font-semibold transition"
      >
        Logout
      </button>
      </div>
    </div>
  );
};

export default QuestionsUploadPage;
