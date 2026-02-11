// src/components/admin/DoctorList.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Card, Form, InputGroup, Toast, ToastContainer } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DoctorList = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState({
        show: false,
        message: '',
        variant: 'success' // 'success' or 'danger'
    });
    
    // Fetch doctors from API
    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/doctor/findAllDoctors`);
            setDoctors(response.data);
        } catch (error) {
            console.error('Error fetching doctors:', error);
            setToast({
                show: true,
                message: 'Failed to fetch doctors',
                variant: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (doctorId) => {
        navigate(`/admin/editDoctor/${doctorId}`);
    };

    const handleDelete = async (doctorId, doctorName) => {
       
            try {
                const response = await axios.delete(`${BASE_URL}/doctor/${doctorId}`);
                
                if (response.data.status === 'SUCCESS') {
                    // Remove doctor from state
                    setDoctors(doctors.filter(doctor => doctor.doctorId !== doctorId));
                    
                    // Show success toast
                    setToast({
                        show: true,
                        message: `Dr. ${doctorName} deleted successfully`,
                        variant: 'success'
                    });
                } else {
                    setToast({
                        show: true,
                        message: response.data.message || 'Failed to delete doctor',
                        variant: 'danger'
                    });
                }
            } catch (error) {
                console.error('Error deleting doctor:', error);
                
                if (error.response) {
                    setToast({
                        show: true,
                        message: error.response.data.message || 'Failed to delete doctor',
                        variant: 'danger'
                    });
                } else if (error.request) {
                    setToast({
                        show: true,
                        message: 'Network error. Please check your connection.',
                        variant: 'danger'
                    });
                } else {
                    setToast({
                        show: true,
                        message: 'An error occurred. Please try again.',
                        variant: 'danger'
                    });
                }
            }
        
    };

    const filteredDoctors = doctors.filter(doctor =>
        doctor.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
        doctor.email?.toLowerCase().includes(search.toLowerCase()) ||
        doctor.speciality?.toLowerCase().includes(search.toLowerCase()) ||
        doctor.location?.toLowerCase().includes(search.toLowerCase())
    );

    // Format time to 12-hour format
    const formatTime = (timeString) => {
        if (!timeString) return 'N/A';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    };

    return (
        <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
            {/* Navbar */}
            <AdminNavbar/>

            {/* Toast Notification */}
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999, marginTop: '80px' }}>
                <Toast 
                    show={toast.show} 
                    onClose={() => setToast({...toast, show: false})}
                    delay={5000} 
                    autohide
                    bg={toast.variant}
                >
                    <Toast.Header closeButton>
                        <strong className="me-auto">
                            {toast.variant === 'success' ? 'Success' : 'Error'}
                        </strong>
                    </Toast.Header>
                    <Toast.Body className="text-white">
                        {toast.message}
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            <div style={{ paddingTop: "80px" }}></div>

            <div className="container py-4">
                {/* Page Header */}
                <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h2 className="fw-bold mb-2" style={{ color: '#2c3e50' }}>Doctor Management</h2>
                            <p className="text-muted mb-0">View and manage all registered doctors</p>
                        </div>
                        <div className="d-flex gap-2">
                            <Button
                                onClick={() => navigate('/admin/addDoctor')}
                                className="rounded-pill px-4 fw-medium"
                                style={{ 
                                    backgroundColor: '#48b575', 
                                    color: 'white', 
                                    border: 'none' 
                                }}
                            >
                                + Add New Doctor
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Card */}
                <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '16px' }}>
                    <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="fw-bold mb-1" style={{ color: '#2c3e50' }}>Total Doctors</h5>
                                <h3 className="mb-0" style={{ color: '#48b575' }}>{doctors.length}</h3>
                            </div>
                            
                            <div style={{ width: '400px' }}>
                                <InputGroup>
                                    <InputGroup.Text style={{ backgroundColor: '#ffffff', border: '1px solid #e9ecef' }}>
                                        🔍
                                    </InputGroup.Text>
                                    <Form.Control
                                        placeholder="Search by name, email, speciality, or location..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    {search && (
                                        <Button 
                                            variant="outline-secondary"
                                            onClick={() => setSearch('')}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </InputGroup>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* Doctors Table */}
                <Card className="shadow-sm border-0" style={{ borderRadius: '16px' }}>
                    <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                        <h5 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>Doctors List</h5>
                        <small className="text-muted">
                            {filteredDoctors.length} of {doctors.length} doctors shown
                        </small>
                    </Card.Header>
                    
                    <Card.Body className="p-4">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border" style={{ color: '#48b575' }}></div>
                                <p className="mt-3 text-muted">Loading doctors...</p>
                            </div>
                        ) : filteredDoctors.length === 0 ? (
                            <div className="text-center py-5">
                                <p className="mt-3 text-muted">No doctors found matching "{search}"</p>
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={() => setSearch('')}
                                >
                                    Clear Search
                                </Button>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table hover className="align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>S.No.</th>
                                            <th>Doctor Name</th>
                                            <th>Email</th>
                                            <th>Speciality</th>
                                            <th>Location</th>
                                            <th>Experience</th>
                                            <th>Fee</th>
                                            <th>Availability</th>
                                           
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDoctors.map(doctor => (
                                            <tr key={doctor.doctorId}>
                                                <td>
                                                    <div className="fw-semibold">{doctor.doctorId}</div>
                                                </td>
                                                <td>
                                                    <div className="fw-semibold">{doctor.doctorName}</div>
                                                </td>
                                                <td>
                                                    <div className="text-muted">{doctor.email}</div>
                                                </td>
                                                <td>
                                                    <Badge bg="info" className="fw-normal">
                                                        {doctor.speciality}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Badge bg="secondary" className="fw-normal">
                                                        {doctor.location}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <small className="fw-bold">{doctor.experience} years</small>
                                                </td>
                                                <td>
                                                    <small className="fw-bold">₹{doctor.fees}</small>
                                                </td>
                                                <td>
                                                    <small className="text-muted">
                                                        {formatTime(doctor.startTime)} - {formatTime(doctor.endTime)}
                                                    </small>
                                                </td>
                                               
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};

export default DoctorList;