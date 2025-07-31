import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [supabasePassword, setSupabasePassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<'traditional' | 'supabase'>('traditional');

  // Check if Supabase is configured
  const isSupabaseConfigured = process.env.REACT_APP_SUPABASE_URL && 
                               process.env.REACT_APP_SUPABASE_ANON_KEY &&
                               process.env.REACT_APP_SUPABASE_URL !== 'your_supabase_project_url_here' &&
                               process.env.REACT_APP_SUPABASE_ANON_KEY !== 'your_supabase_anon_key_here';

  const handleTraditionalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulación de login tradicional - aquí puedes agregar tu lógica de autenticación
      if (username === 'admin' && password === 'admin') {
        const user = {
          id: '1',
          username: username,
          isAuthenticated: true
        };
        dispatch({ type: 'SET_USER', payload: user });
        navigate('/admin');
      } else {
        setError('Credenciales inválidas');
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isSupabaseConfigured) {
        setError('Supabase no está configurado. Por favor, configura las variables de entorno.');
        return;
      }

      const { supabase } = await import('../../supabase/config');
      const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password: supabasePassword,
      });

      if (supabaseError) {
        setError(supabaseError.message);
        return;
      }

      if (data.user) {
        const user = {
          id: data.user.id,
          username: data.user.email || 'Usuario Supabase',
          isAuthenticated: true
        };
        dispatch({ type: 'SET_USER', payload: user });
        navigate('/admin');
      }
    } catch (err) {
      setError('Error al iniciar sesión con Supabase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <span className="logo-icon">🏛️</span>
          </div>
          <h1>Panel de Administración</h1>
          <p>Municipalidad de Arica - Gestión de Propiedades</p>
        </div>

        <div className="login-mode-selector">
          <button
            type="button"
            className={`mode-btn ${loginMode === 'traditional' ? 'active' : ''}`}
            onClick={() => setLoginMode('traditional')}
          >
            <span className="mode-icon">🔐</span>
            Login Tradicional
          </button>
          <button
            type="button"
            className={`mode-btn ${loginMode === 'supabase' ? 'active' : ''} ${!isSupabaseConfigured ? 'disabled' : ''}`}
            onClick={() => isSupabaseConfigured && setLoginMode('supabase')}
            disabled={!isSupabaseConfigured}
          >
            <span className="mode-icon">⚡</span>
            Supabase Auth
            {!isSupabaseConfigured && <span className="config-required">*</span>}
          </button>
        </div>

        {!isSupabaseConfigured && loginMode === 'supabase' && (
          <div className="config-notice">
            <p>⚠️ Para usar Supabase Auth, configura las variables de entorno en el archivo .env</p>
          </div>
        )}

        {loginMode === 'traditional' ? (
          <form onSubmit={handleTraditionalLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Usuario</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Ingresa tu usuario"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Ingresa tu contraseña"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={loading} className="login-btn">
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <span className="btn-icon">🚀</span>
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSupabaseLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                disabled={!isSupabaseConfigured}
              />
            </div>

            <div className="form-group">
              <label htmlFor="supabase-password">Contraseña</label>
              <input
                type="password"
                id="supabase-password"
                value={supabasePassword}
                onChange={(e) => setSupabasePassword(e.target.value)}
                required
                placeholder="Tu contraseña de Supabase"
                disabled={!isSupabaseConfigured}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              disabled={loading || !isSupabaseConfigured} 
              className="login-btn supabase"
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Conectando...
                </>
              ) : (
                <>
                  <span className="btn-icon">⚡</span>
                  Iniciar con Supabase
                </>
              )}
            </button>
          </form>
        )}

        <div className="login-footer">
          <p>Credenciales por defecto: admin / admin123</p>
          {!isSupabaseConfigured && (
            <p className="config-hint">
              💡 Configura Supabase en el archivo .env para habilitar la autenticación avanzada
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;