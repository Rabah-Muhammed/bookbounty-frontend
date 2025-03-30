# BookBounty Frontend

This is the frontend for the **Book Management Application**, built using **React**. It interacts with the backend via a **Django REST API** and provides features for managing books, user authentication, and reading lists.

## 🚀 Features
- View book details with descriptions, genres, and authors.
- Add books to personal reading lists.
- User authentication using JWT tokens.
- Secure API communication with token refresh handling.

---

## 🛠 Installation & Setup

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/Rabah-Muhammed/bookbounty-frontend.git
cd bookbounty-frontend
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Set Up Environment Variables
Create a `.env` file in the root directory and add the following:
```env
VITE_API_BASE_URL_LOCAL=http://localhost:8000/api
VITE_API_BASE_URL_DEPLOY=https://bookbounty-backend.onrender.com/api
```

### 4️⃣ Start the Development Server
```sh
npm run dev
```

The app should now be running at `http://localhost:5173`.

---

## 🔑 Authentication
- Uses JWT-based authentication.
- Tokens are stored in **localStorage**.
- Automatically refreshes expired access tokens.
- Redirects users to `/login` when authentication fails.

---

## 📂 Folder Structure
```plaintext
src/
│── components/       # Reusable UI components
│── pages/            # Pages like Home, BookDetail, Login
│── utils/            # Utility functions (API, Toasts, etc.)
│── App.jsx           # Main app component
│── main.jsx          # Entry point
│── routes.jsx        # Route configuration
│── styles/           # Global styles
│── assets/           # Images & static assets
```

---

## 🌍 Deployment
To deploy the app, build the project and serve the static files:
```sh
npm run build
```
Then deploy the `dist/` folder using **Vercel, Netlify, or any static hosting provider**.

---

## 💡 Contributing
1. Fork the repository.
2. Create a new branch: `git checkout -b feature-branch`
3. Make your changes and commit: `git commit -m "Your feature description"`
4. Push to the branch: `git push origin feature-branch`
5. Open a Pull Request.

---

## 📜 License
This project is licensed under the **MIT License**.
