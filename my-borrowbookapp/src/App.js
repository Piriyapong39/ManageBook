import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import BookList from './components/Booklist';
import AddBook from './components/Addbook';
import Navbar from './components/tools/Navbar';
import BorrowedBooks from './components/History';
import ManageRequests from './components/ManageRequests'; 
import ReturnRequests from './components/ReturnRequests';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const status = localStorage.getItem("status");
  const user_id = localStorage.getItem("user_id");
  const isAdmin = status === "admin";
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('status');
    setToken(null);
  };

  return (
    <Router>
      <div className="App">
        <Navbar isAdmin={isAdmin} onLogout={handleLogout} />
        <Routes>
          {!token ? (
            <>
              <Route path="/login" element={<Login setToken={setToken} />} />
              <Route path="/register" element={<Register setToken={setToken} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<BookList token={token} />} />
              {isAdmin && (
                <>
                  <Route path="/add-book" element={<AddBook token={token} />} />
                  <Route path="/manage-requests" element={<ManageRequests token={token} />} />
                  <Route path="/return-requests" element={<ReturnRequests token={token} />} />

                </>
              )}
              <Route path="/borrowed-books" element={<BorrowedBooks token={token} user_id={user_id} />} />
              <Route path="/logout" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
