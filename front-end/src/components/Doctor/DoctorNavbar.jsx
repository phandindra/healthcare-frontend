import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const DoctorNavbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear ALL storage items
        const storageKeys = [
            'jwtToken', 'currentUser', 'isAuthenticated', 
            'userRole', 'token', 'user', 'patientId', 'userId',
            'doctorId'
        ];
        
        storageKeys.forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });
        
        // Clear all localStorage and sessionStorage
        localStorage.clear();
        sessionStorage.clear();
        
        // Replace history entry with login page
        window.history.replaceState(null, "", "/login");
        
        // Navigate with replace to prevent going back
        navigate("/login", { replace: true });
        
        // Force reload to clear React state
        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

    return (
        <Navbar 
            expand="lg" 
            fixed="top" 
            style={{ backgroundColor: "#48b575" }}
            className="navbar-dark"
        >
            <Container>
                <Navbar.Brand 
                    onClick={() => navigate("/doctor")} 
                    className="fw-bold fs-4" 
                    style={{ color: "#ffffff", cursor: "pointer" }}
                >
                    DocLink Doctor
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="doctorNavbar" />
                
                <Navbar.Collapse id="doctorNavbar">
                    <Nav className="me-auto mb-2 mb-lg-0">
                        <Nav.Link 
                            onClick={() => navigate("/doctor")} 
                            className="fw-medium" 
                            style={{ color: "#e8f5e9", cursor: "pointer" }}
                        >
                            Dashboard
                        </Nav.Link>
                    </Nav>

                    <Nav>
                        <NavDropdown 
                            title="Profile" 
                            id="doctorProfileDropdown"
                            className="fw-medium"
                            menuVariant="dark"
                        >
                            <NavDropdown.Item onClick={() => navigate("/doctor/doctorEdit")}>
                                Edit Profile
                            </NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item onClick={handleLogout} className="text-danger">
                                Logout
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default DoctorNavbar;