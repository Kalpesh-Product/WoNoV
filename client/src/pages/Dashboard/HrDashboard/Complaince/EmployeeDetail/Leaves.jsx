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
import { MenuItem, TextField } from "@mui/material";
import dayjs from "dayjs";
import { toast } from "sonner";
import useAuth from "../../../../../hooks/useAuth";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import MonthWiseTable from "../../../../../components/Tables/MonthWiseTable";
import PageFrame from "../../../../../components/Pages/PageFrame";

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

  const leavesColumn = [
    { field: "id", headerName: "Sr No", sort: "desc" },
    { field: "fromDate", headerName: "From Date" },
    { field: "toDate", headerName: "To Date" },
    { field: "leaveType", headerName: "Leave Type" },
    { field: "leavePeriod", headerName: "Leave Period" },
    { field: "hours", headerName: "Hours" },
    { field: "description", headerName: "Description" },
    { field: "status", headerName: "Status" },
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

  // Prepare data for ApexCharts

  // const options = {
  //   chart: {
  //     type: 'bar',
  //   },
  //   xaxis: {
  //     categories: ['Privileged Leaves', 'Sick Leaves', 'Abrupt Leaves']
  //   }
  // };

  // Series data (stacked bar with allocated vs taken)
  // const series = [
  //   {
  //     name: "Privileged Leaves (Taken)",
  //     data: leavesData.monthlyData.map((entry) => entry.privilegedLeaves),
  //     color: "#FF4560", // Red for taken leaves
  //   },
  //   {
  //     name: "Privileged Leaves (Remaining)",
  //     data: leavesData.monthlyData.map((entry) =>
  //       Math.max(leavesData.allocated / 3 - entry.privilegedLeaves, 0)
  //     ),
  //     color: "#00E396", // Green for remaining allocation
  //   },
  //   {
  //     name: "Sick Leaves (Taken)",
  //     data: leavesData.monthlyData.map((entry) => entry.sickLeaves),
  //     color: "#775DD0", // Purple for taken leaves
  //   },
  //   {
  //     name: "Sick Leaves (Remaining)",
  //     data: leavesData.monthlyData.map((entry) =>
  //       Math.max(leavesData.allocated / 3 - entry.sickLeaves, 0)
  //     ),
  //     color: "#4CAF50", // Green for remaining allocation
  //   },
  //   {
  //     name: "Casual Leaves (Taken)",
  //     data: leavesData.monthlyData.map((entry) => entry.casualLeaves),
  //     color: "#FBC02D", // Yellow for taken leaves
  //   },
  //   {
  //     name: "Casual Leaves (Remaining)",
  //     data: leavesData.monthlyData.map((entry) =>
  //       Math.max(leavesData.allocated / 3 - entry.casualLeaves, 0)
  //     ),
  //     color: "#29B6F6", // Blue for remaining allocation
  //   },
  // ];

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

  console.log("leavesData", leavessData);
  const months = leavesData.monthlyData.map((entry) => entry.month);

  const series = [
    {
      name: "Leaves Taken",
      data: leaveData.map((entry) => ({
        x: entry.type,
        y: entry.taken,
        fillColor: entry.taken <= entry.allocated ? "#54C4A7" : "#FF4D4F", // Green or Red
        allocated: entry.allocated,
      })),
    },
  ];

  const options = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "20%",
        distributed: true,
        borderRadius: 3,
      },
    },
    xaxis: {
      title: {
        text: "",
      },
      labels: {
        style: {
          fontSize: "14px",
        },
      },
    },
    yaxis: {
      max: 12,
      title: {
        text: "Number of Leaves",
      },
      labels: {
        style: {
          fontSize: "14px",
        },
      },
    },
    colors: leaveData.map((entry) =>
      entry.taken <= entry.allocated ? "#54C4A7" : "#FF4D4F"
    ),
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const data = w.config.series[seriesIndex].data[dataPointIndex];
        return `
          <div style="padding: 8px;">
            <strong>Type:</strong> ${data.x}<br/>
            <strong>Allocated:</strong> ${data.allocated}<br/>
            <strong>Taken:</strong> ${data.y}
          </div>
        `;
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "12px",
        colors: ["#fff"],
      },
      formatter: function (val) {
        return `${val} leave${val > 1 ? "s" : ""}`;
      },
    },
    legend: { show: false },
  };

  const onSubmit = (data) => {
    correctionPost(data);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <WidgetSection layout={1} title={"Leaves Data"} border>
          <BarGraph data={series} options={options} />
        </WidgetSection>
      </div>
      <div>
        {/* <WidgetSection layout={1} title={"Leaves Data"} border>
          <CustomYAxis />
        </WidgetSection> */}
      </div>
      <div>
        <PageFrame>
          <MonthWiseTable
            key={leaves.length}
            search={true}
            searchColumn={"Leave Type"}
            tableTitle={`${name}'s Leaves`}
            buttonTitle={"Add Requested Leave"}
            handleClick={() => {
              setOpenModal(true);
            }}
            data={[
              ...leaves.map((leave, index) => ({
                id: index + 1,
                fromDate: humanDate(leave.fromDate),
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
        }}>
        <div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4">
            <Controller
              name="fromDate"
              control={control}
              render={({ field }) => (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    {...field}
                    label={"From Date"}
                    format="DD-MM-YYYY"
                    value={field.value ? dayjs(field.value) : null}
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
                    value={field.value ? dayjs(field.value) : null}
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
              rules={{ required: "Hours is required" }}
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
                  size="small">
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
                  size="small">
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
              rules={{ required: "Please specify your description" }}
              control={control}
              render={({ field }) => (
                <>
                  <TextField {...field} size="small" label="Description" />
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
