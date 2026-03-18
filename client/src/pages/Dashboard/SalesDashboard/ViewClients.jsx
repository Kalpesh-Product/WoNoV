import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

const ViewClients = () => {
  const clientsData = useSelector((state) => state.sales.clientsData);
  const dispatch = useDispatch();
  const axios = useAxiosPrivate();
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

  const { data = [] } = useQuery({
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
  const unifiedClients = useMemo(() => {
    if (!data || typeof data !== "object") return [];

    return Object.entries(data).flatMap(([key, clients]) => {
      const clientType = key.replace(/Clients$/, ""); // e.g., "coworkingClients" → "coworking"
      return clients.map((client) => ({
        ...client,
        clientType, // dynamically tagged
      }));
    });
  }, [data]);


  const { data: meetings = [] } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const response = await axios.get("/api/meetings/get-meetings");
      return response.data;
    },
  });


  console.log("data ", unifiedClients);
  const clientCounts = {
    coWorking: data?.coworkingClients?.length,
    virtualOfficeClients: data?.virtualOfficeClients?.length,
    meetingClients: meetings.filter((meeting) => meeting.meetingType === "Internal").length,
  }

  const verticalsData = [
    {
      id: 1,
      name: "Co-Working",
      value: clientCounts.coWorking,
      route: "/app/dashboard/sales-dashboard/mix-bag/clients/co-working",
    },
    {
      id: 2,
      name: "Virtual-Office",
      value: clientCounts.virtualOfficeClients,
      route: "/app/dashboard/sales-dashboard/mix-bag/clients/virtual-office",
    },
    {
      id: 3,
      name: "Internal Meetings",
      value: clientCounts.meetingClients,
      route: "/app/dashboard/sales-dashboard/mix-bag/clients/internal-meetings",
    },
  ];

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
      virtualOffice: "Virtualoffice",
      meeting: "Meeting",
      workation: "Workations",
      coliving: "Co-Living",
    };

    clientsArray.forEach((client) => {
      let rawServiceName = client.clientType || "Unknown";

      // Dynamically detect type from serviceName if it's under coworkingClients
      if (rawServiceName === "coworking" && client.service?.serviceName) {
        const sName = client.service.serviceName.toLowerCase();
        if (sName.includes("workation")) {
          rawServiceName = "workation";
        } else if (sName.includes("living") || sName.includes("coliving")) {
          rawServiceName = "coliving";
        }
      }

      const formattedServiceName =
        serviceMapping[rawServiceName] || toTitleCase(rawServiceName);

      let date = null;
      if (rawServiceName === "coworking") {
        date = client.startDate ? new Date(client.startDate) : null;
      } else if (rawServiceName === "virtualOffice") {
        date = client.termStartDate
          ? new Date(client.termStartDate)
          : client.rentDate
          ? new Date(client.rentDate)
          : null;
      } else if (rawServiceName === "meeting") {
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

  const transformedData = transformClientsGroupedByMonth(unifiedClients);
  console.log("transformed data ", transformedData);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <UniqueClients
          data={transformedData}
          hideAccordion
          additionalData={`CLIENTS : ${unifiedClients.length}`}
        />
      </div>
      <WidgetSection
        layout={verticalsData.length <= 3 ? verticalsData.length : 3}
      >
        {verticalsData.map((item) => (
          <DataCard
            key={item.id}
            data={item.value}
            title={item.name}
            route={item.route}
          />
        ))}
      </WidgetSection>
    </div>
  );
};

export default ViewClients;
