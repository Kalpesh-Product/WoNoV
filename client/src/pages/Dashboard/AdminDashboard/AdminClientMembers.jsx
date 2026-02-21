import React, { useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import AgTable from "../../../components/AgTable";
import PageFrame from "../../../components/Pages/PageFrame";
import { useSelector } from "react-redux";
import ThreeDotMenu from "../../../components/ThreeDotMenu";
import MuiModal from "../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { Chip, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import PrimaryButton from "../../../components/PrimaryButton";
import { toast } from "sonner";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useMutation } from "@tanstack/react-query";

const AdminClientMembers = () => {
  const axios = useAxiosPrivate();
  const selectedClient = useSelector((state) => state.client.selectedClient);
  const [members, setMembers] = useState(selectedClient?.members || []);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  useEffect(() => {
    setMembers(selectedClient?.members || []);
  }, [selectedClient]);

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
    },
  });

  const handleEditMember = (member) => {
    setSelectedMemberId(member._id || member.id || member.employeeName);
    reset({
      employeeName: member.employeeName || "",
      email: member.email || "",
      phone: member.mobileNo || member.phone || "",
      dob: member.dob && dayjs(member.dob).isValid() ? dayjs(member.dob) : null,
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

      setMembers((prev) =>
        prev.map((member) => {
          const currentMemberId =
            member._id || member.id || member.employeeName;

          if (currentMemberId !== variables.memberId) {
            return member;
          }

          return updatedMember ? { ...member, ...updatedMember } : member;
        }),
      );

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
      biometricStatus: selectedMember.biometricStatus,
      dateOfJoining: selectedMember.dateOfJoining
        ? dayjs(selectedMember.dateOfJoining).format("YYYY-MM-DD")
        : undefined,
    };

    updateMember({ memberId: selectedMemberId, payload });
  };

  const memberData = useMemo(
    () =>
      members.map((item, index) => ({
        ...item,
        srNo: index + 1,
        email: item.email || "-",
        status:
          typeof item?.isActive === "boolean"
            ? item.isActive
            : item?.status === "Active",
      })),
    [members],
  );

  const viewEmployeeColumns = [
    { field: "srNo", headerName: "SR No" },
    {
      field: "employeeName",
      headerName: "Member Name",
      cellRenderer: (params) => <span>{params.value}</span>,
    },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        const status = params.value ? "Active" : "Inactive";
        const statusColorMap = {
          Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" },
          Active: { backgroundColor: "#90EE90", color: "#006400" },
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
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <ThreeDotMenu
          rowId={params.data.srNo}
          menuItems={[
            { label: "Edit", onClick: () => handleEditMember(params.data) },
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

export default AdminClientMembers;
