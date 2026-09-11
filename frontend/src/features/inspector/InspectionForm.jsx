import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
const InspectionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState({});
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  useEffect(() => {
    apiFetch(`/api/bookings/${id}`)
      .then(r => r.json())
      .then(d => setBooking(d.data))
      .catch(() => setMsg({ type: 'err', text: 'Error loading inspection.' }))
      .finally(() => setLoading(false));
  }, [id]);
  const selectOpt = (sec, q, opt) => {
    const key = `${sec}|||${q}`;
    setResponses(p => ({ ...p, [key]: { ...p[key], sectionName: sec, questionText: q, selectedOption: opt } }));
  };
  const setRemark = (sec, q, val) => {
    const key = `${sec}|||${q}`;
    setResponses(p => ({ ...p, [key]: { ...p[key], sectionName: sec, questionText: q, remark: val } }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const answers = Object.values(responses).map(r => ({
      questionText: r.questionText,
      selectedOption: r.selectedOption || 'N/A',
      remark: r.remark || ''
    }));
    const fd = new FormData();
    fd.append('answers', JSON.stringify(answers));
    images.forEach(img => fd.append('images', img));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/bookings/${id}/submit-inspection`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      setMsg({ type: 'ok', text: 'Inspection submitted successfully!' });
      setTimeout(() => navigate('/inspector'), 2200);
    } catch (err) {
      setMsg({ type: 'err', text: err.message || 'Error submitting.' });
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) return (
    <div className="loading-screen">
      <div className="loading-box">
        <div className="spinner" />
        <p className="loading-label">Loading inspection form</p>
      </div>
    </div>
  );
  if (!booking) return (
    <div className="loading-screen">
      <div className="loading-box">
        <p className="loading-label">Booking not found</p>
      </div>
    </div>
  );
  const checklist = booking.service?.checklist || [];
  const total = checklist.reduce((a, s) => a + s.questions.length, 0);
  const done = Object.values(responses).filter(r => r.selectedOption).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="page">
      <div className="container">
        <div className="topbar">
          <button className="topbar-back" onClick={() => navigate('/inspector')}>← Dashboard</button>
          <div className="topbar-badge"><span className="topbar-dot" />Inspection V2.4</div>
        </div>
        <p className="pg-eyebrow">Inspection Form</p>
        <h1 className="pg-title">{booking.vehicleDetails?.registrationNumber || 'Vehicle'}</h1>
        <p className="pg-sub">{booking.customerName} · {booking.service?.name || 'Inspection'}</p>
        {}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em' }}>
            <span>Completion</span>
            <span>{done} / {total} Questions</span>
          </div>
          <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? 'var(--green)' : 'var(--black)', borderRadius: 3, transition: 'width .3s ease' }} />
          </div>
        </div>
        {msg && <div className={`alert alert--${msg.type}`}>{msg.text}</div>}
        {checklist.length === 0 ? (
          <div className="sc">
            <div className="empty">
              <div className="empty__icon">📋</div>
              <p className="empty__text">No checklist found for this service.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 12 }}>
              {checklist.map((sec, idx) => (
                <button key={idx} type="button"
                  onClick={() => setActiveSection(idx)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--r-full)',
                    border: `1.5px solid ${activeSection === idx ? 'var(--black)' : 'var(--border-2)'}`,
                    background: activeSection === idx ? 'var(--black)' : 'var(--white)',
                    color: activeSection === idx ? 'var(--white)' : 'var(--text-2)',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                    fontFamily: 'inherit', transition: 'all .12s', letterSpacing: '.03em'
                  }}>
                  {idx + 1}. {sec.sectionName}
                </button>
              ))}
            </div>
            {checklist.map((sec, sIdx) => (
              <div key={sIdx} style={{ display: activeSection === sIdx ? 'block' : 'none' }}>
                <div className="sc">
                  <div className="sc-head">
                    <div className="sc-title-group">
                      <span className="sc-num">{sIdx + 1}</span>
                      <span className="sc-label">{sec.sectionName}</span>
                    </div>
                    <span className="sc-meta">{sec.questions.length} Questions</span>
                  </div>
                  <div className="sc-body">
                    {sec.questions.map((q, qIdx) => {
                      const key = `${sec.sectionName}|||${q.questionText}`;
                      const curr = responses[key] || {};
                      return (
                        <div key={qIdx} style={{ paddingBottom: 16, marginBottom: 16, borderBottom: qIdx < sec.questions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 10, lineHeight: 1.4 }}>
                            <span style={{ color: 'var(--text-3)', marginRight: 5, fontSize: 11, fontWeight: 700 }}>{qIdx + 1}.</span>
                            {q.questionText}
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                            {q.options.map((opt, oIdx) => (
                              <button key={oIdx} type="button"
                                className={`chip ${curr.selectedOption === opt ? 'chip--sel' : ''}`}
                                onClick={() => selectOpt(sec.sectionName, q.questionText, opt)}>
                                {opt}
                              </button>
                            ))}
                          </div>
                          <input className="fi" type="text" placeholder="Add remark (optional)"
                            value={curr.remark || ''}
                            onChange={e => setRemark(sec.sectionName, q.questionText, e.target.value)}
                            style={{ fontSize: 13 }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  {sIdx > 0
                    ? <button type="button" className="btn-pill" onClick={() => setActiveSection(sIdx - 1)}>← Prev</button>
                    : <div />}
                  {sIdx < checklist.length - 1
                    ? <button type="button" className="btn-pill" onClick={() => setActiveSection(sIdx + 1)}>Next →</button>
                    : null}
                </div>
              </div>
            ))}
            {}
            <div className="sc">
              <div className="sc-head">
                <div className="sc-title-group">
                  <span className="sc-num" style={{ background: 'none', border: '1.5px solid var(--black)', color: 'var(--black)' }}>📷</span>
                  <span className="sc-label">Inspection Images</span>
                </div>
                <span className="sc-meta">Optional</span>
              </div>
              <div className="sc-body">
                <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }}
                  onChange={e => { 
                    const file = e.target.files[0];
                    if (file) setImages(p => [...p, file]); 
                    e.target.value = ''; 
                  }} />
                <button type="button" className="btn-pill" onClick={() => fileRef.current.click()}>+ Add Photo</button>
                {images.length > 0 && (
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {images.map((img, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg)', borderRadius: 'var(--r-sm)', fontSize: 12 }}>
                        <span style={{ fontWeight: 600 }}>📷 {img.name}</span>
                        <button type="button" onClick={() => setImages(p => p.filter((_, j) => j !== i))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', fontWeight: 700 }}>X</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button type="submit" className="btn-cta" disabled={submitting || done === 0}>
              {submitting ? 'Submitting...' : 'Submit Inspection Report →'}
            </button>
            {done < total && (
              <p className="footnote" style={{ marginTop: 8 }}>
                {total - done} question{total - done !== 1 ? 's' : ''} remaining
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
export default InspectionForm;
