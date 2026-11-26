import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SalesDashboardPageSkeleton from "./SalesDashboardPageSkeleton";
import AgTable from "../../../components/AgTable";
import { Chip, CircularProgress } from "@mui/material";
import BarGraph from "../../../components/graphs/BarGraph";
import UniqueClients from "./ViewClients/LeadsLayout";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { toast } from "sonner";

import { useDispatch, useSelector } from "react-redux";
import { setClientData } from "../../../redux/slices/salesSlice";
import WidgetSection from "../../../components/WidgetSection";
import PageFrame from "../../../components/Pages/PageFrame";
import TabLayout from "../../../components/Tabs/TabLayout";
import DataCard from "../../../components/DataCard";
import { PERMISSIONS } from "../../../constants/permissions";
import useUserPermissions from "../../../hooks/useUserPermissions";
import { fetchExternalMeetingClients } from "../../../utils/isMeetingVisit";
import {
  MdOutlineBusinessCenter,
  MdOutlineChair,
  MdOutlineCorporateFare,
  MdOutlineGroups,
  MdOutlineConfirmationNumber,
  MdOutlineFlightTakeoff,
  MdOutlineAltRoute,
} from "react-icons/md";

const CLIENT_CARD_ACCENT_COLOR = "#1E3D73";

const getCoworkingClientType = (client) => {
  const clientType = String(client?.clientType || "")
    .trim()
    .toLowerCase();

  if (clientType) return clientType;

  return String(client?.billingFrequency || "").trim().toLowerCase() === "monthly"
    ? "flexy desk client"
    : "annual client";
};

const isFlexibleDeskClient = (client) => {
  const clientType = getCoworkingClientType(client);

  return [
    "flexy desk client",
    "flexi desk client",
    "flexible desk client",
  ].includes(clientType);
};

const isAnnualClient = (client) =>
  getCoworkingClientType(client) === "annual client";

const ViewClients = () => {
  const clientsData = useSelector((state) => state.sales.clientsData);
  const dispatch = useDispatch();
  const axios = useAxiosPrivate();
  const { hasPermission } = useUserPermissions();
  useEffect(() => {
    const fetchSourceIfEmpty = async () => {
      if (clientsData.length === 0) {
        try {
          const response = await axios.get("/api/sales/co-working-clients");
          dispatch(setClientData(response.data));
        } catch (error) {
          console.error("Failed to fetch leads", error);
        }
      }
    };

    fetchSourceIfEmpty();
  }, [clientsData, dispatch]);

  const { data = [], isPending: clientsPending } = useQuery({
    queryKey: ["clientDetails"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/sales/consolidated-clients");
        return response.data;
      } catch (error) {
        console.error(error.response.data.message);
      }
    },
  });

  const { data: coWorkingClients = [], isPending: coworkingPending } = useQuery({
    queryKey: ["view-clients-co-working"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/co-working-clients");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const { data: workationClients = [], isPending: workationPending } = useQuery({
    queryKey: ["view-clients-workation"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/get-workation-clients");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const { data: alternateClients = [], isPending: alternatePending } = useQuery({
    queryKey: ["view-clients-alternate"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/get-alternate-clients");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const {
    data: externalMeetingClients = [],
    isPending: externalMeetingsPending,
  } = useQuery({
    queryKey: ["external-meeting-clients", "existing-apis-v5"],
    queryFn: () => fetchExternalMeetingClients(axios),
  });

  const unifiedClients = useMemo(() => {
    if (!data || typeof data !== "object") return [];

    return Object.entries(data).flatMap(([key, clients]) => {
      const clientType = key.replace(/Clients$/, ""); // e.g., "coworkingClients" → "coworking"
      return clients.map((client) => ({
        ...client,
        sourceClientType: client.clientType,
        clientType, // dynamically tagged
      }));
    });
  }, [data]);

  console.log("data ", unifiedClients);

  const isOpenDeskVisitor = (visitor) => {
    const purpose = (visitor?.purposeOfVisit || "").trim().toLowerCase();
    const isDayPass =
      purpose.includes("day pass") || purpose.includes("day-pass");

    return isDayPass || Boolean(visitor?.convertedFromInternal);
  };

  const externalVisitors = useMemo(
    () =>
      unifiedClients.filter(
        (client) => (client.visitorFlag || "").trim().toLowerCase() === "client"
      ),
    [unifiedClients]
  );

  const annualClients = useMemo(
    () => coWorkingClients.filter(isAnnualClient),
    [coWorkingClients],
  );

  const coWorkingStatusSummary = useMemo(() => {
    const active = annualClients.filter((client) => client?.isActive).length;
    return {
      active,
      inactive: Math.max(0, annualClients.length - active),
    };
  }, [annualClients]);

  const flexibleDeskClients = useMemo(
    () => coWorkingClients.filter(isFlexibleDeskClient),
    [coWorkingClients],
  );

  const flexibleDeskStatusSummary = useMemo(() => {
    const active = flexibleDeskClients.filter((client) => client?.isActive).length;
    return {
      active,
      inactive: Math.max(0, flexibleDeskClients.length - active),
    };
  }, [flexibleDeskClients]);

  const virtualOfficeClients = Array.isArray(data?.virtualOfficeClients)
    ? data.virtualOfficeClients
    : [];

  const virtualOfficeStatusSummary = useMemo(() => {
    const active = virtualOfficeClients.filter((client) =>
      typeof client?.isActive === "boolean"
        ? client.isActive
        : Boolean(client?.clientStatus)
    ).length;

    return {
      active,
      inactive: Math.max(0, virtualOfficeClients.length - active),
    };
  }, [virtualOfficeClients]);

  const externalMeetingStatusSummary = useMemo(() => {
    const paid = externalMeetingClients.filter(
      (client) => client?.paymentStatus === true,
    ).length;

    return {
      active: paid,
      inactive: Math.max(0, externalMeetingClients.length - paid),
    };
  }, [externalMeetingClients]);

  const openDeskVisitors = useMemo(
    () => externalVisitors.filter((visitor) => isOpenDeskVisitor(visitor)),
    [externalVisitors]
  );

  const openDeskStatusSummary = useMemo(() => {
    const paid = openDeskVisitors.filter(
      (visitor) => visitor?.paymentStatus === true
    ).length;
    return {
      active: paid,
      inactive: Math.max(0, openDeskVisitors.length - paid),
    };
  }, [openDeskVisitors]);

  const workationStatusSummary = useMemo(() => {
    const active = workationClients.filter(
      (client) => client?.isActive !== false,
    ).length;
    return {
      active,
      inactive: Math.max(0, workationClients.length - active),
    };
  }, [workationClients]);

  const alternateStatusSummary = useMemo(() => {
    const active = alternateClients.filter(
      (client) => client?.isActive !== false,
    ).length;
    return {
      active,
      inactive: Math.max(0, alternateClients.length - active),
    };
  }, [alternateClients]);

  const clientCounts = {
    coWorking: annualClients.length,
    flexibleDesk: flexibleDeskClients.length,
    virtualOfficeClients: virtualOfficeClients.length,
    externalMeetings: externalMeetingClients.length,
    openDesk: openDeskVisitors.length,
    workation: workationClients.length,
    alternate: alternateClients.length,
  };

  const verticalsData = [
    {
      id: 1,
      name: "Co-Working",
      value: clientCounts.coWorking,
      statusSummary: coWorkingStatusSummary,
      route: "/app/dashboard/sales-dashboard/mix-bag/clients/co-working",
      accentColor: CLIENT_CARD_ACCENT_COLOR,
      icon: <MdOutlineBusinessCenter size={17} />,
    },
    {
      id: 2,
      name: "Flexible Desk",
      value: clientCounts.flexibleDesk,
      statusSummary: flexibleDeskStatusSummary,
      route: "/app/dashboard/sales-dashboard/mix-bag/clients/flexible-desk",
      permission: PERMISSIONS.SALES_FLEXIBLE_DESK_CLIENTS.value,
      accentColor: CLIENT_CARD_ACCENT_COLOR,
      icon: <MdOutlineChair size={18} />,
    },
    {
      id: 3,
      name: "Virtual-Office",
      value: clientCounts.virtualOfficeClients,
      statusSummary: virtualOfficeStatusSummary,
      route: "/app/dashboard/sales-dashboard/mix-bag/clients/virtual-office",
      accentColor: CLIENT_CARD_ACCENT_COLOR,
      icon: <MdOutlineCorporateFare size={18} />,
    },
    // {
    //   id: 3,
    //   name: "External Client",
    //   value: clientCounts.externalClients,
    //   route: "/app/dashboard/sales-dashboard/mix-bag/external-client",
    // },
    {
      id: 4,
      name: "External Meetings",
      value: clientCounts.externalMeetings,
      statusSummary: externalMeetingStatusSummary,
      statusLabels: { active: "Paid", inactive: "Unpaid" },
      route: "/app/dashboard/sales-dashboard/mix-bag/clients/external-meeting",
      accentColor: CLIENT_CARD_ACCENT_COLOR,
      icon: <MdOutlineGroups size={18} />,
      // permission: PERMISSIONS.SALES_EXTERNAL_CLIENT_MEETINGS_COMPANIES.value,
    },
    {
      id: 5,
      name: "Day Pass Client",
      value: clientCounts.openDesk,
      statusSummary: openDeskStatusSummary,
      statusLabels: { active: "Paid", inactive: "Unpaid" },
      route: "/app/dashboard/sales-dashboard/mix-bag/clients/day-pass",
      accentColor: CLIENT_CARD_ACCENT_COLOR,
      icon: <MdOutlineConfirmationNumber size={18} />,
      // permission: PERMISSIONS.SALES_EXTERNAL_CLIENT_OPEN_DESK_COMPANIES.value,
    },
    {
      id: 6,
      name: "Workation",
      value: clientCounts.workation,
      statusSummary: workationStatusSummary,
      route: "/app/dashboard/sales-dashboard/mix-bag/clients/workation",
      permission: PERMISSIONS.SALES_WORKATION_CLIENTS.value,
      accentColor: CLIENT_CARD_ACCENT_COLOR,
      icon: <MdOutlineFlightTakeoff size={18} />,
    },
    {
      id: 7,
      name: "Alternate",
      value: clientCounts.alternate,
      statusSummary: alternateStatusSummary,
      route: "/app/dashboard/sales-dashboard/mix-bag/clients/alternate",
      permission: PERMISSIONS.SALES_ALTERNATE_CLIENTS.value,
      accentColor: CLIENT_CARD_ACCENT_COLOR,
      icon: <MdOutlineAltRoute size={18} />,
    },
  ].filter(
    (card) => !card.permission || hasPermission(card.permission),
  );

  const transformClientsGroupedByMonth = (clientsArray) => {
    const grouped = {};

    // helper to title-case each word
    const toTitleCase = (str) =>
      str
        .toLowerCase()
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("-");

    const serviceMapping = {
      coworking: "Coworking",
      flexibleDesk: "Flexible Desk",
      virtualOffice: "Virtualoffice",
      externalMeeting: "External Meetings",
      openDesk: "Day Pass",
      workation: "Workation",
      alternate: "Alternate",
      coliving: "Co-Living",
    };

    clientsArray.forEach((client) => {
      let rawServiceName = client.clientType || "Unknown";

      // Dynamically detect type from serviceName if it's under coworkingClients
      if (rawServiceName === "meeting") {
        const purpose = (client.purposeOfVisit || "").trim().toLowerCase();
        if (purpose === "meeting room booking") {
          rawServiceName = "externalMeeting";
        } else if (purpose === "half-day pass" || purpose === "full-day pass") {
          rawServiceName = "openDesk";
        }
      }

      if (rawServiceName === "coworking" && client.service?.serviceName) {
        const sName = client.service.serviceName.toLowerCase();
        if (sName.includes("workation")) {
          rawServiceName = "workation";
        } else if (sName.includes("living") || sName.includes("coliving")) {
          rawServiceName = "coliving";
        } else if (
          isFlexibleDeskClient({
            clientType: client.sourceClientType,
            billingFrequency: client.billingFrequency,
          })
        ) {
          rawServiceName = "flexibleDesk";
        }
      } else if (
        rawServiceName === "coworking" &&
        isFlexibleDeskClient({
          clientType: client.sourceClientType,
          billingFrequency: client.billingFrequency,
        })
      ) {
        rawServiceName = "flexibleDesk";
      }

      const formattedServiceName =
        serviceMapping[rawServiceName] || toTitleCase(rawServiceName);

      let date = null;
      if (["coworking", "flexibleDesk"].includes(rawServiceName)) {
        date = client.startDate ? new Date(client.startDate) : null;
      } else if (rawServiceName === "virtualOffice") {
        date = client.termStartDate
          ? new Date(client.termStartDate)
          : client.rentDate
            ? new Date(client.rentDate)
            : null;
      } else if (
        rawServiceName === "externalMeeting" ||
        rawServiceName === "openDesk"
      ) {
        date = client.dateOfVisit
          ? new Date(client.dateOfVisit)
          : client.scheduledDate
            ? new Date(client.scheduledDate)
            : null;
      } else {
        date = client.startDate || client.dateOfVisit || client.termStartDate
          ? new Date(client.startDate || client.dateOfVisit || client.termStartDate)
          : null;
      }

      const formattedDate = date && !isNaN(date.getTime()) ? date.toISOString().split("T")[0] : "N/A";
      const month = date && !isNaN(date.getTime())
        ? date.toLocaleString("default", { month: "long" })
        : "Unknown";

      const clientName =
        client.clientName ||
        (client.firstName
          ? `${client.firstName} ${client.lastName || ""}`
          : "Unknown");

      const transformedClient = {
        client: clientName,
        typeOfClient: formattedServiceName,
        date: formattedDate,
      };

      if (!grouped[month]) {
        grouped[month] = [];
      }

      grouped[month].push(transformedClient);
    });

    return Object.entries(grouped).map(([month, clients]) => ({
      month,
      clients,
    }));
  };

  const chartClients = [
    ...unifiedClients,
    ...workationClients.map((client) => ({
      ...client,
      clientType: "workation",
    })),
    ...alternateClients.map((client) => ({
      ...client,
      clientType: "alternate",
    })),
  ];
  const transformedData = transformClientsGroupedByMonth(chartClients);
  console.log("transformed data ", transformedData);

  if (
    clientsPending ||
    coworkingPending ||
    workationPending ||
    alternatePending ||
    externalMeetingsPending
  ) {
    return <SalesDashboardPageSkeleton chartTitle="OVERALL CLIENTS" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <UniqueClients
          data={transformedData}
          hideAccordion
          additionalData={`CLIENTS : ${chartClients.length}`}
          includeFlexibleDeskSeries
          rankStacksByValue
          titleAmountChip
          titleAmount={({ count }) => `CLIENT : ${count}`}
        >
          <div className="border-b border-borderGray px-4 pb-4">
            <h2 className="text-mobileTitle lg:text-widgetTitle text-primary font-pmedium uppercase">
              Overall Clients
            </h2>
          </div>
          <div className="pt-4">
            <WidgetSection layout={Math.min(verticalsData.length, 3)}>
              {verticalsData.map((item) => (
                <DataCard
                  key={item.id}
                  data={item.value}
                  title={item.name}
                  statusSummary={item.statusSummary}
                  statusLabels={item.statusLabels}
                  route={item.route}
                  variant="client-summary"
                  accentColor={item.accentColor}
                  icon={item.icon}
                />
              ))}
            </WidgetSection>
          </div>
        </UniqueClients>
      </div>
    </div>
  );
};

export default ViewClients;
