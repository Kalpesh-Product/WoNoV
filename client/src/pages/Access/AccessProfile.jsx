import React, { useEffect, useState } from "react";
import {
  Avatar,
  Chip,
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
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { PERMISSIONS } from "../../constants/permissions";
import Abrar from "../../assets/abrar.jpeg";
import PrimaryButton from "../../components/PrimaryButton";
import { toast } from "sonner";

const AccessProfile = () => {
  const location = useLocation();
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const { user } = location.state || {};

  const { register, setValue, handleSubmit, watch } = useForm({
    defaultValues: { permissions: [] },
  });

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

  const mutation = useMutation({
    mutationFn: async (data) => {
      console.log("data ", data);
      const response = await axios.post(
        `/api/access/modify-permissions/${user._id}`,
        {
          permissions: data.permissions,
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["userPermissions", user?._id],
      });
      toast.success(data.message || "UPDATED");
      setEditing(false);
      window.location.reload(); // ✅ refresh the page
    },

    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  useEffect(() => {
    if (accessProfile?.permissions) {
      setValue("permissions", accessProfile.permissions);
    }
  }, [accessProfile, setValue]);

  const groupPermissionsByModule = (permissionsObj) => {
    const grouped = {};
    Object.entries(permissionsObj).forEach(([key, { value, type }]) => {
      const [module] = key.split("_");

      if (!grouped[module]) grouped[module] = [];

      grouped[module].push({
        key,
        action: value,
        type,
        label: value
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join("_"),
      });
    });
    return grouped;
  };

  const groupedPermissions = groupPermissionsByModule(PERMISSIONS);
  const userPermissionSet = new Set(accessProfile?.permissions || []);
  const formPermissions = new Set(watch("permissions") || []);

  const togglePermission = (permission) => {
    const current = new Set(watch("permissions") || []);
    if (current.has(permission)) {
      current.delete(permission);
    } else {
      current.add(permission);
    }
    setValue("permissions", Array.from(current));
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
              {user.name}
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
        <div className="flex gap-4 w-full justify-end items-center">
          <PrimaryButton
            title={!editing ? "Edit" : "Cancel"}
            handleSubmit={() => setEditing((prev) => !prev)}
          />
          {editing && (
            <PrimaryButton
              title="Update"
              isLoading={mutation.isPending}
              disabled={mutation.isPending}
              handleSubmit={handleSubmit((data) =>
                mutation.mutate({ permissions: data.permissions })
              )}
            />
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(groupedPermissions).map(([module, permissions]) => (
            <div key={module}>
              <div className="flex justify-between items-center w-full">
                <h3 className="text-lg font-semibold mb-2">{module}</h3>
              </div>
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
                    {permissions.map(({ key, label, action, type }) => {
                      const checked = editing
                        ? formPermissions.has(action)
                        : userPermissionSet.has(action);

                      return (
                        <TableRow key={key}>
                          <TableCell>{label}</TableCell>

                          {/* Read Column */}
                          <TableCell align="center">
                            {type === "read" && (
                              <Checkbox
                                checked={checked}
                                disabled={!editing}
                                onChange={() =>
                                  editing && togglePermission(action)
                                }
                              />
                            )}
                          </TableCell>

                          {/* Write Column */}
                          <TableCell align="center">
                            {type === "write" && (
                              <Checkbox
                                checked={checked}
                                disabled={!editing}
                                onChange={() =>
                                  editing && togglePermission(action)
                                }
                              />
                            )}
                          </TableCell>

                          {/* Custom Column */}
                          {/* <TableCell align="center">
                            {type === "custom" && (
                              <Checkbox
                                checked={checked}
                                disabled={!editing}
                                onChange={() =>
                                  editing && togglePermission(action)
                                }
                              />
                            )}
                          </TableCell> */}
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
