import React, { useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import { Chip, MenuItem, TextField } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import humanDate from "../../../../utils/humanDateForamt";
import PageFrame from "../../../../components/Pages/PageFrame";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import MuiModal from "../../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import PrimaryButton from "../../../../components/PrimaryButton";
import { toast } from "sonner";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAuth from "../../../../hooks/useAuth";
import StatusChip from "../../../../components/StatusChip";
import { setSelectedClient } from "../../../../redux/slices/clientSlice";

const normalizeValue = (value) => String(value || "").trim().toLowerCase();

const getMemberId = (member) => member?._id || member?.id || member?.employeeName;
const getRoleTitles = (user) =>
  (Array.isArray(user?.role) ? user.role : [])
    .map((role) => normalizeValue(role?.roleTitle || role))
    .filter(Boolean);
const getDepartmentNames = (user) =>
  (Array.isArray(user?.departments) ? user.departments : [])
    .map((department) => normalizeValue(department?.name || department?.departmentName || department))
    .filter(Boolean);
const canViewDeletedMembers = (user) => {
  const roleTitles = getRoleTitles(user);
  const departmentNames = getDepartmentNames(user);

  if (roleTitles.some((role) => ["master admin", "super admin"].includes(role))) {
    return true;
  }

  return (
    roleTitles.some((roleTitle) =>
      roleTitle.includes("air tech department") || roleTitle.includes("air tech"),
    ) ||
    departmentNames.some((departmentName) =>
      departmentName.includes("air tech department") ||
      departmentName.includes("air tech"),
    )
  );
};

const ClientMembers = () => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { auth } = useAuth();
  const selectedClient = useSelector((state) => state.client.selectedClient);
  const [members, setMembers] = useState(selectedClient?.members || []);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const canViewDisabledMembers = useMemo(
    () => canViewDeletedMembers(auth?.user),
    [auth?.user],
  );

  const { data: freshClientData } = useQuery({
    queryKey: [
      "selectedCoWorkingClient",
      selectedClient?._id,
      selectedClient?.clientName,
    ],
    enabled: Boolean(selectedClient?._id || selectedClient?.clientName),
    queryFn: async () => {
      const response = await axios.get("/api/sales/co-working-clients");
      const clients = response.data || [];
      return clients.find(
        (client) =>
          client?._id === selectedClient?._id ||
          (client?.clientName || "").trim().toLowerCase() ===
            (selectedClient?.clientName || "").trim().toLowerCase(),
      );
    },
  });

  useEffect(() => {
    const client = freshClientData || selectedClient;
    setMembers(client?.members || []);
  }, [freshClientData, selectedClient]);

  const visibleMembers = useMemo(
    () =>
      canViewDisabledMembers
        ? members
        : members.filter((member) => !member?.isDeleted),
    [canViewDisabledMembers, members],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      employeeName: "",
      email: "",
      phone: "",
      dob: null,
      isActive: true,
    },
  });

  const handleEditMember = (member) => {
    setSelectedMemberId(member._id || member.id || member.employeeName);
    reset({
      employeeName: member.employeeName || "",
      email: member.email || "",
      phone: member.mobileNo || member.phone || "",
      dob: member.rawDob && dayjs(member.rawDob).isValid() ? dayjs(member.rawDob) : null,
      isActive:
        typeof member?.isActive === "boolean"
          ? member.isActive
          : member?.status === "Active",
    });
    setOpenEditModal(true);
  };

  const { mutate: updateMember, isPending: isSubmitting } = useMutation({
    mutationFn: async ({ memberId, payload }) => {
      const response = await axios.patch(
        `/api/sales/co-working-member/${memberId}`,
        payload,
      );
      return response.data;
    },
    onSuccess: (response, variables) => {
      const updatedMember = response?.data;
      let updatedMembers = [];

      setMembers((prev) => {
        updatedMembers = prev.map((member) => {
          const currentMemberId = member._id || member.id || member.employeeName;

          if (currentMemberId !== variables.memberId) {
            return member;
          }

          return updatedMember ? { ...member, ...updatedMember } : member;
        });

        return updatedMembers;
      });

      dispatch(
        setSelectedClient({
          ...selectedClient,
          members: updatedMembers,
        }),
      );
      queryClient.invalidateQueries({ queryKey: ["clientsData"] });
      queryClient.invalidateQueries({ queryKey: ["co-working-clients"] });
      queryClient.invalidateQueries({ queryKey: ["biometricAccessClientsData"] });
      queryClient.invalidateQueries({ queryKey: ["biometricAccessClient"] });
      queryClient.invalidateQueries({ queryKey: ["selectedCoWorkingClient"] });

      toast.success(response?.message || "Member details updated successfully");
      setOpenEditModal(false);
      setSelectedMemberId(null);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update member",
      );
    },
  });

  const { mutate: updateMemberStatus } = useMutation({
    mutationFn: async ({ memberId, isActive }) => {
      const response = await axios.patch(
        `/api/sales/co-working-member/${memberId}/status`,
        { isActive },
      );
      return response.data;
    },
    onSuccess: (response, variables) => {
      let updatedMembers = [];

      setMembers((prev) => {
        updatedMembers = prev.map((member) => {
          const currentMemberId = member._id || member.id || member.employeeName;

          if (currentMemberId !== variables.memberId) {
            return member;
          }

          return {
            ...member,
            isActive: variables.isActive,
            status: variables.isActive ? "Active" : "Inactive",
            biometricStatus: response?.data?.biometricStatus || member.biometricStatus,
          };
        });

        return updatedMembers;
      });

      dispatch(
        setSelectedClient({
          ...selectedClient,
          members: updatedMembers,
        }),
      );
      queryClient.invalidateQueries({ queryKey: ["clientsData"] });
      queryClient.invalidateQueries({ queryKey: ["co-working-clients"] });
      queryClient.invalidateQueries({ queryKey: ["biometricAccessClientsData"] });
      queryClient.invalidateQueries({ queryKey: ["biometricAccessClient"] });
      queryClient.invalidateQueries({ queryKey: ["selectedCoWorkingClient"] });

      toast.success(response?.message || "Member status updated successfully");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update member status",
      );
    },
  });

  const { mutate: deleteMember, isPending: isDeletePending } = useMutation({
    mutationFn: async (memberId) => {
      const response = await axios.delete(`/api/sales/co-working-member/${memberId}`);
      return response.data;
    },
    onSuccess: (response, memberId) => {
      setMembers((prev) =>
        canViewDisabledMembers
          ? prev.map((member) =>
              getMemberId(member) === memberId
                ? {
                    ...member,
                    isDeleted: true,
                    isActive: false,
                    status: false,
                    biometricStatus: "Revoke",
                  }
                : member,
            )
          : prev.filter((member) => getMemberId(member) !== memberId),
      );
      const updatedMembers = canViewDisabledMembers
        ? members.map((member) =>
            getMemberId(member) === memberId
              ? {
                  ...member,
                  isDeleted: true,
                  isActive: false,
                  status: false,
                  biometricStatus: "Revoke",
                }
              : member,
          )
        : members.filter((member) => getMemberId(member) !== memberId);
      dispatch(
        setSelectedClient({
          ...selectedClient,
          members: updatedMembers,
        }),
      );
      queryClient.invalidateQueries({ queryKey: ["clientsData"] });
      queryClient.invalidateQueries({ queryKey: ["co-working-clients"] });
      queryClient.invalidateQueries({ queryKey: ["biometricAccessClientsData"] });
      queryClient.invalidateQueries({ queryKey: ["biometricAccessClient"] });
      queryClient.invalidateQueries({ queryKey: ["selectedCoWorkingClient"] });
      toast.success(response?.message || "Member deleted successfully");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete member",
      );
    },
  });

  const handleUpdateMember = (data) => {
    const selectedMember = members.find((member) => {
      const currentMemberId = member._id || member.id || member.employeeName;
      return currentMemberId === selectedMemberId;
    });

    if (!selectedMember || !selectedMemberId) {
      toast.error("Unable to find selected member");
      return;
    }

    const payload = {
      name: data.employeeName?.trim(),
      designation: selectedMember.designation,
      email: data.email?.trim() || selectedMember.email,
      phone: data.phone?.trim() || selectedMember.mobileNo || selectedMember.phone,
      bloodGroup: selectedMember.bloodGroup,
      dob: data.dob
        ? dayjs(data.dob).format("YYYY-MM-DD")
        : selectedMember.dob
          ? dayjs(selectedMember.dob).format("YYYY-MM-DD")
          : undefined,
      emergencyName: selectedMember.emergencyName,
      emergencyNo: selectedMember.emergencyNo,
      biometricStatus: selectedMember.biometricStatus,
      dateOfJoining: selectedMember.dateOfJoining
        ? dayjs(selectedMember.dateOfJoining).format("YYYY-MM-DD")
        : undefined,
      isActive: data.isActive,
    };

    updateMember({ memberId: selectedMemberId, payload });
  };

  const handleToggleMemberStatus = (member) => {
    const memberId = member._id || member.id || member.employeeName;

    if (!memberId) {
      toast.error("Unable to find selected member");
      return;
    }

    const currentStatus =
      typeof member?.isActive === "boolean"
        ? member.isActive
        : member?.status === "Active";

    updateMemberStatus({ memberId, isActive: !currentStatus });
  };

  const memberData = useMemo(
    () =>
      visibleMembers.map((item, index) => ({
        ...item,
        srno: index + 1,
        employeeName: item.employeeName,
        dob: humanDate(item.dob),
        rawDob: item.dob,
        mobileNo: item.mobileNo || 0,
        email: item.email || "N/A",
        status:
          item?.isDeleted
            ? false
            : typeof item?.isActive === "boolean"
            ? item.isActive
            : item?.status === "Active",
        isDeleted: Boolean(item?.isDeleted),
      })),
    [visibleMembers],
  );

  const memberStats = useMemo(() => {
    const activeCount = memberData.filter(
      (member) => !member.isDeleted && member.status,
    ).length;
    const inactiveCount = memberData.filter(
      (member) => !member.isDeleted && !member.status,
    ).length;
    const disabledCount = memberData.filter((member) => member.isDeleted).length;

    return { activeCount, inactiveCount, disabledCount, total: memberData.length };
  }, [memberData]);

  const viewEmployeeColumns = [
    { field: "srno", headerName: "SR No" },
    {
      field: "employeeName",
      headerName: "Member Name",
      cellRenderer: (params) => <span>{params.value}</span>,
    },
    { field: "dob", headerName: "DOB" },
    { field: "mobileNo", headerName: "Mobile No." },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        const status = params.data?.isDeleted
          ? "Disabled"
          : params.value
            ? "Active"
            : "Inactive";
        const statusColorMap = {
          Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" },
          Active: { backgroundColor: "#90EE90", color: "#006400" },
          Disabled: { backgroundColor: "#D3D3D3", color: "#666666" },
        };

        const { backgroundColor, color } = statusColorMap[status] || statusColorMap.Disabled;

        return (
          <Chip
            label={status}
            style={{
              backgroundColor,
              color,
            }}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <ThreeDotMenu
          rowId={params.data.srno}
          menuItems={[
            {
              label: "Edit",
              onClick: () => handleEditMember(params.data),
              disabled: params.data?.isDeleted,
            },
            {
              label: params.data.status ? "Mark As Inactive" : "Mark As Active",
              onClick: () => handleToggleMemberStatus(params.data),
              disabled: params.data?.isDeleted,
            },
            {
              label: "Delete",
              onClick: () => deleteMember(getMemberId(params.data)),
              disabled: params.data?.isDeleted || isDeletePending,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="w-full">
        <PageFrame>
          <AgTable
            key={selectedClient?._id}
            search={true}
            searchColumn="Email"
            tableTitle={`${selectedClient?.clientName || "Client"} Members`}
            data={memberData}
            columns={viewEmployeeColumns}
            getRowStyle={(params) =>
              params.data?.isDeleted
                ? { backgroundColor: "#f4f4f4", color: "#7a7a7a" }
                : undefined
            }
            headerActions={
              <div className="flex items-center gap-2 flex-wrap">
                <StatusChip status="Total" count={memberStats.total} variant="count" />
                <StatusChip status="Active" count={memberStats.activeCount} variant="count" />
                <StatusChip status="Inactive" count={memberStats.inactiveCount} variant="count" />
                {canViewDisabledMembers ? (
                  <StatusChip status="Disabled" count={memberStats.disabledCount} variant="count" />
                ) : null}
              </div>
            }
            exportData
          />
        </PageFrame>
      </div>
      <div>
        <Outlet />
      </div>

      <MuiModal
        open={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          setSelectedMemberId(null);
        }}
        title="Edit Member"
      >
        <form
          onSubmit={handleSubmit(handleUpdateMember)}
          className="flex flex-col gap-4"
        >
          <TextField
            label="Company Name"
            value={selectedClient?.clientName || ""}
            size="small"
            fullWidth
            disabled
          />
          <Controller
            name="employeeName"
            control={control}
            rules={{ required: "Member Name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Member Name"
                size="small"
                fullWidth
                error={!!errors?.employeeName}
                helperText={errors?.employeeName?.message}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Email" size="small" fullWidth />
            )}
          />

          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Phone" size="small" fullWidth />
            )}
          />


          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Status"
                size="small"
                fullWidth
                value={field.value ? "active" : "inactive"}
                onChange={(event) =>
                  field.onChange(event.target.value === "active")
                }
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            )}
          />

          <Controller
            name="dob"
            control={control}
            render={({ field: { value, onChange, ...restField } }) => (
              <DatePicker
                {...restField}
                value={value && dayjs(value).isValid() ? dayjs(value) : null}
                onChange={(newValue) => onChange(newValue || null)}
                label="Date of Birth"
                format="DD-MM-YYYY"
                error={!!errors.dob}
                helperText={errors.dob?.message}
                fullWidth
                slotProps={{ textField: { size: "small" } }}
              />
            )}
          />

          <PrimaryButton
            title="Submit"
            type="submit"
            isLoading={isSubmitting}
          />
        </form>
      </MuiModal>
    </div>
  );
};

export default ClientMembers;
