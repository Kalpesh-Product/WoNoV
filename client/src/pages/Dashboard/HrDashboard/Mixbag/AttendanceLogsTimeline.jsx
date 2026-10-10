import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Autocomplete,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { BsCup, BsCupHot } from "react-icons/bs";
import { IoEnterOutline, IoExitOutline } from "react-icons/io5";
import {
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdOutlinePhotoCamera,
} from "react-icons/md";
import AgTable from "../../../../components/AgTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";

const eventTypes = {
  "clock-in": { label: "IN", icon: <IoEnterOutline /> },
  "break-in": { label: "Start Break", icon: <BsCupHot /> },
  "break-out": { label: "End Break", icon: <BsCup /> },
  "clock-out": { label: "OUT", icon: <IoExitOutline /> },
};

const photoEventStyles = {
  "clock-in": {
    label: "Clock In",
    chip: "border-[#ccebdd] bg-[#e5f8ef] text-[#07965f]",
    dot: "bg-[#07965f]",
  },
  "break-in": {
    label: "Start Break",
    chip: "border-[#ffd7cc] bg-[#fff0ec] text-[#ef6548]",
    dot: "bg-[#ef6548]",
  },
  "break-out": {
    label: "End Break",
    chip: "border-[#ffd7cc] bg-[#fff0ec] text-[#ef6548]",
    dot: "bg-[#ef6548]",
  },
  "clock-out": {
    label: "Clock Out",
    chip: "border-[#ffd6d6] bg-[#fff0f0] text-[#ff0000]",
    dot: "bg-[#ff0000]",
  },
};

const isSameDate = (firstDate, secondDate) =>
  firstDate.getFullYear() === secondDate.getFullYear() &&
  firstDate.getMonth() === secondDate.getMonth() &&
  firstDate.getDate() === secondDate.getDate();

const shiftDate = (date, days) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const getFullName = (person) =>
  [person?.firstName, person?.middleName, person?.lastName]
    .filter(Boolean)
    .join(" ") || person?.name || person?.empId || "-";

const getEventDedupeKey = (event) => {
  const time = new Date(event.time);
  time.setSeconds(0, 0);
  return [
    event.userId || "unknown-user",
    event.type,
    time.toISOString(),
  ].join("|");
};

const formatDuration = (totalMinutes) => {
  const safeMinutes = Math.max(0, Math.round(Number(totalMinutes) || 0));
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const formatEntryType = (entryType) => {
  if (!entryType) return "-";
  return entryType
    .split("/")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase())
    .join("/");
};

const sortTimelineEvents = (events, selectedEmployeeId) =>
  [...events].sort((a, b) => {
    const timeDifference = a.time - b.time;
    if (timeDifference) return timeDifference;

    if (selectedEmployeeId !== "all") {
      return a.sequence - b.sequence;
    }

    return a.rowOrder - b.rowOrder;
  });

const dateButtonSx = {
  border: "1px solid",
  borderColor: "#1e3d73",
  backgroundColor: "#1e3d73",
  borderRadius: 1,
  color: "common.white",
  height: 38,
  width: 38,
  "&:hover": {
    borderColor: "#16305d",
    backgroundColor: "#16305d",
  },
};

const datePickerWidth = 245;
const dateNavigatorWidth = datePickerWidth + 38 + 38 + 16;

const AttendanceLogsTimeline = () => {
  const axios = useAxiosPrivate();
  const [employeeId, setEmployeeId] = useState("all");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["attendance-logs"],
    queryFn: async () => (await axios.get("/api/attendance/logs")).data,
  });

  const { data: activeEmployees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await axios.get("/api/users/fetch-users");
      return (response.data || []).filter((employee) => employee.isActive);
    },
    staleTime: 5 * 60 * 1000,
  });

  const employees = useMemo(() => {
    const unique = new Map();
    activeEmployees.forEach((employee) => {
      if (employee?._id) {
        unique.set(employee._id, {
          id: employee._id,
          empId: employee.empId || employee.employeeID || employee.employmentID,
          name: getFullName(employee),
        });
      }
    });
    return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [activeEmployees]);

  const employeeOptions = useMemo(
    () => [{ id: "all", name: "All employees" }, ...employees],
    [employees],
  );

  const selectedEmployee = useMemo(
    () =>
      employeeOptions.find((employee) => employee.id === employeeId) ||
      employeeOptions[0],
    [employeeId, employeeOptions],
  );

  const selectedAttendance = useMemo(
    () =>
      employeeId === "all"
        ? null
        : data.find(
            (attendance) =>
              attendance.user?._id === employeeId &&
              attendance.inTime &&
              isSameDate(new Date(attendance.inTime), selectedDate),
          ),
    [data, employeeId, selectedDate],
  );

  const attendanceSummary = useMemo(() => {
    if (!selectedAttendance) return null;

    const breakMinutes =
      typeof selectedAttendance.breakDuration === "number"
        ? selectedAttendance.breakDuration
        : selectedAttendance.breaks?.reduce((total, item) => {
            if (!item.startBreak || !item.endBreak) return total;
            const diff = new Date(item.endBreak) - new Date(item.startBreak);
            return total + Math.max(0, diff / (1000 * 60));
          }, 0) || 0;

    const totalMinutes =
      selectedAttendance.inTime && selectedAttendance.outTime
        ? Math.max(
            0,
            (new Date(selectedAttendance.outTime) -
              new Date(selectedAttendance.inTime)) /
              (1000 * 60),
          )
        : 0;

    return {
      employee: getFullName(selectedAttendance.user),
      workHours: formatDuration(totalMinutes - breakMinutes),
      breakHours: formatDuration(breakMinutes),
      date: new Date(selectedAttendance.inTime).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      entryType: formatEntryType(selectedAttendance.entryType),
      approver: selectedAttendance.approvedBy
        ? getFullName(selectedAttendance.approvedBy)
        : "",
    };
  }, [selectedAttendance]);

  const events = useMemo(
    () => {
      const dedupedEvents = new Map();
      let rowOrder = 0;

      data
        .filter(({ user }) => employeeId === "all" || user?._id === employeeId)
        .forEach((attendance) => {
          const rows = [];
          const add = (type, time, image, sequence) => {
            if (time) {
              rows.push({
                id: `${attendance._id}-${type}-${time}`,
                type,
                time: new Date(time),
                image: image?.url,
                sequence,
                userId: attendance.user?._id,
                employeeName: getFullName(attendance.user),
                rowOrder: rowOrder++,
              });
            }
          };
          add("clock-in", attendance.inTime, attendance.inImage, 1);
          attendance.breaks?.forEach((item) => {
            add("break-in", item.startBreak, item.startImage, 2);
            add("break-out", item.endBreak, item.endImage, 3);
          });
          add("clock-out", attendance.outTime, attendance.outImage, 4);
          rows
            .filter((event) => isSameDate(event.time, selectedDate))
            .forEach((event) => {
              const key = getEventDedupeKey(event);
              const existingEvent = dedupedEvents.get(key);

              if (!existingEvent || (!existingEvent.image && event.image)) {
                dedupedEvents.set(key, event);
              }
            });
        });

      return sortTimelineEvents([...dedupedEvents.values()], employeeId);
    },
    [data, employeeId, selectedDate],
  );

  const tableData = useMemo(
    () =>
      events.map((event) => ({
        ...event,
        typeLabel: eventTypes[event.type]?.label || event.type,
        date: event.time.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        timeLabel: event.time.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
      })),
    [events],
  );

  const columns = useMemo(
    () => [
      {
        field: "icon",
        headerName: "",
        width: 52,
        maxWidth: 52,
        minWidth: 52,
        sortable: false,
        suppressCsvExport: true,
        cellStyle: {
          alignItems: "center",
          display: "flex",
          justifyContent: "center",
        },
        cellRenderer: ({ data }) => {
          const eventType = eventTypes[data?.type];

          return (
            <span className="flex items-center justify-center text-[1.35rem] leading-none text-gray-700">
              {eventType?.icon}
            </span>
          );
        },
      },
      {
        field: "typeLabel",
        headerName: "Type",
        flex: 1.1,
        minWidth: 160,
        cellStyle: {
          alignItems: "center",
          display: "flex",
        },
        cellRenderer: ({ value }) => (
          <span className="flex items-center text-sm leading-none text-gray-800">
            {value}
          </span>
        ),
      },
      {
        field: "employeeName",
        headerName: "Employee",
        flex: 1.2,
        minWidth: 180,
      },
      {
        field: "date",
        headerName: "Date",
        flex: 1,
        minWidth: 160,
      },
      {
        field: "timeLabel",
        headerName: "Time",
        flex: 1,
        minWidth: 140,
      },
      {
        field: "image",
        headerName: "Image",
        flex: 1,
        minWidth: 140,
        sortable: false,
        cellRenderer: ({ value, data }) =>
          value ? (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-[#b8c3d5] bg-[#f2f5f9] px-2.5 py-1 text-xs font-semibold text-[#1E3D73] transition-colors hover:border-[#1E3D73] hover:bg-[#e8eef6]"
              onClick={() =>
                setSelectedPhoto({
                  url: value,
                  employeeName: data.employeeName,
                  type: data.type,
                  typeLabel: data.typeLabel,
                  date: data.date,
                  timeLabel: data.timeLabel,
                })
              }
            >
              <MdOutlinePhotoCamera className="text-base" />
              View Photo
            </button>
          ) : (
            <span className="text-gray-400">-</span>
          ),
      },
    ],
    [],
  );

  return (
    <div className="p-4">
      <div className="rounded-xl border border-borderGray bg-white p-5 shadow-sm">
        <AgTable
          data={isLoading ? [] : tableData}
          columns={columns}
          search
          exportData
          tableTitle="LOGS TIMELINE"
          dropdownColumns={["typeLabel", "employeeName", "date", "timeLabel"]}
          tableHeight={440}
          headerBottomContent={
            <div className="flex w-full justify-center pb-6 pt-2">
              <div
                className="flex w-full flex-col gap-2"
                style={{ maxWidth: 420 }}
              >
                <Autocomplete
                  size="small"
                  options={employeeOptions}
                  value={selectedEmployee}
                  sx={{
                    width: dateNavigatorWidth,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#1e3d73",
                    },
                    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                      {
                        borderColor: "#1e3d73",
                      },
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                      {
                        borderColor: "#1e3d73",
                      },
                    "& .MuiSvgIcon-root": {
                      color: "#1e3d73",
                    },
                  }}
                  onChange={(_, employee) =>
                    setEmployeeId(employee?.id || "all")
                  }
                  getOptionLabel={(employee) =>
                    employee?.empId
                      ? `${employee.name} (${employee.empId})`
                      : employee?.name || ""
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search employee"
                      size="small"
                    />
                  )}
                />

                <div className="flex items-center gap-2">
                  <IconButton
                    size="small"
                    onClick={() => setSelectedDate((date) => shiftDate(date, -1))}
                    aria-label="Previous day"
                    sx={dateButtonSx}
                  >
                    <MdChevronLeft />
                  </IconButton>
                  <DatePicker
                    format="ddd, MMMM D, YYYY"
                    size="small"
                    value={dayjs(selectedDate)}
                    onChange={(value) => {
                      if (value?.isValid?.()) {
                        setSelectedDate(value.toDate());
                      }
                    }}
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: {
                          width: datePickerWidth,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "6px",
                            height: 38,
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#1e3d73",
                          },
                          "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                            {
                              borderColor: "#1e3d73",
                            },
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                            {
                              borderColor: "#1e3d73",
                            },
                          "& .MuiSvgIcon-root": {
                            color: "#1e3d73",
                          },
                        },
                      },
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => setSelectedDate((date) => shiftDate(date, 1))}
                    aria-label="Next day"
                    sx={dateButtonSx}
                  >
                    <MdChevronRight />
                  </IconButton>
                </div>

                {attendanceSummary ? (
                  <div className="mt-4 rounded-md border border-borderGray bg-white shadow-sm">
                    <div className="flex items-center gap-2 border-b border-borderGray px-4 py-3">
                      <span className="text-lg font-medium text-gray-800">
                        Timeclock
                      </span>
                      <span className="rounded-sm bg-green-600 px-2 py-1 text-xs font-semibold uppercase text-white">
                        Sync
                      </span>
                    </div>
                    <div className="mx-auto flex min-h-[210px] max-w-[320px] flex-col gap-4 px-5 py-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-28 text-right font-semibold text-gray-900">
                          Employee
                        </span>
                        <span className="text-gray-400">-</span>
                        <span className="text-gray-800">
                          {attendanceSummary.employee}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-28 text-right font-semibold text-gray-900">
                          Work Hours
                        </span>
                        <span className="text-gray-400">-</span>
                        <span className="text-gray-800">
                          {attendanceSummary.workHours}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-28 text-right font-semibold text-gray-900">
                          Break Hours
                        </span>
                        <span className="text-gray-400">-</span>
                        <span className="text-gray-800">
                          {attendanceSummary.breakHours}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-28 text-right font-semibold text-gray-900">
                          Date
                        </span>
                        <span className="text-gray-400">-</span>
                        <span className="text-gray-800">
                          {attendanceSummary.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-28 text-right font-semibold text-gray-900">
                          Entry Type
                        </span>
                        <span className="text-gray-400">-</span>
                        <span className="text-gray-800">
                          {attendanceSummary.entryType}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-28 text-right font-semibold text-gray-900">
                          Approver
                        </span>
                        <span className="text-gray-400">-</span>
                        <span className="text-gray-800">
                          {attendanceSummary.approver}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          }
          searchBottomContent={
            isLoading ? (
              <div className="py-3 text-center text-sm text-gray-500">
                Loading attendance logs...
              </div>
            ) : null
          }
        />
      </div>

      <Dialog
        open={Boolean(selectedPhoto)}
        onClose={() => setSelectedPhoto(null)}
        fullWidth
        maxWidth="md"
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(15, 23, 42, 0.72)",
              backdropFilter: "blur(5px)",
            },
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: { xs: 2, sm: 3 },
            backgroundColor: "#f8fafc",
            backgroundImage: "none",
            boxShadow: "0 28px 70px rgba(15, 23, 42, 0.32)",
            m: { xs: 1.5, sm: 3 },
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            alignItems: "center",
            backgroundColor: "common.white",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            px: { xs: 2, sm: 3 },
            py: 2,
          }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl text-primary">
              <MdOutlinePhotoCamera />
            </span>
            <span className="text-base font-semibold text-[#1E3D73] sm:text-lg">
              ATTENDANCE PHOTO
            </span>
          </div>
          <IconButton
            aria-label="Close attendance photo"
            onClick={() => setSelectedPhoto(null)}
            size="small"
            sx={{
              backgroundColor: "#f1f5f9",
              color: "#dc2626",
              height: 36,
              width: 36,
              "&:hover": {
                backgroundColor: "#f1f5f9",
                color: "#dc2626",
              },
            }}
          >
            <MdClose />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            p: { xs: 1.5, sm: 2.5 },
            "&:last-child": { pb: { xs: 1.5, sm: 2.5 } },
          }}
        >
          {selectedPhoto && (
            <div className="space-y-3 pt-2 sm:pt-3">
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <span className="inline-flex min-h-8 items-center rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 font-semibold text-[#1E3D73]">
                  {selectedPhoto.employeeName}
                </span>
                <span
                  className={`inline-flex min-h-8 items-center gap-1.5 rounded-md border px-2.5 py-1 font-semibold ${photoEventStyles[selectedPhoto.type]?.chip ||
                    "border-blue-200 bg-blue-50 text-[#1E3D73]"
                    }`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${photoEventStyles[selectedPhoto.type]?.dot || "bg-[#1E3D73]"
                      }`}
                  />
                  {photoEventStyles[selectedPhoto.type]?.label ||
                    selectedPhoto.typeLabel}
                </span>
                <span className="inline-flex min-h-8 items-center rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 font-semibold text-[#1E3D73]">
                  {selectedPhoto.date} · {selectedPhoto.timeLabel}
                </span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.2)]">
                <img
                  src={selectedPhoto.url}
                  alt={`Attendance capture for ${selectedPhoto.employeeName}`}
                  className="max-h-[68vh] w-full rounded-xl object-contain"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendanceLogsTimeline;
