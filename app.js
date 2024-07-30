const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();
const SaltRound = Number(process.env.SaltRound)

const app = express();
app.use(cors());
app.use(express.json());



// Database connection
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'library_db',
});


// Middleware for JWT authentication
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401)
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403)
      req.user = user
      next()
    })
  }
  

// Middleware is Admin
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }
    next()
  };
  


// Registration
app.post('/register', async (req, res) => {
    try {
      const { username, email, full_name } = req.body;
      if (!username || !email || !full_name || !password) {
        return res.status(400).json({ message: 'Need required' });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Wrong formant email' });
      }
      const [existingUser] = await pool.execute(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [username, email]
      ); 
      if (existingUser.length > 0) {
        return res.status(409).json({ message: 'this email or usersname is already used' });
      }
      const hashedPassword = await bcrypt.hash(password, SaltRound);
      await pool.execute(
        'INSERT INTO users (username, email, full_name, password) VALUES (?, ?, ?, ?)',
        [username, email, full_name, hashedPassword]
      );
  
      res.status(201).json({ message: 'register successfully' });
    } catch (error) {
      res.status(500).json({ message: 'error from register', error: error.message });
    }
  });

  
// Login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [users] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    
    if (users.length === 0) {
      return res.json({status:"err" ,msg: 'User not found' });
    }
    
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password)
    
    if (!validPassword) {
      return res.json({ status:"err" , msg: 'Invalid password' })
    }
    
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({status:"ok", msg:"login Sucess" ,token, user_id: user.id, status: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
})


// Get all books
app.get('/books', async (req, res) => {
  try {
    const [books] = await pool.execute('SELECT * FROM books');
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books', error: error.message });
  }
})

// Borrow a book
app.post('/borrow', authenticateToken, async (req, res) => {
  try {
    const { book_id } = req.body;
    const user_id = req.user.id;
    const [borrowedBooks] = await pool.execute(
      'SELECT COUNT(*) FROM borrowings WHERE user_id = ? AND status IN ("pending", "approved")',
      [user_id]
    );
    
    if (borrowedBooks[0].count >= 3) {
      return res.status(400).json({ message: 'You cannot borrow more than 3 books' });
    }
    
    const [books] = await pool.execute('SELECT * FROM books WHERE id = ? AND available_copies > 0', [book_id]);
    
    if (books.length === 0) {
      return res.status(400).json({ message: 'Book not available' });
    }
    
    const due_date = new Date();
    due_date.setDate(due_date.getDate() + 7);
    
    await pool.execute(
      'INSERT INTO borrowings (user_id, book_id, due_date) VALUES (?, ?, ?)',
      [user_id, book_id, due_date]
    );
    
    await pool.execute(
      'UPDATE books SET available_copies = available_copies - 1 WHERE id = ?',
      [book_id]
    );
    
    res.json({ message: 'Book borrowed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error borrowing book', error: error.message });
  }
});

// Accepted book (only Admin)
app.post('/acceptreq/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
      const request_id = req.params.id;
  
      const [requestDetails] = await pool.execute(
        'SELECT * FROM borrowings WHERE id = ? AND status = "pending"',
        [request_id]
      );
  
      if (requestDetails.length === 0) {
        return res.status(404).json({ message: 'Request not found or already processed' });
      }
  
      const request = requestDetails[0];
  
      await pool.execute(
        'UPDATE borrowings SET status = "approved" WHERE id = ?',
        [request_id]
      );
  
      await pool.execute(
        'UPDATE books SET available_copies = available_copies WHERE id = ?',
        [request.book_id]
      );
  
      res.json({ message: 'Borrowing request approved successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error accepting borrowing request', error: error.message });
    }
  });
  
// Display status of Permission Admin
app.get("/statusbook", authenticateToken, isAdmin, async function(req, res) {
  try {
    const [data] = await pool.execute("SELECT * FROM borrowings WHERE status = 'pending'");
    res.json({status: "ok", msg: data});
  } catch (error) {
    res.json({status: "err", msg: error.message});
  }
});

//Display status of Permission User
app.get("/statusbook/user", authenticateToken, async function(req, res) {
  const user_id = req.user.id;
  if (!user_id) {
    return res.json({status: "err", msg: "Error not found user_id"});
  }
  try {
    const [data] = await pool.execute("SELECT * FROM borrowings WHERE user_id=?", [user_id]);
    res.json({status: "ok", msg: data});
  } catch (error) {
    res.json({status: "err", msg: error.message});
  }
});


// Display Borrow-book only for admin
app.get("/borrowed-books", authenticateToken, isAdmin,  async function(req, res) {
  try {
    const [borrowings] = await pool.execute(`
      SELECT b.id, b.user_id, b.book_id, b.borrow_date, b.due_date, b.return_date, b.status,
             books.title, users.username
      FROM borrowings b
      JOIN books ON b.book_id = books.id
      JOIN users ON b.user_id = users.id
      ORDER BY b.borrow_date DESC
    `);

    res.json({
      status: "ok",
      borrowings: borrowings.map(borrowing => ({
        id: borrowing.id,
        user_id: borrowing.user_id,
        book_id: borrowing.book_id,
        title: borrowing.title,
        username: borrowing.username,
        borrow_date: borrowing.borrow_date,
        due_date: borrowing.due_date,
        return_date: borrowing.return_date,
        status: borrowing.status
      }))
    });
  } catch (error) {
    console.error('Error fetching borrowed books:', error.message);
    res.status(500).json({ status: "err", msg: "Error fetching borrowed books" });
  }
});

// Return a book
app.post('/return/:id', authenticateToken, async (req, res) => {
  try {
      const borrowing_id = req.params.id;
      const [borrowings] = await pool.execute(
          'SELECT * FROM borrowings WHERE id = ? AND status = "approved"',
          [borrowing_id]
      );

      if (borrowings.length === 0) {
          return res.status(400).json({ message: 'Invalid or unauthorized borrowing record' });
      }
      const borrowing = borrowings[0];
      const return_date = new Date('2024-08-04T14:47:02Z'); // format for test api '2024-08-01T14:47:02Z' change only day {year -  month - day T}
      const due_date = new Date(borrowing.due_date);
      const days_late = Math.max(0, Math.ceil((return_date - due_date) / (1000 * 60 * 60 * 24)));
      const fine = (days_late -1 )* 5 ;

      await pool.execute(
          'UPDATE borrowings SET return_date = ?, status = "returned" WHERE id = ? AND status = "approved"',
          [return_date, borrowing_id]
      );
      await pool.execute(
          'UPDATE books SET available_copies = available_copies + 1 WHERE id = ?',
          [borrowing.book_id]
      );
      if (fine > 0) {
          await pool.execute(
              'INSERT INTO fines (borrowing_id, amount) VALUES (?, ?)',
              [borrowing_id, fine]
          );
      }
      res.json({ message: 'Book returned successfully', fine });
  } catch (error) {
      console.error('Error returning book:', error.message);
      res.status(500).json({ message: 'Error returning book', error: error.message });
  }
});

// Insert Book
app.post('/books', authenticateToken, isAdmin, async (req, res) => {
    try {
      const { title, author, description, category_id, total_copies } = req.body;
      
      if (!title || !author || !total_copies) {
        return res.status(400).json({ message: 'Title, author, and total_copies are required' });
      }
      if (category_id) {
        const [category] = await pool.execute('SELECT * FROM categories WHERE id = ?', [category_id]);
        if (category.length === 0) {
          return res.status(400).json({ message: 'Invalid category_id' });
        }
      }
  
      const [result] = await pool.execute(
        'INSERT INTO books (title, author, description, category_id, total_copies, available_copies) VALUES (?, ?, ?, ?, ?, ?)',
        [title, author, description || null, category_id || null, total_copies, total_copies]
      );
  
      res.status(201).json({ message: 'Book added successfully', bookId: result.insertId });
    } catch (error) {
      res.status(500).json({ message: 'Error adding book', error: error.message });
    }
  });
  
//Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));