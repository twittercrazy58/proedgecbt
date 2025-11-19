import React, { useEffect, useState } from "react";

const BASE_URL = window.location.hostname === "localhost" ? "http://localhost:5000" : "https://proedgecbt-1.onrender.com";
      // import.meta.env.VITE_API_URL || 
  

const ManageQuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [editing, setEditing] = useState(null); // question being edited
  const [imageFile, setImageFile] = useState(null);

  const devKey = process.env.REACT_APP_DEV_KEY;

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    const res = await fetch(`${BASE_URL}/questions`, {
      headers: { "x-dev-key": devKey }
    });
    setQuestions(await res.json());
  };

  const startEdit = (q) => {
    setEditing({ ...q }); // clone to avoid direct mutation
  };

  const saveEdit = async () => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(editing));
    if (imageFile) formData.append("image", imageFile);

    await fetch(`${API}/update/${editing.id}`, {
      method: "PUT",
      headers: { "x-dev-key": devKey },
      body: formData
    });

    setEditing(null);
    setImageFile(null);
    loadQuestions();
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm("Delete this question?")) return;

    await fetch(`${API}/delete/${id}`, {
      method: "DELETE",
      headers: { "x-dev-key": devKey }
    });

    loadQuestions();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Questions</h1>

      {/* EDIT MODAL */}
      {editing && (
        <div className="border p-4 bg-gray-50 rounded mb-6">
          <h3 className="font-semibold text-lg mb-3">Editing Question #{editing.id}</h3>

          <input
            className="block w-full mb-2 border p-2"
            value={editing.subject}
            onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
            placeholder="Subject"
          />

          <input
            className="block w-full mb-2 border p-2"
            value={editing.topic}
            onChange={(e) => setEditing({ ...editing, topic: e.target.value })}
            placeholder="Topic"
          />

          <textarea
            className="block w-full mb-2 border p-2"
            value={editing.question}
            onChange={(e) => setEditing({ ...editing, question: e.target.value })}
            placeholder="Question"
          />

          {/* OPTIONS */}
          {editing.options?.map((opt, i) => (
            <input
              key={i}
              className="block w-full mb-2 border p-2"
              value={opt}
              onChange={(e) => {
                const copy = [...editing.options];
                copy[i] = e.target.value;
                setEditing({ ...editing, options: copy });
              }}
              placeholder={`Option ${i + 1}`}
            />
          ))}

          <input
            className="block w-full mb-2 border p-2"
            value={editing.answer}
            onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
            placeholder="Correct Answer"
          />

          {/* IMAGE */}
          <div className="mb-3">
            <label className="font-medium">Replace Image (optional):</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
          </div>

          <button className="bg-blue-600 text-white px-4 py-2 rounded mr-2" onClick={saveEdit}>
            Save Changes
          </button>
          <button className="bg-gray-400 px-4 py-2 rounded" onClick={() => setEditing(null)}>
            Cancel
          </button>
        </div>
      )}

      {/* LIST QUESTIONS */}
      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.id} className="border p-3 rounded bg-white">
            <div className="font-semibold">{q.subject} — {q.topic}</div>
            <div>{q.question}</div>

            {q.image && (
              <img src={q.image} alt="" className="w-40 mt-2 border rounded" />
            )}

            <div className="mt-3 flex gap-3">
              <button className="bg-yellow-500 px-3 py-1 text-white rounded" onClick={() => startEdit(q)}>
                Edit
              </button>
              <button className="bg-red-600 px-3 py-1 text-white rounded" onClick={() => deleteQuestion(q.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageQuestionsPage;
