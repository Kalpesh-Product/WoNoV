import React from "react";

const PayslipTemplate = ({ data }) => {
  const {
    name = "Abrar Shaikh",
    empId = "E0001",
    designation = "Master-Admin",
    departmentName = "Top Management",
    month = "December 2024",
    totalSalary = 70000,
    netPay = 15000,
    otherAllowances = 10000,
    deductions = 5000,
  } = data || {};

  return (
    <div
      style={{
        maxWidth: "900px", // Just a reasonable printable width
        margin: "0 auto",
        padding: "0px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "white",
        color: "#000",
        fontSize: "14px",
      }}
    >
      <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "24px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "24px" }}>Pay Slip</h2>

        {/* Header Section */}
        <div style={{ borderTop: "1px solid #ccc", borderBottom: "1px solid #ccc", padding: "16px 0", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
            <div><strong>Employee Name:</strong> {name}</div>
            <div><strong>Employee ID:</strong> {empId}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
            <div><strong>Designation:</strong> {designation || "N/A"}</div>
            <div><strong>Department:</strong> {departmentName || "N/A"}</div>
          </div>
          <div><strong>Month:</strong> {new Date(month).toLocaleString("default", { month: "long", year: "numeric" })}</div>
        </div>

        {/* Earnings */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ backgroundColor: "#f0f0f0", padding: "8px" }}>
            <strong>Earnings</strong>
          </div>
          <div style={{ padding: "16px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span>Basic Pay</span>
              <span>₹{totalSalary.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
              <span>Total Earnings</span>
              <span>₹{totalSalary.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ backgroundColor: "#f0f0f0", padding: "8px" }}>
            <strong>Deductions</strong>
          </div>
          <div style={{ padding: "16px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span>Tax and Other Deductions</span>
              <span>₹{deductions.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
              <span>Total Deductions</span>
              <span>₹{deductions.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Net Pay */}
        <div style={{ textAlign: "right", fontWeight: "bold", fontSize: "1.1rem", marginBottom: "24px" }}>
          Net Pay: ₹{netPay.toLocaleString()}
        </div>

        <p style={{ fontSize: "0.8rem", color: "#555", textAlign: "center" }}>
          *This is a computer-generated payslip and does not require a signature.
        </p>
      </div>
    </div>
  );
};

export default PayslipTemplate;
