import React, { useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import AgTable from "../../../components/AgTable";
import PageFrame from "../../../components/Pages/PageFrame";
import { useSelector } from "react-redux";
import ThreeDotMenu from "../../../components/ThreeDotMenu";
import MuiModal from "../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { TextField } from "@mui/material";
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
    },
  });

  const handleEditMember = (member) => {
    setSelectedMemberId(member._id || member.id || member.employeeName);
    reset({
      employeeName: member.employeeName || "",
      email: member.email || "",
      phone: member.phone || "",
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

          <PrimaryButton title="Submit" type="submit" />
        </form>
      </MuiModal>
    </div>
  );
};

export default AdminClientMembers;
