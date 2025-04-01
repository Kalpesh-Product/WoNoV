import React, { useState } from "react";
import { Avatar, Chip, Card, CardContent, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import PermissionsTable from "../../components/PermissionsTable"; // Import the table

const AccessProfile = () => {
  const location = useLocation();
  const axios = useAxiosPrivate();
  const { user } = location.state || {}; // Retrieve user object from state
  const [selectedDepartment, setSelectedDepartment] = useState(null); // Track selected department

  const handlePermissionUpdate = (updatedPermissions) => {
    console.log("Updated Permissions:", updatedPermissions);
    // You can send this to an API to update permissions in the backend
  };

  const fetchUserPermissions = async () => {
    if (!user?._id) return null;
    try {
      const response = await axios.get(`/api/access/user-permissions/${user._id}`);
      return response.data;
    } catch (error) {
      throw new Error(error);
    }
  };

  const { data: accessProfile, isPending, isError } = useQuery({
    queryKey: ["userPermissions", user?._id], // Unique query key for caching
    queryFn: fetchUserPermissions,
    enabled: !!user?._id, // Only run query when user._id is available
  });

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">Loading user permissions...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-red-500">Failed to load permissions.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4">
      {/* User Details */}
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
            >
              {user.name.charAt(0)}
            </Avatar>
          </div>
          <div className="flex flex-col gap-6">
            <span className="text-title flex items-center gap-3">
              {user.name}{" "}
              <Chip
                label={user.status ? 'Active' : 'InActive'}
                sx={{
                  backgroundColor: user.status  ? "green" : "grey",
                  color: "white",
                }}
              />
            </span>
            <span className="text-subtitle">{user.designation}</span>
          </div>
        </div>
        <div className="flex flex-col gap-4 flex-1">
          <div className="flex justify-between">
            <div className="flex flex-col gap-4 justify-start flex-1 text-gray-600">
              <span className="capitalize">User Name</span>
              <span className="capitalize">Email</span>
              <span className="capitalize">Designation</span>
              <span className="capitalize">Work Location</span>
            </div>
            <div className="flex flex-col gap-4 justify-start flex-1 text-gray-500">
              <span>{user.name}</span>
              <span>{user.email}</span>
              <span>{user.designation}</span>
              <span>{user.workLocation}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions UI */}
      <div className="mt-6">
        <h2 className="text-title font-pmedium">User Permissions</h2>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {accessProfile.map((department) => (
            <div
              key={department.departmentId}
              className={`cursor-pointer rounded-md shadow-md ${
                selectedDepartment?.departmentId === department.departmentId ? "border-default border-primary" : ""
              }`}
              onClick={() =>
                setSelectedDepartment((prev) =>
                  prev?.departmentId === department.departmentId ? prev : department
                )
              }
            >
              <div className="p-4">
                <span className="text-subtitle">{department.departmentName}</span>
              </div>
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
              key={selectedDepartment.departmentId} // ✅ Forces re-render when department changes
              modules={selectedDepartment.modules}
              onPermissionChange={handlePermissionUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessProfile;
