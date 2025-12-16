import {
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import PrimaryButton from "../../components/PrimaryButton";
import { toast } from "sonner";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import PageFrame from "../../components/Pages/PageFrame";

const ModulePermissions = () => {
  const { state } = useLocation();
  const { user, module, permissions, currentPermissions } = state;

  const axios = useAxiosPrivate();
  const [isEditing, setIsEditing] = useState(false);

  const { register, watch, setValue, handleSubmit } = useForm({
    defaultValues: {
      permissions: currentPermissions,
    },
  });

  const formPermissions = new Set(watch("permissions") || []);

  const handleToggle = (perm) => {
    const current = new Set(watch("permissions") || []);
    current.has(perm) ? current.delete(perm) : current.add(perm);
    setValue("permissions", Array.from(current));
  };

  const mutation = useMutation({
    mutationFn: async (permissions) => {
      const res = await axios.post(
        `/api/access/modify-permissions/${user._id}`,
        { permissions }
      );
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Permissions updated successfully");
      setIsEditing(false); // disable editing after success
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Update failed");
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data.permissions);
  };

  return (
    <div className="p-4">
      <PageFrame>
        <div className="flex justify-between items-center mb-4">
          <span className="text-title font-pmedium text-primary uppercase">
            {module.charAt(0).toUpperCase() + module.slice(1)} Permissions
          </span>
          <PrimaryButton
            title={isEditing ? "Cancel" : "Edit"}
            handleSubmit={() => setIsEditing((prev) => !prev)}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TableContainer
            component={Paper}
            className="my-4"
            sx={{ maxHeight: 400, overflowY: "auto" }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: "bold", textTransform: "uppercase" }}
                  >
                    Permission
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", textTransform: "uppercase" }}
                  >
                    Access
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", textTransform: "uppercase" }}
                  >
                    Type
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", textTransform: "uppercase" }}
                  >
                    Allow
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {permissions.map(({ key, label, type, action, access }) => (
                  <TableRow key={key}>
                    <TableCell>{label}</TableCell>
                    <TableCell align="center">{access || "N/A"}</TableCell>
                    <TableCell align="center">{type}</TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={formPermissions.has(action)}
                        disabled={!isEditing}
                        onChange={() => isEditing && handleToggle(action)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <div className="flex w-full justify-center items-center">
            {isEditing && (
              <PrimaryButton
                title="Update Permissions"
                type="submit"
                isLoading={mutation.isPending}
                disabled={mutation.isPending}
              />
            )}
          </div>
        </form>
      </PageFrame>
    </div>
  );
};

export default ModulePermissions;
