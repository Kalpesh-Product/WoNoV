import React, { useState } from 'react';
import AgTable from "../../../../components/AgTable";
import { Chip, TextField } from "@mui/material";
import useAxiosPrivate from '../../../../hooks/useAxiosPrivate';
import { useQuery } from '@tanstack/react-query';
import MuiModal from '../../../../components/MuiModal';
import PrimaryButton from '../../../../components/PrimaryButton';

const HrSOP = () => {
  const [openModal, setOpenModal] = useState(false);
  const [sopName, setSopName] = useState('');
  const axios = useAxiosPrivate();

  const { data: sops = [], refetch } = useQuery({
    queryKey: ["sops"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/get-company-documents/sop");
        return response.data.sop;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const handleAddSOP = async () => {
    try {
      await axios.post("/api/company/add-sop", {
        name: sopName,
        isActive: true,
      });
      setOpenModal(false);
      setSopName('');
      refetch(); // Refetch to update the list
    } catch (error) {
      console.error("Error adding SOP:", error);
    }
  };

  const departmentsColumn = [
    { field: "id", headerName: "Sr No" },
    {
      field: "sopname",
      headerName: "SOP NAME",
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
        }))}
        handleClick={() => setOpenModal(true)}
        columns={departmentsColumn}
      />

      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title="Add New SOP"
      >
        <div className="flex flex-col gap-4">
          <TextField
            label="SOP Name"
            variant="outlined"
            fullWidth
            value={sopName}
            onChange={(e) => setSopName(e.target.value)}
          />
          <PrimaryButton title="Add SOP" onClick={handleAddSOP} />
        </div>
      </MuiModal>
    </div>
  );
};

export default HrSOP;
