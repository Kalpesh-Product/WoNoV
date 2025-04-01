import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import { Chip } from "@mui/material";

const ClientMembers = () => {
  const navigate = useNavigate();

  const viewEmployeeColumns = [
    { field: "srno", headerName: "SR No" },
    {
      field: "employeeName",
      headerName: "Member Name",
      cellRenderer: (params) => (
        <span
          style={{
            color: "#1E3D73",
            textDecoration: "underline",
            cursor: "pointer",
          }}
          onClick={() =>
            navigate(
              `/app/dashboard/sales-dashboard/clients/view-clients/${params.data.clientID}/members/view-member/${params.data.memberID}`
            )
          }>
          {params.value}
        </span>
      ),
    },
    { field: "clientID", headerName: "Client ID" },
    { field: "memberID", headerName: "Member ID" },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "role", headerName: "Role", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        const statusColorMap = {
          Active: { backgroundColor: "#90EE90", color: "#006400" },
          Inactive: { backgroundColor: "#D3D3D3", color: "#696969" },
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
      employeeName: "Aiwinraj",
      clientID: "CO001",
      memberID: "MO001",
      email: "aiwinraj.wono@gmail.com",
      role: "Employee",
      status: "Active",
    },
    {
      srno: "2",
      employeeName: "Allan",
      clientID: "CO002",
      memberID: "MO002",
      email: "allan.wono@gmail.com",
      role: "Employee",
      status: "Active",
    },
    {
      srno: "3",
      employeeName: "Sankalp",
      clientID: "CO003",
      memberID: "MO003",
      email: "sankalp.wono@gmail.com",
      role: "Employee",
      status: "Active",
    },
    {
      srno: "4",
      employeeName: "Anushri",
      clientID: "CO004",
      memberID: "MO004",
      email: "anushri.wono@gmail.com",
      role: "Employee",
      status: "Active",
    },
    {
      srno: "5",
      employeeName: "Muskan",
      clientID: "CO005",
      memberID: "MO005",
      email: "muskan.wono@gmail.com",
      role: "Employee",
      status: "Active",
    },
    {
      srno: "6",
      employeeName: "Kalpesh",
      clientID: "CO006",
      memberID: "MO006",
      email: "kalpesh.wono@gmail.com",
      role: "Employee",
      status: "Active",
    },
    {
      srno: "7",
      employeeName: "Allan2",
      clientID: "CO007",
      memberID: "MO007",
      email: "allan2.wono@gmail.com",
      role: "Employee",
      status: "InActive",
    },
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
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default ClientMembers;
