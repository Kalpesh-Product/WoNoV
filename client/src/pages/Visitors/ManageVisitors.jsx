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
import { MdOutlineRemoveRedEye } from "react-icons/md";
import useAuth from "../../hooks/useAuth";

const ManageVisitors = () => {
  const { auth } = useAuth();
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

  const { mutate, isPending: isUpdating } = useMutation({
    mutationFn: async (updatedData) => {
      const response = await axios.patch(
        `/api/visitors/update-visitor/${selectedVisitor.mongoId}`,
        updatedData,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      toast.success("Visitor updated successfully");
      handleCloseModal();
    },
    onError: (error) => {
      toast.error(error.response.data.message || "Update failed");
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
        visitor.checkOutRaw ? dayjs(visitor.checkOutRaw) : null,
      );
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalMode("view");
    setSelectedVisitor(null);
  };

  // const submit = (data) => {
  //   mutate({
  //     ...data,
  //     checkOut: data.checkOutRaw ? dayjs(data.checkOutRaw).toISOString() : null,
  //   });
  // };

  const submit = (data) => {
    const checkInDate = selectedVisitor?.checkIn
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
        "Unknown User"
      : "-";

    mutate({
      ...data,
      checkOut: combinedCheckout ? combinedCheckout.toISOString() : null,
      checkOutBy: checkOutByName,
    });
  };

  const visitorsColumns = [
    { field: "srNo", headerName: "Sr No" },
    // { field: "firstName", headerName: "First Name" },
    // { field: "lastName", headerName: "Last Name" },
    { field: "name", headerName: "Name" },
    // { field: "email", headerName: "Email" },
    // { field: "phoneNumber", headerName: "Phone No" },
    { field: "purposeOfVisit", headerName: "Purpose" },
    { field: "toMeet", headerName: "To Meet" },
    { field: "date", headerName: "Date of Visit" },
    {
      field: "checkIn",
      headerName: "Check In",
      cellRenderer: (params) => humanTime(params.value),
    },
    // { field: "checkInBy", headerName: "Check In By" },
    { field: "checkOut", headerName: "Check Out" },
    // { field: "checkOutBy", headerName: "Check Out By" },
    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      cellRenderer: ({ data }) => {
        return (
          <div className="flex items-center gap-2">
            <div
              role="button"
              onClick={() => openModalWithMode(data, "view")}
              className="p-2 rounded-full hover:bg-borderGray cursor-pointer"
            >
              <MdOutlineRemoveRedEye />
            </div>
            <ThreeDotMenu
              menuItems={[
                {
                  label: "Edit",
                  onClick: () => openModalWithMode(data, "edit"),
                },
              ]}
            />
          </div>
        );
      },
    },
  ];

  const getBuildingName = (visitor) => {
    if (!visitor) return "N/A";
    if (visitor?.building?.buildingName) return visitor.building.buildingName;
    if (typeof visitor?.building === "string") {
      const matchedBuilding = auth?.user?.company?.workLocations?.find(
        (loc) => loc?._id === visitor.building,
      );
      return matchedBuilding?.buildingName || "N/A";
    }
    return "N/A";
  };

  const getUnitName = (visitor) => {
    if (!visitor) return "N/A";
    if (visitor?.unit?.unitNo) return visitor.unit.unitNo;
    if (typeof visitor?.unit === "string") {
      const matchedUnit = unitsData?.find((unit) => unit?._id === visitor.unit);
      return matchedUnit?.unitNo || matchedUnit?.name || "N/A";
    }
    return "N/A";
  };

  const hasRole = (record, role) => {
    const roles = Array.isArray(record?.visitorRoles)
      ? record.visitorRoles
      : [];
    return roles.includes(role) || record?.visitorFlag === role;
  };

  const getLatestVisitByRole = (visits = [], role) => {
    if (!Array.isArray(visits) || visits.length === 0) return null;
    const normalizeVisitorType = (value) =>
      String(value || "")
        .toLowerCase()
        .replace(/[^a-z]/g, "");

    const getVisitTimestamp = (visit) => {
      const dateValue =
        visit?.checkIn ||
        visit?.dateOfVisit ||
        visit?.createdAt ||
        visit?.updatedAt;
      const timestamp = new Date(dateValue || "").getTime();
      return Number.isNaN(timestamp) ? 0 : timestamp;
    };

    const internalVisitorTypes = new Set(["walkin", "scheduled"]);

    return (
      visits
        .filter((visit) => {
          const visitRoles = Array.isArray(visit?.visitorRoles)
            ? visit.visitorRoles
            : [];
          const isMatchingRole =
            visit?.visitorFlag === role || visitRoles.includes(role);
          const isInternalVisitType = internalVisitorTypes.has(
            normalizeVisitorType(visit?.visitorType),
          );

          return isMatchingRole && isInternalVisitType;
        })
        .sort((a, b) => getVisitTimestamp(b) - getVisitTimestamp(a))[0] || null
    );
  };

  return (
    <div>
      <PageFrame>
        <YearWiseTable
          dateColumn={"checkIn"}
          search
          tableTitle="Visitors Today"
          data={visitorsData
            .filter((visitor) => hasRole(visitor, "Visitor"))
            .map((item, index) => {
              const latestVisitorVisit = getLatestVisitByRole(
                item?.externalVisits,
                "Visitor",
              );

              return {
                srNo: index + 1,
                mongoId: item._id,
                firstName: item.firstName,
                lastName: item.lastName,
                name: `${item.firstName} ${item.lastName}`,
                email: item.email,
                visitorType:
                  latestVisitorVisit?.visitorType || item.visitorType,
                visitorCompany:
                  latestVisitorVisit?.visitorCompany || item.visitorCompany,
                date: latestVisitorVisit?.dateOfVisit || item.date,
                phoneNumber: item.phoneNumber,
                purposeOfVisit:
                  latestVisitorVisit?.purposeOfVisit || item.purposeOfVisit,
                toMeet: item.toMeet
                  ? `${item.toMeet?.firstName} ${item.toMeet?.lastName}`
                  : item.clientToMeet
                    ? item?.clientToMeet?.employeeName
                    : "",
                buildingName: getBuildingName(item),
                unitName: getUnitName(item),
                checkIn: latestVisitorVisit?.checkIn || item.checkIn,
                checkInBy: item.checkedInBy
                  ? `${item.checkedInBy.firstName} ${item.checkedInBy.lastName}`
                  : "-",
                checkOut: latestVisitorVisit?.checkOut
                  ? humanTime(latestVisitorVisit.checkOut)
                  : item.checkOut
                    ? humanTime(item.checkOut)
                    : "",
                checkOutRaw: latestVisitorVisit?.checkOut || item.checkOut,
                checkOutBy: item.checkedOutBy
                  ? `${item.checkedOutBy.firstName} ${item.checkedOutBy.lastName}`
                  : "-",
              };
            })}
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
              <DetalisFormatted title="Email" detail={selectedVisitor?.email} />
              <DetalisFormatted
                title="Phone Number"
                detail={selectedVisitor?.phoneNumber}
              />

              <DetalisFormatted
                title="Purpose"
                detail={selectedVisitor?.purposeOfVisit}
              />
              <DetalisFormatted
                title="Visitor Type"
                detail={selectedVisitor?.visitorType}
              />
              <DetalisFormatted
                title="Visitor Company"
                detail={selectedVisitor?.visitorCompany}
              />
              <DetalisFormatted
                title="To Meet"
                detail={selectedVisitor?.toMeet}
              />
              <DetalisFormatted
                title="Building"
                detail={selectedVisitor?.buildingName || "N/A"}
              />
              <DetalisFormatted
                title="Unit"
                detail={selectedVisitor?.unitName || "N/A"}
              />
              <DetalisFormatted
                title="Date of Visit"
                detail={selectedVisitor?.date}
              />
              <DetalisFormatted
                title="Check In"
                detail={humanTime(selectedVisitor?.checkIn)}
              />
              <DetalisFormatted
                title="Check In By"
                detail={selectedVisitor?.checkInBy}
              />
              <DetalisFormatted
                title="Check Out"
                detail={
                  selectedVisitor?.checkOutRaw
                    ? humanTime(selectedVisitor.checkOutRaw)
                    : ""
                }
              />
              <DetalisFormatted
                title="Check Out By"
                detail={selectedVisitor?.checkOutBy}
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
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Email" size="small" fullWidth />
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
                      shouldDisableTime={(time, view) => {
                        const startTime = selectedVisitor.checkIn;
                        const timeValue = time.$d;

                        if (!startTime) return false;

                        const startDate = new Date(startTime);

                        if (view === "hours") {
                          return timeValue.getHours() < startDate.getHours();
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
