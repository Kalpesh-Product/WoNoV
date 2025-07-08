import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { setSelectedClient } from "../../../../redux/slices/clientSlice";
import { useDispatch, useSelector } from "react-redux";
import { setClientData } from "../../../../redux/slices/salesSlice";
import PageFrame from "../../../../components/Pages/PageFrame";
import { useQuery } from "@tanstack/react-query";

const AdminClientsData = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const dispatch = useDispatch();
  const { data: clientsData = [], isPending: isClientsDataPending } = useQuery({
    queryKey: ["clientsData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/sales/co-working-clients");
        const data = response.data.filter((item) => item.isActive);
        dispatch(setClientData(data));
        return data;
      } catch (error) {
        console.error("Error fetching clients data:", error);
      }
    },
  });
  const handleClickRow = (clientData) => {
   
    dispatch(setSelectedClient(clientData));
    navigate(
      `/app/dashboard/admin-dashboard/mix-bag/client-members/client-members-data/${encodeURIComponent(clientData.clientName)}`
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
    { field: "localPocEmail", headerName: "Email", flex: 1 },
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

  const transformedData = transformClientsGroupedByMonth(
    isClientsDataPending ? [] : clientsData
  );

  return (
    <div className="flex flex-col gap-4">
      <PageFrame>
        <div className="w-full">
          <AgTable
            search={true}
            tableTitle={"Client Memebers Data"}
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
                members: item.members,
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
      </PageFrame>
    </div>
  );
};

export default AdminClientsData;
