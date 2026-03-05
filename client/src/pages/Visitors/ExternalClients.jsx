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
import useAuth from "../../hooks/useAuth";
import UploadFileInput from "../../components/UploadFileInput";

const ExternalClients = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const [modalMode, setModalMode] = useState("add");
  const [isModalOpen, setIsModalOpen] = useState(false);


  const [selectedVisitor, setSelectedVisitor] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [paymentVisitor, setPaymentVisitor] = useState(null);

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
      name: "",
      email: "",
      phoneNumber: "",
      purposeOfVisit: "",
      toMeet: "",
      date: "",
      checkIn: "",
      checkInBy: "",
      checkOut: "",
      checkOutBy: "",
      checkOutRaw: null,
      paymentStatus: "",
      paymentAmount: 0,
      paymentMode: "",
      brandName: "",
      registeredClientCompany: "",
    },
  });
  const handleEditToggle = () => {
    if (!isEditing && selectedVisitor) {
      reset({
        id: selectedVisitor?.mongoId,
        firstName: selectedVisitor.firstName || "",
        lastName: selectedVisitor.lastName || "",
        name: `${selectedVisitor.firstName} ${selectedVisitor.lastName}`,
        address: selectedVisitor.address || "",
        email: selectedVisitor.email || "",
        phoneNumber: selectedVisitor.phoneNumber || "",
        purposeOfVisit: selectedVisitor.purposeOfVisit || "",
        toMeet: selectedVisitor.toMeet || "",
        checkIn: selectedVisitor.checkIn ? selectedVisitor.checkIn : "",
        checkInBy: selectedVisitor.checkInBy || "",
        checkOut: selectedVisitor.checkOut ? selectedVisitor.checkOut : "",
        checkOutBy: selectedVisitor.checkOutBy || "",
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
        updatedData,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Visitor updated successfully");
      handleCloseModal();
    },
    onError: (error) => {
      toast.error(error.response.data.message || "Update failed");
    },
  });

  const {
    handleSubmit: handlePaymentSubmit,
    control: paymentControl,
    reset: resetPaymentForm,
    formState: { errors: paymentErrors },
    watch: paymentWatch,
    setValue: setPaymentValue,
  } = useForm({
    defaultValues: {
      paymentAmount: "",
      gstAmount: "",
      discountAmount: "",
      discountPercentage: "",
      finalAmount: "",
      paymentType: "",
      paymentStatus: "",
      paymentProof: "",
    },
  });

  const watchedPaymentAmount = Number(paymentWatch("paymentAmount") || 0);
  const watchedGstAmount = Number(paymentWatch("gstAmount") || 0);
  const watchedDiscountAmount = Number(paymentWatch("discountAmount") || 0);

  const { isPending: isPaymentPending, mutate: updatePayment } = useMutation({
    mutationKey: ["visitor-payment"],
    mutationFn: async (data) => {
      const response = await axios.patch(
        `/api/visitors/payment/${data.get("visitorId")}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Payment details updated successfully");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      handleClosePaymentModal();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Payment update failed");
    },
  });

  const paymentModes = [
    "UPI",
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
    // { field: "firstName", headerName: "First Name" },
    // { field: "lastName", headerName: "Last Name" },
    { field: "name", headerName: "Name" },
    // { field: "email", headerName: "Email" },
    // { field: "phoneNumber", headerName: "Phone No" },
    {
      field: "purposeOfVisit",
      headerName: "Purpose",
    },
    { field: "dateOfVisit", headerName: "Date of Visit" },
    {
      field: "checkIn",
      headerName: "Check In",
      cellRenderer: (params) => humanTime(params.value),
    },
    // { field: "checkInBy", headerName: "Check In By" },
    { field: "checkOut", headerName: "Checkout" },
    // { field: "checkOutBy", headerName: "Check Out By" },
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
          // {
          //   label: "View details",
          //   onClick: () => handleDetailsClick({ ...params.data }),
          // },
          {
            label: "Edit",
            onClick: () => {
              setSelectedVisitor(params.data);
              setModalMode("edit");
              setIsEditing(true);
              setIsModalOpen(true);
            },
          },
          {
            label: "Update Payment Details",
            onClick: () => handleOpenPaymentModal(params.data),
          },
        ];

        return (
          <div className="flex items-center gap-2">
            <div
              role="button"
              onClick={() => handleDetailsClick({ ...params.data })}
              className="p-2 rounded-full hover:bg-borderGray cursor-pointer"
            >
              <MdOutlineRemoveRedEye />
            </div>
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
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    if (selectedVisitor) {
      setValue("firstName", selectedVisitor.firstName || "");
      setValue("lastName", selectedVisitor.lastName || "");
      setValue("name", selectedVisitor.name || "");
      setValue("email", selectedVisitor.email || "");
      setValue("phoneNumber", selectedVisitor.phoneNumber || "");
      setValue("purposeOfVisit", selectedVisitor.purposeOfVisit || "");
      setValue("dateOfVisit", selectedVisitor.dateOfVisit || "");
      setValue("checkInRaw", selectedVisitor.checkInRaw || "");
      setValue("checkInBy", selectedVisitor.checkInBy || "");

      setValue("checkOutBy", selectedVisitor.checkOutBy || "");
      setValue(
        "checkOutRaw",
        selectedVisitor.checkOutRaw ? dayjs(selectedVisitor.checkOutRaw) : null,
      );
      setValue("paymentStatus", selectedVisitor.paymentStatus || "");
      setValue("brandName", selectedVisitor.brandName || "");
      setValue(
        "registeredClientCompany",
        selectedVisitor.registeredClientCompany || "",
      );
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
      const checkInDate = selectedVisitor.checkIn
        ? dayjs(selectedVisitor.checkIn)
        : null;
      const checkOutRaw = data.checkOutRaw ? dayjs(data.checkOutRaw) : null;

      const combinedCheckout =
        checkInDate && checkOutRaw
          ? checkInDate
            .hour(checkOutRaw.hour())
            .minute(checkOutRaw.minute())
            .second(checkOutRaw.second())
            .millisecond(checkOutRaw.millisecond())
          : checkOutRaw;

      const checkOutByName = auth?.user
        ? `${auth.user.firstName || ""} ${auth.user.lastName || ""}`.trim() ||
        auth.user.name ||
        auth.user.email ||
        "-"
        : "-";

      const updatePayload = {
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phoneNumber: data.phoneNumber,
        dateOfVisit: data.dateOfVisit,
        purposeOfVisit: data.purposeOfVisit,
        // checkOut: data.checkOutRaw
        //   ? dayjs(data.checkOutRaw).toISOString()
        //   : null,
        checkOut: combinedCheckout ? combinedCheckout.toISOString() : null,
        paymentStatus: data.paymentStatus,
        paymentAmount: data.paymentAmount,
        paymentMode: data.paymentMode,
        brandName: data.brandName,
        registeredClientCompany: data.registeredClientCompany,
        checkOutBy: checkOutByName,
      };

      mutate(updatePayload);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
  };

  const handleOpenPaymentModal = (visitor) => {
    setPaymentVisitor(visitor);
    resetPaymentForm({
      paymentAmount:
        typeof visitor.rawPaymentAmount === "number"
          ? visitor.rawPaymentAmount
          : "",
      gstAmount: visitor.gstAmount ?? "",
      discountAmount: visitor.discountAmount ?? "",
      discountPercentage: visitor.discountPercentage ?? "",
      finalAmount: visitor.finalAmount ?? "",
      paymentType: visitor.paymentMode && visitor.paymentMode !== "N/A"
        ? visitor.paymentMode
        : "",
      paymentStatus: visitor.paymentStatus || "",
      paymentProof: "",
    });
    setOpenPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setOpenPaymentModal(false);
    setPaymentVisitor(null);
    resetPaymentForm();
  };

  useEffect(() => {
    const totalAmount = watchedPaymentAmount + watchedGstAmount;
    const discountPercentage =
      totalAmount > 0 ? ((watchedDiscountAmount / totalAmount) * 100).toFixed(2) : 0;
    const finalAmount = totalAmount - watchedDiscountAmount;

    setPaymentValue("discountPercentage", discountPercentage);
    setPaymentValue("finalAmount", finalAmount);
  }, [
    watchedPaymentAmount,
    watchedGstAmount,
    watchedDiscountAmount,
    setPaymentValue,
  ]);


  return (
    <div>
      <PageFrame>
        <YearWiseTable
          search={true}
          tableTitle={"External Clients"}
          dateColumn={"checkIn"}
          data={[
            ...visitorsData

              .filter((m) => m.visitorFlag === "Client")
              .map((item, index) => ({
                srNo: index + 1,
                mongoId: item._id,
                firstName: item.firstName,
                lastName: item.lastName,
                name: `${item.firstName} ${item.lastName}`,
                address: item.address,
                phoneNumber: item.phoneNumber,
                dateOfVisit: item.dateOfVisit,
                email: item.email,
                purposeOfVisit: item.purposeOfVisit,
                toMeet: !item?.toMeet
                  ? null
                  : `${item?.toMeet?.firstName} ${item?.toMeet?.lastName}`,
                checkInRaw: item.checkIn,
                checkInBy: item.checkedInBy
                  ? `${item.checkedInBy.firstName} ${item.checkedInBy.lastName}`
                  : "-",
                checkOutRaw: item.checkOut,
                checkOutBy: item.checkedOutBy
                  ? `${item.checkedOutBy.firstName} ${item.checkedOutBy.lastName}`
                  : "-",
                checkIn: item.checkIn,
                checkOut: item.checkOut ? humanTime(item.checkOut) : "",
                paymentStatus:
                  item?.meeting?.paymentStatus === true ? "Paid" : "Unpaid",
                paymentAmount: item?.meeting?.paymentAmount
                  ? inrFormat(item?.meeting?.paymentAmount)
                  : 0,
                rawPaymentAmount: item?.meeting?.paymentAmount ?? 0,
                gstAmount: item?.meeting?.gstAmount ?? 0,
                discountAmount: item?.meeting?.discountAmount ?? 0,
                discountPercentage: item?.meeting?.discountPercentage ?? 0,
                finalAmount: item?.meeting?.finalAmount ?? 0,
                paymentMode: item?.meeting?.paymentMode || "N/A",
                paymentDate: item?.meeting?.paymentDate || null,
                meetingId: item?.meeting?._id || null,
                registeredClientCompany: item?.registeredClientCompany || "N/A",
                brandName: item?.brandName || "N/A",
                visitorCompany: item.visitorCompany || "N/A",
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
                {/* Brand name */}
                {isEditing ? (
                  <Controller
                    name="brandName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Brand Name"
                        fullWidth
                      />
                    )}
                  />
                ) : (
                  <DetalisFormatted
                    title="Brand Name"
                    detail={selectedVisitor.brandName}
                  />
                )}
                {/* Registered client company */}
                {isEditing ? (
                  <Controller
                    name="registeredClientCompany"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Registered Company"
                        fullWidth
                      />
                    )}
                  />
                ) : (
                  <DetalisFormatted
                    title="Registered Company"
                    detail={selectedVisitor.registeredClientCompany}
                  />
                )}

                {/* date of visit */}
                {isEditing ? (
                  <Controller
                    name="dateOfVisit"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Date of Visit"
                        fullWidth
                      />
                    )}
                  />
                ) : (
                  <DetalisFormatted
                    title="Date of Visit"
                    detail={selectedVisitor.date}
                  />
                )}

                {/* checkin time */}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  {isEditing ? (
                    <Controller
                      name="checkInRaw"
                      control={control}
                      render={({ field }) => (
                        <TimePicker
                          label="Checkin Time"
                          value={field.value ? dayjs(field.value) : null}
                          onChange={field.onChange}
                          slotProps={{ textField: { size: "small" } }}
                          renderInput={(params) => (
                            <TextField {...params} size="small" fullWidth />
                          )}
                          shouldDisableTime={(time, view) => {
                            const startTime = selectedVisitor.checkIn;
                            const timeValue = time.$d;

                            if (!startTime) return false;

                            const startDate = new Date(startTime);

                            if (view === "hours") {
                              return (
                                timeValue.getHours() < startDate.getHours()
                              );
                            }

                            if (view === "minutes") {
                              const selectedHour = field.value
                                ? new Date(field.value).getHours()
                                : startDate.getHours();

                              return (
                                timeValue.getHours() === selectedHour &&
                                timeValue.getMinutes() < startDate.getMinutes()
                              );
                            }

                            return false;
                          }}
                        />
                      )}
                    />
                  ) : (
                    <DetalisFormatted
                      title="Checkin Time"
                      detail={humanTime(selectedVisitor?.checkInRaw)}
                    />
                  )}
                </LocalizationProvider>

                {/* checkinby */}
                {isEditing ? (
                  <Controller
                    name="checkInBy"
                    control={control}
                    disabled
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Checkin By"
                        fullWidth
                      />
                    )}
                  />
                ) : (
                  <DetalisFormatted
                    title="Checkin By"
                    detail={selectedVisitor?.checkInBy}
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
                          shouldDisableTime={(time, view) => {
                            const startTime = selectedVisitor.checkIn;
                            const timeValue = time.$d;

                            if (!startTime) return false;

                            const startDate = new Date(startTime);

                            if (view === "hours") {
                              return (
                                timeValue.getHours() < startDate.getHours()
                              );
                            }

                            if (view === "minutes") {
                              const selectedHour = field.value
                                ? new Date(field.value).getHours()
                                : null;

                              return (
                                selectedHour === startDate.getHours() &&
                                timeValue.getMinutes() < startDate.getMinutes()
                              );
                            }

                            // Disable AM/PM
                            //   const currentHour = time.$d.getHours();
                            //    const selectedHour = field.value
                            //   ? new Date(field.value).getHours()
                            //   : null;

                            //   console.log("curr")

                            // if (selectedHour !== null) {

                            //   const isPMSelected = selectedHour >= 12;
                            //   const isAMSelected = selectedHour < 12;

                            //   // Disable AM hours (0–11) if PM is selected
                            //   if (isPMSelected && currentHour < 12) return true;

                            //   // Disable PM hours (12–23) if AM is selected
                            //   if (isAMSelected && currentHour >= 12) return true;
                            // }

                            return false;
                          }}
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
                {/* checkoutby */}
                {isEditing ? (
                  <Controller
                    name="checkOutBy"
                    control={control}
                    disabled
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Checkout By"
                        fullWidth
                      />
                    )}
                  />
                ) : (
                  <DetalisFormatted
                    title="Checkout By"
                    detail={selectedVisitor?.checkOutBy}
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
      <MuiModal
        open={openPaymentModal}
        onClose={handleClosePaymentModal}
        title={"Update Payment Details"}
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={handlePaymentSubmit((data) => {
            if (!paymentVisitor?.mongoId) {
              toast.error("Payment details are not linked with this visitor");
              return;
            }

            const formData = new FormData();
            formData.append("paymentAmount", data?.finalAmount || 0);
            formData.append("paymentMode", data?.paymentType || "");
            formData.append("paymentStatus", data?.paymentStatus || "");
            formData.append("gstAmount", data?.gstAmount || 0);
            formData.append("visitorId", paymentVisitor?.mongoId);
            formData.append("discountAmount", data?.discountAmount || 0);

            if (data?.paymentProof) {
              formData.append("paymentProof", data.paymentProof);
            }

            updatePayment(formData);
          })}
        >
          <div className="flex gap-4 items-center">
            <Controller
              name="paymentAmount"
              control={paymentControl}
              rules={{ required: "Amount is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Amount"
                  type="number"
                  size="small"
                  fullWidth
                  error={!!paymentErrors.paymentAmount}
                  helperText={paymentErrors.paymentAmount?.message}
                />
              )}
            />
            <Controller
              name="gstAmount"
              control={paymentControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="GST Amount"
                  type="number"
                  size="small"
                  fullWidth
                  error={!!paymentErrors.gstAmount}
                  helperText={paymentErrors.gstAmount?.message}
                />
              )}
            />
          </div>
          <div className="flex gap-4 items-center">
            <Controller
              name="discountAmount"
              control={paymentControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Discount Amount"
                  type="number"
                  size="small"
                  fullWidth
                  error={!!paymentErrors.discountAmount}
                  helperText={paymentErrors.discountAmount?.message}
                />
              )}
            />
            <Controller
              name="discountPercentage"
              control={paymentControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  disabled
                  label="Discount %"
                  type="number"
                  size="small"
                  fullWidth
                  error={!!paymentErrors.discountPercentage}
                  helperText={paymentErrors.discountPercentage?.message}
                />
              )}
            />
          </div>
          <Controller
            name="finalAmount"
            control={paymentControl}
            render={({ field }) => (
              <TextField
                {...field}
                disabled
                label="Final Amount"
                type="number"
                size="small"
                fullWidth
                error={!!paymentErrors.finalAmount}
                helperText={paymentErrors.finalAmount?.message}
              />
            )}
          />
          <div className="flex gap-4 items-center">
            <Controller
              name="paymentType"
              control={paymentControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  label="Payment Type"
                  select
                  fullWidth
                >
                  <MenuItem value="" disabled>
                    Select Payment Type
                  </MenuItem>
                  {paymentModes.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="paymentStatus"
              control={paymentControl}
              rules={{ required: "Payment status is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Payment Status"
                  size="small"
                  fullWidth
                  error={!!paymentErrors.paymentStatus}
                  helperText={paymentErrors.paymentStatus?.message}
                >
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Unpaid">Unpaid</MenuItem>
                </TextField>
              )}
            />
          </div>
          <Controller
            name="paymentProof"
            control={paymentControl}
            render={({ field }) => (
              <UploadFileInput
                value={field.value}
                label="Add Payment Proof"
                onChange={field.onChange}
                allowedExtensions={["pdf", "jpg", "jpeg", "png"]}
                previewType="pdf"
              />
            )}
          />
          <div className="flex justify-center">
            <PrimaryButton
              disabled={isPaymentPending}
              className="w-full"
              title={"Save Payment Details"}
              type={"submit"}
            />
          </div>
        </form>
      </MuiModal>
    </div>
  );
};

export default ExternalClients;