// src/components/pages/Books.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../utils/api";
import Toast from "../../utils/Toast";

const BASE_URL = "http://127.0.0.1:8000";

const Books = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    authors: "",
    genre: "",
    publication_date: "",
    description: "",
    cover_image: null,
  });
  const [editBookId, setEditBookId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("access_token");

  useEffect(() => {
    if (isAuthenticated) {
      fetchBooks();
    }
  }, [isAuthenticated]);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/books/");
      setBooks(res.data);
    } catch (err) {
      Toast("error", "Failed to load your books.");
      console.error("Fetch books error:", err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, cover_image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      Toast("error", `Please log in to ${editBookId ? "edit" : "add"} a book.`);
      navigate("/login");
      return;
    }

    setIsLoading(true);
    const data = new FormData();
    data.append("title", formData.title);
    data.append("authors", formData.authors);
    data.append("genre", formData.genre);
    data.append("publication_date", formData.publication_date);
    data.append("description", formData.description);
    if (formData.cover_image) {
      data.append("cover_image", formData.cover_image);
    }

    try {
      if (editBookId) {
        const res = await api.put(`/books/${editBookId}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setBooks(books.map((book) => (book.id === editBookId ? res.data : book)));
        Toast("success", "Book updated successfully!");
      } else {
        const res = await api.post("/books/", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setBooks([res.data, ...books]);
        Toast("success", "Book added successfully!");
      }
      setFormData({ title: "", authors: "", genre: "", publication_date: "", description: "", cover_image: null });
      setEditBookId(null);
      setIsFormVisible(false);
    } catch (err) {
      Toast("error", `Failed to ${editBookId ? "update" : "add"} book.`);
      console.error("Submit error:", err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (book) => {
    setFormData({
      title: book.title,
      authors: book.authors,
      genre: book.genre,
      publication_date: book.publication_date,
      description: book.description || "",
      cover_image: null,
    });
    setEditBookId(book.id);
    setIsFormVisible(true);
  };

  const handleDelete = async (bookId) => {
    if (!isAuthenticated) {
      Toast("error", "Please log in to delete a book.");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      await api.delete(`/books/${bookId}/delete/`);
      setBooks(books.filter((book) => book.id !== bookId));
      Toast("success", "Book removed successfully!");
    } catch (err) {
      Toast("error", "Failed to remove book.");
      console.error("Delete error:", err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Books</h2>
          <p className="text-gray-600 mb-6">Please log in to view or manage your books.</p>
          <Link
            to="/login"
            className="px-6 py-3 text-sm font-semibold rounded-lg bg-black text-white hover:bg-gray-800 focus:outline-none shadow-md transition"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading && books.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          <p className="text-gray-600">Loading your books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Your Books</h2>
          <p className="mt-2 text-gray-600">Manage your personal book collection</p>
        </div>

        <div className="flex justify-end mb-6">
          <button
            onClick={() => {
              if (!isFormVisible) {
                setFormData({ title: "", authors: "", genre: "", publication_date: "", description: "", cover_image: null });
                setEditBookId(null);
              }
              setIsFormVisible(!isFormVisible);
            }}
            className="px-6 py-3 text-sm font-semibold rounded-lg bg-black text-white hover:bg-gray-800 focus:outline-none shadow-md transition"
          >
            {isFormVisible ? "Close Form" : "Add New Book"}
          </button>
        </div>

        {isFormVisible && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
              <h3 className="text-2xl font-semibold text-gray-900">
                {editBookId ? "Edit Book" : "Add New Book"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 bg-gray-50"
                    placeholder="Enter book title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Authors</label>
                  <input
                    type="text"
                    name="authors"
                    value={formData.authors}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 bg-gray-50"
                    placeholder="e.g., J.K. Rowling"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                  <input
                    type="text"
                    name="genre"
                    value={formData.genre}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 bg-gray-50"
                    placeholder="e.g., Fantasy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publication Date
                  </label>
                  <input
                    type="date"
                    name="publication_date"
                    value={formData.publication_date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 bg-gray-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 bg-gray-50"
                  rows="4"
                  placeholder="Optional book description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                <input
                  type="file"
                  name="cover_image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 transition cursor-pointer"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-6 py-3 text-sm font-semibold rounded-lg bg-black text-white hover:bg-gray-800 focus:outline-none shadow-md transition ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Saving..." : editBookId ? "Update Book" : "Add Book"}
                </button>
                {editBookId && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ title: "", authors: "", genre: "", publication_date: "", description: "", cover_image: null });
                      setEditBookId(null);
                      setIsFormVisible(false);
                    }}
                    className="px-6 py-3 text-sm font-semibold rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none shadow-md transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.length === 0 ? (
              <div className="col-span-full text-center text-gray-600 text-lg">
                You haven’t added any books yet. Add one to get started!
              </div>
            ) : (
              books.map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition"
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
                  <p className="text-xs text-gray-500 mb-4">
                    Added on {new Date(book.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(book)}
                      className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-black text-white hover:bg-gray-800 focus:outline-none transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 focus:outline-none transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Books;