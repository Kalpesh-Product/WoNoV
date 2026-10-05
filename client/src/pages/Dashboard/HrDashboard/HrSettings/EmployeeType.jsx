import React, { useState } from "react";
import AgTable from "../../../../components/AgTable";
import { Chip, FormControl, MenuItem, Select, TextField } from "@mui/material";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import MuiModal from "../../../../components/MuiModal";
import ConfirmationModal from "../../../../components/ConfirmationModal";
import PrimaryButton from "../../../../components/PrimaryButton";
import { toast } from "sonner";
import PageFrame from "../../../../components/Pages/PageFrame";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import { HiPencilSquare } from "react-icons/hi2";
import { IoEyeOutline } from "react-icons/io5";
import { MdDeleteForever, MdOutlineRestore } from "react-icons/md";
import { useEffect } from "react";
import { queryClient } from "../../../../main";
import { noOnlyWhitespace, isAlphanumeric } from "../../../../utils/validators";
import { PERMISSIONS } from "../../../../constants/permissions";
import useAuth from "../../../../hooks/useAuth";
import useUserPermissions from "../../../../hooks/useUserPermissions";

const TECH_DEPARTMENT_ID = "6798ba9de469e809084e2494";

const EmployeeType = () => {
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedItem, setSelectedItem] = useState(null);
  const [confirmationAction, setConfirmationAction] = useState(null);
  const axios = useAxiosPrivate();

  const { auth } = useAuth();
  const { hasPermission } = useUserPermissions();
  const user = auth?.user;
  const isTechDepartment = user?.departments?.some(
    (department) =>
      String(department?._id || department) === TECH_DEPARTMENT_ID ||
      ["tech", "tech department"].includes(
        department?.name?.trim().toLowerCase(),
      ),
  );

  const hasAddEmployeeTypeAccess = hasPermission(
    PERMISSIONS.HR_ADD_EMPLOYEE_TYPE.value,
  );

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
    setConfirmationAction({
      type: isTechDepartment ? "permanent-delete" : "delete",
      item,
    });
  };

  const handleRestore = (item) => {
    setConfirmationAction({ type: "restore", item });
  };

  const handlePermanentDelete = (item) => {
    setConfirmationAction({ type: "permanent-delete", item });
  };

  const handleConfirmDelete = () => {
    const itemId = confirmationAction?.item?._id;
    if (!itemId) return;

    const payload = {
      type: "employeeTypes",
      itemId,
      action: confirmationAction.type,
    };
    updateEmployeeTypeMutation.mutate(payload);
  };

  const confirmationContent = {
    delete: {
      title: "Delete Employee Type",
      message: "Are you sure you want to delete this employee type?",
    },
    "permanent-delete": {
      title: "Permanently Delete Employee Type",
      message:
        "Are you sure you want to permanently delete this employee type?",
    },
    restore: {
      title: "Restore Employee Type",
      message: "Are you sure you want to restore this employee type?",
    },
  }[confirmationAction?.type];

  const { data: employeeTypes = [] } = useQuery({
    queryKey: ["employeeTypes", Boolean(isTechDepartment)],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/company/get-company-data/?field=employeeTypes${
            isTechDepartment ? "&includeDeleted=true" : ""
          }`,
        );
        return response.data.employeeTypes;
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
    onSuccess: (data) => {
      toast.success(data?.message || "Employee Type updated");
      queryClient.invalidateQueries({ queryKey: ["employeeTypes"] });
      setOpenModal(false);
      setConfirmationAction(null);
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
      sort: "desc",
      flex: 1,
      cellRenderer: (params) => {
        const status = params.data.isDeleted
          ? "Disabled"
          : params.value
            ? "Active"
            : "Inactive";
        const statusColorMap = {
          Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
          Active: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
          Disabled: { backgroundColor: "#D3D3D3", color: "#666666" },
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
      width: 180,
      sortable: false,
      filter: false,
      cellRenderer: (params) => {
        const isDeleted = params.data.isDeleted;

        return (
          <div className="flex h-full items-center gap-2">
            <button
              type="button"
              title="View employee type"
              aria-label="View employee type"
              className="flex h-8 w-8 items-center justify-center text-black hover:text-primary"
              onClick={() => handleView(params.data)}
            >
              <IoEyeOutline size={24} />
            </button>

            {isDeleted ? (
              <>
                <button
                  type="button"
                  title="Restore employee type"
                  aria-label="Restore employee type"
                  className="flex h-8 w-8 items-center justify-center text-black hover:text-primary"
                  onClick={() => handleRestore(params.data)}
                >
                  <MdOutlineRestore size={24} />
                </button>
                <button
                  type="button"
                  title="Permanently delete employee type"
                  aria-label="Permanently delete employee type"
                  className="flex h-8 w-8 items-center justify-center text-red-600 hover:text-red-700"
                  onClick={() => handlePermanentDelete(params.data)}
                >
                  <MdDeleteForever size={24} />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  title="Edit employee type"
                  aria-label="Edit employee type"
                  className="flex h-8 w-8 items-center justify-center text-black hover:text-primary"
                  onClick={() => handleEdit(params.data)}
                >
                  <HiPencilSquare size={24} />
                </button>
                <button
                  type="button"
                  title={isTechDepartment ? "Permanently delete employee type" : "Delete employee type"}
                  aria-label={isTechDepartment ? "Permanently delete employee type" : "Delete employee type"}
                  className="flex h-8 w-8 items-center justify-center text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(params.data)}
                >
                  <MdDeleteForever size={24} />
                </button>
              </>
            )}
          </div>
        );
      },
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
          buttonDisabled={!hasAddEmployeeTypeAccess}
          handleClick={handleAddType}
          data={[
            ...employeeTypes.map((type, index) => ({
              id: index + 1,
              name: type.name,
              status: type.isActive,
              isDeleted: Boolean(type.isDeleted),
              deletedByName: type.deletedBy
                ? [type.deletedBy.firstName, type.deletedBy.lastName]
                    .filter(Boolean)
                    .join(" ") ||
                  type.deletedBy.employeeName ||
                  type.deletedBy.name ||
                  type.deletedBy.email ||
                  "N/A"
                : "N/A",
              _id: type._id,
            })),
          ]}
          columns={departmentsColumn}
          getRowStyle={(params) =>
            params.data?.isDeleted
              ? { backgroundColor: "#f4f4f4", color: "#7a7a7a" }
              : undefined
          }
          exportData
        />

        <MuiModal
          open={openModal}
          title={
            modalMode === "add"
              ? "Add Employee Type"
              : modalMode === "edit"
                ? "Edit Employee Type"
                : "Employee Type Details"
          }
          onClose={() => setOpenModal(false)}
        >
          {modalMode === "view" ? (
            <div className="grid max-h-[70vh] grid-cols-1 gap-4 overflow-y-auto">
              <DetalisFormatted
                title="Employee Type"
                detail={selectedItem?.name || "N/A"}
              />
              <DetalisFormatted
                title="Status"
                detail={
                  selectedItem?.isDeleted
                    ? "Disabled"
                    : selectedItem?.status
                      ? "Active"
                      : "Inactive"
                }
              />
              {selectedItem?.isDeleted && (
                <DetalisFormatted
                  title="Deleted By"
                  detail={selectedItem.deletedByName || "N/A"}
                />
              )}
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

        <ConfirmationModal
          open={Boolean(confirmationAction)}
          title={confirmationContent?.title}
          message={confirmationContent?.message}
          confirmText="Yes"
          cancelText="No"
          isLoading={updateEmployeeTypeMutation.isPending}
          onClose={() => setConfirmationAction(null)}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </PageFrame>
  );
};

export default EmployeeType;
