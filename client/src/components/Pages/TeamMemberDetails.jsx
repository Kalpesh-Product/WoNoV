// Updated TeamMemberDetails with Edit Modal
import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";
import MuiModal from "../../components/MuiModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import usePageDepartment from "../../hooks/usePageDepartment";
import { CircularProgress, MenuItem, TextField } from "@mui/material";
import DetalisFormatted from "../DetalisFormatted";
import PageFrame from "./PageFrame";
import { Controller, useForm } from "react-hook-form";
import PrimaryButton from "../../components/PrimaryButton";
import { toast } from "sonner";
import { DatePicker } from "@mui/x-date-pickers";
import { queryClient } from "../../main";

const TeamMemberDetails = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalType, setModalType] = useState("view");
  const [filters, setFilters] = useState({ employee: true, substitute: true });

  const department = usePageDepartment();
  const axios = useAxiosPrivate();
  const location = useLocation();
  const passedData = location.state;
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["schedule"] });
  }, []);

  const [calendarEvents, setCalendarEvents] = useState([]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      weeklyScheduleId: "",
      substitute: "",
      fromDate: null,
      toDate: null,
    },
  });

  const {
    data: unitSchedule = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["schedule"],
    queryFn: async () => {
      const res = await axios.get(
        `/api/weekly-unit/get-unit-schedule?unitId=${passedData.id}&department=${department._id}`
      );
      return res.data;
    },
    refetchOnWindowFocus: false,
  });

  const { data: employees = [], isLoading: isEmployeesLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await axios.get("/api/users/fetch-users", {
        params: { deptId: department._id },
      });
      return res.data;
    },
  });

  useEffect(() => {
    if (!Array.isArray(unitSchedule) || !unitSchedule.length) {
      setCalendarEvents([]);
      return;
    }

    const allEvents = [];

    unitSchedule.forEach((schedule) => {
      const empId = schedule?.employee?.id;
      const empName = empId
        ? `${empId.firstName ?? ""} ${empId.lastName ?? ""}`.trim()
        : "Unknown";

      const unitName = schedule?.location?.unitName || "N/A";
      const manager = schedule?.manager || "N/A";
      const start = dayjs(schedule?.startDate);
      const end = dayjs(schedule?.endDate);

      if (!start.isValid() || !end.isValid()) return;

      // 🟦 Show assigned employee (if enabled in filters)
      if (filters.employee) {
        for (
          let current = start;
          current.isSameOrBefore(end, "day");
          current = current.add(1, "day")
        ) {
          allEvents.push({
            title: empName,
            start: current.format("YYYY-MM-DD"),
            backgroundColor: "#3357FF",
            borderColor: "#3357FF",
            extendedProps: {
              scheduleId: schedule._id,
              employeeName: empName,
              unit: unitName,
              manager,
              fromDate: schedule.startDate,
              toDate: schedule.endDate,
              isSubstitute: false,
              substitutes: schedule?.substitutions || [],
            },
          });
        }
      }

      // 🟦 Show active substitutes (if enabled in filters)
      if (
        filters.substitute &&
        Array.isArray(schedule.substitutions) &&
        schedule.substitutions.length
      ) {
        schedule.substitutions.forEach((sub) => {
          if (!sub?.isActive) return;

          const subName =
            `${sub?.substitute?.firstName ?? ""} ${
              sub?.substitute?.lastName ?? ""
            }`.trim() || "Unknown Substitute";
          const subStart = dayjs(sub?.fromDate);
          const subEnd = dayjs(sub?.toDate);

          if (!subStart.isValid() || !subEnd.isValid()) return;

          for (
            let current = subStart;
            current.isSameOrBefore(subEnd, "day");
            current = current.add(1, "day")
          ) {
            allEvents.push({
              title: subName,
              start: current.format("YYYY-MM-DD"),
              backgroundColor: "#66b2ff", // lighter blue for substitute
              borderColor: "#66b2ff",
              extendedProps: {
                scheduleId: schedule._id,
                employeeName: subName,
                unit: unitName,
                manager,
                isSubstitute: true,
                substitutes: [],
                fromDate: sub.fromDate,
                toDate: sub.toDate,
              },
            });
          }
        });
      }
    });

    setCalendarEvents(allEvents);
  }, [unitSchedule, filters]);

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setModalType("view");
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedEvent(null);
    reset();
  };

  const { mutate: assignSubstitute, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axios.patch("/api/weekly-unit/add-substitute", data);
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Substitute assigned successfully!");
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
      closeDrawer();
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong");
    },
  });

  const onSubmit = (formData) => {
    assignSubstitute({
      weeklyScheduleId: formData.weeklyScheduleId,
      substitute: formData.substitute,
      fromDate: formData.fromDate,
      toDate: formData.toDate,
    });
  };

  useEffect(() => {
    if (modalType === "edit" && selectedEvent) {
      setValue("weeklyScheduleId", selectedEvent.extendedProps.scheduleId);
      setValue("fromDate", dayjs(selectedEvent.extendedProps.fromDate));
      setValue("toDate", dayjs(selectedEvent.extendedProps.toDate));
    }
  }, [modalType, selectedEvent]);

  return (
    <div className="flex flex-col gap-4 bg-white p-4">
      <PageFrame>
        <div className="mb-4">
          <span className="text-title font-pmedium text-primary ">
            {`${passedData?.name || "USER"} SCHEDULE`}
          </span>
        </div>

        {isLoading || isFetching ? (
          <div className="w-full flex justify-center items-center p-4">
            <CircularProgress size={24} />
          </div>
        ) : (
          <div className="w-full h-full overflow-y-auto">
            <FullCalendar
              headerToolbar={{
                left: "prev title next",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={calendarEvents}
              contentHeight={425}
              eventClick={handleEventClick}
              dayMaxEvents={2}
              eventDisplay="block"
            />
          </div>
        )}
      </PageFrame>

      <MuiModal
        open={isDrawerOpen}
        onClose={closeDrawer}
        title="Schedule Details"
      >
        {modalType === "view" && selectedEvent && (
          <div className="flex flex-col gap-2">
            <DetalisFormatted
              title="Employee"
              detail={`${selectedEvent.extendedProps.employeeName}${
                selectedEvent.extendedProps.isSubstitute ? " (Substitute)" : ""
              }`}
            />
            <DetalisFormatted
              title="Date"
              detail={dayjs(selectedEvent.start).format("DD-MM-YYYY")}
            />
            <DetalisFormatted
              title="Unit"
              detail={selectedEvent.extendedProps.unit || "N/A"}
            />
            <DetalisFormatted
              title="Manager"
              detail={selectedEvent.extendedProps.manager || "N/A"}
            />
            <PrimaryButton
              title="Assign Substitute"
              handleSubmit={() => {
                setModalType("edit");
              }}
            />
          </div>
        )}

        {modalType === "edit" && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Controller
              name="substitute"
              control={control}
              rules={{ required: "Substitute is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Select Substitute"
                  size="small"
                  fullWidth
                  error={!!errors.substitute}
                  helperText={errors.substitute?.message}
                >
                  <MenuItem value="" disabled>
                    Select Substitute
                  </MenuItem>
                  {employees.map((emp) => (
                    <MenuItem key={emp._id} value={emp._id}>
                      {emp.firstName} {emp.lastName}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="fromDate"
              control={control}
              rules={{ required: "From Date is required" }}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  label="From Date"
                  format="DD-MM-YYYY"
                  disablePast
                  onChange={(date) => field.onChange(date)}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      error: !!errors.fromDate,
                      helperText: errors.fromDate?.message,
                    },
                  }}
                />
              )}
            />

            <Controller
              name="toDate"
              control={control}
              rules={{ required: "To Date is required" }}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  label="To Date"
                  format="DD-MM-YYYY"
                  disablePast
                  onChange={(date) => field.onChange(date)}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      error: !!errors.toDate,
                      helperText: errors.toDate?.message,
                    },
                  }}
                />
              )}
            />
            <PrimaryButton
              title="Assign"
              type="submit"
              isLoading={isPending}
              disabled={isPending}
            />
          </form>
        )}
      </MuiModal>
    </div>
  );
};

export default TeamMemberDetails;
