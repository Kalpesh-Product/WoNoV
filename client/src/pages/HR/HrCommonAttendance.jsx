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
import MonthWiseTable from "../../components/Tables/MonthWiseTable";

const HrCommonAttendance = () => {
  const { auth } = useAuth();
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);
  const { control, reset, handleSubmit } = useForm({
    defaultValues: {
      targetedDay: null,
      inTime: null,
      outTime: null,
    },
  });
  const attendanceColumns = [
    { field: "id", headerName: "Sr No", width: 100 },
    { field: "date", headerName: "Date", width: 200, sort :'asc' },
    { field: "inTime", headerName: "In Time" },
    { field: "outTime", headerName: "Out Time" },
    { field: "workHours", headerName: "Work Hours" },
    { field: "breakHours", headerName: "Break Hours" },

    { field: "totalHours", headerName: "Total Hours" },
    // { field: "entryType", headerName: "Entry Type" },
  ];

  const fetchAttendance = async () => {
    try {
      const response = await axios.get(
        `/api/attendance/get-attendance/${auth.user.empId}`
      );
      const data = response.data;
      return Array.isArray(data) ? data : data.attendance ?? [];
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
      const response = await axios.patch("/api/attendance/correct-attendance", {
        ...data,
        empId: auth.user.empId,
      });
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

  const onSubmit = (data) => {
    correctionPost(data);
    reset();
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div>
          {isLoading ? (
            <div className="flex justify-center items-center">
              <CircularProgress color="#1E3D73" />
            </div>
          ) : (
            // <AgTable
            //   key={isLoading ? 1 : attendance.length}

            //   paginationPageSize={20}
            //   buttonTitle={"Correction Request"}
            //   tableHeight={300}
            //   search={true}
            //   searchColumn={"Date"}
            //    handleClick={() => {
            //   setOpenModal(true);
            // }}

            // />
            <MonthWiseTable
              tableTitle={`Attendance Table`}
              dateColumn={"date"}
              columns={attendanceColumns}
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
                  : attendance?.map((record, index) => ({
                      id: index + 1,
                      date: (record.inTime),
                      inTime: record?.inTime ? humanTime(record.inTime) : "N/A",
                      outTime: record?.outTime
                        ? humanTime(record.outTime)
                        : "N/A",
                      workHours: formatDuration(
                        record?.inTime,
                        record?.outTime
                      ),
                      breakHours: record.breakDuration,
                      totalHours: formatDuration(
                        record?.inTime,
                        record?.outTime
                      ),
                      entryType: record.entryType,
                    }))
              }
            />
          )}
        </div>
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

export default HrCommonAttendance;
