import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import humanDate from "../../../utils/humanDateForamt";
import PrimaryButton from "../../../components/PrimaryButton";
import { useDispatch } from "react-redux";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { setSelectedClient } from "../../../redux/slices/clientSlice";
import { useParams } from "react-router-dom";

const calculateCurrentRate = (
  cabinRate,
  openRate,
  annualIncrement,
  startDate,
  referenceDate = dayjs(),
) => {
  const base = [cabinRate, openRate]
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

const AdminClientDetails = () => {
  const dispatch = useDispatch();
  const axios = useAxiosPrivate();
  const { clientName } = useParams();
  const selectedClient = useSelector((state) => state.client.selectedClient);
  const normalizedClientName = useMemo(
    () => decodeURIComponent(clientName || "").trim().toLowerCase(),
    [clientName],
  );
  const computedRentDate = useCurrentMonthStartDate();
  const computedLockinPeriod = useMemo(() => {
    const startDate = selectedClient?.startDate;
    const endDate = selectedClient?.endDate;

    if (!startDate || !endDate) {
      return selectedClient?.lockinPeriod || 0;
    }

    const start = dayjs(startDate);
    const end = dayjs(endDate);

    if (!start.isValid() || !end.isValid() || !end.isAfter(start)) {
      return selectedClient?.lockinPeriod || 0;
    }

    return end.diff(start, "month");
  }, [selectedClient?.endDate, selectedClient?.lockinPeriod, selectedClient?.startDate]);
  const computedCurrentRate = useMemo(
    () =>
      calculateCurrentRate(
        selectedClient?.ratePerCabinDesk,
        selectedClient?.ratePerOpenDesk,
        selectedClient?.annualIncrement,
        selectedClient?.startDate,
      ),
    [
      selectedClient?.annualIncrement,
      selectedClient?.ratePerCabinDesk,
      selectedClient?.ratePerOpenDesk,
      selectedClient?.startDate,
    ],
  );
  const computedRevenue = useMemo(
    () => {
      const noOfDesks =
        Number(selectedClient?.cabinDesks || 0) +
        Number(selectedClient?.openDesks || 0);

      return noOfDesks * computedCurrentRate;
    },
    [computedCurrentRate, selectedClient?.cabinDesks, selectedClient?.openDesks],
  );

  const { isLoading: isClientLoading } = useQuery({
    queryKey: ["adminCoWorkingClientByName", normalizedClientName],
    enabled:
      Boolean(normalizedClientName) &&
      (selectedClient?.clientName || "").trim().toLowerCase() !== normalizedClientName,
    queryFn: async () => {
      const response = await axios.get("/api/sales/co-working-clients");
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

  const { control, reset } = useForm({
    defaultValues: {
      clientName: "",
      serviceName: "",
      serviceDescription: "",
      sector: "",
      hoCity: "",
      hoState: "",
      unitName: "",
      unitNo: "",
      buildingName: "",
      buildingAddress: "",
      cabinDesks: 0,
      openDesks: 0,
      totalDesks: 0,
      bookingType: "",
      ratePerOpenDesk: 0,
      ratePerCabinDesk: 0,
      annualIncrement: 0,
      perDeskMeetingCredits: 0,
      totalMeetingCredits: 0,
      meetingCreditBalance: 0,
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

  useEffect(() => {
    if (selectedClient) {
      reset({
        clientName: selectedClient.clientName,
        serviceName: selectedClient.service?.serviceName || "",
        serviceDescription: selectedClient.service?.description || "",
        sector: selectedClient.sector,
        hoCity: selectedClient.hoCity,
        hoState: selectedClient.hoState,
        unitName: selectedClient.unit?.unitName || "",
        unitNo: selectedClient.unitNo || "",
        buildingName: selectedClient.unit?.building?.buildingName || "",
        buildingAddress: selectedClient.unit?.building?.fullAddress || "",
        cabinDesks: selectedClient.cabinDesks,
        openDesks: selectedClient.openDesks,
        totalDesks: selectedClient.totalDesks,
        ratePerOpenDesk: selectedClient.ratePerOpenDesk,
        ratePerCabinDesk: selectedClient.ratePerCabinDesk,
        annualIncrement: selectedClient.annualIncrement,
        perDeskMeetingCredits: selectedClient.perDeskMeetingCredits,
        totalMeetingCredits: selectedClient.totalMeetingCredits,
        meetingCreditBalance: selectedClient.meetingCreditBalance,
        bookingType: selectedClient.bookingType,
        startDate: selectedClient.startDate,
        endDate: selectedClient.endDate,
        lockinPeriod: computedLockinPeriod,
        rentDate: computedRentDate,
        nextIncrement: selectedClient.nextIncrement,
        localPocName: selectedClient.localPocName || "",
        localPocEmail: selectedClient.localPocEmail || "",
        localPocPhone: selectedClient.localPocPhone || "",
        hoPocName: selectedClient.hoPocName || "",
        hoPocEmail: selectedClient.hoPocEmail || "",
        hoPocPhone: selectedClient.hoPocPhone || "",
        isActive: selectedClient.isActive,
        createdAt: selectedClient.createdAt,
        updatedAt: selectedClient.updatedAt,
      });
    }
  }, [computedLockinPeriod, computedRentDate, selectedClient, reset]);

  if (isClientLoading && !selectedClient) {
    return (
      <div className="border-2 border-gray-200 p-4 rounded-md flex items-center justify-center min-h-[240px]">
        <div className="p-4 font-semibold">Loading client details...</div>
      </div>
    );
  }

  const displayField = (label, value, isDate = false) => (
    <div className="py-2 flex justify-between items-start gap-2">
      <div className="w-[100%] justify-start flex">
        <span className="font-pmedium text-gray-600 text-content">{label}</span>
      </div>
      <div className="">
        <span>:</span>
      </div>
      <div className="w-full">
        <span className="text-gray-500">
          {isDate ? humanDate(value) : value || "N/A"}
        </span>
      </div>
    </div>
  );

  const { _defaultValues } = control;

  return (
    <div className="border-2 border-gray-200 p-4 rounded-md flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <span className="text-subtitle font-pmedium text-primary">
          Client Details
        </span>
        <div>
          <PrimaryButton title={"Edit"} disabled={true} />
        </div>
      </div>

      <div className="h-[51vh] overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Details */}
          <div>
            <div className="py-4 border-b border-borderGray">
              <span className="text-subtitle font-pmedium">
                Customer Details
              </span>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {displayField("Client Name", _defaultValues.clientName)}
              {displayField("Sector", _defaultValues.sector)}
              {displayField("HO City", _defaultValues.hoCity)}
              {displayField("HO State", _defaultValues.hoState)}
              {displayField("Booking Type", _defaultValues.bookingType)}
              {displayField("Revenue", formatExactNumber(computedRevenue))}
            </div>
          </div>

          {/* Company Details */}
          <div>
            <div className="py-4 border-b border-borderGray">
              <span className="text-subtitle font-pmedium">
                Company Details
              </span>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {displayField("Unit No", _defaultValues.unitNo)}
              {displayField("Cabin Desks", _defaultValues.cabinDesks)}
              {displayField(
                "Rate Per Cabin Desk",
                _defaultValues.ratePerCabinDesk
              )}
              {displayField("Open Desks", _defaultValues.openDesks)}
              {displayField(
                "Rate Per Open Desk",
                _defaultValues.ratePerOpenDesk
              )}
              {displayField(
                "No of Desk",
                Number(_defaultValues.cabinDesks || 0) +
                  Number(_defaultValues.openDesks || 0)
              )}
              {displayField("Current Rate", formatExactNumber(computedCurrentRate))}
            </div>
          </div>

          {/* Agreement Details */}
          <div>
            <div className="py-4 border-b border-borderGray">
              <span className="text-subtitle font-pmedium">
                Agreement Details
              </span>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {displayField("Annual Increment", _defaultValues.annualIncrement)}
              {displayField(
                "Per Desk Meeting Credits",
                _defaultValues.perDeskMeetingCredits
              )}
              {displayField(
                "Total Meeting Credits",
                _defaultValues.totalMeetingCredits
              )}
              {displayField(
                "Meeting Credit Balance",
                _defaultValues.meetingCreditBalance
              )}
              {displayField("Start Date", _defaultValues.startDate, true)}
              {displayField("End Date", _defaultValues.endDate, true)}
              {displayField("Lock-in Period", computedLockinPeriod)}
              {displayField("Rent Date", computedRentDate, true)}
              {displayField(
                "Next Increment",
                _defaultValues.nextIncrement,
                true
              )}
            </div>
          </div>

          {/* POC Details */}
          <div>
            <div className="py-4 border-b border-borderGray">
              <span className="text-subtitle font-pmedium">POC Details</span>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {displayField("Local POC Name", _defaultValues.localPocName)}
              {displayField("Local POC Email", _defaultValues.localPocEmail)}
              {displayField("Local POC Phone", _defaultValues.localPocPhone)}
              {displayField("HO POC Name", _defaultValues.hoPocName)}
              {displayField("HO POC Email", _defaultValues.hoPocEmail)}
              {displayField("HO POC Phone", _defaultValues.hoPocPhone)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminClientDetails;
