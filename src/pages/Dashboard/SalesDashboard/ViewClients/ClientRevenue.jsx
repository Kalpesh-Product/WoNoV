import React from "react";
import { useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import { Chip } from "@mui/material";

const ClientRevenue = () => {
  const navigate = useNavigate();

  const viewEmployeeColumns = [
    { field: "srno", headerName: "SR No" },
    {
      field: "employeeName",
      headerName: "Month",
      cellRenderer: (params) => (
        <span
          style={{
            color: "#1E3D73",
            textDecoration: "underline",
            cursor: "pointer",
          }}
          onClick={() =>
            navigate(
              `/app/dashboard/HR-dashboard/employee/view-employees/${params.data.employmentID}`
            )
          }>
          {params.value}
        </span>
      ),
    },
    { field: "employmentID", headerName: "Paid Amount" },
    { field: "email", headerName: "Due Amount", flex: 1 },
    { field: "role", headerName: "Total Amount", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        const statusColorMap = {
          Paid: { backgroundColor: "#90EE90", color: "#006400" },
          Unpaid: { backgroundColor: "#D3D3D3", color: "#696969" },
        };

        const { backgroundColor, color } = statusColorMap[params.value] || {
          backgroundColor: "gray",
          color: "white",
        };
        return (
          <Chip
            label={params.value}
            style={{
              backgroundColor,
              color,
            }}
          />
        );
      },
    },
  ];

  const rows = [
    {
      srno: "1",
      employeeName: "January 2025",
      employmentID: "5000",
      email: "2000",
      role: "7000",
      status: "Paid",
    },
    {
      srno: "2",
      employeeName: "December 2024",
      employmentID: "5000",
      email: "2000",
      role: "7000",
      status: "Paid",
    },
    {
      srno: "3",
      employeeName: "November 2024",
      employmentID: "5000",
      email: "2000",
      role: "7000",
      status: "Paid",
    },
    {
      srno: "4",
      employeeName: "October 2024",
      employmentID: "5000",
      email: "2000",
      role: "7000",
      status: "Paid",
    },
    {
      srno: "5",
      employeeName: "September 2024",
      employmentID: "5000",
      email: "2000",
      role: "7000",
      status: "Paid",
    },
    // {
    //   srno: "6",
    //   employeeName: "Kalpesh",
    //   employmentID: "WO006",
    //   email: "kalpesh.wono@gmail.com",
    //   role: "Employee",
    //   status: "Paid",
    // },
    // {
    //   srno: "7",
    //   employeeName: "Allan2",
    //   employmentID: "WO007",
    //   email: "allan2.wono@gmail.com",
    //   role: "Employee",
    //   status: "Unpaid",
    // },
  ];

  return (
    <div>
      <div className="w-full">
        <AgTable
          search={true}
          searchColumn="Email"
          data={rows}
          columns={viewEmployeeColumns}
        />
      </div>
    </div>
  );
};

export default ClientRevenue;
