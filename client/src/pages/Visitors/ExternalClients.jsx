import { useEffect, useState } from "react";
import AgTable from "../../components/AgTable";
import PrimaryButton from "../../components/PrimaryButton";
import { useQuery, useMutation } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import humanTime from "../../utils/humanTime";
import DetalisFormatted from "../../components/DetalisFormatted";
import MuiModal from "../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { Chip, MenuItem, TextField } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { queryClient } from "../../main";
import { toast } from "sonner";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import ThreeDotMenu from "../../components/ThreeDotMenu";
import { inrFormat } from "../../utils/currencyFormat";
import PageFrame from "../../components/Pages/PageFrame";
import YearWiseTable from "../../components/Tables/YearWiseTable";

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

  const { handleSubmit, reset, control, setValue } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      purposeOfVisit: "",
      toMeet: "",
      checkIn: "",
      checkOut: "",
      checkOutRaw: null,
      paymentStatus: "",
      paymentAmount: 0,
      paymentMode: "",
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
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Visitor updated successfully");
      handleCloseModal();
    },
    onError: (error) => {
      toast.error(error?.message);
    },
  });

  const paymentModes = [
    "Cash",
    "Cheque",
    "NEFT",
    "RTGS",
    "IMPS",
    "Credit Card",
    "ETC",
  ];

  const visitorsColumns = [
    { field: "srNo", headerName: "Sr No", sort: "desc" },
    { field: "firstName", headerName: "First Name" },
    { field: "lastName", headerName: "Last Name" },
    { field: "email", headerName: "Email" },
    { field: "phoneNumber", headerName: "Phone No" },
    {
      field: "purposeOfVisit",
      headerName: "Purpose",
    },
    {
      field: "checkIn",
      headerName: "Check In",
      cellRenderer: (params) => humanTime(params.value),
    },
    { field: "checkOut", headerName: "Checkout" },
    // {
    //   field: "paymentStatus",
    //   headerName: "Payment Status",
    //   cellRenderer: ({ value }) => (
    //     <Chip
    //       label={value}
    //       sx={{
    //         backgroundColor: value === "Paid" ? "#D1FAE5" : "#FECACA", // green-100 / red-100
    //         color: value === "Paid" ? "#047857" : "#B91C1C", // green-700 / red-700
    //         fontWeight: "bold",
    //       }}
    //     />
    //   ),
    // },
    // { field: "paymentAmount", headerName: "Amount (INR)" },
    // { field: "paymentMode", headerName: "Mode" },

    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => {
        const menuItems = [
          {
            label: "View details",
            onClick: () => handleDetailsClick({ ...params.data }),
          },
          {
            label: "Edit",
            onClick: () => {
              setSelectedVisitor(params.data);
              setModalMode("edit");
              setIsEditing(true);
              setIsModalOpen(true);
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
            className="rounded-full w-fit hover:bg-borderGray"
          >
            <ThreeDotMenu menuItems={menuItems} />
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    if (selectedVisitor) {
      setValue("firstName", selectedVisitor.firstName || "");
      setValue("lastName", selectedVisitor.lastName || "");
      setValue("email", selectedVisitor.email || "");
      setValue("phoneNumber", selectedVisitor.phoneNumber || "");
      setValue("purposeOfVisit", selectedVisitor.purposeOfVisit || "");
      setValue(
        "checkOutRaw",
        selectedVisitor.checkOutRaw ? dayjs(selectedVisitor.checkOutRaw) : null
      );
      setValue("paymentStatus", selectedVisitor.paymentStatus || "");
    }
  }, [selectedVisitor, setValue]);

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
    if (isEditing && selectedVisitor) {
      const updatePayload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        purposeOfVisit: data.purposeOfVisit,
        checkOut: data.checkOutRaw
          ? dayjs(data.checkOutRaw).toISOString()
          : null,
        paymentStatus: data.paymentStatus,
        paymentAmount: data.paymentAmount,
        paymentMode: data.paymentMode,
      };

      mutate(updatePayload);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
  };

  return (
    <div>
      <PageFrame>
        <YearWiseTable
          search={true}
          tableTitle={"Visitors Today"}
          dateColumn={"checkIn"}
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
                checkIn: item.checkIn,
                checkOut: item.checkOut ? humanTime(item.checkOut) : "N/A",
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
      </PageFrame>
      <MuiModal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={"Visitor Detail"}
      >
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
