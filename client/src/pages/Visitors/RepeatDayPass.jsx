import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { MenuItem, TextField } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { toast } from "sonner";
import AgTable from "../../components/AgTable";
import MuiModal from "../../components/MuiModal";
import PageFrame from "../../components/Pages/PageFrame";
import PrimaryButton from "../../components/PrimaryButton";
import ThreeDotMenu from "../../components/ThreeDotMenu";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { queryClient } from "../../main";
import { PERMISSIONS } from "../../constants/permissions";
import useAuth from "../../hooks/useAuth";

const PURPOSE_OPTIONS = ["Full Day Pass", "Half Day Pass"];

const RepeatDayPass = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const canRepeatClient = userPermissions.includes(
    PERMISSIONS.VISITORS_MIX_BAG_REPEAT_CLIENT.value,
  );

  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      visitorName: "",
      company: "",
      purposeOfVisit: "Full Day Pass",
      checkInTime: null,
      checkOutTime: null,
    },
  });

  const { data: visitorsData = [], isPending } = useQuery({
    queryKey: ["mix-bag-repeat-day-pass"],
    queryFn: async () => {
      const response = await axios.get("/api/visitors/fetch-visitors");
      return response.data;
    },
  });

  const repeatDayPassRows = useMemo(
    () =>
      visitorsData
        .filter((visitor) => {
          const isExternalClient = visitor?.visitorFlag === "Client";
          const purpose = (visitor?.purposeOfVisit || "").trim().toLowerCase();
          return (
            isExternalClient
            && (purpose === "full day pass" || purpose === "half day pass")
          );
        })
        .map((visitor, index) => ({
          srNo: index + 1,
          id: visitor._id,
          visitorName:
            `${visitor?.firstName || ""} ${visitor?.lastName || ""}`.trim()
            || "N/A",
          company:
            visitor?.visitorCompany
            || visitor?.brandName
            || visitor?.registeredClientCompany
            || "N/A",
          raw: visitor,
        })),
    [visitorsData],
  );

  const repeatClientMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post(
        `/api/visitors/repeat-client/${selectedVisitor?.id}`,
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Repeat client created successfully.");
      queryClient.invalidateQueries({ queryKey: ["mix-bag-repeat-day-pass"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      setOpenModal(false);
      setSelectedVisitor(null);
      reset();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to repeat client.");
    },
  });

  const openRepeatModal = (row) => {
    if (!canRepeatClient) {
      toast.error("You do not have permission to repeat client.");
      return;
    }

    setSelectedVisitor(row);

    const sourceCheckIn = row?.raw?.checkIn ? dayjs(row.raw.checkIn) : dayjs();
    const sourceCheckOut = row?.raw?.checkOut
      ? dayjs(row.raw.checkOut)
      : sourceCheckIn.add(4, "hour");

    reset({
      visitorName: row.visitorName,
      company: row.company,
      purposeOfVisit: "Full Day Pass",
      checkInTime: sourceCheckIn,
      checkOutTime: sourceCheckOut,
    });
    setOpenModal(true);
  };

  const submitRepeatClient = (data) => {
    const checkInTime = dayjs(data.checkInTime);
    const checkOutTime = dayjs(data.checkOutTime);

    if (!checkInTime.isValid() || !checkOutTime.isValid()) {
      toast.error("Please select valid check-in and check-out time.");
      return;
    }

    if (checkOutTime.isBefore(checkInTime)) {
      toast.error("Check-out time cannot be before check-in time.");
      return;
    }

    repeatClientMutation.mutate({
      purposeOfVisit: data.purposeOfVisit,
      checkInTime: checkInTime.toISOString(),
      checkOutTime: checkOutTime.toISOString(),
    });
  };

  const columns = [
    { field: "srNo", headerName: "Sr. No." },
    { field: "visitorName", headerName: "Visitor Name", flex: 1 },
    { field: "company", headerName: "Company", flex: 1 },
    {
      field: "action",
      headerName: "Action",
      pinned: "right",
      cellRenderer: (params) => (
        <ThreeDotMenu
          disabled={!canRepeatClient}
          menuItems={[
            {
              label: "Repeat Client",
              onClick: () => openRepeatModal(params.data),
              disabled: !canRepeatClient,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <PageFrame>
        <AgTable
          search
          tableTitle="Repeat Day Pass"
          data={repeatDayPassRows}
          columns={columns}
        />
      </PageFrame>

      <MuiModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedVisitor(null);
        }}
        title="Repeat Client"
      >
        <form
          onSubmit={handleSubmit(submitRepeatClient)}
          className="grid grid-cols-1 gap-4"
        >
          <Controller
            name="visitorName"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Visitor Name" size="small" disabled fullWidth />
            )}
          />

          <Controller
            name="company"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Company" size="small" disabled fullWidth />
            )}
          />

          <Controller
            name="purposeOfVisit"
            control={control}
            rules={{ required: "Purpose of visit is required" }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                label="Purpose of Visit"
                size="small"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                {PURPOSE_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="checkInTime"
            control={control}
            rules={{ required: "Check-in time is required" }}
            render={({ field, fieldState }) => (
              <TimePicker
                label="Check-In Time"
                value={field.value}
                onChange={field.onChange}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    error: !!fieldState.error,
                    helperText: fieldState.error?.message,
                  },
                }}
              />
            )}
          />

          <Controller
            name="checkOutTime"
            control={control}
            rules={{ required: "Check-out time is required" }}
            render={({ field, fieldState }) => (
              <TimePicker
                label="Check-Out Time"
                value={field.value}
                onChange={field.onChange}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    error: !!fieldState.error,
                    helperText: fieldState.error?.message,
                  },
                }}
              />
            )}
          />

          <PrimaryButton
            title={repeatClientMutation.isPending ? "Submitting..." : "Submit"}
            type="submit"
            disabled={repeatClientMutation.isPending}
          />
        </form>
      </MuiModal>

      {isPending && <p className="px-2 text-sm text-gray-500">Loading data...</p>}
    </div>
  );
};

export default RepeatDayPass;