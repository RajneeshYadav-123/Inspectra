import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
const CreateBooking = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({
    customerName: '', customerPhone: '', address: '',
    visitDate: '', visitTime: '',
    registrationNumber: '', vehicleType: '', model: '',
    year: '', variant: '', engineNumber: '',
    selectedServiceId: ''
  });
  useEffect(() => {
    apiFetch('/api/services')
      .then(r => r.json())
      .then(d => setServices(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    if (!form.selectedServiceId) {
      setMessage({ type: 'err', text: 'Please select a service to continue.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await apiFetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          address: form.address,
          visitDate: form.visitDate,
          visitTime: form.visitTime,
          service: form.selectedServiceId,
          vehicleDetails: {
            registrationNumber: form.registrationNumber,
            vehicleType: form.vehicleType,
            model: form.model,
            year: form.year ? parseInt(form.year) : undefined,
            variant: form.variant,
            engineNumber: form.engineNumber
          }
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create booking');
      }
      setMessage({ type: 'ok', text: 'Booking confirmed! Redirecting...' });
      setTimeout(() => navigate('/customer'), 2000);
    } catch (err) {
      setMessage({ type: 'err', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) return (
    <div className="loading-screen">
      <div className="loading-box">
        <div className="spinner" />
        <p className="loading-label">Loading booking form</p>
      </div>
    </div>
  );
  return (
    <div className="page">
      <div className="container">
        {}
        <div className="topbar">
          <button className="topbar-back" onClick={() => navigate('/customer')}>← Dashboard</button>
          <div className="topbar-badge"><span className="topbar-dot" />Inspection V2.4</div>
        </div>
        {}
        <p className="pg-eyebrow">Step 01/03</p>
        <h1 className="pg-title">Create New Booking</h1>
        <p className="pg-sub">Schedule your comprehensive vehicle inspection</p>
        {message && <div className={`alert alert--${message.type}`}>{message.text}</div>}
        <form onSubmit={submit}>
          {}
          <div className="sc">
            <div className="sc-head">
              <div className="sc-title-group">
                <span className="sc-num">1</span>
                <span className="sc-label">Select a Service</span>
              </div>
              <span className="sc-meta">
                {form.selectedServiceId ? 'SELECT 1' : 'SELECT 1'}
              </span>
            </div>
            <div className="sc-body">
              {services.map(s => (
                <div key={s._id}
                  className={`svc-opt ${form.selectedServiceId === s._id ? 'svc-opt--sel' : ''}`}
                  onClick={() => setForm(p => ({ ...p, selectedServiceId: s._id }))}>
                  <div className="svc-radio" />
                  <div style={{ flex: 1 }}>
                    <div className="svc-name">{s.name}</div>
                    {s.description && <div className="svc-desc">{s.description}</div>}
                  </div>
                  <span className="svc-price">${s.price}</span>
                </div>
              ))}
              {services.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: '10px 0' }}>No services available.</p>
              )}
            </div>
          </div>
          {}
          <div className="sc">
            <div className="sc-head">
              <div className="sc-title-group">
                <span className="sc-num">2</span>
                <span className="sc-label">Customer &amp; Visit Details</span>
              </div>
              <span className="sc-meta" style={{ color: 'var(--red)', fontWeight: 700 }}>Required</span>
            </div>
            <div className="sc-body">
              <div className="fg">
                <label className="fl fl--req">Customer Name</label>
                <input className="fi" type="text" name="customerName"
                  placeholder="e.g. Adrian Walker" value={form.customerName} onChange={handle} required />
              </div>
              <div className="fg">
                <label className="fl fl--req">Phone Number</label>
                <input className="fi" type="tel" name="customerPhone"
                  placeholder="+1 (555) 019-2834" value={form.customerPhone} onChange={handle} required />
              </div>
              <div className="fg">
                <label className="fl">Visit Address</label>
                <div className="fi-wrap">
                  <span className="fi-icon"></span>
                  <input className="fi fi--icon" type="text" name="address"
                    placeholder="Street address or designated workshop bay"
                    value={form.address} onChange={handle} />
                </div>
              </div>
              <div className="frow">
                <div className="fg">
                  <label className="fl fl--req">Visit Date</label>
                  <input className="fi" type="date" name="visitDate"
                    value={form.visitDate} onChange={handle} required />
                </div>
                <div className="fg">
                  <label className="fl fl--req">Visit Time</label>
                  <input className="fi" type="time" name="visitTime"
                    value={form.visitTime} onChange={handle} required />
                </div>
              </div>
            </div>
          </div>
          {}
          <div className="sc">
            <div className="sc-head">
              <div className="sc-title-group">
                <span className="sc-num">3</span>
                <span className="sc-label">Vehicle Details</span>
              </div>
              <span className="sc-meta">Specs</span>
            </div>
            <div className="sc-body">
              <div className="fg">
                <div className="fl-row">
                  <label className="fl fl--req" style={{ margin: 0 }}>Registration Number</label>
                  <span className="fl-side">Reg / Plate</span>
                </div>
                <input className="fi" type="text" name="registrationNumber"
                  placeholder="USA  7XYZ892" value={form.registrationNumber} onChange={handle}
                  required style={{ fontWeight: 700, letterSpacing: '.07em' }} />
              </div>
              <div className="frow">
                <div className="fg">
                  <label className="fl">Vehicle Type</label>
                  <input className="fi" type="text" name="vehicleType"
                    placeholder="Sedan / SUV" value={form.vehicleType} onChange={handle} />
                </div>
                <div className="fg">
                  <label className="fl">Model</label>
                  <input className="fi" type="text" name="model"
                    placeholder="e.g. Model 3 / Camry" value={form.model} onChange={handle} />
                </div>
              </div>
              <div className="frow">
                <div className="fg">
                  <label className="fl">Year</label>
                  <input className="fi" type="number" name="year"
                    placeholder="2022" value={form.year} onChange={handle} min="1900" max="2099" />
                </div>
                <div className="fg">
                  <label className="fl">Variant</label>
                  <input className="fi" type="text" name="variant"
                    placeholder="Long Range / AWD" value={form.variant} onChange={handle} />
                </div>
              </div>
              <div className="fg">
                <label className="fl">Engine Number</label>
                <input className="fi" type="text" name="engineNumber"
                  placeholder="e.g. B5B830M1/DUAL-MTR" value={form.engineNumber} onChange={handle} />
              </div>
            </div>
          </div>
          <button type="submit" className="btn-cta" disabled={submitting}>
            {submitting ? 'Processing...' : 'Confirm Booking →'}
          </button>
          <p className="footnote" style={{ marginTop: 12 }}>
            Confirmation &amp; Invoice will be sent via SMS
          </p>
          <p className="footnote" style={{ marginTop: 4 }}>
            Verified Inspection Protocol · Secure Session
          </p>
        </form>
      </div>
    </div>
  );
};
export default CreateBooking;
