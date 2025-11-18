// src/components/NavBar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../api";

const NavBar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (user.role === "child") {
      await logout(user.username);
    }
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="w-full my-5 bg-blue-500 text-white px-6 py-4 flex justify-between items-center shadow-md">
       {/* Logo */}
    <div> 
        <p className="font-bold text-xl">ProEdge CBT Portal</p>
    </div>

      <div className="flex items-center gap-4">
        <span>{user.name}</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1 rounded-md"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
