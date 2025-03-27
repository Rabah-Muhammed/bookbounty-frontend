// src/components/pages/BookDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Toast from "../../utils/Toast";

const BASE_URL = "http://127.0.0.1:8000";

const BookDetail = () => {
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookDetail();
  }, [id]);

  const fetchBookDetail = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/books/${id}/detail/`); // Updated endpoint
      setBook(res.data);
    } catch (err) {
      Toast("error", "Failed to load book details.");
      console.error("Fetch book detail error:", err.response?.data || err.message);
      if (err.response?.status === 404) {
        navigate("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          <p className="text-gray-600">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{book.title}</h1>
          <p className="mt-2 text-gray-600">Book Details</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:space-x-6">
            <div className="flex-shrink-0 mb-6 md:mb-0">
              {book.cover_image ? (
                <img
                  src={`${BASE_URL}${book.cover_image}`}
                  alt={`${book.title} cover`}
                  className="w-full md:w-64 h-96 object-cover rounded-lg shadow-md"
                  onError={(e) => console.log("Cover image load error:", e)}
                />
              ) : (
                <div className="w-full md:w-64 h-96 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-semibold shadow-md">
                  No Cover
                </div>
              )}
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{book.title}</h2>
                <p className="text-gray-600 text-sm mt-1">
                  <span className="font-medium">Authors:</span> {book.authors}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Genre:</span> {book.genre}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Published:</span>{" "}
                  {new Date(book.publication_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Description:</span>{" "}
                  {book.description || "No description provided"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  Added by: {book.created_by} on{" "}
                  {new Date(book.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => navigate("/")}
                  className="px-6 py-3 text-sm font-semibold rounded-lg bg-black text-white hover:bg-gray-800 focus:outline-none shadow-md transition"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;