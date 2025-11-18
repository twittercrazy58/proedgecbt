import React, { useState } from "react";
import { createChild } from "../api";
import { useNavigate } from "react-router-dom";

const AddChildPage = () => {
  const navigate = useNavigate();
  const parent = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    examType: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const payload = {
        ...form,
        parentId: parent.id,
      };

      const response = await createChild(payload);

      if (response.message) {
        setMsg("Child added successfully!");
        setTimeout(() => navigate("/"), 1500);
      } else {
        setMsg("Error adding child.");
      }
    } catch (err) {
      setMsg("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">

        <h2 className="text-2xl font-semibold mb-4 text-center">
          ➕ Add New Child
        </h2>

        {msg && <p className="text-center text-green-600 mb-3">{msg}</p>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Child's Full Name"
            className="w-full p-3 border rounded-lg"
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="username"
            placeholder="Child's Username"
            className="w-full p-3 border rounded-lg"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg"
            onChange={handleChange}
            required
          />

          <select
            name="examType"
            className="w-full p-3 border rounded-lg"
            onChange={handleChange}
            required
          >
            <option value="">Select Exam Type</option>
            <option value="BECE">BECE</option>
            <option value="WAEC">WAEC</option>
            <option value="NECO">NECO</option>
          </select>

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
          >
            {loading ? "Creating..." : "Create Child Account"}
          </button>
        </form>

        <button
          onClick={() => navigate("/")}
          className="mt-4 w-full bg-gray-300 hover:bg-gray-400 py-2 rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default AddChildPage;
