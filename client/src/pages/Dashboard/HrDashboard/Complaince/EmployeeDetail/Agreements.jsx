import React, { useState } from "react";
import AgTable from "../../../../../components/AgTable";
import useAxiosPrivate from "../../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { Chip, TextField } from "@mui/material";
import MuiModal from "../../../../../components/MuiModal";
import PrimaryButton from "../../../../../components/PrimaryButton";
import { toast } from "sonner";
import PageFrame from "../../../../../components/Pages/PageFrame";
import { useSelector } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import YearWiseTable from "../../../../../components/Tables/YearWiseTable";
import {
  isAlphanumeric,
  noOnlyWhitespace,
} from "../../../../../utils/validators";

const Agreements = () => {
  const axios = useAxiosPrivate();
  const id = useSelector((state) => state.hr.selectedEmployee);
  const name = localStorage.getItem("employeeName") || "Employee";

  const [modalOpen, setModalOpen] = useState(false);
  const [newAgreement, setNewAgreement] = useState("");

  const { handleSubmit, control, setValue } = useForm({
    defaultValues: {
      agreementName: "",
    },
  });

  const agreementColumn = [
    {
      headerName: "Sr No",
      field: "serialNo",
      valueGetter: (params) => params.node.rowIndex + 1,
      maxWidth: 100,
    },
    {
      field: "name",
      headerName: "Agreement Type",
      flex: 1,
      valueFormatter: (params) =>
        params.value
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase()), // Beautify key like 'leavePolicy' -> 'Leave Policy'
    },
    {
      field: "value",
      headerName: "Details",
      flex: 2,
      cellRenderer: (params) => {
        const value = params.value;
        const isUrl = typeof value === "string" && value.startsWith("http");
        return isUrl ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Open Document
          </a>
        ) : (
          <span>{value}</span>
        );
      },
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

  const { data: agreements = [], isLoading } = useQuery({
    queryKey: ["agreements"],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/users/policies/${id}`);
        return response.data;
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
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to add agreement");
      }
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <PageFrame>
        <YearWiseTable
          search={true}
          tableTitle={`${name}'s Agreement List`}
          buttonTitle={"Add Agreement"}
          handleClick={() => setModalOpen(true)}
          data={
            isLoading
              ? []
              : Object.entries(agreements?.policies).map(
                  ([key, value], index) => ({
                    id: index + 1,
                    name: key,
                    value, // store the actual URL or text value
                    status:
                      typeof value === "string" && value.startsWith("http"), // show Active only for valid URLs
                  })
                )
          }
          columns={agreementColumn}
        />
      </PageFrame>

      {/* Modal for adding Agreement */}
      <MuiModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Agreement"
      >
        <form onSubmit={handleSubmit()} className="grid grid-cols-1 gap-4">
          <Controller
            name="agreementName"
            control={control}
            rules={{
              required: "Agreement name is required",
              validate: {
                isAlphanumeric,
                noOnlyWhitespace,
              },
            }}
            render={({ field }) => (
              <TextField {...field} label="Agreement Name" fullWidth size="small" />
            )}
          />

          <PrimaryButton
            handleSubmit={handleAddAgreement}
            type="submit"
            title="Submit"
            className="w-full mt-2"
          />
        </form>
      </MuiModal>
    </div>
  );
};

export default Agreements;
