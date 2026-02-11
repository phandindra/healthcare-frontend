import React from "react";
import Poster from "../assets/Poster.jpg";

const LandingPage = () => {
  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <nav className="navbar navbar-expand-lg navbar-dark fixed-top" style={{ backgroundColor: "#48b575" }}>
        <div className="container">
          <a className="navbar-brand fw-bold fs-3" href="#top" style={{ color: "#ffffff" }}>
            DocLink
          </a>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item mx-3">
                <a className="nav-link fw-medium" href="#features" style={{ color: "#e8f5e9" }}>Features</a>
              </li>
              <li className="nav-item mx-3">
                <a className="nav-link fw-medium" href="#about" style={{ color: "#e8f5e9" }}>About</a>
              </li>
              <li className="nav-item mx-3">
                <a className="nav-link fw-medium" href="#contact" style={{ color: "#e8f5e9" }}>Contact</a>
              </li>
              <li className="nav-item mx-3">
                <a className="btn btn-light rounded-pill px-4" href="/login" style={{ color: "#48b575", fontWeight: "600" }}>Login</a>
              </li>
              <li className="nav-item">
                <a className="btn btn-light rounded-pill px-4 shadow-sm" href="/signup" style={{ backgroundColor: "#ffffff", color: "#48b575", border: "none", fontWeight: "600" }}>Sign Up</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <section className="pt-5 mt-5" style={{ paddingTop: "100px", paddingBottom:"50px", background: "#ecf0f1" }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <h1 className="display-5 fw-bold mb-4" style={{ lineHeight: "1.2", color: "#2c3e50" }}>
                Find & Book 
                <span style={{ color: "#48b575" }}> Trusted Doctors</span>
              </h1>
              <p className="lead mb-4" style={{ fontSize: "1.1rem", color: "#34495e" }}>
                Book appointments with certified doctors in minutes. 
                Search by specialization, check availability, and manage your healthcare seamlessly.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <a href="/signup" className="btn btn-success btn-lg px-4 shadow-sm" style={{ backgroundColor: "#48b575", border: "none", borderRadius: "8px", fontWeight: "600" }}>
                  Get Started Free
                </a>
                <a href="/doctors" className="btn btn-outline-success btn-lg px-4" style={{ borderRadius: "8px", borderColor: "#48b575", color: "#48b575", fontWeight: "600" }}>
                  Find Doctors
                </a>
              </div>
              
              <div className="mt-5 d-flex gap-4">
                <div>
                  <h4 className="fw-bold mb-1" style={{ color: "#2c3e50" }}>500+</h4>
                  <small style={{ color: "#7f8c8d" }}>Expert Doctors</small>
                </div>
                <div>
                  <h4 className="fw-bold mb-1" style={{ color: "#2c3e50" }}>24/7</h4>
                  <small style={{ color: "#7f8c8d" }}>Support</small>
                </div>
                <div>
                  <h4 className="fw-bold mb-1" style={{ color: "#2c3e50" }}>4.9★</h4>
                  <small style={{ color: "#7f8c8d" }}>Rating</small>
                </div>
              </div>
            </div>
            
            <div className="col-lg-6">
              <div className="position-relative">
                <div style={{ 
                  width: "100%", 
                  borderRadius: "16px", 
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  backgroundColor: "#fff",
                  padding: "20px"
                }}>
                  <img 
                    src={Poster} 
                    alt="Doctor Consultation" 
                    style={{ 
                      width: "100%", 
                      height: "auto",
                      borderRadius: "8px",
                      display: "block"
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-5" style={{ background: "#ffffff" }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3" style={{ color: "#2c3e50" }}>Why Choose DocLink</h2>
            <p style={{ color: "#7f8c8d" }}>Simple, Fast & Reliable Healthcare</p>
          </div>
          
          <div className="row g-4">
            <div className="col-md-4">
              <div className="text-center p-4 h-100" style={{ 
                background: "#f8f9fa",
                borderRadius: "12px",
                border: "1px solid #e9ecef"
              }}>
                <div className="mb-3">
                  <div style={{ 
                    width: "70px", 
                    height: "70px", 
                    backgroundColor: "#48b575", 
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    color: "white",
                    fontSize: "24px"
                  }}>
                    📅
                  </div>
                </div>
                <h5 className="fw-bold mb-2" style={{ color: "#2c3e50" }}>Easy Booking</h5>
                <p className="small" style={{ color: "#7f8c8d" }}>Book appointments in minutes with our simple interface</p>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="text-center p-4 h-100" style={{ 
                background: "#f8f9fa",
                borderRadius: "12px",
                border: "1px solid #e9ecef"
              }}>
                <div className="mb-3">
                  <div style={{ 
                    width: "70px", 
                    height: "70px", 
                    backgroundColor: "#48b575", 
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    color: "white",
                    fontSize: "24px"
                  }}>
                    👨‍⚕️
                  </div>
                </div>
                <h5 className="fw-bold mb-2" style={{ color: "#2c3e50" }}>Verified Doctors</h5>
                <p className="small" style={{ color: "#7f8c8d" }}>All doctors are verified and qualified professionals</p>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="text-center p-4 h-100" style={{ 
                background: "#f8f9fa",
                borderRadius: "12px",
                border: "1px solid #e9ecef"
              }}>
                <div className="mb-3">
                  <div style={{ 
                    width: "70px", 
                    height: "70px", 
                    backgroundColor: "#48b575", 
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    color: "white",
                    fontSize: "24px"
                  }}>
                    ⚡
                  </div>
                </div>
                <h5 className="fw-bold mb-2" style={{ color: "#2c3e50" }}>Fast Service</h5>
                <p className="small" style={{ color: "#7f8c8d" }}>Quick response and same-day appointments available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-5" style={{ background: "#ecf0f1" }}>
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h2 className="fw-bold mb-4" style={{ color: "#2c3e50" }}>
                Your Health is
                <br />
                <span style={{ color: "#48b575" }}>Our Priority</span>
              </h2>
              <p className="mb-4" style={{ color: "#34495e" }}>
                DocLink connects patients with healthcare providers through a seamless digital platform. 
                We make healthcare accessible, efficient, and convenient for everyone.
              </p>
              <a href="/signup" className="btn btn-success px-4" style={{ backgroundColor: "#48b575", border: "none", borderRadius: "8px", fontWeight: "600" }}>
                Join Now
              </a>
            </div>
            <div className="col-lg-6">
              <div className="p-4 rounded-3" style={{ 
                backgroundColor: "#2c3e50",
                color: "#ecf0f1"
              }}>
                <h4 className="fw-bold mb-3">Start Your Health Journey</h4>
                <p className="mb-4" style={{ opacity: 0.9 }}>
                  Whether you need a routine check-up or specialist consultation, 
                  we're here to help you every step of the way.
                </p>
                <a href="/doctors" className="btn btn-light text-dark fw-medium" style={{ borderRadius: "8px", fontWeight: "600" }}>
                  Find Doctors →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-5" style={{ background: "#ffffff", color: "#434141" }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-2">Get In Touch</h2>
            <p style={{ opacity: 0.9 }}>We're here to help with your healthcare needs</p>
          </div>
          
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="p-4 rounded-3" style={{ 
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)"
              }}>
                <form  >
                  <div className="row g-3"  >
                    <div className="col-md-6">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Your Name"
                        style={{ 
                          padding: "12px", 
                          borderRadius: "8px",
                          border: "1px solid #ced4da",
                          backgroundColor: "#ffffff"
                        }}
                      />
                    </div>
                    <div className="col-md-6">
                      <input 
                        type="email" 
                        className="form-control" 
                        placeholder="Your Email"
                        style={{ 
                          padding: "12px", 
                          borderRadius: "8px",
                          border: "1px solid #ced4da",
                          backgroundColor: "#ffffff"
                        }}
                      />
                    </div>
                    <div className="col-12">
                      <textarea 
                        className="form-control" 
                        rows="4" 
                        placeholder="Your Message"
                        style={{ 
                          padding: "12px", 
                          borderRadius: "8px",
                          border: "1px solid #ced4da",
                          backgroundColor: "#ffffff"
                        }}
                      ></textarea>
                    </div>
                    <div className="col-12 text-center">
                      <button 
                        type="submit" 
                        className="btn btn-light px-5 py-2 fw-medium"
                        style={{ 
                          backgroundColor: "#48b575", 
                          color: "#ffffff",
                          border: "none", 
                          borderRadius: "8px",
                          fontWeight: "600"
                        }}
                      >
                        Send Message
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-5" style={{ backgroundColor: "#34495e", color: "#ecf0f1" }}>
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-4">
              <h5 className="fw-bold mb-3" style={{ color: "#ffffff" }}>DocLink</h5>
              <p className="small" style={{ color: "#bdc3c7", lineHeight: "1.6" }}>
                Making healthcare accessible and convenient through technology.
              </p>
            </div>
            
            <div className="col-md-2 mb-4">
              <h6 className="fw-bold mb-3" style={{ color: "#ffffff" }}>Quick Links</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="/" className="text-decoration-none small" style={{ color: "#bdc3c7" }}>Home</a></li>
                <li className="mb-2"><a href="/doctors" className="text-decoration-none small" style={{ color: "#bdc3c7" }}>Find Doctors</a></li>
                <li className="mb-2"><a href="/login" className="text-decoration-none small" style={{ color: "#bdc3c7" }}>Login</a></li>
                <li><a href="/signup" className="text-decoration-none small" style={{ color: "#bdc3c7" }}>Sign Up</a></li>
              </ul>
            </div>
            
            <div className="col-md-3 mb-4">
              <h6 className="fw-bold mb-3" style={{ color: "#ffffff" }}>Contact</h6>
              <ul className="list-unstyled small" style={{ color: "#bdc3c7" }}>
                <li className="mb-2">admin@DocLink.com</li>
                <li className="mb-2">+91 9123456780</li>
                <li>123 pune Street</li>
              </ul>
            </div>
            
            <div className="col-md-3">
              <h6 className="fw-bold mb-3" style={{ color: "#ffffff" }}>Get Started</h6>
              <a href="/signup" className="btn btn-light btn-sm fw-medium" style={{ 
                borderRadius: "8px",
                backgroundColor: "#ffffff",
                color: "#48b575",
                padding: "8px 16px",
                border: "none",
                fontWeight: "600"
              }}>
                Create Account
              </a>
            </div>
          </div>
          
          <div className="border-top mt-4 pt-4 text-center" style={{ borderColor: "#4a6572 !important" }}>
            <small style={{ color: "#95a5a6" }}>
              © 2026 DocLink. All rights reserved.
            </small>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;