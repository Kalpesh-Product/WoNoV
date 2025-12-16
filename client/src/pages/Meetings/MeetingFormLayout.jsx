import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import MuiModal from "../../components/MuiModal";
import { IoMdClose } from "react-icons/io";
import { useForm, Controller } from "react-hook-form";
import {
  Autocomplete,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import PrimaryButton from "../../components/PrimaryButton";
import dayjs from "dayjs";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { queryClient } from "../../main";
import humanDate from "../../utils/humanDateForamt";
import useAuth from "../../hooks/useAuth";
import { useFieldArray } from "react-hook-form";
import { isAlphanumeric, noOnlyWhitespace } from "../../utils/validators";
import { inrFormat } from "../../utils/currencyFormat";

const MeetingFormLayout = () => {
  const { auth } = useAuth();
  const [open, setOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const locationName = searchParams.get("location") || "";
  const meetingRoomName = searchParams.get("meetingRoom") || "";
  const locationState = useLocation();
  const meetingRoomId = locationState.state?.meetingRoomId || "";
  const { perHourCredit, perHourPrice } = locationState.state;
  const [events, setEvents] = useState([]);
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  let showExternalType = false;

  const roles = auth.user.role.map((role) => role.roleTitle);

  if (
    roles.includes("Master Admin") ||
    roles.includes("Super Admin") ||
    roles.includes("Administration Admin") ||
    roles.includes("Administration Employee")
  ) {
    showExternalType = true;
  }

  // Inside your component, add this state
  const [participantCount, setParticipantCount] = useState(1);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      meetingType: "Internal",
      startDate: null, // Ensure null
      endDate: null, // Ensure null
      startTime: null, // Watch startTime dynamically
      endTime: null,
      subject: "",
      agenda: "",
      internalBooked: auth.user?._id,
      internalParticipants: [],
      externalParticipants: [],
    },
    mode: "onChange",
  });
  const { fields, append } = useFieldArray({
    control,
    name: "manualExternalParticipants", // ⬅️ changed here
  });

  const isReceptionist = auth.user?.role?.some((item) =>
    item.roleTitle.startsWith("Administration")
  );

  useEffect(() => {
    if (!isReceptionist) {
      setValue("company", "6799f0cd6a01edbe1bc3fcea");
    }
  }, [isReceptionist, setValue]);

  const meetingType = watch("meetingType");
  const startDate = watch("startDate"); // Watch startDate
  const endDate = watch("endDate"); // Watch endDate
  const startTime = watch("startTime");
  const endTime = watch("endTime");
  const company = watch("company");
  const isBizNest = company === "6799f0cd6a01edbe1bc3fcea";
  const externalCompany = watch("externalCompany");

  const [shouldFetchParticipants, setShouldFetchParticipants] = useState(false);

  //-------------------------------API-------------------------------//
  const { data: clientsData = [], isPending: isClientsDataPending } = useQuery({
    queryKey: ["clientsData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/sales/co-working-clients");
        const data = response.data.filter((item) => item.isActive);
        return data;
      } catch (error) {
        console.error("Error fetching clients data:", error);
      }
    },
  });
  //-------------------------------API-------------------------------//

  //-------------------------------API-------------------------------//
  const { data: employees = [], isLoading: isEmployeesLoading } = useQuery({
    queryKey: ["participants", company],
    queryFn: async () => {
      if (company === "6799f0cd6a01edbe1bc3fcea") {
        const response = await axios.get("/api/users/fetch-users");
        return (
          response.data
            // .filter((user) => user._id !== auth.user?._id)
            .filter((u) => u.isActive === true)
        );
      } else {
        const response = await axios.get("/api/sales/co-working-clients");
        const activeClients = response.data.filter((item) => item.isActive);
        const flattened = activeClients.flatMap((client) =>
          client.members.map((member) => ({
            ...member,
            clientName: client.clientName,
          }))
        );
        // Flatten members and inject clientName for context
        return flattened.filter((item) => {
          return item.client?._id === company;
        });
      }
    },
    enabled: shouldFetchParticipants && !!company,
  });
  //-------------------------------API-------------------------------//

  //--------------Handling Date internally----------------//
  const handleDateClick = (arg) => {
    if (!arg.start) return;

    const selectedDate = dayjs(arg.start).startOf("day");
    const startTime = dayjs(arg.start);
    const endTime = dayjs(arg.start).add(30, "minute");

    setValue("startDate", selectedDate, { shouldDirty: true });
    setValue("endDate", selectedDate, { shouldDirty: true });
    setValue("startTime", dayjs(startTime), { shouldDirty: true });
    setValue("endTime", dayjs(endTime), { shouldDirty: true });

    setOpen(true);
  };
  //--------------Handling Date internally----------------//

  //-------------------------------API-------------------------------//

  const { data: checkAvailability = [], isPending: isCheckingAvailability } =
    useQuery({
      queryKey: ["checkAvailability", meetingRoomId],
      queryFn: async () => {
        const response = await axios.get(
          `/api/meetings/get-room-meetings/${meetingRoomId}`
        );
        return response.data;
      },
      onError: (error) => {
        toast.error("Error checking meeting room availability");
      },
    });
  //-------------------------------API-------------------------------//

  // Transform data inside useEffect

  const transformEvents = (bookings) => {
    if (!Array.isArray(bookings)) return;

    const formattedEvents = bookings.map((booking) => ({
      id: booking._id,
      title: "Booked",
      start: new Date(booking.startTime), // ⬅️ already full datetime
      end: new Date(booking.endTime), // ⬅️ already full datetime
      backgroundColor: "#d3d3d3",
      borderColor: "#a9a9a9",
      textColor: "#555",
      editable: false,
    }));

    setEvents(formattedEvents);
  };

  useEffect(() => {
    transformEvents(checkAvailability);
  }, [checkAvailability]); // ✅ Now using checkAvailability directly
  //-------------------------------API POST-------------------------------//
  const { mutate: createMeeting, isPending: isCreateMeeting } = useMutation({
    mutationKey: ["createMeeting"],
    mutationFn: async (data) => {
      await axios.post("/api/meetings/create-meeting", {
        bookedRoom: meetingRoomId,
        meetingType: data.meetingType,
        startDate: startDate,
        endDate: endDate,
        startTime: startTime,
        endTime: endTime,
        client: data.company,
        subject: data.subject,
        agenda: data.agenda,
        internalParticipants: data.internalParticipants,
        bookedBy: data.bookedBy || data.internalBooked,
        externalParticipants: data.externalParticipants,
        externalCompany: data.externalCompany,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      toast.success("Meeting booked successfully");
      setOpen(false);
      navigate("/app/meetings/calendar");
    },
    onError: (error) => {
      toast.error(error.response.data.message || "ERROR");
    },
  });
  //-------------------------------API POST-------------------------------//

  //-------------------------------API vISITORS-------------------------------//

  const {
    data: externalUsers = [],
    isLoading: externalUsersLoading,
    error: externalUsersError,
  } = useQuery({
    queryKey: ["visitors"],
    queryFn: async () => {
      const response = await axios.get("/api/visitors/fetch-visitors");

      return response.data;
    },
  });
  //-------------------------------API vISITORS-------------------------------//

  const onSubmit = (data) => {
    createMeeting(data);
  };

  const addParticipant = () => {
    setParticipantCount((prev) => prev + 1);
  };
  return (
    <div className="p-4">
      <div className="w-full text-center">
        <span className="text-title text-primary font-pregular mb-4">
          Schedule Meeting in {locationName}-{meetingRoomName}
        </span>
      </div>
      <div className="w-full h-full overflow-y-auto">
        {isCheckingAvailability ? (
          <div className="h-full justify-center items-center">
            <CircularProgress color="#1E3D73" />
          </div>
        ) : (
          <FullCalendar
            allDaySlot={false} // 🔴 This removes the "All-day" tab in timeGrid views
            key={events.length}
            headerToolbar={{
              left: "prev title next",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridDay"
            contentHeight={555}
            dayMaxEvents={2}
            eventDisplay="auto"
            selectable={true}
            selectMirror={false}
            slotDuration="00:30:00"
            slotLabelFormat={{
              hour: "numeric",
              minute: "2-digit",
              meridiem: "lowercase",
            }}
            allDayText=""
            select={handleDateClick}
            selectAllow={({ start }) => {
              const now = new Date();
              return start.getTime() > now.getTime();
            }}
            datesSet={() => {
              setTimeout(() => {
                const now = new Date();
                const today = now.toISOString().slice(0, 10);
                const allSlots = document.querySelectorAll(`.fc-timegrid-slot`);

                allSlots.forEach((slot) => {
                  const timeAttr = slot.getAttribute("data-time");
                  if (!timeAttr) return;

                  const slotTime = new Date(`${today}T${timeAttr}`);
                  if (slotTime < now) {
                    slot.classList.add("fc-slot-past");
                  }
                });
              }, 0);
            }}
            events={events}
          />
        )}
      </div>

      <MuiModal
        open={open}
        onClose={() => setOpen(false)}
        title={`${meetingType} Meeting`}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col w-full gap-4"
        >
          <div className="w-full flex gap-8 justify-center items-center">
            <span className="text-content">Date : {humanDate(startDate)}</span>
          </div>
          <div className="grid grid-cols-2 gap-8 px-2 pb-4 mb-4 border-b-default border-black">
            <div className="w-fit flex gap-8 items-center">
              <span className="text-content">Location : {locationName}</span>
            </div>
            <div className="w-full flex gap-8 items-center justify-end">
              <span className="text-content">
                Selected Room : {meetingRoomName}
              </span>
            </div>

            <div className="w-full flex gap-8 items-center justify-start">
              <div className="flex flex-col">
                <span className="text-content">
                  Per Hour Credit : {perHourCredit}
                </span>
                <span className="text-content">
                  Per Half Hour Credit : {perHourCredit / 2}
                </span>
              </div>
            </div>
            <div className="w-full flex gap-8 items-center justify-end">
              <div className="flex flex-col">
                <span className="text-content">
                  Per Hour Price : {`INR ${inrFormat(perHourPrice)}`}
                </span>
                <span className="text-content">
                  Per Half Hour Price : {`INR  ${inrFormat(perHourPrice / 2)}`}
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 gap-y-6">
            <div className="col-span-2 sm:col-span-1 md:col-span-2">
              <Controller
                name="meetingType"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Meeting Type"
                    select
                    fullWidth
                    disabled={!showExternalType}
                    size="small"
                  >
                    <MenuItem value="" disabled>
                      Select a Meeting Type
                    </MenuItem>
                    <MenuItem value="Internal">Internal</MenuItem>
                    {showExternalType && (
                      <MenuItem value="External">External</MenuItem>
                    )}
                  </TextField>
                )}
              />
            </div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="startTime"
                control={control}
                rules={{
                  validate: (value) => {
                    if (!value) return "Start time is required";

                    const selectedTime = new Date(value);
                    const minAllowedTime = new Date();
                    minAllowedTime.setHours(9, 30, 0, 0); // 09:30 AM today

                    const now = new Date();

                    if (selectedTime < minAllowedTime) {
                      return "Start time must be after 9:30 AM";
                    }

                    if (selectedTime < now) {
                      return "Start time cannot be in the past";
                    }

                    return true;
                  },
                }}
                render={({ field, fieldState }) => (
                  <TimePicker
                    {...field}
                    label="Select a Start Time"
                    slotProps={{
                      textField: {
                        size: "small",
                        error: !!fieldState.error,
                        helperText: fieldState.error?.message,
                      },
                    }}
                  />
                )}
              />
              <Controller
                name="endTime"
                control={control}
                rules={{
                  validate: (value) => {
                    if (!value) return "End time is required";

                    const start = new Date(startTime);
                    const end = new Date(value);

                    if (end <= start) {
                      return "End time must be after start time";
                    }

                    return true;
                  },
                }}
                render={({ field, fieldState }) => (
                  <TimePicker
                    {...field}
                    label="Select an End Time"
                    slotProps={{
                      textField: {
                        size: "small",
                        error: !!fieldState.error,
                        helperText: fieldState.error?.message,
                      },
                    }}
                  />
                )}
              />
            </LocalizationProvider>
            {meetingType === "Internal" ? (
              <>
                {isReceptionist ? (
                  <>
                    <Controller
                      name="company"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Company"
                          select
                          size="small"
                          fullWidth
                        >
                          <MenuItem value="" disabled>
                            Select a company
                          </MenuItem>
                          <MenuItem value="6799f0cd6a01edbe1bc3fcea">
                            BizNest
                          </MenuItem>
                          {clientsData.map((item) => (
                            <MenuItem key={item._id} value={item._id}>
                              {item.clientName}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </>
                ) : (
                  <div>
                    <TextField
                      fullWidth
                      size="small"
                      value={`${auth.user?.company?.companyName} `}
                      disabled
                      label={`Company`}
                    />
                  </div>
                )}
                <div className="hidden">
                  <Controller
                    name="internalBooked"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        value={`${auth.user?._id} `}
                        disabled
                        label={`${
                          isReceptionist ? "Receptionist" : "Booked By"
                        }`}
                      />
                    )}
                  />
                </div>
                <TextField
                  name="internalBooked"
                  fullWidth
                  size="small"
                  value={`${auth.user?.firstName} ${auth.user?.lastName} `}
                  disabled
                  label={`${isReceptionist ? "Receptionist" : "Booked By"}`}
                />

                {isReceptionist ? (
                  <div className="col-span-2">
                    <Controller
                      name="bookedBy"
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          options={employees}
                          getOptionLabel={(user) =>
                            isBizNest
                              ? `${user.firstName ?? ""} ${user.lastName ?? ""}`
                              : `${user.employeeName ?? ""}`
                          }
                          value={
                            employees.find((u) => u._id === field.value) || null
                          }
                          onFocus={() => setShouldFetchParticipants(true)}
                          onChange={(_, newValue) =>
                            field.onChange(newValue?._id || "")
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Booked by"
                              size="small"
                              fullWidth
                            />
                          )}
                        />
                      )}
                    />
                  </div>
                ) : null}
                <div className="col-span-2 sm:col-span-1 md:col-span-2">
                  <div className="">
                    <Controller
                      name="internalParticipants"
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          multiple
                          options={employees}
                          getOptionLabel={(user) =>
                            isBizNest
                              ? `${user.firstName ?? ""} ${user.lastName ?? ""}`
                              : `${user.employeeName ?? ""} (${
                                  user.clientName ?? ""
                                }`
                          }
                          onFocus={() => setShouldFetchParticipants(true)}
                          onChange={(_, newValue) =>
                            field.onChange(newValue.map((user) => user._id))
                          }
                          renderTags={(selected, getTagProps) =>
                            selected.map((user, index) => (
                              <Chip
                                key={user._id}
                                label={
                                  isBizNest
                                    ? `${user.firstName ?? ""} ${
                                        user.lastName ?? ""
                                      }`
                                    : `${user.employeeName ?? ""} (${
                                        user.clientName ?? ""
                                      })`
                                }
                                {...getTagProps({ index })}
                                deleteIcon={<IoMdClose />}
                              />
                            ))
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Select Participants"
                              size="small"
                              fullWidth
                            />
                          )}
                        />
                      )}
                    />
                  </div>
                </div>
              </>
            ) : null}
            {/* New Start */}
            {meetingType === "External" ? (
              <>
                <div className="col-span-1">
                  <Controller
                    name="externalCompany"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="Select External Company"
                        size="small"
                        fullWidth
                      >
                        <MenuItem value="" disabled>
                          Select a company
                        </MenuItem>
                        {externalUsers
                          .filter((item) => item.visitorFlag === "Client")
                          .map((user) => (
                            <MenuItem key={user._id} value={user._id}>
                              {user.registeredClientCompany ?? ""}
                            </MenuItem>
                          ))}
                      </TextField>
                    )}
                  />
                </div>
                <div className="col-span-1">
                  <Controller
                    name="externalParticipants"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        multiple
                        options={externalUsers.filter(
                          (item) =>
                            item.visitorFlag === "Client" &&
                            item.clientCompany ===
                              externalUsers.find(
                                (v) => v._id === externalCompany
                              )?.clientCompany
                        )}
                        getOptionLabel={(user) =>
                          `${user.firstName} ${user.lastName}`
                        } // Display names
                        onChange={(_, newValue) =>
                          field.onChange(
                            newValue.map((user) => ({ name: user.firstName }))
                          )
                        } // Sync selected users with form state
                        renderTags={(selected, getTagProps) =>
                          selected.map((user, index) => (
                            <Chip
                              key={user._id}
                              label={`${user.firstName}`}
                              {...getTagProps({ index })}
                              deleteIcon={<IoMdClose />}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Participants"
                            size="small"
                            fullWidth
                          />
                        )}
                      />
                    )}
                  />
                </div>
              </>
            ) : null}
            {meetingType === "External" && (
              <>
                {fields.map((field, index) => (
                  <React.Fragment key={field.id}>
                    <Controller
                      name={`externalParticipants.${index}.name`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          label={`Name ${index + 1}`}
                          placeholder="John Doe"
                          {...field}
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                    <Controller
                      name={`externalParticipants.${index}.mobileNumber`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          label={`Mobile Number ${index + 1}`}
                          placeholder="+919876543210"
                          {...field}
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </React.Fragment>
                ))}

                <div className="col-span-2 place-items-center">
                  <PrimaryButton
                    title="Add Participant"
                    type="button"
                    handleSubmit={() => append({ name: "", mobileNumber: "" })}
                  />
                </div>
              </>
            )}
            {/* {meetingType === "External" && (
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 p-2 col-span-2">
                <Controller
                  name="paymentAmount"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Payment Amount"
                      fullWidth
                      onChange={(e) => field.onChange(e.target.value)}
                      value={field.value}
                    />
                  )}
                />
                <Controller
                  name="paymentStatus"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Payment Status"
                      select
                      fullWidth
                    >
                      <MenuItem value="" disabled>
                        Select Payment Status
                      </MenuItem>
                      <MenuItem value="paid">Paid</MenuItem>
                      <MenuItem value="unpaid">Unpaid</MenuItem>
                    </TextField>
                  )}
                />
               
              </div>
            )} */}

            {/* New End */}
            <div className="col-span-2 sm:col-span-1 md:col-span-2">
              <Controller
                name="subject"
                control={control}
                rules={{
                  validate: {
                    noOnlyWhitespace,
                  },
                }}
                render={({ field }) => (
                  <TextField
                    label={"Subject"}
                    placeholder="Product Demonstration"
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    error={!!errors.subject}
                    helperText={errors?.subject?.message}
                  />
                )}
              />
            </div>
            <div className="col-span-2 sm:col-span-1 md:col-span-2 sm">
              <Controller
                name="agenda"
                control={control}
                rules={{
                  validate: {
                    noOnlyWhitespace,
                  },
                }}
                render={({ field }) => (
                  <TextField
                    label={"Agenda"}
                    placeholder="Agenda"
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    error={!!errors.agenda}
                    helperText={errors?.agenda?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <PrimaryButton
              title="Submit"
              type="submit"
              disabled={isCreateMeeting}
              isLoading={isCreateMeeting}
            />
          </div>
        </form>
      </MuiModal>
    </div>
  );
};

export default MeetingFormLayout;
