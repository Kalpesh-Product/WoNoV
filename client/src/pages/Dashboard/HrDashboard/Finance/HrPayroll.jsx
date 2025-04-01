import React from "react";
import AgTable from "../../../../components/AgTable";
import { Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";

const HrPayroll = () => {
  const navigate = useNavigate()
  const payrollColumn = [
    { field: "payrollId", headerName: "Payroll ID" },
    {
      field: "employeeName",
      headerName: "Employee Name",
      cellRenderer: (params) => (
        <span
          style={{
            color: "#1E3D73",
            textDecoration: "underline",
            cursor: "pointer",
          }}
          onClick={() => navigate(`/app/dashboard/HR-dashboard/finance/payroll/view-payroll/${params.data.payrollId}`)}

        >
          {params.value}
        </span>
      ),
    },
    { field: "role", headerName: "Role" },
    { field: "date", headerName: "Date" },
    { field: "time", headerName: "Time" },
    { field: "totalSalary", headerName: "Total Salary" },
    { field: "reimbursment", headerName: "Total Salary" },
    {
        field: "status",
        headerName: "Status",
        cellRenderer: (params) => {
          const statusColorMap = {
            Completed: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
            "Pending": { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
          };
  
          const { backgroundColor, color } = statusColorMap[params.value] || {
            backgroundColor: "gray",
            color: "white",
          };
          return (
            <>
              <Chip
                label={params.value}
                style={{
                  backgroundColor,
                  color,
                }}
              />
            </>
          );
        },
      },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <>
          <div className="p-2 mb-2 flex gap-2">
          <span className="text-primary hover:underline text-content cursor-pointer">
              View Details
            </span>
          </div>
        </>
      ),
    },
  ];

  const rows = [
    {
      id: 1,
      payrollId: "PAY001",
      employeeName: "Aiwinraj",
      role: "Software Engineer",
      date: "2025-01-01",
      time: "10:00 AM",
      totalSalary: 85000,
      reimbursment: 5000,
      status: "Completed",
    },
    {
      id: 2,
      payrollId: "PAY002",
      employeeName: "Kalpesh Naik",
      role: "Project Manager",
      date: "2025-01-15",
      time: "11:00 AM",
      totalSalary: 105000,
      reimbursment: 8000,
      status: "Pending",
    },
    {
      id: 3,
      payrollId: "PAY003",
      employeeName: "Sankalp",
      role: "HR Manager",
      date: "2025-02-01",
      time: "09:30 AM",
      totalSalary: 90000,
      reimbursment: 7000,
      status: "Completed",
    },
    {
      id: 4,
      payrollId: "PAY004",
      employeeName: "Allan",
      role: "QA Analyst",
      date: "2025-02-15",
      time: "02:00 PM",
      totalSalary: 75000,
      reimbursment: 4500,
      status: "Pending",
    },
    {
      id: 5,
      payrollId: "PAY005",
      employeeName: "Anushri",
      role: "Business Analyst",
      date: "2025-03-01",
      time: "01:30 PM",
      totalSalary: 95000,
      reimbursment: 6000,
      status: "Completed",
    },
    {
      id: 6,
      payrollId: "PAY007",
      employeeName: "Muskan",
      role: "Business Analyst",
      date: "2025-03-01",
      time: "01:30 PM",
      totalSalary: 95000,
      reimbursment: 6000,
      status: "Completed",
    },
  ];
  

  return (
    <div className="flex flex-col gap-8">
      <div>
        <AgTable
          search={true}
          searchColumn={"Employee Name"}
          tableTitle={""}
          data={rows}
          columns={payrollColumn}
        />
      </div>
    </div>
  );
};

export default HrPayroll;
