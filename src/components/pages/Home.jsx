// src/components/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Add useNavigate
import api from "../../utils/api";
import Toast from "../../utils/Toast";

const BASE_URL = "http://127.0.0.1:8000";

const Home = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // For navigation

  useEffect(() => {
    fetchAllBooks();
  }, []);

  const fetchAllBooks = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/all-books/");
      setBooks(res.data);
    } catch (err) {
      Toast("error", "Failed to load books.");
      console.error("Fetch all books error:", err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookClick = (bookId) => {
    navigate(`/books/${bookId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          <p className="text-gray-600">Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome to Book Bounty</h1>
          <p className="mt-2 text-gray-600">Explore our community library</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.length === 0 ? (
                <div className="col-span-full text-center text-gray-600 text-lg">
                  No books available yet. Be the first to add one!
                </div>
              ) : (
                books.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => handleBookClick(book.id)} // Make card clickable
                    className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md cursor-pointer transition"
                  >
                    {book.cover_image ? (
                      <img
                        src={`${BASE_URL}${book.cover_image}`}
                        alt={`${book.title} cover`}
                        className="w-full h-48 object-cover rounded-t-lg mb-4"
                        onError={(e) => console.log("Cover image load error:", e)}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-t-lg mb-4 flex items-center justify-center text-gray-500 font-semibold">
                        No Cover
                      </div>
                    )}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{book.title}</h3>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Authors:</span> {book.authors}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Genre:</span> {book.genre}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Published:</span>{" "}
                      {new Date(book.publication_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      <span className="font-medium">Description:</span>{" "}
                      {book.description || "No description provided"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Added by: {book.created_by} on{" "}
                      {new Date(book.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;