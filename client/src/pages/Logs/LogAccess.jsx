import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import MuiAccordion from "../../components/MuiAccordion";
import PageFrame from "../../components/Pages/PageFrame";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import {
  setSelectedEmployee,
  setSelectedEmployeeMongoId,
} from "../../redux/slices/hrSlice";
import isEmployeeRoleUser from "../../utils/employeeRole";

const LogAccess = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { auth } = useAuth();

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["access-departments"],
    queryFn: async () => {
      const response = await axios.get("/api/access/department-wise-employees");
      return response.data?.data || [];
    },
  });

  const currentUserIsEmployee = isEmployeeRoleUser(auth?.user);
  const visibleDepartments = currentUserIsEmployee
    ? departments
        .map((department) => ({
          ...department,
          employees: (department.employees || []).filter(
            (employee) => String(employee?._id) === String(auth?.user?._id),
          ),
        }))
        .filter((department) => department.employees.length > 0)
    : departments;

  const handleEmployeeClick = (employee) => {
    const userData = {
      _id: employee?._id,
      name: `${employee?.firstName || ""} ${employee?.lastName || ""}`.trim(),
      designation: employee?.role?.map((item) => item.roleTitle),
      email: employee?.email || "",
      workLocation: employee?.workLocation || "",
      profilePicture: employee?.profilePicture?.url || "",
      status: employee?.isActive ? "Active" : "Inactive",
    };

    dispatch(setSelectedEmployee(userData));
    dispatch(setSelectedEmployeeMongoId(employee?._id || null));
    navigate("permissions", { state: { user: userData } });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <PageFrame>
        {isLoading ? (
          <div className="p-4 text-content">Loading departments...</div>
        ) : (
          <MuiAccordion
            data={visibleDepartments}
            titleKey="name"
            itemsKey="employees"
            itemClick={handleEmployeeClick}
            disabledKey="isActive"
            showEmployeeArrowGate={false}
          />
        )}
      </PageFrame>
    </div>
  );
};

export default LogAccess;
