import React, { useState, useEffect } from 'react';
import './ReturnRequests.css';

const ReturnRequests = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const fetchBorrowedBooks = async () => {
    try {
      const response = await fetch('http://localhost:8080/borrowed-books', {
        method:"GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.status === 'ok') {
        setBorrowedBooks(data.borrowings || []);
      } else {
        setError(data.msg || 'Failed to fetch borrowed books.');
      }
    } catch (err) {
      setError('Failed to fetch borrowed books.');
    }
  };

  const handleReturn = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/return/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await response.json();
      if (response.ok) {
        alert(`Book returned successfully. ${data.fine > 0 ? `Fine: $${data.fine}` : 'No fine.'}`);
        fetchBorrowedBooks();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to return book.');
    }
  };

  return (
    <div className="return-requests-container">
      <h1 style={{marginBottom:"20px"}}>Borrowed Books</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="borrowed-books-list">
        {borrowedBooks.length === 0 ? (
          <p>No borrowed books found.</p>
        ) : (
          borrowedBooks.map((book) => (
            <div key={book.id} className="borrowed-book-item">
              <div className="book-info">
                <h3>{book.title}</h3>
                <p>Borrowing ID: {book.id}</p>
                <p>Username: {book.username}</p>
                <p>Borrow Date: {new Date(book.borrow_date).toLocaleDateString()}</p>
                <p>Due Date: {new Date(book.due_date).toLocaleDateString()}</p>
                <p>Status: {book.status}</p>
              </div>
              {book.status === 'approved' && (
                <button 
                  className="return-button" 
                  onClick={() => handleReturn(book.id)}
                >
                  Return Book
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReturnRequests;