import React, { useEffect } from "react";
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

  const verticalsData = [
    {
      id: 1,
      name: "Co-Working",
      value: 0,
      route: "/app/dashboard/sales-dashboard/mix-bag/clients/co-working",
    },
    {
      id: 2,
      name: "Virtual-Office",
      value: 0,
      route: "/app/dashboard/sales-dashboard/mix-bag/clients/virtual-office",
    },
    {
      id: 3,
      name: "Workation",
      value: 0,
      route: "/app/dashboard/sales-dashboard/mix-bag/clients/workation",
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

    clientsArray.forEach((client) => {
      const date = client.startDate ? new Date(client.startDate) : null;

      const formattedDate = date ? date.toISOString().split("T")[0] : "N/A";
      const month = date
        ? date.toLocaleString("default", { month: "long" })
        : "Unknown";

      const rawServiceName = client.service?.serviceName || "Unknown";
      const formattedServiceName = toTitleCase(rawServiceName);

      const transformedClient = {
        client: client.clientName || "Unknown",
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

  const transformedData = transformClientsGroupedByMonth(clientsData);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <UniqueClients
          data={transformedData}
          hideAccordion
          additionalData={`CLIENTS : ${clientsData.length}`}
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
