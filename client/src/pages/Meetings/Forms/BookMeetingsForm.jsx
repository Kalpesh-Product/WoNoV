import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
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
import MuiModal from "../../../components/MuiModal";
import PrimaryButton from "../../../components/PrimaryButton";

const BookMeetingsForm = () => {
  const [open, setOpen] = useState(false);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      meetingType: "Internal",
      firstInput: "",
      secondInput: "",
      date: null,
      startTime: null,
      endTime: null,
      companyName: "",
      personName: "",
      registeredCompanyName: "",
      companyUrl: "",
      anotherCompanyUrl: "",
      emailId: "",
      mobileNo: "",
      gst: "",
      pan: "",
      Address: "",
      bookingFor: "",
      subject: "",
      agenda: "",
    },
  });

  const meetingType = watch("meetingType");

  const onSubmit = (data) => {
    data;
    setOpen(false);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Open Modal
      </Button>

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
              name="firstInput"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="First Input"
                  variant="outlined"
                />
              )}
            />
            <Controller
              name="secondInput"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Second Input"
                  variant="outlined"
                />
              )}
            />
          </div>

          {/* Date Picker */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DesktopDatePicker
                  label="Select Date"
                  {...field}
                  renderInput={(params) => <TextField fullWidth {...params} />}
                />
              )}
            />
          </LocalizationProvider>

          {/* Start & End Time */}
          <div className="flex gap-4 mb-4">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    label="Start Time"
                    {...field}
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
                    slotProps={{ textField: { size: "small" } }}
                    renderInput={(params) => (
                      <TextField fullWidth size="small" {...params} />
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
                        <MenuItem value={1}>Option 1</MenuItem>
                        <MenuItem value={2}>Option 2</MenuItem>
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
                {/* <Controller
                  name="anotherCompanyUrl"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Another Company URL"
                      variant="outlined"
                    />
                  )}
                /> */}
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
                  name="Address"
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
            <FormControl fullWidth>
              <InputLabel>Booking For</InputLabel>
              <Controller
                name="bookingFor"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Booking For">
                    <MenuItem value={1}>Option 1</MenuItem>
                    <MenuItem value={2}>Option 2</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
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

export default BookMeetingsForm;
