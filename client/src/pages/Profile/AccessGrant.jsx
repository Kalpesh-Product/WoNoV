import React, { useState } from "react";
import { Avatar, Chip } from "@mui/material";
import PermissionsTable from "../../components/PermissionsTable";
import useAuth from "../../hooks/useAuth";
import { toast } from "sonner";
import Abrar from "../../assets/abrar.jpeg"

const AccessGrant = () => {
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const { auth } = useAuth();

  const user = {
    name: `${auth?.user?.firstName} ${auth?.user?.lastName}`,
    email: auth?.user?.email,
    designation: auth?.user?.designation,
    status: true,
    avatarColor: "#1976d2",
    workLocation:
      auth?.user?.company?.workLocations?.[0]?.buildingName ??
      "Unknown Location",
  };

  const departments = [
    {
      departmentId: "hr",
      departmentName: "HR",
      modules: [
        {
          name: "Attendance",
          submodules: [
            {
              submoduleName: "Clock In / Clock Out",
              grantedActions: ["View", "Edit"],
            },
            {
              submoduleName: "My Timeclock",
              grantedActions: ["View"],
            },
            {
              submoduleName: "Correction Request",
              grantedActions: ["View"],
            },
            {
              submoduleName: "Approve Timeclock",
              grantedActions: ["View", "Edit"],
            },
          ],
        },
        {
          name: "Payroll",
          submodules: [
            {
              submoduleName: "Salary Processing",
              grantedActions: ["View"],
            },
            {
              submoduleName: "Generate Payslip",
              grantedActions: ["View"],
            },
          ],
        },
      ],
    },
    {
      departmentId: "finance",
      departmentName: "Finance",
      modules: [
        {
          name: "Budgets",
          submodules: [
            {
              submoduleName: "Manage Budgets",
              grantedActions: ["View", "Edit"],
            },
            {
              submoduleName: "View Expenses",
              grantedActions: ["View"],
            },
          ],
        },
      ],
    },
    {
      departmentId: "frontend",
      departmentName: "Frontend",
      modules: [
        {
          name: "UI",
          submodules: [
            {
              submoduleName: "UI Updates",
              grantedActions: ["View", "Edit"],
            },
            {
              submoduleName: "Frontend Testing",
              grantedActions: ["View"],
            },
          ],
        },
      ],
    },
  ];

  const handlePermissionUpdate = (updatedPermissions) => {
    console.log("Updated Permissions:", updatedPermissions);
  };

  const handleSavePermissions = () => {
    toast.success("Permissions saved successfully");
    // You can also trigger your API call here
  };


  return (
    <div className="bg-white p-4">
      {/* User Info */}
      <div className="flex items-center gap-8 w-full border-2 border-gray-200 p-4 rounded-md">
        <div className="flex gap-6 items-center">
          <div className="w-40 h-40">
            <Avatar
              style={{
                backgroundColor: user.avatarColor,
                width: "100%",
                height: "100%",
                fontSize: "5rem",
              }}
              src={user.email === "abrar@biznest.co.in" ? Abrar : undefined}
            >
              {user.email !== "abrar@biznest.co.in" && user.name?.charAt(0)}
            </Avatar>

          </div>
          <div className="flex flex-col gap-6">
            <span className="text-title flex items-center gap-3">
              {user.name}{" "}
              <Chip
                label={user.status ? "Active" : "Inactive"}
                sx={{
                  backgroundColor: user.status ? "green" : "grey",
                  color: "white",
                }}
              />
            </span>
            <span className="text-subtitle">{user.designation}</span>
          </div>
        </div>
        <div className="flex flex-col gap-4 flex-1">
          <div className="flex justify-between">
            <div className="flex flex-col gap-4 text-gray-600">
              <span className="capitalize">User Name</span>
              <span className="capitalize">Email</span>
              <span className="capitalize">Designation</span>
              <span className="capitalize">Work Location</span>
            </div>
            <div className="flex flex-col gap-4 text-gray-500">
              <span>{user.name}</span>
              <span>{user.email}</span>
              <span>{user.designation}</span>
              <span>{user.workLocation}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Department Cards */}
      <div className="mt-6">
        <h2 className="text-title font-pmedium">Grant Access To</h2>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {departments.map((department) => (
            <div
              key={department.departmentId}
              className={`cursor-not-allowed rounded-md shadow-md transition-all duration-200 p-4 ${selectedDepartment?.departmentId === department.departmentId
                  ? "border-default border-primary"
                  : ""
                }`}
              // onClick={() => setSelectedDepartment(department)}
            >
              <span className="text-subtitle">{department.departmentName}</span>
            </div>
          ))}
        </div>

        {/* Permissions Table */}
        {selectedDepartment && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold">
              {selectedDepartment.departmentName} Permissions
            </h3>
            <PermissionsTable
              key={selectedDepartment.departmentId}
              modules={selectedDepartment.modules}
              onPermissionChange={handlePermissionUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessGrant;
