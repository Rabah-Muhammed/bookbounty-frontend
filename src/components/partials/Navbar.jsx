import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../../utils/Toast";
import { FiBook, FiUser, FiLogOut, FiLogIn, FiBookmark, FiHome } from "react-icons/fi";
import { motion } from "framer-motion";

// Define animation variants outside the components so they can be shared
const itemVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 }
};

// Reusable NavLink component
const NavLink = ({ to, icon, text, variant = "default" }) => {
  const baseClasses = "flex items-center px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 group";
  
  const variantClasses = {
    default: "text-gray-700 hover:text-black hover:bg-gray-50 focus:ring-gray-300",
    primary: "text-white bg-black hover:bg-gray-800 focus:ring-gray-500",
    secondary: "text-gray-700 border border-gray-200 hover:bg-gray-50 focus:ring-gray-300"
  };

  return (
    <motion.div variants={itemVariants}>
      <Link
        to={to}
        className={`${baseClasses} ${variantClasses[variant]}`}
      >
        <span className="mr-2 group-hover:scale-110 transition-transform">
          {icon}
        </span>
        {text}
      </Link>
    </motion.div>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("access_token");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    Toast("success", "Logged out successfully!");
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-100 px-4 py-3 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo/Brand */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={itemVariants}
          transition={{ duration: 0.3 }}
        >
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-black group-hover:text-gray-700 transition-colors" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                />
              </svg>
              <h1 className="ml-2 text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                BookBounty
              </h1>
            </div>
          </Link>
        </motion.div>

        {/* Navigation Links */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={itemVariants}
          transition={{ duration: 0.3, staggerChildren: 0.1 }}
          className="flex items-center space-x-2"
        >
          <NavLink to="/" icon={<FiHome size={18} />} text="Home" />
          <NavLink to="/books" icon={<FiBook size={18} />} text="Books" />

          {!isAuthenticated ? (
            <>
              <NavLink 
                to="/register" 
                icon={<FiUser size={18} />} 
                text="Register" 
                variant="secondary"
              />
              <NavLink 
                to="/login" 
                icon={<FiLogIn size={18} />} 
                text="Login" 
                variant="primary"
              />
            </>
          ) : (
            <>
              <NavLink 
                to="/reading-lists" 
                icon={<FiBookmark size={18} />} 
                text="Lists" 
              />
              <NavLink 
                to="/profile" 
                icon={<FiUser size={18} />} 
                text="Profile" 
              />
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 group"
              >
                <FiLogOut className="mr-2 group-hover:translate-x-0.5 transition-transform" />
                Logout
              </button>
            </>
          )}
        </motion.div>
      </div>
    </nav>
  );
};

export default Navbar;