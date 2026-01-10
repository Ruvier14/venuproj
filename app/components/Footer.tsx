import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer
      style={{
        backgroundColor: "#f5f5f5",
        padding: "60px 80px 40px 80px",
        marginTop: "80px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "40px",
          marginBottom: "40px",
        }}
      >
        {/* Support Column */}
        <div>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#222",
              marginBottom: "20px",
            }}
          >
            Support
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: "12px" }}>
              <a
                href="/help-center"
                style={{
                  fontSize: "14px",
                  color: "#666",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                Help center
              </a>
            </li>
            <li style={{ marginBottom: "12px" }}>
              <a
                href="#"
                style={{
                  fontSize: "14px",
                  color: "#666",
                  textDecoration: "none",
                }}
              >
                FAQs
              </a>
            </li>
            <li style={{ marginBottom: "12px" }}>
              <a
                href="#"
                style={{
                  fontSize: "14px",
                  color: "#666",
                  textDecoration: "none",
                }}
              >
                Report
              </a>
            </li>
            <li style={{ marginBottom: "12px" }}>
              <a
                href="#"
                style={{
                  fontSize: "14px",
                  color: "#666",
                  textDecoration: "none",
                }}
              >
                Service Guarantee
              </a>
            </li>
            <li style={{ marginBottom: "12px" }}>
              <a
                href="#"
                style={{
                  fontSize: "14px",
                  color: "#666",
                  textDecoration: "underline",
                }}
              >
                Privacy Policy
              </a>
            </li>
            <li style={{ marginBottom: "12px" }}>
              <a
                href="#"
                style={{
                  fontSize: "14px",
                  color: "#666",
                  textDecoration: "underline",
                }}
              >
                Cookie Policy
              </a>
            </li>
            <li style={{ marginBottom: "12px" }}>
              <a
                href="#"
                style={{
                  fontSize: "14px",
                  color: "#666",
                  textDecoration: "none",
                }}
              >
                Terms & Conditions
              </a>
            </li>
          </ul>
        </div>
        {/* Contact Us Column */}
        <div>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#222",
              marginBottom: "20px",
            }}
          >
            Contact Us
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: "12px" }}>
              <a
                href="#"
                style={{
                  fontSize: "14px",
                  color: "#666",
                  textDecoration: "none",
                }}
              >
                Customer Support
              </a>
            </li>
            <li style={{ marginBottom: "12px" }}>
              <a
                href="#"
                style={{
                  fontSize: "14px",
                  color: "#666",
                  textDecoration: "none",
                }}
              >
                Service Guarantee
              </a>
            </li>
            <li style={{ marginBottom: "12px" }}>
              <a
                href="#"
                style={{
                  fontSize: "14px",
                  color: "#666",
                  textDecoration: "none",
                }}
              >
                More Service Info
              </a>
            </li>
          </ul>
        </div>
        {/* About Column */}
        <div>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#222",
              marginBottom: "20px",
            }}
          >
            About
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: "12px" }}>
              <a
                href="#"
                style={{
                  fontSize: "14px",
                  color: "#666",
                  textDecoration: "none",
                }}
              >
                About Venu
              </a>
            </li>
            <li style={{ marginBottom: "12px" }}>
              <a
                href="#"
                style={{
                  fontSize: "14px",
                  color: "#666",
                  textDecoration: "none",
                }}
              >
                Content Guidelines and Reporting
              </a>
            </li>
            <li style={{ marginBottom: "12px" }}>
              <a
                href="#"
                style={{
                  fontSize: "14px",
                  color: "#666",
                  textDecoration: "none",
                }}
              >
                Accessibility Statement
              </a>
            </li>
            <li style={{ marginBottom: "12px" }}>
              <a
                href="#"
                style={{
                  fontSize: "14px",
                  color: "#666",
                  textDecoration: "none",
                }}
              >
                About Venu Group
              </a>
            </li>
          </ul>
        </div>
        {/* Other Services Column */}
        <div>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#222",
              marginBottom: "20px",
            }}
          >
            Other Services
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: "12px" }}>
              <a
                href="#"
                style={{
                  fontSize: "14px",
                  color: "#666",
                  textDecoration: "none",
                }}
              >
                Security
              </a>
            </li>
          </ul>
        </div>
        {/* Payment Methods Column */}
        <div>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#222",
              marginBottom: "20px",
            }}
          >
            Payment Methods
          </h3>
          {/* Add payment method icons or info here if needed */}
        </div>
      </div>
      <div
        style={{
          backgroundColor: "#f5f5f5",
          padding: "20px 80px",
          textAlign: "center",
          borderTop: "1px solid #e6e6e6",
        }}
      >
        <p
          style={{
            color: "#666",
            fontSize: "14px",
            margin: 0,
          }}
        >
          &copy; {currentYear} Venu. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
