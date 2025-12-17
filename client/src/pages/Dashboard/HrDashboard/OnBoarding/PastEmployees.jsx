import { useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import { Chip } from "@mui/material";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setSelectedEmployee } from "../../../../redux/slices/hrSlice";
import PageFrame from "../../../../components/Pages/PageFrame";

export default function PastEmployees() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const axios = useAxiosPrivate();
  const { data: employees, isLoading } = useQuery({
    queryKey: ["past-employees"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/users/fetch-users");
        const filteredData = response.data.filter(
          (employee) => employee.isActive === false
        );
        return filteredData;
      } catch (error) {
        throw new Error(
          error.response?.data?.message || "Failed to fetch employees"
        );
      }
    },
  });

  const viewEmployeeColumns = [
    { field: "srno", headerName: "SR No", width: 100 },
    { field: "employmentID", headerName: "Employment ID" },
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
              `/app/dashboard/HR-dashboard/employee/employee-list/${params.data.employeeName}/edit-details`
            );
            dispatch(setSelectedEmployee(params.data.employmentID));
          }}
        >
          {params.value}
        </span>
      ),
    },
    { field: "department", headerName: "Department", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "role", headerName: "Role", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        const statusText = params.value ? "Active" : "In Active";
        const statusColorMap = {
          Active: { backgroundColor: "#90EE90", color: "#006400" }, 
          "In Active": { backgroundColor: "#F8D7DA", color: "#721C24" }, 
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
      <PageFrame>
        <div className="w-full">
          <AgTable
            search={true}
            tableTitle={"Past Employees List"}
            data={
              isLoading
                ? []
                : [
                    ...employees.map((employee, index) => ({
                      id: employee._id,
                      srno: index + 1,
                      employeeName: `${
                        employee.firstName ? employee.firstName : ""
                      } ${employee.lastName ? employee.lastName : ""}`,
                      employmentID: employee.empId,
                      email: employee.email || "N/A",
                      department: employee.departments?.map(
                        (item) => item.name 
                      ) || "N/A",
                      role: employee.role?.map((r) => r.roleTitle) || "N/A",
                      status: employee.isActive,
                    })),
                  ]
            }
            columns={viewEmployeeColumns}
          />
        </div>
      </PageFrame>
    </div>
  );
}
