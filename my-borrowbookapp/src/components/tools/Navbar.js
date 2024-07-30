import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isAdmin, onLogout }) => {
  const Headddddd = <Link to="/" className="nav-link">MageBook</Link>
  return (
    <nav className="navbar">
      <div className="container">
        <div className="title">{Headddddd}</div>
        <ul className="nav-list">
          <li>
            <Link to="/" className="nav-link">Home</Link>
          </li>
          {isAdmin && (
            <>
              <li>
                <Link to="/add-book" className="nav-link">Add Book</Link>
              </li>
              <li>
                <Link to="/manage-requests" className="nav-link">Borrow Requests</Link>
              </li>
              <li>
                <Link to="/return-requests" className="nav-link">Return Requests</Link>
              </li>
            </>
          )}
          <li>
            <Link to="/borrowed-books" className="nav-link">Borrowed Books</Link>
          </li>
          <li>
            <button className="logout-button" onClick={onLogout}>Logout</button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
