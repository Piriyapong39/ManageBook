import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Login.css";

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!data.status !== "ok") {
        alert(data.msg)
      } else {
        alert(data.msg)
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('status', data.status);
      localStorage.setItem('user_id', data.user_id);
      setToken(data.token);
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
      <button
        className="register-button"
        onClick={() => navigate('/register')}
      >
        Register
      </button>
    </div>
  );
};

export default Login;
