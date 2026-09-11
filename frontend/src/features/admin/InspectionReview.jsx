import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
const GOOD = ['pass', 'yes', 'good', 'ok', 'normal', 'optimal', 'working', 'clear', 'clean', 'functioning', 'satisfactory', 'no issue', 'no fault'];
const BAD  = ['fail', 'no', 'poor', 'bad', 'loud', 'knocking', 'fault', 'damaged', 'broken', 'leaking', 'worn'];
const classify = (opt = '') => {
  const v = opt.toLowerCase();
  if (GOOD.some(g => v.includes(g))) return 'PASS';
  if (BAD.some(b => v.includes(b))) return 'FAIL';
  return 'NOTED';
};
const statusEl = (status) => {
  if (status === 'PASS')    return <span className="pass-text">PASS</span>;
  if (status === 'FAIL')    return <span className="fail-text">FAIL</span>;
  if (status === 'OPTIMAL') return <span className="opt-text">OPTIMAL</span>;
  return <span className="note-text">NOTED</span>;
};
const shortHash = (id = '') => id.slice(-8).toUpperCase().replace(/(.{4})/, '$1-');
const InspectionReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const approvingRef = React.useRef(false);
  const [dlLoading, setDlLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    Promise.all([
      apiFetch(`/api/bookings/${id}`).then(r => r.json()),
      apiFetch(`/api/bookings/${id}/inspection`).then(r => r.ok ? r.json() : null).catch(() => null)
    ]).then(([bd, insp]) => {
      setBooking(bd.data);
      setInspection(insp?.data || null);
    }).catch(() => setMsg({ type: 'err', text: 'Error loading inspection data.' }))
    .finally(() => setLoading(false));
  }, [id]);
  const handleApprove = async () => {
    if (approvingRef.current) return;
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser.role !== 'admin') {
      setMsg({ type: 'err', text: 'Authentication mismatch: Please log back in as Admin to approve.' });
      return;
    }
    approvingRef.current = true;
    setApproving(true);
    try {
      const res = await apiFetch(`/api/bookings/${id}/approve`, { method: 'POST' });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'HTTP Error');
      }
      setMsg({ type: 'ok', text: 'Approved and dispatched to customer!' });
      setBooking(p => ({ ...p, status: 'APPROVED' }));
    } catch (err) {
      try {
        const verifyRes = await apiFetch(`/api/bookings/${id}`);
        const verifyData = await verifyRes.json();
        if (verifyData.data && verifyData.data.status === 'APPROVED') {
          setMsg({ type: 'ok', text: 'Approved and dispatched to customer!' });
          setBooking(verifyData.data);
          return;
        }
      } catch (e) {
      }
      setMsg({ type: 'err', text: `Approval failed: ${err.message}` });
    } finally {
      approvingRef.current = false;
      setApproving(false);
    }
  };
  const handleDownload = async () => {
    setDlLoading(true);
    try {
      const res = await apiFetch(`/api/bookings/${id}/report`);
      if (!res.ok) throw new Error('Report unavailable');
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
      setDlLoading(false);
    }
  };
  if (loading) return (
    <div className="loading-screen">
      <div className="loading-box">
        <div className="spinner" />
        <p className="loading-label">Loading inspection review</p>
      </div>
    </div>
  );
  if (!booking) return (
    <div className="loading-screen">
      <div className="loading-box">
        <p className="loading-label">Booking not found</p>
        <button className="btn-pill" onClick={() => navigate('/admin')} style={{ marginTop: 16 }}>← Back</button>
      </div>
    </div>
  );
    const answers = inspection?.answers || [];
  const sections = {};
  answers.forEach(a => {
    const sec = a.sectionName || 'General';
    if (!sections[sec]) sections[sec] = [];
    sections[sec].push(a);
  });
    const total = answers.length;
  const passing = answers.filter(a => classify(a.selectedOption) === 'PASS').length;
  const score = total > 0 ? Math.round((passing / total) * 100) : null;
  const allGood = score !== null && score >= 80;
    const v = booking.vehicleDetails || {};
  const inspector = booking.inspector || {};
  const initials = inspector.name ? inspector.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'NA';
  return (
    <div className="page">
      <div className="container">
        {}
        <div className="topbar">
          <button className="topbar-back" onClick={() => navigate('/admin')}>← Back to Dashboard</button>
          <div className="topbar-badge">
            <span className="topbar-dot" style={{ background: allGood ? 'var(--green)' : 'var(--orange)' }} />
            {allGood ? `AUDIT PASSED #TR-${shortHash(id)}` : `UNDER REVIEW #TR-${shortHash(id)}`}
          </div>
        </div>
        {msg && <div className={`alert alert--${msg.type}`}>{msg.text}</div>}
        {}
        <div className="pg-title--row">
          <h1 className="pg-title" style={{ fontSize: 24 }}>Inspection Review</h1>
          {booking.status === 'APPROVED'
            ? <span className="verified-badge">Verified</span>
            : <span className="badge badge--orange">Pending</span>}
        </div>
        <p className="pg-sub">Comprehensive multi-point assessment &amp; diagnostic audit</p>
        {}
        {score !== null && (
          <div className="score-banner">
            <div className="score-banner__left">
              <span></span>
              {passing} Pass · {total - passing > 0 ? `${total - passing} Issues Found` : '0 Fault Codes Found'}
            </div>
            <div className="score-banner__right">Score: {score}/100</div>
          </div>
        )}
        {}
        <div className="spec-card">
          <div className="sc-head">
            <div className="sc-title-group">
              <span className="sc-num">1</span>
              <span className="sc-label">Vehicle Specification</span>
            </div>
            {v.registrationNumber && <span className="reg-badge">{v.registrationNumber}</span>}
          </div>
          <div className="spec-main">
            <div className="spec-main__row1">
              <div className="spec-model">
                {booking.vehicleDetails?.year && `${booking.vehicleDetails.year} `}
                {v.vehicleType || ''} {v.model || 'Vehicle'}
                {v.variant ? ` (${v.variant})` : ''}
              </div>
              <span className="spec-price">${booking.service?.price || '—'}</span>
            </div>
            {v.engineNumber && (
              <div className="spec-vin">VIN: {v.engineNumber}</div>
            )}
          </div>
          <div className="spec-grid">
            <div className="spec-cell">
              <div className="spec-cell__label">Engine Spec</div>
              <div className="spec-cell__val">{v.engineNumber || '—'}</div>
            </div>
            <div className="spec-cell">
              <div className="spec-cell__label">Recorded Mileage</div>
              <div className="spec-cell__val">—</div>
            </div>
          </div>
          <div className="spec-tier">
            <div className="spec-tier__label">Service Tier</div>
            <div className="spec-tier__val">{booking.service?.name || 'N/A'}</div>
          </div>
          {}
          <div className="tech-row">
            <div className="tech-avatar">{initials}</div>
            <div style={{ flex: 1 }}>
              <div className="tech-name">{inspector.name || 'Inspector'}</div>
              <div className="tech-sub">
                {booking.visitDate ? new Date(booking.visitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                {booking.visitTime ? ` · Completed ${booking.visitTime}` : ''}
              </div>
            </div>
            <span className="tech-active">Active</span>
          </div>
        </div>
        {/* ── Section 2: Diagnostic & Multi-Point Audit ── */}
        <div className="spec-card">
          <div className="sc-head">
            <div className="sc-title-group">
              <span className="sc-num">2</span>
              <span className="sc-label">Diagnostic &amp; Multi-Point Audit</span>
            </div>
            {allGood
              ? <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '.05em' }}>All Systems Go</span>
              : <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Review Items</span>}
          </div>
          {Object.keys(sections).length === 0 ? (
            <div className="empty">
              <p className="empty__text">No inspection answers recorded yet.</p>
            </div>
          ) : (
            Object.entries(sections).map(([secName, items]) => {
              const secStatus = items.every(a => classify(a.selectedOption) === 'PASS') ? 'PASS'
                : items.some(a => classify(a.selectedOption) === 'FAIL') ? 'FAIL' : 'NOTED';
              const descParts = items.slice(0, 2).map(a => a.remark || a.selectedOption).filter(Boolean).join(' · ');
              return (
                <div key={secName} className="diag-item">
                  <div className="diag-item__row">
                    <div>
                      <div className="diag-item__name">{secName}</div>
                      <div className="diag-item__desc">
                        {descParts || `${items.length} item${items.length !== 1 ? 's' : ''} checked`}
                      </div>
                    </div>
                    {statusEl(secStatus)}
                  </div>
                </div>
              );
            })
          )}
        </div>
        {}
        <div className="spec-card">
          <div className="sc-head">
            <div className="sc-title-group">
              <span className="sc-num">3</span>
              <span className="sc-label">Inspection Log &amp; Sign-Off</span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--blue-bg)', background: '#1D4ED8', padding: '2px 8px', borderRadius: 4, letterSpacing: '.04em' }}
              className="sc-meta">
              Digitally Signed
            </span>
          </div>
          <div className="sc-body">
            <div className="signoff-obs">
              <div className="signoff-obs__label">Inspector Observations</div>
              <div className="signoff-obs__text">
                {answers.some(a => a.remark)
                  ? answers.filter(a => a.remark).map(a => a.remark).join('. ') + '.'
                  : 'Vehicle inspection completed. All systems evaluated per standard protocol. Report generated automatically based on inspection answers.'}
              </div>
            </div>
            <div className="signoff-sig">
              <div className="signoff-sig__icon">
                <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700 }}></span>
              </div>
              <div className="signoff-sig__name">
                Digitally certified by {inspector.name || 'Inspector'}
              </div>
              <div className="signoff-sig__hash">Hash: {shortHash(id)}</div>
            </div>
          </div>
        </div>
        {}
        <button className="btn-cta"
          disabled={approving || booking.status === 'APPROVED'}
          onClick={handleApprove} style={{ marginTop: 16 }}>
          {booking.status === 'APPROVED' ? 'Approved & Dispatched' : approving ? 'Approving...' : 'Approve & Dispatch to Customer →'}
        </button>
        <button type="button"
          onClick={handleDownload}
          disabled={dlLoading}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginTop: 8, fontFamily: 'inherit', transition: 'color .12s' }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-2)'}>
          {dlLoading ? 'Downloading...' : '↓ Download PDF Certificate'}
        </button>
        <p className="footnote" style={{ marginTop: 8 }}>
          Precision Inspection Protocol · Encrypted Audit Session
        </p>
      </div>
    </div>
  );
};
export default InspectionReview;
