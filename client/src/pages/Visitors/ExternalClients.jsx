import { useState } from "react";
import AgTable from "../../components/AgTable";
import PrimaryButton from "../../components/PrimaryButton";
import { useQuery, useMutation } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import humanTime from "../../utils/humanTime";
import DetalisFormatted from "../../components/DetalisFormatted";
import MuiModal from "../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { Chip, TextField } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { queryClient } from "../../main";
import { toast } from "sonner";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import ThreeDotMenu from "../../components/ThreeDotMenu";
import { inrFormat } from "../../utils/currencyFormat";

const ExternalClients = () => {
  const axios = useAxiosPrivate();
  const [modalMode, setModalMode] = useState("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const { data: visitorsData = [], isPending: isVisitorsData } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/visitors/fetch-visitors");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const { handleSubmit, reset, control } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      purposeOfVisit: "",
      toMeet: "",
      checkIn: "",
      checkOut: "",
    },
  });
  const handleEditToggle = () => {
    if (!isEditing && selectedVisitor) {
      reset({
        id: selectedVisitor?.mongoId,
        firstName: selectedVisitor.firstName || "",
        lastName: selectedVisitor.lastName || "",
        address: selectedVisitor.address || "",
        email: selectedVisitor.email || "",
        phoneNumber: selectedVisitor.phoneNumber || "",
        purposeOfVisit: selectedVisitor.purposeOfVisit || "",
        toMeet: selectedVisitor.toMeet || "",
        checkIn: selectedVisitor.checkIn ? selectedVisitor.checkIn : "",
        checkOutRaw: selectedVisitor?.checkOutRaw
          ? dayjs(selectedVisitor.checkOutRaw)
          : null,
      });
    }
    setIsEditing(!isEditing);
  };

  const { mutate, isPending } = useMutation({
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
      toast.error(error?.message);
    },
  });

  const visitorsColumns = [
    { field: "srNo", headerName: "Sr No", sort: "desc" },
    { field: "firstName", headerName: "First Name" },
    { field: "lastName", headerName: "Last Name" },
    { field: "email", headerName: "Email" },
    { field: "phoneNumber", headerName: "Phone No" },
    {
      field: "purposeOfVisit",
      headerName: "Purpose",
      cellStyle: { textAlign: "right" },
    },
    { field: "checkIn", headerName: "Check In" },
    { field: "checkOut", headerName: "Checkout" },
    {
      field: "paymentStatus",
      headerName: "Payment Status",
      cellRenderer: ({ value }) => (
        <Chip
          label={value}
          sx={{
            backgroundColor: value === "Paid" ? "#D1FAE5" : "#FECACA", // green-100 / red-100
            color: value === "Paid" ? "#047857" : "#B91C1C", // green-700 / red-700
            fontWeight: "bold",
          }}
        />
      ),
    },
    { field: "paymentAmount", headerName: "Amount (INR)" },
    { field: "paymentMode", headerName: "Mode" },

    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => {
        const menuItems = [
          {
            label: "View details",
            onClick: () => handleDetailsClick({ ...params.data }),
          },
          !params.data.checkOut && {
            label: "Mark as checked out",
            onClick: () => {
              const currentTimeISO = dayjs().toISOString();

              const updatePayload = {
                firstName: params.data.firstName,
                lastName: params.data.lastName,
                address: params.data.address,
                email: params.data.email,
                phoneNumber: params.data.phoneNumber,
                purposeOfVisit: params.data.purposeOfVisit,
                checkOut: currentTimeISO,
              };

              // Send update mutation
              setSelectedVisitor(params.data);
              mutate(updatePayload);
            },
          },
        ];

        return (
          <div
            role="button"
            disabled={params.data.checkOut}
            onClick={(e) => {
              e.stopPropagation(); // Prevent row selection on click
            }}
            className="rounded-full w-fit hover:bg-borderGray">
            <ThreeDotMenu menuItems={menuItems} />
          </div>
        );
      },
    },
  ];

  const handleDetailsClick = (asset) => {
    setSelectedVisitor(asset);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleAddAsset = () => {
    setModalMode("add");
    setSelectedVisitor(null);
    setIsModalOpen(true);
  };

  const submit = async (data) => {
    console.log(data);
    if (isEditing && selectedVisitor) {
      const updatePayload = {
        ...data,
        checkOut: data.checkOutRaw
          ? dayjs(data.checkOutRaw).toISOString()
          : null,
      };

      delete updatePayload.toMeet;
      delete updatePayload.checkIn;

      mutate(updatePayload);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
  };

  return (
    <div className="p-4">
      <AgTable
        key={visitorsData.length}
        search={true}
        searchColumn={"Asset Number"}
        tableTitle={"Visitors Today"}
        data={[
          ...visitorsData
            .filter((m) => m.visitorFlag === "Client")
            .map((item, index) => ({
              srNo: index + 1,
              mongoId: item._id,
              firstName: item.firstName,
              lastName: item.lastName,
              address: item.address,
              phoneNumber: item.phoneNumber,
              email: item.email,
              purposeOfVisit: item.purposeOfVisit,
              toMeet: !item?.toMeet
                ? null
                : `${item?.toMeet?.firstName} ${item?.toMeet?.lastName}`,
              checkInRaw: item.checkIn,
              checkOutRaw: item.checkOut,
              checkIn: humanTime(item.checkIn),
              checkOut: item.checkOut ? humanTime(item.checkOut) : "",
              paymentStatus:
                item?.meeting?.paymentStatus === true ? "Paid" : "Unpaid",
              paymentAmount: item?.meeting?.paymentAmount
                ? inrFormat(item?.meeting?.paymentAmount)
                : 0,
              paymentMode: item?.meeting?.paymentMode || "N/A",
              paymentDate: item?.meeting?.paymentDate || null,
            })),
        ]}
        columns={visitorsColumns}
        handleClick={handleAddAsset}
      />
      <MuiModal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={"Visitor Detail"}>
        <div className="flex flex-col gap-4">
          <form onSubmit={handleSubmit(submit)}>
            {!isVisitorsData ? (
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
                {/* First Name */}
                {isEditing ? (
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="First Name"
                        fullWidth
                      />
                    )}
                  />
                ) : (
                  <DetalisFormatted
                    title="First Name"
                    detail={selectedVisitor.firstName}
                  />
                )}

                {/* Last Name */}
                {isEditing ? (
                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Last Name"
                        fullWidth
                      />
                    )}
                  />
                ) : (
                  <DetalisFormatted
                    title="Last Name"
                    detail={selectedVisitor.lastName}
                  />
                )}

                {/* Phone Number */}
                {isEditing ? (
                  <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Phone Number"
                        type="tel"
                        fullWidth
                      />
                    )}
                  />
                ) : (
                  <DetalisFormatted
                    title="Phone Number"
                    detail={selectedVisitor.phoneNumber}
                  />
                )}

                {/* Email */}
                {isEditing ? (
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Email"
                        type="email"
                        fullWidth
                      />
                    )}
                  />
                ) : (
                  <DetalisFormatted
                    title="Email"
                    detail={selectedVisitor.email}
                  />
                )}

                {/* Purpose of Visit */}
                {isEditing ? (
                  <Controller
                    name="purposeOfVisit"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Purpose of Visit"
                        fullWidth
                      />
                    )}
                  />
                ) : (
                  <DetalisFormatted
                    title="Purpose of Visit"
                    detail={selectedVisitor.purposeOfVisit}
                  />
                )}
                {/* Checkout time */}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  {isEditing ? (
                    <Controller
                      name="checkOutRaw"
                      control={control}
                      render={({ field }) => (
                        <TimePicker
                          label="Checkout Time"
                          value={field.value ? dayjs(field.value) : null}
                          onChange={field.onChange}
                          slotProps={{ textField: { size: "small" } }}
                          renderInput={(params) => (
                            <TextField {...params} size="small" fullWidth />
                          )}
                        />
                      )}
                    />
                  ) : (
                    <DetalisFormatted
                      title="Checkout Time"
                      detail={
                        selectedVisitor?.checkOutRaw
                          ? humanTime(selectedVisitor.checkOutRaw)
                          : ""
                      }
                    />
                  )}
                </LocalizationProvider>
                {/* </div>
            ) : (
              []
            )} */}
                {isEditing ? (
                  <Controller
                    name="paymentStatus"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Payment Status"
                        fullWidth
                      />
                    )}
                  />
                ) : (
                  <DetalisFormatted
                    title="Payment Status"
                    detail={selectedVisitor?.paymentStatus}
                  />
                )}
                {/* Payment Amount */}
                {isEditing ? (
                  <Controller
                    name="paymentAmount"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Payment Amount"
                        type="number"
                        fullWidth
                      />
                    )}
                  />
                ) : (
                  <DetalisFormatted
                    title="Payment Amount"
                    detail={inrFormat(selectedVisitor?.paymentAmount || 0)}
                  />
                )}

                {/* Payment Mode */}
                {isEditing ? (
                  <Controller
                    name="paymentMode"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Payment Mode"
                        fullWidth
                      />
                    )}
                  />
                ) : (
                  <DetalisFormatted
                    title="Payment Mode"
                    detail={selectedVisitor?.paymentMode || "N/A"}
                  />
                )}
              </div>
            ) : (
              []
            )}

            {isEditing && (
              <PrimaryButton
                disabled={isPending}
                title={isPending ? "Saving..." : "Save"}
                className="mt-2 w-full"
                type="submit"
              />
            )}
          </form>
        </div>
      </MuiModal>
    </div>
  );
};

export default ExternalClients;
