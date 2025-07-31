import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../supabase/config';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const { dispatch } = useApp();
  const navigate = useNavigate();

  // Función para verificar si Supabase está configurado
  const isSupabaseConfigured = () => {
    try {
      // Verificar que el cliente de Supabase esté disponible
      if (!supabase || !supabase.auth) {
        console.log('Supabase client not available');
        return false;
      }
      
      // Verificar las variables de entorno directamente
      const envUrl = process.env.REACT_APP_SUPABASE_URL;
      const envKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
      
      // Usar fallbacks si las variables de entorno no están disponibles
      const hasValidUrl = envUrl?.includes('supabase.co') || 
                         'https://gpvjloxxxxasypjrihiq.supabase.co'.includes('supabase.co');
      const hasValidKey = (envKey && envKey.length > 50) || 
                         'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwdmpsb3h4eHhhc3lwanJpaGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4ODU4ODcsImV4cCI6MjA2OTQ2MTg4N30.zrQu7hzxebJThMIdLth2QTYVtKFM_0Oxh0V9kW5YT8k'.length > 50;
      
      console.log('Checking Supabase config:', {
        envUrl: envUrl || 'using fallback',
        envKeyExists: !!envKey || 'using fallback',
        hasValidUrl,
        hasValidKey,
        clientExists: !!supabase
      });
      
      return hasValidUrl && hasValidKey && !!supabase;
    } catch (error) {
      console.error('Error checking Supabase config:', error);
      return false;
    }
  };

  // Escuchar cambios de autenticación de Supabase
  useEffect(() => {
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: string, session: any) => {
          console.log('Auth state changed:', event, session);
          if (event === 'SIGNED_IN' && session) {
            dispatch({
              type: 'SET_USER',
              payload: {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.email,
                isAuthenticated: true,
              },
            });
            navigate('/admin');
          }
        }
      );

      return () => subscription.unsubscribe();
    }
  }, [dispatch, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Verificar credenciales locales para usuarios readonly
      if ((email === 'admin' && password === 'admin') || 
          (email === 'admin@admin.com' && password === 'admin')) {
        // Autenticación local para usuarios de solo lectura
        const userName = email === 'admin' ? 'Administrador (Solo Lectura)' : 'Admin (Solo Lectura)';
        const userId = email === 'admin' ? 'readonly-admin' : 'readonly-admin-email';
        
        dispatch({
          type: 'SET_USER',
          payload: {
            id: userId,
            email: email,
            name: userName,
            role: 'readonly',
            isAuthenticated: true,
          },
        });
        navigate('/admin');
        return;
      }

      // Si no es el usuario local, intentar con Supabase
      if (!isSupabaseConfigured()) {
        setError('Credenciales incorrectas');
        return;
      }

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setError('Revisa tu email para confirmar tu cuenta');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    if (!isSupabaseConfigured()) {
      setError('Supabase no está configurado correctamente');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + '/admin'
        }
      });
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleClose = () => {
    navigate('/');
  };

  // Verificar configuración al renderizar
  const supabaseConfigured = isSupabaseConfigured();
  
  if (!supabaseConfigured) {
    return (
      <div className="login-container-dark">
        <div className="login-card-dark">
          {/* Botón de cerrar */}
          <button 
            type="button" 
            className="close-btn"
            onClick={handleClose}
            title="Volver al mapa"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>

          <div className="login-header-dark">
            <div className="login-logo">
              <img 
                src="/logo-horizontal-ima.png" 
                alt="IMA Logo" 
                className="login-logo-image"
              />
            </div>
            <p>Configurando Supabase...</p>
          </div>
          <div className="config-notice-dark">
            <p>⚠️ Verificando configuración de Supabase</p>
            <p>Si este mensaje persiste, revisa la consola del navegador</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container-dark">
      <div className="login-card-dark">
        {/* Botón de cerrar */}
        <button 
          type="button" 
          className="close-btn"
          onClick={handleClose}
          title="Volver al mapa"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        <div className="login-header-dark">
          <div className="login-logo">
            <img 
              src="/logo-horizontal-ima.png" 
              alt="IMA Logo" 
              className="login-logo-image"
            />
          </div>
          <p>Sistema de Gestión de Propiedades</p>
        </div>

        {/* Botones de login social */}
        <div className="social-buttons">
          <button 
            type="button" 
            className="social-btn apple-btn"
            onClick={() => handleSocialLogin('apple')}
            disabled={loading}
          >
            <svg className="social-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Iniciar con Apple
          </button>
          
          <button 
            type="button" 
            className="social-btn google-btn"
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
          >
            <svg className="social-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Iniciar con Google
          </button>
        </div>

        {/* Formulario de email */}
        <form onSubmit={handleEmailLogin} className="email-form">
          <div className="form-group-dark">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group-dark">
            <label htmlFor="password">Contraseña</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {error && <div className="error-message-dark">{error}</div>}

          <button 
            type="submit" 
            className="signin-btn"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : (isSignUp ? 'Registrarse' : 'Iniciar sesión')}
          </button>
        </form>

        {/* Enlaces de pie */}
        <div className="login-footer-dark">
          <button 
            type="button" 
            className="link-btn"
            onClick={() => {/* Implementar forgot password */}}
          >
            ¿Olvidaste tu contraseña?
          </button>
          
          <button 
            type="button" 
            className="link-btn"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;