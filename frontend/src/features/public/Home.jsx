import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
const Home = () => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const handleRoleLogin = (role) => {
    navigate(`/login?role=${role}`);
  };
  return (
    <div className="home-page">
      { }
      <nav className="h-navbar">
        <div className="h-nav-logo" style={{ cursor: 'pointer' }} onClick={() => window.scrollTo(0, 0)}>
          <div className="h-nav-icon"><img src="/logo.png" alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} /></div>
          <span className="h-nav-text" style={{ cursor: 'pointer' }} >Inspectra</span>
        </div>
        <div className="h-nav-links">
          <a href="#home">HOME</a>
          <a href="#about">ABOUT US</a>
          <a href="#services">SERVICES</a>
          <a href="#contact">CONTACT</a>
        </div>
        <div className="h-nav-actions">
          <button className="h-btn-outline" onClick={() => setShowLoginModal(true)}>
            LOGIN
          </button>
          <button className="h-btn-solid" onClick={() => navigate('/login?role=customer')}>
            BOOK INSPECTION →
          </button>
        </div>
      </nav>
      { }
      <section className="h-hero" id="home">
        <div className="h-hero-content">
          <div className="h-hero-badge">■ CERTIFIED VEHICLE INSPECTIONS</div>
          <h1 className="h-hero-title">KNOW THE CONDITION<br />OF YOUR VEHICLE.</h1>
          <p className="h-hero-subtitle">
            Professional multi-point vehicle inspections providing detailed diagnostic
            reports, comprehensive photo evidence, and certified peace of mind before
            you buy, sell, or drive.
          </p>
          <div className="h-hero-actions">
            <button className="h-btn-solid" onClick={() => navigate('/login?role=customer')}>
              BOOK AN INSPECTION →
            </button>
            <button className="h-btn-outline" onClick={() => {
              document.getElementById('preview-section').scrollIntoView({ behavior: 'smooth' });
            }}>
              VIEW SAMPLE REPORT
            </button>
          </div>
          <div className="h-hero-trust">
            <span>Over 10,000 Inspections</span>
            <span>Certified Mechanics</span>
            <span>24 Hour Turnaround</span>
          </div>
        </div>
        <div className="h-hero-image-container">
          <div className="h-hero-image-backdrop"></div>
          {/* Background car image */}
          <div className="h-hero-image" style={{ backgroundImage: 'url(/mercedes.png)' }}></div>
        </div>
      </section>
      { }
      <div className="h-ticker">
        <div className="h-ticker-track">
          <span>■ 120-POINT CHECK</span>
          <span>■ CERTIFIED TECHS</span>
          <span>■ DETAILED REPORT</span>
          <span>■ NATIONWIDE SERVICE</span>
          <span>■ 120-POINT CHECK</span>
          <span>■ CERTIFIED TECHS</span>
          <span>■ DETAILED REPORT</span>
          <span>■ NATIONWIDE SERVICE</span>
        </div>
      </div>
      { }
      <section className="h-section" id="about">
        <div className="h-section-header">
          <span className="h-section-badge">OUR PROCESS</span>
          <h2 className="h-section-title">WHAT WE INSPECT</h2>
          <p className="h-section-desc">Comprehensive 120-point mechanical and structural audit covering every critical component of your vehicle.</p>
        </div>
        <div className="h-grid-features">
          <div className="h-feature-card">
            <div className="h-feature-icon">01</div>
            <h3>EXTERIOR</h3>
            <p>Paint condition, panel alignment, structural integrity, glass, lights, and underlying rust or body repairs.</p>
          </div>
          <div className="h-feature-card">
            <div className="h-feature-icon">02</div>
            <h3>ENGINE & DIAGNOSTICS</h3>
            <p>OBD-II scans, fluid condition, belts, hoses, mounts, and operational sounds to identify hidden faults.</p>
          </div>
          <div className="h-feature-card">
            <div className="h-feature-icon">03</div>
            <h3>BRAKES & STEERING</h3>
            <p>Rotor condition, pad life, fluid quality, power steering operation, and suspension component wear.</p>
          </div>
          <div className="h-feature-card">
            <div className="h-feature-icon">04</div>
            <h3>TIRES & WHEELS</h3>
            <p>Tread depth measurements, uneven wear patterns indicating alignment issues, and rim condition.</p>
          </div>
          <div className="h-feature-card">
            <div className="h-feature-icon">05</div>
            <h3>UNDERCARRIAGE & SUSPENSION</h3>
            <p>Frame damage, fluid leaks, exhaust system integrity, shocks, struts, and bushing condition.</p>
          </div>
          <div className="h-feature-card">
            <div className="h-feature-icon">06</div>
            <h3>INTERIOR & SAFETY</h3>
            <p>Airbag readiness, seatbelts, electronic controls, AC/Heat performance, and interior trim condition.</p>
          </div>
        </div>
      </section>
      { }
      <section className="h-section h-section-gray" id="process">
        <div className="h-section-header">
          <span className="h-section-badge">HOW IT WORKS</span>
          <h2 className="h-section-title">FROM BOOKING TO REPORT</h2>
          <p className="h-section-desc">A seamless experience designed to give you clarity and confidence in three simple steps.</p>
        </div>
        <div className="h-steps-container">
          <div className="h-step">
            <div className="h-step-num">01</div>
            <h3>BOOK</h3>
            <p>Schedule your inspection online. Choose your service tier and provide vehicle location details.</p>
          </div>
          <div className="h-step">
            <div className="h-step-num">02</div>
            <h3>INSPECT</h3>
            <p>Our certified mechanics perform a rigorous on-site audit using our proprietary mobile application.</p>
          </div>
          <div className="h-step">
            <div className="h-step-num">03</div>
            <h3>REPORT</h3>
            <p>Receive a comprehensive, digitally signed PDF report with technician notes and condition grading.</p>
          </div>
        </div>
      </section>
      { }
      <section className="h-section h-bg-alt">
        <div className="h-section-header">
          <span className="h-section-badge">WHAT WE CHECK</span>
          <h2 className="h-section-title">COMPREHENSIVE 120-POINT INSPECTION</h2>
          <p className="h-section-desc">Every inch of your vehicle is scrutinized by our certified experts.</p>
        </div>
        <div className="h-features-image-container">
          <img src="/car-features.png" alt="Car Inspection Features" className="h-features-image" />
        </div>
      </section>
      { }
      <section className="h-section" id="preview-section">
        <div className="h-section-header">
          <span className="h-section-badge">THE DELIVERABLE</span>
          <h2 className="h-section-title">INSPECTION REPORT PREVIEW</h2>
          <p className="h-section-desc">Get a detailed breakdown of your vehicle's health with our standardized reporting format.</p>
        </div>
        <div className="h-preview-container">
          <div className="h-preview-mockup">
            <div className="h-preview-header">
              <div>
                <span className="h-preview-logo"><img src="/logo.png" alt="logo" style={{ width: '24px', height: '24px', objectFit: 'contain', borderRadius: '50%', verticalAlign: 'middle' }} /></span>
                <span className="h-preview-title">VEHICLE INSPECTION REPORT</span>
              </div>
              <div className="h-preview-badge">VERIFIED</div>
            </div>
            <div className="h-preview-details">
              <div className="h-pd-col">
                <span className="h-pd-label">VEHICLE</span>
                <span className="h-pd-val">2022 BMW M3 Comp</span>
              </div>
              <div className="h-pd-col">
                <span className="h-pd-label">VIN NUMBER</span>
                <span className="h-pd-val">WBA3333902939</span>
              </div>
              <div className="h-pd-col">
                <span className="h-pd-label">INSPECTED ON</span>
                <span className="h-pd-val">Oct 12, 2024</span>
              </div>
              <div className="h-pd-col">
                <span className="h-pd-label">SCORE</span>
                <span className="h-pd-val h-pd-score">92/100</span>
              </div>
            </div>
            <div className="h-preview-list">
              <div className="h-pl-row">
                <span>Engine & Diagnostics</span>
                <span className="h-pl-pass">PASS</span>
              </div>
              <div className="h-pl-row">
                <span>Exterior Condition</span>
                <span className="h-pl-pass">PASS</span>
              </div>
              <div className="h-pl-row">
                <span>Tires (Front Left)</span>
                <span className="h-pl-warn">NOTED</span>
              </div>
              <div className="h-pl-row">
                <span>Brake Pads (Rear)</span>
                <span className="h-pl-pass">PASS</span>
              </div>
              <div className="h-pl-row">
                <span>Undercarriage Rust</span>
                <span className="h-pl-pass">PASS</span>
              </div>
            </div>
            <div className="h-preview-footer">
              <button className="h-btn-outline" style={{ width: '100%', borderColor: 'rgba(255,255,255,0.2)' }}>
                DOWNLOAD FULL PDF REPORT ↓
              </button>
            </div>
          </div>
        </div>
      </section>
      { }
      <section className="h-section h-section-gray" id="services">
        <div className="h-section-header">
          <span className="h-section-badge">TRANSPARENT PRICING</span>
          <h2 className="h-section-title">INSPECTION TIERS</h2>
          <p className="h-section-desc">Choose the level of detail you need. No hidden fees, flat rate anywhere in our service area.</p>
        </div>
        <div className="h-pricing-container">
          <div className="h-pricing-card">
            <div className="h-pricing-tier">STANDARD</div>
            <h3 className="h-pricing-title">STANDARD VEHICLE INSPECTION</h3>
            <p className="h-pricing-desc">Essential safety and mechanical check for peace of mind.</p>
            <div className="h-pricing-price">₹999 <span>/ vehicle</span></div>
            <ul className="h-pricing-features">
              <li>80-Point Mechanical Check</li>
              <li>Fluid & Belt Inspection</li>
              <li>Exterior & Interior Audit</li>
              <li>Digital PDF Report Summary</li>
            </ul>
            <button className="h-btn-outline" style={{ width: '100%' }} onClick={() => navigate('/login?role=customer')}>
              BOOK STANDARD →
            </button>
          </div>
          <div className="h-pricing-card h-pricing-featured">
            <div className="h-pricing-badge">RECOMMENDED</div>
            <div className="h-pricing-tier">PREMIUM</div>
            <h3 className="h-pricing-title">PREMIUM VEHICLE INSPECTION</h3>
            <p className="h-pricing-desc">Deep diagnostic audit covering everything from OBD-II to undercarriage.</p>
            <div className="h-pricing-price">₹1999 <span>/ vehicle</span></div>
            <ul className="h-pricing-features">
              <li>120-Point Bumper-to-Bumper Check</li>
              <li>Full OBD-II Computer Diagnostics</li>
              <li>Paint Meter Verification & Rust Check</li>
              <li>Detailed Photo Evidence (30+ pics)</li>
              <li>Priority 12-hour turnaround</li>
            </ul>
            <button className="h-btn-solid" style={{ width: '100%' }} onClick={() => navigate('/login?role=customer')}>
              BOOK PREMIUM →
            </button>
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section className="h-section" id="contact">
        <div className="h-section-header">
          <span className="h-section-badge">REACH OUT</span>
          <h2 className="h-section-title">CONTACT DETAILS</h2>
        </div>
        <div style={{ textAlign: 'center', color: 'var(--h-text)', lineHeight: '1.8' }}>
          <p><strong>Name:</strong> Rajneesh Yadav</p>
          <p><strong>Mob:</strong> 9026975515</p>
          <p><strong>Email:</strong> <a href="mailto:rajneeshyadav0507@gmail.com" style={{ color: 'var(--h-primary)', textDecoration: 'none' }}>rajneeshyadav0507@gmail.com</a></p>
          <p><strong>Address:</strong> MMMUT Gorakhpur Uttar Pradesh 273010</p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="h-cta-section">
        <div className="h-cta-box">
          <span className="h-cta-badge">GET STARTED</span>
          <h2>READY TO INSPECT YOUR VEHICLE?</h2>
          <p>Book online in 60 seconds and have our certified technician dispatched to your location.</p>
          <button className="h-btn-solid h-btn-light" onClick={() => navigate('/login?role=customer')}>
            BOOK INSPECTION NOW →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="h-footer">
        <div className="h-footer-top">
          <div className="h-footer-brand" style={{ cursor: 'pointer' }} onClick={() => window.scrollTo(0, 0)}>
            <div className="h-nav-icon"><img src="/logo.png" alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} /></div>
            <span className="h-nav-text" style={{ cursor: 'pointer' }}>Inspectra</span>
          </div>
          <div className="h-footer-links">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#contact">Contact</a>
            <button onClick={() => setShowLoginModal(true)} style={{ background: 'none', border: 'none', color: 'var(--h-text-muted)', cursor: 'pointer', fontSize: '13px', fontWeight: 500, padding: 0, fontFamily: 'inherit' }}>Portal Login</button>
          </div>
        </div>
        <div className="h-footer-bottom">
          <p>© 2026 <span style={{ cursor: 'pointer' }}>Inspectra</span>. All rights reserved. | Made By Rajneesh Yadav</p>
          <div className="h-footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
      { }
      {showLoginModal && (
        <div className="h-modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="h-modal-box" onClick={e => e.stopPropagation()}>
            <div className="h-modal-header">
              <h2>Select Portal Access</h2>
              <button className="h-modal-close" onClick={() => setShowLoginModal(false)}>X</button>
            </div>
            <p className="h-modal-sub">Choose your account type to proceed to the secure login portal.</p>
            <div className="h-role-grid">
              <button className="h-role-card" onClick={() => handleRoleLogin('customer')}>
                <h3>Customer Portal</h3>
                <p>Book inspections, view reports, and manage your vehicles.</p>
              </button>
              <button className="h-role-card" onClick={() => handleRoleLogin('inspector')}>
                <h3>Inspector Portal</h3>
                <p>View assignments, complete audits, and submit reports.</p>
              </button>
              <button className="h-role-card" onClick={() => handleRoleLogin('admin')}>
                <h3>Admin Console</h3>
                <p>Manage dispatch, review reports, and oversee operations.</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Home;
