import React from "react";
import { useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import { Chip } from "@mui/material";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";

const ViewEmployees = () => {
  const navigate = useNavigate();

  const axios = useAxiosPrivate();
  const { data: employees, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/users/fetch-users");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const viewEmployeeColumns = [
    { field: "srno", headerName: "SR No" },
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
          onClick={() => {
            localStorage.setItem("employeeName", params.data.employeeName);
            navigate(
              `/app/dashboard/HR-dashboard/employee/view-employees/${params.data.employmentID}`
            );
          }}>
          {params.value}
        </span>
      ),
    },
    { field: "employmentID", headerName: "Employment ID" },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "role", headerName: "Role", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        const statusText = params.value ? "Active" : "InActive";
        const statusColorMap = {
          Active: { backgroundColor: "#90EE90", color: "#006400" },
          InActive: { backgroundColor: "#D3D3D3", color: "#696969" },
        };

        const { backgroundColor, color } = statusColorMap[statusText] || {
          backgroundColor: "gray",
          color: "white",
        };
        return (
          <Chip
            label={statusText}
            style={{
              backgroundColor,
              color,
            }}
          />
        );
      },
    },
  ];

  return (
    <div>
      <div className="w-full">
        <AgTable
          search={true}
          searchColumn="Email"
          data={
            isLoading
              ? []
              : [
                  ...employees.map((employee, index) => ({
                    id: employee._id,
                    srno: index + 1,
                    employeeName: employee.firstName,
                    employmentID: employee.empId,
                    email: employee.email,
                    role: employee.role.map((r) => r.roleTitle),
                    status: employee.isActive,
                  })),
                ]
          }
          columns={viewEmployeeColumns}
        />
      </div>
    </div>
  );
};

export default ViewEmployees;
