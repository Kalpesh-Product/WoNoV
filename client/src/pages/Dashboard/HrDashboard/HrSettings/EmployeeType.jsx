import React, { useState } from "react";
import AgTable from "../../../../components/AgTable";
import { Chip, FormControl, MenuItem, Select, TextField } from "@mui/material";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import MuiModal from "../../../../components/MuiModal";
import PrimaryButton from "../../../../components/PrimaryButton";
import SecondaryButton from "../../../../components/SecondaryButton";
import { toast } from "sonner";
import PageFrame from "../../../../components/Pages/PageFrame";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { useEffect } from "react";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import { queryClient } from "../../../../main";
import { noOnlyWhitespace, isAlphanumeric } from "../../../../utils/validators";
import DangerButton from "../../../../components/DangerButton";

const EmployeeType = () => {
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedItem, setSelectedItem] = useState(null);
  const axios = useAxiosPrivate();

  const {
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      employeeType: "",
      isActive: true,
    },
    mode: "onChange",
  });

  const handleAddType = () => {
    setModalMode("add");
    reset({
      employeeType: "",
      isActive: "true",
    });
    setOpenModal(true);
  };

  const handleView = (item) => {
    setModalMode("view");
    setSelectedItem(item);
    setOpenModal(true);
  };

  const handleEdit = (item) => {
    setModalMode("edit");
    setSelectedItem(item);
    setOpenModal(true);
  };

  const handleDelete = (item) => {
    setModalMode("delete");
    setSelectedItem(item);
    setOpenModal(true);
  };

  const handleConfirmDelete = () => {
    const payload = {
      type: "employeeTypes",
      itemId: selectedItem._id,
      isDeleted: true,
    };
    updateEmployeeTypeMutation.mutate(payload);
  };

  const { data: employeeTypes = [] } = useQuery({
    queryKey: ["employeeTypes"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "/api/company/get-company-data/?field=employeeTypes"
        );
        const filteredEmployeeTypes = response.data.employeeTypes.filter(
          (emp) => !emp.isDeleted
        );
        return filteredEmployeeTypes;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const addEmployeeTypeMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post(
        `/api/company/add-employee-type`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Employee Type added");
      queryClient.invalidateQueries(["employeeTypes"]);
      setOpenModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Addition failed");
    },
  });

  const updateEmployeeTypeMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.patch(
        `/api/company/update-company-data`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Employee Type updated");
      queryClient.invalidateQueries({ queryKey: ["employeeTypes"] });
      setOpenModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Update failed");
    },
  });

  const departmentsColumn = [
    { field: "id", headerName: "Sr No" },
    {
      field: "name",
      headerName: "Employee Type",
      cellRenderer: (params) => {
        return (
          <div>
            <span className="">{params.value}</span>
          </div>
        );
      },
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      cellRenderer: (params) => {
        const status = params.value ? "Active" : "Inactive"; // Map boolean to string status
        const statusColorMap = {
          Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
          Active: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
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
      cellRenderer: (params) => (
        <>
          <div className="p-2 mb-2 flex gap-2">
            <ThreeDotMenu
              rowId={params.data.id}
              menuItems={[
                {
                  label: "View",
                  onClick: () => handleView(params.data),
                },
                {
                  label: "Edit",
                  onClick: () => handleEdit(params.data),
                },
                {
                  label: "Delete",
                  onClick: () => handleDelete(params.data),
                },
              ]}
            />
          </div>
        </>
      ),
    },
  ];

  const onSubmit = (data) => {
    if (modalMode === "edit") {
      const payload = {
        name: data.employeeType,
        isActive: data.isActive === "true",
        type: "employeeTypes",
        itemId: selectedItem._id,
      };
      updateEmployeeTypeMutation.mutate(payload);
    } else {
      const payload = {
        employeeType: data.employeeType,
      };
      addEmployeeTypeMutation.mutate(payload);
    }
  };

  useEffect(() => {
    if (modalMode === "edit" && selectedItem) {
      setValue("employeeType", selectedItem?.name || "");
      setValue("isActive", selectedItem?.status?.toString());
    }
  }, [modalMode, selectedItem, setValue]);

  return (
    <PageFrame>
      <div>
        <AgTable
          search={true}
          searchColumn={"Employee Type"}
          tableTitle={"Employee Type List"}
          buttonTitle={"Add Employee Type"}
          handleClick={handleAddType}
          data={[
            ...employeeTypes.map((type, index) => ({
              id: index + 1,
              name: type.name,
              status: type.isActive,
              _id: type._id,
            })),
          ]}
          columns={departmentsColumn}
        />

        <MuiModal
          open={openModal}
          title={
            modalMode === "add"
              ? "Add Employee Type"
              : modalMode === "edit"
              ? "Edit Employee Type"
              : modalMode === "delete"
              ? "Confirm Delete"
              : "Employee Type Details"
          }
          onClose={() => setOpenModal(false)}
        >
          {modalMode === "view" ? (
            <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[70vh]">
              <DetalisFormatted
                title="Employee Type"
                detail={selectedItem?.name || "N/A"}
              />
              <DetalisFormatted
                title="Status"
                detail={selectedItem?.status ? "Active" : "Inactive"}
              />
            </div>
          ) : modalMode === "delete" ? (
            <div className="space-y-4">
              <p>
                Are you sure you want to delete <b>{selectedItem?.name}</b>?
              </p>
              <div className="flex gap-4 justify-end">
                <SecondaryButton
                  title="Cancel"
                  handleSubmit={() => setOpenModal(false)}
                />
                <DangerButton
                  title="Confirm Delete"
                  handleSubmit={handleConfirmDelete}
                />
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <Controller
                name="employeeType"
                control={control}
                rules={{
                  required: "please provide an employee type",
                  validate: { isAlphanumeric, noOnlyWhitespace },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Enter Employee Type"
                    fullWidth
                    error={!!errors.employeeType}
                    helperText={errors.employeeType?.message}
                  />
                )}
              />

              {modalMode === "edit" && (
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <Select {...field} size="small" displayEmpty>
                        <MenuItem value="" disabled>
                          Select Active Status
                        </MenuItem>
                        <MenuItem value="true">Yes</MenuItem>
                        <MenuItem value="false">No</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              )}

              <PrimaryButton
                title={modalMode === "add" ? "Add" : "Update"}
                type="submit"
              />
            </form>
          )}
        </MuiModal>
      </div>
    </PageFrame>
  );
};

export default EmployeeType;
