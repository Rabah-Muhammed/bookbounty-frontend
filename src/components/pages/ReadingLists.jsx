import React, { useEffect, useState } from "react";
import Toast from "../../utils/Toast";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api from "../../utils/api";
import { FiPlus, FiTrash2, FiX, FiMenu } from "react-icons/fi";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

const ReadingLists = () => {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    fetchReadingLists();
  }, []);

  const fetchReadingLists = async () => {
    try {
      const res = await api.get("/reading-lists/");
      const orderedLists = res.data.map(list => ({
        ...list,
        books: list.books?.sort((a, b) => a.order - b.order) || []
      }));
      setLists(orderedLists);
    } catch (error) {
      console.error("Failed to fetch reading lists:", error);
      Toast("error", "Failed to fetch reading lists.");
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    try {
      setIsCreating(true);
      await api.post("/reading-lists/", { name: newListName });
      setNewListName("");
      fetchReadingLists();
      Toast("success", "Reading list created!");
    } catch (error) {
      Toast("error", "Failed to create list.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteList = async (listId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to recover this reading list!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      background: "#fff",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/reading-lists/${listId}/`);
        setLists(lists.filter(list => list.id !== listId));
        Toast("success", "Reading list deleted!");
      } catch (error) {
        Toast("error", "Failed to delete list.");
      }
    }
  };

  const handleRemoveBook = async (listId, bookId) => {
    try {
      await api.delete(`/reading-lists/${listId}/remove/${bookId}/`);
      setLists(prevLists =>
        prevLists.map(list =>
          list.id === listId
            ? { 
                ...list, 
                books: list.books.filter(book => book.book_details.id !== bookId) 
              }
            : list
        )
      );
      Toast("success", "Book removed from list!");
    } catch (error) {
      console.error("Error Removing Book:", error.response ? error.response.data : error);
      Toast("error", error.response?.data?.detail || "Failed to remove book.");
    }
  };

  const handleDragEnd = async (result, listId) => {
    if (!result.destination) return;

    const originalLists = [...lists];
    
    const updatedLists = lists.map(list => {
      if (list.id === listId) {
        const reorderedBooks = [...list.books];
        const [movedBook] = reorderedBooks.splice(result.source.index, 1);
        reorderedBooks.splice(result.destination.index, 0, movedBook);
        
        const booksWithUpdatedOrder = reorderedBooks.map((book, index) => ({
          ...book,
          order: index
        }));
        
        return { ...list, books: booksWithUpdatedOrder };
      }
      return list;
    });

    setLists(updatedLists);

    try {
      setIsReordering(true);
      const list = updatedLists.find(l => l.id === listId);
      
      const reorderPayload = {
        books: list.books.map((book, index) => ({
          id: book.id,
          order: index
        }))
      };

      await api.put(`/reading-lists/${listId}/reorder/`, reorderPayload);
      await fetchReadingLists();
      Toast("success", "Book order saved!");
    } catch (error) {
      console.error("Failed to save order:", error);
      setLists(originalLists);
      Toast("error", error.response?.data?.detail || "Failed to save book order.");
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Reading Lists</h1>
            <p className="text-gray-600 mt-2">Organize your books into custom collections</p>
          </div>
          
          {/* Create List Input */}
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <input
              type="text"
              placeholder="New list name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 w-full max-w-xs"
            />
            <button
              onClick={handleCreateList}
              disabled={isCreating || !newListName.trim()}
              className={`flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition ${
                (isCreating || !newListName.trim()) ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isCreating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <FiPlus className="mr-1" />
                  Create
                </>
              )}
            </button>
          </div>
        </div>

        {/* Reordering Overlay */}
        {isReordering && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Saving new order...</span>
            </div>
          </div>
        )}

        {/* Lists Section */}
        {lists.length > 0 ? (
          <div className="space-y-6">
            {lists.map((list) => (
              <motion.div 
                key={list.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="text-xl font-semibold text-gray-900">{list.name}</h3>
                  <button
                    onClick={() => handleDeleteList(list.id)}
                    className="text-gray-500 hover:text-red-600 transition p-1 rounded-full hover:bg-red-50"
                    title="Delete list"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>

                <DragDropContext onDragEnd={(result) => handleDragEnd(result, list.id)}>
                  <Droppable droppableId={list.id.toString()}>
                    {(provided) => (
                      <ul
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="divide-y divide-gray-100"
                      >
                        {list.books && list.books.length > 0 ? (
                          list.books.map((book, index) => (
                            <Draggable key={book.id} draggableId={book.id.toString()} index={index}>
                              {(provided) => (
                                <li
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="bg-white hover:bg-gray-50 transition"
                                >
                                  <div className="flex items-center justify-between p-4">
                                    <div className="flex items-center space-x-3">
                                      <div {...provided.dragHandleProps} className="text-gray-400 hover:text-gray-600 cursor-move">
                                        <FiMenu size={18} />
                                      </div>
                                      <span className="font-medium text-gray-800">
                                        {book.book_details?.title || "No Title Available"}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleRemoveBook(list.id, book.book_details.id)}
                                      className="text-gray-400 hover:text-red-600 transition p-1 rounded-full hover:bg-red-50"
                                      title="Remove book"
                                    >
                                      <FiX size={18} />
                                    </button>
                                  </div>
                                </li>
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <li className="p-4 text-center text-gray-500">
                            No books in this list yet
                          </li>
                        )}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </DragDropContext>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center"
          >
            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reading lists yet</h3>
            <p className="text-gray-600 mb-4">Create your first reading list to organize your books</p>
            <button
              onClick={() => document.querySelector('input[type="text"]').focus()}
              className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            >
              <FiPlus className="mr-2" />
              Create List
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ReadingLists;