import React, { useEffect, useState } from 'react';
import './History.css';

const BorrowedBooks = ({ token, user_id }) => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:8080/statusbook/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === "ok") {
          setBorrowedBooks(data.msg);
        } else {
          console.error('Error fetching borrowed books:', data.msg);
        }
      })
      .catch(error => console.error('Error fetching borrowed books:', error));
  }, [token]);


  return (
    <div>
      <h1>Hello No.{user_id}</h1>
      <table>
        <thead>
          <tr>
            <th>Book ID</th>
            <th>Borrowed Date</th>
            <th>Due Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {borrowedBooks.map(book => (
            <tr key={book.id}>
              <td>{book.book_id}</td>
              <td>{new Date(book.borrow_date).toLocaleDateString()}</td>
              <td>{new Date(book.due_date).toLocaleDateString()}</td>
              <td>{book.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BorrowedBooks;