// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Register from "./components/pages/Register";
import Login from "./components/pages/Login";
import Home from "./components/pages/Home";
import Profile from "./components/pages/Profile";
import Books from "./components/pages/Books";
import Navbar from "./components/partials/Navbar";
import BookDetail from "./components/pages/BookDetail";
import ReadingLists from "./components/pages/ReadingLists";


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/books" element={<Books />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/reading-lists" element={<ReadingLists />} />
        <Route path="*" element={<div className="text-center py-10 text-white">404 - Page Not Found</div>} />
      </Routes>
      
    </Router>
  );
}

export default App;