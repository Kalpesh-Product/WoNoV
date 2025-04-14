import React, { useState } from "react";
import AgTable from "../../../../components/AgTable";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import MuiModal from "../../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { TextField } from "@mui/material";
import PrimaryButton from "../../../../components/PrimaryButton";

const PendingApprovals = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const {
    handleSubmit: reasonSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      reason: "",
    },
  });
  const onSubmit = (data) => {
    console.log(data);
    setModalOpen(false);
  };
//   const pendingApprovalsColumns = [

//   ];

//   const pendingApprovalsData = [

//   ];


const kraColumn = [
    { field: "id", headerName: "Sr No", flex: 1 },
    { field: "department", headerName: "Department", flex: 1 },
    { field: "date", headerName: "Date", flex: 1 },
    { field: "amount", headerName: "Amount", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <>
          <ThreeDotMenu
            rowId={params.data.id}
            menuItems={[
              { label: "Approve" },
              { label: "Reject", onClick: () => setModalOpen(true) },
            ]}
          />
        </>
      ),
    },
  ];

  const rows = [
    {
        id: 1,
        department: "Tech",
        date: " 2022-01-01",
        amount: 1000.0,
      },
      {
        id: 2,
        department: "Tech",
        date: " 2022-01-01",
        amount: 1000.0,
      },
      {
        id: 3,
        department: "Tech",
        date: " 2022-01-01",
        amount: 1000.0,
      },
      {
        id: 4,
        department: "Tech",
        date: " 2022-01-01",
        amount: 1000.0,
      },
      {
        id: 5,
        department: "Tech",
        date: " 2022-01-01",
        amount: 1000.0,
      },
];

  return (
    <div>
     <div>
        <AgTable
          search={true}

          data={rows}
          columns={kraColumn}
        />
      </div>
      <div>
        <MuiModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={"Reject request"}
        >
          <form onSubmit={reasonSubmit(onSubmit)} className="flex flex-col gap-4">
            <Controller
              name="reason"
              control={control}
              rules={{ required: "Reason is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={"Reason"}
                  placeholder="Enter the reason"
                  multiline
                  fullWidth
                  rows={4}
                  error={!!errors.reason}
                  helperText={errors.reason?.message}
                />
              )}
            />
            <PrimaryButton title={"Submit"} type={"submit"} />
          </form>
        </MuiModal>
      </div>
    </div>
  );
};

export default PendingApprovals;
