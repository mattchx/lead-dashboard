import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface LoginProps {
  onLoginSuccess: () => void;
}

import './Login.css';

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  // Check for magic link token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      const verifyMagicLink = async () => {
        try {
          const response = await fetch(
            `http://localhost:3002/api/auth/magic-link/verify?token=${token}`
          );
          
          if (!response.ok) {
            throw new Error('Invalid magic link');
          }

          const { user } = await response.json();
          login(user.accessToken, user.refreshToken);
          onLoginSuccess();
        } catch {
          setError('Invalid or expired magic link');
        }
      };
      
      verifyMagicLink();
    }
  }, [login, onLoginSuccess]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3002/api/auth/magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send magic link');
      }

      setIsMagicLinkSent(true);
    } catch {
      setError('Failed to send magic link');
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      {isMagicLinkSent ? (
        <div className="magic-link-sent">
          <p>Check your email for the login link!</p>
        </div>
      ) : (
        <form className="login-form" onSubmit={handleMagicLink}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button className="login-button" type="submit">
            Send Magic Link
          </button>
        </form>
      )}
    </div>
  );
}