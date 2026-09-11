import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
const statusBadge = (s) => {
  if (s === 'APPROVED') return 'badge--green';
  if (s === 'COMPLETED') return 'badge--black';
  if (s === 'IN_PROGRESS') return 'badge--outline';
  if (s === 'ASSIGNED') return 'badge--outline';
  return 'badge--gray';
};
const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dlLoading, setDlLoading] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  useEffect(() => {
    apiFetch('/api/bookings')
      .then(r => r.json())
      .then(d => setBookings(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  const handleDownload = async (id) => {
    setDlLoading(id);
    try {
      const res = await apiFetch(`/api/bookings/${id}/report`);
      if (!res.ok) throw new Error('Report not available');
      const blob = await res.blob();
      const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob),
        download: `inspection-report-${id}.pdf`
      });
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Download failed: ' + err.message);
    } finally {
      setDlLoading(null);
    }
  };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  if (loading) return (
    <div className="loading-screen">
      <div className="loading-box">
        <div className="spinner" />
        <p className="loading-label">Loading inspections</p>
      </div>
    </div>
  );
  return (
    <div className="page">
      <div className="container--wide">
        <div className="topbar">
          <div className="auth-brand" style={{ margin: 0, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div className="auth-brand__icon" style={{ width: 28, height: 28, fontSize: 14 }}><img src="/logo.png" alt="logo" style={{width: '100%', height: '100%', objectFit: 'contain'}} /></div>
            <span className="auth-brand__name">Inspectra</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="topbar-badge"><span className="topbar-dot" />Customer Portal</div>
            <button className="btn-pill btn-pill--sm" onClick={logout}>Logout</button>
          </div>
        </div>
        <div className="pg-title--row">
          <h1 className="pg-title">My Inspections</h1>
        </div>
        <p className="pg-sub">Welcome, {user.name || 'Customer'} — track your bookings below.</p>
        <button className="btn-cta" style={{ maxWidth: 260, borderRadius: 'var(--r-lg)', marginBottom: 20 }}
          onClick={() => navigate('/create-booking')}>
          + New Inspection Booking
        </button>
        {bookings.length === 0 ? (
          <div className="sc">
            <div className="empty">
              <p className="empty__text">No bookings yet. Create your first inspection.</p>
            </div>
          </div>
        ) : (
          bookings.map(b => (
            <div key={b._id} className="bk-card">
              <div className="bk-card__head">
                <div>
                  <div className="bk-card__name">{b.customerName || 'Unknown'}</div>
                  <div className="bk-card__reg">{b.vehicleDetails?.registrationNumber || '—'}</div>
                </div>
                <span className={`badge ${statusBadge(b.status)}`}>{b.status}</span>
              </div>
              <div className="bk-card__body">
                <div className="bk-card__row">
                  <span className="bk-card__row-label">Service</span>
                  <span className="bk-card__row-val">{b.service?.name || 'N/A'}</span>
                </div>
                <div className="bk-card__row">
                  <span className="bk-card__row-label">Inspector</span>
                  <span className="bk-card__row-val">{b.inspector?.name || 'Not assigned'}</span>
                </div>
                <div className="bk-card__row">
                  <span className="bk-card__row-label">Visit</span>
                  <span className="bk-card__row-val">
                    {b.visitDate ? new Date(b.visitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    {b.visitTime ? ` · ${b.visitTime}` : ''}
                  </span>
                </div>
              </div>
              {b.status === 'APPROVED' && (
                <div className="bk-card__foot">
                  <button className="task-btn task-btn--green" style={{ width: '100%' }}
                    onClick={() => handleDownload(b._id)} disabled={dlLoading === b._id}>
                    {dlLoading === b._id ? 'Downloading...' : 'Download Report'}
                  </button>
                </div>
              )}
              {b.status === 'COMPLETED' && (
                <div className="bk-card__foot">
                  <span style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>
                    Report under admin review
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default CustomerDashboard;
