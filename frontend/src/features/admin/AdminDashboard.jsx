import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [selectedInspector, setSelectedInspector] = useState('');
  const [inspSearch, setInspSearch] = useState('');
  // Service modal
  const [svcModal, setSvcModal] = useState(false);
  const [editingSvc, setEditingSvc] = useState(null);
  const [svcForm, setSvcForm] = useState({ name: '', price: '', description: '', checklist: [] });
  const [xlFile, setXlFile] = useState(null);
  const [parsedCl, setParsedCl] = useState([]);
  const flash = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };
  const load = async () => {
    setLoading(true);
    try {
      const [br, ir, sr] = await Promise.all([
        apiFetch('/api/bookings'),
        apiFetch('/api/users/inspectors'),
        apiFetch('/api/services')
      ]);
      const [bd, id_, sd] = await Promise.all([br.json(), ir.json(), sr.json()]);
      setBookings(bd.data || []);
      setInspectors(id_.data || []);
      setServices(sd.data || []);
    } catch { flash('err', 'Failed to load data.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
    const doAssign = async () => {
    if (!selectedInspector || !assignModal) return;
    try {
      const res = await apiFetch(`/api/bookings/${assignModal._id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspectorId: selectedInspector })
      });
      if (!res.ok) throw new Error();
      flash('ok', 'Inspector assigned!');
      setAssignModal(null);
      setSelectedInspector('');
      setInspSearch('');
      load();
    } catch { flash('err', 'Assignment failed.'); }
  };
    const openNew = () => {
    setEditingSvc(null);
    setSvcForm({ name: '', price: '', description: '', checklist: [] });
    setXlFile(null);
    setParsedCl([]);
    setSvcModal(true);
  };
  const openEdit = (s) => {
    setEditingSvc(s._id);
    setSvcForm({ name: s.name, price: s.price, description: s.description || '', checklist: s.checklist || [] });
    setXlFile(null);
    setParsedCl(s.checklist || []);
    setSvcModal(true);
  };
  const saveSvc = async () => {
    if (!svcForm.name || !svcForm.price) { flash('err', 'Name and price are required.'); return; }
    try {
      const url = editingSvc ? `/api/services/${editingSvc}` : '/api/services';
      const res = await apiFetch(url, {
        method: editingSvc ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(svcForm)
      });
      if (!res.ok) throw new Error();
      flash('ok', `Service ${editingSvc ? 'updated' : 'created'}!`);
      setSvcModal(false);
      load();
    } catch { flash('err', 'Save failed.'); }
  };
  const deleteSvc = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await apiFetch(`/api/services/${id}`, { method: 'DELETE' });
      flash('ok', 'Deleted.');
      load();
    } catch { flash('err', 'Delete failed.'); }
  };
  const uploadExcel = async () => {
    if (!xlFile) return;
    const fd = new FormData();
    fd.append('file', xlFile);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/services/upload-excel', {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      setParsedCl(d.checklist);
      setSvcForm(p => ({ ...p, checklist: d.checklist }));
      flash('ok', 'Checklist parsed!');
    } catch (err) { flash('err', err.message); }
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
        <p className="loading-label">Loading admin console</p>
      </div>
    </div>
  );
  const pending = bookings.filter(b => !b.assignmentStatus || b.assignmentStatus === 'NOT_ASSIGNED' || b.assignmentStatus === 'REJECTED');
  const completed = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'APPROVED');
  const filteredInsp = inspectors.filter(i => i.name.toLowerCase().includes(inspSearch.toLowerCase()));
  return (
    <div className="page">
      <div className="container--wide">
        {}
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="auth-brand" style={{ margin: 0, cursor: 'pointer' }} onClick={() => navigate('/')}>
              <div className="auth-brand__icon" style={{ width: 28, height: 28, fontSize: 14 }}><img src="/logo.png" alt="logo" style={{width: '100%', height: '100%', objectFit: 'contain'}} /></div>
              <span className="auth-brand__name">Inspectra</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="topbar-badge"><span className="topbar-dot" />Admin Sys V2.4</div>
          </div>
        </div>
        {}
        <div className="pg-title--row">
          <h1 className="pg-title">Admin Dashboard</h1>
          <button className="btn-pill" onClick={logout} style={{ color: 'var(--red)', borderColor: 'var(--red)', gap: 4 }}>
            Logout
          </button>
        </div>
        <p className="pg-sub">Manage bookings, assignments, and view reports</p>
        {msg && <div className={`alert alert--${msg.type}`}>{msg.text}</div>}
        {}
        <div className="status-bar">
          <div className="status-bar__left">
            Dispatcher Online · Fleet sync active
          </div>
          <span className="status-bar__right">0 Errors</span>
        </div>
        {}
        <p className="sep-label" style={{ marginTop: 0 }}>Telemetry &amp; Metrics &nbsp;·&nbsp; Today</p>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Total Bookings</div>
            <div className="metric-val">{bookings.length}</div>
            <div className="metric-sub metric-sub--green">+Active</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Pending Dispatch</div>
            <div className="metric-val metric-val--orange">{String(pending.length).padStart(2, '0')}</div>
            <div className="metric-sub">{pending.length > 0 ? '●' : '—'}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Completed Audits</div>
            <div className="metric-val metric-val--green">{completed.length}</div>
            <div className="metric-sub metric-sub--green">{completed.length > 0 ? 'Yes' : '—'}</div>
          </div>
        </div>
        {}
        <div className="sc">
          <div className="sc-head">
            <div className="sc-title-group">
              <span className="sc-num">1</span>
              <span className="sc-label">Pending Assignments</span>
            </div>
            {pending.length > 0
              ? <span className="sc-meta sc-meta--orange">{pending.length} Required</span>
              : <span className="sc-meta">Queue</span>}
          </div>
          <div className="sc-body--0">
            {pending.length === 0 ? (
              <div className="empty">
                <p className="empty__text">All bookings assigned.</p>
              </div>
            ) : (
              <>
                {pending.slice(0, 3).map(b => (
                  <div key={b._id} className="assign-item">
                    <div className="assign-item__row1">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="reg-badge">{b.vehicleDetails?.registrationNumber || 'N/A'}</span>
                        <span className="assign-item__vehicle">
                          {b.vehicleDetails?.model
                            ? `${b.vehicleDetails.model}${b.vehicleDetails.variant ? ` (${b.vehicleDetails.variant})` : ''}`
                            : b.service?.name || 'Vehicle'}
                        </span>
                      </div>
                      <span className="assign-item__price">${b.service?.price || '—'}</span>
                    </div>
                    <div className="assign-item__row2">
                      {b.customerName} · Scheduled: {b.visitDate
                        ? new Date(b.visitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : 'N/A'} {b.visitTime || ''}
                    </div>
                    <div className="assign-item__row3">
                      <div className="assign-item__bay">
                        <span className="assign-item__bay-dot" />
                        {b.address ? b.address.split(',')[0] : 'No address'} Unassigned
                      </div>
                      <button className="assign-item__action"
                        onClick={() => { setAssignModal(b); setSelectedInspector(''); setInspSearch(''); }}>
                        Assign Tech →
                      </button>
                    </div>
                  </div>
                ))}
                {pending.length > 3 && (
                  <div className="assign-footer">
                    {pending.length - 3} other request{pending.length - 3 > 1 ? 's' : ''} queued in standby pool.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {/* ── Section 2: Completed Inspections ── */}
        <div className="sc">
          <div className="sc-head">
            <div className="sc-title-group">
              <span className="sc-num">2</span>
              <span className="sc-label">Completed Inspections</span>
            </div>
            <span className="sc-meta">Queue</span>
          </div>
          <div className="sc-body--0">
            {completed.length === 0 ? (
              <div style={{ padding: '14px 16px' }}>
                <p style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>
                  No completed inspections waiting for review.
                </p>
              </div>
            ) : (
              completed.map(b => (
                <div key={b._id} className="completed-item">
                  <div className="completed-item__left">
                    <div className="completed-item__check">
                      <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 700 }}></span>
                    </div>
                    <div>
                      <div className="completed-item__vehicle">
                        {b.vehicleDetails?.model || 'Vehicle'} · {b.vehicleDetails?.engineNumber || b.vehicleDetails?.registrationNumber || 'N/A'}
                      </div>
                      <div className="completed-item__by">
                        Inspected by {b.inspector?.name || 'Inspector'}
                        {b.status === 'APPROVED' && <span style={{ marginLeft: 8, color: 'var(--green)', fontWeight: 700 }}>· Approved</span>}
                      </div>
                    </div>
                  </div>
                  <button className="btn-outline"
                    onClick={() => navigate(`/admin/review/${b._id}`)}>
                    Review
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        {}
        <div className="sc">
          <div className="sc-head">
            <div className="sc-title-group">
              <span className="sc-num">3</span>
              <span className="sc-label">Manage Services</span>
            </div>
            <span className="sc-meta">Tiers</span>
          </div>
          <div className="sc-body--0">
            {services.map((s, idx) => {
              const isFeatured = idx === services.length - 1 && services.length > 1;
              return isFeatured ? (
                <div key={s._id} style={{ padding: '8px', borderTop: '1px solid var(--border)' }}>
                  <div className="tier-item tier-item--featured">
                    <span className="tier-dot" />
                    <div className="tier-info">
                      <div className="tier-name">{s.name}</div>
                      <div className="tier-desc">{s.description || 'Premium inspection tier'}</div>
                    </div>
                    <span className="tier-price--badge">${s.price}</span>
                    <button className="tier-edit" onClick={() => openEdit(s)}>Edit</button>
                  </div>
                </div>
              ) : (
                <div key={s._id} className="tier-item">
                  <span className="tier-dot" />
                  <div className="tier-info">
                    <div className="tier-name">{s.name}</div>
                    <div className="tier-desc">{s.description || 'Safety & operating components check'}</div>
                  </div>
                  <span className="tier-price">${s.price}</span>
                  <button className="tier-edit" onClick={() => openEdit(s)}>Edit</button>
                  <button className="tier-edit" style={{ color: 'var(--red)' }} onClick={() => deleteSvc(s._id)}>Del</button>
                </div>
              );
            })}
            <button className="tier-add" onClick={openNew}>+ Add New Service Tier</button>
          </div>
        </div>
        {}
        <button className="btn-cta" style={{ marginTop: 16 }}
          onClick={() => alert('Audit report generation coming soon.')}>
          Generate Daily Audit Report →
        </button>
        <p className="footnote">Precision Inspection Protocol · Encrypted Session</p>
      </div>
      {}
      {assignModal && (
        <div className="modal-bg" onClick={() => setAssignModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2 className="modal-title">Assign Inspector</h2>
              <button className="modal-close" onClick={() => setAssignModal(null)}>X</button>
            </div>
            {}
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-md)', padding: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span className="reg-badge">{assignModal.vehicleDetails?.registrationNumber || 'N/A'}</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>
                  {assignModal.vehicleDetails?.model || assignModal.service?.name || 'Vehicle'}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4 }}>
                {assignModal.customerName} · {assignModal.customerPhone}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                {assignModal.visitDate ? new Date(assignModal.visitDate).toLocaleDateString() : 'N/A'} · {assignModal.visitTime || 'N/A'}
              </div>
            </div>
            <div className="fg">
              <label className="fl">Search Inspector</label>
              <input className="fi" type="text" placeholder="Filter by name..."
                value={inspSearch} onChange={e => setInspSearch(e.target.value)} />
            </div>
            <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', marginBottom: 16 }}>
              {filteredInsp.length === 0 ? (
                <p style={{ padding: 14, fontSize: 13, color: 'var(--text-3)', textAlign: 'center' }}>No inspectors found</p>
              ) : filteredInsp.map(insp => (
                <label key={insp._id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
                  cursor: 'pointer', borderBottom: '1px solid var(--border)',
                  background: selectedInspector === insp._id ? 'var(--bg)' : 'transparent', transition: 'background .1s'
                }}>
                  <input type="radio" name="inspector" value={insp._id}
                    checked={selectedInspector === insp._id}
                    onChange={() => setSelectedInspector(insp._id)}
                    style={{ width: 15, height: 15, accentColor: 'var(--black)' }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{insp.name}</p>
                    {insp.email && <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0 }}>{insp.email}</p>}
                  </div>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn-pill" onClick={() => setAssignModal(null)}>Cancel</button>
              <button className="btn-pill" onClick={doAssign} disabled={!selectedInspector}
                style={{ background: selectedInspector ? 'var(--black)' : '', color: selectedInspector ? 'var(--white)' : '' }}>
                Assign Tech →
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ══ Service Modal ══ */}
      {svcModal && (
        <div className="modal-bg" onClick={() => setSvcModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2 className="modal-title">{editingSvc ? 'Edit Service' : 'Add Service Tier'}</h2>
              <button className="modal-close" onClick={() => setSvcModal(false)}>X</button>
            </div>
            <div className="fg">
              <label className="fl fl--req">Service Name</label>
              <input className="fi" type="text" placeholder="e.g. Premium Vehicle Inspection"
                value={svcForm.name} onChange={e => setSvcForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="frow">
              <div className="fg">
                <label className="fl fl--req">Price ($)</label>
                <input className="fi" type="number" placeholder="199.99"
                  value={svcForm.price} onChange={e => setSvcForm(p => ({ ...p, price: e.target.value }))} />
              </div>
              <div className="fg">
                <label className="fl">Description</label>
                <input className="fi" type="text" placeholder="Brief description"
                  value={svcForm.description} onChange={e => setSvcForm(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            {}
            <div style={{ background: 'var(--bg)', border: '1px dashed var(--border-2)', borderRadius: 'var(--r-md)', padding: 14, marginBottom: 14 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.07em', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 10 }}>
                Upload Checklist via Excel
              </p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <label className="btn-pill btn-pill--sm" style={{ cursor: 'pointer' }}>
                  {xlFile ? xlFile.name : 'Choose File'}
                  <input type="file" accept=".xlsx,.xls" style={{ display: 'none' }}
                    onChange={e => { if (e.target.files[0]) setXlFile(e.target.files[0]); }} />
                </label>
                <button className="btn-pill btn-pill--sm" onClick={uploadExcel} disabled={!xlFile}>Parse</button>
                {parsedCl.length > 0 && (
                  <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>{parsedCl.length} sections</span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn-pill" onClick={() => setSvcModal(false)}>Cancel</button>
              <button className="btn-pill" onClick={saveSvc}
                style={{ background: 'var(--black)', color: 'var(--white)' }}>
                {editingSvc ? 'Save Changes' : 'Create Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;
