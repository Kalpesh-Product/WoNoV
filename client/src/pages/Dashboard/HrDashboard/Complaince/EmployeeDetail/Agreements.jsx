import React, { useState } from "react";
import AgTable from "../../../../../components/AgTable";
import useAxiosPrivate from "../../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { Chip, TextField } from "@mui/material";
import MuiModal from "../../../../../components/MuiModal";
import PrimaryButton from "../../../../../components/PrimaryButton";
import { toast } from "sonner";
import PageFrame from "../../../../../components/Pages/PageFrame";

const Agreements = () => {
  const axios = useAxiosPrivate();
  const name = localStorage.getItem("employeeName") || "Employee";

  const [modalOpen, setModalOpen] = useState(false);
  const [newAgreement, setNewAgreement] = useState("");

  const agreementColumn = [
    {
      headerName: "Sr No",
      field: "serialNo",
      valueGetter: (params) => params.node.rowIndex + 1,
      maxWidth: 100,
    },
    {
      field: "name",
      headerName: "Agreement Name",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
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
  ];

  const { data: agreements = [], refetch } = useQuery({
    queryKey: ["agreements"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "/api/company/get-company-documents/agreements"
        );
        return response.data.agreements;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const handleAddAgreement = async () => {
    if (newAgreement.trim()) {
      try {
        await axios.post("/api/company/add-agreement", {
          name: newAgreement,
        });
        toast.success("Successfully added agreement");
        setNewAgreement("");
        setModalOpen(false);
        refetch();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to add agreement");
      }
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <PageFrame>
        <div>
          <AgTable
            key={agreements.length}
            search={true}
            searchColumn={"Agreement Name"}
            tableTitle={`${name}'s Agreement List`}
            buttonTitle={"Add Agreement"}
            handleClick={() => setModalOpen(true)}
            data={agreements.map((agreement, index) => ({
              id: index + 1,
              name: agreement.name,
              status: agreement.isActive,
            }))}
            columns={agreementColumn}
          />
        </div>
      </PageFrame>

      {/* Modal for adding Agreement */}
      <MuiModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Agreement">
        <div>
          <TextField
            label="Agreement Name"
            fullWidth
            value={newAgreement}
            onChange={(e) => setNewAgreement(e.target.value)}
          />
        </div>
        <PrimaryButton
          handleSubmit={handleAddAgreement}
          type="submit"
          title="Submit"
          className="w-full mt-2"
        />
      </MuiModal>
    </div>
  );
};

export default Agreements;
