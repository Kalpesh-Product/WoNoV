import { useCallback, useMemo, useState } from "react";
import AgTable from "../../components/AgTable";
import PrimaryButton from "../../components/PrimaryButton";
import { useQuery, useMutation } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import humanTime from "../../utils/humanTime";
import DetalisFormatted from "../../components/DetalisFormatted";
import MuiModal from "../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { TextField } from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
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
import buildDateFilterPayload from "../../utils/buildDateFilter";

const ManageVisitors = () => {
  const { auth } = useAuth();
  const axios = useAxiosPrivate();
  const allowedVisitScheduleEditorIds = [
    "67b83885daad0f7bab2f18a9",
    "6961fcd737afa664ab215d0a",
  ];
  const [modalMode, setModalMode] = useState("view");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const { setValue, handleSubmit, reset, control, watch } = useForm();
  const userDepartments = Array.isArray(auth?.user?.departments)
    ? auth.user.departments
    : [];
  const userRoles = Array.isArray(auth?.user?.role) ? auth.user.role : [];
  const isTopManagementUser = userDepartments.some(
    (department) =>
      String(department?.name || "")
        .trim()
        .toLowerCase() === "top management",
  );
  const isTechManager =
    userDepartments.some(
      (department) =>
        String(department?.name || "")
          .trim()
          .toLowerCase() === "tech",
    ) &&
    userRoles.some((role) =>
      String(role?.roleTitle || "")
        .trim()
        .toLowerCase()
        .includes("manager"),
    );
  const canEditVisitSchedule =
    allowedVisitScheduleEditorIds.includes(String(auth?.user?._id || "")) ||
    isTopManagementUser ||
    isTechManager;
  const editedCheckInRaw = watch("checkInRaw");

  const initialVisitorDateRange = useMemo(
    () => ({
      startDate: dayjs().startOf("month").toDate(),
      endDate: dayjs().endOf("month").toDate(),
      key: "selection",
    }),
    [],
  );
  const [visitorDateRange, setVisitorDateRange] = useState(
    initialVisitorDateRange,
  );
  const visitorFilters = useMemo(
    () => ({
      startDate: visitorDateRange?.startDate
        ? dayjs(visitorDateRange.startDate).startOf("day").toISOString()
        : undefined,
      endDate: visitorDateRange?.endDate
        ? dayjs(visitorDateRange.endDate).endOf("day").toISOString()
        : undefined,
    }),
    [visitorDateRange],
  );
  const handleVisitorDateFilterChange = useCallback(({ selectedRange }) => {
    if (!selectedRange?.startDate || !selectedRange?.endDate) return;
    setVisitorDateRange(selectedRange);
  }, []);

  const { data: visitorsData = [], isPending: isVisitorsData } = useQuery({
    queryKey: ["visitors", visitorFilters.startDate, visitorFilters.endDate],
    queryFn: async () => {
      const response = await axios.get("/api/visitors/fetch-visitors", {
        params: {
          filters: visitorFilters,
        },
      });
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
        "visitDate",
        visitor.checkIn
          ? dayjs(visitor.checkIn)
          : visitor.date
            ? dayjs(visitor.date)
            : null,
      );
      setValue("checkInRaw", visitor.checkIn ? dayjs(visitor.checkIn) : null);
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
    reset();
  };

  // const submit = (data) => {
  //   mutate({
  //     ...data,
  //     checkOut: data.checkOutRaw ? dayjs(data.checkOutRaw).toISOString() : null,
  //   });
  // };

  const submit = (data) => {
    const { visitDate, checkInRaw, ...restData } = data;
    const existingCheckIn = selectedVisitor?.checkIn
      ? dayjs(selectedVisitor.checkIn)
      : null;
    const selectedVisitDate = visitDate ? dayjs(visitDate) : null;
    const selectedCheckInTime = checkInRaw ? dayjs(checkInRaw) : null;
    const checkInDate =
      canEditVisitSchedule && (selectedVisitDate || selectedCheckInTime)
        ? (selectedVisitDate || existingCheckIn || dayjs())
            .hour(
              selectedCheckInTime?.hour?.() ?? existingCheckIn?.hour?.() ?? 0,
            )
            .minute(
              selectedCheckInTime?.minute?.() ??
                existingCheckIn?.minute?.() ??
                0,
            )
            .second(
              selectedCheckInTime?.second?.() ??
                existingCheckIn?.second?.() ??
                0,
            )
            .millisecond(
              selectedCheckInTime?.millisecond?.() ??
                existingCheckIn?.millisecond?.() ??
                0,
            )
        : existingCheckIn;
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
      ...restData,
      checkIn: checkInDate
        ? checkInDate.toISOString()
        : selectedVisitor?.checkIn,
      dateOfVisit: checkInDate
        ? checkInDate.toISOString()
        : selectedVisitor?.checkIn || null,
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

  const getBuildingName = useCallback(
    (visitor) => {
      if (!visitor) return "N/A";
      if (visitor?.building?.buildingName) return visitor.building.buildingName;
      if (typeof visitor?.building === "string") {
        const matchedBuilding = auth?.user?.company?.workLocations?.find(
          (loc) => loc?._id === visitor.building,
        );
        return matchedBuilding?.buildingName || "N/A";
      }
      return "N/A";
    },
    [auth?.user?.company?.workLocations],
  );

  const getUnitName = useCallback(
    (visitor) => {
      if (!visitor) return "N/A";
      if (visitor?.unit?.unitNo) return visitor.unit.unitNo;
      if (typeof visitor?.unit === "string") {
        const matchedUnit = unitsData?.find(
          (unit) => unit?._id === visitor.unit,
        );
        return matchedUnit?.unitNo || matchedUnit?.name || "N/A";
      }
      return "N/A";
    },
    [unitsData],
  );

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

  const visitorsTableData = useMemo(
    () =>
      visitorsData
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
            visitorType: latestVisitorVisit?.visitorType || item.visitorType,
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
        }),
    [getBuildingName, getUnitName, visitorsData],
  );

  return (
    <div>
      <PageFrame>
        <YearWiseTable
          dateColumn={"checkIn"}
          search
          tableTitle="Visitors Today"
          initialDateRange={initialVisitorDateRange}
          onDateFilterChange={handleVisitorDateFilterChange}
          // data={visitorsData
          //   .filter((visitor) => hasRole(visitor, "Visitor"))
          //   .map((item, index) => {
          //     const latestVisitorVisit = getLatestVisitByRole(
          //       item?.externalVisits,
          //       "Visitor",
          //     );

          //     return {
          //       srNo: index + 1,
          //       mongoId: item._id,
          //       firstName: item.firstName,
          //       lastName: item.lastName,
          //       name: `${item.firstName} ${item.lastName}`,
          //       email: item.email,
          //       visitorType:
          //         latestVisitorVisit?.visitorType || item.visitorType,
          //       visitorCompany:
          //         latestVisitorVisit?.visitorCompany || item.visitorCompany,
          //       date: latestVisitorVisit?.dateOfVisit || item.date,
          //       phoneNumber: item.phoneNumber,
          //       purposeOfVisit:
          //         latestVisitorVisit?.purposeOfVisit || item.purposeOfVisit,
          //       toMeet: item.toMeet
          //         ? `${item.toMeet?.firstName} ${item.toMeet?.lastName}`
          //         : item.clientToMeet
          //           ? item?.clientToMeet?.employeeName
          //           : "",
          //       buildingName: getBuildingName(item),
          //       unitName: getUnitName(item),
          //       checkIn: latestVisitorVisit?.checkIn || item.checkIn,
          //       checkInBy: item.checkedInBy
          //         ? `${item.checkedInBy.firstName} ${item.checkedInBy.lastName}`
          //         : "-",
          //       checkOut: latestVisitorVisit?.checkOut
          //         ? humanTime(latestVisitorVisit.checkOut)
          //         : item.checkOut
          //           ? humanTime(item.checkOut)
          //           : "",
          //       checkOutRaw: latestVisitorVisit?.checkOut || item.checkOut,
          //       checkOutBy: item.checkedOutBy
          //         ? `${item.checkedOutBy.firstName} ${item.checkedOutBy.lastName}`
          //         : "-",
          //     };
          //   })}

          data={visitorsTableData}
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
              {canEditVisitSchedule && (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name="visitDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Date"
                        format="DD-MM-YYYY"
                        value={field.value}
                        onChange={field.onChange}
                        slotProps={{
                          textField: { size: "small", fullWidth: true },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              )}
              {canEditVisitSchedule && (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name="checkInRaw"
                    control={control}
                    render={({ field }) => (
                      <TimePicker
                        label="Check In Time"
                        value={field.value}
                        onChange={field.onChange}
                        slotProps={{
                          textField: { size: "small", fullWidth: true },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              )}
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
                        const startTime =
                          editedCheckInRaw || selectedVisitor?.checkIn;
                        const timeValue = time?.$d;

                        if (!startTime || !timeValue) return false;

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
