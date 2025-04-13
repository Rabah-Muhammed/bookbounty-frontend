import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { MEDIA_BASE_URL } from "../../utils/api";
import Toast from "../../utils/Toast";
import Swal from "sweetalert2";



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
  const [coverPreview, setCoverPreview] = useState("");
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("access_token");

  useEffect(() => {
    if (isAuthenticated) {
      fetchBooks();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (formData.cover_image) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(formData.cover_image);
    }
  }, [formData.cover_image]);

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
      setCoverPreview("");
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

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      background: "#fff",
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        await api.delete(`/books/${bookId}/delete/`);
        setBooks(books.filter((book) => book.id !== bookId));
        Toast("success", "Book removed successfully!");
        Swal.fire("Deleted!", "Your book has been deleted.", "success");
      } catch (err) {
        Toast("error", "Failed to remove book.");
        console.error("Delete error:", err.response?.data || err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 p-4 rounded-full">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-10 w-10 text-gray-600" 
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
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Books</h2>
          <p className="text-gray-600 mb-6">Please log in to view or manage your books.</p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-black text-white hover:bg-gray-800 focus:outline-none shadow-md transition"
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Books</h1>
            <p className="mt-2 text-gray-600">
              {isFormVisible ? "Add or edit your books" : "Manage your personal book collection"}
            </p>
          </div>
          {!isFormVisible && (
            <button
              onClick={() => {
                setFormData({ title: "", authors: "", genre: "", publication_date: "", description: "", cover_image: null });
                setEditBookId(null);
                setIsFormVisible(true);
              }}
              className="mt-4 sm:mt-0 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Add New Book
            </button>
          )}
        </div>

        {/* Form Section */}
        {isFormVisible && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-8">
            <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
              <div className="px-6 py-8 space-y-8">
                <h3 className="text-2xl font-semibold text-gray-900">
                  {editBookId ? "Edit Book" : "Add New Book"}
                </h3>
                
                {/* Cover Image Upload */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative group w-full max-w-xs">
                    <div className="w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200 shadow-inner">
                      {coverPreview ? (
                        <img
                          src={coverPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-16 w-16 text-gray-400" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={1} 
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-4 right-4 bg-black text-white p-2 rounded-full cursor-pointer hover:bg-gray-800 transition">
                      <input
                        type="file"
                        name="cover_image"
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Click on the icon to upload a cover image
                  </p>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title*
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                      placeholder="Book title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Authors*
                    </label>
                    <input
                      type="text"
                      name="authors"
                      value={formData.authors}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                      placeholder="Author names"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Genre*
                    </label>
                    <input
                      type="text"
                      name="genre"
                      value={formData.genre}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                      placeholder="e.g., Fiction, Science"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Publication Date*
                    </label>
                    <input
                      type="date"
                      name="publication_date"
                      value={formData.publication_date}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                      placeholder="A brief summary of the book..."
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormVisible(false);
                    setCoverPreview("");
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 ${
                    isLoading ? "opacity-80 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
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
                      Saving...
                    </span>
                  ) : editBookId ? (
                    "Update Book"
                  ) : (
                    "Add Book"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Books List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          {books.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-6">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-full w-full" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No books found</h3>
              <p className="text-gray-600 mb-6">Add your first book to get started</p>
              <button
                onClick={() => setIsFormVisible(true)}
                className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-lg bg-black text-white hover:bg-gray-800 focus:outline-none shadow-md transition"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                  />
                </svg>
                Add Your First Book
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {books.map((book) => (
                <div key={book.id} className="px-6 py-6 hover:bg-gray-50 transition">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Book Cover */}
                    <div className="w-32 h-48 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      {book.cover_image ? (
                        <img
                          src={
                            window.location.hostname === "localhost"
                              ? `${MEDIA_BASE_URL}${book.cover_image}`
                              : book.cover_image
                          }
                          alt={`${book.title} cover`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/300x450?text=No+Cover";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-10 w-10 text-gray-400" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={1} 
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Book Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{book.title}</h3>
                          <p className="text-gray-600 mb-2">by {book.authors}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(book)}
                            className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(book.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-full transition"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center space-x-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {book.genre}
                        </span>
                        <span className="text-sm text-gray-500">
                          Published: {new Date(book.publication_date).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="mt-3 text-gray-600 line-clamp-2">
                        {book.description || "No description provided"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Books;