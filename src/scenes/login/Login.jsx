import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirecting
import './Login.css'; // Import the CSS file for styling

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // State for managing loading
  const [message, setMessage] = useState(''); // State for managing success/error messages
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading state to true when submission starts
    setMessage(''); // Clear any previous messages
    console.log('Submitting login with:', { email, password });

    try {
      const response = await fetch('https://namami-infotech.com/NiveshanBackend/api/auth/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const textResponse = await response.text(); // Get response as text

      try {
        const data = JSON.parse(textResponse); // Attempt to parse JSON
        console.log('Response data:', data); // Log the received data

        if (response.ok) {
          // Handle successful login
          localStorage.setItem('userDetails', JSON.stringify({
            EmpId: data.EmpId,
            Name: data.Name,
            Email: data.Email,
            Role: data.Role,
          }));
          setMessage('Login successful! Redirecting...');
          setTimeout(() => {
            navigate('/dashboard'); // Redirect to dashboard after a short delay
          }, 1000);
        } else {
          // Handle errors from the server
          setMessage(data.message || 'Login failed. Please try again.');
          console.error('Login failed:', data.message);
        }
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        setMessage('Unexpected response from server. Please try again.');
        console.log('Received non-JSON response:', textResponse);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setMessage('Error during login. Please check your connection and try again.');
    } finally {
      setLoading(false); // Set loading state to false when submission ends
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <img src={`../../assets/Logo.png`} alt="Logo" />
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {message && <p className="message">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
