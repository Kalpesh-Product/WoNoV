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
import { CircularProgress, Skeleton, TextField } from "@mui/material";
import humanTime from "../../../../../utils/humanTime";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { formatDuration } from "../../../../../utils/dateFormat";
import {
  isAlphanumeric,
  noOnlyWhitespace,
} from "../../../../../utils/validators";
import YearWiseTable from "../../../../../components/Tables/YearWiseTable";
import PageFrame from "../../../../../components/Pages/PageFrame";

const Attendance = () => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      targetedDay: null,
      inTime: null,
      outTime: null,
      reason: "",
    },
  });
  const [openModal, setOpenModal] = useState(false);
  const employmentID = useSelector((state) => state.hr.selectedEmployee);
  const name = localStorage.getItem("employeeName") || "Employee";

  const fetchAttendance = async () => {
    try {
      const response = await axios.get(
        `/api/attendance/get-attendance/${employmentID}`
      );
      const data = response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      throw new Error(error.response.data.message);
    }
  };

  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ["user-attendance"],
    queryFn: fetchAttendance,
  });

  const { mutate: correctionPost, isPending: correctionPending } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post("/api/attendance/correct-attendance", {
        ...data,
        empId: employmentID,
      });
      return response.data;
    },
    onSuccess: function (data) {
      setOpenModal(false);
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["user-attendance"] });
      reset();
    },
    onError: function (error) {
      toast.error(error.response.data.message);
    },
  });
  const attendanceColumns = [
    { field: "srNo", headerName: "Sr No", width: 100 },
    {
      field: "date",
      headerName: "Date",
      width: 200,
      cellRenderer: (params) => params.value,
    },
    { field: "inTime", headerName: "In Time" },
    { field: "outTime", headerName: "Out Time" },
    { field: "workHours", headerName: "Work Hours" },
    { field: "breakHours", headerName: "Break Hours" },

    { field: "totalHours", headerName: "Total Hours" },
    // { field: "entryType", headerName: "Entry Type" },
  ];

  //Attendace of January is being showed
  function formatAttendance(data) {
    const formatted = data
      .filter((entry) => {
        const inDate = new Date(entry.inTime);
        return inDate.getMonth() === 0;
      })
      .sort((a, b) => new Date(a.inTime) - new Date(b.inTime))
      .map((entry) => {
        const inDate = new Date(entry.inTime);
        const outDate = new Date(entry.outTime);

        const dateString = inDate
          .toLocaleDateString("en-GB")
          .replace(/\//g, "-");

        const inLocal = new Date(inDate);
        const outLocal = new Date(outDate);

        // Expected office hours
        const expectedIn = new Date(inLocal);
        expectedIn.setHours(9, 30, 0, 0);

        const expectedOut = new Date(inLocal);
        expectedOut.setHours(18, 30, 0, 0);

        const lateCheckIn = Math.max(0, (inLocal - expectedIn) / (1000 * 60)); // in minutes
        const earlyCheckOut = Math.max(
          0,
          (expectedOut - outLocal) / (1000 * 60)
        ); // in minutes

        const totalWorked = (outLocal - inLocal) / (1000 * 60);
        const workingMinutes = Math.max(
          0,
          totalWorked - lateCheckIn - earlyCheckOut
        );

        return {
          date: dateString,
          inTime: inLocal.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
          outTime: outLocal.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
          sections: [
            {
              color: "#d3d3d3",
              value: parseFloat((lateCheckIn / 60).toFixed(2)),
            },
            {
              color: "#34a853",
              value: parseFloat((workingMinutes / 60).toFixed(2)),
            },
            {
              color: "#ff0000",
              value: parseFloat((earlyCheckOut / 60).toFixed(2)),
            },
          ],
        };
      });

    return formatted;
  }

  const attendanceData = useMemo(() => {
    if (isLoading || !attendance) return [];
    return formatAttendance(attendance);
  }, [attendance, isLoading]);

  const attendanceSeries = [
    {
      name: "Blue (Late Check-In)",
      data: attendanceData.map((entry) => entry.sections[0].value), // Gray section values
      color: "#1E3D73",
    },
    {
      name: "Green (Completed)",
      data: attendanceData.map((entry) => entry.sections[1].value), // Green section values
      color: "#54C4A7",
    },
    {
      name: "Red (Remaining)",
      data: attendanceData.map((entry) => entry.sections[2].value), // Red section values
      color: "#EB5C45",
    },
  ];

  const options = {
    chart: {
      type: "bar",
      stacked: true,
      animations: { enabled: false },
      fontFamily: "Poppins-Regular",
      toolbar: {
        show: false,
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
      categories: attendanceData.map((entry) => entry.date.split("-")[0]),
      labels: {
        style: {
          fontSize: "12px",
        },
        rotate: -45,
        hideOverlappingLabels: false,
        showDuplicates: true,
        trim: false,
      },
      tickPlacement: "on",
      axisTicks: {
        show: true,
      },
    },

    yaxis: {
      min: 0,
      max: 12, // Maximum set to 9 hours
      tickAmount: 12, // 9 ticks for 0 to 9 hours
      labels: {
        formatter: (value) => `${value} hr`, // Display as whole hours
      },
    },
    colors: ["#A9A9A9", "#28a745", "#ff4d4d"], // DarkGray, Green, Red

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
          return `${h}. ${m}m`; // Hours and minutes
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
        return `${h}.${m}`; // Hours and minutes
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

  // Convert milliseconds to hours and minutes (e.g., "8:30")
  const formatHours = (ms) => {
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes < 10 ? "0" + minutes : minutes}`;
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <WidgetSection
          layout={1}
          titleLabel={"April 2025"}
          title={"Attendance"}
          border
        >
          {!isLoading ? (
            <BarGraph
              data={attendanceSeries}
              options={options}
              responsiveResize
            />
          ) : (
            <div className="h-72 flex justify-center items-center">
              <CircularProgress />
            </div>
          )}
          <WidgetSection layout={3} padding>
            <DataCard
              data={"27"}
              title={"Accurate Checkins"}
              description={`Current Month : April-25`}
            />
            <DataCard
              data={"4"}
              title={"Late Checkins"}
              description={`Current Month : April-25`}
            />
            <DataCard
              data={"10"}
              title={"Late Checkouts"}
              description={`Current Month : April-25`}
            />
          </WidgetSection>
        </WidgetSection>
      </div>

      <div>
        {!isLoading ? (
          <PageFrame>
            <YearWiseTable
              buttonTitle={"Correction Request"}
              handleSubmit={() => {
                setOpenModal(true);
              }}
              tableTitle={`${name}'s Attendance table`}
              // data={
              //   !isLoading
              //     ? attendance?.map((record, index) => ({
              //         // id: index + 1,
              //         date: record.inTime,
              //         inTime: humanTime(record.inTime),
              //         outTime: humanTime(record.outTime),
              //         workHours: formatHours(
              //           record.outTime - record.inTime
              //         ),
              //         breakHours: "1",
              //         totalHours: formatHours(
              //           new Date(record.outTime) -
              //             new Date(record.inTime) -
              //             1 * 60 * 60 * 1000
              //         ),
              //         entryType: record.entryType,
              //       }))
              //     : []
              // }
              data={
                !isLoading && attendance.length > 0
                  ? attendance.map((record, index) => ({
                      id: index + 1,
                      date: record?.inTime ? record?.inTime : "N/A",
                      inTime: record?.inTime ? humanTime(record.inTime) : "N/A",
                      outTime: record?.outTime
                        ? humanTime(record.outTime)
                        : "N/A",
                      workHours:
                        record?.inTime && record?.outTime
                          ? formatDuration(record.inTime, record.outTime)
                          : "N/A",
                      breakHours: record?.breakDuration ?? "N/A",
                      totalHours:
                        record?.inTime && record?.outTime
                          ? formatDuration(record.inTime, record.outTime)
                          : "N/A",
                    }))
                  : [
                      {
                        id: 1,
                        date: "No Data",
                        inTime: "-",
                        outTime: "-",
                        workHours: "-",
                        breakHours: "-",
                        totalHours: "-",
                      },
                    ]
              }
              columns={attendanceColumns}
              dateColumn="date"
            />
          </PageFrame>
        ) : (
          <>
            <Skeleton height={300} width={"100%"} />
          </>
        )}
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
                    slotProps={{ textField: { size: "small" } }}
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
            <Controller
              name="reason"
              rules={{
                required: "Please specify your reason",
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
                    label="Reason"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.reason}
                    helperText={errors?.reason?.message}
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

export default Attendance;
