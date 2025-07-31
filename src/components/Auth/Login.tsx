import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../supabase/config';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<'traditional' | 'supabase'>('traditional');
  const { dispatch } = useApp();
  const navigate = useNavigate();

  const handleTraditionalLogin = (e: React.FormEvent) => {
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

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        dispatch({
          type: 'SET_USER',
          payload: { 
            username: data.user.email || 'Usuario', 
            isAuthenticated: true 
          }
        });
        navigate('/admin');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <img 
              src="/logo-horizontal-ima.png" 
              alt="IMA Logo" 
              className="login-logo-image"
            />
          </div>
          <h1>Panel de Administración</h1>
          <p>Municipalidad de Arica</p>
        </div>

        <div className="login-mode-selector">
          <button
            type="button"
            className={`mode-btn ${loginMode === 'traditional' ? 'active' : ''}`}
            onClick={() => setLoginMode('traditional')}
          >
            Acceso Tradicional
          </button>
          <button
            type="button"
            className={`mode-btn ${loginMode === 'supabase' ? 'active' : ''}`}
            onClick={() => setLoginMode('supabase')}
          >
            Acceso Supabase
          </button>
        </div>
        
        {loginMode === 'traditional' ? (
          <form onSubmit={handleTraditionalLogin} className="login-form">
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
        ) : (
          <form onSubmit={handleSupabaseLogin} className="login-form">
            {error && <div className="error">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingrese su correo electrónico"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="supabase-password">Contraseña</label>
              <input
                type="password"
                id="supabase-password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary login-btn"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión con Supabase'}
            </button>
          </form>
        )}
        
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