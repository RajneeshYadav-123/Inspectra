import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, phone: form.phone })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/customer');
      } else {
        setError(data.message || 'Registration failed.');
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
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Get started with vehicle inspections</p>
        {error && <div className="alert alert--err">{error}</div>}
        <form onSubmit={submit}>
          <div className="fg">
            <label className="fl fl--req">Full Name</label>
            <input className="fi" type="text" name="name" placeholder="e.g. Adrian Walker"
              value={form.name} onChange={handle} required />
          </div>
          <div className="fg">
            <label className="fl fl--req">Email Address</label>
            <input className="fi" type="email" name="email" placeholder="you@email.com"
              value={form.email} onChange={handle} required />
          </div>
          <div className="fg">
            <label className="fl">Phone Number</label>
            <input className="fi" type="tel" name="phone" placeholder="+1 (555) 000-0000"
              value={form.phone} onChange={handle} />
          </div>
          <div className="frow">
            <div className="fg">
              <label className="fl fl--req">Password</label>
              <input className="fi" type="password" name="password" placeholder="Min. 6 chars"
                value={form.password} onChange={handle} required minLength={6} />
            </div>
            <div className="fg">
              <label className="fl fl--req">Confirm</label>
              <input className="fi" type="password" name="confirm" placeholder="Repeat"
                value={form.confirm} onChange={handle} required />
            </div>
          </div>
          <button type="submit" className="btn-cta" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>
        <div className="auth-link-row">
          Have an account? <Link to="/login">Sign in</Link>
        </div>

      </div>
    </div>
  );
};
export default Signup;
