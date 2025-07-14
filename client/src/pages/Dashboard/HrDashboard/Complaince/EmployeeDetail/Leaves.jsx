import React, { useState } from "react";
import AgTable from "../../../../../components/AgTable";
import BarGraph from "../../../../../components/graphs/BarGraph";
import CustomYAxis from "../../../../../components/graphs/CustomYAxis";
import WidgetSection from "../../../../../components/WidgetSection";
import useAxiosPrivate from "../../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import humanDate from "../../../../../utils/humanDateForamt";
import PrimaryButton from "../../../../../components/PrimaryButton";
import SecondaryButton from "../../../../../components/SecondaryButton";
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { Controller, useForm } from "react-hook-form";
import MuiModal from "../../../../../components/MuiModal";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { CircularProgress, MenuItem, TextField } from "@mui/material";
import dayjs from "dayjs";
import { toast } from "sonner";
import useAuth from "../../../../../hooks/useAuth";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import PageFrame from "../../../../../components/Pages/PageFrame";
import ThreeDotMenu from "../../../../../components/ThreeDotMenu";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import {
  noOnlyWhitespace,
  isAlphanumeric,
} from "../../../../../utils/validators";
import YearWiseTable from "../../../../../components/Tables/YearWiseTable";

const Leaves = () => {
  const axios = useAxiosPrivate();
  const id = useSelector((state) => state.hr.selectedEmployee);
  const queryClient = useQueryClient();
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      fromDate: null,
      toDate: null,
      leaveType: "",
      leavePeriod: null,
      hours: null,
      description: "",
    },
  });
  const [openModal, setOpenModal] = useState(false);
  const name = localStorage.getItem("employeeName") || "Employee";
  const { auth } = useAuth();

  const { data: leaves = [], isLoading } = useQuery({
    queryKey: ["leaves"],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/leaves/view-leaves/${id}`);
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const { mutate: correctionPost, isPending: correctionPending } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post("/api/leaves/request-leave", {
        ...data,
        empId: id,
      });
      return response.data;
    },
    onSuccess: function (data) {
      setOpenModal(false);
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      reset();
    },
    onError: function (error) {
      toast.error(error.response.data.message);
    },
  });

  // Approve & Reject Leave Mutations START

  const { mutate: approveLeave, isPending: isApproving } = useMutation({
    mutationFn: async (leaveId) => {
      const res = await axios.patch(`/api/leaves/approve-leave/${leaveId}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Leave Approved");
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Approval failed");
    },
  });

  const { mutate: rejectLeave, isPending: isRejecting } = useMutation({
    mutationFn: async (leaveId) => {
      const res = await axios.patch(`/api/leaves/reject-leave/${leaveId}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Leave Rejected");
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Rejection failed");
    },
  });

  // Approve & Reject Leave Mutations END

  const leavesColumn = [
    { field: "srNo", headerName: "Sr No" },
    { field: "fromDate", headerName: "From Date" },
    { field: "toDate", headerName: "To Date" },
    { field: "leaveType", headerName: "Leave Type" },
    { field: "leavePeriod", headerName: "Leave Period" },
    { field: "hours", headerName: "Hours" },
    { field: "description", headerName: "Description" },
    { field: "status", headerName: "Status" },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => {
        const status = params.data.status;
        const userRole = auth.user.role[0]?.roleTitle || "";

        const isAdmin =
          userRole === "Master Admin" ||
          userRole === "Super Admin" ||
          userRole.endsWith("Admin");

        // ✅ Don't show ThreeDotMenu if status is Approved/Rejected or user is not an admin
        if (["Approved", "Rejected"].includes(status) || !isAdmin) return null;

        return (
          <div className="flex items-center gap-2">
            <ThreeDotMenu
              rowId={params.data.id}
              menuItems={[
                ...(params.data.status === "Rejected"
                  ? [
                      {
                        label: "Approve",
                        onClick: () => approveLeave(params.data._id),
                        isLoading: isApproving,
                      },
                    ]
                  : []),
                ...(params.data.status === "Approved"
                  ? [
                      {
                        label: "Reject",
                        onClick: () => rejectLeave(params.data._id),
                        isLoading: isRejecting,
                      },
                    ]
                  : []),
                ...(params.data.status !== "Approved" &&
                params.data.status !== "Rejected"
                  ? [
                      {
                        label: "Approve",
                        onClick: () => approveLeave(params.data._id),
                        isLoading: isApproving,
                      },
                      {
                        label: "Reject",
                        onClick: () => rejectLeave(params.data._id),
                        isLoading: isRejecting,
                      },
                    ]
                  : []),
              ]}
            />
          </div>
        );
      },
    },
  ];

  const leavesData = {
    user: "Aiwin",
    allocated: 12,
    taken: 2,
    remaining: 10,
    monthlyData: [
      {
        month: "January",
        monthIndex: 1,
        year: 2025,
        privilegedLeaves: 1,
        sickLeaves: 1,
        casualLeaves: 0,
      },
    ],
  };

  const leaveType = ["Privileged", "Sick"];
  const leavePeriod = ["Partial", "Single", "Multiple"];
  const leaveData = [
    { type: "Sick Leave", allocated: 12, taken: 12 },
    { type: "Privileged Leave", allocated: 12, taken: 3 },
    { type: "Abrupt", allocated: 0, taken: 2 },
  ];

  function formatLeaveData(leaves) {
    // Define default allocations per type (update as needed)
    const defaultAllocations = {
      "Sick Leave": 12,
      "Privileged Leave": 12,
      Abrupt: 0, // If you allow tracking but no pre-allocation
    };

    const leaveMap = new Map();

    leaves.forEach((leave) => {
      const type = leave.leaveType;
      const taken = leave.leavePeriod === "Partial" ? leave.hours / 8 : 1; // Assuming 8 hours = 1 full day

      if (!leaveMap.has(type)) {
        leaveMap.set(type, {
          type,
          allocated: defaultAllocations[type] || 0,
          taken: 0,
        });
      }

      const current = leaveMap.get(type);
      current.taken += taken;
    });

    // Round to nearest 2 decimal places (optional)
    const leaveData = Array.from(leaveMap.values()).map((entry) => ({
      ...entry,
      taken: parseFloat(entry.taken.toFixed(2)),
    }));

    return leaveData;
  }

  const leavessData = useMemo(() => {
    if (isLoading || !leaves) return [];
    return formatLeaveData(leaves);
  }, [leaves, isLoading]);

  const months = leavesData.monthlyData.map((entry) => entry.month);

  const leaveCounts = useMemo(() => {
    const counts = {};
    for (const leave of leaves) {
      const type = leave.leaveType || "Unknown";
      counts[type] = (counts[type] || 0) + 1;
    }
    return counts;
  }, [leaves]);

  const chartSeries = [
    {
      name: "Leave Count",
      data: Object.values(leaveCounts),
    },
  ];

  const chartOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    plotOptions: {
      bar: {
        columnWidth: "20%", // ✅ Bar width
        borderRadius: 2, // ✅ Rounded corners
        dataLabels: {
          position: "top",
        },
      },
    },
    colors: ["#1E3D73"],
    dataLabels: {
      enabled: true,
      offsetY: -25, // ✅ Vertical offset for labels
      style: {
        fontSize: "12px",
        colors: ["#304758"],
      },
    },
    xaxis: {
      categories: Object.keys(leaveCounts),
      title: { text: "Leave Type" },
    },
    yaxis: {
      max: 12,
      title: { text: "Number of Leaves" },
      dataLabels: {
        positon: "top",
      },
    },
  };

  const onSubmit = (data) => {
    correctionPost(data);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <WidgetSection layout={1} title={"Leaves Data"} border>
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <CircularProgress />
            </div>
          ) : (
            <BarGraph
              chartId="leave-type-bar"
              data={chartSeries}
              options={chartOptions}
              height={350}
            />
          )}
        </WidgetSection>
      </div>
      <div>
        {/* <WidgetSection layout={1} title={"Leaves Data"} border>
          <CustomYAxis />
        </WidgetSection> */}
      </div>
      <div>
        <PageFrame>
          <YearWiseTable
            key={leaves.length}
            search={true}
            searchColumn={"Leave Type"}
            tableTitle={`${name}'s Leaves`}
            dateColumn={"fromDate"}
            buttonTitle={"Add Requested Leave"}
            handleSubmit={() => {
              setOpenModal(true);
            }}
            // data={[
            //   ...leaves.map((leave, index) => ({
            //     fromDate: leave.fromDate,
            //     toDate: humanDate(leave.toDate),
            //     leaveType: leave.leaveType,
            //     leavePeriod: leave.leavePeriod,
            //     hours: leave.hours,
            //     description: leave.description,
            //     status: leave.status,
            //   })),
            // ]}
            data={[
              ...leaves.map((leave, index) => ({
                _id: leave._id, // ✅ this is needed for Approve/Reject
                fromDate: leave.fromDate,
                toDate: humanDate(leave.toDate),
                leaveType: leave.leaveType,
                leavePeriod: leave.leavePeriod,
                hours: leave.hours,
                description: leave.description,
                status: leave.status,
              })),
            ]}
            columns={leavesColumn}
          />
        </PageFrame>
      </div>
      <MuiModal
        title={"Leave Request"}
        open={openModal}
        onClose={() => {
          setOpenModal(false);
        }}
      >
        <div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Controller
              name="fromDate"
              control={control}
              render={({ field }) => (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    {...field}
                    label={"From Date"}
                    format="DD-MM-YYYY"
                    disablePast // ✅ disables past dates
                    value={field.value ? dayjs(field.value) : null}
                    slotProps={{ textField: { size: "small" } }}
                    onChange={(date) => {
                      field.onChange(date ? date.toISOString() : null);
                    }}
                  />
                </LocalizationProvider>
              )}
            />

            <Controller
              name="toDate"
              control={control}
              render={({ field }) => (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    {...field}
                    label={"To Date"}
                    format="DD-MM-YYYY"
                    disablePast // ✅ disables past dates
                    value={field.value ? dayjs(field.value) : null}
                    slotProps={{ textField: { size: "small" } }}
                    onChange={(date) => {
                      field.onChange(date ? date.toISOString() : null);
                    }}
                  />
                </LocalizationProvider>
              )}
            />

            <Controller
              name="hours"
              control={control}
              rules={{
                required: "Hours is required",
                validate: {
                  noOnlyWhitespace,
                },
              }}
              render={({ field }) => (
                <TextField
                  size="small"
                  {...field}
                  label="Hours"
                  type="number"
                  // helperText={errors.quantity?.message}
                />
              )}
            />
            <Controller
              name="leaveType"
              control={control}
              defaultValue=""
              rules={{ required: "Leavetype is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  select
                  label="Leave type"
                  size="small"
                >
                  {leaveType.map((type) => (
                    <MenuItem key={leaveType.length} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="leavePeriod"
              control={control}
              defaultValue=""
              rules={{ required: "LeavePeriod is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  select
                  label="Leave period"
                  size="small"
                >
                  {leavePeriod.map((period) => (
                    <MenuItem key={leavePeriod.length} value={period}>
                      {period}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="description"
              rules={{
                required: "Please specify your description",
                validate: {
                  noOnlyWhitespace,
                  isAlphanumeric,
                },
              }}
              control={control}
              render={({ field }) => (
                <>
                  <TextField
                    {...field}
                    size="small"
                    label="Description"
                    fullWidth
                    error={!!errors.description}
                    helperText={errors?.description?.message}
                  />
                </>
              )}
            />

            <div className="flex items-center justify-center gap-4">
              <SecondaryButton
                title={"Cancel"}
                handleSubmit={() => {
                  setOpenModal(false);
                }}
              />
              <PrimaryButton
                title={"Submit"}
                type={"submit"}
                isLoading={correctionPending}
                disabled={correctionPending}
              />
            </div>
          </form>
        </div>
      </MuiModal>
    </div>
  );
};

export default Leaves;
