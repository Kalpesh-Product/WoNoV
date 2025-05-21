import React from "react";
import AgTable from "../../components/AgTable";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import humanDate from "../../utils/humanDateForamt";
import useAuth from "../../hooks/useAuth";
import { CircularProgress, MenuItem, TextField } from "@mui/material";
import { useState } from "react";
import { toast } from "sonner";
import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { Controller, useForm } from "react-hook-form";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import MuiModal from "../../components/MuiModal";
import dayjs from "dayjs";
import { useEffect } from "react";

const HrCommonLeaves = () => {
  const { auth } = useAuth();
  const axios = useAxiosPrivate();
    const queryClient = useQueryClient();
      const { control, reset, handleSubmit, formState: { errors }} = useForm({
        defaultValues: {
          fromDate: null,
          toDate: null,
          leaveType:"",
          leavePeriod:null,
          hours:null,
          description:""
        },
      });
    const [openModal, setOpenModal] = useState(false);
 const leaveType = ["Privileged","Sick"]
  const leavePeriod = ["Partial","Single","Multiple"]

  const leavesColumn = [
    { field: "id", headerName: "Sr No",sort:"desc" },
    { field: "fromDate", headerName: "From Date" },
    { field: "toDate", headerName: "To Date" },
    { field: "leaveType", headerName: "Leave Type" },
    { field: "leavePeriod", headerName: "Leave Period" },
    { field: "hours", headerName: "Hours" },
    { field: "description", headerName: "Description" },
    { field: "status", headerName: "Status" },
  ];

    const { data: leaves = [],isLoading } = useQuery({
    queryKey: ["leaves"],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/leaves/view-leaves/${auth.user.empId}`);
        // return response.data;
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

   const { mutate: correctionPost, isPending: correctionPending } = useMutation({
      mutationFn: async (data) => {
        const response = await axios.post("/api/leaves/request-leave", {
          ...data,
          empId: auth.user.empId,
        });
        return response.data;
      },
      onSuccess: function (data) {
        setOpenModal(false);
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["leaves"] });
        reset();
      },
      onError: function (error) {
        toast.error(error.response.data.message);
      },
    });

     const onSubmit = (data) => {
    correctionPost(data);
  };

  useEffect(()=>{
console.log("leaves",leaves)
  },[leaves])


  return (
    <div className="flex flex-col gap-8">
      <div>
        <div>
          {isLoading ? (
            <div className="flex justify-center items-center">
              <CircularProgress color="#1E3D73" />
            </div>
          ) : (
            <AgTable
              key={isLoading ? 1 : leaves.length}
              tableTitle={`Leaves Table`}
              paginationPageSize={20}
              buttonTitle={"Leave Request"}
              tableHeight={300}
              search={true}
               handleClick={() => {
            setOpenModal(true);
          }}
              data={
                isLoading
                  ? [
                      {
                        id: "loading",
                        fromDate: "Loading...",
                        toDate: "-",
                        leaveType: "-",
                        leavePeriod: "-",
                        hours: "-",
                        description: "-",
                        status: "-",
                      },
                    ]
                  : leaves.map((leave, index) => ({
                      id: index + 1,
                      fromDate: humanDate(leave.fromDate),
                      toDate: humanDate(leave.toDate),
                      leaveType: leave.leaveType,
                      leavePeriod: leave.leavePeriod,
                      hours: leave.hours,
                      description: leave.description,
                      status: leave.status,
                    }))
              }
              columns={leavesColumn}
            />
          )}
        </div>
      </div>
       <MuiModal
              title={"Leave Request"}
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
                    name="fromDate"
                    control={control}
                    render={({ field }) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          {...field}
                          label={"From Date"}
                          format="DD-MM-YYYY"
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(date) => {
                            field.onChange(date ? date.toISOString() : null);
                          }}
                        />
                      </LocalizationProvider>
                    )}
                  />
                  <Controller
                    name="toDate"
                    control={control}
                    render={({ field }) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          {...field}
                          label={"To Date"}
                          format="DD-MM-YYYY"
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(date) => {
                            field.onChange(date ? date.toISOString() : null);
                          }}
                        />
                      </LocalizationProvider>
                    )}
                  />
                  <Controller
                  name="hours"
                  control={control}
                  rules={{ required: "Hours is required" }}
                  render={({ field }) => (
                    <TextField
                      size="small"
                      {...field}
                      label="Hours"
                      type="number"
                      // helperText={errors.quantity?.message}
                    />
                  )}
                />
                <Controller
                    name="leaveType"
                                  control={control}
                                  defaultValue=""
                                  rules={{ required: "Leavetype is required" }}
                                  render={({ field }) => (
                                    <TextField
                                      {...field}
                                      fullWidth
                                      select
                                      label="Leave type"
                                      size="small"
                                    >
                                      {leaveType.map((type) => (
                                        <MenuItem key={leaveType.length} value={type}>
                                          {type}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                    )}
                />
                <Controller
                    name="leavePeriod"
                                  control={control}
                                  defaultValue=""
                                  rules={{ required: "LeavePeriod is required" }}
                                  render={({ field }) => (
                                    <TextField
                                      {...field}
                                      fullWidth
                                      select
                                      label="Leave period"
                                      size="small"
                                    >
                                      {leavePeriod.map((period) => (
                                        <MenuItem key={leavePeriod.length} value={period}>
                                          {period}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                    )}
                />
                 <Controller
                                name="description"
                                rules={{ required: "Please specify your description" }}
                                control={control}
                                render={({ field }) => (
                                  <>
                                    <TextField
                                      {...field}
                                      size="small"
                                      label="Description"
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

export default HrCommonLeaves;
