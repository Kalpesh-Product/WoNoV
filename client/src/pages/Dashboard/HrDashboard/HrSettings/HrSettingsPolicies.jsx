import { useState } from "react";
import AgTable from "../../../../components/AgTable";
import {
  Chip,
  TextField,
  Switch,
  Button,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import useAxiosPrivate from "../../../../hojoks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MuiModal from "../../../../components/MuiModal";
import PrimaryButton from "../../../../components/PrimaryButton";
import { toast } from "sonner";
import PageFrame from "../../../../components/Pages/PageFrame";
import { Controller, useForm } from "react-hook-form";
import { LuImageUp } from "react-icons/lu";

const HrSettingsPolicies = () => {
  const [openModal, setOpenModal] = useState(false);
  const [policyName, setPolicyName] = useState("");
  const axios = useAxiosPrivate();
  const { handleSubmit, control, reset } = useForm();


  const { data: policies = [] } = useQuery({
    queryKey: ["policies"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "/api/company/get-company-documents/policies"
        );
        return response.data.policies;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const queryClient = useQueryClient();

const addPolicyMutation = useMutation({
  mutationFn: async (formData) => {
    const response = await axios.post("/api/company/upload-company-document", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  onSuccess: () => {
    toast.success("Policy added successfully");
    queryClient.invalidateQueries(["policies"]);
    reset();  
    setOpenModal(false);
  },
  onError: (error) => {
    toast.error(error.response?.data?.message || "Failed to add policy");
  },
});

const handleAddPolicy = (data) => {
  const formData = new FormData();
  formData.append("documentName", policyName);
  formData.append("type","policy");
  formData.append("document", data.file);
  addPolicyMutation.mutate(formData);
  setOpenModal(false);
};

  const departmentsColumn = [
    { field: "id", headerName: "Sr No", width: "100" },
    {
      field: "policyname",
      headerName: "POLICY NAME",
      cellRenderer: (params) => {
          const rowData = params.data;
    return (
      <a
        href={rowData.policyLink}
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
          key={policies.length}
          search={true}
          searchColumn={"Policies"}
          tableTitle={"Policy List"}
          buttonTitle={"Add Policy"}
          data={[
            ...policies.map((policy, index) => ({
              id: index + 1,
              policyname: policy.name,
              status: policy.isActive,
              policyLink:policy.documentLink

            })),
          ]}
          handleClick={() => setOpenModal(true)}
          columns={departmentsColumn}
        />

        <MuiModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          title="Add New Policy">
          <form onSubmit={handleSubmit(handleAddPolicy)}>
            <div className="flex flex-col gap-4">
            <TextField
              label="Policy Name"
              variant="outlined"
              fullWidth
              value={policyName}
              onChange={(e) => setPolicyName(e.target.value)}
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



            <PrimaryButton title="Add Policy" type="submit"  />
          </div>
          </form>
        </MuiModal>
      </div>
    </PageFrame>
  );
};

export default HrSettingsPolicies;
