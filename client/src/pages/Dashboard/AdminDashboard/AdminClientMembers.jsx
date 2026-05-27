import React, { useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import AgTable from "../../../components/AgTable";
import PageFrame from "../../../components/Pages/PageFrame";
import { useDispatch, useSelector } from "react-redux";
import ThreeDotMenu from "../../../components/ThreeDotMenu";
import MuiModal from "../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { Chip, MenuItem, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import PrimaryButton from "../../../components/PrimaryButton";
import { toast } from "sonner";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import StatusChip from "../../../components/StatusChip";
import useAuth from "../../../hooks/useAuth";
import { setSelectedClient } from "../../../redux/slices/clientSlice";
import { useParams } from "react-router-dom";

const BIOMETRIC_OPTIONS = ["Pending", "Approved", "Revoke"];
const getMemberId = (member) => member?._id || member?.id || member?.employeeName;
const normalizeClientKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
const normalizeBiometricStatus = (status) =>
  String(status || "Pending").toLowerCase() === "approved"
    ? "Approved"
     : String(status || "Pending").toLowerCase() === "revoke"
      ? "Revoke"
      : "Pending";
const normalizeValue = (value) => String(value || "").trim().toLowerCase();
const getCurrentMemberId = (member) => member?._id || member?.id || member?.employeeName;
const getNextMembersAfterDelete = (members = [], memberId, preserveDeleted) =>
  preserveDeleted
    ? members.map((member) =>
        getCurrentMemberId(member) === memberId
          ? {
              ...member,
              isDeleted: true,
              isActive: false,
              status: false,
              biometricStatus: "Revoke",
            }
          : member,
      )
    : members.filter((member) => getCurrentMemberId(member) !== memberId);
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

const AdminClientMembers = () => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { auth } = useAuth();
  const { clientName } = useParams();
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
      clientName,
      selectedClient?._id,
      selectedClient?.clientName,
    ],
    enabled: Boolean(clientName || selectedClient?._id || selectedClient?.clientName),
    queryFn: async () => {
      const response = await axios.get("/api/sales/co-working-clients");
      const clients = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
          ? response.data.data
          : [];
      const routeClientKey = normalizeClientKey(decodeURIComponent(clientName || ""));
      const selectedClientKey = normalizeClientKey(selectedClient?._id || selectedClient?.clientName);
      return clients.find(
        (client) =>
          normalizeClientKey(client?._id) === routeClientKey ||
          normalizeClientKey(client?.clientName) === routeClientKey ||
          normalizeClientKey(client?._id) === selectedClientKey ||
          normalizeClientKey(client?.clientName) === selectedClientKey,
      );
    },
  });

  const resolvedClient = useMemo(() => {
    if (freshClientData) return freshClientData;

    const routeClientKey = normalizeClientKey(decodeURIComponent(clientName || ""));
    const selectedClientKey = normalizeClientKey(selectedClient?._id || selectedClient?.clientName);

    if (
      selectedClient &&
      (normalizeClientKey(selectedClient?._id) === routeClientKey ||
        normalizeClientKey(selectedClient?.clientName) === routeClientKey ||
        normalizeClientKey(selectedClient?._id) === selectedClientKey ||
        normalizeClientKey(selectedClient?.clientName) === selectedClientKey)
    ) {
      return selectedClient;
    }

    return null;
  }, [clientName, freshClientData, selectedClient]);

  const { data: clientMembersData } = useQuery({
    queryKey: ["selectedCoWorkingClientMembers", resolvedClient?._id, resolvedClient?.clientName],
    enabled: Boolean(resolvedClient?._id),
    queryFn: async () => {
      const response = await axios.get(
        `/api/sales/co-working-client-members?clientId=${resolvedClient._id}`,
      );
      return Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
          ? response.data.data
          : [];
    },
  });

  useEffect(() => {
    const nextMembers = Array.isArray(clientMembersData) && clientMembersData.length > 0
      ? clientMembersData
      : Array.isArray(resolvedClient?.members)
        ? resolvedClient.members
        : [];

    setMembers(nextMembers);

    if (resolvedClient) {
      dispatch(setSelectedClient(resolvedClient));
    }
  }, [clientMembersData, dispatch, resolvedClient]);

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
      gender: "",
      email: "",
      phone: "",
      dob: null,
      biometricStatus: "Pending",
    },
  });

  const handleEditMember = (member) => {
    setSelectedMemberId(getMemberId(member));
    reset({
      employeeName: member.employeeName || "",
      gender: member.gender || "",
      email: member.email || "",
      phone: member.mobileNo || member.phone || "",
      dob: member.dob && dayjs(member.dob).isValid() ? dayjs(member.dob) : null,
      biometricStatus: normalizeBiometricStatus(member.biometricStatus),
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
          const currentMemberId = getMemberId(member);

          if (currentMemberId !== variables.memberId) {
            return member;
          }

          return {
            ...member,
            ...(updatedMember || {}),
            biometricStatus: variables.payload.biometricStatus,
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
          const currentMemberId = getMemberId(member);

          if (currentMemberId !== variables.memberId) {
            return member;
          }

          return {
            ...member,
            isActive: variables.isActive,
            status: variables.isActive ? "Active" : "Inactive",
            biometricStatus: normalizeBiometricStatus(
              response?.data?.biometricStatus,
            ),
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
      const updatedMembers = getNextMembersAfterDelete(
        members,
        memberId,
        canViewDisabledMembers,
      );

      setMembers(updatedMembers);
      dispatch(
        setSelectedClient({
          ...selectedClient,
          members: updatedMembers,
        }),
      );
      queryClient.setQueryData(
        ["selectedCoWorkingClient", clientName, selectedClient?._id, selectedClient?.clientName],
        (current) =>
          current
            ? {
                ...current,
                members: updatedMembers,
                memberCount: canViewDisabledMembers
                  ? updatedMembers.length
                  : updatedMembers.length,
              }
            : current,
      );
      queryClient.setQueryData(
        ["selectedCoWorkingClientMembers", resolvedClient?._id, resolvedClient?.clientName],
        updatedMembers,
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
    const selectedMember = members.find(
      (member) => getMemberId(member) === selectedMemberId,
    );

    if (!selectedMember || !selectedMemberId) {
      toast.error("Unable to find selected member");
      return;
    }

    const payload = {
      name: data.employeeName?.trim(),
      gender: data.gender,
      designation: selectedMember.designation,
      email: data.email?.trim() || selectedMember.email,
      phone:
        data.phone?.trim() || selectedMember.mobileNo || selectedMember.phone,
      bloodGroup: selectedMember.bloodGroup,
      dob: data.dob
        ? dayjs(data.dob).format("YYYY-MM-DD")
        : selectedMember.dob
          ? dayjs(selectedMember.dob).format("YYYY-MM-DD")
          : undefined,
      emergencyName: selectedMember.emergencyName,
      emergencyNo: selectedMember.emergencyNo,
      biometricStatus: data.biometricStatus,
      dateOfJoining: selectedMember.dateOfJoining
        ? dayjs(selectedMember.dateOfJoining).format("YYYY-MM-DD")
        : undefined,
    };

    updateMember({ memberId: selectedMemberId, payload });
  };

  const handleToggleMemberStatus = (member) => {
    const memberId = getMemberId(member);

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
        srNo: index + 1,
        email: item.email || "-",
        phone: item.mobileNo || item.phone || "-",
        status:
          item?.isDeleted
            ? false
            : typeof item?.isActive === "boolean"
            ? item.isActive
            : item?.status === "Active",
        biometricStatus: normalizeBiometricStatus(item.biometricStatus),
        isDeleted: Boolean(item?.isDeleted),
      })),
    [visibleMembers],
  );

  const memberStats = useMemo(() => {
    const total = memberData.length;
    const active = memberData.filter(
      (member) => !member.isDeleted && member.status,
    ).length;
    const inactive = memberData.filter(
      (member) => !member.isDeleted && !member.status,
    ).length;
    const disabled = memberData.filter((member) => member.isDeleted).length;

    return { total, active, inactive, disabled };
  }, [memberData]);

  const viewEmployeeColumns = [
    { field: "srNo", headerName: "SR No" },
    {
      field: "employeeName",
      headerName: "Member Name",
      cellRenderer: (params) => <span>{params.value}</span>,
    },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "phone", headerName: "Phone No", flex: 1 },
    {
      field: "biometricStatus",
      headerName: "Biometric Status",
      sort: "desc",
      flex: 1,
      cellRenderer: (params) => {
        const status = params.value || "Pending";
        const statusColorMap = {
          Pending: { backgroundColor: "#FFECC5", color: "#CC8400" },
          Approved: { backgroundColor: "#D4F8D4", color: "#0A7A0A" },
          Revoke: { backgroundColor: "#FDE2E1", color: "#B42318" },
        };

        const { backgroundColor, color } = statusColorMap[status];

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
      field: "status",
      headerName: "Status",
      sort: "desc",
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
          rowId={params.data.srNo}
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
            search={true}
            searchColumn="Email"
            tableTitle={`${selectedClient?.clientName} - Member Details`}
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
                <StatusChip status="Active" count={memberStats.active} variant="count" />
                <StatusChip status="Inactive" count={memberStats.inactive} variant="count" />
                {canViewDisabledMembers ? (
                  <StatusChip status="Disabled" count={memberStats.disabled} variant="count" />
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
            name="gender"
            control={control}
            rules={{ required: "Gender is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Gender"
                size="small"
                fullWidth
                error={!!errors?.gender}
                helperText={errors?.gender?.message}
              >
                <MenuItem value="" disabled>
                  Select Gender
                </MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </TextField>
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

          <Controller
            name="biometricStatus"
            control={control}
            rules={{ required: "Biometric status is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Biometric Status"
                size="small"
                fullWidth
                error={!!errors?.biometricStatus}
                helperText={errors?.biometricStatus?.message}
              >
                {BIOMETRIC_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
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

export default AdminClientMembers;
