import AccessTree from "../../components/AccessTree";
import hierarchy from "../../assets/hierarchy-new.png"; // Import your image file
import PageFrame from "../../components/Pages/PageFrame";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import {
  setSelectedEmployee,
  setSelectedEmployeeMongoId,
} from "../../redux/slices/hrSlice";
import AgTable from "../../components/AgTable";
import { useNavigate } from "react-router-dom";
import StatusChip from "../../components/StatusChip";

const Access = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: employees, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/users/fetch-users");
        const filteredData = response.data.filter(
          (employee) => employee.isActive
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
            dispatch(setSelectedEmployeeMongoId(params.data.id));
          }}>
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
        const status = params.value ? "Active" : "InActive";
        return <StatusChip status={status} />;
      },
    },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div>
        <AccessTree clickState={true} autoExpandFirst />
      </div>
      {/* <PageFrame>
        <div className="h-[35rem]  overflow-hidden">
          <img
            src={hierarchy}
            alt="hierarchy"
            className="h-full w-full object-contain"
          />
        </div>
      </PageFrame>
      <PageFrame>
        <div className="w-full">
          <AgTable
            search={true}
            tableTitle={"Employees List"}
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
                      email: employee.email,
                      department: employee.departments?.map(
                        (item) => item.name
                      ),
                      role: employee.role?.map((r) => r.roleTitle),
                      status: employee.isActive,
                    })),
                  ]
            }
            columns={viewEmployeeColumns}
          />
        </div>
      </PageFrame> */}
    </div>
  );
};

export default Access;
