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

const AdminClientMembers = () => {
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
      phone: member.phone || "",
      dob: member.dob && dayjs(member.dob).isValid() ? dayjs(member.dob) : null,
    });
    setOpenEditModal(true);
  };

  const handleUpdateMember = (data) => {
    setMembers((prev) =>
      prev.map((member) => {
        const currentMemberId = member._id || member.id || member.employeeName;

        if (currentMemberId !== selectedMemberId) {
          return member;
        }

        return {
          ...member,
          employeeName: data.employeeName,
          email: data.email,
          phone: data.phone,
          dob: data.dob ? dayjs(data.dob).toISOString() : null,
        };
      }),
    );

    toast.success("Member details updated successfully");
    setOpenEditModal(false);
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
        onClose={() => setOpenEditModal(false)}
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

          <PrimaryButton title="Submit" type="submit" />
        </form>
      </MuiModal>
    </div>
  );
};

export default AdminClientMembers;
