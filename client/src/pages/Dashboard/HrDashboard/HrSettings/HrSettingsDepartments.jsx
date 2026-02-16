import React, { useMemo, useState } from "react";
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
import ThreeDotMenu from "../../../../components/ThreeDotMenu";

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
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error.message;
      toast.error(message || "Failed to update department status");
    },
    onSettled: () => {
      setStatusUpdatingDepartmentId(null);
    },
  });

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    reset();
    setOpenModal(false);
  };

  const onSubmit = (data) => addDepartment(data);

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
    { field: "manager", headerName: "Manager" },
    {
      field: "status",
      headerName: "Status",
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
      cellRenderer: (params) => {
        const isActive = Boolean(params.data.status);

        return (
          <ThreeDotMenu
            rowId={params.data.id}
            disabled={statusUpdatingDepartmentId === params.data.departmentId}
            menuItems={[
              {
                label: isActive ? "Mark As Inactive" : "Mark As Active",
                onClick: () =>
                  markDepartmentStatus({
                    departmentId: params.data.departmentId,
                    isActive: !isActive,
                  }),
                disabled:
                  isUpdatingDepartmentStatus &&
                  statusUpdatingDepartmentId === params.data.departmentId,
              },
            ]}
          />
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
        title={"Add Department"}
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
              title="Add Department"
              type="submit"
              handleSubmit={() => {}}
              isLoading={isAddingDepartment}
              padding="px-4 py-2"
            />
          </div>
        </form>
      </MuiModal>
    </div>
  );
};

export default HrSettingsDepartments;
