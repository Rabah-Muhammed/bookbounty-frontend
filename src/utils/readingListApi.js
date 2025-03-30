import api from "./api";

const readingListApi = {
  getReadingLists: () => api.get("/reading-lists/"),
  createReadingList: (name) => api.post("/reading-lists/", { name }),
  deleteReadingList: (listId) => api.delete(`/reading-lists/${listId}/`),
  addBookToReadingList: (listId, bookId) => api.post(`/reading-lists/${listId}/add/${bookId}/`),
  removeBookFromReadingList: (listId, bookId) => api.delete(`/reading-lists/${listId}/remove/${bookId}/`),

};

export default readingListApi;

