import React, { useState } from 'react';
import "./Addbook.css"

const AddBook = ({ token }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [totalCopies, setTotalCopies] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          author,
          description,
          category_id: categoryId,
          total_copies: parseInt(totalCopies)
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`Book added successfully. Book ID: ${data.bookId}`);
        setTitle('');
        setAuthor('');
        setDescription('');
        setCategoryId('');
        setTotalCopies('');
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error adding book:', error);
      setMessage('Error adding book');
    }
  };

  return (
    <div className="add-book-container">
      <h1>Add New Book</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <input
          type="number"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          placeholder="Category ID"
        />
        <input
          type="number"
          value={totalCopies}
          onChange={(e) => setTotalCopies(e.target.value)}
          placeholder="Total Copies"
          required
        />
        <button type="submit">Add Book</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default AddBook;