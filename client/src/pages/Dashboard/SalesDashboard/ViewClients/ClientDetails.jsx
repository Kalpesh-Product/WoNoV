import { Autocomplete, MenuItem, TextField } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  DetailLayout,
  DetailRow,
  DetailSection,
} from "../../../../components/Forms/FormLayout";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { setSelectedClient } from "../../../../redux/slices/clientSlice";
import { setClientData } from "../../../../redux/slices/salesSlice";
import { useLocation, useParams } from "react-router-dom";
import SalesDashboardPageSkeleton from "../SalesDashboardPageSkeleton";
import {
  LuBuilding2,
  LuContactRound,
  LuFileText,
  LuPencil,
  LuRotateCcw,
  LuSend,
  LuUserRound,
  LuX,
} from "react-icons/lu";

const BOOKING_TYPE_OPTIONS = ["Direct", "SPV Booking"];
const SOURCING_MANAGER_DEPARTMENT_IDS = new Set([
  "67b2cf85b9b6ed5cedeb9a2e",
  "6798ba9de469e809084e2494",
]);
const normalizeBookingType = (bookingType) =>
  String(bookingType || "")
    .trim()
    .toLowerCase() === "spv booking"
    ? "SPV Booking"
    : "Direct";
const calculateLockinPeriod = (startDate, endDate, fallback = 0) => {
  if (!startDate || !endDate) {
    return fallback;
  }

  const start = dayjs(startDate);
  const end = dayjs(endDate);

  if (!start.isValid() || !end.isValid() || !end.isAfter(start)) {
    return fallback;
  }

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

const calculateCurrentRate = (
  cabinRate,
  openRate,
  annualIncrement,
  startDate,
  referenceDate = dayjs(),
) => {
  const base =
    [cabinRate, openRate]
      .map((rate) => Number(rate))
      .find((rate) => Number.isFinite(rate) && rate > 0) || 0;
  const increment = Number(annualIncrement) || 0;

  if (!base) {
    return 0;
  }

  const start = dayjs(startDate);
  if (!start.isValid()) {
    return base;
  }

  const yearsElapsed = Math.max(referenceDate.diff(start, "year"), 0);
  const rate = base * Math.pow(1 + increment / 100, yearsElapsed);

  return rate;
};

const formatExactNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  return String(value);
};

const useCurrentMonthStartDate = () => {
  const [currentMonthStartDate, setCurrentMonthStartDate] = useState(() =>
    dayjs().startOf("month").toISOString(),
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

const ClientDetails = () => {
  const dispatch = useDispatch();
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const queryClient = useQueryClient();
  const [sourcingInput, setSourcingInput] = useState("");
  const canCreateSourcingOption = useMemo(() => {
    const user = auth?.user;
    const normalize = (value) =>
      String(value || "")
        .trim()
        .toLowerCase();
    const departments = Array.isArray(user?.departments)
      ? user.departments
      : [];
    const roles = [
      ...(Array.isArray(user?.role) ? user.role : []),
      ...(Array.isArray(user?.roles) ? user.roles : []),
    ];
    return (
      departments.some((department) => {
        const name = normalize(
          department?.name || department?.departmentName || department,
        );
        const id = String(department?._id || department || "");
        return (
          SOURCING_MANAGER_DEPARTMENT_IDS.has(id) ||
          ["top management", "tech", "tech department"].includes(name)
        );
      }) ||
      roles.some((role) => {
        const title = normalize(role?.roleTitle || role?.name || role);
        return (
          title.includes("top management") || title.includes("tech department")
        );
      })
    );
  }, [auth?.user]);
  const { data: sourcingOptions = [] } = useQuery({
    queryKey: ["virtualOfficeSourcingOptions"],
    queryFn: async () => {
      const response = await axios.get(
        "/api/sales/virtual-office/sourcing-options",
      );
      return Array.isArray(response.data) ? response.data : [];
    },
  });
  const { mutate: saveSourcingOption } = useMutation({
    mutationFn: async (option) => {
      const response = await axios.post(
        "/api/sales/virtual-office/sourcing-options",
        { option },
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["virtualOfficeSourcingOptions"],
        data.options || [],
      );
      toast.success(data.message || "Sourcing added successfully");
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Failed to add sourcing"),
  });
  const location = useLocation();
  const { clientName } = useParams();
  const selectedClient = useSelector((state) => state.client.selectedClient);
  const clientsData = useSelector((state) => state.sales.clientsData);
  const normalizedClientName = useMemo(
    () =>
      decodeURIComponent(clientName || "")
        .trim()
        .toLowerCase(),
    [clientName],
  );
  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      clientName: "",
      serviceName: "",
      serviceDescription: "",
      sector: "",
      channel: "",
      currentStatus: "In Progress",
      hoCity: "",
      hoState: "",
      unitName: "",
      building: "",
      unit: "",
      unitNo: "",
      buildingName: "",
      buildingAddress: "",
      cabinDesks: 0,
      openDesks: 0,
      totalDesks: 0,
      bookingType: "Direct",
      billingFrequency: "Monthly",
      clientType: "",
      ratePerOpenDesk: 0,
      ratePerCabinDesk: 0,
      annualIncrement: 0,
      brokerage: 0,
      internalLead: "",
      perDeskMeetingCredits: 0,
      totalMeetingCredits: 0,
      startDate: "",
      endDate: "",
      lockinPeriod: 0,
      rentDate: "",
      nextIncrement: "",
      localPocName: "",
      localPocEmail: "",
      localPocPhone: "",
      hoPocName: "",
      hoPocEmail: "",
      hoPocPhone: "",
      isActive: false,
      createdAt: "",
      updatedAt: "",
    },
  });

  // useEffect(() => {
  //   if (selectedClient) {
  //     reset({
  //       clientName: selectedClient.clientName,
  //       serviceName: selectedClient.service?.serviceName || "",
  //       serviceDescription: selectedClient.service?.description || "",
  //       sector: selectedClient.sector,
  //       hoCity: selectedClient.hoCity,
  //       hoState: selectedClient.hoState,
  //       building: selectedClient.unit?.building?._id || "",
  //       unit: selectedClient.unit?._id || "",
  //       unitName: selectedClient.unit?.unitName || "",
  //       unitNo: selectedClient.unit?.unitNo || selectedClient.unitNo || "",
  //       buildingName: selectedClient.unit?.building?.buildingName || "",
  //       buildingAddress: selectedClient.unit?.building?.fullAddress || "",
  //       cabinDesks: selectedClient.cabinDesks,
  //       openDesks: selectedClient.openDesks,
  //       totalDesks: selectedClient.totalDesks,
  //       ratePerOpenDesk: selectedClient.ratePerOpenDesk,
  //       ratePerCabinDesk: selectedClient.ratePerCabinDesk,
  //       annualIncrement: selectedClient.annualIncrement,
  //       perDeskMeetingCredits: selectedClient.perDeskMeetingCredits,
  //       totalMeetingCredits: selectedClient.totalMeetingCredits,
  //       startDate: selectedClient.startDate,
  //       bookingType: selectedClient.bookingType,
  //       endDate: selectedClient.endDate,
  //       lockinPeriod: selectedClient.lockinPeriod,
  //       rentDate: selectedClient.rentDate,
  //       nextIncrement: selectedClient.nextIncrement,
  //       localPocName: selectedClient.localPocName || "",
  //       localPocEmail: selectedClient.localPocEmail || "",
  //       localPocPhone: selectedClient.localPocPhone || "",
  //       hoPocName: selectedClient.hoPocName || "",
  //       hoPocEmail: selectedClient.hoPocEmail || "",
  //       hoPocPhone: selectedClient.hoPocPhone || "",
  //       isActive: selectedClient.isActive,
  //       createdAt: selectedClient.createdAt,
  //       updatedAt: selectedClient.updatedAt,
  //     });
  //   }
  // }, [selectedClient, reset]);

  const { isLoading: isClientLoading } = useQuery({
    queryKey: ["coWorkingClientByName", normalizedClientName],
    enabled:
      Boolean(normalizedClientName) &&
      (selectedClient?.clientName || "").trim().toLowerCase() !==
        normalizedClientName,
    queryFn: async () => {
      const response = await axios.get("/api/sales/co-working-clients");
      const clients = Array.isArray(response?.data) ? response.data : [];
      const matchedClient = clients.find(
        (client) =>
          (client?.clientName || "").trim().toLowerCase() ===
          normalizedClientName,
      );

      if (matchedClient?._id) {
        dispatch(setSelectedClient(matchedClient));
      }

      return matchedClient;
    },
  });

  const [isEditing, setIsEditing] = useState(
    () => location.state?.editMode === true,
  );

  const selectedBuilding = useWatch({ control, name: "building" });
  const watchedCabinDesks = useWatch({ control, name: "cabinDesks" });
  const watchedOpenDesks = useWatch({ control, name: "openDesks" });
  const watchedStartDate = useWatch({ control, name: "startDate" });
  const watchedEndDate = useWatch({ control, name: "endDate" });
  const watchedAnnualIncrement = useWatch({ control, name: "annualIncrement" });
  const watchedCabinRate = useWatch({ control, name: "ratePerCabinDesk" });
  const watchedOpenRate = useWatch({ control, name: "ratePerOpenDesk" });
  const watchedBillingFrequency = useWatch({
    control,
    name: "billingFrequency",
  });
  const watchedLockinPeriod = useWatch({ control, name: "lockinPeriod" });
  const watchedClientType = useWatch({
    control,
    name: "clientType",
  });
  const isFlexyDeskClient = watchedClientType === "Flexy Desk Client";
  const computedNoOfDesks = useMemo(
    () => Number(watchedCabinDesks || 0) + Number(watchedOpenDesks || 0),
    [watchedCabinDesks, watchedOpenDesks],
  );
  const computedLockinPeriod = useMemo(
    () =>
      Number(
        watchedLockinPeriod ??
          selectedClient?.lockinPeriod ??
          selectedClient?.lockInPeriodMonths ??
          0,
      ),
    [
      selectedClient?.lockInPeriodMonths,
      selectedClient?.lockinPeriod,
      watchedLockinPeriod,
    ],
  );
  const computedTotalTerm = useMemo(
    () => calculateLockinPeriod(watchedStartDate, watchedEndDate, 0),
    [watchedStartDate, watchedEndDate],
  );
  const computedCurrentRate = useMemo(
    () =>
      calculateCurrentRate(
        watchedCabinRate,
        watchedOpenRate,
        watchedAnnualIncrement,
        watchedStartDate,
      ),
    [
      watchedAnnualIncrement,
      watchedCabinRate,
      watchedOpenRate,
      watchedStartDate,
    ],
  );
  const computedRevenue = useMemo(
    () =>
      computedNoOfDesks *
      computedCurrentRate *
      (watchedBillingFrequency === "Half-Yearly" ? 6 : 1),
    [computedCurrentRate, computedNoOfDesks, watchedBillingFrequency],
  );
  const computedRentDate = useCurrentMonthStartDate();
  const computedAgreementExpiry = useMemo(
    () => calculateAgreementExpiry(watchedStartDate, watchedEndDate),
    [watchedEndDate, watchedStartDate],
  );

  const { data: units = [], isLoading: isUnitsLoading } = useQuery({
    queryKey: ["units", "client-details"],
    queryFn: async () => {
      const response = await axios.get(
        "/api/company/fetch-units?deskCalculated=true",
      );
      return response.data;
    },
  });

  const availableBuildings = auth?.user?.company?.workLocations || [];
  const selectedUnitDetails = useMemo(() => {
    const selectedUnit = selectedClient?.unit;
    const selectedUnitId =
      typeof selectedUnit === "string" ? selectedUnit : selectedUnit?._id;

    if (!selectedUnitId) {
      const buildingId = selectedUnit?.building?._id || selectedUnit?.building;
      const unitNo = selectedUnit?.unitNo ?? selectedClient?.unitNo;
      const unitName = selectedUnit?.unitName || selectedClient?.unitName;
      const matches = buildingId
        ? units.filter((item) => {
            const itemBuildingId = item.building?._id || item.building;
            if (String(itemBuildingId) !== String(buildingId)) return false;
            if (unitNo !== undefined && unitNo !== null && unitNo !== "") {
              return String(item.unitNo) === String(unitNo);
            }
            return Boolean(unitName) && item.unitName === unitName;
          })
        : [];

      if (matches.length === 1) return matches[0];
      return typeof selectedUnit === "object" && selectedUnit
        ? selectedUnit
        : null;
    }

    return (
      units.find((item) => item._id === selectedUnitId) ||
      (typeof selectedUnit === "object" ? selectedUnit : null)
    );
  }, [
    selectedClient?.unit,
    selectedClient?.unitNo,
    selectedClient?.unitName,
    units,
  ]);

  useEffect(() => {
    if (selectedClient) {
      reset({
        clientName: selectedClient.clientName,
        serviceName: selectedClient.service?.serviceName || "",
        serviceDescription: selectedClient.service?.description || "",
        sector: selectedClient.sector,
        channel: selectedClient.channel || selectedClient.sourcing || "",
        currentStatus: selectedClient.currentStatus || "In Progress",
        hoCity: selectedClient.hoCity,
        hoState: selectedClient.hoState,
        building: selectedUnitDetails?.building?._id || "",
        unit:
          selectedUnitDetails?._id ||
          (typeof selectedClient.unit === "string"
            ? selectedClient.unit
            : "") ||
          "",
        unitName:
          selectedUnitDetails?.unitName || selectedClient.unitName || "",
        unitNo: selectedUnitDetails?.unitNo || selectedClient.unitNo || "",
        buildingName:
          selectedUnitDetails?.building?.buildingName ||
          selectedClient.buildingName ||
          "",
        buildingAddress:
          selectedUnitDetails?.building?.fullAddress ||
          selectedClient.buildingAddress ||
          "",
        cabinDesks: selectedClient.cabinDesks,
        openDesks: selectedClient.openDesks,
        totalDesks: selectedClient.totalDesks,
        ratePerOpenDesk: selectedClient.ratePerOpenDesk,
        ratePerCabinDesk: selectedClient.ratePerCabinDesk,
        annualIncrement: selectedClient.annualIncrement,
        brokerage: selectedClient.brokerage ?? 0,
        internalLead: selectedClient.internalLead || "",
        perDeskMeetingCredits: selectedClient.perDeskMeetingCredits,
        totalMeetingCredits: selectedClient.totalMeetingCredits,
        startDate: selectedClient.startDate,
        bookingType: normalizeBookingType(selectedClient.bookingType),
        billingFrequency: selectedClient.billingFrequency || "Monthly",
        clientType: selectedClient.clientType || "",
        endDate: selectedClient.endDate,
        lockinPeriod:
          selectedClient.lockinPeriod ?? selectedClient.lockInPeriodMonths ?? 0,
        rentDate: computedRentDate,
        nextIncrement: selectedClient.nextIncrement,
        localPocName: selectedClient.localPoc?.name || "",
        localPocEmail: selectedClient.localPoc?.email || "",
        localPocPhone: selectedClient.localPoc?.phone || "",
        hoPocName: selectedClient.hOPoc?.name || "",
        hoPocEmail: selectedClient.hOPoc?.email || "",
        hoPocPhone: selectedClient.hOPoc?.phone || "",
        isActive: selectedClient.isActive,
        createdAt: selectedClient.createdAt,
        updatedAt: selectedClient.updatedAt,
      });
      setSourcingInput(selectedClient.channel || selectedClient.sourcing || "");
    }
  }, [computedRentDate, reset, selectedClient, selectedUnitDetails]);
  const filteredUnits = useMemo(() => {
    if (!selectedBuilding) {
      return [];
    }

    const unitOptions = [...units];
    if (
      selectedUnitDetails?._id &&
      !unitOptions.some((item) => item._id === selectedUnitDetails._id)
    ) {
      unitOptions.push(selectedUnitDetails);
    }

    return unitOptions.filter(
      (item) => (item.building?._id || item.building) === selectedBuilding,
    );
  }, [selectedBuilding, selectedUnitDetails, units]);

  // const bookingTypeOptions = React.useMemo(() => {
  //   const options = new Set();

  //   clientsData?.forEach((client) => {
  //     if (client?.bookingType) {
  //       options.add(client.bookingType);
  //     }
  //   });

  //   if (selectedClient?.bookingType) {
  //     options.add(selectedClient.bookingType);
  //   }

  //   return [...options];
  // }, [clientsData, selectedClient?.bookingType]);

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
      channel: data.channel,
      currentStatus: data.currentStatus,
      hoCity: data.hoCity,
      hoState: data.hoState,
      isActive: data.isActive === true || data.isActive === "true",
      bookingType: data.bookingType,
      billingFrequency: data.billingFrequency,
      clientType: data.clientType,
      building: data.building,
      unit: data.unit,
      cabinDesks: Number(data.cabinDesks) || 0,
      openDesks: Number(data.openDesks) || 0,
      totalDesks:
        (Number(data.cabinDesks) || 0) + (Number(data.openDesks) || 0),
      ratePerCabinDesk: Number(data.ratePerCabinDesk) || 0,
      ratePerOpenDesk: Number(data.ratePerOpenDesk) || 0,
      annualIncrement: Number(data.annualIncrement) || 0,
      brokerage: Number(data.brokerage) || 0,
      internalLead: String(data.internalLead || "").trim(),
      perDeskMeetingCredits: Number(data.perDeskMeetingCredits) || 0,
      totalMeetingCredits: Number(data.totalMeetingCredits) || 0,
      startDate: data.startDate,
      endDate: data.endDate,
      lockinPeriod: Number(data.lockinPeriod) || 0,
      rentDate: computedRentDate,
      nextIncrement: data.nextIncrement,
      localPocName: data.localPocName,
      localPocEmail: data.localPocEmail,
      localPocPhone: data.localPocPhone,
      hOPocName: data.hoPocName,
      hOPocEmail: data.hoPocEmail,
      hOPocPhone: data.hoPocPhone,
    };

    try {
      const response = await axios.patch(
        `/api/sales/update-co-working-clients/${selectedClient._id}`,
        payload,
      );

      const updatedClient = {
        ...selectedClient,
        ...(response?.data?.client || payload),
      };

      dispatch(setSelectedClient(updatedClient));
      dispatch(
        setClientData(
          clientsData.map((item) =>
            item._id === selectedClient._id ? updatedClient : item,
          ),
        ),
      );
      await queryClient.invalidateQueries({
        queryKey: ["coworking-client-history", selectedClient._id],
        refetchType: "all",
      });

      reset({
        ...data,
        totalDesks: payload.totalDesks,
      });
      setIsEditing(false);
      toast.success(
        response?.data?.message || "Client details updated successfully",
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to update client details",
      );
    }
  };

  const handleReset = () => {
    if (selectedClient) {
      reset({
        clientName: selectedClient.clientName,
        serviceName: selectedClient.service?.serviceName || "",
        serviceDescription: selectedClient.service?.description || "",
        sector: selectedClient.sector,
        hoCity: selectedClient.hoCity,
        hoState: selectedClient.hoState,
        building: selectedUnitDetails?.building?._id || "",
        unit:
          selectedUnitDetails?._id ||
          (typeof selectedClient.unit === "string"
            ? selectedClient.unit
            : "") ||
          "",
        unitName:
          selectedUnitDetails?.unitName || selectedClient.unitName || "",
        unitNo: selectedUnitDetails?.unitNo || selectedClient.unitNo || "",
        buildingName:
          selectedUnitDetails?.building?.buildingName ||
          selectedClient.buildingName ||
          "",
        buildingAddress:
          selectedUnitDetails?.building?.fullAddress ||
          selectedClient.buildingAddress ||
          "",
        cabinDesks: selectedClient.cabinDesks,
        openDesks: selectedClient.openDesks,
        totalDesks: selectedClient.totalDesks,
        ratePerOpenDesk: selectedClient.ratePerOpenDesk,
        ratePerCabinDesk: selectedClient.ratePerCabinDesk,
        annualIncrement: selectedClient.annualIncrement,
        brokerage: selectedClient.brokerage ?? 0,
        internalLead: selectedClient.internalLead || "",
        perDeskMeetingCredits: selectedClient.perDeskMeetingCredits,
        totalMeetingCredits: selectedClient.totalMeetingCredits,
        startDate: selectedClient.startDate,
        bookingType: normalizeBookingType(selectedClient.bookingType),
        billingFrequency: selectedClient.billingFrequency || "Monthly",
        clientType: selectedClient.clientType || "",
        endDate: selectedClient.endDate,
        lockinPeriod:
          selectedClient.lockinPeriod ?? selectedClient.lockInPeriodMonths ?? 0,
        rentDate: computedRentDate,
        nextIncrement: selectedClient.nextIncrement,
        localPocName: selectedClient.localPoc?.name || "",
        localPocEmail: selectedClient.localPoc?.email || "",
        localPocPhone: selectedClient.localPoc?.phone || "",
        hoPocName: selectedClient.hOPoc?.name || "",
        hoPocEmail: selectedClient.hOPoc?.email || "",
        hoPocPhone: selectedClient.hOPoc?.phone || "",
        isActive: selectedClient.isActive,
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

  const detailValue = (value) =>
    value === null || value === undefined || value === "" ? "—" : value;

  const pocFields = [
    { name: "localPocName", label: "Local POC Name" },
    { name: "localPocEmail", label: "Local POC Email" },
    { name: "localPocPhone", label: "Local POC Phone" },
    { name: "hoPocName", label: "HO POC Name" },
    { name: "hoPocEmail", label: "HO POC Email" },
    { name: "hoPocPhone", label: "HO POC Phone" },
  ];

  const customerDetailRows = [
    { label: "Client Name", value: control._defaultValues.clientName },
    { label: "Sector", value: control._defaultValues.sector },
    { label: "HO City", value: control._defaultValues.hoCity },
    { label: "HO State", value: control._defaultValues.hoState },
    { label: "Booking Type", value: control._defaultValues.bookingType },
    { label: "Revenue", value: formatExactNumber(computedRevenue) },
    { label: "Sourcing", value: control._defaultValues.channel },
    {
      label: "Client Status",
      value: control._defaultValues.currentStatus || "In Progress",
    },
  ];

  const companyDetailRows = [
    { label: "Building Name", value: control._defaultValues.buildingName },
    { label: "Unit No", value: control._defaultValues.unitNo },
    {
      label: "Billing Frequency",
      value: control._defaultValues.billingFrequency,
    },
    { label: "Client Type", value: control._defaultValues.clientType },
    { label: "Cabin Desks", value: control._defaultValues.cabinDesks },
    {
      label: "Cabin Desk Rate",
      value: control._defaultValues.ratePerCabinDesk,
    },
    { label: "Open Desks", value: control._defaultValues.openDesks },
    { label: "Open Desk Rate", value: control._defaultValues.ratePerOpenDesk },
    { label: "No of Desk", value: computedNoOfDesks },
    { label: "Invoice Rate", value: formatExactNumber(computedCurrentRate) },
    { label: "Brokerage", value: control._defaultValues.brokerage },
    { label: "Internal Lead", value: control._defaultValues.internalLead },
    {
      label: "Company Status",
      value: control._defaultValues.isActive ? "Active" : "Inactive",
    },
  ];

  const agreementDetailRows = [
    {
      label: "Annual Increment",
      value: `${control._defaultValues.annualIncrement || 0}%`,
    },
    {
      label: "Per Desk Meeting Credits",
      value: control._defaultValues.perDeskMeetingCredits,
    },
    {
      label: "Total Meeting Credits",
      value: control._defaultValues.totalMeetingCredits,
    },
    { label: "Lock-in Period", value: `${computedLockinPeriod} months` },
    {
      label: "Start Date",
      value: humanDate(control._defaultValues.startDate),
    },
    { label: "End Date", value: humanDate(control._defaultValues.endDate) },
    { label: "Rent Date", value: humanDate(computedRentDate) },
    {
      label: "Next Increment",
      value: humanDate(control._defaultValues.nextIncrement),
    },
    { label: "Total Term", value: `${computedTotalTerm} months` },
    { label: "Agreement Expiry", value: computedAgreementExpiry },
  ];

  const pocDetailRows = pocFields.map(({ name, label }) => ({
    label,
    value: control._defaultValues[name],
  }));

  if (isClientLoading) {
    return <SalesDashboardPageSkeleton tableTitle="Client Details" />;
  }

  return (
    <DetailLayout
      title="Client Details"
      icon={LuUserRound}
      actions={
        <PrimaryButton
          handleSubmit={handleEditToggle}
          title={isEditing ? "Cancel" : "Edit"}
          icon={isEditing ? LuX : LuPencil}
          disabled={!selectedClient?._id || isClientLoading}
        />
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="shared-form">
        <div className="shared-form-section-grid">
          {/* Section: Customer Details */}
          <DetailSection title="Customer Details" icon={LuUserRound}>
            {isEditing ? (
              <div className="shared-form-card-body shared-form-card-body--two-columns">
                {[
                  "clientName",
                  "sector",
                  "hoCity",
                  "hoState",
                  "bookingType",
                  "revenue",
                  "channel",
                  "currentStatus",
                ].map((fieldKey) => (
                  <Controller
                    key={fieldKey}
                    name={fieldKey}
                    control={control}
                    render={({ field }) =>
                      fieldKey === "bookingType" ? (
                        <TextField
                          {...field}
                          select
                          size="small"
                          label="Booking Type"
                          fullWidth
                        >
                          {BOOKING_TYPE_OPTIONS.map((bookingType) => (
                            <MenuItem key={bookingType} value={bookingType}>
                              {bookingType}
                            </MenuItem>
                          ))}
                        </TextField>
                      ) : fieldKey === "revenue" ? (
                        <TextField
                          {...field}
                          value={formatExactNumber(computedRevenue)}
                          disabled
                          size="small"
                          label="Revenue"
                          fullWidth
                        />
                      ) : fieldKey === "channel" ? (
                        <Autocomplete
                          freeSolo={canCreateSourcingOption}
                          selectOnFocus
                          clearOnBlur={false}
                          handleHomeEndKeys
                          options={sourcingOptions}
                          value={field.value || null}
                          inputValue={sourcingInput}
                          onInputChange={(_event, value, reason) => {
                            if (reason !== "reset") setSourcingInput(value);
                          }}
                          onChange={(_event, value) => {
                            const selected = String(
                              typeof value === "object"
                                ? value.inputValue
                                : value || "",
                            ).trim();
                            field.onChange(selected);
                            setSourcingInput(selected);
                            if (
                              canCreateSourcingOption &&
                              selected &&
                              !sourcingOptions.some(
                                (option) =>
                                  option.toLowerCase() ===
                                  selected.toLowerCase(),
                              )
                            ) {
                              saveSourcingOption(selected);
                            }
                          }}
                          filterOptions={(options, params) => {
                            const typedValue = params.inputValue.trim();
                            const filteredOptions = options.filter((option) =>
                              option
                                .toLowerCase()
                                .includes(typedValue.toLowerCase()),
                            );
                            const alreadyExists = options.some(
                              (option) =>
                                option.toLowerCase() ===
                                typedValue.toLowerCase(),
                            );
                            if (
                              canCreateSourcingOption &&
                              typedValue &&
                              !alreadyExists
                            ) {
                              filteredOptions.push({
                                inputValue: typedValue,
                                label: `+ Add "${typedValue}"`,
                              });
                            }
                            return filteredOptions;
                          }}
                          getOptionLabel={(option) =>
                            typeof option === "string"
                              ? option
                              : option.label || ""
                          }
                          renderOption={(props, option) => (
                            <li {...props} key={option.inputValue || option}>
                              {typeof option === "string"
                                ? option
                                : option.label}
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              label="Sourcing"
                              placeholder={
                                canCreateSourcingOption
                                  ? "Select or Add Source"
                                  : "Select Source"
                              }
                              fullWidth
                            />
                          )}
                        />
                      ) : fieldKey === "currentStatus" ? (
                        <TextField
                          {...field}
                          select
                          size="small"
                          label="Current Status"
                          fullWidth
                        >
                          {["In Progress", "Yet to start", "On Hold"].map(
                            (option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ),
                          )}
                        </TextField>
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
              </div>
            ) : (
              <div className="shared-detail-rows">
                {customerDetailRows.map((row) => (
                  <DetailRow
                    key={row.label}
                    label={row.label}
                    value={detailValue(row.value)}
                  />
                ))}
              </div>
            )}
          </DetailSection>

          {/* Section: Company Details */}
          <DetailSection title="Company Details" icon={LuBuilding2}>
            {isEditing ? (
              <div className="shared-form-card-body shared-form-card-body--two-columns">
                <Controller
                  name="building"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      onChange={(event) => {
                        if (event.target.value !== field.value) {
                          setValue("unit", "");
                        }
                        field.onChange(event);
                      }}
                      select
                      size="small"
                      label="Building"
                      fullWidth
                    >
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
                    <TextField
                      {...field}
                      select
                      size="small"
                      label="Unit"
                      fullWidth
                    >
                      <MenuItem value="">Select a Unit</MenuItem>
                      {filteredUnits.length > 0 ? (
                        filteredUnits.map((item) => (
                          <MenuItem key={item._id} value={item._id}>
                            {item.unitNo}
                          </MenuItem>
                        ))
                      ) : isUnitsLoading ? (
                        <MenuItem disabled>Loading units...</MenuItem>
                      ) : (
                        <MenuItem disabled>
                          {selectedBuilding
                            ? "No units available"
                            : "Select a building first"}
                        </MenuItem>
                      )}
                    </TextField>
                  )}
                />
                {[
                  ["billingFrequency", "clientType"],
                  ["cabinDesks", "ratePerCabinDesk", "openDesks", "ratePerOpenDesk"],
                  ["noOfDesks", "currentRate", "brokerage"],
                  ["internalLead", "isActive"],
                ].map((fieldGroup) => (
                  <div
                    key={fieldGroup.join("-")}
                    className={`shared-form-inline-fields shared-form-inline-fields--${
                      fieldGroup.length === 4
                        ? "four"
                        : fieldGroup.length === 3
                          ? "three"
                          : "two"
                    }`}
                  >
                    {fieldGroup.map((fieldKey) => (
                      <Controller
                        key={fieldKey}
                        name={fieldKey}
                        control={control}
                        rules={
                          fieldKey === "billingFrequency"
                            ? { required: "Billing Frequency is required" }
                            : fieldKey === "clientType"
                              ? { required: "Client Type is required" }
                              : fieldKey === "brokerage"
                                ? {
                                    min: {
                                      value: 0,
                                      message: "Brokerage cannot be negative",
                                    },
                                  }
                                : undefined
                        }
                        render={({ field, fieldState }) =>
                          fieldKey === "billingFrequency" ||
                          fieldKey === "clientType" ? (
                            <TextField
                              {...field}
                              select
                              size="small"
                              label={
                                fieldKey === "billingFrequency"
                                  ? "Billing Frequency"
                                  : "Client Type"
                              }
                              error={!!fieldState.error}
                              helperText={fieldState.error?.message}
                              fullWidth
                            >
                              {fieldKey === "clientType" && (
                                <MenuItem value="">Select Client Type</MenuItem>
                              )}
                              {(fieldKey === "billingFrequency"
                                ? ["Monthly", "Half-Yearly", "Yearly"]
                                : ["Flexy Desk Client", "Annual Client"]
                              ).map((option) => (
                                <MenuItem key={option} value={option}>
                                  {option}
                                </MenuItem>
                              ))}
                            </TextField>
                          ) : fieldKey === "isActive" ? (
                            <TextField
                              {...field}
                              select
                              size="small"
                              label="Company Status"
                              fullWidth
                            >
                              <MenuItem value={true}>Active</MenuItem>
                              <MenuItem value={false}>Inactive</MenuItem>
                            </TextField>
                          ) : fieldKey === "noOfDesks" ? (
                            <TextField
                              {...field}
                              value={computedNoOfDesks}
                              disabled
                              size="small"
                              label="No of Desk"
                              fullWidth
                            />
                          ) : fieldKey === "currentRate" ? (
                            <TextField
                              {...field}
                              value={formatExactNumber(computedCurrentRate)}
                              disabled
                              size="small"
                              label="Invoice Rate"
                              fullWidth
                            />
                          ) : (
                            <TextField
                              {...field}
                              size="small"
                              type={
                                fieldKey === "brokerage" ? "number" : undefined
                              }
                              inputProps={
                                fieldKey === "brokerage"
                                  ? { min: 0 }
                                  : undefined
                              }
                              label={fieldKey
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                              fullWidth
                            />
                          )
                        }
                      />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="shared-detail-rows">
                {companyDetailRows.map((row) => (
                  <DetailRow
                    key={row.label}
                    label={row.label}
                    value={detailValue(row.value)}
                  />
                ))}
              </div>
            )}
          </DetailSection>

          {/* Section: Agreement Details */}
          <DetailSection title="Agreement Details" icon={LuFileText}>
            {isEditing ? (
              <div className="shared-form-card-body shared-form-card-body--three-columns shared-form-card-body--full-width-last-child">
                <Controller
                  name="annualIncrement"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Annual Increment"
                      disabled={isFlexyDeskClient}
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="perDeskMeetingCredits"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Per Desk Meeting Credits"
                      disabled={isFlexyDeskClient}
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="totalMeetingCredits"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Total Meeting Credits"
                      disabled={isFlexyDeskClient}
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) =>
                    renderDatePickerField(field, "Start Date")
                  }
                />
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) =>
                    renderDatePickerField(field, "End Date")
                  }
                />
                <Controller
                  name="rentDate"
                  control={control}
                  render={({ field }) =>
                    renderDatePickerField(
                      { ...field, value: computedRentDate },
                      "Rent Date",
                      true,
                    )
                  }
                />
                <Controller
                  name="lockinPeriod"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={`${computedLockinPeriod} months`}
                      size="small"
                      label="Lock-in Period (Months)"
                      fullWidth
                      disabled
                    />
                  )}
                />
                <TextField
                  value={`${computedTotalTerm} months`}
                  size="small"
                  label="Total Term"
                  fullWidth
                  disabled
                />
                <Controller
                  name="nextIncrement"
                  control={control}
                  render={({ field }) =>
                    renderDatePickerField(field, "Next Increment")
                  }
                />
                <TextField
                  value={computedAgreementExpiry}
                  size="small"
                  label="Agreement Expiry"
                  fullWidth
                  disabled
                />
              </div>
            ) : (
              <div className="shared-detail-rows">
                {agreementDetailRows.map((row) => (
                  <DetailRow
                    key={row.label}
                    label={row.label}
                    value={detailValue(row.value)}
                  />
                ))}
              </div>
            )}
          </DetailSection>

          {/* Section: POC Details */}
          <DetailSection title="POC Details" icon={LuContactRound}>
            {isEditing ? (
              <div className="shared-form-card-body shared-form-card-body--two-columns">
                {pocFields.map(({ name, label }) => (
                  <Controller
                    key={name}
                    name={name}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label={label}
                        fullWidth
                      />
                    )}
                  />
                ))}
              </div>
            ) : (
              <div className="shared-detail-rows">
                {pocDetailRows.map((row) => (
                  <DetailRow
                    key={row.label}
                    label={row.label}
                    value={detailValue(row.value)}
                  />
                ))}
              </div>
            )}
          </DetailSection>
        </div>

        {isEditing ? (
          <div className="shared-form-actions shared-form-actions--end">
            <SecondaryButton
              title="Reset"
              icon={LuRotateCcw}
              handleSubmit={handleReset}
            />
            <div className="shared-form-primary-actions">
              <PrimaryButton
                title="Submit"
                icon={LuSend}
                handleSubmit={handleSubmit(onSubmit)}
              />
            </div>
          </div>
        ) : null}
      </form>
    </DetailLayout>
  );
};

export default ClientDetails;
