import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { MEDIA_BASE_URL } from "../../utils/api";
import Toast from "../../utils/Toast";
import { FiArrowLeft, FiBookmark, FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";

const BookDetail = () => {
  const [book, setBook] = useState(null);
  const [readingLists, setReadingLists] = useState([]);
  const [selectedList, setSelectedList] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingToList, setIsAddingToList] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookDetail();
    fetchReadingLists();
  }, [id]);

  const fetchBookDetail = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/books/${id}/detail/`);
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

  const fetchReadingLists = async () => {
    try {
      const res = await api.get(`/reading-lists/`);
      setReadingLists(res.data);
    } catch (err) {
      console.error("Error fetching reading lists:", err);
      Toast("error", "Failed to fetch reading lists.");
    }
  };

  const handleAddToReadingList = async () => {
    if (!selectedList) {
      Toast("warning", "Please select a reading list.");
      return;
    }

    try {
      setIsAddingToList(true);
      await api.post(`/reading-lists/${selectedList}/add-book/`, {
        book_id: book.id,
      });
      Toast("success", "Book added to reading list!");
    } catch (err) {
      console.error("Error adding book to reading list:", err);
      Toast("error", err.response?.data?.detail || "Failed to add book to reading list.");
    } finally {
      setIsAddingToList(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          <p className="text-gray-600 text-lg">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with back button */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-black transition-colors duration-200"
          >
            <FiArrowLeft className="mr-2" />
            <span className="font-medium">Back</span>
          </button>
        </div>

        {/* Book Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
        >
          <div className="flex flex-col lg:flex-row">
            {/* Cover Image Section */}
            <div className="lg:w-1/3 p-6 lg:p-8 flex justify-center bg-gray-50">
              {book.cover_image ? (
                <motion.img
                  src={
                    window.location.hostname === "localhost"
                      ? `${MEDIA_BASE_URL}${book.cover_image}`
                      : book.cover_image
                  }
                  alt={`${book.title} cover`}
                  className="w-full max-w-xs h-auto object-cover rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                  whileHover={{ scale: 1.02 }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/300x450?text=No+Cover";
                  }}
                />
              ) : (
                <div className="w-full max-w-xs h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-gray-400 font-medium text-lg shadow-lg">
                  No Cover Available
                </div>
              )}
            </div>

            {/* Book Info Section */}
            <div className="lg:w-2/3 p-6 lg:p-8">
              <div className="space-y-6">
                {/* Title and Authors */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                    {book.title}
                  </h1>
                  <p className="mt-2 text-lg text-gray-600 italic">
                    by {book.authors || "Unknown Author"}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Genre
                    </h3>
                    <p className="mt-1 text-gray-900 font-medium">
                      {book.genre || "Not specified"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Published
                    </h3>
                    <p className="mt-1 text-gray-900 font-medium">
                      {book.publication_date
                        ? new Date(book.publication_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                          })
                        : "Unknown"}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {book.description || "No description available for this book."}
                  </p>
                </div>

                {/* Add to List Section */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <FiBookmark className="mr-2" />
                    Save to Reading List
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      value={selectedList}
                      onChange={(e) => setSelectedList(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                    >
                      <option value="">Select a reading list</option>
                      {readingLists.map((list) => (
                        <option key={list.id} value={list.id}>
                          {list.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddToReadingList}
                      disabled={!selectedList || isAddingToList}
                      className={`flex items-center justify-center px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition ${
                        !selectedList || isAddingToList ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {isAddingToList ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Adding...
                        </>
                      ) : (
                        <>
                          <FiPlus className="mr-1" />
                          Add to List
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-100 text-sm text-gray-500">
                  <p>
                    Added by <span className="font-medium text-gray-700">{book.created_by}</span> on{" "}
                    {new Date(book.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookDetail;
