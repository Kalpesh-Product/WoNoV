import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const ViewClients = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const dispatch = useDispatch();
  const clientsData = useSelector((state) => state.sales.clientsData);

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
    navigate(
      `/app/dashboard/sales-dashboard/clients/view-clients/${clientData.clientName}`
    );
  };

  const viewEmployeeColumns = [
    { field: "id", headerName: "ID" },
    {
      field: "clientName",
      headerName: "Client Name",
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
    { field: "hoPocEmail", headerName: "Email", flex: 1 },
    { field: "totalMeetingCredits", headerName: "Credits" },
    // {
    //   field: "status",
    //   headerName: "Status",
    //   cellRenderer: (params) => {
    //     const statusColorMap = {
    //       Active: { backgroundColor: "#90EE90", color: "#006400" },
    //       Inactive: { backgroundColor: "#D3D3D3", color: "#696969" },
    //     };

    //     const { backgroundColor, color } = statusColorMap[params.value] || {
    //       backgroundColor: "gray",
    //       color: "white",
    //     };
    //     return (
    //       <Chip
    //         label={params.value}
    //         style={{
    //           backgroundColor,
    //           color,
    //         }}
    //       />
    //     );
    //   },
    // },
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
        <UniqueClients data={transformedData} hideAccordion />
      </div>

      <div className="w-full">
        <AgTable
          search={true}
          key={clientsData.length}
          data={[
            ...clientsData.map((item, index) => ({
              id: index + 1,
              _id: item._id,
              company: item.company,
              clientName: item.clientName,
              serviceName: item.service?.serviceName,
              serviceDescription: item.service?.description,
              sector: item.sector,
              hoCity: item.hoCity,
              hoState: item.hoState,
              unitName: item.unit?.unitName,
              unitNo: item.unit?.unitNo,
              buildingName: item.unit?.building?.buildingName,
              buildingAddress: item.unit?.building?.fullAddress,
              cabinDesks: item.cabinDesks,
              openDesks: item.openDesks,
              totalDesks: item.totalDesks,
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
              hoPocEmail: item.hOPoc?.email,
              hoPocPhone: item.hOPoc?.phone,
              isActive: item.isActive,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              occupiedImage: item.occupiedImage?.imageUrl,
            })),
          ]}
          columns={viewEmployeeColumns}
        />
      </div>
    </div>
  );
};

export default ViewClients;
