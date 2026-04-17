import { useEffect, useState } from "react";
import AgTable from "../../components/AgTable";
import PrimaryButton from "../../components/PrimaryButton";
import { useQuery, useMutation } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import humanTime from "../../utils/humanTime";
import DetalisFormatted from "../../components/DetalisFormatted";
import MuiModal from "../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { MenuItem, TextField } from "@mui/material";
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
import humanDate from "../../utils/humanDateForamt";

const ExternalClients = ({
  tableTitle = "External Clients",
  filterToDayPass = false,
  financeStatusMenu = false,
}) => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const [modalMode, setModalMode] = useState("add");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedVisitor, setSelectedVisitor] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [paymentVisitor, setPaymentVisitor] = useState(null);

  const renderFileLink = (fileLink) => {
    if (!fileLink) return "—";

    return (
      <a
        href={fileLink}
        target="_blank"
        rel="noreferrer"
        className="text-primaryBlue underline"
      >
        View File
      </a>
    );
  };

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
  const { data: unitsData = [] } = useQuery({
    queryKey: ["unitsData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/fetch-units");
        return response.data || [];
      } catch (error) {
        console.error("Error fetching units data:", error);
        return [];
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
      gender: "",
      state: "",
      city: "",
      sector: "",
      gstNumber: "",
      gstFile: "",
      panNumber: "",
      panFile: "",
      idType: "",
      idNumber: "",
      otherFile: "",
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
        gender: selectedVisitor.gender || "",
        state: selectedVisitor.state || "",
        city: selectedVisitor.city || "",
        sector: selectedVisitor.sector || "",
        gstNumber: selectedVisitor.gstNumber || "",
        gstFile: selectedVisitor.gstFile || "",
        panNumber: selectedVisitor.panNumber || "",
        panFile: selectedVisitor.panFile || "",
        idType: selectedVisitor.idType || "",
        idNumber: selectedVisitor.idNumber || "",
        otherFile: selectedVisitor.otherFile || "",
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
      const externalVisitId = data.get("externalVisitId");
      const isDayPassPayment = filterToDayPass && Boolean(externalVisitId);
      const response = await axios.patch(
        isDayPassPayment
          ? `/api/visitors/day-pass/payment/${externalVisitId}`
          : `/api/visitors/payment/${data.get("visitorId")}`,
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
  const { mutate: verifyPaymentStatus } = useMutation({
      mutationKey: ["day-pass-payment-verification"],
      mutationFn: async ({ externalVisitId, status }) => {
        const response = await axios.patch(
          "/api/visitors/day-pass/payment-verification",
          {
            externalVisitId,
            status,
          },
        );
        return response.data;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["clients"] });
        toast.success(data?.message || "Payment status updated");
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message || "Failed to update payment status",
        );
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
  const isDayPassVisitor = (visitorType) => {
    if (!visitorType) return false;
    return String(visitorType).toLowerCase().includes("day pass");
  };


  const isPaymentCompleted = (status) => {
    if (typeof status === "boolean") return status;
    if (!status) return false;
    return ["paid", "completed"].includes(String(status).toLowerCase());
  };

  const getBuildingName = (visitor) => {
    if (!visitor) return "N/A";
    if (visitor?.building?.buildingName) return visitor.building.buildingName;
    if (visitor?.location?.buildingName) return visitor.location.buildingName;
    if (visitor?.location?.building?.buildingName) {
      return visitor.location.building.buildingName;
    }
    if (visitor?.unit?.building?.buildingName) {
      return visitor.unit.building.buildingName;
    }
    if (typeof visitor?.building === "string") {
      const matchedBuilding = auth?.user?.company?.workLocations?.find(
        (loc) => loc?._id === visitor.building,
      );
      return matchedBuilding?.buildingName || "N/A";
    }
    if (typeof visitor?.location === "string") {
      const matchedLocation = auth?.user?.company?.workLocations?.find(
        (loc) => loc?._id === visitor.location,
      );
      return matchedLocation?.buildingName || "N/A";
    }
    return "N/A";
  };

  const getUnitName = (visitor) => {
    if (!visitor) return "N/A";
    if (visitor?.unit?.unitNo) return visitor.unit.unitNo;
    if (visitor?.unitNo) return visitor.unitNo;
    if (typeof visitor?.unit === "string") {
      const matchedUnit = unitsData?.find(
        (unit) =>
          unit?._id === visitor.unit || unit?.unit?._id === visitor.unit,
      );
      return (
        matchedUnit?.unitNo ||
        matchedUnit?.unit?.unitNo ||
        matchedUnit?.name ||
        "N/A"
      );
    }
    return "N/A";
  };
  const handleVerifyPayment = (rowData, status) => {
    if (!rowData?.latestExternalVisitId) {
      toast.error("No day-pass visit record available for verification");
      return;
    }
    verifyPaymentStatus({
      externalVisitId: rowData.latestExternalVisitId,
      status,
    });
  };

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
      pinned: "right",
      cellRenderer: (params) => {
        const isPaid = isPaymentCompleted(params.data.paymentStatus);
        const verificationStatus = String(
          params.data.paymentVerification || "Pending",
        ).toLowerCase();

        const menuItems = financeStatusMenu
          ? [
              !isPaid && {
                label: "Wait for Payment",
              },
              isPaid &&
                verificationStatus === "pending" && {
                  label: "Review Payment",
                  onClick: () =>
                    handleVerifyPayment(params.data, "Under Review"),
                },
              isPaid &&
                verificationStatus === "under review" && {
                  label: "Verify Payment",
                  onClick: () => handleVerifyPayment(params.data, "Verified"),
                },
              isPaid &&
                verificationStatus === "verified" && {
                  label: "Completed",
                },
              isPaid &&
                !["pending", "under review", "verified"].includes(
                  verificationStatus,
                ) && {
                  label: "Review Payment",
                  onClick: () =>
                    handleVerifyPayment(params.data, "Under Review"),
                },
            ].filter(Boolean)
          : [
              {
                label: "Edit",
                onClick: () => {
                  setSelectedVisitor(params.data);
                  setModalMode("edit");
                  setIsEditing(true);
                  setIsModalOpen(true);
                },
              },
              ...(params.data.visitorType !== "Meeting" && !isPaid
                ? [
                    {
                      label: "Update Payment Details",
                      onClick: () => handleOpenPaymentModal(params.data),
                    },
                  ]
                : []),
            ];
        // const menuItems = [
        //   // {
        //   //   label: "View details",
        //   //   onClick: () => handleDetailsClick({ ...params.data }),
        //   // },
        //   {
        //     label: "Edit",
        //     onClick: () => {
        //       setSelectedVisitor(params.data);
        //       setModalMode("edit");
        //       setIsEditing(true);
        //       setIsModalOpen(true);
        //     },
        //   },
        //   ...(params.data.visitorType !== "Meeting" &&
        //   !isPaymentCompleted(params.data.paymentStatus)
        //     ? [
        //         {
        //           label: "Update Payment Details",
        //           onClick: () => handleOpenPaymentModal(params.data),
        //         },
        //       ]
        //     : []),
        // ];

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
        // paymentStatus: data.paymentStatus,
        paymentAmount: data.paymentAmount,
        // paymentMode: data.paymentMode,
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

    let defaultAmount = visitor.rawPaymentAmount;
    if (!defaultAmount || defaultAmount === 0) {
      if (visitor.visitorType === "Full-Day Pass") defaultAmount = 850;
      else if (visitor.visitorType === "Half-Day Pass") defaultAmount = 500;
    }

    resetPaymentForm({
      paymentAmount: defaultAmount || "",
      gstAmount: visitor.gstAmount ?? "",
      discountAmount: visitor.discountAmount ?? "",
      discountPercentage: visitor.discountPercentage ?? "",
      finalAmount: visitor.finalAmount ?? "",
      paymentType:
        visitor.paymentMode && visitor.paymentMode !== "N/A"
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
    const taxableAmount = watchedPaymentAmount - watchedDiscountAmount;
    const gstAmount = Number((taxableAmount * 0.18).toFixed(2));
    const finalAmount = taxableAmount + gstAmount;

    setPaymentValue("gstAmount", gstAmount > 0 ? gstAmount : 0);
    setPaymentValue("finalAmount", finalAmount > 0 ? finalAmount : 0);

    if (watchedPaymentAmount > 0) {
      const discountPercentage = (
        (watchedDiscountAmount / watchedPaymentAmount) *
        100
      ).toFixed(2);
      setPaymentValue("discountPercentage", discountPercentage);
    } else {
      setPaymentValue("discountPercentage", 0);
    }
  }, [watchedPaymentAmount, watchedDiscountAmount, setPaymentValue]);

  return (
    <div>
      <PageFrame>
        <YearWiseTable
          search={true}
          tableTitle={tableTitle}
          dateColumn={"checkIn"}
          data={[
            ...visitorsData

              .filter((m) => m.visitorFlag === "Client")
              .map((item, index) => {
                const latestVisit = item?.externalVisits?.[0] || null;
                const latestCheckInBy = latestVisit?.checkedInBy;
                const latestCheckOutBy = latestVisit?.checkedOutBy;
                const checkInByName =
                  latestCheckInBy && typeof latestCheckInBy === "object"
                    ? `${latestCheckInBy.firstName || ""} ${latestCheckInBy.lastName || ""}`.trim()
                    : "";
                const checkOutByName =
                  latestCheckOutBy && typeof latestCheckOutBy === "object"
                    ? `${latestCheckOutBy.firstName || ""} ${latestCheckOutBy.lastName || ""}`.trim()
                    : "";
                const fallbackCheckInBy =
                  item?.checkedInBy && typeof item.checkedInBy === "object"
                    ? `${item.checkedInBy.firstName || ""} ${item.checkedInBy.lastName || ""}`.trim()
                    : "";
                const fallbackCheckOutBy =
                  item?.checkedOutBy && typeof item.checkedOutBy === "object"
                    ? `${item.checkedOutBy.firstName || ""} ${item.checkedOutBy.lastName || ""}`.trim()
                    : "";

                return {
                  srNo: index + 1,
                  mongoId: item._id,
                  latestExternalVisitId: latestVisit?._id || null,
                  firstName: item.firstName,
                  lastName: item.lastName,
                  name: `${item.firstName} ${item.lastName}`,
                  address: item.address,
                  phoneNumber: item.phoneNumber,
                  dateOfVisit: latestVisit?.dateOfVisit || item.dateOfVisit,
                  email: item.email,
                  purposeOfVisit:
                    latestVisit?.visitorType || item.purposeOfVisit,
                  buildingName: getBuildingName(item),
                  unitName: getUnitName(item),
                  toMeet: !item?.toMeet
                    ? null
                    : `${item?.toMeet?.firstName} ${item?.toMeet?.lastName}`,
                  checkInRaw: latestVisit?.checkIn || item.checkIn,
                  checkInBy: checkInByName || fallbackCheckInBy || "-",
                  checkOutRaw: latestVisit?.checkOut ?? item.checkOut,
                  checkOutBy: checkOutByName || fallbackCheckOutBy || "-",
                  checkIn: latestVisit?.checkIn || item.checkIn,
                  checkOut: latestVisit?.checkOut
                    ? humanTime(latestVisit.checkOut)
                    : item.checkOut
                      ? humanTime(item.checkOut)
                      : "",
                  paymentStatus:
                    typeof latestVisit?.paymentStatus === "boolean"
                      ? latestVisit.paymentStatus
                        ? "Paid"
                        : "Unpaid"
                      : typeof item.paymentStatus === "string"
                        ? item.paymentStatus
                        : item.paymentStatus === true
                          ? "Paid"
                          : "Unpaid",
                  paymentAmount: latestVisit?.totalAmount
                    ? inrFormat(latestVisit.totalAmount)
                    : item.totalAmount
                      ? inrFormat(item.totalAmount)
                      : 0,
                  rawPaymentAmount: latestVisit?.amount ?? item.amount ?? 0,
                  gstAmount: latestVisit?.gstAmount ?? item.gstAmount ?? 0,
                  discountAmount: latestVisit?.discount ?? item.discount ?? 0,
                  discountPercentage:
                    latestVisit?.discountPercentage ??
                    item.discountPercentage ??
                    0,
                  finalAmount:
                    latestVisit?.totalAmount ?? item.totalAmount ?? 0,
                  paymentMode:
                    latestVisit?.paymentMode || item.paymentMode || "N/A",
                  // paymentVerification: item.paymentVerification || "N/A",
                   paymentVerification:
                    latestVisit?.paymentVerification ||
                    item.paymentVerification ||
                    "Pending",
                  paymentDate: latestVisit?.updatedAt || item.updatedAt || null,
                  paymentProof:
                    latestVisit?.paymentProof?.url ||
                    item?.paymentProof?.url ||
                    "",
                  meetingId: item?.meeting?._id || null,
                  registeredClientCompany:
                    item?.registeredClientCompany || "N/A",
                  brandName: item?.brandName || "N/A",
                  visitorCompany: item.visitorCompany || "N/A",
                  visitorType: latestVisit?.visitorType || item.visitorType,
                  gender: item?.gender || "N/A",
                  state: item?.state || item?.hoState || "N/A",
                  city: item?.city || item?.hoCity || "N/A",
                  sector: item?.sector || "N/A",
                  gstNumber: item?.gstNumber || "N/A",
                  gstFile: item?.gstFile?.link || "",
                  panNumber: item?.panNumber || "N/A",
                  panFile: item?.panFile?.link || "",
                  idType: item?.idProof?.idType || "N/A",
                  idNumber: item?.idProof?.idNumber || "N/A",
                  otherFile: item?.otherFile?.link || "",
                };
               })
              .filter((item) =>
                filterToDayPass
                  ? isDayPassVisitor(item?.purposeOfVisit) ||
                    isDayPassVisitor(item?.visitorType)
                  : true,
              ),
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
                {!isEditing && <div className="font-bold">Client Details</div>}
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

                {!isEditing && (
                  <DetalisFormatted
                    title="Gender"
                    detail={selectedVisitor.gender}
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

                {!isEditing && (
                  <>
                    <DetalisFormatted
                      title="Building"
                      detail={selectedVisitor.buildingName || "N/A"}
                    />
                    <DetalisFormatted
                      title="Unit"
                      detail={selectedVisitor.unitName || "N/A"}
                    />
                  </>
                )}

                {!isEditing && (
                  <>
                    <br />
                    <div className="font-bold">Company Details</div>
                  </>
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

                {!isEditing && (
                  <>
                    <DetalisFormatted
                      title="State"
                      detail={selectedVisitor.state}
                    />
                    <DetalisFormatted
                      title="City"
                      detail={selectedVisitor.city}
                    />
                    <DetalisFormatted
                      title="Sector"
                      detail={selectedVisitor.sector}
                    />
                    <br />
                    <div className="font-bold">GST</div>
                    <DetalisFormatted
                      title="GST Number"
                      detail={selectedVisitor.gstNumber}
                    />
                    <DetalisFormatted
                      title="Upload File"
                      detail={renderFileLink(selectedVisitor.gstFile)}
                    />
                    <br />
                    <div className="font-bold">Verification</div>
                    <DetalisFormatted
                      title="ID Type"
                      detail={selectedVisitor.idType}
                    />
                    <DetalisFormatted
                      title="ID Number"
                      detail={selectedVisitor.idNumber}
                    />
                    <DetalisFormatted
                      title="Upload File"
                      detail={renderFileLink(selectedVisitor.otherFile)}
                    />
                  </>
                )}

                {!isEditing && (
                  <>
                    <br />
                    <div className="font-bold">Others</div>
                  </>
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
                    detail={humanDate(selectedVisitor.dateOfVisit)}
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
                {/* payment status */}
                {/* {!isEditing && (
                  <DetalisFormatted
                    title="Payment Status"
                    detail={selectedVisitor?.paymentStatus}
                  />
                )} */}
                {/* payment mode */}
                {/* {!isEditing && (
                  <DetalisFormatted
                    title="Payment Mode"
                    detail={selectedVisitor?.paymentMode}
                  />
                )} */}

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
                  <>
                    <DetalisFormatted
                      title="Checkout By"
                      detail={selectedVisitor?.checkOutBy}
                    />
                    <br />
                    {/* payment details */}
                    {selectedVisitor?.purposeOfVisit !==
                      "Meeting Room Booking" && (
                      <>
                        <div className="font-bold">Payment Details</div>
                        <DetalisFormatted
                          title="Amount"
                          detail={`INR ${selectedVisitor?.paymentAmount || 0}`}
                        />
                        <DetalisFormatted
                          title="Discount"
                          detail={`INR ${selectedVisitor?.discountAmount || 0}`}
                        />
                        <DetalisFormatted
                          title="Mode"
                          detail={selectedVisitor?.paymentMode}
                        />
                        <DetalisFormatted
                          title="Status"
                          detail={selectedVisitor?.paymentStatus}
                        />
                        <DetalisFormatted
                          title="Verification"
                          detail={selectedVisitor?.paymentVerification}
                        />
                        <DetalisFormatted
                          title="Uploaded File"
                          detail={renderFileLink(selectedVisitor?.paymentProof)}
                        />
                      </>
                    )}
                  </>
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
            formData.append("amount", data?.paymentAmount || 0);
            formData.append("paymentMode", data?.paymentType || "");
            formData.append("paymentStatus", data?.paymentStatus || "");
            formData.append("gstAmount", data?.gstAmount || 0);
            formData.append("visitorId", paymentVisitor?.mongoId);
            formData.append(
              "externalVisitId",
              paymentVisitor?.latestExternalVisitId || "",
            );
            formData.append("discount", data?.discountAmount || 0);

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
                  disabled
                  label="GST Amount (18%)"
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


// import { useEffect, useState } from "react";
// import AgTable from "../../components/AgTable";
// import PrimaryButton from "../../components/PrimaryButton";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import useAxiosPrivate from "../../hooks/useAxiosPrivate";
// import humanTime from "../../utils/humanTime";
// import DetalisFormatted from "../../components/DetalisFormatted";
// import MuiModal from "../../components/MuiModal";
// import { Controller, useForm } from "react-hook-form";
// import { MenuItem, TextField } from "@mui/material";
// import { TimePicker } from "@mui/x-date-pickers";
// import { LocalizationProvider } from "@mui/x-date-pickers";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import dayjs from "dayjs";
// import { queryClient } from "../../main";
// import { toast } from "sonner";
// import { MdOutlineRemoveRedEye } from "react-icons/md";
// import ThreeDotMenu from "../../components/ThreeDotMenu";
// import { inrFormat } from "../../utils/currencyFormat";
// import PageFrame from "../../components/Pages/PageFrame";
// import YearWiseTable from "../../components/Tables/YearWiseTable";
// import useAuth from "../../hooks/useAuth";
// import UploadFileInput from "../../components/UploadFileInput";
// import humanDate from "../../utils/humanDateForamt";

// const ExternalClients = ({
//   tableTitle = "External Clients",
//   filterToDayPass = false,
//   financeStatusMenu = false,
// }) => {
//   const axios = useAxiosPrivate();
//   const { auth } = useAuth();
//   const [modalMode, setModalMode] = useState("add");
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const [selectedVisitor, setSelectedVisitor] = useState([]);
//   const [isEditing, setIsEditing] = useState(false);
//   const [openPaymentModal, setOpenPaymentModal] = useState(false);
//   const [paymentVisitor, setPaymentVisitor] = useState(null);

//   const renderFileLink = (fileLink) => {
//     if (!fileLink) return "—";

//     return (
//       <a
//         href={fileLink}
//         target="_blank"
//         rel="noreferrer"
//         className="text-primaryBlue underline"
//       >
//         View File
//       </a>
//     );
//   };

//   const { data: visitorsData = [], isPending: isVisitorsData } = useQuery({
//     queryKey: ["clients"],
//     queryFn: async () => {
//       try {
//         const response = await axios.get("/api/visitors/fetch-visitors");
//         return response.data;
//       } catch (error) {
//         throw new Error(error.response.data.message);
//       }
//     },
//   });
//   const { data: unitsData = [] } = useQuery({
//     queryKey: ["unitsData"],
//     queryFn: async () => {
//       try {
//         const response = await axios.get("/api/company/fetch-units");
//         return response.data || [];
//       } catch (error) {
//         console.error("Error fetching units data:", error);
//         return [];
//       }
//     },
//   });

//   const { handleSubmit, reset, control, setValue } = useForm({
//     defaultValues: {
//       firstName: "",
//       lastName: "",
//       name: "",
//       email: "",
//       phoneNumber: "",
//       purposeOfVisit: "",
//       toMeet: "",
//       date: "",
//       checkIn: "",
//       checkInBy: "",
//       checkOut: "",
//       checkOutBy: "",
//       checkOutRaw: null,
//       paymentStatus: "",
//       paymentAmount: 0,
//       paymentMode: "",
//       brandName: "",
//       gender: "",
//       state: "",
//       city: "",
//       sector: "",
//       gstNumber: "",
//       gstFile: "",
//       panNumber: "",
//       panFile: "",
//       idType: "",
//       idNumber: "",
//       otherFile: "",
//       registeredClientCompany: "",
//     },
//   });
//   const handleEditToggle = () => {
//     if (!isEditing && selectedVisitor) {
//       reset({
//         id: selectedVisitor?.mongoId,
//         firstName: selectedVisitor.firstName || "",
//         lastName: selectedVisitor.lastName || "",
//         name: `${selectedVisitor.firstName} ${selectedVisitor.lastName}`,
//         address: selectedVisitor.address || "",
//         email: selectedVisitor.email || "",
//         phoneNumber: selectedVisitor.phoneNumber || "",
//         purposeOfVisit: selectedVisitor.purposeOfVisit || "",
//         toMeet: selectedVisitor.toMeet || "",
//         checkIn: selectedVisitor.checkIn ? selectedVisitor.checkIn : "",
//         checkInBy: selectedVisitor.checkInBy || "",
//         checkOut: selectedVisitor.checkOut ? selectedVisitor.checkOut : "",
//         checkOutBy: selectedVisitor.checkOutBy || "",
//         checkOutRaw: selectedVisitor?.checkOutRaw
//           ? dayjs(selectedVisitor.checkOutRaw)
//           : null,
//         gender: selectedVisitor.gender || "",
//         state: selectedVisitor.state || "",
//         city: selectedVisitor.city || "",
//         sector: selectedVisitor.sector || "",
//         gstNumber: selectedVisitor.gstNumber || "",
//         gstFile: selectedVisitor.gstFile || "",
//         panNumber: selectedVisitor.panNumber || "",
//         panFile: selectedVisitor.panFile || "",
//         idType: selectedVisitor.idType || "",
//         idNumber: selectedVisitor.idNumber || "",
//         otherFile: selectedVisitor.otherFile || "",
//       });
//     }
//     setIsEditing(!isEditing);
//   };

//   const { mutate, isPending } = useMutation({
//     mutationFn: async (updatedData) => {
//       const response = await axios.patch(
//         `/api/visitors/update-visitor/${selectedVisitor.mongoId}`,
//         updatedData,
//       );
//       return response.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["clients"] });
//       toast.success("Visitor updated successfully");
//       handleCloseModal();
//     },
//     onError: (error) => {
//       toast.error(error.response.data.message || "Update failed");
//     },
//   });

//   const {
//     handleSubmit: handlePaymentSubmit,
//     control: paymentControl,
//     reset: resetPaymentForm,
//     formState: { errors: paymentErrors },
//     watch: paymentWatch,
//     setValue: setPaymentValue,
//   } = useForm({
//     defaultValues: {
//       paymentAmount: "",
//       gstAmount: "",
//       discountAmount: "",
//       discountPercentage: "",
//       finalAmount: "",
//       paymentType: "",
//       paymentStatus: "",
//       paymentProof: "",
//     },
//   });

//   const watchedPaymentAmount = Number(paymentWatch("paymentAmount") || 0);
//   const watchedGstAmount = Number(paymentWatch("gstAmount") || 0);
//   const watchedDiscountAmount = Number(paymentWatch("discountAmount") || 0);

//   const { isPending: isPaymentPending, mutate: updatePayment } = useMutation({
//     mutationKey: ["visitor-payment"],
//     mutationFn: async (data) => {
//       const response = await axios.patch(
//         `/api/visitors/payment/${data.get("visitorId")}`,
//         data,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         },
//       );
//       return response.data;
//     },
//     onSuccess: () => {
//       toast.success("Payment details updated successfully");
//       queryClient.invalidateQueries({ queryKey: ["clients"] });
//       handleClosePaymentModal();
//     },
//     onError: (error) => {
//       toast.error(error?.response?.data?.message || "Payment update failed");
//     },
//   });

//   const paymentModes = [
//     "UPI",
//     "Cash",
//     "Cheque",
//     "NEFT",
//     "RTGS",
//     "IMPS",
//     "Credit Card",
//     "ETC",
//   ];

//   const isPaymentCompleted = (status) => {
//     if (typeof status === "boolean") return status;
//     if (!status) return false;
//     return ["paid", "completed"].includes(String(status).toLowerCase());
//   };

//   const isDayPassVisitor = (visitorType) => {
//     if (!visitorType) return false;
//     return String(visitorType).toLowerCase().includes("day pass");
//   };

//   const getBuildingName = (visitor) => {
//     if (!visitor) return "N/A";
//     if (visitor?.building?.buildingName) return visitor.building.buildingName;
//     if (visitor?.location?.buildingName) return visitor.location.buildingName;
//     if (visitor?.location?.building?.buildingName) {
//       return visitor.location.building.buildingName;
//     }
//     if (visitor?.unit?.building?.buildingName) {
//       return visitor.unit.building.buildingName;
//     }
//     if (typeof visitor?.building === "string") {
//       const matchedBuilding = auth?.user?.company?.workLocations?.find(
//         (loc) => loc?._id === visitor.building,
//       );
//       return matchedBuilding?.buildingName || "N/A";
//     }
//     if (typeof visitor?.location === "string") {
//       const matchedLocation = auth?.user?.company?.workLocations?.find(
//         (loc) => loc?._id === visitor.location,
//       );
//       return matchedLocation?.buildingName || "N/A";
//     }
//     return "N/A";
//   };

//   const getUnitName = (visitor) => {
//     if (!visitor) return "N/A";
//     if (visitor?.unit?.unitNo) return visitor.unit.unitNo;
//     if (visitor?.unitNo) return visitor.unitNo;
//     if (typeof visitor?.unit === "string") {
//       const matchedUnit = unitsData?.find(
//         (unit) =>
//           unit?._id === visitor.unit || unit?.unit?._id === visitor.unit,
//       );
//       return (
//         matchedUnit?.unitNo ||
//         matchedUnit?.unit?.unitNo ||
//         matchedUnit?.name ||
//         "N/A"
//       );
//     }
//     return "N/A";
//   };
//   const visitorsColumns = [
//     { field: "srNo", headerName: "Sr No", sort: "desc" },
//     // { field: "firstName", headerName: "First Name" },
//     // { field: "lastName", headerName: "Last Name" },
//     { field: "name", headerName: "Name" },
//     // { field: "email", headerName: "Email" },
//     // { field: "phoneNumber", headerName: "Phone No" },
//     {
//       field: "purposeOfVisit",
//       headerName: "Purpose",
//     },
//     { field: "dateOfVisit", headerName: "Date of Visit" },
//     {
//       field: "checkIn",
//       headerName: "Check In",
//       cellRenderer: (params) => humanTime(params.value),
//     },
//     // { field: "checkInBy", headerName: "Check In By" },
//     { field: "checkOut", headerName: "Checkout" },
//     // { field: "checkOutBy", headerName: "Check Out By" },
//     // {
//     //   field: "paymentStatus",
//     //   headerName: "Payment Status",
//     //   cellRenderer: ({ value }) => (
//     //     <Chip
//     //       label={value}
//     //       sx={{
//     //         backgroundColor: value === "Paid" ? "#D1FAE5" : "#FECACA", // green-100 / red-100
//     //         color: value === "Paid" ? "#047857" : "#B91C1C", // green-700 / red-700
//     //         fontWeight: "bold",
//     //       }}
//     //     />
//     //   ),
//     // },
//     // { field: "paymentAmount", headerName: "Amount (INR)" },
//     // { field: "paymentMode", headerName: "Mode" },

//     {
//       field: "actions",
//       headerName: "Actions",
//       pinned: "right",
//       cellRenderer: (params) => {
//         // const menuItems = [
//         //   // {
//         //   //   label: "View details",
//         //   //   onClick: () => handleDetailsClick({ ...params.data }),
//         //   // },
//         //   {
//         //     label: "Edit",
//         //     onClick: () => {
//         //       setSelectedVisitor(params.data);
//         //       setModalMode("edit");
//         //       setIsEditing(true);
//         //       setIsModalOpen(true);
//         //     },
//         //   },
//         //   ...(params.data.visitorType !== "Meeting" &&
//         //   !isPaymentCompleted(params.data.paymentStatus)
//         //     ? [
//         //         {
//         //           label: "Update Payment Details",
//         //           onClick: () => handleOpenPaymentModal(params.data),
//         //         },
//         //       ]
//         //     : []),
//         // ];

//          const isPaid = isPaymentCompleted(params.data.paymentStatus);
//         const verificationStatus = String(
//           params.data.paymentVerification || "",
//         ).toLowerCase();

//         const menuItems = financeStatusMenu
//           ? [
//               !isPaid && {
//                 label: "Wait for Payment",
//               },
//               isPaid &&
//                 verificationStatus !== "verified" && {
//                   label: "Review / Verify",
//                 },
//               isPaid &&
//                 verificationStatus === "verified" && {
//                   label: "Completed",
//                 },
//             ].filter(Boolean)
//           : [
//               {
//                 label: "Edit",
//                 onClick: () => {
//                   setSelectedVisitor(params.data);
//                   setModalMode("edit");
//                   setIsEditing(true);
//                   setIsModalOpen(true);
//                 },
//               },
//               ...(params.data.visitorType !== "Meeting" && !isPaid
//                 ? [
//                     {
//                       label: "Update Payment Details",
//                       onClick: () => handleOpenPaymentModal(params.data),
//                     },
//                   ]
//                 : []),
//             ];

//         return (
//           <div className="flex items-center gap-2">
//             <div
//               role="button"
//               onClick={() => handleDetailsClick({ ...params.data })}
//               className="p-2 rounded-full hover:bg-borderGray cursor-pointer"
//             >
//               <MdOutlineRemoveRedEye />
//             </div>
//             <div
//               role="button"
//               disabled={params.data.checkOut}
//               onClick={(e) => {
//                 e.stopPropagation(); // Prevent row selection on click
//               }}
//               className="rounded-full w-fit hover:bg-borderGray"
//             >
//               <ThreeDotMenu menuItems={menuItems} />
//             </div>
//           </div>
//         );
//       },
//     },
//   ];

//   useEffect(() => {
//     if (selectedVisitor) {
//       setValue("firstName", selectedVisitor.firstName || "");
//       setValue("lastName", selectedVisitor.lastName || "");
//       setValue("name", selectedVisitor.name || "");
//       setValue("email", selectedVisitor.email || "");
//       setValue("phoneNumber", selectedVisitor.phoneNumber || "");
//       setValue("purposeOfVisit", selectedVisitor.purposeOfVisit || "");
//       setValue("dateOfVisit", selectedVisitor.dateOfVisit || "");
//       setValue("checkInRaw", selectedVisitor.checkInRaw || "");
//       setValue("checkInBy", selectedVisitor.checkInBy || "");

//       setValue("checkOutBy", selectedVisitor.checkOutBy || "");
//       setValue(
//         "checkOutRaw",
//         selectedVisitor.checkOutRaw ? dayjs(selectedVisitor.checkOutRaw) : null,
//       );
//       setValue("paymentStatus", selectedVisitor.paymentStatus || "");
//       setValue("brandName", selectedVisitor.brandName || "");
//       setValue(
//         "registeredClientCompany",
//         selectedVisitor.registeredClientCompany || "",
//       );
//     }
//   }, [selectedVisitor, setValue]);

//   const handleDetailsClick = (asset) => {
//     setSelectedVisitor(asset);
//     setModalMode("view");
//     setIsModalOpen(true);
//   };

//   const handleAddAsset = () => {
//     setModalMode("add");
//     setSelectedVisitor(null);
//     setIsModalOpen(true);
//   };

//   const submit = async (data) => {
//     if (isEditing && selectedVisitor) {
//       const checkInDate = selectedVisitor.checkIn
//         ? dayjs(selectedVisitor.checkIn)
//         : null;
//       const checkOutRaw = data.checkOutRaw ? dayjs(data.checkOutRaw) : null;

//       const combinedCheckout =
//         checkInDate && checkOutRaw
//           ? checkInDate
//               .hour(checkOutRaw.hour())
//               .minute(checkOutRaw.minute())
//               .second(checkOutRaw.second())
//               .millisecond(checkOutRaw.millisecond())
//           : checkOutRaw;

//       const checkOutByName = auth?.user
//         ? `${auth.user.firstName || ""} ${auth.user.lastName || ""}`.trim() ||
//           auth.user.name ||
//           auth.user.email ||
//           "-"
//         : "-";

//       const updatePayload = {
//         firstName: data.firstName,
//         lastName: data.lastName,
//         name: `${data.firstName} ${data.lastName}`,
//         email: data.email,
//         phoneNumber: data.phoneNumber,
//         dateOfVisit: data.dateOfVisit,
//         purposeOfVisit: data.purposeOfVisit,
//         // checkOut: data.checkOutRaw
//         //   ? dayjs(data.checkOutRaw).toISOString()
//         //   : null,
//         checkOut: combinedCheckout ? combinedCheckout.toISOString() : null,
//         // paymentStatus: data.paymentStatus,
//         paymentAmount: data.paymentAmount,
//         // paymentMode: data.paymentMode,
//         brandName: data.brandName,
//         registeredClientCompany: data.registeredClientCompany,
//         checkOutBy: checkOutByName,
//       };

//       mutate(updatePayload);
//     }
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setIsEditing(false);
//   };

//   const handleOpenPaymentModal = (visitor) => {
//     setPaymentVisitor(visitor);

//     let defaultAmount = visitor.rawPaymentAmount;
//     if (!defaultAmount || defaultAmount === 0) {
//       if (visitor.visitorType === "Full-Day Pass") defaultAmount = 850;
//       else if (visitor.visitorType === "Half-Day Pass") defaultAmount = 500;
//     }

//     resetPaymentForm({
//       paymentAmount: defaultAmount || "",
//       gstAmount: visitor.gstAmount ?? "",
//       discountAmount: visitor.discountAmount ?? "",
//       discountPercentage: visitor.discountPercentage ?? "",
//       finalAmount: visitor.finalAmount ?? "",
//       paymentType:
//         visitor.paymentMode && visitor.paymentMode !== "N/A"
//           ? visitor.paymentMode
//           : "",
//       paymentStatus: visitor.paymentStatus || "",
//       paymentProof: "",
//     });
//     setOpenPaymentModal(true);
//   };

//   const handleClosePaymentModal = () => {
//     setOpenPaymentModal(false);
//     setPaymentVisitor(null);
//     resetPaymentForm();
//   };

//   useEffect(() => {
//     const taxableAmount = watchedPaymentAmount - watchedDiscountAmount;
//     const gstAmount = Number((taxableAmount * 0.18).toFixed(2));
//     const finalAmount = taxableAmount + gstAmount;

//     setPaymentValue("gstAmount", gstAmount > 0 ? gstAmount : 0);
//     setPaymentValue("finalAmount", finalAmount > 0 ? finalAmount : 0);

//     if (watchedPaymentAmount > 0) {
//       const discountPercentage = (
//         (watchedDiscountAmount / watchedPaymentAmount) *
//         100
//       ).toFixed(2);
//       setPaymentValue("discountPercentage", discountPercentage);
//     } else {
//       setPaymentValue("discountPercentage", 0);
//     }
//   }, [watchedPaymentAmount, watchedDiscountAmount, setPaymentValue]);

//   return (
//     <div>
//       <PageFrame>
//         <YearWiseTable
//           search={true}
//           // tableTitle={"External Clients"}
//           tableTitle={tableTitle}
//           dateColumn={"checkIn"}
//           data={[
//             ...visitorsData

//               .filter((m) => m.visitorFlag === "Client")
//               .map((item, index) => {
//                 const latestVisit = item?.externalVisits?.[0] || null;
//                 const latestCheckInBy = latestVisit?.checkedInBy;
//                 const latestCheckOutBy = latestVisit?.checkedOutBy;
//                 const checkInByName =
//                   latestCheckInBy && typeof latestCheckInBy === "object"
//                     ? `${latestCheckInBy.firstName || ""} ${latestCheckInBy.lastName || ""}`.trim()
//                     : "";
//                 const checkOutByName =
//                   latestCheckOutBy && typeof latestCheckOutBy === "object"
//                     ? `${latestCheckOutBy.firstName || ""} ${latestCheckOutBy.lastName || ""}`.trim()
//                     : "";
//                 const fallbackCheckInBy =
//                   item?.checkedInBy && typeof item.checkedInBy === "object"
//                     ? `${item.checkedInBy.firstName || ""} ${item.checkedInBy.lastName || ""}`.trim()
//                     : "";
//                 const fallbackCheckOutBy =
//                   item?.checkedOutBy && typeof item.checkedOutBy === "object"
//                     ? `${item.checkedOutBy.firstName || ""} ${item.checkedOutBy.lastName || ""}`.trim()
//                     : "";

//                 return {
//                   srNo: index + 1,
//                   mongoId: item._id,
//                   latestExternalVisitId: latestVisit?._id || null,
//                   firstName: item.firstName,
//                   lastName: item.lastName,
//                   name: `${item.firstName} ${item.lastName}`,
//                   address: item.address,
//                   phoneNumber: item.phoneNumber,
//                   dateOfVisit: latestVisit?.dateOfVisit || item.dateOfVisit,
//                   email: item.email,
//                   purposeOfVisit:
//                     latestVisit?.visitorType || item.purposeOfVisit,
//                   buildingName: getBuildingName(item),
//                   unitName: getUnitName(item),
//                   toMeet: !item?.toMeet
//                     ? null
//                     : `${item?.toMeet?.firstName} ${item?.toMeet?.lastName}`,
//                   checkInRaw: latestVisit?.checkIn || item.checkIn,
//                   checkInBy: checkInByName || fallbackCheckInBy || "-",
//                   checkOutRaw: latestVisit?.checkOut ?? item.checkOut,
//                   checkOutBy: checkOutByName || fallbackCheckOutBy || "-",
//                   checkIn: latestVisit?.checkIn || item.checkIn,
//                   checkOut: latestVisit?.checkOut
//                     ? humanTime(latestVisit.checkOut)
//                     : item.checkOut
//                       ? humanTime(item.checkOut)
//                       : "",
//                   paymentStatus:
//                     typeof latestVisit?.paymentStatus === "boolean"
//                       ? latestVisit.paymentStatus
//                         ? "Paid"
//                         : "Unpaid"
//                       : typeof item.paymentStatus === "string"
//                         ? item.paymentStatus
//                         : item.paymentStatus === true
//                           ? "Paid"
//                           : "Unpaid",
//                   paymentAmount: latestVisit?.totalAmount
//                     ? inrFormat(latestVisit.totalAmount)
//                     : item.totalAmount
//                       ? inrFormat(item.totalAmount)
//                       : 0,
//                   rawPaymentAmount: latestVisit?.amount ?? item.amount ?? 0,
//                   gstAmount: latestVisit?.gstAmount ?? item.gstAmount ?? 0,
//                   discountAmount: latestVisit?.discount ?? item.discount ?? 0,
//                   discountPercentage:
//                     latestVisit?.discountPercentage ??
//                     item.discountPercentage ??
//                     0,
//                   finalAmount:
//                     latestVisit?.totalAmount ?? item.totalAmount ?? 0,
//                   paymentMode:
//                     latestVisit?.paymentMode || item.paymentMode || "N/A",
//                   paymentVerification: item.paymentVerification || "N/A",
//                   paymentDate: latestVisit?.updatedAt || item.updatedAt || null,
//                   paymentProof:
//                     latestVisit?.paymentProof?.url ||
//                     item?.paymentProof?.url ||
//                     "",
//                   meetingId: item?.meeting?._id || null,
//                   registeredClientCompany:
//                     item?.registeredClientCompany || "N/A",
//                   brandName: item?.brandName || "N/A",
//                   visitorCompany: item.visitorCompany || "N/A",
//                   visitorType: latestVisit?.visitorType || item.visitorType,
//                   gender: item?.gender || "N/A",
//                   state: item?.state || item?.hoState || "N/A",
//                   city: item?.city || item?.hoCity || "N/A",
//                   sector: item?.sector || "N/A",
//                   gstNumber: item?.gstNumber || "N/A",
//                   gstFile: item?.gstFile?.link || "",
//                   panNumber: item?.panNumber || "N/A",
//                   panFile: item?.panFile?.link || "",
//                   idType: item?.idProof?.idType || "N/A",
//                   idNumber: item?.idProof?.idNumber || "N/A",
//                   otherFile: item?.otherFile?.link || "",
//                 };
//                })
//               .filter((item) =>
//                 filterToDayPass
//                   ? isDayPassVisitor(item?.purposeOfVisit) ||
//                     isDayPassVisitor(item?.visitorType)
//                   : true,
//               ),
//           ]}
//           columns={visitorsColumns}
//           handleClick={handleAddAsset}
//         />
//       </PageFrame>
//       <MuiModal
//         open={isModalOpen}
//         onClose={handleCloseModal}
//         title={"Visitor Detail"}
//       >
//         <div className="flex flex-col gap-4">
//           <form onSubmit={handleSubmit(submit)}>
//             {!isVisitorsData ? (
//               <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
//                 {!isEditing && <div className="font-bold">Client Details</div>}
//                 {/* First Name */}
//                 {isEditing ? (
//                   <Controller
//                     name="firstName"
//                     control={control}
//                     render={({ field }) => (
//                       <TextField
//                         {...field}
//                         size="small"
//                         label="First Name"
//                         fullWidth
//                       />
//                     )}
//                   />
//                 ) : (
//                   <DetalisFormatted
//                     title="First Name"
//                     detail={selectedVisitor.firstName}
//                   />
//                 )}

//                 {/* Last Name */}
//                 {isEditing ? (
//                   <Controller
//                     name="lastName"
//                     control={control}
//                     render={({ field }) => (
//                       <TextField
//                         {...field}
//                         size="small"
//                         label="Last Name"
//                         fullWidth
//                       />
//                     )}
//                   />
//                 ) : (
//                   <DetalisFormatted
//                     title="Last Name"
//                     detail={selectedVisitor.lastName}
//                   />
//                 )}
//                 {/* Email */}
//                 {isEditing ? (
//                   <Controller
//                     name="email"
//                     control={control}
//                     render={({ field }) => (
//                       <TextField
//                         {...field}
//                         size="small"
//                         label="Email"
//                         type="email"
//                         fullWidth
//                       />
//                     )}
//                   />
//                 ) : (
//                   <DetalisFormatted
//                     title="Email"
//                     detail={selectedVisitor.email}
//                   />
//                 )}

//                 {/* Phone Number */}
//                 {isEditing ? (
//                   <Controller
//                     name="phoneNumber"
//                     control={control}
//                     render={({ field }) => (
//                       <TextField
//                         {...field}
//                         size="small"
//                         label="Phone Number"
//                         type="tel"
//                         fullWidth
//                       />
//                     )}
//                   />
//                 ) : (
//                   <DetalisFormatted
//                     title="Phone Number"
//                     detail={selectedVisitor.phoneNumber}
//                   />
//                 )}

//                 {!isEditing && (
//                   <DetalisFormatted
//                     title="Gender"
//                     detail={selectedVisitor.gender}
//                   />
//                 )}

//                 {/* Purpose of Visit */}
//                 {isEditing ? (
//                   <Controller
//                     name="purposeOfVisit"
//                     control={control}
//                     render={({ field }) => (
//                       <TextField
//                         {...field}
//                         size="small"
//                         label="Purpose of Visit"
//                         fullWidth
//                       />
//                     )}
//                   />
//                 ) : (
//                   <DetalisFormatted
//                     title="Purpose of Visit"
//                     detail={selectedVisitor.purposeOfVisit}
//                   />
//                 )}

//                 {!isEditing && (
//                   <>
//                     <DetalisFormatted
//                       title="Building"
//                       detail={selectedVisitor.buildingName || "N/A"}
//                     />
//                     <DetalisFormatted
//                       title="Unit"
//                       detail={selectedVisitor.unitName || "N/A"}
//                     />
//                   </>
//                 )}

//                 {!isEditing && (
//                   <>
//                     <br />
//                     <div className="font-bold">Company Details</div>
//                   </>
//                 )}
//                 {/* Brand name */}
//                 {isEditing ? (
//                   <Controller
//                     name="brandName"
//                     control={control}
//                     render={({ field }) => (
//                       <TextField
//                         {...field}
//                         size="small"
//                         label="Brand Name"
//                         fullWidth
//                       />
//                     )}
//                   />
//                 ) : (
//                   <DetalisFormatted
//                     title="Brand Name"
//                     detail={selectedVisitor.brandName}
//                   />
//                 )}
//                 {/* Registered client company */}
//                 {isEditing ? (
//                   <Controller
//                     name="registeredClientCompany"
//                     control={control}
//                     render={({ field }) => (
//                       <TextField
//                         {...field}
//                         size="small"
//                         label="Registered Company"
//                         fullWidth
//                       />
//                     )}
//                   />
//                 ) : (
//                   <DetalisFormatted
//                     title="Registered Company"
//                     detail={selectedVisitor.registeredClientCompany}
//                   />
//                 )}

//                 {!isEditing && (
//                   <>
//                     <DetalisFormatted
//                       title="State"
//                       detail={selectedVisitor.state}
//                     />
//                     <DetalisFormatted
//                       title="City"
//                       detail={selectedVisitor.city}
//                     />
//                     <DetalisFormatted
//                       title="Sector"
//                       detail={selectedVisitor.sector}
//                     />
//                     <br />
//                     <div className="font-bold">GST</div>
//                     <DetalisFormatted
//                       title="GST Number"
//                       detail={selectedVisitor.gstNumber}
//                     />
//                     <DetalisFormatted
//                       title="Upload File"
//                       detail={renderFileLink(selectedVisitor.gstFile)}
//                     />
//                     <br />
//                     <div className="font-bold">Verification</div>
//                     <DetalisFormatted
//                       title="ID Type"
//                       detail={selectedVisitor.idType}
//                     />
//                     <DetalisFormatted
//                       title="ID Number"
//                       detail={selectedVisitor.idNumber}
//                     />
//                     <DetalisFormatted
//                       title="Upload File"
//                       detail={renderFileLink(selectedVisitor.otherFile)}
//                     />
//                   </>
//                 )}

//                 {!isEditing && (
//                   <>
//                     <br />
//                     <div className="font-bold">Others</div>
//                   </>
//                 )}

//                 {/* date of visit */}
//                 {isEditing ? (
//                   <Controller
//                     name="dateOfVisit"
//                     control={control}
//                     render={({ field }) => (
//                       <TextField
//                         {...field}
//                         size="small"
//                         label="Date of Visit"
//                         fullWidth
//                       />
//                     )}
//                   />
//                 ) : (
//                   <DetalisFormatted
//                     title="Date of Visit"
//                     detail={humanDate(selectedVisitor.dateOfVisit)}
//                   />
//                 )}

//                 {/* checkin time */}
//                 <LocalizationProvider dateAdapter={AdapterDayjs}>
//                   {isEditing ? (
//                     <Controller
//                       name="checkInRaw"
//                       control={control}
//                       render={({ field }) => (
//                         <TimePicker
//                           label="Checkin Time"
//                           value={field.value ? dayjs(field.value) : null}
//                           onChange={field.onChange}
//                           slotProps={{ textField: { size: "small" } }}
//                           renderInput={(params) => (
//                             <TextField {...params} size="small" fullWidth />
//                           )}
//                           shouldDisableTime={(time, view) => {
//                             const startTime = selectedVisitor.checkIn;
//                             const timeValue = time.$d;

//                             if (!startTime) return false;

//                             const startDate = new Date(startTime);

//                             if (view === "hours") {
//                               return (
//                                 timeValue.getHours() < startDate.getHours()
//                               );
//                             }

//                             if (view === "minutes") {
//                               const selectedHour = field.value
//                                 ? new Date(field.value).getHours()
//                                 : startDate.getHours();

//                               return (
//                                 timeValue.getHours() === selectedHour &&
//                                 timeValue.getMinutes() < startDate.getMinutes()
//                               );
//                             }

//                             return false;
//                           }}
//                         />
//                       )}
//                     />
//                   ) : (
//                     <DetalisFormatted
//                       title="Checkin Time"
//                       detail={humanTime(selectedVisitor?.checkInRaw)}
//                     />
//                   )}
//                 </LocalizationProvider>

//                 {/* checkinby */}
//                 {isEditing ? (
//                   <Controller
//                     name="checkInBy"
//                     control={control}
//                     disabled
//                     render={({ field }) => (
//                       <TextField
//                         {...field}
//                         size="small"
//                         label="Checkin By"
//                         fullWidth
//                       />
//                     )}
//                   />
//                 ) : (
//                   <DetalisFormatted
//                     title="Checkin By"
//                     detail={selectedVisitor?.checkInBy}
//                   />
//                 )}
//                 {/* payment status */}
//                 {/* {!isEditing && (
//                   <DetalisFormatted
//                     title="Payment Status"
//                     detail={selectedVisitor?.paymentStatus}
//                   />
//                 )} */}
//                 {/* payment mode */}
//                 {/* {!isEditing && (
//                   <DetalisFormatted
//                     title="Payment Mode"
//                     detail={selectedVisitor?.paymentMode}
//                   />
//                 )} */}

//                 {/* Checkout time */}
//                 <LocalizationProvider dateAdapter={AdapterDayjs}>
//                   {isEditing ? (
//                     <Controller
//                       name="checkOutRaw"
//                       control={control}
//                       render={({ field }) => (
//                         <TimePicker
//                           label="Checkout Time"
//                           value={field.value ? dayjs(field.value) : null}
//                           onChange={field.onChange}
//                           slotProps={{ textField: { size: "small" } }}
//                           renderInput={(params) => (
//                             <TextField {...params} size="small" fullWidth />
//                           )}
//                           shouldDisableTime={(time, view) => {
//                             const startTime = selectedVisitor.checkIn;
//                             const timeValue = time.$d;

//                             if (!startTime) return false;

//                             const startDate = new Date(startTime);

//                             if (view === "hours") {
//                               return (
//                                 timeValue.getHours() < startDate.getHours()
//                               );
//                             }

//                             if (view === "minutes") {
//                               const selectedHour = field.value
//                                 ? new Date(field.value).getHours()
//                                 : null;

//                               return (
//                                 selectedHour === startDate.getHours() &&
//                                 timeValue.getMinutes() < startDate.getMinutes()
//                               );
//                             }

//                             // Disable AM/PM
//                             //   const currentHour = time.$d.getHours();
//                             //    const selectedHour = field.value
//                             //   ? new Date(field.value).getHours()
//                             //   : null;

//                             //   console.log("curr")

//                             // if (selectedHour !== null) {

//                             //   const isPMSelected = selectedHour >= 12;
//                             //   const isAMSelected = selectedHour < 12;

//                             //   // Disable AM hours (0–11) if PM is selected
//                             //   if (isPMSelected && currentHour < 12) return true;

//                             //   // Disable PM hours (12–23) if AM is selected
//                             //   if (isAMSelected && currentHour >= 12) return true;
//                             // }

//                             return false;
//                           }}
//                         />
//                       )}
//                     />
//                   ) : (
//                     <DetalisFormatted
//                       title="Checkout Time"
//                       detail={
//                         selectedVisitor?.checkOutRaw
//                           ? humanTime(selectedVisitor.checkOutRaw)
//                           : ""
//                       }
//                     />
//                   )}
//                 </LocalizationProvider>
//                 {/* checkoutby */}
//                 {isEditing ? (
//                   <Controller
//                     name="checkOutBy"
//                     control={control}
//                     disabled
//                     render={({ field }) => (
//                       <TextField
//                         {...field}
//                         size="small"
//                         label="Checkout By"
//                         fullWidth
//                       />
//                     )}
//                   />
//                 ) : (
//                   <>
//                     <DetalisFormatted
//                       title="Checkout By"
//                       detail={selectedVisitor?.checkOutBy}
//                     />
//                     <br />
//                     {/* payment details */}
//                     {selectedVisitor?.purposeOfVisit !==
//                       "Meeting Room Booking" && (
//                       <>
//                         <div className="font-bold">Payment Details</div>
//                         <DetalisFormatted
//                           title="Amount"
//                           detail={`INR ${selectedVisitor?.paymentAmount || 0}`}
//                         />
//                         <DetalisFormatted
//                           title="Discount"
//                           detail={`INR ${selectedVisitor?.discountAmount || 0}`}
//                         />
//                         <DetalisFormatted
//                           title="Mode"
//                           detail={selectedVisitor?.paymentMode}
//                         />
//                         <DetalisFormatted
//                           title="Status"
//                           detail={selectedVisitor?.paymentStatus}
//                         />
//                         <DetalisFormatted
//                           title="Verification"
//                           detail={selectedVisitor?.paymentVerification}
//                         />
//                         <DetalisFormatted
//                           title="Uploaded File"
//                           detail={renderFileLink(selectedVisitor?.paymentProof)}
//                         />
//                       </>
//                     )}
//                   </>
//                 )}
//               </div>
//             ) : (
//               []
//             )}

//             {isEditing && (
//               <PrimaryButton
//                 disabled={isPending}
//                 title={isPending ? "Saving..." : "Save"}
//                 className="mt-2 w-full"
//                 type="submit"
//               />
//             )}
//           </form>
//         </div>
//       </MuiModal>
//       <MuiModal
//         open={openPaymentModal}
//         onClose={handleClosePaymentModal}
//         title={"Update Payment Details"}
//       >
//         <form
//           className="flex flex-col gap-4"
//           onSubmit={handlePaymentSubmit((data) => {
//             if (!paymentVisitor?.mongoId) {
//               toast.error("Payment details are not linked with this visitor");
//               return;
//             }

//             const formData = new FormData();
//             formData.append("amount", data?.paymentAmount || 0);
//             formData.append("paymentMode", data?.paymentType || "");
//             formData.append("paymentStatus", data?.paymentStatus || "");
//             formData.append("gstAmount", data?.gstAmount || 0);
//             formData.append("visitorId", paymentVisitor?.mongoId);
//             formData.append("discount", data?.discountAmount || 0);

//             if (data?.paymentProof) {
//               formData.append("paymentProof", data.paymentProof);
//             }

//             updatePayment(formData);
//           })}
//         >
//           <div className="flex gap-4 items-center">
//             <Controller
//               name="paymentAmount"
//               control={paymentControl}
//               rules={{ required: "Amount is required" }}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   label="Amount"
//                   type="number"
//                   size="small"
//                   fullWidth
//                   error={!!paymentErrors.paymentAmount}
//                   helperText={paymentErrors.paymentAmount?.message}
//                 />
//               )}
//             />
//             <Controller
//               name="gstAmount"
//               control={paymentControl}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   disabled
//                   label="GST Amount (18%)"
//                   type="number"
//                   size="small"
//                   fullWidth
//                   error={!!paymentErrors.gstAmount}
//                   helperText={paymentErrors.gstAmount?.message}
//                 />
//               )}
//             />
//           </div>
//           <div className="flex gap-4 items-center">
//             <Controller
//               name="discountAmount"
//               control={paymentControl}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   label="Discount Amount"
//                   type="number"
//                   size="small"
//                   fullWidth
//                   error={!!paymentErrors.discountAmount}
//                   helperText={paymentErrors.discountAmount?.message}
//                 />
//               )}
//             />
//             <Controller
//               name="discountPercentage"
//               control={paymentControl}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   disabled
//                   label="Discount %"
//                   type="number"
//                   size="small"
//                   fullWidth
//                   error={!!paymentErrors.discountPercentage}
//                   helperText={paymentErrors.discountPercentage?.message}
//                 />
//               )}
//             />
//           </div>
//           <Controller
//             name="finalAmount"
//             control={paymentControl}
//             render={({ field }) => (
//               <TextField
//                 {...field}
//                 disabled
//                 label="Final Amount"
//                 type="number"
//                 size="small"
//                 fullWidth
//                 error={!!paymentErrors.finalAmount}
//                 helperText={paymentErrors.finalAmount?.message}
//               />
//             )}
//           />
//           <div className="flex gap-4 items-center">
//             <Controller
//               name="paymentType"
//               control={paymentControl}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   size="small"
//                   label="Payment Type"
//                   select
//                   fullWidth
//                 >
//                   <MenuItem value="" disabled>
//                     Select Payment Type
//                   </MenuItem>
//                   {paymentModes.map((p) => (
//                     <MenuItem key={p} value={p}>
//                       {p}
//                     </MenuItem>
//                   ))}
//                 </TextField>
//               )}
//             />
//             <Controller
//               name="paymentStatus"
//               control={paymentControl}
//               rules={{ required: "Payment status is required" }}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   select
//                   label="Payment Status"
//                   size="small"
//                   fullWidth
//                   error={!!paymentErrors.paymentStatus}
//                   helperText={paymentErrors.paymentStatus?.message}
//                 >
//                   <MenuItem value="Paid">Paid</MenuItem>
//                   <MenuItem value="Unpaid">Unpaid</MenuItem>
//                 </TextField>
//               )}
//             />
//           </div>
//           <Controller
//             name="paymentProof"
//             control={paymentControl}
//             render={({ field }) => (
//               <UploadFileInput
//                 value={field.value}
//                 label="Add Payment Proof"
//                 onChange={field.onChange}
//                 allowedExtensions={["pdf", "jpg", "jpeg", "png"]}
//                 previewType="pdf"
//               />
//             )}
//           />
//           <div className="flex justify-center">
//             <PrimaryButton
//               disabled={isPaymentPending}
//               className="w-full"
//               title={"Save Payment Details"}
//               type={"submit"}
//             />
//           </div>
//         </form>
//       </MuiModal>
//     </div>
//   );
// };

// export default ExternalClients;
