import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AgTable from "../../../components/AgTable";
import { Chip, CircularProgress } from "@mui/material";
import BarGraph from "../../../components/graphs/BarGraph";
import UniqueClients from "./ViewClients/LeadsLayout";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { toast } from "sonner";
import { setSelectedClient } from "../../../redux/slices/clientSlice";
import { useDispatch, useSelector } from "react-redux";
import { setClientData } from "../../../redux/slices/salesSlice";
import WidgetSection from "../../../components/WidgetSection";
import PageFrame from "../../../components/Pages/PageFrame";

const ViewClients = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const dispatch = useDispatch();
  const clientsData = useSelector((state) => state.sales.clientsData);
  const location = useLocation();

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

  const handleClickRow = (clientData) => {
    dispatch(setSelectedClient(clientData));
    const isMixBag = location.pathname.includes("mix-bag");
    const isRevenueBasePath =
      location.pathname.endsWith("/clients") ||
      location.pathname.endsWith("/clients/");

    if (isMixBag && isRevenueBasePath) {
      navigate(
        `/app/dashboard/sales-dashboard/mix-bag/clients/${clientData.clientName}`,
        { replace: true }
      );
    } else if (!isMixBag && isRevenueBasePath) {
      navigate(
        `/app/dashboard/sales-dashboard/clients/${clientData.clientName}`
      );
    }
  };

  const viewEmployeeColumns = [
    { field: "id", headerName: "Sr No" },
    {
      field: "clientName",
      headerName: "Client Name",
      flex: 1,
      cellRenderer: (params) => (
        <span
          style={{
            color: "#1E3D73",
            textDecoration: "underline",
            cursor: "pointer",
          }}
          onClick={() => handleClickRow(params.data)}
        >
          {params.value}
        </span>
      ),
    },
    { field: "desks", headerName: "Desks" },
    { field: "occupancy", headerName: "Occupancy (%)" ,cellRenderer : (params)=>(`${params.value}%`)},
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
  console.log("clients data : ", clientsData);
  console.log("transformed data : ", transformedData);
  const sortedClients = [...clientsData].sort((a, b) => {
  const desksA = Number(a.openDesks || 0) + Number(a.cabinDesks || 0);
  const desksB = Number(b.openDesks || 0) + Number(b.cabinDesks || 0);
  return desksB - desksA; // Descending
});
  const tableData = sortedClients.map((item, index) => ({
    id: index + 1,
    _id: item._id,
    company: item.company,
    clientName: item.clientName,
    serviceName: item.service?.serviceName,
    serviceDescription: item.service?.description,
    sector: item.sector,
    hoCity: item.hoCity,
    bookingType: item.bookingType,
    hoState: item.hoState,
    unitName: item.unit?.unitName,
    unitNo: item.unit?.unitNo,
    buildingName: item.unit?.building?.buildingName,
    buildingAddress: item.unit?.building?.fullAddress,
    cabinDesks: item.cabinDesks || 0,
    openDesks: item.openDesks,
    totalDesks: item.totalDesks,
    desks: Number(item.openDesks || 0) + Number(item.cabinDesks),
    occupancy: (
      ((Number(item.openDesks || 0) + Number(item.cabinDesks)) / 589) *
      100
    ).toFixed(1),
    ratePerOpenDesk: item.ratePerOpenDesk,
    ratePerCabinDesk: item.ratePerCabinDesk,
    annualIncrement: item.annualIncrement,
    perDeskMeetingCredits: item.perDeskMeetingCredits,
    totalMeetingCredits: item.totalMeetingCredits,
    startDate: item.startDate,
    endDate: item.endDate,
    lockinPeriod: item.lockinPeriod,
    rentDate: item.rentDate,
    nextIncrement: item.nextIncrement,
    localPocName: item.localPoc?.name,
    localPocEmail: item.localPoc?.email,
    localPocPhone: item.localPoc?.phone,
    hoPocName: item.hOPoc?.name,
    hoPocEmail: item.hOPoc?.email || "client@gmail.com",
    hoPocPhone: item.hOPoc?.phone,
    isActive: item.isActive,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    occupiedImage: item.occupiedImage?.imageUrl,
    members: item.members || [],
  }));

    console.log("table data : ", tableData);



  return (
    <div className="flex flex-col gap-4">
      <div>
        <UniqueClients
          data={transformedData}
          hideAccordion
          additionalData={`CLIENTS : ${clientsData.length}`}
        />
      </div>

      <div className="w-full px-4">
        <PageFrame>
          <AgTable
            search={true}
            tableTitle={"CLIENT DETAILS"}
            buttonTitle={"Add Client"}
            handleClick={() => navigate("client-onboarding")}
            data={tableData}
            columns={viewEmployeeColumns}
          />
        </PageFrame>
      </div>
    </div>
  );
};

export default ViewClients;
