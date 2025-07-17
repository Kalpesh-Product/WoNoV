import { useState } from "react";
import AgTable from "../../../../../components/AgTable";
import useAxiosPrivate from "../../../../../hooks/useAxiosPrivate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Chip, TextField, MenuItem } from "@mui/material";
import MuiModal from "../../../../../components/MuiModal";
import PrimaryButton from "../../../../../components/PrimaryButton";
import { toast } from "sonner";
import PageFrame from "../../../../../components/Pages/PageFrame";
import { useSelector } from "react-redux";
import ThreeDotMenu from "../../../../../components/ThreeDotMenu";
import UploadFileInput from "../../../../../components/UploadFileInput";
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
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [newAgreement, setNewAgreement] = useState("");

  const { handleSubmit, control, setValue } = useForm({
    defaultValues: {
      agreementName: "",
    },
  });
  const [statusMap, setStatusMap] = useState({});

  const { data: agreements = {}, isLoading } = useQuery({
    queryKey: ["agreements", id],
    queryFn: async () => {
      const response = await axios.get(`/api/users/policies/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      // Initialize all as active unless already tracked
      const initialStatus = {};
      Object.keys(data?.policies || {}).forEach((key) => {
        if (!(key in statusMap)) {
          initialStatus[key] = true;
        }
      });
      setStatusMap((prev) => ({ ...initialStatus, ...prev }));
    },
  });

  const { mutate: markInactive } = useMutation({
    mutationFn: async (agreementName) => {
      // Optional: Send this update to the backend
      // await axios.patch(`/api/users/policies/${id}`, { agreementName, active: false });
      return agreementName;
    },
    onSuccess: (agreementName) => {
      setStatusMap((prev) => ({ ...prev, [agreementName]: false }));
      toast.success(`${agreementName} marked as inactive`);
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
          .replace(/^./, (str) => str.toUpperCase()),
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
    {
      field: "actions",
      headerName: "Actions",
      maxWidth: 100,
      cellRenderer: (params) => {
        const name = params.data.name;
        return (
          <ThreeDotMenu
            rowId={params.data.id}
            isLoading={false}
            menuItems={[
              {
                label: "Mark as Inactive",
                onClick: () => markInactive(name),
                disabled: !params.data.status, // Disable if already inactive
              },
            ]}
          />
        );
      },
    },
  ];

  const tableData = !isLoading
    ? Object.entries(agreements?.policies || {})
        .map(([key, value], index) => ({
          id: index + 1,
          name: key,
          value,
          status: statusMap[key] ?? true, // Use statusMap to determine active/inactive
        }))
        .filter((item) => item.status) // Only show active ones
    : [];

  const handleAddAgreement = async () => {
    if (newAgreement.trim()) {
      try {
        await axios.post("/api/company/add-agreement", {
          name: newAgreement,
        });
        toast.success("Successfully added agreement");
        setNewAgreement("");
        setModalOpen(false);
        queryClient.invalidateQueries(["agreements", id]);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to add agreement");
      }
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <PageFrame>
        <AgTable
          key={tableData.length}
          search={true}
          tableTitle={`${name}'s Agreement List`}
          buttonTitle={"Add Agreement"}
          handleClick={() => setModalOpen(true)}
          data={tableData}
          columns={agreementColumn}
        />
      </PageFrame>

      <MuiModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Agreement"
      >
        <div className="mb-2">
          <TextField
            label="Agreement Name"
            fullWidth
            size="small"
            value={newAgreement}
            onChange={(e) => setNewAgreement(e.target.value)}
          />
        </div>
        <UploadFileInput />
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
