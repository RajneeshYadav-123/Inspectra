import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
const InspectorDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const load = () => {
    apiFetch('/api/bookings')
      .then(r => r.json())
      .then(d => setBookings((d.data || []).filter(
        b => b.assignmentStatus === 'PENDING' || b.assignmentStatus === 'ACCEPTED'
      )))
      .catch(() => { })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  const action = async (id, act) => {
    setBusy(`${id}-${act}`);
    try {
      const res = await apiFetch(`/api/bookings/${id}/${act}`, { method: 'POST' });
      if (!res.ok) throw new Error();
      load();
    } catch { alert(`Action '${act}' failed.`); }
    finally { setBusy(null); }
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
        <p className="loading-label">Loading assignments</p>
      </div>
    </div>
  );
  const pending = bookings.filter(b => b.assignmentStatus === 'PENDING');
  const accepted = bookings.filter(b => b.assignmentStatus === 'ACCEPTED');
  return (
    <div className="page">
      <div className="container--wide">
        <div className="topbar">
          <div className="auth-brand" style={{ margin: 0, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div className="auth-brand__icon" style={{ width: 28, height: 28, fontSize: 14 }}><img src="/logo.png" alt="logo" style={{width: '100%', height: '100%', objectFit: 'contain'}} /></div>
            <span className="auth-brand__name">Inspectra</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="topbar-badge"><span className="topbar-dot" />Inspector Portal</div>
            <button className="btn-pill btn-pill--sm" onClick={logout}>Logout</button>
          </div>
        </div>
        <h1 className="pg-title">My Assignments</h1>
        <p className="pg-sub">Welcome, {user.name || 'Inspector'} — manage your inspection tasks.</p>
        {}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Total</div>
            <div className="metric-val">{bookings.length}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Pending</div>
            <div className="metric-val metric-val--orange">{String(pending.length).padStart(2, '0')}</div>
            <div className="metric-sub">{pending.length > 0 ? '●' : '—'}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Active</div>
            <div className="metric-val metric-val--green">{String(accepted.length).padStart(2, '0')}</div>
            <div className="metric-sub metric-sub--green">{accepted.length > 0 ? 'Yes' : '—'}</div>
          </div>
        </div>
        {}
        {pending.length > 0 && (
          <div className="sc" style={{ marginBottom: 10 }}>
            <div className="sc-head">
              <div className="sc-title-group">
                <span className="sc-num">1</span>
                <span className="sc-label">Pending Assignments</span>
              </div>
              <span className="sc-meta sc-meta--orange">{pending.length} Required</span>
            </div>
            <div className="sc-body--0">
              {pending.map(b => (
                <div key={b._id} className="assign-item">
                  <div className="assign-item__row1">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="reg-badge">{b.vehicleDetails?.registrationNumber || 'N/A'}</span>
                      <span className="assign-item__vehicle">
                        {b.vehicleDetails?.model || b.service?.name || 'Vehicle'}
                      </span>
                    </div>
                    <span className="assign-item__price">${b.service?.price || '—'}</span>
                  </div>
                  <div className="assign-item__row2">
                    {b.customerName} · Scheduled: {b.visitDate ? new Date(b.visitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'} {b.visitTime || ''}
                  </div>
                  <div className="assign-item__row3">
                    <div className="assign-item__bay">
                      <span className="assign-item__bay-dot" />
                      {b.address || 'No address'} · Unassigned
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="task-btn task-btn--dark"
                        style={{ padding: '5px 12px', borderRadius: 'var(--r-sm)', fontSize: 11 }}
                        onClick={() => action(b._id, 'accept')}
                        disabled={busy === `${b._id}-accept`}>
                        {busy === `${b._id}-accept` ? '...' : 'Accept'}
                      </button>
                      <button className="task-btn task-btn--red"
                        style={{ padding: '5px 12px', borderRadius: 'var(--r-sm)', fontSize: 11 }}
                        onClick={() => action(b._id, 'reject')}
                        disabled={busy === `${b._id}-reject`}>
                        {busy === `${b._id}-reject` ? '...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {pending.length > 1 && (
                <div className="assign-footer">
                  {pending.length - 1} other request{pending.length - 1 > 1 ? 's' : ''} queued in standby pool.
                </div>
              )}
            </div>
          </div>
        )}
        {/* Active / Accepted */}
        {accepted.length > 0 && (
          <div className="sc" style={{ marginBottom: 10 }}>
            <div className="sc-head">
              <div className="sc-title-group">
                <span className="sc-num">2</span>
                <span className="sc-label">Active Inspections</span>
              </div>
              <span className="sc-meta sc-meta--green">{accepted.length} Active</span>
            </div>
            <div className="sc-body--0">
              {accepted.map(b => (
                <div key={b._id} className="assign-item">
                  <div className="assign-item__row1">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="reg-badge">{b.vehicleDetails?.registrationNumber || 'N/A'}</span>
                      <span className="assign-item__vehicle">
                        {b.vehicleDetails?.model || b.service?.name || 'Vehicle'}
                      </span>
                    </div>
                    <span className={`badge ${b.status === 'IN_PROGRESS' ? 'badge--outline' : 'badge--green'}`}>
                      {b.status === 'IN_PROGRESS' ? 'In Progress' : 'Accepted'}
                    </span>
                  </div>
                  <div className="assign-item__row2">
                    {b.customerName} · {b.service?.name || 'N/A'}
                  </div>
                  <div className="assign-item__row3">
                    <div className="assign-item__bay">
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', marginRight: 4 }} />
                      {b.address || 'No address'}
                    </div>
                    {b.status !== 'IN_PROGRESS' ? (
                      <button className="assign-item__action"
                        onClick={() => action(b._id, 'start')}
                        disabled={busy === `${b._id}-start`}>
                        {busy === `${b._id}-start` ? '...' : '▶ Start Inspection →'}
                      </button>
                    ) : (
                      <button className="assign-item__action"
                        onClick={() => navigate(`/inspection/${b._id}`)}>
                        Fill Form →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {bookings.length === 0 && (
          <div className="sc">
            <div className="empty">
              <p className="empty__text">No pending or active assignments.</p>
            </div>
          </div>
        )}
        <p className="footnote">Precision Inspection Protocol · Encrypted Session</p>
      </div>
    </div>
  );
};
export default InspectorDashboard;
