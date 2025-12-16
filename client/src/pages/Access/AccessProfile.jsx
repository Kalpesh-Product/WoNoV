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
  Grid,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { PERMISSIONS } from "../../constants/permissions";
import Abrar from "../../assets/abrar.jpeg";
import PrimaryButton from "../../components/PrimaryButton";
import { toast } from "sonner";
import { setSelectedEmployeeMongoId } from "../../redux/slices/hrSlice";
import { useSelector } from "react-redux";

const AccessProfile = () => {
  const location = useLocation();
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  // const { user } = location.state || {};
  const navigate = useNavigate();

  const { register, setValue, handleSubmit, watch } = useForm({
    defaultValues: { permissions: [] },
  });

  const user = useSelector((state) => state.hr.selectedEmployee);

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
    Object.entries(permissionsObj).forEach(([key, { value, type, access }]) => {
      const [module] = key.split("_");

      if (!grouped[module]) grouped[module] = [];

      grouped[module].push({
        key,
        action: value,
        type,
        access: access,
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
    <div className="bg-white p-4 flex flex-col gap-4">
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
              src={user.profilePicture}
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
      <span className="text-title text-primary font-pmedium">
        Manage Access
      </span>
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(groupedPermissions).map(([module, permissions]) => (
          <div className="" key={module}>
            <div
              className="p-4 rounded-md cursor-pointer flex flex-col gap-2 shadow-md hover:bg-gray-100"
              onClick={() =>
                navigate(`${module}`, {
                  state: {
                    module,
                    permissions,
                    user,
                    currentPermissions: accessProfile?.permissions || [],
                  },
                })
              }
            >
              <span className="text-subtitle font-pmedium">
                {module.charAt(0).toUpperCase() + module.slice(1)}
              </span>
              <span className="text-content">
                {permissions.length} permissions
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccessProfile;
