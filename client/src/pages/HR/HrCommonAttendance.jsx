import AgTable from "../../components/AgTable";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useMutation, useQuery } from "@tanstack/react-query";
import humanDate from "../../utils/humanDateForamt";
import useAuth from "../../hooks/useAuth";
import { CircularProgress, TextField } from "@mui/material";
import humanTime from "../../utils/humanTime";
import dayjs from "dayjs";
import { formatDuration } from "../../utils/dateFormat";
import { useState } from "react";
import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { Controller, useForm } from "react-hook-form";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import MuiModal from "../../components/MuiModal";
import { queryClient } from "../../main";
import { toast } from "sonner";
import YearWiseTable from "../../components/Tables/YearWiseTable";
import { isAlphanumeric, noOnlyWhitespace } from "../../utils/validators";

const HrCommonAttendance = () => {
  const { auth } = useAuth();
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      targetedDay: null,
      inTime: null,
      outTime: null,
      reason: "",
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
  ];

  const fetchAttendance = async () => {
    if (!auth?.user?.empId) throw new Error("User not found");
    const response = await axios.get(
      `/api/attendance/get-attendance/${auth.user.empId}`
    );
    const data = response.data;
    return Array.isArray(data) ? data : data?.attendance ?? [];
  };

  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ["attendance"],
    queryFn: fetchAttendance,
    enabled: !!auth?.user?.empId, // only run if empId exists
  });

  const { mutate: correctionPost, isPending: correctionPending } = useMutation({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        empId: auth?.user?.empId || "",
      };
      const response = await axios.post(
        "/api/attendance/correct-attendance",
        payload
      );
      return response.data;
    },
    onSuccess: (data) => {
      setOpenModal(false);
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      reset();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Error submitting correction"
      );
    },
  });

  const onSubmit = (data) => {
    if (!auth?.user?.empId) return toast.error("User not found");

    correctionPost(data);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        {isLoading ? (
          <div className="flex justify-center items-center">
            <CircularProgress color="#1E3D73" />
          </div>
        ) : (
          <YearWiseTable
            tableTitle={`Attendance Table`}
            dateColumn={"date"}
            columns={attendanceColumns}
            buttonTitle={"Correction Request"}
            handleSubmit={() => {
              setOpenModal(true);
            }}
            data={
              attendance.length > 0
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
                    breakHours: record?.breakDuration?.toFixed(2) ?? "N/A",
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
          />
        )}
      </div>

      <MuiModal
        title={"Correction Request"}
        open={openModal}
        onClose={() => setOpenModal(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(time) => {
                    field.onChange(time ? time.toISOString() : null);
                  }}
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
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(time) => {
                    field.onChange(time ? time.toISOString() : null);
                  }}
                />
              )}
            />
          </LocalizationProvider>
          <Controller
            name="reason"
            control={control}
            rules={{
              required: "Please specify your reason",
              validate: { noOnlyWhitespace, isAlphanumeric },
            }}
            render={({ field }) => (
              <>
                <TextField
                  {...field}
                  size="small"
                  label="Reason"
                  fullWidth
                  multiline
                  rows={3} // ← Change this number to increase/decrease height
                  error={!!errors?.reason}
                  helperText={errors?.reason?.message}
                />
              </>
            )}
          />

          <div className="flex items-center justify-center gap-4">
            <SecondaryButton
              title={"Cancel"}
              handleSubmit={() => setOpenModal(false)}
            />
            <PrimaryButton
              title={"Submit"}
              type={"submit"}
              isLoading={correctionPending}
              disabled={correctionPending}
            />
          </div>
          {/* {Object.keys(errors).length > 0 && (
            <pre className="text-red-500">
              {JSON.stringify(errors, null, 2)}
            </pre>
          )} */}
        </form>
      </MuiModal>
    </div>
  );
};

export default HrCommonAttendance;
