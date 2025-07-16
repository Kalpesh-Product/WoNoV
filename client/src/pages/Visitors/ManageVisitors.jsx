import { useState } from "react";
import AgTable from "../../components/AgTable";
import PrimaryButton from "../../components/PrimaryButton";
import { useQuery, useMutation } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import humanTime from "../../utils/humanTime";
import DetalisFormatted from "../../components/DetalisFormatted";
import MuiModal from "../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { TextField } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { queryClient } from "../../main";
import { toast } from "sonner";
import ThreeDotMenu from "../../components/ThreeDotMenu";
import PageFrame from "../../components/Pages/PageFrame";
import YearWiseTable from "../../components/Tables/YearWiseTable";

const ManageVisitors = () => {
  const axios = useAxiosPrivate();
  const [modalMode, setModalMode] = useState("view");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const { setValue, handleSubmit, reset, control } = useForm();
  
  const { data: visitorsData = [], isPending: isVisitorsData } = useQuery({
    queryKey: ["visitors"],
    queryFn: async () => {
      const response = await axios.get("/api/visitors/fetch-visitors");
      return response.data;
    },
  });

  const { mutate, isPending: isUpdating } = useMutation({
    mutationFn: async (updatedData) => {
      const response = await axios.patch(
        `/api/visitors/update-visitor/${selectedVisitor.mongoId}`,
        updatedData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      toast.success("Visitor updated successfully");
      handleCloseModal();
    },
    onError: (error) => {
      toast.error(error.message || "Update failed");
    },
  });

  const openModalWithMode = (visitor, mode) => {
    setSelectedVisitor(visitor);
    setModalMode(mode);
    setIsModalOpen(true);

    if (mode === "edit") {
      setValue("firstName", visitor.firstName || "");
      setValue("lastName", visitor.lastName || "");
      setValue("email", visitor.email || "");
      setValue("phoneNumber", visitor.phoneNumber || "");
      setValue("purposeOfVisit", visitor.purposeOfVisit || "");
      setValue(
        "checkOutRaw",
        visitor.checkOutRaw ? dayjs(visitor.checkOutRaw) : null
      );
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalMode("view");
    setSelectedVisitor(null);
  };

  const submit = (data) => {
    mutate({
      ...data,
      checkOut: data.checkOutRaw ? dayjs(data.checkOutRaw).toISOString() : null,
    });
  };

  const visitorsColumns = [
    { field: "srNo", headerName: "Sr No" },
    { field: "firstName", headerName: "First Name" },
    { field: "lastName", headerName: "Last Name" },
    { field: "email", headerName: "Email" },
    { field: "phoneNumber", headerName: "Phone No" },
    { field: "purposeOfVisit", headerName: "Purpose" },
    { field: "toMeet", headerName: "To Meet" },
    {
      field: "checkIn",
      headerName: "Check In",
      cellRenderer: (params) => humanTime(params.value),
    },
    { field: "checkOut", headerName: "Checkout" },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: ({ data }) => {
        return (
          <ThreeDotMenu
            menuItems={[
              {
                label: "View details",
                onClick: () => openModalWithMode(data, "view"),
              },
              {
                label: "Edit",
                onClick: () => openModalWithMode(data, "edit"),
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <div>
      <PageFrame>
        <YearWiseTable
          dateColumn={"checkIn"}
          search
          tableTitle="Visitors Today"
          data={visitorsData
            .filter((m) => m.visitorFlag !== "Client")
            .map((item, index) => ({
              srNo: index + 1,
              mongoId: item._id,
              firstName: item.firstName,
              lastName: item.lastName,
              email: item.email,
              phoneNumber: item.phoneNumber,
              purposeOfVisit: item.purposeOfVisit,
              toMeet: `${item?.toMeet?.firstName || ""} ${
                item?.toMeet?.lastName || ""
              }`,
              checkIn: item.checkIn,
              checkOut: item.checkOut ? humanTime(item.checkOut) : "",
              checkOutRaw: item.checkOut,
            }))}
          columns={visitorsColumns}
        />
      </PageFrame>

      <MuiModal
        open={isModalOpen}
        onClose={handleCloseModal}
        title="Visitor Details"
      >
        <form
          onSubmit={handleSubmit(submit)}
          className="grid grid-cols-1 gap-4"
        >
          {modalMode === "view" ? (
            <>
              <DetalisFormatted
                title="First Name"
                detail={selectedVisitor?.firstName}
              />
              <DetalisFormatted
                title="Last Name"
                detail={selectedVisitor?.lastName}
              />
              <DetalisFormatted
                title="Phone Number"
                detail={selectedVisitor?.phoneNumber}
              />
              <DetalisFormatted title="Email" detail={selectedVisitor?.email} />
              <DetalisFormatted
                title="Purpose"
                detail={selectedVisitor?.purposeOfVisit}
              />
              <DetalisFormatted
                title="Checkout"
                detail={
                  selectedVisitor?.checkOutRaw
                    ? humanTime(selectedVisitor.checkOutRaw)
                    : ""
                }
              />
            </>
          ) : (
            <>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    size="small"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    size="small"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Phone Number"
                    size="small"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Email" size="small" fullWidth />
                )}
              />
              <Controller
                name="purposeOfVisit"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Purpose"
                    size="small"
                    fullWidth
                  />
                )}
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Controller
                  name="checkOutRaw"
                  control={control}
                  render={({ field }) => (
                    <TimePicker
                      label="Checkout Time"
                      value={field.value}
                      onChange={field.onChange}
                      slotProps={{
                        textField: { size: "small", fullWidth: true },
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
              <PrimaryButton
                title={isUpdating ? "Saving..." : "Save"}
                disabled={isUpdating}
                type="submit"
              />
            </>
          )}
        </form>
      </MuiModal>
    </div>
  );
};

export default ManageVisitors;
