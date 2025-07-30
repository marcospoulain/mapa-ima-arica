import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './Login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { dispatch } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === 'Admin' && password === '123456') {
      dispatch({
        type: 'SET_USER',
        payload: { username: 'Admin', isAuthenticated: true }
      });
      navigate('/admin');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Panel de Administración</h1>
          <p>Municipalidad de Arica</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su usuario"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary login-btn">
            Iniciar Sesión
          </button>
        </form>
        
        <div className="login-footer">
          <button 
            onClick={() => navigate('/')}
            className="btn btn-secondary"
          >
            Volver al Mapa
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;