import { useState } from "react";
import AgTable from "../../../../components/AgTable";
import {
  Chip,
  TextField,
  Switch,
  Button,
  FormControlLabel,
} from "@mui/material";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import MuiModal from "../../../../components/MuiModal";
import PrimaryButton from "../../../../components/PrimaryButton";
import { toast } from "sonner";
import PageFrame from "../../../../components/Pages/PageFrame";

const HrSettingsPolicies = () => {
  const [openModal, setOpenModal] = useState(false);
  const [policyName, setPolicyName] = useState("");
  const axios = useAxiosPrivate();

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

  // const handleAddPolicy = async () => {
  //   try {
  //     await axios.post("/api/company/add-policy", {
  //       name: policyName,
  //       isActive: true,
  //     });
  //     setOpenModal(false);
  //     setPolicyName('');
  //     // Optionally refetch or invalidate query here
  //   } catch (error) {
  //     console.error("Error adding policy:", error);
  //   }
  // };

  const handleAddPolicy = () => {
    toast.success("Successfully added policy");
    setOpenModal(false);
  };

  const departmentsColumn = [
    { field: "id", headerName: "Sr No", width: "100" },
    {
      field: "policyname",
      headerName: "POLICY NAME",
      cellRenderer: (params) => (
        <div>
          <span className="text-primary cursor-pointer hover:underline">
            {params.value}
          </span>
        </div>
      ),
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
            })),
          ]}
          handleClick={() => setOpenModal(true)}
          columns={departmentsColumn}
        />

        <MuiModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          title="Add New Policy">
          <div className="flex flex-col gap-4">
            <TextField
              label="Policy Name"
              variant="outlined"
              fullWidth
              value={policyName}
              onChange={(e) => setPolicyName(e.target.value)}
            />

            <PrimaryButton title="Add Policy" onClick={handleAddPolicy} />
          </div>
        </MuiModal>
      </div>
    </PageFrame>
  );
};

export default HrSettingsPolicies;
