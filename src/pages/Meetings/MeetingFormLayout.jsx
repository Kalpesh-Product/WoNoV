import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import MuiModal from "../../components/MuiModal";
import { useForm, Controller } from "react-hook-form";
import {
  Autocomplete,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import {
  DesktopDatePicker,
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
import { convertToISOFormat } from "../../utils/dateFormat";

const MeetingFormLayout = () => {
  const [open, setOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const location = searchParams.get("location");
  const meetingRoom = searchParams.get("meetingRoom");
  const [events, setEvents] = useState([]);
  const locationState = useLocation().state;
  const roomId = locationState?.roomId;
  const axios = useAxiosPrivate();
  const navigate = useNavigate();

  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      meetingType: "Internal",
      location: location,
      meetingRoom: meetingRoom,
      startDate: null, // Ensure null
      endDate: null, // Ensure null
      startTime: null, // Watch startTime dynamically
      endTime: null,
      companyName: "",
      personName: "",
      registeredCompanyName: "",
      companyUrl: "",
      emailId: "",
      mobileNo: "",
      gst: "",
      pan: "",
      address: "",
      bookingForInternal: [],
      bookingForExternal: [],
      subject: "",
      agenda: "",
    },
  });

  const meetingType = watch("meetingType");

  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await axios.get("/api/users/fetch-users");
      const formattedUsers = response.data.map((user) => ({
        label: user.name,
        id: user._id,
      }));
      console.log(formattedUsers);
      return formattedUsers;
    },
  });

  const {
    data: companies = [],
    isLoading: companiesLoading,
    error: companiesError,
  } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await axios.get("/api/company/get-companies");
      console.log(response.data);
      return response.data;
    },
  });

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const response = await axios.get("/api/meetings/get-meetings");
      const filteredMeetings = response.data.filter(
        (meeting) => meeting.roomName === meetingRoom
      );
      console.log(filteredMeetings);
      return filteredMeetings;
    },
  });

  const meetingMutation = useMutation({
    mutationFn: async (data) => {
      await axios.post("/api/meetings/create-meeting", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["meetings"]);
      toast.success("Meeting booked successfully");
      setOpen(false);
      navigate("/app/meetings/calendar");
    },
    onError: () => {
      toast.error("Failed to book meeting");
    },
  });

  useEffect(() => {
    if (!location || !meetingRoom) {
      alert("Missing required parameters. Redirecting...");
      window.location.href = "/";
    }
  }, [location, meetingRoom]);

  useEffect(() => {
    if (isLoading || !Array.isArray(meetings)) return;

    const newEvents = meetings.map((meeting) => {
      const startDate = convertToISOFormat(meeting.date, meeting.startTime);
      const endDate = convertToISOFormat(meeting.date, meeting.endTime);

      return {
        title: meeting.subject || "Meeting",
        start: startDate,
        end: endDate,
        allDay: false,
        extendedProps: {
          // location: location,
          // meetingRoom: meeting.roomName,
          // agenda: meeting.agenda,
        },
      };
    });

    setEvents(newEvents);
  }, [meetings, isLoading, location]);

  const handleDateClick = (arg) => {
    if (!arg.start) return;

    const startTime = dayjs(arg.start); // Keep as a Dayjs object
    const endTime = dayjs(arg.start).add(30, "minute");
    const selectedDate = dayjs(arg.start).startOf("day"); // Get only the date part

    setValue("startDate", selectedDate); // Set only the date
    setValue("endDate", selectedDate); // Set only the date
    setValue("startTime", startTime); // Set the correct format for MUI TimePicker
    setValue("endTime", endTime);

    setOpen(true);
  };

  const onSubmit = (data) => {
    const formattedData = {
      meetingType: data.meetingType,
      bookedRoom: roomId,
      startDate: data.startDate,
      endDate: data.endDate,
      startTime: data.startTime,
      endTime: data.endTime,
      subject: data.subject,
      agenda: data.agenda,
      internalParticipants:
        data.meetingType === "Internal"
          ? data.bookingForInternal?.map((participant) => participant.id) // Convert to object array
          : [],
      externalParticipants:
        data.meetingType === "External"
          ? data.bookingForExternal?.map((email) => ({ email })) // Convert to object array
          : [],
      externalCompanyData:
        data.meetingType === "External"
          ? {
              companyName: data.companyName,
              registeredCompanyName: data.registeredCompanyName,
              companyURL: data.companyUrl,
              email: data.emailId,
              mobileNumber: data.mobileNo,
              gstNumber: data.gst,
              panNumber: data.pan,
              address: data.Address,
              personName: data.personName,
            }
          : null,
    };

    meetingMutation.mutate(formattedData);
  };

  return (
    <div className="p-4">
      <div className="w-full text-center">
        <span className="text-title text-primary font-pregular mb-4">
          Schedule Meeting in {location}-{meetingRoom}
        </span>
      </div>
      <div className="w-full h-full overflow-y-auto">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <FullCalendar
            key={events.length}
            headerToolbar={{
              left: "prev title next",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridDay"
            contentHeight={425}
            dayMaxEvents={2}
            eventDisplay="block"
            selectable={true}
            selectMirror={true}
            select={handleDateClick}
            events={events} // Pass the events state here
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
          className="flex flex-col px-8 w-full gap-4"
        >
          {/* Two Input Fields */}
          <div className="flex gap-4">
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Location"
                  variant="outlined"
                />
              )}
            />
            <Controller
              name="meetingRoom"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Meeting Room"
                  variant="outlined"
                />
              )}
            />
          </div>

          {/* Date Picker */}
          <div className="flex gap-4">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <DesktopDatePicker
                    label="Start Date"
                    value={field.value ? dayjs(field.value) : null} // Ensure it's a Dayjs object
                    onChange={(newValue) => field.onChange(newValue)}
                    renderInput={(params) => (
                      <TextField fullWidth {...params} />
                    )}
                  />
                )}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <DesktopDatePicker
                    label="End Date"
                    value={field.value ? dayjs(field.value) : null} // Ensure it's a Dayjs object
                    onChange={(newValue) => field.onChange(newValue)}
                    renderInput={(params) => (
                      <TextField fullWidth {...params} />
                    )}
                  />
                )}
              />
            </LocalizationProvider>
          </div>

          {/* Start & End Time */}
          <div className="flex gap-4 mb-4">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    label="Start Time"
                    value={field.value ? dayjs(field.value) : null} // Ensure it's a Dayjs object
                    onChange={(newValue) => field.onChange(newValue)}
                    renderInput={(params) => (
                      <TextField fullWidth {...params} />
                    )}
                  />
                )}
              />
            </LocalizationProvider>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    label="End Time"
                    {...field}
                    renderInput={(params) => (
                      <TextField fullWidth {...params} />
                    )}
                  />
                )}
              />
            </LocalizationProvider>
          </div>

          {/* Meeting Type Dropdown */}
          <FormControl fullWidth>
            <InputLabel>Meeting Type</InputLabel>
            <Controller
              name="meetingType"
              control={control}
              render={({ field }) => (
                <Select {...field} label="Meeting Type">
                  <MenuItem value="Internal">Internal</MenuItem>
                  <MenuItem value="External">External</MenuItem>
                </Select>
              )}
            />
          </FormControl>

          {/* Conditional Inputs Based on Meeting Type */}
          {meetingType === "Internal" ? (
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex gap-4">
                <FormControl fullWidth>
                  <InputLabel>Company Name</InputLabel>
                  <Controller
                    name="companyName"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Company Name">
                        <MenuItem value="">Select Company</MenuItem>
                        {companiesLoading ? (
                          <MenuItem disabled>
                            <CircularProgress size={20} />
                          </MenuItem>
                        ) : companiesError ? (
                          <MenuItem disabled>Error fetching companies</MenuItem>
                        ) : (
                          companies.map((company) => (
                            <MenuItem
                              key={company._id}
                              value={company.companyName}
                            >
                              {company.companyName}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    )}
                  />
                </FormControl>
                <Controller
                  name="personName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Person Name"
                      variant="outlined"
                    />
                  )}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex gap-4">
                <Controller
                  name="companyName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Company Name"
                      variant="outlined"
                    />
                  )}
                />
                <Controller
                  name="personName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Person Name"
                      variant="outlined"
                    />
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Controller
                  name="registeredCompanyName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Registered Company Name"
                      variant="outlined"
                    />
                  )}
                />
                <Controller
                  name="companyUrl"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Company URL"
                      variant="outlined"
                    />
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Controller
                  name="emailId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email ID"
                      variant="outlined"
                    />
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Controller
                  name="mobileNo"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Mobile No"
                      variant="outlined"
                    />
                  )}
                />
                <Controller
                  name="gst"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="GST"
                      variant="outlined"
                    />
                  )}
                />
              </div>
              <div className="flex gap-4">
                <Controller
                  name="pan"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="PAN"
                      variant="outlined"
                    />
                  )}
                />
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Address"
                      variant="outlined"
                    />
                  )}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {meetingType === "Internal" &&
            !usersLoading &&
            !usersError &&
            Array.isArray(users) &&
            users.length > 0 ? (
              <Controller
                name="bookingForInternal"
                control={control}
                defaultValue={[]} // Ensure default value is an array
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    multiple
                    options={Array.isArray(users) ? users : []} // Ensure users is always an array
                    getOptionLabel={(option) =>
                      typeof option === "string" ? option : option.label
                    }
                    isOptionEqualToValue={(option, value) =>
                      option?.id === value?.id
                    }
                    onChange={(_, value) => field.onChange(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Booking For Internal"
                        fullWidth
                      />
                    )}
                  />
                )}
              />
            ) : (
              <Controller
                name="bookingForExternal"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    multiple
                    freeSolo
                    options={[]} // No predefined options; users can enter anything
                    onChange={(_, value) => field.onChange(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Booking For External"
                        placeholder="Type emails and press Enter"
                        fullWidth
                      />
                    )}
                  />
                )}
              />
            )}

            <Controller
              name="subject"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Subject"
                  variant="outlined"
                />
              )}
            />
            <Controller
              name="agenda"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Agenda"
                  variant="outlined"
                />
              )}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <PrimaryButton
              title="Submit"
              type="submit"
              fontSize="text-content"
              externalStyles="mt-4 w-48"
            />
          </div>
        </form>
      </MuiModal>
    </div>
  );
};

export default MeetingFormLayout;
