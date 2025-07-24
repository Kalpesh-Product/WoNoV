import React, { useState } from "react";
import {
  Avatar,
  Chip,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PERMISSIONS } from "../../constants/permissions";
import Abrar from "../../assets/abrar.jpeg";

const AccessProfile = () => {
  const location = useLocation();
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { user } = location.state || {};

  const fetchUserPermissions = async () => {
    if (!user?._id) return null;
    const response = await axios.get(
      `/api/access/user-permissions/${user._id}`
    );
    return response.data;
  };

  const {
    data: accessProfile,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["userPermissions", user?._id],
    queryFn: fetchUserPermissions,
    enabled: !!user?._id,
  });

  const handlePermissionUpdate = async (permission, isChecked) => {
    const currentPermissions = new Set(accessProfile?.permissions || []);

    if (isChecked) {
      currentPermissions.add(permission);
    } else {
      currentPermissions.delete(permission);
    }

    const updatedPermissions = Array.from(currentPermissions);

    try {
      await axios.put(`/api/access/grant-permissions/${user._id}`, {
        permissions: updatedPermissions,
      });
      queryClient.invalidateQueries(["userPermissions", user?._id]); // refetch updated data
    } catch (error) {
      console.error("Failed to update permissions", error);
    }
  };

  const groupPermissionsByModule = (permissionsObj) => {
    const grouped = {};

    Object.entries(permissionsObj).forEach(([key, value]) => {
      const [module, ...rest] = key.split("_"); // e.g. ASSETS_VIEW_ASSETS
      const action = value; // e.g. view_assets

      if (!grouped[module]) grouped[module] = [];

      grouped[module].push({
  key,
  action,
  label: value
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join("_"), // turns 'view_assets' into 'View_Assets'
});

    });

    return grouped;
  };

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
        <p className="text-lg font-semibold text-red-500">
          Failed to load permissions.
        </p>
      </div>
    );
  }

  const groupedPermissions = groupPermissionsByModule(PERMISSIONS);
  const userPermissionSet = new Set(accessProfile?.permissions || []);

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
              src={user.email === "abrar@biznest.co.in" ? Abrar : undefined}
            >
              {user.email !== "abrar@biznest.co.in" && user.name.charAt(0)}
            </Avatar>
          </div>
          <div className="flex flex-col gap-6">
            <span className="text-title flex items-center gap-3">
              {user.name}{" "}
              <Chip
                label={user.status ? "Active" : "InActive"}
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
          <div className="flex flex-col gap-4 w-full text-gray-600">
            {[
              { label: "User Name", value: user.name },
              { label: "Email", value: user.email },
              { label: "Designation", value: user.designation },
              { label: "Work Location", value: user.workLocation },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-40 capitalize">{item.label}</div>
                <div className="w-2">:</div>
                <div className="text-gray-500 flex-1">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Permissions Table */}
      <div className="mt-6">
        <h2 className="text-title font-pmedium mb-4">User Permissions</h2>
        <div className="flex flex-col gap-8">
          {Object.entries(groupedPermissions).map(([module, permissions]) => (
            <div key={module}>
              <h3 className="text-lg font-semibold mb-2">{module}</h3>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Module Action</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Read</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Write</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {permissions.map(({ key, label, action }) => {
                      const isRead = action.includes("view");
                      const isWrite =
                        action.includes("manage") || action.includes("delete");

                      return (
                        <TableRow key={key}>
                          <TableCell>{label}</TableCell>
                          <TableCell align="center">
                            <Checkbox
                              checked={userPermissionSet.has(key)}
                              disabled={!isRead}
                              onChange={(e) =>
                                handlePermissionUpdate(key, e.target.checked)
                              }
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Checkbox
                              checked={userPermissionSet.has(key)}
                              disabled={!isWrite}
                              onChange={(e) =>
                                handlePermissionUpdate(key, e.target.checked)
                              }
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccessProfile;
