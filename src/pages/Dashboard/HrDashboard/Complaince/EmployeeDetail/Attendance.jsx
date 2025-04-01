import React, { useState } from "react";
import WidgetSection from "../../../../../components/WidgetSection";
import AgTable from "../../../../../components/AgTable";
import { toast } from "sonner";
import BarGraph from "../../../../../components/graphs/BarGraph";
import DataCard from "../../../../../components/DataCard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../../hooks/useAxiosPrivate";
import { useLocation, useParams } from "react-router-dom";
import MuiModal from "../../../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import humanDate from "../../../../../utils/humanDateForamt";
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import SecondaryButton from "../../../../../components/SecondaryButton";
import PrimaryButton from "../../../../../components/PrimaryButton";
import { TextField } from "@mui/material";

const Attendance = () => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { control, reset, handleSubmit } = useForm({
    defaultValues: {
      targetedDay: null,
      inTime: null,
      outTime: null,
    },
  });
  const [openModal, setOpenModal] = useState(false);
  const { id } = useParams();
  const name = localStorage.getItem("employeeName") || "Employee";

  const fetchAttendance = async () => {
    try {
      const response = await axios.get(`/api/attendance/get-attendance/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response.data.message);
    }
  };

  const { data: attendance, isLoading } = useQuery({
    queryKey: ["attendance"],
    queryFn: fetchAttendance,
  });

  const { mutate: correctionPost, isPending: correctionPending } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.patch("/api/attendance/correct-attendance", {...data,empId:id});
      return response.data;
    },
    onSuccess: function (data) {
      setOpenModal(false);
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      reset();
    },
    onError: function (error) {
      toast.error(error.response.data.message);
    },
  });
  const attendanceColumns = [
    { field: "date", headerName: "Date", width: 200 },
    { field: "inTime", headerName: "In Time" },
    { field: "outTime", headerName: "Out Time" },
    { field: "workHours", headerName: "Work Hours" },
    { field: "breakHours", headerName: "Break Hours" },

    { field: "totalHours", headerName: "Total Hours" },
    { field: "entryType", headerName: "Entry Type" },
  ];
  const rows = [
    {
      id: 1,
      date: "2025-01-20",
      inTime: "09:00 AM",
      outTime: "05:30 PM",
      workHours: "8h 30m",
      breakHours: "1h",
      totalHours: "9h 30m",
      entryType: "Biometric",
      status: "Sync",
    },
    {
      id: 2,
      date: "2025-01-19",
      inTime: "09:15 AM",
      outTime: "05:45 PM",
      workHours: "8h 15m",
      breakHours: "45m",
      totalHours: "9h",
      entryType: "Manual",
      status: "Sync",
    },
    {
      id: 3,
      date: "2025-01-18",
      inTime: "09:00 AM",
      outTime: "05:00 PM",
      workHours: "8h",
      breakHours: "1h",
      totalHours: "9h",
      entryType: "Biometric",
      status: "Sync",
    },
    {
      id: 4,
      date: "2025-01-17",
      inTime: "09:30 AM",
      outTime: "06:00 PM",
      workHours: "8h 30m",
      breakHours: "1h",
      totalHours: "9h 30m",
      entryType: "Biometric",
      status: "Sync",
    },
    {
      id: 5,
      date: "2025-01-16",
      inTime: "09:00 AM",
      outTime: "05:30 PM",
      workHours: "8h 30m",
      breakHours: "30m",
      totalHours: "9h",
      entryType: "Manual",
      status: "Sync",
    },
  ];

  //Attendance graph options

  const attendanceData = [
    {
      date: "01-01-2025",
      inTime: "9:45 AM",
      outTime: "6:30 PM",
      sections: [
        { color: "#d3d3d3", value: 0.25 }, // Gray (15 minutes)
        { color: "#34a853", value: 8.25 }, // Green (495 minutes)
        { color: "#ff0000", value: 0.5 }, // Red (30 minutes)
      ],
    },
    {
      date: "02-01-2025",
      inTime: "10:00 AM",
      outTime: "6:15 PM",
      sections: [
        { color: "#d3d3d3", value: 0.5 }, // Gray (30 minutes)
        { color: "#34a853", value: 7.75 }, // Green (465 minutes)
        { color: "#ff0000", value: 0.75 }, // Red (45 minutes)
      ],
    },
    {
      date: "03-01-2025",
      inTime: "9:30 AM",
      outTime: "6:30 PM",
      sections: [
        { color: "#d3d3d3", value: 0 }, // Gray (0 minutes)
        { color: "#34a853", value: 9 }, // Green (540 minutes)
        { color: "#ff0000", value: 0 }, // Red (0 minutes)
      ],
    },
    {
      date: "04-01-2025",
      inTime: "9:50 AM",
      outTime: "6:20 PM",
      sections: [
        { color: "#d3d3d3", value: 0.3 }, // Gray (18 minutes)
        { color: "#34a853", value: 8 }, // Green (480 minutes)
        { color: "#ff0000", value: 0.5 }, // Red (30 minutes)
      ],
    },
    {
      date: "06-01-2025",
      inTime: "10:05 AM",
      outTime: "6:10 PM",
      sections: [
        { color: "#d3d3d3", value: 0.4 }, // Gray (24 minutes)
        { color: "#34a853", value: 7.5 }, // Green (450 minutes)
        { color: "#ff0000", value: 1 }, // Red (60 minutes)
      ],
    },
    {
      date: "07-01-2025",
      inTime: "9:30 AM",
      outTime: "6:30 PM",
      sections: [
        { color: "#d3d3d3", value: 0 }, // Gray (0 minutes)
        { color: "#34a853", value: 9 }, // Green (540 minutes)
        { color: "#ff0000", value: 0 }, // Red (0 minutes)
      ],
    },
    {
      date: "08-01-2025",
      inTime: "9:40 AM",
      outTime: "6:25 PM",
      sections: [
        { color: "#d3d3d3", value: 0.2 }, // Gray (12 minutes)
        { color: "#34a853", value: 8.5 }, // Green (510 minutes)
        { color: "#ff0000", value: 0.3 }, // Red (18 minutes)
      ],
    },
    {
      date: "09-01-2025",
      inTime: "9:55 AM",
      outTime: "6:15 PM",
      sections: [
        { color: "#d3d3d3", value: 0.4 }, // Gray (24 minutes)
        { color: "#34a853", value: 7.75 }, // Green (465 minutes)
        { color: "#ff0000", value: 0.85 }, // Red (51 minutes)
      ],
    },
    {
      date: "10-01-2025",
      inTime: "9:30 AM",
      outTime: "6:45 PM",
      sections: [
        { color: "#d3d3d3", value: 0.1 }, // Gray (6 minutes)
        { color: "#34a853", value: 8.75 }, // Green (525 minutes)
        { color: "#ff0000", value: 0.15 }, // Red (9 minutes)
      ],
    },
    {
      date: "11-01-2025",
      inTime: "10:00 AM",
      outTime: "6:00 PM",
      sections: [
        { color: "#d3d3d3", value: 0.6 }, // Gray (36 minutes)
        { color: "#34a853", value: 7.25 }, // Green (435 minutes)
        { color: "#ff0000", value: 1.15 }, // Red (69 minutes)
      ],
    },
    {
      date: "13-01-2025",
      inTime: "9:45 AM",
      outTime: "6:30 PM",
      sections: [
        { color: "#d3d3d3", value: 0.25 }, // Gray (15 minutes)
        { color: "#34a853", value: 8.25 }, // Green (495 minutes)
        { color: "#ff0000", value: 0.5 }, // Red (30 minutes)
      ],
    },
    {
      date: "14-01-2025",
      inTime: "9:35 AM",
      outTime: "6:40 PM",
      sections: [
        { color: "#d3d3d3", value: 0.2 }, // Gray (12 minutes)
        { color: "#34a853", value: 8.75 }, // Green (525 minutes)
        { color: "#ff0000", value: 0.05 }, // Red (3 minutes)
      ],
    },
    {
      date: "15-01-2025",
      inTime: "10:10 AM",
      outTime: "6:20 PM",
      sections: [
        { color: "#d3d3d3", value: 0.5 }, // Gray (30 minutes)
        { color: "#34a853", value: 7.5 }, // Green (450 minutes)
        { color: "#ff0000", value: 1 }, // Red (60 minutes)
      ],
    },
    {
      date: "16-01-2025",
      inTime: "9:45 AM",
      outTime: "6:30 PM",
      sections: [
        { color: "#d3d3d3", value: 0.25 }, // Gray (15 minutes)
        { color: "#34a853", value: 8.25 }, // Green (495 minutes)
        { color: "#ff0000", value: 0.5 }, // Red (30 minutes)
      ],
    },
    {
      date: "17-01-2025",
      inTime: "9:50 AM",
      outTime: "6:10 PM",
      sections: [
        { color: "#d3d3d3", value: 0.4 }, // Gray (24 minutes)
        { color: "#34a853", value: 7.5 }, // Green (450 minutes)
        { color: "#ff0000", value: 1 }, // Red (60 minutes)
      ],
    },
  ];

  const attendanceSeries = [
    {
      name: "Gray (Late Check-In)",
      data: attendanceData.map((entry) => entry.sections[0].value), // Gray section values
      color: "#d3d3d3",
    },
    {
      name: "Green (Completed)",
      data: attendanceData.map((entry) => entry.sections[1].value), // Green section values
      color: "#34a853",
    },
    {
      name: "Red (Remaining)",
      data: attendanceData.map((entry) => entry.sections[2].value), // Red section values
      color: "#ff0000",
    },
  ];

  const options = {
    chart: {
      type: "bar",
      stacked: true,
      fontFamily: "Poppins-Regular",
      toolbar: {
        show: true,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "70%",
        borderRadius: 2,
      },
    },
    xaxis: {
      categories: attendanceData.map((entry) => entry.date.split("-")[0]), // Extract only the day (DD)
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },

    yaxis: {
      min: 0,
      max: 9, // Maximum set to 9 hours
      tickAmount: 9, // 9 ticks for 0 to 9 hours
      labels: {
        formatter: (value) => `${value} hr`, // Display as whole hours
      },
    },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex }) {
        const gray = attendanceData[dataPointIndex].sections[0].value;
        const green = attendanceData[dataPointIndex].sections[1].value;
        const red = attendanceData[dataPointIndex].sections[2].value;

        // Helper function to format hours and minutes
        const formatTime = (hours) => {
          const h = Math.floor(hours);
          const m = Math.round((hours - h) * 60);
          if (h === 0 && m > 0) return `${m}m`; // Only minutes
          if (m === 0) return `${h}h`; // Only hours
          return `${h}h ${m}m`; // Hours and minutes
        };

        return `
          <div style="padding: 10px; font-size: 12px; display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; gap: 2rem;">
              <div style="text-align: start;"><strong>Date</strong></div>
              <div style="text-align: end;">${
                attendanceData[dataPointIndex].date
              }</div>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 2rem;">
              <div style="text-align: start;"><strong>Late Check-In</strong></div>
              <div style="text-align: end;">${formatTime(gray)}</div>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 2rem;">
              <div style="text-align: start;"><strong>Completed</strong></div>
              <div style="text-align: end;">${formatTime(green)}</div>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 2rem;">
              <div style="text-align: start;"><strong>Remaining</strong></div>
              <div style="text-align: end;">${formatTime(red)}</div>
            </div>
          </div>
        `;
      },
    },

    dataLabels: {
      enabled: true,
      formatter: function (value) {
        // Helper function to format hours and minutes
        const h = Math.floor(value);
        const m = Math.round((value - h) * 60);
        if (h === 0 && m > 0) return `${m}m`; // Only minutes
        if (m === 0) return `${h}h`; // Only hours
        return `${h}h ${m}m`; // Hours and minutes
      },
      style: {
        fontSize: "12px",
        colors: ["#ffff"], // Adjust the color of data labels if needed
      },
    },

    legend: {
      position: "top",
    },
  };

  const onSubmit = (data) => {
    correctionPost(data);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <WidgetSection layout={3} padding>
          <DataCard data={"18"} title={"Accurate Checkins"} />
          <DataCard data={"8"} title={"Late Checkins"} />
          <DataCard data={"10"} title={"Late Checkouts"} />
        </WidgetSection>
      </div>
      <div className="border-default border-borderGray rounded-md">
        <WidgetSection layout={1} title={"Current Month"}>
          <BarGraph data={attendanceSeries} options={options} />
        </WidgetSection>
      </div>

      <div>
        <AgTable
          key={isLoading ? 1 : attendance.length}
          tableTitle={`${name}'s Attendance Table`}
          buttonTitle={"Correction Request"}
          handleClick={() => {
            setOpenModal(true);
          }}
          search={true}
          searchColumn={"Date"}
          data={
            isLoading
              ? [
                  {
                    id: "loading",
                    date: "Loading...",
                    inTime: "-",
                    outTime: "-",
                    workHours: "-",
                    breakHours: "-",
                    totalHours: "-",
                    entryType: "-",
                  },
                ]
              : attendance.map((record, index) => ({
                  id: index + 1,
                  date: humanDate(record.date),
                  inTime: record.inTime,
                  outTime: record.outTime,
                  workHours: record.workHours,
                  breakHours: record.breakHours,
                  totalHours: record.totalHours,
                  entryType: record.entryType,
                }))
          }
          columns={attendanceColumns}
        />
      </div>
      <MuiModal
        title={"Correction Request"}
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
              name="targetedDay"
              control={control}
              render={({ field }) => (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    {...field}
                    label={"Select Date"}
                    format="DD-MM-YYYY"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date) => {
                      field.onChange(date ? date.toISOString() : null);
                    }}
                  />
                </LocalizationProvider>
              )}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="inTime"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    {...field}
                    label={"Select In-Time"}
                    slotProps={{ textField: { size: "small" } }}
                    render={(params) => <TextField {...params} fullWidth />}
                  />
                )}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="outTime"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    {...field}
                    label={"Select Out-Time"}
                    slotProps={{ textField: { size: "small" } }}
                    render={(params) => <TextField {...params} fullWidth />}
                  />
                )}
              />
            </LocalizationProvider>

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

export default Attendance;
