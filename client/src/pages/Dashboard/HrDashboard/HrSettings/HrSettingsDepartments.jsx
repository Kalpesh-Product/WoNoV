import { useMemo, useState } from "react";
import AgTable from "../../../../components/AgTable";
import { Chip, Skeleton, TextField } from "@mui/material";
import MuiModal from "../../../../components/MuiModal";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import PageFrame from "../../../../components/Pages/PageFrame";
import { noOnlyWhitespace, isAlphanumeric } from "../../../../utils/validators";
import PrimaryButton from "../../../../components/PrimaryButton";
import { FaRegCheckCircle, FaRegTimesCircle } from "react-icons/fa";
import { HiPencilSquare } from "react-icons/hi2";
import ConfirmationModal from "../../../../components/ConfirmationModal";

const createDepartmentId = (name) => {
  const normalized = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = Date.now().toString().slice(-4);
  return `DEPT-${normalized || "NEW"}-${suffix}`;
};

const HrSettingsDepartments = () => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [statusUpdatingDepartmentId, setStatusUpdatingDepartmentId] =
    useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      deptName: "",
    },
  });

  const { data: departments = [], isPending: departmentLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await axios.get("/api/departments/get-departments");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const { data: selectedDepartments = [] } = useQuery({
    queryKey: ["selectedDepartments"],
    queryFn: async () => {
      const response = await axios.get(
        "api/company/get-company-data?field=selectedDepartments",
      );
      return response.data?.selectedDepartments;
    },
  });

  const managerByDepartmentId = useMemo(() => {
    const map = new Map();
    selectedDepartments.forEach((item) => {
      const deptId = item?.department?._id;
      if (deptId) {
        map.set(deptId, item?.admin || "—");
      }
    });
    return map;
  }, [selectedDepartments]);

  const { mutate: addDepartment, isPending: isAddingDepartment } = useMutation({
    mutationKey: ["add-department"],
    mutationFn: async ({ deptName }) => {
      const payload = {
        deptName: deptName.trim(),
        deptId: createDepartmentId(deptName),
      };
      const response = await axios.post("/api/company/add-department", payload);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Department added");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["selectedDepartments"] });
      reset();
      setOpenModal(false);
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error.message;
      toast.error(message || "Failed to add department");
    },
  });

  const {
    mutate: markDepartmentStatus,
    isPending: isUpdatingDepartmentStatus,
  } = useMutation({
    mutationKey: ["mark-department-status"],
    mutationFn: async ({ departmentId, isActive }) => {
      const response = await axios.patch(
        "/api/company/mark-department-status",
        {
          departmentId,
          isActive,
        },
      );
      return response.data;
    },
    onMutate: ({ departmentId }) => {
      setStatusUpdatingDepartmentId(departmentId);
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Department status updated");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["selectedDepartments"] });
      setConfirmationAction(null);
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error.message;
      toast.error(message || "Failed to update department status");
    },
    onSettled: () => {
      setStatusUpdatingDepartmentId(null);
    },
  });

  const { mutate: editDepartment, isPending: isEditingDepartment } =
    useMutation({
      mutationKey: ["edit-department"],
      mutationFn: async ({ departmentId, deptName }) => {
        const response = await axios.patch("/api/company/edit-department", {
          departmentId,
          name: deptName.trim(),
        });
        return response.data;
      },
      onSuccess: (data) => {
        toast.success(data?.message || "Department updated");
        queryClient.invalidateQueries({ queryKey: ["departments"] });
        queryClient.invalidateQueries({ queryKey: ["selectedDepartments"] });
        reset();
        setSelectedDepartment(null);
        setOpenModal(false);
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message || "Failed to update department",
        );
      },
    });

  const handleOpenModal = () => {
    setModalType("add");
    setSelectedDepartment(null);
    reset({ deptName: "" });
    setOpenModal(true);
  };

  const handleOpenEdit = (department) => {
    setModalType("edit");
    setSelectedDepartment(department);
    reset({ deptName: department.departmentName });
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    reset();
    setOpenModal(false);
  };

  const onSubmit = (data) => {
    if (modalType === "edit") {
      editDepartment({
        departmentId: selectedDepartment.departmentId,
        deptName: data.deptName,
      });
      return;
    }
    addDepartment(data);
  };

  const handleStatus = (department) => {
    setConfirmationAction({ type: "status", department });
  };

  const confirmDepartmentAction = () => {
    const department = confirmationAction?.department;
    if (!department) return;

    markDepartmentStatus({
      departmentId: department.departmentId,
      isActive: !department.status,
    });
  };

  const confirmationContent = {
    status: {
      title: `Mark Department As ${
        confirmationAction?.department?.status ? "Inactive" : "Active"
      }`,
      message: `Are you sure you want to mark this department as ${
        confirmationAction?.department?.status ? "inactive" : "active"
      }?`,
    },
  }[confirmationAction?.type];

  const departmentsColumn = [
    { field: "id", headerName: "Sr No" },
    {
      field: "departmentName",
      headerName: "Department Name",
      cellRenderer: (params) => {
        return (
          <div>
            {/* <span className="text-primary cursor-pointer hover:underline"> */}
            <span className="">{params.value}</span>
          </div>
        );
      },
      flex: 1,
    },
    { field: "manager", headerName: "Manager",flex: 1, },
    {
      field: "status",
      headerName: "Status",
      sort: "desc",
      pinned: "right",
      cellRenderer: (params) => {
        const status = params.value ? "Active" : "Inactive";
        const statusColorMap = {
          Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
          Active: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
        };

        const { backgroundColor, color } = statusColorMap[status];
        return (
          <>
            <Chip
              label={status}
              style={{
                backgroundColor,
                color,
              }}
            />
          </>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      pinned: "right",
      sortable: false,
      filter: false,
      cellRenderer: (params) => {
        const isActive = Boolean(params.data.status);

        return (
          <div className="flex h-full items-center gap-2">
            <button
              type="button"
              title={`Mark department as ${isActive ? "inactive" : "active"}`}
              aria-label={`Mark department as ${isActive ? "inactive" : "active"}`}
              className={`flex h-8 w-8 items-center justify-center disabled:text-gray-400 ${
                isActive
                  ? "text-green-600 hover:text-green-700"
                  : "text-red-600 hover:text-red-700"
              }`}
              disabled={
                isUpdatingDepartmentStatus &&
                statusUpdatingDepartmentId === params.data.departmentId
              }
              onClick={() => handleStatus(params.data)}
            >
              {isActive ? (
                <FaRegCheckCircle size={24} />
              ) : (
                <FaRegTimesCircle size={24} />
              )}
            </button>
            <button
              type="button"
              title="Edit department"
              aria-label="Edit department"
              className="flex h-8 w-8 items-center justify-center text-black hover:text-primary"
              onClick={() => handleOpenEdit(params.data)}
            >
              <HiPencilSquare size={24} />
            </button>
          </div>
        );
      },
    },
  ];

  const tableData = departments.map((item, index) => ({
    id: index + 1,
    departmentId: item._id,
    departmentName: item.name,
    manager: managerByDepartmentId.get(item._id) || "—",
    status: item.isActive,
  }));

  return (
    <div className="flex flex-col gap-8">
      <PageFrame>
        <div>
          {!departmentLoading ? (
            <AgTable
              search={true}
              searchColumn={"Department Name"}
              tableTitle={"Department List"}
              // data={[
              //   ...fetchedDepartments.map((item, index) => ({
              //     id: index + 1,
              //     departmentName: item.department?.name,
              //     manager: item?.admin,
              //   })),
              // ]}
              buttonTitle={"Add Department"}
              handleClick={handleOpenModal}
              data={tableData}
              columns={departmentsColumn}
              exportData
            />
          ) : (
            <div className="flex flex-col gap-2">
              {/* Simulating chart skeleton */}
              <Skeleton variant="text" width={200} height={30} />
              <Skeleton variant="rectangular" width="100%" height={300} />
            </div>
          )}
        </div>
      </PageFrame>

      <MuiModal
        open={openModal}
        onClose={handleCloseModal}
        title={modalType === "edit" ? "Edit Department" : "Add Department"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Controller
            name="deptName"
            control={control}
            rules={{
              required: "Department name is required",
              validate: {
                noOnlyWhitespace,
                isAlphanumeric,
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                label="Department Name"
                fullWidth
                error={!!errors.deptName}
                helperText={errors.deptName?.message}
              />
            )}
          />

          <div className="flex justify-end">
            <PrimaryButton
              title={modalType === "edit" ? "Update Department" : "Add Department"}
              type="submit"
              handleSubmit={() => {}}
              isLoading={isAddingDepartment || isEditingDepartment}
              disabled={isAddingDepartment || isEditingDepartment}
              padding="px-4 py-2"
            />
          </div>
        </form>
      </MuiModal>

      <ConfirmationModal
        open={Boolean(confirmationAction)}
        title={confirmationContent?.title}
        message={confirmationContent?.message}
        confirmText="Yes"
        cancelText="No"
        isLoading={isUpdatingDepartmentStatus}
        onClose={() => setConfirmationAction(null)}
        onConfirm={confirmDepartmentAction}
      />
    </div>
  );
};

export default HrSettingsDepartments;
