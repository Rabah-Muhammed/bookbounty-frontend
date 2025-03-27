import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../utils/api";
import Toast from "../../utils/Toast";

const Register = () => {
  const [formData, setFormData] = useState({ 
    username: "", 
    email: "", 
    phone: "", 
    password: "", 
    confirm_password: "" 
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirm_password) {
      Toast("error", "Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      await api.post("/register/", formData);
      Toast("success", "Registration successful!");
      navigate("/login");
    } catch (err) {
      if (err.response && err.response.data) {
        const errorMessages = Object.values(err.response.data).flat(); 
        Toast("error", errorMessages[0]);
      } else {
        Toast("error", "Registration failed. Try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600 text-sm">Join our community</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>

            <div>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>

            <div>
              <input
                type="password"
                name="confirm_password"
                placeholder="Confirm Password"
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 text-sm rounded bg-gray-900 text-white hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-700 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </span>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-gray-900 hover:text-gray-700 font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;