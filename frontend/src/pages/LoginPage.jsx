import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import logo from '../assets/logo.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

 const handleLogin = async () => {
  try {
    const res = await login(username, password);

    if (res.user) {
      // Save main user info
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("userType", res.user.userType);

      // If child user, also store id and name directly
      if (res.user.userType === "child") {
        localStorage.setItem("childId", res.user.id);
        localStorage.setItem("childName", res.user.name);
        navigate("/");
      } 
      // If parent, go to dashboard
      else if (res.user.userType === "parent") {
        navigate("/");
      } 
      else {
        setError("Unknown user type");
      }
    } else {
      setError(res.message || "Login failed");
    }
  } catch (err) {
    console.error("Login error:", err);
    setError("Something went wrong. Please try again.");
  }
};


return (
  <div className="min-h-screen flex items-center justify-center bg-blue-50">
    <div className="bg-white p-10 rounded-2xl shadow-xl flex flex-col gap-4 w-96">
      
      {/* Logo */}
      <div> 
        <img
          src={logo}
          alt="ProEdge Logo"
          className="w-6 h-auto mx-auto mb-4"
        />
        <p className="text-blue-700 text-md text-center font-bold mb-4">
          ProEdge CBT Portal
        </p>
      </div>

      <h1 className="text-2xl font-bold text-blue-700 text-center">Login</h1>
      <p className="text-gray-600 text-center mb-2">
        Welcome to ProEdge CBT Portal
      </p>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border p-3 rounded-xl"
      />

      <input
        type="password"
        placeholder="Access Code"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-3 rounded-xl"
      />

      <button
        onClick={handleLogin}
        className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
      >
        Login
      </button>

      {/* 🔵 Admin Button */}
      <button
        onClick={() => navigate("/admin-login")}
        className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-3 rounded-xl font-semibold transition"
      >
        Admin Login
      </button>

      {error && (
        <p className="text-red-500 text-sm text-center mb-2">{error}</p>
      )}
    </div>
  </div>
);

};

export default LoginPage;
