// components/PayslipTemplate.jsx
import React from "react";

const PayslipTemplate = ({ data }) => {
  const { name, userId, department, month, totalSalary, deductions, netPay } = data;

  const cellStyle = {
    padding: "8px",
    border: "1px solid #ccc",
    textAlign: "left",
  };

  return (
    <div style={{ padding: "24px", border: "1px solid #ccc", width: "600px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Monthly Payslip</h2>
      <div style={{ marginBottom: "16px" }}>
        <strong>Employee Name:</strong> {name} <br />
        <strong>Employee ID:</strong> {userId} <br />
        <strong>Department:</strong> {department || "N/A"} <br />
        <strong>Month:</strong> {month}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={cellStyle}>Component</th>
            <th style={cellStyle}>Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={cellStyle}>Total Salary</td>
            <td style={cellStyle}>₹ {totalSalary}</td>
          </tr>
          <tr>
            <td style={cellStyle}>Deductions</td>
            <td style={cellStyle}>₹ {deductions}</td>
          </tr>
          <tr style={{ fontWeight: "bold" }}>
            <td style={cellStyle}>Net Pay</td>
            <td style={cellStyle}>₹ {netPay}</td>
          </tr>
        </tbody>
      </table>

      <p style={{ textAlign: "center", fontSize: "0.9rem", color: "#888" }}>
        This is a computer-generated payslip and does not require a signature.
      </p>
    </div>
  );
};

export default PayslipTemplate;
