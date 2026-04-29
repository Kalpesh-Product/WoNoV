import React, { useCallback, useMemo, useRef, useState } from "react";
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
//import { useMemo } from "react";
import { useSelector } from "react-redux";
import { formatDuration } from "../../../../../utils/dateFormat";
import {
  isAlphanumeric,
  noOnlyWhitespace,
} from "../../../../../utils/validators";
import YearWiseTable from "../../../../../components/Tables/YearWiseTable";
import PageFrame from "../../../../../components/Pages/PageFrame";
import useAuth from "../../../../../hooks/useAuth";
import { PERMISSIONS } from "../../../../../constants/permissions";

const Attendance = () => {
  const axios = useAxiosPrivate();

  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const hasCorrectionRequestAccess = userPermissions.includes(
    PERMISSIONS.HR_CORRECTION_REQUEST.value
  );

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
   const [filteredAttendanceForGraph, setFilteredAttendanceForGraph] =
    useState(null);
  const lastGraphFilterSignature = useRef("default");
  const employmentID = useSelector((state) => state.hr.selectedEmployee);
  const name = localStorage.getItem("employeeName") || "Employee";
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const currentMonthName = currentDate.toLocaleString("default", {
    month: "long",
  });
  const currentMonthYearLabel = `${currentMonthName} ${currentYear}`;
  const currentMonthCardLabel = `${currentMonthName}-${currentYear}`;


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
    { field: "srNo", headerName: "Sr No", flex: 0.5 },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      cellRenderer: (params) => params.value,
    },
    { field: "inTime", headerName: "In Time" ,flex: 1},
    { field: "outTime", headerName: "Out Time", flex: 1 },
    { field: "workHours", headerName: "Work Hours", flex: 1 },
    { field: "breakHours", headerName: "Break Hours", flex: 1 },

    { field: "totalHours", headerName: "Total Hours", flex: 1 },
    // { field: "entryType", headerName: "Entry Type" },
  ];

  //Attendace of January is being showed
  const formatAttendance = useCallback((data) => {
    const formatted = data
      .filter((entry) => {
        const inDate = new Date(entry.inTime);
        return (
          inDate.getMonth() === currentMonth &&
          inDate.getFullYear() === currentYear
        );
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
 }, [currentMonth, currentYear]);

  const sourceAttendanceForGraph = useMemo(() => {
    if (Array.isArray(filteredAttendanceForGraph)) {
      return filteredAttendanceForGraph;
    }
    return attendance;
  }, [attendance, filteredAttendanceForGraph]);

  const attendanceData = useMemo(() => {
    if (isLoading || !sourceAttendanceForGraph) return [];
    return formatAttendance(sourceAttendanceForGraph);
  }, [formatAttendance, isLoading, sourceAttendanceForGraph]);

  const attendanceCardSummary = useMemo(() => {
    if (!Array.isArray(attendance) || attendance.length === 0) {
      return {
        accurateCheckIns: 0,
        lateCheckIns: 0,
        lateCheckOuts: 0,
      };
    }

    return attendance.reduce(
      (summary, entry) => {
        if (!entry?.inTime) return summary;

        const inDate = new Date(entry.inTime);
        if (
          inDate.getMonth() !== currentMonth ||
          inDate.getFullYear() !== currentYear
        ) {
          return summary;
        }

        const expectedIn = new Date(inDate);
        expectedIn.setHours(9, 30, 0, 0);

        if (inDate <= expectedIn) {
          summary.accurateCheckIns += 1;
        } else {
          summary.lateCheckIns += 1;
        }

        if (entry?.outTime) {
          const outDate = new Date(entry.outTime);
          const expectedOut = new Date(inDate);
          expectedOut.setHours(18, 30, 0, 0);
          if (outDate > expectedOut) {
            summary.lateCheckOuts += 1;
          }
        }

        return summary;
      },
      {
        accurateCheckIns: 0,
        lateCheckIns: 0,
        lateCheckOuts: 0,
      }
    );
  }, [attendance, currentMonth, currentYear]);

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
   const formatTime = (durationInHours) => {
    const safeValue = Math.max(0, Number(durationInHours) || 0);
    if (safeValue < 1) {
      return `${Math.round(safeValue * 60)}m`;
    }
    return `${safeValue.toFixed(2)}h`;
  };

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
        // const formatTime = (hours) => {
        //   const h = Math.floor(hours);
        //   const m = Math.round((hours - h) * 60);
        //   if (h === 0 && m > 0) return `${m}m`; // Only minutes
        //   if (m === 0) return `${h}h`; // Only hours
        //   return `${h}. ${m}m`; // Hours and minutes
        // };

        // Always display in hours with `h` suffix for check-in/completed values.
        // const formatHours = (hours) => `${hours.toFixed(2)}h`;
        // const formatRemaining = (hours) => {
        //   const h = Math.floor(hours);
        //   const m = Math.round((hours - h) * 60);
        //   if (h === 0 && m > 0) return `${m}m`;
        //   if (m === 0) return `${h}h`;
        //   return `${h}. ${m}m`;
        // };
          //  const formatHours = (hours) =>
          // `${Number(hours).toFixed(2)}h`;
        
        //  const formatTime = (hoursValue) => {
        //   const safeValue = Number(hoursValue) || 0;
        //   if (safeValue < 1) {
        //     return `${Math.round(safeValue * 60)}m`;
        //   }
        //   return `${safeValue.toFixed(2)}h`;  
        //   };
        return `
          <div style="padding: 10px; font-size: 12px; display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; gap: 2rem;">
              <div style="text-align: start;"><strong>Date</strong></div>
              <div style="text-align: end;">${attendanceData[dataPointIndex].date
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
        return formatTime(value);
          //return `${Number(value).toFixed(2)}h`;

        // Helper function to format hours and minutes
        // const h = Math.floor(value);
        // const m = Math.round((value - h) * 60);
        // if (h === 0 && m > 0) return `${m}m`; // Only minutes
        // if (m === 0) return `${h}h`; // Only hours
        // return `${h}.${m}`; // Hours and minutes

        // const safeValue = Number(value) || 0;
        // if (safeValue < 1) {
        //   return `${Math.round(safeValue * 60)}m`;
        // }
        // return `${safeValue.toFixed(2)}h`;
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
const attendanceTableData = useMemo(() => {
    if (isLoading || attendance.length === 0) {
      return [
        {
          id: 1,
          date: "No Data",
          inTime: "-",
          outTime: "-",
          workHours: "-",
          breakHours: "-",
          totalHours: "-",
        },
      ];
    }

    return attendance.map((record, index) => ({
      id: index + 1,
      rawRecord: record,
      date: record?.inTime ? record?.inTime : "N/A",
      inTime: record?.inTime ? humanTime(record.inTime) : "N/A",
      outTime: record?.outTime ? humanTime(record.outTime) : "N/A",
      workHours:
        record?.inTime && record?.outTime
          ? formatDuration(record.inTime, record.outTime)
          : "N/A",
      breakHours: record?.breakDuration ?? "N/A",
      totalHours:
        record?.inTime && record?.outTime
          ? formatDuration(record.inTime, record.outTime)
          : "N/A",
    }));
  }, [attendance, isLoading]);

  const handleDateFilterChange = useCallback(
    ({ isDateFilterActive, filteredData }) => {
      if (!isDateFilterActive) {
        if (lastGraphFilterSignature.current !== "default") {
          lastGraphFilterSignature.current = "default";
          setFilteredAttendanceForGraph(null);
        }
        return;
      }

      const filteredRawAttendance = (filteredData || [])
        .map((item) => item?.rawRecord)
        .filter(Boolean);

      const nextSignature = filteredRawAttendance
        .map((record) => `${record?._id || ""}-${record?.inTime || ""}`)
        .join("|");

      if (lastGraphFilterSignature.current === nextSignature) return;

      lastGraphFilterSignature.current = nextSignature;
      setFilteredAttendanceForGraph(filteredRawAttendance);
    },
    []
  );
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
          // titleLabel={"April 2025"}
          titleLabel={currentMonthYearLabel}
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
              data={attendanceCardSummary.accurateCheckIns}
              title={"Accurate Check-ins"}
              description={`Current Month : ${currentMonthCardLabel}`}
            />
            <DataCard
              data={attendanceCardSummary.lateCheckIns}
              title={"Late Check-ins"}
              description={`Current Month : ${currentMonthCardLabel}`}
            />
            <DataCard
              data={attendanceCardSummary.lateCheckOuts}
              title={"Late Check-outs"}
              description={`Current Month : ${currentMonthCardLabel}`}
            />
            {/* <DataCard
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
            /> */}
          </WidgetSection>
        </WidgetSection>
      </div>

      <div>
        {!isLoading ? (
          <PageFrame>
            <YearWiseTable
              buttonTitle={"Correction Request"}
              buttonDisabled={!hasCorrectionRequestAccess}
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
               data={attendanceTableData}
              columns={attendanceColumns}
              dateColumn="date"
               onDateFilterChange={handleDateFilterChange}
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
