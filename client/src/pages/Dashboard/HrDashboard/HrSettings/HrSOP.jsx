import React, { useState } from "react";
import AgTable from "../../../../components/AgTable";
import { Chip, IconButton, TextField } from "@mui/material";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MuiModal from "../../../../components/MuiModal";
import PrimaryButton from "../../../../components/PrimaryButton";
import PageFrame from "../../../../components/Pages/PageFrame";
import { LuImageUp } from "react-icons/lu";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

const HrSOP = () => {
  const [openModal, setOpenModal] = useState(false);
  const [sopName, setSopName] = useState("");
  const axios = useAxiosPrivate();
   const { handleSubmit, control, reset } = useForm();

  const { data: sops = [], refetch } = useQuery({
    queryKey: ["sops"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "/api/company/get-company-documents/sop"
        );
        return response.data.sop;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

    const queryClient = useQueryClient();

const addSopMutation = useMutation({
  mutationFn: async (formData) => {
    const response = await axios.post("/api/company/upload-company-document", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  onSuccess: () => {
    toast.success("Sop added successfully");
    queryClient.invalidateQueries(["sops"]);
    reset();  
    setOpenModal(false);
  },
  onError: (error) => {
    toast.error(error.response?.data?.message || "Failed to add policy");
  },
});

  // const handleAddSOP = async () => {
  //   try {
  //     await axios.post("/api/company/add-sop", {
  //       name: sopName,
  //       isActive: true,
  //     });
  //     setOpenModal(false);
  //     setSopName("");
  //     refetch(); // Refetch to update the list
  //   } catch (error) {
  //     console.error("Error adding SOP:", error);
  //   }
  // };

  const handleAddSop = (data) => {
  const formData = new FormData();
  formData.append("documentName", sopName);
  formData.append("type","sop");
  formData.append("document", data.file);
  addSopMutation.mutate(formData);
  setOpenModal(false);
};

  const departmentsColumn = [
    { field: "id", headerName: "Sr No" },
    {
      field: "sopname",
      headerName: "SOP NAME",
           cellRenderer: (params) => {
          const rowData = params.data;
    return (
      <a
        href={rowData.sopLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary cursor-pointer hover:underline"
      >
        {params.value}
      </a>
    )
  
  },
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        const status = params.value ? "Active" : "Inactive";
        const statusColorMap = {
          Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" },
          Active: { backgroundColor: "#90EE90", color: "#006400" },
        };

        const { backgroundColor, color } = statusColorMap[status] || {
          backgroundColor: "gray",
          color: "white",
        };

        return <Chip label={status} style={{ backgroundColor, color }} />;
      },
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: () => (
        <div className="p-2 mb-2 flex gap-2">
          <span className="text-content text-primary hover:underline cursor-pointer">
            Make Inactive
          </span>
        </div>
      ),
    },
  ];

  return (
    <PageFrame>
      <div>
        <AgTable
          key={sops.length}
          search={true}
          searchColumn={"SOPs"}
          tableTitle={"SOP List"}
          buttonTitle={"Add SOP"}
          data={sops.map((sop, index) => ({
            id: index + 1,
            sopname: sop.name,
            status: sop.isActive,
            sopLink:sop.documentLink
          }))}
          handleClick={() => setOpenModal(true)}
          columns={departmentsColumn}
        />

        <MuiModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          title="Add New SOP">
            <form onSubmit={handleSubmit(handleAddSop)}>

          <div className="flex flex-col gap-4">
            <TextField
              label="SOP Name"
              variant="outlined"
              fullWidth
              value={sopName}
              onChange={(e) => setSopName(e.target.value)}
            />

 <Controller
  name="file"
  control={control}
  defaultValue={null}
  render={({ field: { onChange, value } }) => (
    <>
      <input
        id="image-upload"
        type="file"
        accept=".png,.jpg,.jpeg,.pdf"
        hidden
        onChange={(e) => onChange(e.target.files[0])}
      />
      <TextField
        size="small"
        variant="outlined"
        fullWidth
        label="Upload policy"
        value={value ? value.name : ""}
        placeholder="Choose a file..."
        InputProps={{
          readOnly: true,
          endAdornment: (
            <IconButton
              color="primary"
              component="label"
              htmlFor="image-upload"
            >
              <LuImageUp />
            </IconButton>
          ),
        }}
      />
    </>
  )}
/>

           

            <PrimaryButton title="Add SOP" type="submit"  />
          </div>
          </form>
        </MuiModal>
      </div>
    </PageFrame>
  );
};

export default HrSOP;
