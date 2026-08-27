import { Avatar, Button, Chip, MenuItem, TextField } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAuth from "../../../../hooks/useAuth";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import PrimaryButton from "../../../../components/PrimaryButton";
import { Controller, useForm, useWatch } from "react-hook-form";
import SecondaryButton from "../../../../components/SecondaryButton";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import humanDate from "../../../../utils/humanDateForamt";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { setSelectedClient } from "../../../../redux/slices/clientSlice";
import { setClientData } from "../../../../redux/slices/salesSlice";
import { useParams } from "react-router-dom";

const buildRateSchedule = (
  startDate,
  endDate,
  openDeskRate,
  annualIncrement,
) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const baseRate = Number(openDeskRate) || 0;
  const increment = Number(annualIncrement) || 0;

  if (!start.isValid() || !end.isValid() || !end.isAfter(start, "day") || !baseRate) {
    return [];
  }

  const schedule = [];
  let periodStart = start.startOf("day");
  let year = 1;
  let currentRate = baseRate;

  while (!periodStart.isAfter(end, "day")) {
    let periodEnd = periodStart.add(1, "year").subtract(1, "day");
    if (periodEnd.isAfter(end, "day")) {
      periodEnd = end;
    }

    schedule.push({
      year,
      startDate: periodStart,
      endDate: periodEnd,
      rate: currentRate,
    });

    if (!periodEnd.isBefore(end, "day")) {
      break;
    }

    periodStart = periodEnd.add(1, "day");
    currentRate *= 1 + increment / 100;
    year += 1;
  }

  return schedule;
};

const formatCurrency = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "N/A";
  }

  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
};

const useCurrentMonthStartDate = () => {
  const [currentMonthStartDate, setCurrentMonthStartDate] = useState(
    () => dayjs().startOf("month").toISOString(),
  );

  useEffect(() => {
    let timeoutId;

    const scheduleNextUpdate = () => {
      const now = dayjs();
      const nextMonthStart = now.add(1, "month").startOf("month");
      const delay = Math.max(nextMonthStart.diff(now), 0);

      timeoutId = window.setTimeout(() => {
        setCurrentMonthStartDate(dayjs().startOf("month").toISOString());
        scheduleNextUpdate();
      }, delay);
    };

    setCurrentMonthStartDate(dayjs().startOf("month").toISOString());
    scheduleNextUpdate();

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return currentMonthStartDate;
};

const calculateTotalTermMonths = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;

  const start = dayjs(startDate);
  const end = dayjs(endDate);

  if (!start.isValid() || !end.isValid() || !end.isAfter(start)) return 0;

  return end.diff(start, "month");
};

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const getCalendarDateInUtc = (value) => {
  const date = new Date(value);
  const dateParts =
    typeof value === "string" && value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (dateParts) {
    return Date.UTC(
      Number(dateParts[1]),
      Number(dateParts[2]) - 1,
      Number(dateParts[3]),
    );
  }

  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
};

const calculateAgreementExpiry = (startDate, endDate) => {
  const startDay = getCalendarDateInUtc(startDate);
  const endDay = getCalendarDateInUtc(endDate);

  if (
    !startDate ||
    !endDate ||
    Number.isNaN(startDay) ||
    Number.isNaN(endDay) ||
    endDay < startDay
  ) {
    return "-";
  }

  const today = getCalendarDateInUtc(new Date());
  const totalDays = Math.round((endDay - startDay) / MILLISECONDS_PER_DAY);
  const remainingDays = Math.min(
    totalDays,
    Math.max(0, Math.round((endDay - today) / MILLISECONDS_PER_DAY)),
  );

  return `${remainingDays}/${totalDays} ${totalDays === 1 ? "day" : "days"}`;
};

const VirtualOfficeClientDetails = () => {
  const dispatch = useDispatch();
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const { clientId } = useParams();
  const selectedClient = useSelector((state) => state.client.selectedClient);
  const clientsData = useSelector((state) => state.sales.clientsData);
  const currentMonthStartDate = useCurrentMonthStartDate();
  const DEFAULT_BOOKING_TYPE = "Direct";
  const BOOKING_TYPE_OPTIONS = ["Direct", "SPV Booking"];
  const normalizedClientName = useMemo(
    () => decodeURIComponent(clientId || "").trim().toLowerCase(),
    [clientId],
  );

  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      clientName: "",
      serviceName: "",
      serviceDescription: "",
      sector: "",
      hoCity: "",
      hoState: "",
      building: "",
      unit: "",
      unitName: "",
      unitNo: "",
      cabinDesks: 0,
      securityDeposit: 0,
      openDesks: 0,
      totalDesks: 0,
      bookingType: DEFAULT_BOOKING_TYPE,
      openDeskRate: 0,
      cabinDeskRate: 0,
      annualIncrement: 0,
      perDeskMeetingCredits: 0,
      totalMeetingCredits: 0,
      termStartDate: "",
      termEnd: "",
      lockInPeriodMonths: 0,
      rentDate: currentMonthStartDate,
      nextIncrementDate: "",
      localPocName: "",
      localPocEmail: "",
      localPocPhone: "",
      hoPocName: "",
      hoPocEmail: "",
      hoPocPhone: "",
      clientStatus: true,
      createdAt: "",
      updatedAt: "",
    },
  });

  useEffect(() => {
    if (selectedClient) {
      reset({
        clientName: selectedClient.clientName,
        serviceName: selectedClient.service?.serviceName || "",
        serviceDescription: selectedClient.service?.description || "",
        sector: selectedClient.sector,
        hoCity: selectedClient.city || selectedClient.hoCity,
        hoState: selectedClient.state || selectedClient.hoState,
        building: resolveBuildingId(selectedClient),
        unit: resolveUnitId(selectedClient),
        unitName: selectedClient.unit?.unitName || selectedClient.unitName || "",
        unitNo:
          selectedClient.unit?.unitNo || selectedClient.unitNo || "",
        buildingName:
          selectedClient.unit?.building?.buildingName ||
          selectedClient.buildingName ||
          "",
        buildingAddress:
          selectedClient.unit?.building?.fullAddress ||
          selectedClient.buildingAddress ||
          "",
        cabinDesks: selectedClient.cabinDesks || 0,
        securityDeposit: selectedClient.securityDeposit || 0,
        openDesks: selectedClient.openDesks || 0,
        totalDesks: selectedClient.totalDesks || 0,
        openDeskRate: selectedClient.openDeskRate || 0,
        cabinDeskRate: selectedClient.cabinDeskRate || 0,
        annualIncrement: selectedClient.annualIncrement || 0,
        perDeskMeetingCredits: selectedClient.perDeskMeetingCredits || 0,
        totalMeetingCredits: selectedClient.totalMeetingCredits || 0,
        termStartDate: selectedClient.termStartDate || selectedClient.startDate,
        bookingType: DEFAULT_BOOKING_TYPE,
        termEnd: selectedClient.termEnd || selectedClient.endDate,
        lockInPeriodMonths:
          selectedClient.lockInPeriodMonths || selectedClient.lockinPeriod,
        rentDate: currentMonthStartDate,
        nextIncrementDate:
          selectedClient.nextIncrementDate || selectedClient.nextIncrement,
        localPocName: selectedClient.localPoc?.name || "",
        localPocEmail: selectedClient.localPoc?.email || "",
        localPocPhone: selectedClient.localPoc?.phone || "",
        hoPocName: selectedClient.hoPoc?.name || "",
        hoPocEmail: selectedClient.hoPoc?.email || "",
        hoPocPhone: selectedClient.hoPoc?.phone || "",
        clientStatus: selectedClient.clientStatus ?? selectedClient.isActive,
        createdAt: selectedClient.createdAt,
        updatedAt: selectedClient.updatedAt,
      });
    }
  }, [currentMonthStartDate, selectedClient, reset]);

  const virtualOfficeClientId = /^[a-fA-F0-9]{24}$/.test(clientId)
    ? clientId
    : selectedClient?._id;

  const { isLoading: isClientByNameLoading } = useQuery({
    queryKey: ["virtualOfficeClientByName", normalizedClientName],
    enabled:
      Boolean(normalizedClientName) &&
      !/^[a-fA-F0-9]{24}$/.test(clientId || "") &&
      (selectedClient?.clientName || "").trim().toLowerCase() !== normalizedClientName,
    queryFn: async () => {
      const response = await axios.get("/api/sales/virtual-office/clients");
      const clients = Array.isArray(response?.data) ? response.data : [];
      const matchedClient = clients.find(
        (client) =>
          (client?.clientName || "").trim().toLowerCase() === normalizedClientName,
      );

      if (matchedClient?._id) {
        dispatch(setSelectedClient(matchedClient));
      }

      return matchedClient;
    },
  });

  const { isLoading: isClientLoading } = useQuery({
    queryKey: ["virtualOfficeClient", virtualOfficeClientId],
    enabled: Boolean(virtualOfficeClientId),
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/sales/virtual-office/clients?virtualofficeclientid=${virtualOfficeClientId}`,
        );
        const rawClientData =
          response?.data?.client || response?.data?.data || response?.data;
        const clientData = Array.isArray(rawClientData)
          ? rawClientData[0]
          : rawClientData;

        if (clientData?._id) {
          dispatch(setSelectedClient(clientData));
        }

        return clientData;
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Unable to fetch client details",
        );
        throw error;
      }
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const selectedBuilding = useWatch({ control, name: "building" });
  const watchedOpenDeskRate = useWatch({ control, name: "openDeskRate" });
  const watchedAnnualIncrement = useWatch({ control, name: "annualIncrement" });
  const watchedTotalDesks = useWatch({ control, name: "totalDesks" });
  const termStartDateValue = useWatch({ control, name: "termStartDate" });
  const termEndValue = useWatch({ control, name: "termEnd" });
  const resolveUnitId = (client) =>
    typeof client?.unit === "object" ? client?.unit?._id || "" : client?.unit || "";
  const resolveBuildingId = (client) => {
    if (typeof client?.unit === "object" && client?.unit?.building) {
      return typeof client.unit.building === "object"
        ? client.unit.building._id || ""
        : client.unit.building || "";
    }

    if (typeof client?.building === "object") {
      return client.building?._id || "";
    }

    return client?.building || "";
  };
  const calculatedLockInPeriodMonths = useMemo(() => {
    const startDate =
      termStartDateValue || selectedClient?.termStartDate || selectedClient?.startDate;
    const endDate = termEndValue || selectedClient?.termEnd || selectedClient?.endDate;

    return calculateTotalTermMonths(startDate, endDate);
  }, [
    selectedClient?.endDate,
    selectedClient?.startDate,
    selectedClient?.termEnd,
    selectedClient?.termStartDate,
    termEndValue,
    termStartDateValue,
  ]);
  const rateSchedule = useMemo(
    () =>
      buildRateSchedule(
        termStartDateValue || selectedClient?.termStartDate || selectedClient?.startDate,
        termEndValue || selectedClient?.termEnd || selectedClient?.endDate,
        watchedOpenDeskRate,
        watchedAnnualIncrement,
      ),
    [
      selectedClient?.endDate,
      selectedClient?.startDate,
      selectedClient?.termEnd,
      selectedClient?.termStartDate,
      termEndValue,
      termStartDateValue,
      watchedAnnualIncrement,
      watchedOpenDeskRate,
    ],
  );
  const computedCurrentRate = useMemo(() => {
    if (!rateSchedule.length) {
      return Number(watchedOpenDeskRate) || selectedClient?.openDeskRate || 0;
    }
    return rateSchedule[rateSchedule.length - 1].rate;
  }, [rateSchedule, selectedClient?.openDeskRate, watchedOpenDeskRate]);
  const computedRevenue = useMemo(
    () => Number(watchedTotalDesks || selectedClient?.totalDesks || 0) * Number(computedCurrentRate || 0),
    [computedCurrentRate, selectedClient?.totalDesks, watchedTotalDesks],
  );

  const totalTermMonths = useMemo(() => {
    if (isEditing) {
      return calculateTotalTermMonths(termStartDateValue, termEndValue);
    }

    const startDate = selectedClient?.termStartDate || selectedClient?.startDate;
    const endDate = selectedClient?.termEnd || selectedClient?.endDate;

    if (typeof selectedClient?.totalTerm === "number" && selectedClient?.totalTerm >= 0) {
      return selectedClient.totalTerm;
    }

    return calculateTotalTermMonths(startDate, endDate);
  }, [isEditing, termStartDateValue, termEndValue, selectedClient]);
  const calculatedAgreementExpiry = useMemo(
    () =>
      calculateAgreementExpiry(
        termStartDateValue || selectedClient?.termStartDate || selectedClient?.startDate,
        termEndValue || selectedClient?.termEnd || selectedClient?.endDate,
      ),
    [
      selectedClient?.endDate,
      selectedClient?.startDate,
      selectedClient?.termEnd,
      selectedClient?.termStartDate,
      termEndValue,
      termStartDateValue,
    ],
  );

  const { data: units = [], isLoading: isUnitsLoading } = useQuery({
    queryKey: ["units", "virtual-office-client-details"],
    queryFn: async () => {
      const response = await axios.get("/api/company/fetch-units?deskCalculated=true");
      return response.data;
    },
  });

  const availableBuildings = auth?.user?.company?.workLocations || [];
  const filteredUnits = useMemo(() => {
    if (!selectedBuilding) {
      return [];
    }

    return units.filter((item) => item.building?._id === selectedBuilding);
  }, [selectedBuilding, units]);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const currentUnit = control._formValues.unit;
    if (currentUnit && !filteredUnits.some((item) => item._id === currentUnit)) {
      setValue("unit", "");
    }
  }, [control._formValues.unit, filteredUnits, isEditing, setValue]);

  useEffect(() => {
    setValue("rentDate", currentMonthStartDate);
  }, [currentMonthStartDate, setValue]);

  useEffect(() => {
    setValue("lockInPeriodMonths", calculatedLockInPeriodMonths);
  }, [calculatedLockInPeriodMonths, setValue]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const onSubmit = async (data) => {
    if (!selectedClient?._id) {
      toast.error("Client details not found");
      return;
    }

    const payload = {
      clientName: data.clientName,
      sector: data.sector,
      city: data.hoCity,
      state: data.hoState,
      clientStatus: data.clientStatus === true || data.clientStatus === "true",
      bookingType: data.bookingType || DEFAULT_BOOKING_TYPE,
      building: data.building,
      unit: data.unit,
      cabinDesks: Number(data.cabinDesks) || 0,
      securityDeposit: Number(data.securityDeposit) || 0,
      openDesks: Number(data.openDesks) || 0,
      cabinDeskRate: Number(data.cabinDeskRate) || 0,
      openDeskRate: Number(data.openDeskRate) || 0,
      annualIncrement: Number(data.annualIncrement) || 0,
      perDeskMeetingCredits: Number(data.perDeskMeetingCredits) || 0,
      termStartDate: data.termStartDate,
      termEnd: data.termEnd,
      lockInPeriodMonths: calculatedLockInPeriodMonths,
      rentDate: data.rentDate || currentMonthStartDate,
      nextIncrementDate: data.nextIncrementDate,
      localPoc: {
        name: data.localPocName,
        email: data.localPocEmail,
        phone: data.localPocPhone,
      },
      hoPoc: {
        name: data.hoPocName,
        email: data.hoPocEmail,
        phone: data.hoPocPhone,
      },
    };

    try {
      console.log("Submitting payload:", payload);
      const response = await axios.patch(
        `/api/sales/virtual-office/${selectedClient._id}`,
        payload,
      );

      console.log("Server response:", response.data);
      const serverData = response?.data?.data || response?.data?.client || {};
      const submittedUnit =
        units.find((item) => item._id === data.unit) || null;
      const submittedBuildingId =
        submittedUnit?.building?._id ||
        submittedUnit?.building ||
        data.building ||
        resolveBuildingId(selectedClient);

      const updatedClient = {
        ...selectedClient,
        ...serverData,
        building: submittedBuildingId,
        unit: submittedUnit || serverData.unit || data.unit,
        buildingName:
          submittedUnit?.building?.buildingName ||
          serverData.buildingName ||
          selectedClient.buildingName ||
          "",
        buildingAddress:
          submittedUnit?.building?.fullAddress ||
          serverData.buildingAddress ||
          selectedClient.buildingAddress ||
          "",
        // Map POC data back to flattened fields for UI consistency
        unitNo:
          submittedUnit?.unitNo ??
          serverData.unitNo ??
          serverData.unitNumber ??
          data.unitNo,
        localPocName: payload.localPoc.name,
        localPocEmail: payload.localPoc.email,
        localPocPhone: payload.localPoc.phone,
        hoPocName: payload.hoPoc.name,
        hoPocEmail: payload.hoPoc.email,
        hoPocPhone: payload.hoPoc.phone,
        // Map other potentially renamed fields back for UI compatibility
        hoCity: serverData.city || serverData.hoCity || data.hoCity,
        hoState: serverData.state || serverData.hoState || data.hoState,
        clientStatus: serverData.clientStatus ?? serverData.isActive ?? data.clientStatus,
        lockInPeriodMonths:
          serverData.lockInPeriodMonths ??
          serverData.lockinPeriod ??
          calculatedLockInPeriodMonths,
        termStartDate: serverData.termStartDate ?? serverData.startDate ?? data.termStartDate,
        termEnd: serverData.termEnd ?? serverData.endDate ?? data.termEnd,
        nextIncrementDate: serverData.nextIncrementDate ?? serverData.nextIncrement ?? data.nextIncrementDate,
      };

      dispatch(setSelectedClient(updatedClient));

      if (Array.isArray(clientsData)) {
        dispatch(
          setClientData(
            clientsData.map((item) =>
              item._id === selectedClient._id
                ? { ...item, ...updatedClient }
                : item,
            ),
          ),
        );
      }

      // Sync form with updated data
      reset({
        ...data,
        ...updatedClient,
        building: submittedBuildingId,
        unit: submittedUnit?._id || data.unit || "",
        buildingName: updatedClient.buildingName || "",
        buildingAddress: updatedClient.buildingAddress || "",
        unitName: submittedUnit?.unitName || data.unitName || "",
        unitNo: submittedUnit?.unitNo || data.unitNo || "",
        totalDesks: serverData.totalDesks || payload.cabinDesks + payload.openDesks,
        totalMeetingCredits: serverData.totalMeetingCredits,
      });

      setIsEditing(false);
      toast.success(
        response?.data?.message || "Client details updated successfully",
      );
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(
        error?.response?.data?.message || "Unable to update client details",
      );
    }
  };

  const handleReset = () => {
    if (selectedClient) {
      const resetUnit =
        units.find((item) => item._id === resolveUnitId(selectedClient)) || null;
      const resetBuildingId =
        resetUnit?.building?._id ||
        resetUnit?.building ||
        resolveBuildingId(selectedClient);

      reset({
        clientName: selectedClient.clientName,
        serviceName: selectedClient.service?.serviceName || "",
        serviceDescription: selectedClient.service?.description || "",
        sector: selectedClient.sector,
        hoCity: selectedClient.city || selectedClient.hoCity,
        hoState: selectedClient.state || selectedClient.hoState,
        building: resetBuildingId,
        unit: resolveUnitId(selectedClient),
        unitName: selectedClient.unit?.unitName || selectedClient.unitName || resetUnit?.unitName || "",
        unitNo:
          selectedClient.unit?.unitNo ||
          selectedClient.unitNo ||
          resetUnit?.unitNo ||
          "",
        buildingName:
          selectedClient.unit?.building?.buildingName ||
          selectedClient.buildingName ||
          resetUnit?.building?.buildingName ||
          "",
        buildingAddress:
          selectedClient.unit?.building?.fullAddress ||
          selectedClient.buildingAddress ||
          resetUnit?.building?.fullAddress ||
          "",
        cabinDesks: selectedClient.cabinDesks || 0,
        openDesks: selectedClient.openDesks || 0,
        securityDeposit: selectedClient.securityDeposit || 0,
        totalDesks: selectedClient.totalDesks || 0,
        openDeskRate: selectedClient.openDeskRate || 0,
        cabinDeskRate: selectedClient.cabinDeskRate || 0,
        annualIncrement: selectedClient.annualIncrement || 0,
        perDeskMeetingCredits: selectedClient.perDeskMeetingCredits || 0,
        totalMeetingCredits: selectedClient.totalMeetingCredits || 0,
        termStartDate: selectedClient.termStartDate || selectedClient.startDate,
        bookingType: DEFAULT_BOOKING_TYPE,
        termEnd: selectedClient.termEnd || selectedClient.endDate,
        lockInPeriodMonths: calculateTotalTermMonths(
          selectedClient.termStartDate || selectedClient.startDate,
          selectedClient.termEnd || selectedClient.endDate,
        ),
        rentDate: currentMonthStartDate,
        nextIncrementDate:
          selectedClient.nextIncrementDate || selectedClient.nextIncrement,
        localPocName: selectedClient.localPoc?.name || "",
        localPocEmail: selectedClient.localPoc?.email || "",
        localPocPhone: selectedClient.localPoc?.phone || "",
        hoPocName: selectedClient.hoPoc?.name || "",
        hoPocEmail: selectedClient.hoPoc?.email || "",
        hoPocPhone: selectedClient.hoPoc?.phone || "",
        clientStatus: selectedClient.clientStatus ?? selectedClient.isActive,
        createdAt: selectedClient.createdAt,
        updatedAt: selectedClient.updatedAt,
      });
    }
  };

  const renderDatePickerField = (field, label, disabled = false) => (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        format="DD-MM-YYYY"
        value={field.value ? dayjs(field.value) : null}
        disabled={disabled}
        onChange={(dateValue) =>
          field.onChange(dateValue ? dayjs(dateValue).toISOString() : "")
        }
        slotProps={{
          textField: {
            size: "small",
            fullWidth: true,
          },
        }}
      />
    </LocalizationProvider>
  );

  return (
    <div className="border-2 border-gray-200 p-4 rounded-md flex flex-col gap-4 ">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-subtitle font-pmedium text-primary">
            Client Details
          </span>
        </div>
        <div>
          <PrimaryButton
            handleSubmit={handleEditToggle}
            title={isEditing ? "Cancel" : "Edit"}
            disabled={isClientLoading || isClientByNameLoading || !selectedClient?._id}
          />
        </div>
      </div>

      <div className="h-[51vh] overflow-y-auto">
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-4">
              {/* Section:  Customer Details */}
              <div>
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    Customer Details
                  </span>
                </div>

                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  {[
                    "clientName",
                    "sector",
                    "hoCity",
                    "hoState",
                    "bookingType",
                    "revenue",
                  ].map((fieldKey) => (
                    <div key={fieldKey}>
                      {isEditing ? (
                        <Controller
                          name={fieldKey}
                          control={control}
                          render={({ field }) =>
                            fieldKey === "bookingType" ? (
                              <TextField
                                {...field}
                                size="small"
                                label="Booking Type"
                                select
                                value={field.value || DEFAULT_BOOKING_TYPE}
                                fullWidth
                              >
                                {BOOKING_TYPE_OPTIONS.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                            ) : fieldKey === "revenue" ? (
                              <TextField
                                {...field}
                                size="small"
                                label="Revenue"
                                value={formatCurrency(computedRevenue)}
                                fullWidth
                                disabled
                              />
                            ) : (
                              <TextField
                                {...field}
                                size="small"
                                label={fieldKey
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase())}
                                fullWidth
                              />
                            )
                          }
                        />
                      ) : (
                        <div className="py-2 flex justify-between items-center gap-2">
                          <div className="w-[100%] justify-start flex">
                            <span className="font-pmedium text-gray-600 text-content">
                              {fieldKey
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                            </span>{" "}
                          </div>
                          <div className="">
                            <span>:</span>
                          </div>
                          <div className="w-full">
                            <span className="text-gray-500">
                              {fieldKey === "bookingType"
                                ? selectedClient?.bookingType || DEFAULT_BOOKING_TYPE
                                : fieldKey === "revenue"
                                  ? formatCurrency(computedRevenue)
                                  : (fieldKey === "hoCity"
                                ? selectedClient?.city || selectedClient?.hoCity
                                : fieldKey === "hoState"
                                  ? selectedClient?.state || selectedClient?.hoState
                                  : selectedClient?.[fieldKey]) || "N/A"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* Section: Company Details */}
              <div>
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    Company Details
                  </span>
                </div>

                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  {isEditing ? (
                    <>
                      <Controller
                        name="building"
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} select size="small" label="Building" fullWidth>
                            <MenuItem value="">Select a Building</MenuItem>
                            {availableBuildings.map((item) => (
                              <MenuItem key={item._id} value={item._id}>
                                {item.buildingName}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                      <Controller
                        name="unit"
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} select size="small" label="Unit" fullWidth>
                            <MenuItem value="">Select a Unit</MenuItem>
                            {isUnitsLoading ? (
                              <MenuItem disabled>Loading units...</MenuItem>
                            ) : filteredUnits.length > 0 ? (
                              filteredUnits.map((item) => (
                                <MenuItem key={item._id} value={item._id}>
                                  {item.unitNo}
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem disabled>
                                {selectedBuilding ? "No units available" : "Select a building first"}
                              </MenuItem>
                            )}
                          </TextField>
                        )}
                      />
                      {[
                        // "cabinDesks",
                        "securityDeposit",
                        // "cabinDeskRate",
                        "openDesks",
                        "openDeskRate",
                        "totalDesks",
                        "currentRate",
                        "clientStatus",
                      ].map((fieldKey) => (
                        <Controller
                          key={fieldKey}
                          name={fieldKey}
                          control={control}
                          render={({ field }) =>
                            fieldKey === "clientStatus" ? (
                              <TextField {...field} select size="small" label="Status" fullWidth>
                                <MenuItem value={true}>Active</MenuItem>
                                <MenuItem value={false}>Inactive</MenuItem>
                              </TextField>
                            ) : fieldKey === "totalDesks" ? (
                              <TextField {...field} disabled size="small" label="No Of Desk" fullWidth />
                            ) : fieldKey === "currentRate" ? (
                              <TextField
                                {...field}
                                value={formatCurrency(computedCurrentRate)}
                                disabled
                                size="small"
                                label="Current Rate"
                                fullWidth
                              />
                            ) : (
                              <TextField
                                {...field}
                                size="small"
                                label={fieldKey
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase())}
                                fullWidth
                              />
                            )
                          }
                        />
                      ))}
                    </>
                  ) : (
                    [
                      "buildingName",
                      "unitNo",
                      // "cabinDesks",
                      "securityDeposit",
                      // "cabinDeskRate",
                      "openDesks",
                      "openDeskRate",
                      "totalDesks",
                      "currentRate",
                      "clientStatus",
                    ].map((fieldKey) => (
                      <div key={fieldKey} className="py-2 flex justify-between items-start gap-2">
                        <div className="w-[100%] justify-start flex">
                          <span className="font-pmedium text-gray-600 text-content">
                            {fieldKey === "clientStatus"
                              ? "Status"
                              : fieldKey === "totalDesks"
                                ? "No Of Desk"
                              : fieldKey === "currentRate"
                                  ? "Current Rate"
                              : fieldKey
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                          </span>{" "}
                        </div>
                        <div className="">
                          <span>:</span>
                        </div>
                        <div className="w-full">
                          <span className="text-gray-500">
                            {fieldKey === "clientStatus"
                              ? (selectedClient?.clientStatus ?? selectedClient?.isActive)
                                ? "Active"
                                : "Inactive"
                              : fieldKey === "currentRate"
                                ? formatCurrency(computedCurrentRate)
                              : fieldKey === "buildingName"
                                ? selectedClient?.unit?.building?.buildingName || control._defaultValues.buildingName || "N/A"
                                : fieldKey === "unitNo"
                                  ? selectedClient?.unit?.unitNo || control._defaultValues.unitNo || "N/A"
                                  : selectedClient?.[fieldKey] || "N/A"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div>
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    Agreement Details
                  </span>
                </div>

                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  {/* Annual Increment */}
                  <div>
                    {isEditing ? (
                      <Controller
                        name="annualIncrement"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            label="Annual Increment"
                            fullWidth
                          />
                        )}
                      />
                    ) : (
                      <div className="py-2 flex justify-between items-start gap-2">
                        <div className="w-[100%] justify-start flex">
                          <span className="font-pmedium text-gray-600 text-content">
                            Annual Increment
                          </span>{" "}
                        </div>
                        <div className="">
                          <span>:</span>
                        </div>
                        <div className="w-full">
                          <span className="text-gray-500">
                            {selectedClient?.annualIncrement}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* <div className="md:col-span-2">
                    <div className="py-2 flex justify-between items-start gap-2">
                      <div className="w-[100%] justify-start flex">
                        <span className="font-pmedium text-gray-600 text-content">
                          Yearly Rate Schedule
                        </span>{" "}
                      </div>
                    </div>
                    {rateSchedule.length > 0 ? (
                      <div className="overflow-x-auto rounded-md border border-gray-200">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left font-pmedium text-gray-700">
                                Year
                              </th>
                              <th className="px-4 py-3 text-left font-pmedium text-gray-700">
                                Period
                              </th>
                              <th className="px-4 py-3 text-left font-pmedium text-gray-700">
                                Rate
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {rateSchedule.map((row) => (
                              <tr key={row.year} className="border-t border-gray-200">
                                <td className="px-4 py-3 text-gray-600">
                                  Year {row.year}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {row.startDate.format("DD-MM-YYYY")} →{" "}
                                  {row.endDate.format("DD-MM-YYYY")}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {formatCurrency(row.rate)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        No rate schedule available.
                      </div>
                    )}
                  </div> */}

                  {/* Per Desk Meeting Credits */}
                  <div>
                    {isEditing ? (
                      <Controller
                        name="perDeskMeetingCredits"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            label="Per Desk Meeting Credits"
                            fullWidth
                          />
                        )}
                      />
                    ) : (
                      <div className="py-2 flex justify-between items-start gap-2">
                        <div className="w-[100%] justify-start flex">
                          <span className="font-pmedium text-gray-600 text-content">
                            Per Desk Meeting Credits
                          </span>{" "}
                        </div>
                        <div className="">
                          <span>:</span>
                        </div>
                        <div className="w-full">
                          <span className="text-gray-500">
                            {selectedClient?.perDeskMeetingCredits}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Total Meeting Credits */}
                  <div>
                    {isEditing ? (
                      <Controller
                        name="totalMeetingCredits"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size="small"
                            label="Total Meeting Credits"
                            fullWidth
                          />
                        )}
                      />
                    ) : (
                      <div className="py-2 flex justify-between items-start gap-2">
                        <div className="w-[100%] justify-start flex">
                          <span className="font-pmedium text-gray-600 text-content">
                            Total Meeting Credits
                          </span>{" "}
                        </div>
                        <div className="">
                          <span>:</span>
                        </div>
                        <div className="w-full">
                          <span className="text-gray-500">
                            {selectedClient?.totalMeetingCredits}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Start Date */}
                  <div>
                    {isEditing ? (
                      <Controller
                        name="termStartDate"
                        control={control}
                        render={({ field }) =>
                          renderDatePickerField(field, "Start Date")
                        }
                      />
                    ) : (
                      <div className="py-2 flex justify-between items-start gap-2">
                        <div className="w-[100%] justify-start flex">
                          <span className="font-pmedium text-gray-600 text-content">
                            Start Date
                          </span>{" "}
                        </div>
                        <div className="">
                          <span>:</span>
                        </div>
                        <div className="w-full">
                          <span className="text-gray-500">
                            {humanDate(selectedClient?.termStartDate || selectedClient?.startDate)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* End Date */}
                  <div>
                    {isEditing ? (
                      <Controller
                        name="termEnd"
                        control={control}
                        render={({ field }) =>
                          renderDatePickerField(field, "End Date")
                        }
                      />
                    ) : (
                      <div className="py-2 flex justify-between items-start gap-2">
                        <div className="w-[100%] justify-start flex">
                          <span className="font-pmedium text-gray-600 text-content">
                            End Date
                          </span>{" "}
                        </div>
                        <div className="">
                          <span>:</span>
                        </div>
                        <div className="w-full">
                          <span className="text-gray-500">
                            {humanDate(selectedClient?.termEnd || selectedClient?.endDate)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Lock-in Period */}
                  <div>
                    {isEditing ? (
                        <Controller
                          name="lockInPeriodMonths"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              size="small"
                              label="Lock-in Period"
                              value={`${calculatedLockInPeriodMonths} months`}
                              fullWidth
                              disabled
                            />
                          )}
                        />
                    ) : (
                      <div className="py-2 flex justify-between items-start gap-2">
                        <div className="w-[100%] justify-start flex">
                          <span className="font-pmedium text-gray-600 text-content">
                            Lock-in Period
                          </span>{" "}
                        </div>
                        <div className="">
                          <span>:</span>
                        </div>
                        <div className="w-full">
                          <span className="text-gray-500">
                            {calculatedLockInPeriodMonths} months
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rent Date */}
                  <div>
                    {isEditing ? (
                      <Controller
                        name="rentDate"
                        control={control}
                        render={({ field }) =>
                          renderDatePickerField(field, "Rent Date", true)
                        }
                      />
                    ) : (
                      <div className="py-2 flex justify-between items-start gap-2">
                        <div className="w-[100%] justify-start flex">
                          <span className="font-pmedium text-gray-600 text-content">
                            Rent Date
                          </span>{" "}
                        </div>
                        <div className="">
                          <span>:</span>
                        </div>
                        <div className="w-full">
                          <span className="text-gray-500">
                            {humanDate(currentMonthStartDate)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Next Increment */}
                  <div>
                    {isEditing ? (
                      <Controller
                        name="nextIncrementDate"
                        control={control}
                        render={({ field }) =>
                          renderDatePickerField(field, "Next Increment")
                        }
                      />
                    ) : (
                      <div className="py-2 flex justify-between items-start gap-2">
                        <div className="w-[100%] justify-start flex">
                          <span className="font-pmedium text-gray-600 text-content">
                            Next Increment
                          </span>{" "}
                        </div>
                        <div className="">
                          <span>:</span>
                        </div>
                        <div className="w-full">
                          <span className="text-gray-500">
                            {humanDate(selectedClient?.nextIncrementDate || selectedClient?.nextIncrement)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Agreement Expiry */}
                  <div>
                    {isEditing ? (
                      <TextField
                        value={calculatedAgreementExpiry}
                        size="small"
                        label="Agreement Expiry"
                        fullWidth
                        disabled
                      />
                    ) : (
                      <div className="py-2 flex justify-between items-start gap-2">
                        <div className="w-[100%] justify-start flex">
                          <span className="font-pmedium text-gray-600 text-content">
                            Agreement Expiry
                          </span>{" "}
                        </div>
                        <div className="">
                          <span>:</span>
                        </div>
                        <div className="w-full">
                          <span className="text-gray-500">
                            {calculatedAgreementExpiry}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    POC Details
                  </span>
                </div>

                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                  {[
                    "localPocName",
                    "localPocEmail",
                    "localPocPhone",
                    "hoPocName",
                    "hoPocEmail",
                    "hoPocPhone",
                  ].map((fieldKey) => (
                    <div key={fieldKey}>
                      {isEditing ? (
                        <Controller
                          name={fieldKey}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              size="small"
                              label={fieldKey
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                              fullWidth
                            />
                          )}
                        />
                      ) : (
                        <div className="py-2 flex justify-between items-start gap-2">
                          <div className="w-[100%] justify-start flex">
                            <span className="font-pmedium text-gray-600 text-content">
                              {fieldKey
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                            </span>{" "}
                          </div>
                          <div className="">
                            <span>:</span>
                          </div>
                          <div className="w-full">
                            <span className="text-gray-500">
                              {fieldKey === "localPocName"
                                ? selectedClient?.localPoc?.name
                                : fieldKey === "localPocEmail"
                                  ? selectedClient?.localPoc?.email
                                  : fieldKey === "localPocPhone"
                                    ? selectedClient?.localPoc?.phone
                                    : fieldKey === "hoPocName"
                                      ? selectedClient?.hoPoc?.name
                                      : fieldKey === "hoPocEmail"
                                        ? selectedClient?.hoPoc?.email
                                        : fieldKey === "hoPocPhone"
                                          ? selectedClient?.hoPoc?.phone
                                          : ""}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 py-4">
              {isEditing ? (
                <PrimaryButton
                  title={"Submit"}
                  handleSubmit={
                    isEditing ? handleSubmit(onSubmit) : handleEditToggle
                  }
                />
              ) : (
                ""
              )}
              {isEditing && (
                <SecondaryButton title={"Reset"} handleSubmit={handleReset} />
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VirtualOfficeClientDetails;
