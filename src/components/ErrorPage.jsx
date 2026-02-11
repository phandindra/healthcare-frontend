import React from "react";
import { Link } from "react-router-dom";
import { Container, Button, Row, Col } from "react-bootstrap";

const ErrorPage = () => {
  return (
    <div className="min-vh-100 bg-light d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6} className="text-center">
            <div className="mb-4">
              <h1 className="display-1 fw-bold text-primary mb-3">404</h1>
              <h2 className="h3 mb-3">Page Not Found</h2>
              <p className="text-muted mb-4">
                Oops! The page you're looking for doesn't exist or has been
                moved.
              </p>
            </div>

            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
              <Button
                variant="primary"
                as={Link}
                to="/"
                className="px-4 py-2"
                style={{ backgroundColor: "#48b575", borderColor: "#48b575" }}
              >
                Go to Home
              </Button>

              <Button
                variant="outline-secondary"
                as={Link}
                to="/login"
                className="px-4 py-2"
              >
                Go to Login
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ErrorPage;
