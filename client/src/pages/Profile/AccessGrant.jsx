import React, { useState } from "react";
import { Avatar, Chip } from "@mui/material";
import PermissionsTable from "../../components/PermissionsTable";
import useAuth from "../../hooks/useAuth";
import { toast } from "sonner";
import Abrar from "../../assets/abrar.jpeg";
import PageFrame from "../../components/Pages/PageFrame";

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
      departmentId: "sales",
      departmentName: "Sales",
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
    {
      departmentId: "admin",
      departmentName: "Admin",
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
    {
      departmentId: "maintenance",
      departmentName: "Maintenance",
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
    {
      departmentId: "it",
      departmentName: "IT",
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
    {
      departmentId: "cafe",
      departmentName: "Cafe",
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
  const appsSection = [
    {
      departmentId: "tickets",
      departmentName: "Tickets",
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
    {
      departmentId: "meetings",
      departmentName: "Meetings",
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
    {
      departmentId: "tasks",
      departmentName: "Tasks",
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
    {
      departmentId: "performance",
      departmentName: "Performance",
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
    {
      departmentId: "visitors",
      departmentName: "Visitors",
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
  const generalSection = [
    {
      departmentId: "calendar",
      departmentName: "Calendar",
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
    {
      departmentId: "access",
      departmentName: "Access",
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
    {
      departmentId: "profile",
      departmentName: "Profile",
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
    //asdasd
  };

  const handleSavePermissions = () => {
    toast.success("Permissions saved successfully");
    // You can also trigger your API call here
  };

  return (
    <PageFrame>
      <div className="bg-white">
        <div className="flex items-center justify-between pb-4">
          <span className="text-title font-pmedium text-primary uppercase">
            My permissions
          </span>
        </div>
        <hr />
        {/* User Info */}
        <div className="flex items-center gap-8 w-full  p-4 rounded-md">
          <div className="flex gap-6 items-center">
            <div className="w-40 h-40">
              <Avatar
                style={{
                  backgroundColor: user.avatarColor,
                  width: "100%",
                  height: "100%",
                  fontSize: "5rem",
                }}
                // src={user.email === "abrar@biznest.co.in" ? Abrar : undefined}>
              >
                {auth?.user?.profilePicture?.url ? (
                  // <img src={Abrar} alt="" />
                  <img src={auth?.user?.profilePicture?.url} alt="" />
                ) : (
                  auth.user.firstName.charAt(0)
                )}
              </Avatar>
            </div>
            <div className="w-96 flex flex-col gap-6">
              <span className="text-title flex items-center gap-3">
                {user.name}{" "}
                {/* <Chip
                label={user.status ? "Active" : "Inactive"}
                sx={{
                  backgroundColor: user.status ? "green" : "grey",
                  color: "white",
                }}
              /> */}
              </span>
              <span className="text-subtitle">{user.designation}</span>
            </div>
          </div>
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex gap-2">
              <div className="flex flex-col gap-4 text-gray-600">
                <span className="capitalize">Email : </span>
                <span className="capitalize">Phone: </span>
                <span className="capitalize">Department : </span>
                <span className="capitalize">Work Location : </span>
              </div>
              <div className="flex flex-col gap-4 text-gray-500">
                <span>{user.email}</span>
                <span>{auth.user.phone}</span>
                <span>{auth.user.departments.map((item) => item.name)[0]}</span>
                <span>{user.workLocation}</span>
              </div>
            </div>
          </div>
          <div className="h-40  flex flex-col justify-start items-start  ">
            <div className="">
              <Chip
                label={user.status ? "Active" : "Inactive"}
                sx={{
                  backgroundColor: user.status ? "green" : "grey",
                  color: "white",
                }}
              />
            </div>
          </div>
        </div>
        <hr />
        {/* Department Cards */}
        <div className="mt-6">
          <h2 className="text-title font-pmedium">Grant Access To</h2>
          <br />
          <br />
          <div className="font-bold">Department Modules</div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {departments.map((department) => (
              <div
                key={department.departmentId}
                className={`cursor-not-allowed rounded-md shadow-md transition-all duration-200 p-4 ${
                  selectedDepartment?.departmentId === department.departmentId
                    ? "border-default border-primary"
                    : ""
                }`}
                // onClick={() => setSelectedDepartment(department)}
              >
                <span className="text-subtitle">
                  {department.departmentName}
                </span>
              </div>
            ))}
          </div>
          <br />
          <br />
          <div className="font-bold">Apps</div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {appsSection.map((department) => (
              <div
                key={department.departmentId}
                className={`cursor-not-allowed rounded-md shadow-md transition-all duration-200 p-4 ${
                  selectedDepartment?.departmentId === department.departmentId
                    ? "border-default border-primary"
                    : ""
                }`}
                // onClick={() => setSelectedDepartment(department)}
              >
                <span className="text-subtitle">
                  {department.departmentName}
                </span>
              </div>
            ))}
          </div>
          <br />
          <br />
          <div className="font-bold">General</div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {generalSection.map((department) => (
              <div
                key={department.departmentId}
                className={`cursor-not-allowed rounded-md shadow-md transition-all duration-200 p-4 ${
                  selectedDepartment?.departmentId === department.departmentId
                    ? "border-default border-primary"
                    : ""
                }`}
                // onClick={() => setSelectedDepartment(department)}
              >
                <span className="text-subtitle">
                  {department.departmentName}
                </span>
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
    </PageFrame>
  );
};

export default AccessGrant;
