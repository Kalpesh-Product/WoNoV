import { useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { setSelectedClient } from "../../../../redux/slices/clientSlice";
import { useDispatch } from "react-redux";
import { setClientData } from "../../../../redux/slices/salesSlice";
import PageFrame from "../../../../components/Pages/PageFrame";
import { useQuery } from "@tanstack/react-query";
import { Chip } from "@mui/material";
import { useMemo } from "react";
import StatusChip from "../../../../components/StatusChip";

const AdminClientsData = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const dispatch = useDispatch();
  const { data: clientsData = [], isPending: isClientsDataPending } = useQuery({
    queryKey: ["clientsData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/sales/co-working-clients");
        const data = response.data;
        dispatch(setClientData(data));
        return data;
      } catch (error) {
        console.error("Error fetching clients data:", error);
      }
    },
  });

  const formatDateValue = (value) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toISOString().split("T")[0];
  };

  const handleClickRow = (clientData) => {
    dispatch(setSelectedClient(clientData));
    navigate(
      `/app/dashboard/admin-dashboard/mix-bag/client-members/client-members-data/${encodeURIComponent(
        clientData.clientName,
      )}`,
    );
  };

  const hiddenClientDetailColumns = [
    { field: "serviceName", headerName: "Service Name", hide: true },
    { field: "serviceDescription", headerName: "Service Description", hide: true },
    { field: "sector", headerName: "Sector", hide: true },
    { field: "hoCity", headerName: "HO City", hide: true },
    { field: "hoState", headerName: "HO State", hide: true },
    { field: "bookingType", headerName: "Booking Type", hide: true },
    { field: "unitName", headerName: "Unit Name", hide: true },
    { field: "unitNo", headerName: "Unit No", hide: true },
    { field: "buildingName", headerName: "Building Name", hide: true },
    { field: "buildingAddress", headerName: "Building Address", hide: true },
    { field: "cabinDesks", headerName: "Cabin Desks", hide: true },
    { field: "openDesks", headerName: "Open Desks", hide: true },
    { field: "totalDesks", headerName: "Total Desks", hide: true },
    { field: "ratePerOpenDesk", headerName: "Rate Per Open Desk", hide: true },
    { field: "ratePerCabinDesk", headerName: "Rate Per Cabin Desk", hide: true },
    { field: "annualIncrement", headerName: "Annual Increment", hide: true },
    {
      field: "perDeskMeetingCredits",
      headerName: "Per Desk Meeting Credits",
      hide: true,
    },
    {
      field: "meetingCreditBalance",
      headerName: "Meeting Credit Balance",
      hide: true,
    },
    { field: "startDate", headerName: "Start Date", hide: true },
    { field: "endDate", headerName: "End Date", hide: true },
    { field: "lockinPeriod", headerName: "Lock-in Period", hide: true },
    { field: "rentDate", headerName: "Rent Date", hide: true },
    { field: "nextIncrement", headerName: "Next Increment", hide: true },
    { field: "localPocName", headerName: "Local POC Name", hide: true },
    { field: "localPocPhone", headerName: "Local POC Phone", hide: true },
    { field: "hoPocName", headerName: "HO POC Name", hide: true },
    { field: "hoPocEmail", headerName: "HO POC Email", hide: true },
    { field: "hoPocPhone", headerName: "HO POC Phone", hide: true },
    // { field: "createdAt", headerName: "Created At", hide: true },
    // { field: "updatedAt", headerName: "Updated At", hide: true },
  ];

  const viewEmployeeColumns = [
    { field: "id", headerName: "ID" ,width:300},
    {
      field: "clientName",
      headerName: "Client Name",
      flex:1,
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
    { field: "memberCount", headerName: "Member Count" ,flex: 1 },
    { field: "totalMeetingCredits", headerName: "Credits",flex: 1  },
    {
      field: "status",
      headerName: "Status",
      flex: 1 ,
      sort: "desc",
      cellRenderer: (params) => {
        const status = params.value ? "Active" : "Inactive";
        const statusColorMap = {
          Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" },
          Active: { backgroundColor: "#90EE90", color: "#006400" },
        };

        const { backgroundColor, color } = statusColorMap[status];

        return (
          <Chip
            label={status}
            style={{
              backgroundColor,
              color,
            }}
          />
        );
      },
    },

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
    isClientsDataPending ? [] : clientsData,
  );

  const clientStats = useMemo(() => {
    const total = Array.isArray(clientsData) ? clientsData.length : 0;
    const active = Array.isArray(clientsData)
      ? clientsData.filter((client) => {
          if (typeof client?.isActive === "boolean") return client.isActive;
          return client?.status === "Active";
        }).length
      : 0;
    const inactive = total - active;

    return { total, active, inactive };
  }, [clientsData]);

  return (
    <div className="flex flex-col gap-4">
      <PageFrame>
        <div className="w-full">
          <AgTable
            search={true}
            tableTitle={"Client Members Data"}
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
                bookingType: item.bookingType,
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
                memberCount: item.members?.length || 0,
                annualIncrement: item.annualIncrement,
                perDeskMeetingCredits: item.perDeskMeetingCredits,
                totalMeetingCredits: item.totalMeetingCredits,
                meetingCreditBalance: item.meetingCreditBalance,
                startDate: formatDateValue(item.startDate),
                endDate: formatDateValue(item.endDate),
                lockinPeriod: item.lockinPeriod,
                rentDate: formatDateValue(item.rentDate),
                nextIncrement: formatDateValue(item.nextIncrement),
                localPocName: item.localPoc?.name,
                localPocEmail: item.localPoc?.email,
                localPocPhone: item.localPoc?.phone,
                hoPocName: item.hOPoc?.name,
                hoPocEmail: item.hOPoc?.email,
                hoPocPhone: item.hOPoc?.phone,
                status: item.isActive,
                isActive: item.isActive,
                createdAt: formatDateValue(item.createdAt),
                updatedAt: formatDateValue(item.updatedAt),
                occupiedImage: item.occupiedImage?.imageUrl,
              })),
            ]}
            columns={[...viewEmployeeColumns, ...hiddenClientDetailColumns]}
            headerActions={
              <div className="flex items-center gap-2 flex-wrap">
                <StatusChip status="Total" count={clientStats.total} variant="count" />
                <StatusChip status="Active" count={clientStats.active} variant="count" />
                <StatusChip status="Inactive" count={clientStats.inactive} variant="count" />
              </div>
            }
            exportData
          />
        </div>
      </PageFrame>
    </div>
  );
};

export default AdminClientsData;
