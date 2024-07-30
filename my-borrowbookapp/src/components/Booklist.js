import React, { useEffect, useState } from 'react';
import "./Booklist.css";

const BookList = ({ token }) => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('http://localhost:8080/books', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }
        const data = await response.json();
        setBooks(data);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };
    fetchBooks();
  }, [token]);

  const borrowBook = async (bookId) => {
    const confirmBorrow = window.confirm('Are you sure ?');
    if (!confirmBorrow) return; 

    try {
      const response = await fetch('http://localhost:8080/borrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ book_id: bookId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message);
        throw new Error('Failed to borrow book');
      }

      const data = await response.json();
      alert(data.message);
      setBooks(books.map(book => 
        book.id === bookId ? { ...book, available_copies: book.available_copies - 1 } : book
      ));
    } catch (error) {
      console.error('Error borrowing book:', error);
    }
  };

  return (
    <div className="book-list">
      {books.map((book) => (
        <div className="card" key={book.id}>
          <h2 className="card-title">{book.title}</h2>
          <p className="card-author">Author: {book.author}</p>
          <p className="card-stock">Available copies: {book.available_copies}</p>
          <button onClick={() => borrowBook(book.id)} disabled={book.available_copies === 0}>ยืม</button>
        </div>
      ))}
    </div>
  );
};

export default BookList;
