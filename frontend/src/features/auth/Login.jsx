import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const role = params.get('role');
    if (role === 'admin') setForm({ email: 'admin@test.com', password: 'admin123' });
    else if (role === 'inspector') setForm({ email: 'inspector@test.com', password: 'inspector123' });
    else if (role === 'customer') setForm({ email: 'customer@test.com', password: 'customer123' });
  }, [location.search]);
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'admin') navigate('/admin');
        else if (data.user.role === 'inspector') navigate('/inspector');
        else navigate('/customer');
      } else {
        setError(data.message || 'Invalid credentials.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div className="auth-brand__icon"><img src="/logo.png" alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></div>
          <span className="auth-brand__name" style={{ cursor: 'pointer' }}>Inspectra</span>
        </div>
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-sub">Access your inspection portal</p>
        {error && <div className="alert alert--err">{error}</div>}
        <form onSubmit={submit}>
          <div className="fg">
            <label className="fl fl--req">Email Address</label>
            <input className="fi" type="email" name="email" placeholder="e.g. admin@test.com"
              value={form.email} onChange={handle} required autoComplete="email" />
          </div>
          <div className="fg">
            <label className="fl fl--req">Password</label>
            <input className="fi" type="password" name="password" placeholder="Enter your password"
              value={form.password} onChange={handle} required autoComplete="current-password" />
          </div>
          <button type="submit" className="btn-cta" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
        <div className="auth-link-row">
          No account? <Link to="/signup">Create one</Link>
        </div>

      </div>
    </div>
  );
};
export default Login;
