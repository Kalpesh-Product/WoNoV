import { useEffect, useState } from "react";
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
import StatusChip from "../../../../../components/StatusChip";

const Agreements = () => {
  const axios = useAxiosPrivate();
  const id = useSelector((state) => state.hr.selectedEmployee);
  console.log("user id : ", id);
  const name = localStorage.getItem("employeeName") || "Employee";
  const queryClient = useQueryClient();

  const [modalMode, setModalMode] = useState("");
  const [selectedAgreement, setSelectedAgreement] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const {
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      agreementName: "",
      agreement: null,
    },
  });
  const {
    handleSubmit: handleEditSubmit,
    control: editControl,
    setValue: setEditValue,
    reset: editReset,
    formState: { errors: editErrors },
  } = useForm({
    defaultValues: {
      status: "",
    },
  });
  const [statusMap, setStatusMap] = useState({});

  const { data: employees = [], isLoading: isEmployeeLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/users/fetch-users");
        const filteredData = response.data.filter(
          (employee) => employee.isActive
        );
        return filteredData;
      } catch (error) {
        throw new Error(
          error.response?.data?.message || "Failed to fetch employees"
        );
      }
    },
  });

  const selectedEmployee = isEmployeeLoading
    ? []
    : employees.find((item) => item.empId === id);
  console.log("selected emp ; ", selectedEmployee);

  useEffect(() => {
    setEditValue("status", selectedAgreement?.isActive);
  }, [selectedAgreement]);

  const handleEdit = async (data) => {
    setModalMode("update");
    setSelectedAgreement(data);
    setModalOpen(true);
  };

  console.log("selected agreement : ", selectedAgreement);

  const { data: agreements = [], isLoading } = useQuery({
    queryKey: ["agreements", id],
    queryFn: async () => {
      const response = await axios.get(
        `/api/agreement/all-agreements/${selectedEmployee?._id}`
      );
      return response.data;
    },
  });

  const { mutate: addAgreement, isPending: isAddPending } = useMutation({
    mutationKey: ["addAgreement"],
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append("agreementName", data.agreementName);
      formData.append("agreement", data.agreement); // file object
      formData.append("userId", selectedEmployee?._id); // include employee ID if required
      console.log("form Data : ", formData);

      const response = await axios.post(
        "/api/agreement/add-agreement",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    },
    onSuccess: () => {
      toast.success("Agreement uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["agreements", id] });
      reset();
      setModalOpen(false);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to upload agreement"
      );
      console.error("Upload error:", error);
    },
  });
  const { mutate: updateStatus, isPending: isUpdatePending } = useMutation({
    mutationKey: ["updateStatus"],
    mutationFn: async (data) => {
      const response = await axios.patch(
        "/api/agreement/update-agreement-status",
        {
          ...data,
          agreementId: selectedAgreement?._id,
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "UPDATED");
      queryClient.invalidateQueries({ queryKey: ["agreements"] });
      setModalOpen(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update status");
    },
  });

  const agreementColumn = [
    {
      headerName: "Sr No",
      field: "srNo",
      maxWidth: 100,
    },
    {
      field: "name",
      headerName: "Agreement Type",
      flex: 1,
      cellRenderer: (params) => (
        <span
          onClick={() => window.open(params.data.url, "_blank")}
          className="text-primary underline hover:underline cursor-pointer"
        >
          {params.value}
        </span>
      ),
    },

    {
      field: "isActive",
      headerName: "Status",
      flex: 1,
      cellRenderer: (params) => {
        const status = params.value ? "Active" : "Inactive";
        return <StatusChip status={status} />;
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
            menuItems={[
              {
                label: "Update Status",
                onClick: () => handleEdit(params.data),
              },
            ]}
          />
        );
      },
    },
  ];

  const tableData = isLoading
    ? []
    : agreements.map((item) => ({
        ...item,
      }));

  return (
    <div className="flex flex-col gap-8">
      <PageFrame>
        <YearWiseTable
          key={tableData.length}
          search={true}
          tableTitle={`${name}'s Agreement List`}
          buttonTitle={"Add Agreement"}
          handleSubmit={() => {
            setModalMode("add");
            setModalOpen(true);
          }}
          data={tableData}
          dateColumn={"createdAt"}
          columns={agreementColumn}
        />
      </PageFrame>

      <MuiModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalMode === "add" ? "Add Agreement" : "Edit Agreement Status"}
      >
        {modalMode === "add" && (
          <form
            onSubmit={handleSubmit((data) => addAgreement(data))}
            className="grid grid-cols-1 gap-4"
          >
            <Controller
              name="agreementName"
              control={control}
              rules={{ required: "Agreement Name is Required" }}
              render={({ field }) => (
                <TextField
                  label="Agreement Name"
                  fullWidth
                  size="small"
                  {...field}
                  error={!!errors.agreementName}
                  helperText={errors?.agreementName?.message}
                />
              )}
            />
            <Controller
              name="agreement"
              control={control}
              rules={{ required: "Agreement is Required" }}
              render={({ field }) => (
                <UploadFileInput
                  allowedExtensions={["pdf", "docx"]}
                  previewType="pdf"
                  onChange={field.onChange}
                  value={field.value}
                />
              )}
            />
            <PrimaryButton
              type="submit"
              disabled={isAddPending}
              isLoading={isAddPending}
              title="Submit"
              className="w-full mt-2"
            />
          </form>
        )}
        {modalMode === "update" && (
          <form
            onSubmit={handleEditSubmit((data) => updateStatus(data))}
            className="grid grid-cols-1 gap-4"
          >
            <Controller
              name="status"
              control={editControl}
              rules={{ required: "Status is Required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  size="small"
                  label="Status"
                  error={!!editErrors.status}
                  helperText={editErrors?.status?.message}
                >
                  <MenuItem value="" disabled>
                    <em>Select a status</em>
                  </MenuItem>
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">InActive</MenuItem>
                </TextField>
              )}
            />
            <PrimaryButton title={"Update"} type={"submit"} />
          </form>
        )}
      </MuiModal>
    </div>
  );
};

export default Agreements;
